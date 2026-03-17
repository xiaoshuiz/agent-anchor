import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  channels: {
    list: () => ipcRenderer.invoke('channels:list'),
    get: (id: string) => ipcRenderer.invoke('channels:get', id),
  },
  agents: {
    list: () => ipcRenderer.invoke('agents:list'),
    get: (id: string) => ipcRenderer.invoke('agents:get', id),
  },
  messages: {
    list: (channelId: string) => ipcRenderer.invoke('messages:list', channelId),
  },
  sidebar: {
    getCollapsed: () => ipcRenderer.invoke('sidebar:getCollapsed'),
    setCollapsed: (collapsed: boolean) => ipcRenderer.invoke('sidebar:setCollapsed', collapsed),
  },
})
