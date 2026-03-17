import { useEffect, useState } from 'react'
import type { Channel } from '@/types/electron'

export function useChannels(): { channels: Channel[]; loading: boolean; error: Error | null } {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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
  }, [])

  return { channels, loading, error }
}
