import { useState, useRef, useEffect, useCallback } from 'react'
import { Send } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useAgents } from '@/hooks/useAgents'
import { parseMentions } from '@/utils/parseMentions'
import { logger } from '@/utils/logger'

const LINE_HEIGHT = 24
const MIN_LINES = 1
const MAX_LINES = 5

interface MessageInputProps {
  /** When provided, messages are sent as thread replies */
  threadTs?: string | null
}

export function MessageInput({ threadTs: threadTsProp }: MessageInputProps = {}) {
  const [value, setValue] = useState('')
  const [showMentionPopup, setShowMentionPopup] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const refreshMessages = useUIStore((s) => s.refreshMessages)
  const { agents } = useAgents()
  const threadTs = threadTsProp

  const adjustHeight = useCallback(() => {
    const ta = inputRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const minH = LINE_HEIGHT * MIN_LINES
    const maxH = LINE_HEIGHT * MAX_LINES
    const h = Math.min(Math.max(ta.scrollHeight, minH), maxH)
    ta.style.height = `${h}px`
    ta.style.overflowY = ta.scrollHeight > maxH ? 'auto' : 'hidden'
  }, [])

  useEffect(adjustHeight, [value, adjustHeight])

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
      const hasMatch =
        afterAt.trim() === '' ||
        agents.some(
          (a) =>
            a.name.toLowerCase().includes(afterAt.toLowerCase()) ||
            a.id.toLowerCase().includes(afterAt.toLowerCase())
        )
      if (hasMatch) {
        setShowMentionPopup(true)
        setMentionQuery(afterAt)
        setMentionIndex(0)
      } else {
        setShowMentionPopup(false)
      }
    } else {
      setShowMentionPopup(false)
    }
  }, [value, agents])

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
    logger.info('MessageInput', 'sendMessage called', { trimmed: !!trimmed, selectedChannelId, hasApi: !!window.electronAPI?.messages?.send })
    if (!trimmed || !selectedChannelId) {
      logger.info('MessageInput', 'sendMessage early return', { trimmed: !!trimmed, selectedChannelId })
      return
    }
    const api = window.electronAPI?.messages
    if (!api?.send) {
      logger.warn('MessageInput', 'messages.send API not available')
      return
    }
    const mentions = parseMentions(trimmed, agents)
    const result = await api.send(
      selectedChannelId,
      trimmed,
      threadTs ?? undefined,
      mentions.length > 0 ? mentions : undefined
    )
    if (result && 'error' in result) {
      logger.error('MessageInput', 'Send failed', { error: result.error })
      return
    }
    logger.info('MessageInput', 'Message sent successfully')
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        e.preventDefault()
        insertMention(filteredAgents[mentionIndex]?.name ?? filteredAgents[mentionIndex]?.id ?? '')
        return
      }
    }
    // Enter = 发送, Shift+Enter = 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      sendMessage()
    }
  }

  return (
    <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              threadTs ? 'Reply in thread...' : 'Type a message... (use @ to mention, Enter to send)'
            }
            className="w-full px-4 py-2 pr-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none leading-6"
            style={{ minHeight: LINE_HEIGHT, maxHeight: LINE_HEIGHT * MAX_LINES }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!value.trim() || !selectedChannelId}
            className="absolute right-2 bottom-2 p-1.5 rounded-md text-slate-400 hover:text-violet-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
            aria-label="发送"
          >
            <Send className="w-4 h-4" />
          </button>
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
