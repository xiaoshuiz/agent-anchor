import { useEffect, useState } from 'react'
import type { Message } from '@/types/electron'

export function useMessages(channelId: string | null): { messages: Message[]; loading: boolean; error: Error | null } {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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
  }, [channelId])

  return { messages, loading, error }
}
