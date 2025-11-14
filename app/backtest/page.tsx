"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { StrategyBuilder } from "@/components/strategy-builder"
import { ResultsPanel } from "@/components/results-panel"
import { useBacktest } from "@/lib/hooks/useBacktest"
import { BacktestRequest } from "@/lib/api"

export default function BacktestPage() {
  const { results, loading, error, runBacktest } = useBacktest()
  
  console.log('🔧 [BACKTEST PAGE] Component rendered with state:', {
    hasResults: !!results,
    loading,
    hasError: !!error,
    resultsKeys: results ? Object.keys(results) : []
  })

  const handleBacktestRun = async (config: BacktestRequest) => {
    console.log('🔧 [BACKTEST PAGE] handleBacktestRun called with config:', {
      backtestId: config.backtestId,
      filters: config.filters,
      fundamentalIndicators: config.fundamentalIndicators?.length || 0,
      technicalIndicators: config.technicalIndicators?.length || 0
    })
    
    console.log('🔧 [BACKTEST PAGE] Calling runBacktest...')
    await runBacktest(config)
    console.log('🔧 [BACKTEST PAGE] runBacktest completed')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TickerTape />
      <div className="flex h-[calc(100vh-104px)]">
        {/* Left Panel - Strategy Builder */}
        <div className="w-[380px] flex-shrink-0 bg-card border-r border-border overflow-y-auto">
          <StrategyBuilder onRunBacktest={handleBacktestRun} />
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 overflow-y-auto">
          <ResultsPanel 
            backtestResults={results}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}
