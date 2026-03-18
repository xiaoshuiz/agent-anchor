import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { ChannelHeader } from '@/components/Channel/ChannelHeader'
import { MessageList } from '@/components/Channel/MessageList'
import { MessageInput } from '@/components/Channel/MessageInput'
import { MentionsView } from '@/components/Channel/MentionsView'
import { ThreadPanel } from '@/components/Channel/ThreadPanel'
import { useThemeStore } from '@/stores/themeStore'
import { useChannels } from '@/hooks/useChannels'
import { useUIStore } from '@/stores/uiStore'
import { useUnread } from '@/hooks/useUnread'

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
  const selectedActivityView = useUIStore((s) => s.selectedActivityView)
  const setSelectedChannel = useUIStore((s) => s.setSelectedChannel)
  const channelChannels = channels.filter((c) => (c as { type?: string }).type !== 'dm')
  useEffect(() => {
    if (channelChannels.length > 0 && !selectedChannelId && !selectedActivityView) {
      setSelectedChannel(channelChannels[0].id)
    }
  }, [channelChannels, selectedChannelId, selectedActivityView, setSelectedChannel])
  return null
}

function UnreadSync() {
  useUnread()
  return null
}

function MainContent() {
  const selectedActivityView = useUIStore((s) => s.selectedActivityView)
  if (selectedActivityView === 'mentions') {
    return (
      <>
        <MentionsView />
      </>
    )
  }
  return (
    <>
      <MessageList />
      <MessageInput />
    </>
  )
}

export default function App() {
  const selectedThreadRootId = useUIStore((s) => s.selectedThreadRootId)
  return (
    <>
      <ThemeSync />
      <DarkClassSync />
      <AutoSelectChannel />
      <UnreadSync />
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <ChannelHeader />
          <MainContent />
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
