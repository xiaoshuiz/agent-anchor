import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import * as z from 'zod/v4'
import { getDb } from './db'
import { channelsList, agentsList, insertMessage, getChannelById } from './db'

const DEFAULT_MCP_PORT = 8766

function parseJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : undefined)
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function createMcpServer(callbacks?: McpServerCallbacks): McpServer {
  const server = new McpServer(
    { name: 'agent-anchor', version: '0.1.0' },
    { capabilities: { tools: {} } }
  )

  server.registerTool('anchor_list_channels', {
    description: 'List all channels in Agent Anchor',
    inputSchema: {},
  }, async () => {
    const db = getDb()
    if (!db) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'Database not ready' }) }], isError: true }
    }
    const channels = channelsList(db)
    return {
      content: [{ type: 'text', text: JSON.stringify({ channels }, null, 2) }],
    }
  })

  server.registerTool('anchor_list_agents', {
    description: 'List all registered agents in Agent Anchor',
    inputSchema: {},
  }, async () => {
    const db = getDb()
    if (!db) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'Database not ready' }) }], isError: true }
    }
    const agents = agentsList(db)
    return {
      content: [{ type: 'text', text: JSON.stringify({ agents }, null, 2) }],
    }
  })

  server.registerTool('anchor_send_message', {
    description: 'Send a message to a channel as the user',
    inputSchema: {
      channelId: z.string().describe('Channel UUID'),
      content: z.string().describe('Message content'),
    },
  }, async ({ channelId, content }) => {
    const db = getDb()
    if (!db) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'Database not ready' }) }], isError: true }
    }
    const trimmed = content?.trim?.() ?? ''
    if (!trimmed) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'Content cannot be empty' }) }], isError: true }
    }
    const channel = getChannelById(db, channelId)
    if (!channel) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'Channel not found' }) }], isError: true }
    }
    try {
      const msg = insertMessage(db, {
        channelId,
        fromType: 'user',
        fromId: 'user',
        content: trimmed,
        threadTs: null,
      })
      callbacks?.onNewMessage?.()
      return {
        content: [{ type: 'text', text: JSON.stringify(msg, null, 2) }],
      }
    } catch (e) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: String(e) }) }],
        isError: true,
      }
    }
  })

  return server
}

export interface McpServerCallbacks {
  onNewMessage?: () => void
}

export function startMcpServer(
  port: number = DEFAULT_MCP_PORT,
  callbacks?: McpServerCallbacks
): ReturnType<typeof createServer> {
  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST' || req.url !== '/mcp') {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not found' }))
      return
    }

    let parsedBody: unknown
    try {
      parsedBody = await parseJsonBody(req)
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }))
      return
    }

    const server = createMcpServer(callbacks)
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    await server.connect(transport)

    res.on('close', () => {
      transport.close()
      server.close()
    })

    try {
      await transport.handleRequest(req, res, parsedBody)
    } catch (err) {
      console.error('[Agent Anchor] MCP request error:', err)
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        }))
      }
    }
  })

  httpServer.listen(port, '127.0.0.1', () => {
    console.log(`[Agent Anchor] MCP server listening on http://127.0.0.1:${port}/mcp`)
  })

  return httpServer
}
