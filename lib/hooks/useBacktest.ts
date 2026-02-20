import { useState, useCallback } from 'react'
import { ApiService, BacktestRequest, BacktestResult } from '../api'

interface UseBacktestReturn {
  results: BacktestResult | null
  loading: boolean
  error: string | null
  runBacktest: (config: BacktestRequest, isInitial?: boolean) => Promise<void>
  clearResults: () => void
}

export function useBacktest(): UseBacktestReturn {
  const [results, setResults] = useState<BacktestResult | null>(null)
  const [loading, setLoading] = useState(true) // Revert to true since it runs on mount again
  const [error, setError] = useState<string | null>(null)

  const runBacktest = useCallback(async (config: BacktestRequest, isInitial: boolean = false) => {
    setLoading(true)
    setError(null)

    try {
      const result = await ApiService.runBacktest(config, isInitial)
      setResults(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run backtest'
      setError(errorMessage)
      throw err // Re-throw so UI can show toast
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults(null)
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    runBacktest,
    clearResults,
  }
}
