import { useEffect, useState } from 'react'
import type { Agent } from '@/types/electron'

export function useAgents(): { agents: Agent[]; loading: boolean; error: Error | null } {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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
  }, [])

  return { agents, loading, error }
}
