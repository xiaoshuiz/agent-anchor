import { useMessages } from '@/hooks/useMessages'
import { useUIStore } from '@/stores/uiStore'
import { MessageBubble } from './MessageBubble'
import { EmptyState } from './EmptyState'

export function MessageList() {
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const { messages, loading } = useMessages(selectedChannelId ?? '')

  if (!selectedChannelId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
        Select a channel to view messages
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
        Loading...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState
          title="No messages yet"
          description="Be the first to send a message"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  )
}
