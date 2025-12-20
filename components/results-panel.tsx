"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PerformanceChart } from "@/components/performance-chart"
import { TradeHistoryTable } from "@/components/trade-history-table"
import { MonthlyPerformanceHeatmap } from "@/components/monthly-performance-heatmap"
import { useBacktest } from "@/lib/hooks/useBacktest"
import { Loader2 } from "lucide-react"

interface ResultsPanelProps {
  backtestResults?: any
  loading?: boolean
  error?: string | null
}

export function ResultsPanel({ backtestResults, loading, error }: ResultsPanelProps) {
  const { results } = useBacktest()
  
  console.log('📊 [RESULTS PANEL] Component rendered with props:', {
    hasBacktestResults: !!backtestResults,
    hasHookResults: !!results,
    loading,
    hasError: !!error
  })
  
  // Use props if provided, otherwise use hook results
  const currentResults = backtestResults || results
  
  console.log('📊 [RESULTS PANEL] Current results:', {
    hasCurrentResults: !!currentResults,
    currentResultsKeys: currentResults ? Object.keys(currentResults) : [],
    totalReturn: currentResults?.totalReturn,
    tradesCount: currentResults?.trades?.length || 0
  })
  
  // Only show data if we have real results
  const performanceStats = currentResults ? [
    { 
      label: "Total Return", 
      value: `${(currentResults.summary?.totalReturn || 0).toFixed(1)}%`, 
      positive: (currentResults.summary?.totalReturn || 0) >= 0 
    },
    { 
      label: "Annual Return", 
      value: `${(currentResults.summary?.annualizedReturn || 0).toFixed(1)}%`, 
      positive: (currentResults.summary?.annualizedReturn || 0) >= 0 
    },
    { 
      label: "Max Drawdown", 
      value: `${(currentResults.summary?.maxDrawdown || 0).toFixed(1)}%`, 
      positive: (currentResults.summary?.maxDrawdown || 0) >= 0 
    },
    { 
      label: "Win Rate", 
      value: `${(currentResults.summary?.winRate || 0).toFixed(1)}%`, 
      positive: (currentResults.summary?.winRate || 0) >= 50 
    },
    { 
      label: "Total Trades", 
      value: `${currentResults.summary?.totalTrades || 0}`, 
      neutral: true 
    },
    { 
      label: "Avg Hold Days", 
      value: `${(currentResults.summary?.averageHoldingDays || 0).toFixed(1)}`, 
      neutral: true 
    },
    { 
      label: "Best Stock", 
      value: currentResults.summary?.bestTrade?.ticker || "N/A",
      subValue: currentResults.summary?.bestTrade?.return != null 
        ? `+${currentResults.summary.bestTrade.return.toFixed(1)}%` 
        : null,
      subPositive: true
    },
    { 
      label: "Worst Stock", 
      value: currentResults.summary?.worstTrade?.ticker || "N/A",
      subValue: currentResults.summary?.worstTrade?.return != null 
        ? `${currentResults.summary.worstTrade.return.toFixed(1)}%` 
        : null,
      subPositive: false
    },
  ] : []

  if (loading) {
    return (
      <div className="p-6 space-y-6 py-3.5 px-3.5">
        <Card className="rounded-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-mono">Running backtest...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 py-3.5 px-3.5">
        <Card className="rounded-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-red-500 font-mono text-lg">Error</div>
              <p className="text-muted-foreground font-mono text-center">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentResults) {
    return (
      <div className="p-6 space-y-6 py-3.5 px-3.5">
        <Card className="rounded-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-muted-foreground font-mono text-lg">No Results</div>
              <p className="text-muted-foreground font-mono text-center">Run a backtest to see results</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 py-3.5 px-3.5">
      {/* Performance Chart */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-foreground font-mono font-bold text-base">Performance Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={currentResults?.dailyPortfolio} />
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-foreground font-mono font-bold text-base">Performance Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 bg-secondary/50 rounded-lg border border-border/50 hover:bg-secondary/70 transition-colors"
              >
                <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                  {stat.label}
                </div>
                {stat.subValue ? (
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-mono text-xl font-bold text-foreground">
                      {stat.value}
                    </span>
                    <span
                      className={`font-mono text-sm font-semibold ${
                        stat.subPositive ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {stat.subValue}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`font-mono text-xl font-bold ${
                      stat.positive ? "text-green-700" : stat.positive === false ? "text-red-600" : "text-foreground"
                    }`}
                  >
                    {stat.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance Heatmap */}
      <MonthlyPerformanceHeatmap />

      {/* Trade History */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-foreground font-mono font-bold text-base">Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeHistoryTable trades={currentResults?.trades} />
        </CardContent>
      </Card>
    </div>
  )
}
