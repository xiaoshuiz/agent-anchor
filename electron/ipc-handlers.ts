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
  getChannelById,
  getThreadCountByChannel,
  getMessageById,
  getDb,
} from './db'
import { pushMentionToAgents } from './websocket-server'

const uiStore = new Store<{ sidebarCollapsed?: boolean }>({ name: 'ui' })

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
}

export function initDbAndHandlers(): void {
  const database = initDb()
  seedGeneralIfEmpty(database)
  registerIpcHandlers()
}
