"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { BacktestStrategyBuilder } from "@/components/backtest-strategy-builder"
import { ResultsPanel } from "@/components/results-panel"
import { useBacktest } from "@/lib/hooks/useBacktest"
import { BacktestRequest } from "@/lib/api"
import { Monitor } from "lucide-react"

export default function BacktestPage() {
  const { results, loading, error, runBacktest } = useBacktest()

  const handleBacktestRun = async (config: BacktestRequest, isInitial?: boolean) => {
    await runBacktest(config, isInitial)
  }

  return (
    <div className="min-h-screen bg-background dotted-background flex flex-col">
      <Navbar />
      <TickerTape />

      {/* Mobile Warning - Visible only on small screens */}
      <div className="flex lg:hidden flex-1 items-center justify-center p-6 mt-12">
        <div className="text-center max-w-md space-y-4 bg-white/60 backdrop-blur-md border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="w-16 h-16 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-orange-100">
            <Monitor className="w-8 h-8 text-[#d07225]" />
          </div>
          <h2 className="text-xl font-bold font-ibm-plex-mono text-foreground tracking-tight">
            Perlu Akses Desktop
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Halaman Builder & Simulasi memiliki banyak konfigurasi teknikal, chart, dan tabel data yang padat. Silakan buka halaman ini melalui browser Desktop atau layar Tablet untuk pengalaman menggunakan AlgoSaham yang optimal.
          </p>
        </div>
      </div>

      {/* Desktop Interface - Hidden on mobile */}
      <div className="hidden lg:flex h-[calc(100vh-104px)]">
        {/* Left Panel - Strategy Builder */}
        <div className="w-[400px] flex-shrink-0 bg-card border-r border-border overflow-hidden flex flex-col">
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
