import { useState, useCallback } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { useChannels } from '@/hooks/useChannels'
import { useAgents } from '@/hooks/useAgents'
import { useUIStore } from '@/stores/uiStore'
import type { SearchResult } from '@/types/electron'
import { formatDistanceToNow } from 'date-fns'

interface SearchProps {
  onClose: () => void
}

export function Search({ onClose }: SearchProps) {
  const [keyword, setKeyword] = useState('')
  const [channelFilter, setChannelFilter] = useState<string>('')
  const [fromFilter, setFromFilter] = useState<string>('')
  const { results, loading, error, search } = useSearch()
  const { channels } = useChannels()
  const { agents } = useAgents()
  const setSelectedChannel = useUIStore((s) => s.setSelectedChannel)

  const handleSearch = useCallback(() => {
    search({
      keyword: keyword.trim(),
      channelId: channelFilter || undefined,
      fromId: fromFilter || undefined,
    })
  }, [keyword, channelFilter, fromFilter, search])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleResultClick = (r: SearchResult) => {
    setSelectedChannel(r.message.channel_id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Search messages"
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search messages..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Search
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="">All channels</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
              className="px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="">All senders</option>
              <option value="user">You</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading && <p className="text-slate-500 text-sm">Searching...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!loading && !error && results.length === 0 && keyword.trim() && (
            <p className="text-slate-500 text-sm">No results found</p>
          )}
          {!loading && !error && results.length > 0 && (
            <ul className="space-y-2">
              {results.map((r) => (
                <li key={r.message.id}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(r)}
                    className="w-full text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{r.channelName}</span>
                      <span>•</span>
                      <span>{r.fromName}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(r.message.timestamp, { addSuffix: true })}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-sm mt-0.5 line-clamp-2">
                      {r.message.content}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
