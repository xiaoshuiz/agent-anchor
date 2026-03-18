import { useState, useCallback } from 'react'
import type { SearchResult } from '@/types/electron'

export function useSearch(): {
  results: SearchResult[]
  loading: boolean
  error: string | null
  search: (params: { keyword: string; channelId?: string; fromId?: string }) => Promise<void>
} {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (params: { keyword: string; channelId?: string; fromId?: string }) => {
    if (!params.keyword?.trim()) {
      setResults([])
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await window.electronAPI?.search?.query?.(params) ?? []
      setResults(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(String(e))
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, search }
}
