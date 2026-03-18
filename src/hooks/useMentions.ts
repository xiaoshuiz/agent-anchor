import { useEffect, useState } from 'react'
import type { Message } from '@/types/electron'
import { useUIStore } from '@/stores/uiStore'

export function useMentions(): { messages: Message[]; loading: boolean } {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const messagesRefreshTrigger = useUIStore((s) => s.messagesRefreshTrigger)

  useEffect(() => {
    setLoading(true)
    window.electronAPI?.messages?.listMentions?.()
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [messagesRefreshTrigger])

  return { messages, loading }
}
