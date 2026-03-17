import { useEffect, useState } from 'react'
import type { Message } from '@/types/electron'
import { useUIStore } from '@/stores/uiStore'

export function useMessages(channelId: string | null): { messages: Message[]; loading: boolean; error: Error | null } {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const refreshTrigger = useUIStore((s) => s.messagesRefreshTrigger)
  const refreshMessages = useUIStore((s) => s.refreshMessages)

  useEffect(() => {
    window.electronAPI?.messages?.onInvalidated?.(refreshMessages)
  }, [refreshMessages])

  useEffect(() => {
    if (!channelId) {
      setMessages([])
      setLoading(false)
      return
    }
    const api = window.electronAPI
    if (!api?.messages?.list) {
      setLoading(false)
      return
    }
    setLoading(true)
    api.messages
      .list(channelId)
      .then(setMessages)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [channelId, refreshTrigger])

  return { messages, loading, error }
}
