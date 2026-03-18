import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  channels: {
    list: () => ipcRenderer.invoke('channels:list'),
    get: (id: string) => ipcRenderer.invoke('channels:get', id),
    getThreadCount: (channelId: string) => ipcRenderer.invoke('channels:getThreadCount', channelId),
  },
  messages: {
    list: (channelId: string) => ipcRenderer.invoke('messages:list', channelId),
    listByThread: (channelId: string, rootMessageId: string) =>
      ipcRenderer.invoke('messages:listByThread', channelId, rootMessageId),
    get: (id: string) => ipcRenderer.invoke('messages:get', id),
    send: (channelId: string, content: string, threadTs?: string | null, mentions?: string[]) =>
      ipcRenderer.invoke('messages:send', channelId, content, threadTs, mentions),
    onInvalidated: (callback: () => void) => {
      ipcRenderer.on('messages:invalidated', callback)
    },
  },
  agents: {
    list: () => ipcRenderer.invoke('agents:list'),
    get: (id: string) => ipcRenderer.invoke('agents:get', id),
    onInvalidated: (callback: () => void) => {
      ipcRenderer.on('agents:invalidated', callback)
    },
  },
  sidebar: {
    getCollapsed: () => ipcRenderer.invoke('sidebar:getCollapsed'),
    setCollapsed: (collapsed: boolean) => ipcRenderer.invoke('sidebar:setCollapsed', collapsed),
  },
})
