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
    console.log('🎯 [USE BACKTEST] Starting backtest hook...')
    console.log('🎯 [USE BACKTEST] Config received:', {
      backtestId: config.backtestId,
      filters: config.filters,
      fundamentalIndicators: config.fundamentalIndicators?.length || 0,
      technicalIndicators: config.technicalIndicators?.length || 0
    })
    
    setLoading(true)
    setError(null)
    console.log('🎯 [USE BACKTEST] Set loading to true, cleared error')
    
    try {
      console.log('🎯 [USE BACKTEST] Calling ApiService.runBacktest...')
      const result = await ApiService.runBacktest(config)
      console.log('🎯 [USE BACKTEST] ApiService returned result:', {
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        hasSummary: !!result?.summary,
        totalReturn: result?.summary?.totalReturn,
        tradesCount: result?.trades?.length || 0
      })
      
      setResults(result)
      console.log('🎯 [USE BACKTEST] Set results in state')
    } catch (err) {
      console.error('💥 [USE BACKTEST] Error caught:', err)
      console.error('💥 [USE BACKTEST] Error type:', typeof err)
      console.error('💥 [USE BACKTEST] Error instanceof Error:', err instanceof Error)
      console.error('💥 [USE BACKTEST] Error message:', err instanceof Error ? err.message : 'Unknown error')
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to run backtest'
      setError(errorMessage)
      console.log('🎯 [USE BACKTEST] Set error in state:', errorMessage)
    } finally {
      setLoading(false)
      console.log('🎯 [USE BACKTEST] Set loading to false')
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
