import { create } from 'zustand'

interface UIState {
  selectedChannelId: string | null
  selectedActivityView: 'mentions' | null
  selectedThreadRootId: string | null
  mentionFilterAgentId: string | null
  sidebarCollapsed: boolean
  messagesRefreshTrigger: number
  agentsRefreshTrigger: number
  channelsRefreshTrigger: number
  claudeConfigUpdatedTrigger: number
  showCreateAgentModal: boolean
  openAddAgentAfterSettingsClose: boolean
  setSelectedChannel: (id: string | null) => void
  setSelectedActivityView: (view: 'mentions' | null) => void
  setSelectedThreadRoot: (id: string | null) => void
  setMentionFilter: (agentId: string | null) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setShowCreateAgentModal: (show: boolean) => void
  setOpenAddAgentAfterSettingsClose: (v: boolean) => void
  toggleSidebar: () => void
  refreshMessages: () => void
  refreshAgents: () => void
  refreshChannels: () => void
  refreshClaudeConfig: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  selectedChannelId: null,
  selectedActivityView: null,
  selectedThreadRootId: null,
  mentionFilterAgentId: null,
  sidebarCollapsed: false,
  messagesRefreshTrigger: 0,
  agentsRefreshTrigger: 0,
  channelsRefreshTrigger: 0,
  claudeConfigUpdatedTrigger: 0,
  showCreateAgentModal: false,
  openAddAgentAfterSettingsClose: false,
  setSelectedChannel: (id) =>
    set({ selectedChannelId: id, selectedActivityView: null, selectedThreadRootId: null, mentionFilterAgentId: null }),
  setSelectedActivityView: (view) =>
    set({ selectedActivityView: view, selectedChannelId: null, selectedThreadRootId: null }),
  setSelectedThreadRoot: (id) => set({ selectedThreadRootId: id }),
  setMentionFilter: (agentId) => set({ mentionFilterAgentId: agentId }),
  refreshMessages: () => set((s) => ({ messagesRefreshTrigger: s.messagesRefreshTrigger + 1 })),
  refreshAgents: () => set((s) => ({ agentsRefreshTrigger: s.agentsRefreshTrigger + 1 })),
  refreshChannels: () => set((s) => ({ channelsRefreshTrigger: s.channelsRefreshTrigger + 1 })),
  refreshClaudeConfig: () => set((s) => ({ claudeConfigUpdatedTrigger: s.claudeConfigUpdatedTrigger + 1 })),
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed })
    window.electronAPI?.sidebar?.setCollapsed?.(collapsed)
  },
  setShowCreateAgentModal: (show) => set({ showCreateAgentModal: show }),
  setOpenAddAgentAfterSettingsClose: (v) => set({ openAddAgentAfterSettingsClose: v }),
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed
    set({ sidebarCollapsed: next })
    window.electronAPI?.sidebar?.setCollapsed?.(next)
  },
}))
