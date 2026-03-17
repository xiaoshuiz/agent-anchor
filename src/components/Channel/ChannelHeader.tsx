import { useChannels } from '@/hooks/useChannels'
import { useUIStore } from '@/stores/uiStore'

export function ChannelHeader() {
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const { channels } = useChannels()
  const channel = channels.find((c) => c.id === selectedChannelId)

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center px-4 shrink-0">
      <span className="font-medium text-slate-800 dark:text-slate-200">
        {channel ? channel.name : 'Select a channel'}
      </span>
    </header>
  )
}
