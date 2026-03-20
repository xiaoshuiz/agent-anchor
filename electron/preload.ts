import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  app: {
    setCurrentChannel: (channelId: string | null) => ipcRenderer.invoke('app:setCurrentChannel', channelId),
    log: (level: string, tag: string, message: string, data?: unknown) =>
      ipcRenderer.invoke('app:log', level, tag, message, data),
    getLogsPath: () => ipcRenderer.invoke('app:getLogsPath') as Promise<string>,
    readLogs: () => ipcRenderer.invoke('app:readLogs') as Promise<string>,
    openLogsFolder: () => ipcRenderer.invoke('app:openLogsFolder') as Promise<void>,
  },
  channels: {
    list: () => ipcRenderer.invoke('channels:list'),
    get: (id: string) => ipcRenderer.invoke('channels:get', id),
    getThreadCount: (channelId: string) => ipcRenderer.invoke('channels:getThreadCount', channelId),
    create: (params: { name: string; description?: string | null; agentIds?: string[] }) =>
      ipcRenderer.invoke('channels:create', params),
    addMembers: (channelId: string, agentIds: string[]) =>
      ipcRenderer.invoke('channels:addMembers', channelId, agentIds),
    getOrCreateDm: (agentId: string) => ipcRenderer.invoke('channels:getOrCreateDm', agentId),
  },
  messages: {
    list: (channelId: string) => ipcRenderer.invoke('messages:list', channelId),
    listByThread: (channelId: string, rootMessageId: string) =>
      ipcRenderer.invoke('messages:listByThread', channelId, rootMessageId),
    listMentions: () => ipcRenderer.invoke('messages:listMentions'),
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
    create: (params: { id: string; name: string; description?: string | null; capabilities?: string[] | string | null }) =>
      ipcRenderer.invoke('agents:create', params),
    setApiKey: (agentId: string, apiKey: string) =>
      ipcRenderer.invoke('agents:setApiKey', agentId, apiKey),
    hasApiKey: (agentId: string) => ipcRenderer.invoke('agents:hasApiKey', agentId) as Promise<boolean>,
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
