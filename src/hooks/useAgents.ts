import { useEffect, useState } from 'react'
import type { Agent } from '@/types/electron'
import { useUIStore } from '@/stores/uiStore'

export function useAgents(): { agents: Agent[]; loading: boolean; error: Error | null } {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const agentsRefreshTrigger = useUIStore((s) => s.agentsRefreshTrigger)
  const refreshAgents = useUIStore((s) => s.refreshAgents)

  useEffect(() => {
    window.electronAPI?.agents?.onInvalidated?.(refreshAgents)
  }, [refreshAgents])

  useEffect(() => {
    const api = window.electronAPI
    if (!api?.agents?.list) {
      setLoading(false)
      return
    }
    api.agents
      .list()
      .then(setAgents)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [agentsRefreshTrigger])

  return { agents, loading, error }
}
