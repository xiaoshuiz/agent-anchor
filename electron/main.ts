import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { initDbAndHandlers } from './ipc-handlers'
import { startWebSocketServer } from './websocket-server'

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

app.whenReady().then(() => {
  initDbAndHandlers()
  startWebSocketServer(8765, { onNewMessage: notifyRendererRefresh, onAgentRegistered: notifyAgentsRefresh })
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
