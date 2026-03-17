import { WebSocketServer } from 'ws'
import type { WebSocket } from 'ws'
import { getDb } from './db'
import { insertMessage, insertAgent, getChannelById } from './db'

const DEFAULT_PORT = 8765

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

const agentConnections = new Map<string, WebSocket>()

export function getAgentStatusMap(): Record<string, 'online' | 'offline'> {
  const agents = new Set(agentConnections.keys())
  const status: Record<string, 'online' | 'offline'> = {}
  for (const id of agents) {
    status[id] = 'online'
  }
  return status
}

export function getOnlineAgentIds(): Set<string> {
  return new Set(agentConnections.keys())
}

export interface WebSocketServerCallbacks {
  onNewMessage?: (channelId: string) => void
  onAgentRegistered?: () => void
  onAgentStatusChanged?: () => void
}

export function startWebSocketServer(
  port: number = DEFAULT_PORT,
  callbacks?: WebSocketServerCallbacks
): WebSocketServer {
  const { onNewMessage, onAgentRegistered, onAgentStatusChanged } = callbacks ?? {}
  const wss = new WebSocketServer({ port })
  console.log(`[Agent Anchor] WebSocket server listening on ws://127.0.0.1:${port}`)

  wss.on('connection', (ws: WebSocket) => {
    let boundAgentId: string | null = null

    ws.on('close', () => {
      if (boundAgentId) {
        agentConnections.delete(boundAgentId)
        onAgentStatusChanged?.()
      }
    })

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
          const agent = insertAgent(db, {
            id: agentId,
            name,
            description: (params.description as string) ?? null,
            avatar: (params.avatar as string) ?? null,
            capabilities: params.capabilities as string[] | string | null ?? null,
          })
          boundAgentId = agentId
          agentConnections.set(agentId, ws)
          sendResponse(ws, id, { id: agent.id })
          onAgentRegistered?.()
          onAgentStatusChanged?.()
        } catch (e) {
          sendResponse(ws, id, undefined, { code: -32603, message: String(e) })
        }
        return
      }

      if (method === 'message/send') {
        const channelId = params.channelId as string
        const content = (params.content as string)?.trim?.()
        const agentId = params.agentId as string
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
          })
          sendResponse(ws, id, { id: msg.id, timestamp: msg.timestamp })
          onNewMessage?.(channelId)
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
