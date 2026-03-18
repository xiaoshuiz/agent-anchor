import { Hash } from 'lucide-react'
import { useChannels } from '@/hooks/useChannels'
import { useChannelThreadCounts } from '@/hooks/useChannelThreadCounts'
import { useUIStore } from '@/stores/uiStore'
import { useUnread } from '@/hooks/useUnread'
import { EmptyState } from '@/components/Channel/EmptyState'

export function ChannelList() {
  const { channels, loading } = useChannels()
  const threadCounts = useChannelThreadCounts(channels.map((c) => c.id))
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const setSelectedChannel = useUIStore((s) => s.setSelectedChannel)
  const unread = useUnread()

  if (loading) {
    return (
      <div className="px-2 py-2 text-slate-400 text-sm">Loading...</div>
    )
  }

  if (channels.length === 0) {
    return (
      <EmptyState
        title="No channels"
        description="Start by creating one"
        variant="compact"
      />
    )
  }

  return (
    <div className="space-y-0.5">
      {channels.map((ch) => {
        const unreadCount = unread[ch.id] ?? 0
        const threadCount = threadCounts[ch.id] ?? 0
        return (
          <button
            key={ch.id}
            onClick={() => setSelectedChannel(ch.id)}
            className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-700 transition-colors flex items-center gap-2 ${
              selectedChannelId === ch.id ? 'bg-slate-700 text-white' : ''
            }`}
          >
            <Hash className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate flex-1 min-w-0">{ch.name}</span>
            <span className="shrink-0 flex items-center gap-1">
              {unreadCount > 0 && (
                <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {threadCount > 0 && (
                <span className="text-xs bg-slate-600 text-slate-200 px-1.5 py-0.5 rounded">
                  {threadCount}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
