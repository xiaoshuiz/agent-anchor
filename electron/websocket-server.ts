import { WebSocketServer } from 'ws'
import type { WebSocket } from 'ws'
import { getDb } from './db'
import { insertMessage, insertAgent, getChannelById } from './db'

const DEFAULT_PORT = 8765

const agentSockets = new Map<string, WebSocket>()

export interface MentionMessage {
  messageId: string
  channelId: string
  channelName: string
  fromType: string
  fromId: string
  content: string
  mentions: string[]
  threadTs: string | null
  timestamp: number
}

export function pushMentionToAgents(msg: MentionMessage): void {
  for (const agentId of msg.mentions) {
    const ws = agentSockets.get(agentId)
    if (ws && ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'message/mention',
          params: msg,
        })
      )
    }
  }
}

interface JsonRpcRequest {
  jsonrpc?: string
  method?: string
  params?: Record<string, unknown>
  id?: number | string
}

interface JsonRpcResponse {
  jsonrpc: string
  result?: unknown
  error?: { code: number; message: string }
  id?: number | string
}

function sendResponse(ws: WebSocket, id: number | string | undefined, result?: unknown, error?: { code: number; message: string }) {
  const msg: JsonRpcResponse = { jsonrpc: '2.0', id }
  if (error) msg.error = error
  else msg.result = result
  ws.send(JSON.stringify(msg))
}

export interface WebSocketServerCallbacks {
  onNewMessage?: () => void
  onAgentRegistered?: () => void
}

export function startWebSocketServer(
  port: number = DEFAULT_PORT,
  callbacks?: WebSocketServerCallbacks
): WebSocketServer {
  const { onNewMessage, onAgentRegistered } = callbacks ?? {}
  const wss = new WebSocketServer({ port })
  console.log(`[Agent Anchor] WebSocket server listening on ws://127.0.0.1:${port}`)

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data: Buffer | string) => {
      let req: JsonRpcRequest
      try {
        const raw = typeof data === 'string' ? data : data.toString()
        req = JSON.parse(raw) as JsonRpcRequest
      } catch {
        sendResponse(ws, undefined, undefined, { code: -32700, message: 'Parse error' })
        return
      }

      const { method, params, id } = req
      if (!method || !params) {
        sendResponse(ws, id, undefined, { code: -32600, message: 'Invalid Request' })
        return
      }

      const db = getDb()
      if (!db) {
        sendResponse(ws, id, undefined, { code: -32603, message: 'Internal error: database not ready' })
        return
      }

      if (method === 'channels/list') {
        try {
          const channels = db.prepare('SELECT id, name, description, created_at FROM channels ORDER BY created_at ASC').all()
          sendResponse(ws, id, { channels })
        } catch (e) {
          sendResponse(ws, id, undefined, { code: -32603, message: String(e) })
        }
        return
      }

      if (method === 'agent/register') {
        const agentId = params.id as string
        const name = params.name as string
        if (!agentId || !name) {
          sendResponse(ws, id, undefined, { code: -32602, message: 'Invalid params: id and name required' })
          return
        }
        try {
          agentSockets.set(agentId, ws)
          ws.on('close', () => agentSockets.delete(agentId))
          const agent = insertAgent(db, {
            id: agentId,
            name,
            description: (params.description as string) ?? null,
            avatar: (params.avatar as string) ?? null,
            capabilities: params.capabilities as string[] | string | null ?? null,
          })
          sendResponse(ws, id, { id: agent.id })
          onAgentRegistered?.()
        } catch (e) {
          sendResponse(ws, id, undefined, { code: -32603, message: String(e) })
        }
        return
      }

      if (method === 'message/send') {
        const channelId = params.channelId as string
        const content = (params.content as string)?.trim?.()
        const agentId = params.agentId as string
        const mentions = (params.mentions as string[]) ?? []
        if (!channelId || !content || !agentId) {
          sendResponse(ws, id, undefined, { code: -32602, message: 'Invalid params: agentId, channelId and content required' })
          return
        }
        const channel = getChannelById(db, channelId)
        if (!channel) {
          sendResponse(ws, id, undefined, { code: -32602, message: 'Channel not found' })
          return
        }
        try {
          const msg = insertMessage(db, {
            channelId,
            fromType: 'agent',
            fromId: agentId,
            content,
            threadTs: (params.threadTs as string) ?? null,
            mentions: mentions.length > 0 ? mentions : null,
          })
          sendResponse(ws, id, { id: msg.id, timestamp: msg.timestamp })
          onNewMessage?.()
          if (mentions.length > 0) {
            pushMentionToAgents({
              messageId: msg.id,
              channelId,
              channelName: channel.name,
              fromType: 'agent',
              fromId: agentId,
              content,
              mentions,
              threadTs: msg.thread_ts,
              timestamp: msg.timestamp,
            })
          }
        } catch (e) {
          sendResponse(ws, id, undefined, { code: -32603, message: String(e) })
        }
        return
      }

      sendResponse(ws, id, undefined, { code: -32601, message: `Method not found: ${method}` })
    })
  })

  return wss
}
