import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { ChannelHeader } from '@/components/Channel/ChannelHeader'
import { MessageList } from '@/components/Channel/MessageList'
import { MessageInput } from '@/components/Channel/MessageInput'
import { ThreadPanel } from '@/components/Channel/ThreadPanel'
import { useThemeStore } from '@/stores/themeStore'
import { useChannels } from '@/hooks/useChannels'
import { useUIStore } from '@/stores/uiStore'

function ThemeSync() {
  const setDark = useThemeStore((s) => s.setDark)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setDark(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setDark])
  return null
}

function DarkClassSync() {
  const isDark = useThemeStore((s) => s.isDark)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])
  return null
}

function AutoSelectChannel() {
  const { channels } = useChannels()
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const setSelectedChannel = useUIStore((s) => s.setSelectedChannel)
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannel(channels[0].id)
    }
  }, [channels, selectedChannelId, setSelectedChannel])
  return null
}

export default function App() {
  const selectedThreadRootId = useUIStore((s) => s.selectedThreadRootId)
  return (
    <>
      <ThemeSync />
      <DarkClassSync />
      <AutoSelectChannel />
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </main>
        {selectedThreadRootId ? (
          <div className="w-64 lg:w-80 shrink-0">
            <ThreadPanel />
          </div>
        ) : (
          <div className="w-0 lg:w-64 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 hidden lg:block" />
        )}
      </div>
    </>
  )
}
