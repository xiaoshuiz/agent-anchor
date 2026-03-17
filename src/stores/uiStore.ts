import { create } from 'zustand'

interface UIState {
  selectedChannelId: string | null
  sidebarCollapsed: boolean
  messagesRefreshTrigger: number
  agentsRefreshTrigger: number
  setSelectedChannel: (id: string | null) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  refreshMessages: () => void
  refreshAgents: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  selectedChannelId: null,
  sidebarCollapsed: false,
  messagesRefreshTrigger: 0,
  agentsRefreshTrigger: 0,
  setSelectedChannel: (id) => set({ selectedChannelId: id }),
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
