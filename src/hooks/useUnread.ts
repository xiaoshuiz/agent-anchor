import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'

export function useUnread(): Record<string, number> {
  const [unread, setUnread] = useState<Record<string, number>>({})
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)

  const fetchUnread = () => {
    window.electronAPI?.unread?.get?.().then(setUnread).catch(() => setUnread({}))
  }

  useEffect(() => {
    fetchUnread()
    window.electronAPI?.unread?.onInvalidated?.(fetchUnread)
    return () => {
      // IPC listeners are cleaned up by Electron when context is destroyed
    }
  }, [])

  useEffect(() => {
    if (selectedChannelId) {
      window.electronAPI?.app?.setCurrentChannel?.(selectedChannelId)
      window.electronAPI?.unread?.markRead?.(selectedChannelId)
    } else {
      window.electronAPI?.app?.setCurrentChannel?.(null)
    }
  }, [selectedChannelId])

  return unread
}
