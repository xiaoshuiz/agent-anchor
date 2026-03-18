import { useState, useEffect } from 'react'
import { useChannels } from '@/hooks/useChannels'
import { useUIStore } from '@/stores/uiStore'
import { Search } from '@/components/Search/Search'

export function ChannelHeader() {
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const selectedActivityView = useUIStore((s) => s.selectedActivityView)
  const { channels } = useChannels()
  const channel = channels.find((c) => c.id === selectedChannelId)
  const [searchOpen, setSearchOpen] = useState(false)
  const title = selectedActivityView === 'mentions' ? '@Mentions' : (channel ? channel.name : 'Select a channel')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-4 shrink-0">
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {title}
        </span>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-2 py-1 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
          title="Search (⌘K)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          Search
        </button>
      </header>
      {searchOpen && <Search onClose={() => setSearchOpen(false)} />}
    </>
  )
}
