"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { BacktestStrategyBuilder } from "@/components/backtest-strategy-builder"
import { ResultsPanel } from "@/components/results-panel"
import { useBacktest } from "@/lib/hooks/useBacktest"
import { BacktestRequest } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Monitor, GripVertical, PanelLeft, RotateCcw } from "lucide-react"

const DEFAULT_SIDEBAR_WIDTH = 460
const MIN_SIDEBAR_WIDTH = 390
const MAX_SIDEBAR_WIDTH = 620
const SIDEBAR_STORAGE_KEY = "backtest_v2_sidebar_width"

export default function BacktestV2Page() {
  const { results, loading, error, runBacktest } = useBacktest()
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (!saved) return

    const parsed = Number(saved)
    if (!Number.isNaN(parsed)) {
      setSidebarWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, parsed)))
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth))
  }, [sidebarWidth])

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!resizeRef.current) return

      const delta = event.clientX - resizeRef.current.startX
      const nextWidth = resizeRef.current.startWidth + delta
      setSidebarWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, nextWidth)))
    }

    const onMouseUp = () => {
      resizeRef.current = null
      setIsResizing(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  const handleBacktestRun = async (config: BacktestRequest, isInitial?: boolean) => {
    await runBacktest(config, isInitial)
  }

  const startResize = (event: ReactMouseEvent<HTMLButtonElement>) => {
    resizeRef.current = { startX: event.clientX, startWidth: sidebarWidth }
    setIsResizing(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  const resetSidebarWidth = () => setSidebarWidth(DEFAULT_SIDEBAR_WIDTH)

  return (
    <div className="min-h-screen bg-background dotted-background flex flex-col">
      <Navbar />
      <TickerTape />

      <div className="hidden lg:block border-b border-border/80 bg-card/70 backdrop-blur-sm">
        <div className="px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-mono text-[11px] px-2 py-0.5 bg-[#d07225]/10 text-[#d07225] border border-[#d07225]/20">
              Pro Workspace
            </Badge>
            <Badge variant="outline" className="font-mono text-[11px] px-2 py-0.5">
              Desktop-first
            </Badge>
            <Badge variant="outline" className="font-mono text-[11px] px-2 py-0.5">
              Dense Controls
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <div className="hidden xl:flex items-center gap-2 rounded-md border border-border bg-background/70 px-2.5 py-1">
              <PanelLeft className="h-3.5 w-3.5" />
              <span>Sidebar {Math.round(sidebarWidth)}px</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[11px] font-mono"
              onClick={resetSidebarWidth}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Width
            </Button>
          </div>
        </div>
      </div>

      <div className="flex lg:hidden flex-1 items-center justify-center p-6 mt-12">
        <div className="text-center max-w-md space-y-4 bg-white/60 backdrop-blur-md border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="w-16 h-16 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-orange-100">
            <Monitor className="w-8 h-8 text-[#d07225]" />
          </div>
          <h2 className="text-xl font-bold font-ibm-plex-mono text-foreground tracking-tight">
            Workspace Desktop-First
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Backtest v2 sengaja dioptimalkan untuk desktop agar builder padat, chart, dan tabel tetap terbaca untuk workflow prosumer.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Buka melalui desktop / tablet landscape untuk pengalaman penuh.
          </p>
        </div>
      </div>

      <div className="hidden lg:flex h-[calc(100vh-148px)] min-h-0">
        <div
          className="flex-shrink-0 bg-card border-r border-border overflow-hidden flex flex-col min-w-0"
          style={{ width: sidebarWidth }}
        >
          <div className="h-10 border-b border-border/80 px-4 flex items-center justify-between bg-card/95">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#d07225]" />
              <span className="text-xs font-mono font-semibold text-foreground tracking-wide">
                STRATEGY BUILDER
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">DENSE MODE</span>
          </div>
          <BacktestStrategyBuilder onRunBacktest={handleBacktestRun} backtestResults={results} />
        </div>

        <div className="relative w-3 bg-transparent group">
          <button
            type="button"
            aria-label="Resize sidebar"
            onMouseDown={startResize}
            onDoubleClick={resetSidebarWidth}
            className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 flex items-center justify-center transition-colors ${
              isResizing ? "bg-[#d07225]/10" : "hover:bg-[#d07225]/5"
            }`}
          >
            <div
              className={`h-16 w-1 rounded-full transition-colors ${
                isResizing ? "bg-[#d07225]" : "bg-border group-hover:bg-[#d07225]/60"
              }`}
            />
            <GripVertical className="absolute h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <div className="flex-1 min-w-0 overflow-hidden bg-background/40">
          <div className="h-10 border-b border-border/80 px-4 flex items-center justify-between bg-card/40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#8cbcb9]" />
              <span className="text-xs font-mono font-semibold text-foreground tracking-wide">
                RESULTS WORKSPACE
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              {loading ? "RUNNING..." : results ? "READY" : "IDLE"}
            </span>
          </div>
          <div className="h-[calc(100%-40px)] overflow-y-auto">
            <ResultsPanel backtestResults={results} loading={loading} error={error} />
          </div>
        </div>
      </div>
    </div>
  )
}
