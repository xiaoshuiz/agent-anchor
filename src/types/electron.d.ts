export interface Channel {
  id: string
  name: string
  description?: string
  created_at: number
}

export interface Agent {
  id: string
  name: string
  description?: string
  avatar?: string
  capabilities?: string[]
  created_at: number
}

export interface Message {
  id: string
  channel_id: string
  from_type: 'user' | 'agent'
  from_id: string
  content: string
  timestamp: number
  thread_ts?: string
}

export interface SearchResult {
  message: Message
  channelName: string
  fromName: string
}

export interface ElectronAPI {
  app?: {
    setCurrentChannel: (channelId: string | null) => Promise<void>
  }
  channels: {
    list: () => Promise<Channel[]>
    get: (id: string) => Promise<Channel | null>
  }
  agents: {
    list: () => Promise<Agent[]>
    get: (id: string) => Promise<Agent | null>
    getStatus?: () => Promise<Record<string, 'online' | 'offline'>>
    onInvalidated?: (callback: () => void) => void
    onStatusChanged?: (callback: () => void) => void
  }
  messages: {
    list: (channelId: string) => Promise<Message[]>
    send: (channelId: string, content: string, threadTs?: string | null) => Promise<Message | { error: string }>
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
