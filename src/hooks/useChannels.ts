import { useEffect, useState } from 'react'
import type { Channel } from '@/types/electron'
import { useUIStore } from '@/stores/uiStore'

export function useChannels(): { channels: Channel[]; loading: boolean; error: Error | null } {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const channelsRefreshTrigger = useUIStore((s) => s.channelsRefreshTrigger)

  useEffect(() => {
    const api = window.electronAPI
    if (!api?.channels?.list) {
      setLoading(false)
      return
    }
    api.channels
      .list()
      .then(setChannels)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [channelsRefreshTrigger])

  return { channels, loading, error }
}
