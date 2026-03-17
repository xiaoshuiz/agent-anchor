import { useMessages } from '@/hooks/useMessages'
import { useAgents } from '@/hooks/useAgents'
import { useUIStore } from '@/stores/uiStore'
import { MessageBubble } from './MessageBubble'
import { EmptyState } from './EmptyState'
import type { Message } from '@/types/electron'
import type { Agent } from '@/types/electron'

function messageMentionsAgent(msg: Message, agentId: string, agents: Agent[]): boolean {
  if (msg.mentions) {
    try {
      const arr = JSON.parse(msg.mentions) as string[]
      if (arr.includes(agentId)) return true
    } catch {
      // ignore
    }
  }
  const agent = agents.find((a) => a.id === agentId)
  const name = agent?.name
  if (name && msg.content.includes(`@${name}`)) return true
  if (msg.content.includes(`@${agentId}`)) return true
  return false
}

export function MessageList() {
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const mentionFilterAgentId = useUIStore((s) => s.mentionFilterAgentId)
  const setMentionFilter = useUIStore((s) => s.setMentionFilter)
  const { messages, loading } = useMessages(selectedChannelId ?? '')
  const { agents } = useAgents()

  const rootMessages = messages.filter((m) => !m.thread_ts)
  const filteredMessages =
    mentionFilterAgentId && agents.length > 0
      ? rootMessages.filter((m) => messageMentionsAgent(m, mentionFilterAgentId, agents))
      : rootMessages

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

  if (filteredMessages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState
          title={mentionFilterAgentId ? 'No messages mention this agent' : 'No messages yet'}
          description={
            mentionFilterAgentId
              ? 'Clear the filter to see all messages'
              : 'Be the first to send a message'
          }
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {mentionFilterAgentId && (
        <div className="flex items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Filtering by @{agents.find((a) => a.id === mentionFilterAgentId)?.name ?? mentionFilterAgentId}</span>
          <button
            type="button"
            onClick={() => setMentionFilter(null)}
            className="text-blue-500 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
      {filteredMessages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  )
}
