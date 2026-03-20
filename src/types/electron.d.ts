export interface Channel {
  id: string
  name: string
  description?: string
  created_at: number
  type?: 'channel' | 'dm'
  dm_agent_id?: string | null
}

export interface Agent {
  id: string
  name: string
  description?: string
  avatar?: string
  capabilities?: string[]
  created_at: number
  provider?: 'claude' | 'websocket'
}

export interface Message {
  id: string
  channel_id: string
  from_type: 'user' | 'agent'
  from_id: string
  content: string
  timestamp: number
  thread_ts?: string
  mentions?: string | null
}

export interface SearchResult {
  message: Message
  channelName: string
  fromName: string
}

export interface ElectronAPI {
  app?: {
    setCurrentChannel: (channelId: string | null) => Promise<void>
    log?: (level: string, tag: string, message: string, data?: unknown) => Promise<void>
    getLogsPath?: () => Promise<string>
    readLogs?: () => Promise<string>
    getDiagnostics?: () => Promise<{
      userData: string
      agentKeysPath: string
      agentKeysExists: boolean
      logsPath: string
      logsExists: boolean
      hasClaudeKey: boolean
    }>
    openLogsFolder?: () => Promise<void>
  }
  channels: {
    list: () => Promise<Channel[]>
    get: (id: string) => Promise<Channel | null>
    getThreadCount: (channelId: string) => Promise<number>
    create?: (params: { name: string; description?: string | null; agentIds?: string[] }) => Promise<{ id: string; name: string } | { error: string }>
    addMembers?: (channelId: string, agentIds: string[]) => Promise<void | { error: string }>
    getOrCreateDm?: (agentId: string) => Promise<Channel | null>
  }
  agents: {
    list: () => Promise<Agent[]>
    get: (id: string) => Promise<Agent | null>
    create?: (params: {
      id?: string
      name: string
      description?: string | null
      capabilities?: string[] | string | null
      provider?: 'claude' | 'websocket'
    }) => Promise<{ id: string } | { error: string }>
    setApiKey?: (agentId: string, apiKey: string) => Promise<void>
    hasApiKey?: (agentId: string) => Promise<boolean>
    getStatus?: () => Promise<Record<string, 'online' | 'offline'>>
    onInvalidated?: (callback: () => void) => void
    onStatusChanged?: (callback: () => void) => void
  }
  messages: {
    list: (channelId: string) => Promise<Message[]>
    listByThread: (channelId: string, rootMessageId: string) => Promise<Message[]>
    listMentions?: () => Promise<Message[]>
    get: (id: string) => Promise<Message | null>
    send: (channelId: string, content: string, threadTs?: string | null, mentions?: string[]) => Promise<Message | { error: string }>
    onInvalidated?: (callback: () => void) => void
  }
  unread?: {
    get: () => Promise<Record<string, number>>
    markRead: (channelId: string) => Promise<void>
    onInvalidated?: (callback: () => void) => void
  }
  search?: {
    query: (params: { keyword: string; channelId?: string; fromId?: string }) => Promise<SearchResult[]>
  }
  sidebar?: {
    getCollapsed: () => Promise<boolean>
    setCollapsed: (collapsed: boolean) => Promise<void>
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
