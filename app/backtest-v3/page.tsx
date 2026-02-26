"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Monitor,
  GripVertical,
  Play,
  Save,
  Download,
  Sparkles,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  LineChart,
  Shield,
  Calendar,
  Activity,
  Bot,
  Terminal,
  Target,
  Gauge,
  BarChart3,
  Clock3,
  Zap,
  CircleDot,
  RefreshCw,
} from "lucide-react"

const DEFAULT_SIDEBAR_WIDTH = 470
const MIN_SIDEBAR_WIDTH = 400
const MAX_SIDEBAR_WIDTH = 680
const STORAGE_KEY = "backtest_v3_sidebar_width"

type SectionKey = "universe" | "signals" | "risk" | "period" | "agent"
type DensityPreset = "tight" | "standard" | "ultra"

type RunSnapshot = {
  id: string
  startedAt: Date
  elapsedMs: number
  totalReturn: number
  annualized: number
  maxDrawdown: number
  winRate: number
  trades: number
  sharpe: number
  expectancy: number
  hitStreak: number
  equityPoints: number[]
  drawdownPoints: number[]
  tradesTable: Array<{
    ticker: string
    side: "LONG"
    entry: string
    exit: string
    pnlPct: number
    holdDays: number
    tag: string
  }>
  signals: Array<{
    ticker: string
    action: "BUY" | "WATCH" | "REDUCE"
    score: number
    note: string
  }>
  runLog: string[]
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function formatPct(value: number) {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

function seededNoise(seed: number, i: number) {
  const x = Math.sin(seed * 97.31 + i * 13.17) * 10000
  return x - Math.floor(x)
}

function generateMockRun(seed: number, config: {
  stopLoss: number
  takeProfit: number
  maxHolding: number
  initialCapital: number
  selectedPreset: string
  signalCount: number
  riskLevel: number
}): RunSnapshot {
  const base = seed + config.signalCount * 11 + config.riskLevel * 7
  const totalReturn = clamp(12 + (config.takeProfit - config.stopLoss) * 0.9 + seededNoise(base, 1) * 18 - config.riskLevel * 2.5, -18, 84)
  const annualized = clamp(totalReturn * (0.7 + seededNoise(base, 2) * 0.8), -25, 95)
  const maxDrawdown = clamp(4 + config.stopLoss * 0.85 + config.riskLevel * 1.9 + seededNoise(base, 3) * 8, 3, 39)
  const winRate = clamp(44 + config.signalCount * 1.7 + seededNoise(base, 4) * 20 - config.riskLevel * 3, 31, 81)
  const trades = Math.round(clamp(18 + config.signalCount * 7 + seededNoise(base, 5) * 36, 12, 110))
  const sharpe = clamp(0.55 + totalReturn / 35 - maxDrawdown / 55 + seededNoise(base, 6) * 0.9, -0.4, 3.1)
  const expectancy = clamp((totalReturn / Math.max(trades, 1)) * (1.5 + seededNoise(base, 7)), -1.2, 2.8)
  const hitStreak = Math.round(clamp(winRate / 11 + seededNoise(base, 8) * 4, 2, 11))

  let equity = 100
  let peak = 100
  const equityPoints: number[] = []
  const drawdownPoints: number[] = []
  for (let i = 0; i < 60; i++) {
    const drift = totalReturn / 100 / 60
    const vol = (0.004 + config.riskLevel * 0.0015) * (seededNoise(base, 100 + i) - 0.45)
    equity = equity * (1 + drift + vol)
    peak = Math.max(peak, equity)
    equityPoints.push(equity)
    drawdownPoints.push(((equity - peak) / peak) * 100)
  }

  const tickerPool = ["BBCA", "BMRI", "ASII", "TLKM", "BBRI", "MDKA", "AMMN", "CPIN", "ICBP", "UNTR"]
  const tags = ["Momentum", "Breakout", "Pullback", "Reversal", "Quality", "Relative Strength"]
  const signalNotes = [
    "Volume expansion above 20D mean",
    "Trend alignment on daily + weekly",
    "Momentum fading near resistance",
    "Setup valid but liquidity spreads widen",
    "Signal quality high, timing medium",
  ]

  const tradesTable = Array.from({ length: Math.min(14, trades) }).map((_, i) => {
    const n = seededNoise(base, 200 + i)
    const pnlPct = clamp((n - 0.43) * 18 + totalReturn / 18, -12.5, 16.5)
    return {
      ticker: tickerPool[(i + Math.floor(n * 7)) % tickerPool.length],
      side: "LONG" as const,
      entry: `2025-${String((i % 9) + 1).padStart(2, "0")}-${String(((i * 3) % 27) + 1).padStart(2, "0")}`,
      exit: `2025-${String(((i % 9) + 1)).padStart(2, "0")}-${String((((i * 3) % 27) + 1) + Math.max(2, Math.round(config.maxHolding / 6))).padStart(2, "0")}`,
      pnlPct,
      holdDays: Math.max(2, Math.round(3 + seededNoise(base, 220 + i) * config.maxHolding)),
      tag: tags[i % tags.length],
    }
  })

  const signals = Array.from({ length: 8 }).map((_, i) => {
    const n = seededNoise(base, 300 + i)
    const action = n > 0.7 ? "BUY" : n > 0.4 ? "WATCH" : "REDUCE"
    return {
      ticker: tickerPool[(i * 2 + Math.floor(n * 8)) % tickerPool.length],
      action,
      score: Math.round(58 + n * 41),
      note: signalNotes[i % signalNotes.length],
    }
  })

  const periodLabel = config.selectedPreset || "Custom"
  const runLog = [
    `Universe compile: ${tickerPool.length * 13} names (preset: ${periodLabel})`,
    `Liquidity + market cap filters applied`,
    `Signal stack evaluated (${config.signalCount} rules)`,
    `Risk engine configured (SL ${config.stopLoss}%, TP ${config.takeProfit}%)`,
    `Execution simulation complete: ${trades} trades`,
    `Analytics generated in ${Math.round(900 + seededNoise(base, 400) * 1600)}ms`,
  ]

  return {
    id: `run_${Date.now()}`,
    startedAt: new Date(),
    elapsedMs: Math.round(1100 + seededNoise(base, 401) * 2400),
    totalReturn,
    annualized,
    maxDrawdown,
    winRate,
    trades,
    sharpe,
    expectancy,
    hitStreak,
    equityPoints,
    drawdownPoints,
    tradesTable,
    signals,
    runLog,
  }
}

function MiniChart({
  points,
  stroke,
  fill,
  minPad = 0.08,
}: {
  points: number[]
  stroke: string
  fill?: string
  minPad?: number
}) {
  const width = 680
  const height = 220
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = Math.max(0.0001, max - min)
  const pad = range * minPad
  const lo = min - pad
  const hi = max + pad

  const path = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * width
      const y = height - ((p - lo) / (hi - lo)) * height
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id={`grad-${stroke.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill || stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={fill || stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g opacity={0.18}>
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1={0}
            x2={width}
            y1={(height / 4) * i}
            y2={(height / 4) * i}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />
        ))}
      </g>
      {fill ? <path d={areaPath} fill={`url(#grad-${stroke.replace(/[^a-zA-Z0-9]/g, "")})`} /> : null}
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatTile({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string
  value: string
  tone?: "positive" | "negative" | "neutral"
  hint?: string
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-rose-600"
        : "text-foreground"

  return (
    <div className="rounded-lg border border-border/80 bg-card/80 px-3 py-2.5 min-h-[72px]">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-mono">{label}</div>
      <div className={`mt-1 text-lg font-semibold font-mono ${toneClass}`}>{value}</div>
      {hint ? <div className="mt-1 text-[10px] text-muted-foreground font-mono">{hint}</div> : null}
    </div>
  )
}

export default function BacktestV3Page() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<{ x: number; width: number } | null>(null)

  const [densityPreset, setDensityPreset] = useState<DensityPreset>("tight")
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    universe: false,
    signals: false,
    risk: false,
    period: false,
    agent: true,
  })

  const [marketCaps, setMarketCaps] = useState<string[]>(["large", "mid"])
  const [universeMode, setUniverseMode] = useState<"all" | "syariah" | "watchlist">("all")
  const [tickerInput, setTickerInput] = useState("BBCA, BMRI, TLKM")
  const [sectorFocus, setSectorFocus] = useState<string[]>(["Financials", "Infrastructure"])
  const [signalRules, setSignalRules] = useState([
    { id: "s1", name: "RSI(14) < 35", group: "Entry", enabled: true },
    { id: "s2", name: "Price > MA50", group: "Trend", enabled: true },
    { id: "s3", name: "Volume > 1.5x Avg20", group: "Confirmation", enabled: true },
    { id: "s4", name: "MACD Cross Up", group: "Timing", enabled: false },
  ])
  const [stopLoss, setStopLoss] = useState(7)
  const [takeProfit, setTakeProfit] = useState(18)
  const [maxHolding, setMaxHolding] = useState(14)
  const [riskLevel, setRiskLevel] = useState(2)
  const [positionSlots, setPositionSlots] = useState(8)
  const [initialCapital, setInitialCapital] = useState(100_000_000)
  const [periodPreset, setPeriodPreset] = useState("Last 1 year")
  const [startDate, setStartDate] = useState("2025-01-01")
  const [endDate, setEndDate] = useState("2025-12-31")
  const [benchmark, setBenchmark] = useState<"IHSG" | "LQ45">("IHSG")
  const [agentPrompt, setAgentPrompt] = useState("Refine this into a momentum pullback strategy with lower drawdown.")

  const [isRunning, setIsRunning] = useState(false)
  const [runSnapshot, setRunSnapshot] = useState<RunSnapshot | null>(null)
  const [runStartTs, setRunStartTs] = useState<number | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
    if (!stored) return
    const parsed = Number(stored)
    if (!Number.isNaN(parsed)) setSidebarWidth(clamp(parsed, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH))
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(sidebarWidth))
    }
  }, [sidebarWidth])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizeRef.current) return
      setSidebarWidth(clamp(resizeRef.current.width + (e.clientX - resizeRef.current.x), MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH))
    }
    const onUp = () => {
      resizeRef.current = null
      setIsResizing(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [])

  useEffect(() => {
    if (!isRunning || runStartTs == null) return
    const id = window.setInterval(() => setTick((v) => v + 1), 100)
    return () => window.clearInterval(id)
  }, [isRunning, runStartTs])

  const runElapsedText = useMemo(() => {
    if (!isRunning || runStartTs == null) return null
    return `${((Date.now() - runStartTs) / 1000).toFixed(1)}s`
  }, [isRunning, runStartTs, tick])

  const densityClass =
    densityPreset === "ultra"
      ? "space-y-2 text-[11px]"
      : densityPreset === "tight"
        ? "space-y-3 text-xs"
        : "space-y-4 text-sm"

  const toggleSection = (key: SectionKey) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))

  const toggleMarketCap = (cap: string) => {
    setMarketCaps((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]))
  }

  const runSimulation = async () => {
    if (isRunning) return
    setIsRunning(true)
    setRunStartTs(Date.now())

    const seed = Date.now() % 100000
    const next = generateMockRun(seed, {
      stopLoss,
      takeProfit,
      maxHolding,
      initialCapital,
      selectedPreset: periodPreset,
      signalCount: signalRules.filter((s) => s.enabled).length,
      riskLevel,
    })

    await new Promise((resolve) => setTimeout(resolve, 1100))
    setRunSnapshot(next)
    setIsRunning(false)
    setRunStartTs(null)
  }

  const startResize = (e: ReactMouseEvent<HTMLButtonElement>) => {
    resizeRef.current = { x: e.clientX, width: sidebarWidth }
    setIsResizing(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  const sectionHeader = (
    key: SectionKey,
    title: string,
    icon: React.ReactNode,
    count?: string,
  ) => (
    <button
      type="button"
      onClick={() => toggleSection(key)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/70 bg-card/60 hover:bg-card transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-6 w-6 rounded-md border border-border bg-background/80 flex items-center justify-center text-[#d07225]">
          {icon}
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">{title}</span>
        {count ? (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#d07225]/10 text-[#d07225] border border-[#d07225]/20">
            {count}
          </span>
        ) : null}
      </div>
      {collapsed[key] ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
    </button>
  )

  return (
    <div className="min-h-screen bg-background dotted-background flex flex-col">
      <Navbar />
      <TickerTape />

      <div className="hidden lg:flex items-center justify-between gap-3 px-4 py-2 border-b border-border/80 bg-card/70 backdrop-blur-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="font-mono text-[10px] bg-[#d07225] text-white hover:bg-[#d07225]">BACKTEST V3</Badge>
          <Badge variant="outline" className="font-mono text-[10px]">DESKTOP WORKSPACE</Badge>
          <Badge variant="outline" className="font-mono text-[10px]">PROSUMER DENSE UI</Badge>
          <Badge variant="outline" className="font-mono text-[10px]">MONO-FIRST</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-2 px-2 py-1 rounded-md border border-border bg-background/70 text-[10px] font-mono text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" />
            <span>Sidebar {Math.round(sidebarWidth)}px</span>
          </div>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {(["ultra", "tight", "standard"] as DensityPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => setDensityPreset(preset)}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide transition-colors ${
                  densityPreset === preset
                    ? "bg-[#d07225] text-white"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex lg:hidden flex-1 items-center justify-center p-6 mt-12">
        <div className="text-center max-w-md space-y-4 bg-white/60 backdrop-blur-md border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="w-16 h-16 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-orange-100">
            <Monitor className="w-8 h-8 text-[#d07225]" />
          </div>
          <h2 className="text-xl font-bold font-ibm-plex-mono text-foreground tracking-tight">Desktop-Only Trading Workspace</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Backtest v3 dirancang sebagai workstation prosumer dengan kontrol padat, tabel detail, dan panel analitik paralel.
          </p>
          <p className="text-xs text-muted-foreground font-mono">Gunakan desktop / tablet landscape untuk full workspace.</p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 min-h-0">
        <aside
          className="flex-shrink-0 min-w-0 border-r border-border/80 bg-card/75 backdrop-blur-sm flex flex-col"
          style={{ width: sidebarWidth }}
        >
          <div className="px-3 py-2 border-b border-border/70 bg-card/80">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-mono">Strategy Console</div>
                <div className="text-sm font-semibold font-mono text-foreground mt-0.5">Builder Stack</div>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono text-muted-foreground">ready</span>
              </div>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto p-3 ${densityClass}`}>
            <Card className="border-border/70 bg-background/40 shadow-none">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Profile</div>
                    <div className="mt-1 text-sm font-semibold font-mono">Momentum Pullback ID</div>
                    <div className="mt-1 text-[11px] text-muted-foreground font-mono">
                      Liquid IDX names, trend filter, mean-reversion trigger
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] font-mono">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Refine
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {sectionHeader("universe", "Universe", <SlidersHorizontal className="h-3.5 w-3.5" />, `${marketCaps.length} CAPS`)}
              {!collapsed.universe ? (
                <div className="rounded-lg border border-border/70 bg-card/40 p-3 space-y-3">
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Market Cap Filters</Label>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {["small", "mid", "large"].map((cap) => (
                        <button
                          key={cap}
                          onClick={() => toggleMarketCap(cap)}
                          className={`px-2 py-1 rounded-md border text-[11px] font-mono transition-colors ${
                            marketCaps.includes(cap)
                              ? "border-[#d07225]/40 bg-[#d07225]/10 text-[#d07225]"
                              : "border-border bg-background/70 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {cap.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Universe Mode</Label>
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      {[
                        { key: "all", label: "ALL" },
                        { key: "syariah", label: "SYR" },
                        { key: "watchlist", label: "WL" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setUniverseMode(item.key as typeof universeMode)}
                          className={`h-8 rounded-md border text-[11px] font-mono ${
                            universeMode === item.key
                              ? "border-[#d07225]/40 bg-[#d07225]/10 text-[#d07225]"
                              : "border-border bg-background/70 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Ticker Scope</Label>
                    <Input
                      value={tickerInput}
                      onChange={(e) => setTickerInput(e.target.value)}
                      className="mt-2 h-8 font-mono text-xs bg-background/80 border-border"
                    />
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sectorFocus.map((sector) => (
                        <button
                          key={sector}
                          onClick={() => setSectorFocus((prev) => prev.filter((s) => s !== sector))}
                          className="px-1.5 py-0.5 rounded border border-[#8cbcb9]/30 bg-[#8cbcb9]/10 text-[#4f8783] text-[10px] font-mono"
                        >
                          {sector}
                        </button>
                      ))}
                      <button
                        onClick={() => setSectorFocus((prev) => prev.concat("Technology").slice(-3))}
                        className="px-1.5 py-0.5 rounded border border-dashed border-border text-[10px] font-mono text-muted-foreground hover:text-foreground"
                      >
                        + Sector
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              {sectionHeader("signals", "Signal Stack", <Target className="h-3.5 w-3.5" />, `${signalRules.filter((s) => s.enabled).length} ON`)}
              {!collapsed.signals ? (
                <div className="rounded-lg border border-border/70 bg-card/40 p-3 space-y-2">
                  {signalRules.map((rule) => (
                    <div key={rule.id} className="rounded-md border border-border/60 bg-background/60 px-2.5 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-foreground truncate">{rule.name}</div>
                          <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">{rule.group}</div>
                        </div>
                        <button
                          onClick={() =>
                            setSignalRules((prev) =>
                              prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)),
                            )
                          }
                          className={`h-6 min-w-[54px] px-2 rounded border text-[10px] font-mono ${
                            rule.enabled
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                              : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          {rule.enabled ? "ENABLED" : "OFF"}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="h-8 text-[10px] font-mono justify-start"
                      onClick={() =>
                        setSignalRules((prev) => [
                          ...prev,
                          {
                            id: `s${prev.length + 1}`,
                            name: "ADX(14) > 20",
                            group: "Strength",
                            enabled: true,
                          },
                        ])
                      }
                    >
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      Add Rule
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 text-[10px] font-mono justify-start"
                      onClick={() => setSignalRules((prev) => prev.map((r, i) => ({ ...r, enabled: i < 3 })))}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Reset Stack
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              {sectionHeader("risk", "Risk Engine", <Shield className="h-3.5 w-3.5" />, `R${riskLevel}`)}
              {!collapsed.risk ? (
                <div className="rounded-lg border border-border/70 bg-card/40 p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Stop Loss %</Label>
                      <Input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(Number(e.target.value || 0))}
                        className="mt-1 h-8 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Take Profit %</Label>
                      <Input
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(Number(e.target.value || 0))}
                        className="mt-1 h-8 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Max Hold (D)</Label>
                      <Input
                        type="number"
                        value={maxHolding}
                        onChange={(e) => setMaxHolding(Number(e.target.value || 1))}
                        className="mt-1 h-8 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Slots</Label>
                      <Input
                        type="number"
                        value={positionSlots}
                        onChange={(e) => setPositionSlots(Number(e.target.value || 1))}
                        className="mt-1 h-8 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span>Risk Aggression</span>
                      <span>R{riskLevel}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(Number(e.target.value))}
                      className="w-full mt-2 accent-[#d07225]"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Initial Capital (IDR)</Label>
                    <Input
                      value={initialCapital.toLocaleString("id-ID")}
                      onChange={(e) => {
                        const n = Number(e.target.value.replace(/\./g, "").replace(/,/g, ""))
                        if (!Number.isNaN(n)) setInitialCapital(n)
                      }}
                      className="mt-1 h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              {sectionHeader("period", "Backtest Window", <Calendar className="h-3.5 w-3.5" />, benchmark)}
              {!collapsed.period ? (
                <div className="rounded-lg border border-border/70 bg-card/40 p-3 space-y-3">
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Preset Range</Label>
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {["3M", "6M", "1Y", "2Y"].map((label) => (
                        <button
                          key={label}
                          onClick={() => setPeriodPreset(`Last ${label === "1Y" || label === "2Y" ? `${label[0]} year${label === "2Y" ? "s" : ""}` : `${label[0]} months`}`)}
                          className={`h-8 rounded-md border text-[11px] font-mono ${
                            periodPreset.includes(label[0]) || (label === "1Y" && periodPreset.includes("1 year"))
                              ? "border-[#d07225]/40 bg-[#d07225]/10 text-[#d07225]"
                              : "border-border bg-background/70 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Start</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 h-8 font-mono text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">End</Label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 h-8 font-mono text-xs" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-border/70 bg-background/70 p-1">
                    {(["IHSG", "LQ45"] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBenchmark(b)}
                        className={`h-7 flex-1 rounded text-[11px] font-mono ${
                          benchmark === b ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              {sectionHeader("agent", "Agent Prompt", <Bot className="h-3.5 w-3.5" />)}
              {!collapsed.agent ? (
                <div className="rounded-lg border border-border/70 bg-card/40 p-3 space-y-2">
                  <textarea
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    className="w-full min-h-[84px] rounded-md border border-border bg-background/80 px-2.5 py-2 text-xs font-mono resize-y outline-none focus:ring-2 focus:ring-[#d07225]/30"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-8 text-[10px] font-mono justify-start">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Generate Rules
                    </Button>
                    <Button variant="outline" className="h-8 text-[10px] font-mono justify-start">
                      <Bot className="h-3.5 w-3.5 mr-1.5" />
                      Explain Risk
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-border/70 p-3 bg-card/90">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <Button
                onClick={runSimulation}
                disabled={isRunning}
                className="h-10 bg-[#d07225] hover:bg-[#b76621] text-white font-mono text-xs tracking-wide"
              >
                {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? `RUNNING ${runElapsedText ?? ""}` : "RUN BACKTEST"}
              </Button>
              <Button variant="outline" className="h-10 px-3 font-mono text-xs">
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-10 px-3 font-mono text-xs">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>{signalRules.filter((s) => s.enabled).length} active rules</span>
              <span>{marketCaps.length} cap buckets</span>
              <span>{positionSlots} slots</span>
            </div>
          </div>
        </aside>

        <div className="relative w-3 group">
          <button
            type="button"
            aria-label="Resize sidebar"
            onMouseDown={startResize}
            className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 ${isResizing ? "bg-[#d07225]/10" : "hover:bg-[#d07225]/5"}`}
          >
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-1 rounded-full ${isResizing ? "bg-[#d07225]" : "bg-border group-hover:bg-[#d07225]/60"}`} />
            <GripVertical className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <main className="flex-1 min-w-0 bg-background/40 flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-border/80 bg-card/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-mono">Results Workspace</div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-sm font-semibold font-mono text-foreground">Simulation Output Grid</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {isRunning ? "RUNNING" : runSnapshot ? "READY" : "IDLE"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <div className="hidden xl:flex items-center gap-1.5">
                  <CircleDot className={`h-3.5 w-3.5 ${isRunning ? "text-[#d07225]" : "text-emerald-500"}`} />
                  <span>{isRunning ? "Engine active" : "Engine standby"}</span>
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{runSnapshot ? runSnapshot.startedAt.toLocaleTimeString() : "--:--:--"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5" />
                  <span>{benchmark}</span>
                </div>
              </div>
            </div>
          </div>

          {!runSnapshot && !isRunning ? (
            <div className="flex-1 min-h-0 p-4">
              <div className="h-full rounded-2xl border border-dashed border-border bg-card/35 flex items-center justify-center">
                <div className="max-w-xl text-center px-6">
                  <div className="mx-auto h-14 w-14 rounded-2xl border border-[#d07225]/20 bg-[#d07225]/10 flex items-center justify-center mb-4">
                    <LineChart className="h-7 w-7 text-[#d07225]" />
                  </div>
                  <h3 className="text-lg font-semibold font-mono text-foreground">Run a simulation to populate the analytics grid</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Backtest v3 keeps a dense prosumer layout, but uses clearer zoning: builder console on the left, analytics grid on the right.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-[10px]">Performance Curve</Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">Drawdown</Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">Signal Queue</Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">Trade Blotter</Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">Run Log</Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <StatTile label="Total Return" value={runSnapshot ? formatPct(runSnapshot.totalReturn) : "--"} tone={runSnapshot && runSnapshot.totalReturn >= 0 ? "positive" : "negative"} hint="Portfolio result" />
                <StatTile label="Annualized" value={runSnapshot ? formatPct(runSnapshot.annualized) : "--"} tone={runSnapshot && runSnapshot.annualized >= 0 ? "positive" : "negative"} hint="CAGR estimate" />
                <StatTile label="Max Drawdown" value={runSnapshot ? `${runSnapshot.maxDrawdown.toFixed(1)}%` : "--"} tone="negative" hint="Peak-to-trough" />
                <StatTile label="Win Rate" value={runSnapshot ? `${runSnapshot.winRate.toFixed(1)}%` : "--"} tone={runSnapshot && runSnapshot.winRate >= 50 ? "positive" : "negative"} hint={`${runSnapshot?.trades ?? 0} trades`} />
                <StatTile label="Sharpe" value={runSnapshot ? runSnapshot.sharpe.toFixed(2) : "--"} tone={runSnapshot && runSnapshot.sharpe >= 1 ? "positive" : "neutral"} />
                <StatTile label="Expectancy" value={runSnapshot ? `${runSnapshot.expectancy.toFixed(2)}R` : "--"} tone={runSnapshot && runSnapshot.expectancy >= 0 ? "positive" : "negative"} />
                <StatTile label="Hit Streak" value={runSnapshot ? `${runSnapshot.hitStreak}` : "--"} tone="neutral" hint="Max consecutive wins" />
                <StatTile label="Latency" value={runSnapshot ? `${runSnapshot.elapsedMs}ms` : isRunning ? `${runElapsedText}` : "--"} tone="neutral" hint="Simulation engine" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card className="xl:col-span-2 border-border/80 bg-card/75 shadow-none">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#d07225]" />
                        Equity Curve
                      </CardTitle>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        Capital: Rp {initialCapital.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px] rounded-lg border border-border/70 bg-background/55 p-3">
                      {isRunning ? (
                        <div className="h-full flex items-center justify-center text-xs font-mono text-muted-foreground">
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Computing portfolio path {runElapsedText}
                        </div>
                      ) : runSnapshot ? (
                        <MiniChart points={runSnapshot.equityPoints} stroke="#d07225" fill="#d07225" />
                      ) : null}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
                      <div className="rounded border border-border/70 bg-background/60 p-2">
                        <div className="text-muted-foreground">Benchmark</div>
                        <div className="mt-1 text-foreground">{benchmark}</div>
                      </div>
                      <div className="rounded border border-border/70 bg-background/60 p-2">
                        <div className="text-muted-foreground">Period</div>
                        <div className="mt-1 text-foreground truncate">{periodPreset}</div>
                      </div>
                      <div className="rounded border border-border/70 bg-background/60 p-2">
                        <div className="text-muted-foreground">Rules Active</div>
                        <div className="mt-1 text-foreground">{signalRules.filter((r) => r.enabled).length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/80 bg-card/75 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-[#8cbcb9]" />
                      Drawdown + Queue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-[120px] rounded-lg border border-border/70 bg-background/55 p-2">
                      {isRunning ? (
                        <div className="h-full flex items-center justify-center text-[11px] font-mono text-muted-foreground">
                          Updating drawdown profile...
                        </div>
                      ) : runSnapshot ? (
                        <MiniChart points={runSnapshot.drawdownPoints} stroke="#8cbcb9" fill="#8cbcb9" minPad={0.02} />
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">Signal Queue</div>
                      {(runSnapshot?.signals ?? []).map((s, i) => (
                        <div key={`${s.ticker}-${i}`} className="rounded-md border border-border/70 bg-background/55 px-2.5 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-mono text-foreground">{s.ticker}</div>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                                s.action === "BUY"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                  : s.action === "WATCH"
                                    ? "border-[#d07225]/30 bg-[#d07225]/10 text-[#d07225]"
                                    : "border-rose-500/30 bg-rose-500/10 text-rose-600"
                              }`}
                            >
                              {s.action}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] font-mono text-muted-foreground">Score {s.score} • {s.note}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card className="xl:col-span-2 border-border/80 bg-card/75 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-[#d07225]" />
                      Trade Blotter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border/70 overflow-hidden">
                      <div className="grid grid-cols-[72px_64px_110px_110px_80px_70px_1fr] gap-0 bg-card px-2 py-2 border-b border-border/70 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                        <div>Ticker</div>
                        <div>Side</div>
                        <div>Entry</div>
                        <div>Exit</div>
                        <div>PnL</div>
                        <div>Hold</div>
                        <div>Tag</div>
                      </div>
                      <div className="max-h-[360px] overflow-y-auto bg-background/45">
                        {(runSnapshot?.tradesTable ?? []).map((trade, idx) => (
                          <div
                            key={`${trade.ticker}-${idx}`}
                            className="grid grid-cols-[72px_64px_110px_110px_80px_70px_1fr] gap-0 px-2 py-2 border-b border-border/40 text-[11px] font-mono hover:bg-card/50"
                          >
                            <div className="text-foreground">{trade.ticker}</div>
                            <div className="text-muted-foreground">{trade.side}</div>
                            <div className="text-muted-foreground">{trade.entry}</div>
                            <div className="text-muted-foreground">{trade.exit}</div>
                            <div className={trade.pnlPct >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatPct(trade.pnlPct)}</div>
                            <div className="text-muted-foreground">{trade.holdDays}d</div>
                            <div className="text-foreground truncate">{trade.tag}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/80 bg-card/75 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-[#8cbcb9]" />
                      Run Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(isRunning
                      ? [
                          "Universe compile queued...",
                          "Signal stack execution in progress...",
                          "Risk model calibration running...",
                          `Elapsed ${runElapsedText ?? "0.0s"}`,
                        ]
                      : runSnapshot?.runLog ?? []
                    ).map((line, idx) => (
                      <div key={`${line}-${idx}`} className="rounded-md border border-border/70 bg-background/55 px-2.5 py-2">
                        <div className="flex items-start gap-2">
                          <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isRunning && idx === 1 ? "bg-[#d07225]" : "bg-[#8cbcb9]"}`} />
                          <span className="text-[11px] font-mono text-foreground leading-relaxed">{line}</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-1 text-[10px] font-mono text-muted-foreground">
                      Workspace mode: dense / desktop / mono / split-layout
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
