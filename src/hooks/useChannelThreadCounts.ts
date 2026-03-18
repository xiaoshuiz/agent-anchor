import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'

export function useChannelThreadCounts(
  channelIds: string[]
): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const refreshTrigger = useUIStore((s) => s.messagesRefreshTrigger)

  useEffect(() => {
    if (channelIds.length === 0) {
      setCounts({})
      return
    }
    const api = window.electronAPI
    if (!api?.channels?.getThreadCount) {
      return
    }
    Promise.all(
      channelIds.map((id) =>
        api.channels.getThreadCount(id).then((c) => [id, c] as const)
      )
    ).then((pairs) => {
      setCounts(Object.fromEntries(pairs))
    })
  }, [channelIds.join(','), refreshTrigger])

  return counts
}
