import { useEffect, useState } from 'react'
import type { Agent } from '@/types/electron'

interface AgentDetailProps {
  agentId: string
  onClose: () => void
}

export function AgentDetail({ agentId, onClose }: AgentDetailProps) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.electronAPI?.agents?.get?.(agentId).then((a) => {
      setAgent(a ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [agentId])

  const capabilities = agent?.capabilities
  const capsList = Array.isArray(capabilities)
    ? capabilities
    : typeof capabilities === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(capabilities)
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return capabilities ? [capabilities] : []
          }
        })()
      : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-4 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Agent details"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Agent Details
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
        {loading && <p className="text-slate-500 text-sm">Loading...</p>}
        {!loading && agent && (
          <div className="space-y-3">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400 uppercase">Name</dt>
              <dd className="text-slate-800 dark:text-slate-200 font-medium">{agent.name}</dd>
            </div>
            {agent.description && (
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400 uppercase">Description</dt>
                <dd className="text-slate-700 dark:text-slate-300 text-sm">{agent.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400 uppercase">Capabilities</dt>
              <dd className="text-slate-700 dark:text-slate-300 text-sm">
                {capsList.length > 0 ? (
                  <ul className="list-disc list-inside mt-1">
                    {capsList.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-500">Not declared</span>
                )}
              </dd>
            </div>
          </div>
        )}
        {!loading && !agent && (
          <p className="text-slate-500 text-sm">Agent not found</p>
        )}
      </div>
    </div>
  )
}
