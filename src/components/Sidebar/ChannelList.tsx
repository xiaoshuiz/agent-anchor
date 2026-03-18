import { Hash, Plus } from 'lucide-react'
import { useState } from 'react'
import { useChannels } from '@/hooks/useChannels'
import { useChannelThreadCounts } from '@/hooks/useChannelThreadCounts'
import { useUIStore } from '@/stores/uiStore'
import { useUnread } from '@/hooks/useUnread'
import { EmptyState } from '@/components/Channel/EmptyState'
import { CreateChannelModal } from '@/components/Channel/CreateChannelModal'

export function ChannelList() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { channels, loading } = useChannels()
  const channelChannels = channels.filter((c) => (c as { type?: string }).type !== 'dm')
  const threadCounts = useChannelThreadCounts(channelChannels.map((c) => c.id))
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const setSelectedChannel = useUIStore((s) => s.setSelectedChannel)
  const unread = useUnread()

  if (loading) {
    return (
      <div className="px-2 py-2 text-slate-400 text-sm">Loading...</div>
    )
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <Plus className="w-4 h-4 shrink-0" />
        Create channel
      </button>
      {channelChannels.length === 0 ? (
        <EmptyState
          title="No channels"
          description="Click above to create one"
          variant="compact"
        />
      ) : channelChannels.map((ch) => {
        const unreadCount = unread[ch.id] ?? 0
        const threadCount = threadCounts[ch.id] ?? 0
        const isSelected = selectedChannelId === ch.id
        return (
          <button
            key={ch.id}
            onClick={() => setSelectedChannel(ch.id)}
            className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-700 transition-colors flex items-center gap-2 ${
              isSelected ? 'bg-violet-600 hover:bg-violet-600 text-white' : ''
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
      {showCreateModal && (
        <CreateChannelModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {}}
        />
      )}
    </div>
  )
}
