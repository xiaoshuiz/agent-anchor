import { create } from 'zustand'

interface UIState {
  selectedChannelId: string | null
  selectedThreadRootId: string | null
  mentionFilterAgentId: string | null
  sidebarCollapsed: boolean
  messagesRefreshTrigger: number
  agentsRefreshTrigger: number
  setSelectedChannel: (id: string | null) => void
  setSelectedThreadRoot: (id: string | null) => void
  setMentionFilter: (agentId: string | null) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  refreshMessages: () => void
  refreshAgents: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  selectedChannelId: null,
  selectedThreadRootId: null,
  mentionFilterAgentId: null,
  sidebarCollapsed: false,
  messagesRefreshTrigger: 0,
  agentsRefreshTrigger: 0,
  setSelectedChannel: (id) =>
    set({ selectedChannelId: id, selectedThreadRootId: null, mentionFilterAgentId: null }),
  setSelectedThreadRoot: (id) => set({ selectedThreadRootId: id }),
  setMentionFilter: (agentId) => set({ mentionFilterAgentId: agentId }),
  refreshMessages: () => set((s) => ({ messagesRefreshTrigger: s.messagesRefreshTrigger + 1 })),
  refreshAgents: () => set((s) => ({ agentsRefreshTrigger: s.agentsRefreshTrigger + 1 })),
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed })
    window.electronAPI?.sidebar?.setCollapsed?.(collapsed)
  },
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed
    set({ sidebarCollapsed: next })
    window.electronAPI?.sidebar?.setCollapsed?.(next)
  },
}))
