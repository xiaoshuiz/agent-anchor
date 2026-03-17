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
  mentions?: string | null
}

export interface ElectronAPI {
  channels: {
    list: () => Promise<Channel[]>
    get: (id: string) => Promise<Channel | null>
    getThreadCount: (channelId: string) => Promise<number>
  }
  agents: {
    list: () => Promise<Agent[]>
    get: (id: string) => Promise<Agent | null>
    onInvalidated?: (callback: () => void) => void
  }
  messages: {
    list: (channelId: string) => Promise<Message[]>
    listByThread: (channelId: string, rootMessageId: string) => Promise<Message[]>
    get: (id: string) => Promise<Message | null>
    send: (channelId: string, content: string, threadTs?: string | null, mentions?: string[]) => Promise<Message | { error: string }>
    onInvalidated?: (callback: () => void) => void
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
