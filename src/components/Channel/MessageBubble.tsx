import { formatDistanceToNow } from 'date-fns'
import type { Message } from '@/types/electron'
import { useAgents } from '@/hooks/useAgents'
import { useUIStore } from '@/stores/uiStore'
import { MessageContent } from './MessageContent'

interface MessageBubbleProps {
  message: Message
  showReplyButton?: boolean
}

export function MessageBubble({ message, showReplyButton = true }: MessageBubbleProps) {
  const isUser = message.from_type === 'user'
  const { agents } = useAgents()
  const setSelectedThreadRoot = useUIStore((s) => s.setSelectedThreadRoot)
  const setMentionFilter = useUIStore((s) => s.setMentionFilter)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex gap-2 max-w-[75%] ${
          isUser ? 'flex-row-reverse' : ''
        }`}
      >
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm shrink-0">
            {message.from_id.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          className={`rounded-lg px-3 py-2 ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
          }`}
        >
          <div className="text-xs opacity-80 mb-0.5 flex items-center gap-2">
            <span>{message.from_id}</span>
            <span className="opacity-60">
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
            {showReplyButton && (
              <button
                type="button"
                onClick={() => setSelectedThreadRoot(message.id)}
                className="opacity-60 hover:opacity-100 text-xs"
              >
                Reply
              </button>
            )}
          </div>
          <p className="break-words">
            <MessageContent
              content={message.content}
              agents={agents}
              onMentionClick={setMentionFilter}
              invertHighlight={isUser}
            />
          </p>
        </div>
      </div>
    </div>
  )
}
