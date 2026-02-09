"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { BacktestStrategyBuilder } from "@/components/backtest-strategy-builder"
import { ResultsPanel } from "@/components/results-panel"
import { useBacktest } from "@/lib/hooks/useBacktest"
import { BacktestRequest } from "@/lib/api"

export default function BacktestPage() {
  const { results, loading, error, runBacktest } = useBacktest()

  const handleBacktestRun = async (config: BacktestRequest) => {
    await runBacktest(config)
  }

  return (
    <div className="min-h-screen bg-background dotted-background">
      <Navbar />
      <TickerTape />
      <div className="flex h-[calc(100vh-104px)]">
        {/* Left Panel - Strategy Builder */}
        <div className="w-[380px] flex-shrink-0 bg-card border-r border-border overflow-y-auto">
          <BacktestStrategyBuilder
            onRunBacktest={handleBacktestRun}
            backtestResults={results}
          />
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
