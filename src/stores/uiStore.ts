import { create } from 'zustand'

interface UIState {
  selectedChannelId: string | null
  sidebarCollapsed: boolean
  setSelectedChannel: (id: string | null) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  selectedChannelId: null,
  sidebarCollapsed: false,
  setSelectedChannel: (id) => set({ selectedChannelId: id }),
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
