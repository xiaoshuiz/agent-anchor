import { ipcMain, app } from 'electron'
import Store from 'electron-store'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import {
  initDb,
  seedGeneralIfEmpty,
  channelsList,
  agentsList,
  messagesListByChannel,
  messagesListByThread,
  insertMessage,
  insertAgent,
  insertChannel,
  insertChannelMembers,
  getChannelById,
  getAgentById,
  getOrCreateDm,
  getThreadCountByChannel,
  getMessageById,
  getMessagesMentioningUser,
  getDb,
  getUnreadCounts,
  markChannelRead,
  incrementUnread,
  searchMessages,
} from './db'
import { pushMentionToAgents, pushDmToAgent, getOnlineAgentIds } from './websocket-server'
import { respondWithClaude } from './claude-responder'

const uiStore = new Store<{ sidebarCollapsed?: boolean }>({ name: 'ui' })

const AGENT_KEYS_FILE = 'agent-keys.json'

function getAgentKeysPath(): string {
  return join(app.getPath('userData'), AGENT_KEYS_FILE)
}

function loadAgentKeys(): Record<string, string> {
  const path = getAgentKeysPath()
  if (!existsSync(path)) return {}
  try {
    const raw = readFileSync(path, 'utf-8')
    const data = JSON.parse(raw) as unknown
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const out: Record<string, string> = {}
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'string') out[k] = v
      }
      return out
    }
  } catch {
    // ignore parse errors, return empty
  }
  return {}
}

function saveAgentKeys(data: Record<string, string>): void {
  const path = getAgentKeysPath()
  const dir = dirname(path)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 0), 'utf-8')
}

function getAgentKeysStore(): { get: (id: string) => string | undefined; set: (id: string, value: string) => void; delete: (id: string) => void } {
  return {
    get(id: string): string | undefined {
      return loadAgentKeys()[id]
    },
    set(id: string, value: string): void {
      const data = loadAgentKeys()
      data[id] = value
      saveAgentKeys(data)
    },
    delete(id: string): void {
      const data = loadAgentKeys()
      delete data[id]
      saveAgentKeys(data)
    },
  }
}

let currentChannelId: string | null = null

export function getCurrentChannelId(): string | null {
  return currentChannelId
}

export function setCurrentChannelId(id: string | null): void {
  currentChannelId = id
}

let unreadInvalidateSender: (() => void) | null = null
let agentsInvalidateSender: (() => void) | null = null
let messagesInvalidateSender: (() => void) | null = null

export function registerUnreadInvalidateSender(sender: () => void): void {
  unreadInvalidateSender = sender
}

export function registerAgentsInvalidateSender(sender: () => void): void {
  agentsInvalidateSender = sender
}

export function registerMessagesInvalidateSender(sender: () => void): void {
  messagesInvalidateSender = sender
}

export function getAgentApiKey(agentId: string): string | undefined {
  return getAgentKeysStore().get(agentId)
}

export function handleNewMessageFromAgent(channelId: string): void {
  if (channelId === currentChannelId) return
  const database = getDb()
  if (!database) return
  incrementUnread(database, channelId)
  unreadInvalidateSender?.()
}

export function registerIpcHandlers(): void {
  ipcMain.handle('channels:list', async () => {
    const database = getDb()
    if (!database) return []
    return channelsList(database)
  })

  ipcMain.handle('channels:get', async (_, id: string) => {
    const database = getDb()
    if (!database) return null
    return database.prepare('SELECT * FROM channels WHERE id = ?').get(id) ?? null
  })

  ipcMain.handle(
    'channels:create',
    async (
      _,
      params: { name: string; description?: string | null; agentIds?: string[] }
    ): Promise<{ id: string; name: string } | { error: string }> => {
      const database = getDb()
      if (!database) return { error: 'Database not initialized' }
      let name = (params.name ?? '').trim()
      if (!name) return { error: 'Channel name is required' }
      if (!name.startsWith('#')) name = `#${name}`
      try {
        const channel = insertChannel(database, {
          name,
          description: params.description?.trim() || null,
        })
        const agentIds = params.agentIds ?? []
        if (agentIds.length > 0) {
          insertChannelMembers(database, channel.id, agentIds)
        }
        return { id: channel.id, name: channel.name }
      } catch (e) {
        return { error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'channels:addMembers',
    async (_, channelId: string, agentIds: string[]): Promise<void | { error: string }> => {
      const database = getDb()
      if (!database) return { error: 'Database not initialized' }
      const channel = getChannelById(database, channelId)
      if (!channel) return { error: 'Channel not found' }
      try {
        insertChannelMembers(database, channelId, agentIds)
      } catch (e) {
        return { error: String(e) }
      }
    }
  )

  ipcMain.handle('channels:getOrCreateDm', async (_, agentId: string) => {
    const database = getDb()
    if (!database) return null
    return getOrCreateDm(database, agentId)
  })

  ipcMain.handle('messages:listMentions', async () => {
    const database = getDb()
    if (!database) return []
    return getMessagesMentioningUser(database)
  })

  ipcMain.handle('agents:list', async () => {
    const database = getDb()
    if (!database) return []
    return agentsList(database)
  })

  ipcMain.handle('agents:get', async (_, id: string) => {
    const database = getDb()
    if (!database) return null
    const row = database.prepare('SELECT * FROM agents WHERE id = ?').get(id) as { provider?: string } | undefined
    if (!row) return null
    return { ...row, provider: row.provider === 'claude' ? 'claude' : 'websocket' }
  })

  ipcMain.handle('agents:setApiKey', async (_, agentId: string, apiKey: string) => {
    const store = getAgentKeysStore()
    const trimmed = apiKey?.trim?.()
    if (!trimmed) {
      store.delete(agentId)
      return
    }
    store.set(agentId, trimmed)
  })

  ipcMain.handle('agents:hasApiKey', async (_, agentId: string) => {
    const store = getAgentKeysStore()
    return !!store.get(agentId)
  })

  ipcMain.handle(
    'agents:create',
    async (
      _,
      params: {
        id?: string
        name: string
        description?: string | null
        capabilities?: string[] | string | null
        provider?: 'claude' | 'websocket'
      }
    ): Promise<{ id: string } | { error: string }> => {
      const database = getDb()
      if (!database) return { error: 'Database not initialized' }
      const name = (params.name ?? '').trim()
      if (!name) return { error: 'name is required' }
      const provider = params.provider ?? 'websocket'
      if (provider === 'claude' && !getAgentKeysStore().get('claude')) {
        return { error: 'Configure Claude API key in Settings first' }
      }
      if (provider === 'websocket') {
        const id = (params.id ?? '').trim()
        if (!id) return { error: 'id is required for custom agents' }
        if (!/^[a-zA-Z0-9_-]+$/.test(id)) return { error: 'id must be alphanumeric, underscore or hyphen only' }
      }
      try {
        const agent = insertAgent(database, {
          id: params.id?.trim() || undefined,
          name,
          description: params.description?.trim() || null,
          capabilities: params.capabilities ?? null,
          provider,
        })
        agentsInvalidateSender?.()
        return { id: agent.id }
      } catch (e) {
        return { error: String(e) }
      }
    }
  )

  ipcMain.handle('messages:list', async (_, channelId: string) => {
    const database = getDb()
    if (!database) return []
    return messagesListByChannel(database, channelId)
  })

  ipcMain.handle('messages:listByThread', async (_, channelId: string, rootMessageId: string) => {
    const database = getDb()
    if (!database) return []
    return messagesListByThread(database, channelId, rootMessageId)
  })

  ipcMain.handle('messages:get', async (_, id: string) => {
    const database = getDb()
    if (!database) return null
    return getMessageById(database, id)
  })

  ipcMain.handle(
    'messages:send',
    async (
      _,
      channelId: string,
      content: string,
      threadTs?: string | null,
      mentions?: string[]
    ): Promise<
      | { id: string; channel_id: string; from_type: string; from_id: string; content: string; timestamp: number; thread_ts: string | null; mentions: string | null }
      | { error: string }
    > => {
      const database = getDb()
      if (!database) return { error: 'Database not initialized' }
      const trimmed = content?.trim?.() ?? ''
      if (!trimmed) return { error: 'Content cannot be empty' }
      const channel = getChannelById(database, channelId)
      if (!channel) return { error: 'Channel not found' }
      try {
        const msg = insertMessage(database, {
          channelId,
          fromType: 'user',
          fromId: 'user',
          content: trimmed,
          threadTs: threadTs ?? null,
          mentions: mentions ?? null,
        })
        const ch = channel as { type?: string; dm_agent_id?: string }
        const dmAgentId = ch.type === 'dm' ? ch.dm_agent_id : null
        const mentionIds = mentions && mentions.length > 0 ? mentions : []
        const claudeApiKey = getAgentKeysStore().get('claude')

        const claudeAgents: Array<{ id: string; name: string; description: string | null }> = []
        if (dmAgentId) {
          const agent = getAgentById(database, dmAgentId)
          if (agent?.provider === 'claude') claudeAgents.push({ id: agent.id, name: agent.name, description: agent.description })
        }
        for (const mid of mentionIds) {
          if (!claudeAgents.some((a) => a.id === mid)) {
            const agent = getAgentById(database, mid)
            if (agent?.provider === 'claude') claudeAgents.push({ id: agent.id, name: agent.name, description: agent.description })
          }
        }

        const websocketAgentIds = new Set<string>()
        if (dmAgentId && !claudeAgents.some((a) => a.id === dmAgentId)) websocketAgentIds.add(dmAgentId)
        for (const mid of mentionIds) {
          if (!claudeAgents.some((a) => a.id === mid)) websocketAgentIds.add(mid)
        }

        for (const agent of claudeAgents) {
          if (!claudeApiKey) continue
          respondWithClaude(claudeApiKey, trimmed, {
            channelName: channel.name,
            isDm: ch.type === 'dm' && dmAgentId === agent.id,
            agentName: agent.name,
            agentDescription: agent.description,
          })
            .then((reply) => {
              insertMessage(database, {
                channelId,
                fromType: 'agent',
                fromId: agent.id,
                content: reply,
                threadTs: threadTs ?? null,
                mentions: null,
              })
              messagesInvalidateSender?.()
              unreadInvalidateSender?.()
            })
            .catch((e) => {
              console.error('[Claude]', e)
              insertMessage(database, {
                channelId,
                fromType: 'agent',
                fromId: agent.id,
                content: `Error: ${(e as Error).message}`,
                threadTs: threadTs ?? null,
                mentions: null,
              })
              messagesInvalidateSender?.()
            })
        }

        if (websocketAgentIds.size > 0) {
          if (dmAgentId && websocketAgentIds.has(dmAgentId)) {
            pushDmToAgent(dmAgentId, {
              messageId: msg.id,
              channelId,
              channelName: channel.name,
              fromType: 'user',
              fromId: 'user',
              content: trimmed,
              timestamp: msg.timestamp,
            })
          }
          const wsMentions = mentionIds.filter((id) => websocketAgentIds.has(id))
          if (wsMentions.length > 0) {
            pushMentionToAgents({
              messageId: msg.id,
              channelId,
              channelName: channel.name,
              fromType: 'user',
              fromId: 'user',
              content: trimmed,
              mentions: wsMentions,
              threadTs: msg.thread_ts,
              timestamp: msg.timestamp,
            })
          }
        }
        return msg
      } catch (e) {
        return { error: String(e) }
      }
    }
  )

  ipcMain.handle('channels:getThreadCount', async (_, channelId: string) => {
    const database = getDb()
    if (!database) return 0
    return getThreadCountByChannel(database, channelId)
  })

  ipcMain.handle('sidebar:getCollapsed', () => uiStore.get('sidebarCollapsed', false))
  ipcMain.handle('sidebar:setCollapsed', (_, collapsed: boolean) => {
    uiStore.set('sidebarCollapsed', collapsed)
  })

  ipcMain.handle('app:setCurrentChannel', (_, channelId: string | null) => {
    setCurrentChannelId(channelId)
  })

  ipcMain.handle('unread:get', async () => {
    const database = getDb()
    if (!database) return {}
    return getUnreadCounts(database)
  })

  ipcMain.handle('unread:markRead', async (_, channelId: string) => {
    const database = getDb()
    if (!database) return
    markChannelRead(database, channelId)
    unreadInvalidateSender?.()
  })

  ipcMain.handle('search:query', async (_, params: { keyword: string; channelId?: string; fromId?: string }) => {
    const database = getDb()
    if (!database) return []
    return searchMessages(database, params)
  })

  ipcMain.handle('agents:getStatus', async () => {
    const online = getOnlineAgentIds()
    const database = getDb()
    if (!database) return {}
    const agents = agentsList(database)
    const claudeConfigured = !!getAgentKeysStore().get('claude')
    const status: Record<string, 'online' | 'offline'> = {}
    for (const a of agents) {
      if (a.provider === 'claude' && claudeConfigured) {
        status[a.id] = 'online'
      } else {
        status[a.id] = online.has(a.id) ? 'online' : 'offline'
      }
    }
    return status
  })
}

export function initDbAndHandlers(): void {
  const database = initDb()
  seedGeneralIfEmpty(database)
  registerIpcHandlers()
}
