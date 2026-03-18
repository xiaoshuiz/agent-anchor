import { useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useUIStore } from '@/stores/uiStore'

interface CreateChannelModalProps {
  onClose: () => void
  onCreated: (channelId: string) => void
}

export function CreateChannelModal({ onClose, onCreated }: CreateChannelModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { agents } = useAgents()
  const refreshChannels = useUIStore((s) => s.refreshChannels)
  const setSelectedChannel = useUIStore((s) => s.setSelectedChannel)

  const toggleAgent = (agentId: string) => {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev)
      if (next.has(agentId)) next.delete(agentId)
      else next.add(agentId)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Channel name is required')
      return
    }
    setSubmitting(true)
    try {
      const result = await window.electronAPI?.channels?.create?.({
        name: trimmedName,
        description: description.trim() || undefined,
        agentIds: Array.from(selectedAgentIds),
      })
      if (result && 'error' in result) {
        setError(result.error)
        return
      }
      if (result && 'id' in result) {
        refreshChannels()
        setSelectedChannel(result.id)
        onCreated(result.id)
        onClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Create Channel"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Create Channel
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
              Channel name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. coding or #coding"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
              Add agents (optional)
            </label>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-300 dark:border-slate-600 p-2 space-y-1">
              {agents.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No agents yet. Create one first.</p>
              ) : (
                agents.map((agent) => (
                  <label
                    key={agent.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAgentIds.has(agent.id)}
                      onChange={() => toggleAgent(agent.id)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-800 dark:text-slate-200">{agent.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
