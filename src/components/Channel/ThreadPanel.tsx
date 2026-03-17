import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { useThreadMessages } from '@/hooks/useThreadMessages'
import { useUIStore } from '@/stores/uiStore'

export function ThreadPanel() {
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const selectedThreadRootId = useUIStore((s) => s.selectedThreadRootId)
  const setSelectedThreadRoot = useUIStore((s) => s.setSelectedThreadRoot)
  const { rootMessage, replies, loading } = useThreadMessages(
    selectedChannelId,
    selectedThreadRootId
  )

  if (!selectedThreadRootId || !selectedChannelId) return null

  return (
    <div className="flex flex-col h-full border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <header className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Thread</span>
        <button
          type="button"
          onClick={() => setSelectedThreadRoot(null)}
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
        >
          Close
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-slate-500 dark:text-slate-400 text-sm">Loading...</div>
        ) : (
          <>
            {rootMessage && (
              <div className="border-l-2 border-blue-500 pl-3">
                <MessageBubble message={rootMessage} showReplyButton={false} />
              </div>
            )}
            {replies.map((msg) => (
              <MessageBubble key={msg.id} message={msg} showReplyButton={false} />
            ))}
          </>
        )}
      </div>
      <MessageInput threadTs={selectedThreadRootId} />
    </div>
  )
}
