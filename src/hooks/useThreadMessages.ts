import { useEffect, useState } from 'react'
import type { Message } from '@/types/electron'
import { useUIStore } from '@/stores/uiStore'

export function useThreadMessages(
  channelId: string | null,
  rootMessageId: string | null
): { rootMessage: Message | null; replies: Message[]; loading: boolean } {
  const [rootMessage, setRootMessage] = useState<Message | null>(null)
  const [replies, setReplies] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const refreshTrigger = useUIStore((s) => s.messagesRefreshTrigger)

  useEffect(() => {
    if (!channelId || !rootMessageId) {
      setRootMessage(null)
      setReplies([])
      setLoading(false)
      return
    }
    const api = window.electronAPI
    if (!api?.messages) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      api.messages.get(rootMessageId),
      api.messages.listByThread(channelId, rootMessageId),
    ])
      .then(([root, reps]) => {
        setRootMessage(root ?? null)
        setReplies(reps ?? [])
      })
      .finally(() => setLoading(false))
  }, [channelId, rootMessageId, refreshTrigger])

  return { rootMessage, replies, loading }
}
