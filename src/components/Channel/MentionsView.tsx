import { useMentions } from '@/hooks/useMentions'
import { useChannels } from '@/hooks/useChannels'
import { useAgents } from '@/hooks/useAgents'
import { useUIStore } from '@/stores/uiStore'
import { formatDistanceToNow } from 'date-fns'
import type { Message } from '@/types/electron'
import { MessageContent } from './MessageContent'

export function MentionsView() {
  const { messages, loading } = useMentions()
  const { channels } = useChannels()
  const { agents } = useAgents()
  const setSelectedChannel = useUIStore((s) => s.setSelectedChannel)
  const setSelectedActivityView = useUIStore((s) => s.setSelectedActivityView)

  const getChannelName = (channelId: string) =>
    channels.find((c) => c.id === channelId)?.name ?? channelId

  const handleMessageClick = (msg: Message) => {
    setSelectedActivityView(null)
    setSelectedChannel(msg.channel_id)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Loading...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
        <p className="text-lg font-medium">No mentions yet</p>
        <p className="text-sm mt-1">Messages where someone @mentions you will appear here</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
        @Mentions
      </h2>
      {messages.map((msg) => (
        <button
          key={msg.id}
          type="button"
          onClick={() => handleMessageClick(msg)}
          className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{msg.from_id}</span>
            <span>in {getChannelName(msg.channel_id)}</span>
            <span>{formatDistanceToNow(msg.timestamp, { addSuffix: true })}</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 break-words">
            <MessageContent
              content={msg.content}
              agents={agents}
              onMentionClick={() => {}}
              invertHighlight={false}
            />
          </p>
        </button>
      ))}
    </div>
  )
}
