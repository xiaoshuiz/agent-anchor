import { formatDistanceToNow } from 'date-fns'
import type { Message } from '@/types/electron'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.from_type === 'user'

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
          <div className="text-xs opacity-80 mb-0.5">
            {message.from_id}
            <span className="ml-2 opacity-60">
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="break-words">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
