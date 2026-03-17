import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  setDark: (dark: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  setDark: (dark) => set({ isDark: dark }),
}))
