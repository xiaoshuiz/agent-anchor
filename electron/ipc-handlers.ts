import { ipcMain } from 'electron'
import Store from 'electron-store'
import { initDb, seedGeneralIfEmpty, channelsList, agentsList, messagesListByChannel, getDb } from './db'

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
