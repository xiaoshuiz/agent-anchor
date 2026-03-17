import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'

export function MessageInput() {
  const [value, setValue] = useState('')
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const refreshMessages = useUIStore((s) => s.refreshMessages)

  const sendMessage = async () => {
    const trimmed = value.trim()
    if (!trimmed || !selectedChannelId) return
    const api = window.electronAPI?.messages
    if (!api?.send) return
    const result = await api.send(selectedChannelId, trimmed)
    if (result && 'error' in result) {
      console.error('Send failed:', result.error)
      return
    }
    setValue('')
    refreshMessages()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </footer>
  )
}
