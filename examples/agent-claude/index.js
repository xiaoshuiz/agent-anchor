#!/usr/bin/env node
/**
 * Claude Bridge - 将 Claude API 作为 Agent 接入 Agent Anchor
 *
 * 用法：
 *   ANTHROPIC_API_KEY=sk-xxx node index.js
 *
 * 前置：在 Agent Anchor 中 Add Agent，id=claude
 */
import WebSocket from 'ws'
import Anthropic from '@anthropic-ai/sdk'

const WS_URL = process.env.AGENT_ANCHOR_WS || 'ws://127.0.0.1:8765'
const AGENT_ID = process.env.CLAUDE_AGENT_ID || 'claude'
const API_KEY = process.env.ANTHROPIC_API_KEY

if (!API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY. Get one at https://console.anthropic.com/')
  process.exit(1)
}

const anthropic = new Anthropic({ apiKey: API_KEY })

async function askClaude(content, system = 'You are a helpful assistant.') {
  const resp = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content }],
  })
  const text = resp.content?.find((c) => c.type === 'text')
  return text?.text ?? '(no response)'
}

function main() {
  const ws = new WebSocket(WS_URL)
  let channelId = null

  ws.on('open', async () => {
    console.log('[Claude Bridge] Connected to Agent Anchor')
    ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'channels/list', params: {}, id: 0 }))
  })

  ws.on('message', async (data) => {
    const res = JSON.parse(data.toString())

    if (res.error) {
      console.error('[Claude Bridge] Error:', res.error)
      return
    }

    if (res.method === 'message/mention') {
      const p = res.params || {}
      const content = p.content || ''
      const channelIdM = p.channelId
      const channelName = p.channelName || ''
      console.log('[Claude Bridge] @mention from', p.fromId, 'in', channelName, ':', content?.slice(0, 80) + '...')
      try {
        const reply = await askClaude(
          content,
          `You are Claude in Agent Anchor. Someone mentioned you in #${channelName}. Reply concisely.`
        )
        ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            method: 'message/send',
            params: { agentId: AGENT_ID, channelId: channelIdM, content: reply, mentions: [] },
            id: Date.now(),
          })
        )
      } catch (e) {
        console.error('[Claude Bridge] Claude API error:', e.message)
      }
      return
    }

    if (res.method === 'message/dm') {
      const p = res.params || {}
      const content = p.content || ''
      const channelIdM = p.channelId
      const channelName = p.channelName || ''
      console.log('[Claude Bridge] DM from', p.fromId, ':', content?.slice(0, 80) + '...')
      try {
        const reply = await askClaude(
          content,
          'You are Claude in Agent Anchor. The user is messaging you in a direct message. Reply concisely.'
        )
        ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            method: 'message/send',
            params: { agentId: AGENT_ID, channelId: channelIdM, content: reply, mentions: [] },
            id: Date.now(),
          })
        )
      } catch (e) {
        console.error('[Claude Bridge] Claude API error:', e.message)
      }
      return
    }

    if (res.id === 0) {
      channelId = res.result?.channels?.[0]?.id
      if (!channelId) {
        console.log('[Claude Bridge] No channels. Start Agent Anchor first.')
        ws.close()
        return
      }
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'agent/register',
          params: {
            id: AGENT_ID,
            name: 'Claude',
            description: 'Claude via Anthropic API bridge',
            capabilities: ['chat', 'code', 'general'],
          },
          id: 1,
        })
      )
    } else if (res.id === 1) {
      console.log('[Claude Bridge] Registered. DM or @Claude to chat.')
    }
  })

  ws.on('error', (err) => {
    console.error('[Claude Bridge] WebSocket error:', err.message)
    console.log('Make sure Agent Anchor is running: pnpm run dev')
  })
}

main()
