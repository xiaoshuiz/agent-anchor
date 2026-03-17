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

export interface ElectronAPI {
  channels: {
    list: () => Promise<Channel[]>
    get: (id: string) => Promise<Channel | null>
  }
  agents: {
    list: () => Promise<Agent[]>
    get: (id: string) => Promise<Agent | null>
  }
  messages: {
    list: (channelId: string) => Promise<Message[]>
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
