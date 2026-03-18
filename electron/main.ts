import { app, BrowserWindow, Notification } from 'electron'
import { join } from 'path'
import { initDbAndHandlers, handleNewMessageFromAgent, registerUnreadInvalidateSender, registerAgentsInvalidateSender, getCurrentChannelId } from './ipc-handlers'
import { startWebSocketServer } from './websocket-server'
import { startMcpServer } from './mcp-server'
import { getDb } from './db'
import { getChannelById } from './db'

function getIconPath(): string {
  const base = app.isPackaged ? join(app.getAppPath(), '..') : process.cwd()
  return join(base, 'build/icon.png')
}

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const preloadPath = join(__dirname, '../preload/preload.mjs')
  const iconPath = getIconPath()
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  mainWindow.on('closed', () => { mainWindow = null })
}

function notifyRendererRefresh(): void {
  mainWindow?.webContents?.send('messages:invalidated')
}

function notifyAgentsRefresh(): void {
  mainWindow?.webContents?.send('agents:invalidated')
}

function notifyUnreadRefresh(): void {
  mainWindow?.webContents?.send('unread:invalidated')
}

function notifyAgentStatusRefresh(): void {
  mainWindow?.webContents?.send('agents:statusChanged')
}

function onNewMessage(channelId: string, mentions?: string[]): void {
  notifyRendererRefresh()
  handleNewMessageFromAgent(channelId)
  const isMentioned = mentions?.includes('user') ?? false
  const shouldNotify =
    mainWindow &&
    (!mainWindow.isFocused() || isMentioned) &&
    (channelId !== getCurrentChannelId() || isMentioned)
  if (shouldNotify) {
    const db = getDb()
    if (db) {
      const ch = getChannelById(db, channelId)
      const title = ch ? ch.name : 'New message'
      const body = isMentioned ? 'Someone mentioned you' : 'You have a new message'
      new Notification({ title, body }).show()
    }
  }
}

app.whenReady().then(() => {
  initDbAndHandlers()
  registerUnreadInvalidateSender(notifyUnreadRefresh)
  registerAgentsInvalidateSender(notifyAgentsRefresh)
  startWebSocketServer(8765, {
    onNewMessage,
    onAgentRegistered: notifyAgentsRefresh,
    onAgentStatusChanged: notifyAgentStatusRefresh,
  })
  startMcpServer(8766, { onNewMessage: () => notifyRendererRefresh() })
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
