import { useState, useCallback } from 'react'
import { ApiService, BacktestRequest, BacktestResult } from '../api'

interface UseBacktestReturn {
  results: BacktestResult | null
  loading: boolean
  error: string | null
  runBacktest: (config: BacktestRequest) => Promise<void>
  clearResults: () => void
}

export function useBacktest(): UseBacktestReturn {
  const [results, setResults] = useState<BacktestResult | null>(null)
  const [loading, setLoading] = useState(true) // Start with loading true since backtest auto-runs on mount
  const [error, setError] = useState<string | null>(null)

  const runBacktest = useCallback(async (config: BacktestRequest) => {
    setLoading(true)
    setError(null)

    try {
      const result = await ApiService.runBacktest(config)
      setResults(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run backtest'
      setError(errorMessage)
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
