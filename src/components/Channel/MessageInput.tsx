import { useState, useRef, useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useAgents } from '@/hooks/useAgents'
import { parseMentions } from '@/utils/parseMentions'

interface MessageInputProps {
  /** When provided, messages are sent as thread replies */
  threadTs?: string | null
}

export function MessageInput({ threadTs: threadTsProp }: MessageInputProps = {}) {
  const [value, setValue] = useState('')
  const [showMentionPopup, setShowMentionPopup] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const refreshMessages = useUIStore((s) => s.refreshMessages)
  const { agents } = useAgents()
  const threadTs = threadTsProp

  const filteredAgents = mentionQuery
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
          a.id.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : agents

  useEffect(() => {
    const sel = inputRef.current?.selectionStart ?? 0
    const textBefore = value.slice(0, sel)
    const lastAt = textBefore.lastIndexOf('@')
    if (lastAt >= 0) {
      const afterAt = textBefore.slice(lastAt + 1)
      const spaceIdx = afterAt.indexOf(' ')
      const query = spaceIdx >= 0 ? afterAt.slice(0, spaceIdx) : afterAt
      setShowMentionPopup(true)
      setMentionQuery(query)
      setMentionIndex(0)
    } else {
      setShowMentionPopup(false)
    }
  }, [value])

  const insertMention = (agentName: string) => {
    const sel = inputRef.current?.selectionStart ?? value.length
    const textBefore = value.slice(0, sel)
    const lastAt = textBefore.lastIndexOf('@')
    const before = value.slice(0, lastAt)
    const after = value.slice(sel)
    const inserted = `@${agentName} `
    setValue(before + inserted + after)
    setShowMentionPopup(false)
    setTimeout(() => {
      inputRef.current?.focus()
      const pos = before.length + inserted.length
      inputRef.current?.setSelectionRange(pos, pos)
    }, 0)
  }

  const sendMessage = async () => {
    const trimmed = value.trim()
    if (!trimmed || !selectedChannelId) return
    const api = window.electronAPI?.messages
    if (!api?.send) return
    const mentions = parseMentions(trimmed, agents)
    const result = await api.send(
      selectedChannelId,
      trimmed,
      threadTs ?? undefined,
      mentions.length > 0 ? mentions : undefined
    )
    if (result && 'error' in result) {
      console.error('Send failed:', result.error)
      return
    }
    setValue('')
    refreshMessages()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (showMentionPopup && filteredAgents.length > 0) {
      insertMention(filteredAgents[mentionIndex]?.name ?? filteredAgents[mentionIndex]?.id ?? '')
      return
    }
    sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentionPopup) {
      if (e.key === 'Escape') {
        setShowMentionPopup(false)
        e.preventDefault()
        return
      }
      if (e.key === 'ArrowDown') {
        setMentionIndex((i) => Math.min(i + 1, filteredAgents.length - 1))
        e.preventDefault()
        return
      }
      if (e.key === 'ArrowUp') {
        setMentionIndex((i) => Math.max(i - 1, 0))
        e.preventDefault()
        return
      }
      if (e.key === 'Enter' && filteredAgents.length > 0) {
        insertMention(filteredAgents[mentionIndex]?.name ?? filteredAgents[mentionIndex]?.id ?? '')
        e.preventDefault()
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              threadTs ? 'Reply in thread...' : 'Type a message... (use @ to mention)'
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {showMentionPopup && (
            <div
              className="absolute bottom-full left-0 right-0 mb-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg"
              role="listbox"
            >
              {filteredAgents.length === 0 ? (
                <div className="px-3 py-2 text-slate-500 dark:text-slate-400 text-sm">
                  No agents match
                </div>
              ) : (
                filteredAgents.map((agent, i) => (
                  <button
                    key={agent.id}
                    type="button"
                    role="option"
                    aria-selected={i === mentionIndex}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      i === mentionIndex ? 'bg-slate-100 dark:bg-slate-700' : ''
                    }`}
                    onClick={() => insertMention(agent.name)}
                  >
                    <span className="font-medium">{agent.name}</span>
                    {agent.description && (
                      <span className="ml-2 text-slate-500 dark:text-slate-400 text-sm truncate">
                        {agent.description}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </form>
    </footer>
  )
}
