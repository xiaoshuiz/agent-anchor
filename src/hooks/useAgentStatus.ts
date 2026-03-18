import { useEffect, useState } from 'react'

export function useAgentStatus(): Record<string, 'online' | 'offline'> {
  const [status, setStatus] = useState<Record<string, 'online' | 'offline'>>({})

  const fetchStatus = () => {
    window.electronAPI?.agents?.getStatus?.().then(setStatus).catch(() => setStatus({}))
  }

  useEffect(() => {
    fetchStatus()
    window.electronAPI?.agents?.onStatusChanged?.(fetchStatus)
    return () => {
      // IPC listeners are cleaned up by Electron when context is destroyed
    }
  }, [])

  return status
}
