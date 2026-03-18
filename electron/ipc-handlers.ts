import { ipcMain } from 'electron'
import Store from 'electron-store'
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

const uiStore = new Store<{ sidebarCollapsed?: boolean }>({ name: 'ui' })

let currentChannelId: string | null = null

export function getCurrentChannelId(): string | null {
  return currentChannelId
}

export function setCurrentChannelId(id: string | null): void {
  currentChannelId = id
}

let unreadInvalidateSender: (() => void) | null = null
let agentsInvalidateSender: (() => void) | null = null

export function registerUnreadInvalidateSender(sender: () => void): void {
  unreadInvalidateSender = sender
}

export function registerAgentsInvalidateSender(sender: () => void): void {
  agentsInvalidateSender = sender
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
    return database.prepare('SELECT * FROM agents WHERE id = ?').get(id) ?? null
  })

  ipcMain.handle(
    'agents:create',
    async (
      _,
      params: { id: string; name: string; description?: string | null; capabilities?: string[] | string | null }
    ): Promise<{ id: string } | { error: string }> => {
      const database = getDb()
      if (!database) return { error: 'Database not initialized' }
      const id = (params.id ?? '').trim()
      const name = (params.name ?? '').trim()
      if (!id || !name) return { error: 'id and name are required' }
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) return { error: 'id must be alphanumeric, underscore or hyphen only' }
      try {
        const agent = insertAgent(database, {
          id,
          name,
          description: params.description?.trim() || null,
          capabilities: params.capabilities ?? null,
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
        if (ch.type === 'dm' && ch.dm_agent_id) {
          pushDmToAgent(ch.dm_agent_id, {
            messageId: msg.id,
            channelId,
            channelName: channel.name,
            fromType: 'user',
            fromId: 'user',
            content: trimmed,
            timestamp: msg.timestamp,
          })
        }
        const mentionIds = mentions && mentions.length > 0 ? mentions : []
        if (mentionIds.length > 0) {
          pushMentionToAgents({
            messageId: msg.id,
            channelId,
            channelName: channel.name,
            fromType: 'user',
            fromId: 'user',
            content: trimmed,
            mentions: mentionIds,
            threadTs: msg.thread_ts,
            timestamp: msg.timestamp,
          })
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
    const status: Record<string, 'online' | 'offline'> = {}
    for (const a of agents) {
      status[a.id] = online.has(a.id) ? 'online' : 'offline'
    }
    return status
  })
}

export function initDbAndHandlers(): void {
  const database = initDb()
  seedGeneralIfEmpty(database)
  registerIpcHandlers()
}
