#!/usr/bin/env node
/**
 * Agent Anchor - Node.js SDK 示例
 *
 * 用法：
 *   1. 启动 Agent Anchor 应用 (pnpm run dev)
 *   2. 运行此脚本: node examples/agent-node/index.js
 *
 * 功能：连接 WebSocket、获取频道、注册 Agent、发送一条消息到 #general
 */

import WebSocket from 'ws'

const WS_URL = 'ws://127.0.0.1:8765'
const AGENT_ID = 'agent-demo'
const AGENT_NAME = 'Demo Agent'

function main() {
  const ws = new WebSocket(WS_URL)
  let channelId = null

  ws.on('open', () => {
    console.log('Connected to Agent Anchor')

    // 1. 获取频道列表
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'channels/list',
        params: {},
        id: 0,
      })
    )
  })

  ws.on('message', (data) => {
    const res = JSON.parse(data.toString())
    if (res.error) {
      console.error('Error:', res.error)
      return
    }

    if (res.id === 0) {
      channelId = res.result?.channels?.[0]?.id
      if (!channelId) {
        console.log('No channels found. Start the app first to create #general.')
        ws.close()
        return
      }
      // 2. 注册 Agent
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'agent/register',
          params: { id: AGENT_ID, name: AGENT_NAME, description: 'Node.js SDK 示例' },
          id: 1,
        })
      )
    } else if (res.id === 1) {
      console.log('Agent registered:', res.result)
      // 3. 发送消息
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'message/send',
          params: { agentId: AGENT_ID, channelId, content: 'Hello from Node.js SDK!' },
          id: 2,
        })
      )
    } else if (res.id === 2) {
      console.log('Message sent:', res.result)
      ws.close()
    }
  })

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message)
    console.log('Make sure Agent Anchor app is running (pnpm run dev)')
  })
}

main()
