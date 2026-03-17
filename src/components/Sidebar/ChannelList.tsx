import { useChannels } from '@/hooks/useChannels'
import { useUIStore } from '@/stores/uiStore'
import { EmptyState } from '@/components/Channel/EmptyState'

export function ChannelList() {
  const { channels, loading } = useChannels()
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const setSelectedChannel = useUIStore((s) => s.setSelectedChannel)

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
      {channels.map((ch) => (
        <button
          key={ch.id}
          onClick={() => setSelectedChannel(ch.id)}
          className={`w-full text-left px-2 py-1.5 rounded hover:bg-slate-700 transition-colors ${
            selectedChannelId === ch.id ? 'bg-slate-700 text-white' : ''
          }`}
        >
          <span className="truncate block">{ch.name}</span>
        </button>
      ))}
    </div>
  )
}
