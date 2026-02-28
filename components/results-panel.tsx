"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PerformanceChart, BenchmarkType } from "@/components/performance-chart"
import { TradeHistoryTable } from "@/components/trade-history-table"
import { MonthlyPerformanceHeatmap } from "@/components/monthly-performance-heatmap"
import { StockRecommendations } from "@/components/stock-recommendations"
import { useBacktest } from "@/lib/hooks/useBacktest"
import { Loader2, AlertCircle, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ResultsPanelProps {
  backtestResults?: any
  loading?: boolean
  error?: string | null
}

export function ResultsPanel({ backtestResults, loading, error }: ResultsPanelProps) {
  const { results } = useBacktest()
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkType>("ihsg")
  const [elapsedTime, setElapsedTime] = useState("0.0")

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      const startTime = Date.now()
      setElapsedTime("0.0")
      interval = setInterval(() => {
        const ms = Date.now() - startTime
        setElapsedTime((ms / 1000).toFixed(1))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [loading])

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
    tradesCount: currentResults?.trades?.length || 0,
    recentSignalsCount: currentResults?.recentSignals?.signals?.length || 0,
    signalsCount: currentResults?.signals?.length || 0,
    hasRecentSignals: !!currentResults?.recentSignals,
    hasRecentSignalsArray: !!currentResults?.recentSignals?.signals,
    hasSignals: !!currentResults?.signals,
    recentSignals: currentResults?.recentSignals,
    signals: currentResults?.signals
  })

  // Only show data if we have real results
  const performanceStats: any[] = currentResults ? [
    {
      label: "Total Return",
      value: `${(currentResults.summary?.totalReturn || 0).toFixed(1)}%`,
      positive: (currentResults.summary?.totalReturn || 0) >= 0,
      tooltip: "Persentase keuntungan atau kerugian total portofolio selama periode backtest."
    },
    {
      label: "Annualized Return",
      value: `${(currentResults.summary?.annualizedReturn || 0).toFixed(1)}%`,
      positive: (currentResults.summary?.annualizedReturn || 0) >= 0,
      tooltip: "Compound Annual Growth Rate (CAGR) mewakili pertumbuhan tahunan portofolio yang disetahunkan."
    },
    {
      label: "Max Drawdown",
      value: `${(currentResults.summary?.maxDrawdown || 0).toFixed(1)}%`,
      positive: (currentResults.summary?.maxDrawdown || 0) >= 0,
      tooltip: "Kerugian maksimum yang diamati dari puncak tertinggi ke titik terendah portofolio, mengindikasikan risiko penurunan."
    },
    {
      label: "Win Rate",
      value: `${(currentResults.summary?.winRate || 0).toFixed(1)}%`,
      positive: (currentResults.summary?.winRate || 0) >= 50,
      tooltip: "Persentase perdagangan yang menguntungkan dari semua perdagangan yang ditutup."
    },
    {
      label: "Total Trades",
      value: `${currentResults.summary?.totalTrades || 0}`,
      neutral: true,
      tooltip: "Total jumlah pasangan perdagangan jual beli yang dieksekusi selama periode backtest."
    },
    {
      label: "Avg Hold Days",
      value: `${(currentResults.summary?.averageHoldingDays || 0).toFixed(1)}`,
      neutral: true,
      tooltip: "Rata-rata jumlah hari posisi saham ditahan dalam portofolio."
    },
    {
      label: "Profit Factor",
      value: (currentResults.summary?.profitFactor || 0).toFixed(2),
      positive: (currentResults.summary?.profitFactor || 0) >= 1,
      tooltip: "Rasio total keuntungan terhadap total kerugian. Mengukur seberapa efisien strategi dalam menghasilkan profit."
    },
    {
      label: "Sharpe Ratio",
      value: (currentResults.summary?.sharpeRatio || 0).toFixed(2),
      positive: (currentResults.summary?.sharpeRatio || 0) >= 1,
      tooltip: "Ukuran tingkat return tambahan atas setiap unit risiko yang diambil."
    },
  ] : []

  if (loading) {
    return (
      <div className="p-6 space-y-6 py-3.5 px-3.5">
        <Card className="rounded-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-mono">Running backtest... ({elapsedTime}s)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Detect if the error is a quota/limit error
  const isQuotaError = error && (
    error.toLowerCase().includes('limit reached') ||
    error.toLowerCase().includes('upgrade your plan')
  );

  // Format error message: style number patterns (e.g. "27/25") with IBM Plex Mono + red pill
  const formatErrorMessage = (msg: string) => {
    const parts = msg.split(/(\d+\/\d+)/g);
    return parts.map((part, i) => {
      if (/^\d+\/\d+$/.test(part)) {
        return (
          <span
            key={i}
            className="inline-block px-2 py-0.5 rounded-md text-red-700 font-semibold text-xs"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (error) {
    return (
      <div className="p-6 space-y-6 py-3.5 px-3.5">
        <Card className="rounded-md">
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-3 max-w-sm text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {isQuotaError ? 'Kuota Harian Tercapai' : 'Backtest Gagal'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formatErrorMessage(error)}
              </p>
              {isQuotaError && (
                <Link href="/harga">
                  <Button
                    size="sm"
                    className="mt-2 text-white font-medium hover:opacity-90 transition-all group"
                    style={{ backgroundColor: '#d07225' }}
                  >
                    Upgrade Plan
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </Link>
              )}
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
    <div className="p-4 space-y-4">
      {/* Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Chart */}
        <Card className="rounded-md lg:col-span-2 h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-foreground font-mono font-bold text-base">Performance Chart</CardTitle>
            {/* Benchmark Toggle */}
            <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setSelectedBenchmark("ihsg")}
                className={`px-3 py-1.5 rounded-md transition-all ${selectedBenchmark === "ihsg"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                IHSG
              </button>
              <button
                onClick={() => setSelectedBenchmark("lq45")}
                className={`px-3 py-1.5 rounded-md transition-all ${selectedBenchmark === "lq45"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                LQ45
              </button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <PerformanceChart data={currentResults?.dailyPortfolio} selectedBenchmark={selectedBenchmark} />
          </CardContent>
        </Card>

        {/* Stock Recommendations */}
        <div className="lg:col-span-1 h-[550px]">
          <StockRecommendations
            signals={currentResults?.recentSignals?.signals || currentResults?.signals}
            trades={currentResults?.trades}
            currentPortfolio={currentResults?.currentPortfolio}
          />
        </div>
      </div>

      {/* Performance Stats */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-foreground font-mono font-bold text-base">Performance Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <TooltipProvider>
              {performanceStats.map((stat: any, index: number) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
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
                            className={`font-mono text-sm font-semibold ${stat.subPositive ? "text-green-600" : "text-red-500"
                              }`}
                          >
                            {stat.subValue}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`font-mono text-xl font-bold ${stat.positive ? "text-green-700" : stat.positive === false ? "text-red-600" : "text-foreground"
                            }`}
                        >
                          {stat.value}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">{stat.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance Heatmap */}
      <MonthlyPerformanceHeatmap monthlyPerformance={currentResults?.monthlyPerformance} />

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
