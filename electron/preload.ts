import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  app: {
    setCurrentChannel: (channelId: string | null) => ipcRenderer.invoke('app:setCurrentChannel', channelId),
  },
  channels: {
    list: () => ipcRenderer.invoke('channels:list'),
    get: (id: string) => ipcRenderer.invoke('channels:get', id),
  },
  messages: {
    list: (channelId: string) => ipcRenderer.invoke('messages:list', channelId),
    send: (channelId: string, content: string, threadTs?: string | null) =>
      ipcRenderer.invoke('messages:send', channelId, content, threadTs),
    onInvalidated: (callback: () => void) => {
      ipcRenderer.on('messages:invalidated', callback)
    },
  },
  agents: {
    list: () => ipcRenderer.invoke('agents:list'),
    get: (id: string) => ipcRenderer.invoke('agents:get', id),
    getStatus: () => ipcRenderer.invoke('agents:getStatus') as Promise<Record<string, 'online' | 'offline'>>,
    onInvalidated: (callback: () => void) => {
      ipcRenderer.on('agents:invalidated', callback)
    },
    onStatusChanged: (callback: () => void) => {
      ipcRenderer.on('agents:statusChanged', callback)
    },
  },
  unread: {
    get: () => ipcRenderer.invoke('unread:get') as Promise<Record<string, number>>,
    markRead: (channelId: string) => ipcRenderer.invoke('unread:markRead', channelId),
    onInvalidated: (callback: () => void) => {
      ipcRenderer.on('unread:invalidated', callback)
    },
  },
  search: {
    query: (params: { keyword: string; channelId?: string; fromId?: string }) =>
      ipcRenderer.invoke('search:query', params),
  },
  sidebar: {
    getCollapsed: () => ipcRenderer.invoke('sidebar:getCollapsed'),
    setCollapsed: (collapsed: boolean) => ipcRenderer.invoke('sidebar:setCollapsed', collapsed),
  },
})
