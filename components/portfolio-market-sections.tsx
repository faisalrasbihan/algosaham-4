"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { ColorType, createChart, LineSeries, LineStyle, type Time } from "lightweight-charts"
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  LineChart,
  List,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { SectionHeader as SystemSectionHeader } from "@/components/page-layout"

type WatchlistStock = {
  id: number
  ticker: string
  name: string
  score: number
  price: number
  day: number
  week: number
  month: number
  ma20: number
  gap52wLow: number
}

type ScreenerMatch = {
  ticker: string
  name: string
  score: number
  price: number
  change: number
  isNew?: boolean
}

type ScreenerPerformancePoint = {
  time: string
  screener: number
  benchmark: number
}

type FollowedScreener = {
  id: number
  name: string
  category: string
  summary: string
  matches: ScreenerMatch[]
  freshMatches: number
  lastRun: string
  filters: string[]
  performance: ScreenerPerformancePoint[]
  isDemo?: boolean
}

const DEMO_PERFORMANCE_DATES = [
  "2026-05-04",
  "2026-05-11",
  "2026-05-18",
  "2026-05-25",
  "2026-06-01",
  "2026-06-08",
  "2026-06-15",
  "2026-06-22",
  "2026-06-29",
  "2026-07-06",
  "2026-07-13",
  "2026-07-20",
  "2026-07-27",
  "2026-08-03",
]

const DEMO_IHSG_RETURNS = [0, 0.8, -0.3, 1.4, 2.1, 1.7, 3, 2.5, 3.4, 4, 3.6, 5.1, 5.4, 6.2]

function createDemoPerformance(screenerReturns: number[]): ScreenerPerformancePoint[] {
  return DEMO_PERFORMANCE_DATES.map((time, index) => ({
    time,
    screener: screenerReturns[index] ?? 0,
    benchmark: DEMO_IHSG_RETURNS[index] ?? 0,
  }))
}

const DEMO_SAVED_SCREENERS: FollowedScreener[] = [
  {
    id: -1,
    name: "Volume Sepi",
    category: "Setup",
    summary: "Mencari saham dengan aktivitas transaksi yang mengering sebelum potensi pergerakan berikutnya.",
    freshMatches: 2,
    lastRun: "Hari ini, 16.00",
    filters: ["Volume < 0.3× SMA20", "Volatilitas rendah"],
    performance: createDemoPerformance([0, 1.2, 0.7, 2.5, 2.1, 3.8, 4.6, 4, 5.7, 5.1, 7, 6.6, 8.2, 8.9]),
    isDemo: true,
    matches: [
      { ticker: "BBCA", name: "Bank Central Asia", score: 86, price: 9425, change: 0.8, isNew: true },
      { ticker: "TLKM", name: "Telkom Indonesia", score: 82, price: 3190, change: -0.31 },
      { ticker: "ASII", name: "Astra International", score: 79, price: 5175, change: 1.47, isNew: true },
      { ticker: "UNVR", name: "Unilever Indonesia", score: 74, price: 2180, change: 0.46 },
    ],
  },
  {
    id: -2,
    name: "Breakout Baru",
    category: "Breakout",
    summary: "Menandai saham yang baru keluar dari area konsolidasi dengan konfirmasi volume.",
    freshMatches: 1,
    lastRun: "Hari ini, 16.00",
    filters: ["Base breakout 1.5%", "Volume > 2× SMA20"],
    performance: createDemoPerformance([0, 2.1, 1.2, 4.3, 3.5, 6.4, 5.2, 8.1, 7.3, 10.6, 8.9, 11.5, 10.8, 12.7]),
    isDemo: true,
    matches: [
      { ticker: "ANTM", name: "Aneka Tambang", score: 91, price: 1885, change: 3.29, isNew: true },
      { ticker: "BRMS", name: "Bumi Resources Minerals", score: 87, price: 412, change: 2.49 },
      { ticker: "MDKA", name: "Merdeka Copper Gold", score: 81, price: 2360, change: 1.72 },
    ],
  },
  {
    id: -3,
    name: "Murah Berkualitas",
    category: "Value",
    summary: "Menyaring valuasi yang masuk akal sambil menjaga kualitas profitabilitas perusahaan.",
    freshMatches: 0,
    lastRun: "Kemarin, 16.00",
    filters: ["P/E < 10", "ROE > 12%", "DER < 1×"],
    performance: createDemoPerformance([0, 0.5, 0.2, 1.1, 1.6, 1.4, 2.3, 2.8, 2.5, 3.6, 4.1, 4.5, 5.2, 5.8]),
    isDemo: true,
    matches: [
      { ticker: "BMRI", name: "Bank Mandiri", score: 88, price: 6025, change: 0.42 },
      { ticker: "INDF", name: "Indofood Sukses Makmur", score: 83, price: 7850, change: -0.63 },
      { ticker: "KLBF", name: "Kalbe Farma", score: 78, price: 1560, change: 0.97 },
      { ticker: "ICBP", name: "Indofood CBP", score: 76, price: 11225, change: 0.22 },
    ],
  },
]

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
})

function formatPercent(value: number) {
  if (value > 0) return `+${value.toFixed(2)}%`
  if (value < 0) return `${value.toFixed(2)}%`
  return "0.00%"
}

function PercentageValue({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "font-ibm-plex-mono text-xs font-semibold",
        value > 0 && "text-emerald-700",
        value < 0 && "text-rose-600",
        value === 0 && "text-muted-foreground",
        className,
      )}
    >
      {formatPercent(value)}
    </span>
  )
}

function SectionHeading({
  id,
  title,
  description,
  aside,
}: {
  id: string
  title: string
  description: string
  aside?: React.ReactNode
}) {
  return (
    <SystemSectionHeader
      id={id}
      title={title}
      description={description}
      aside={aside}
    />
  )
}

function SummaryPill({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border/80 bg-card px-3 py-2 shadow-sm">
      <span className="text-xs text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
      {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20.1 11.85a8.1 8.1 0 0 1-11.98 7.12L4 20l1.08-3.98a8.1 8.1 0 1 1 15.02-4.17Z"
        fill="currentColor"
      />
      <path
        d="M8.18 7.55c.2-.45.42-.46.65-.47h.55c.17 0 .4.06.5.36l.7 1.7c.08.22.04.4-.07.57l-.45.57c-.14.16-.28.31-.11.59.18.28.78 1.25 1.75 2.03 1.2.96 2.15 1.27 2.5 1.42.27.12.47.1.65-.1l.88-1.04c.2-.24.43-.18.68-.09l1.64.78c.28.13.47.2.53.31.07.11.07.63-.15 1.23-.22.6-1.28 1.12-1.77 1.17-.46.05-1.05.07-1.7-.14-.4-.13-.93-.3-1.6-.59-.28-.12-2.45-.9-4.24-2.5-1.5-1.34-2.52-3-2.81-3.56-.3-.56-.03-1.7.19-2.12l.18-.32Z"
        fill="white"
      />
    </svg>
  )
}

export function WhatsAppNotificationToggle({
  sectionLabel,
  className,
}: {
  sectionLabel: string
  className?: string
}) {
  const [enabled, setEnabled] = useState(false)

  return (
    <button
      aria-label={`${enabled ? "Nonaktifkan" : "Aktifkan"} notifikasi WhatsApp untuk ${sectionLabel}`}
      aria-pressed={enabled}
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 py-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/25 focus-visible:ring-offset-2",
        enabled
          ? "border-[#25D366]/45 bg-[#effcf3] text-[#167d3e]"
          : "border-border/80 bg-card text-muted-foreground hover:border-[#25D366]/45 hover:bg-[#f7fcf8] hover:text-[#167d3e]",
        className,
      )}
      onClick={() => setEnabled((current) => !current)}
      type="button"
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <WhatsAppIcon className={cn("h-5 w-5", enabled ? "text-[#25D366]" : "text-[#829087]")} />
        {enabled ? (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#effcf3] bg-[#167d3e] text-white">
            <Check className="h-2 w-2 stroke-[3]" />
          </span>
        ) : null}
      </span>
      <span className="font-medium">WhatsApp</span>
      <span className={cn("text-[11px]", enabled ? "text-[#167d3e]" : "text-muted-foreground")}>
        {enabled ? "aktif" : "nonaktif"}
      </span>
    </button>
  )
}

function calculateMaximumDrawdown(points: ScreenerPerformancePoint[]) {
  let peak = 100
  let maximumDrawdown = 0

  points.forEach((point) => {
    const value = 100 * (1 + point.screener / 100)
    peak = Math.max(peak, value)
    maximumDrawdown = Math.min(maximumDrawdown, ((value - peak) / peak) * 100)
  })

  return maximumDrawdown
}

function getPerformanceSummary(screener: FollowedScreener) {
  const lastPoint = screener.performance.at(-1)
  const screenerReturn = lastPoint?.screener ?? null
  const benchmarkReturn = lastPoint?.benchmark ?? null

  return {
    screenerReturn,
    benchmarkReturn,
    alpha: screenerReturn !== null && benchmarkReturn !== null
      ? screenerReturn - benchmarkReturn
      : null,
    maximumDrawdown: screener.performance.length > 0
      ? calculateMaximumDrawdown(screener.performance)
      : null,
  }
}

function formatPerformance(value: number | null) {
  if (value === null) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

function performanceTone(value: number | null) {
  if (value === null || value === 0) return "text-muted-foreground"
  return value > 0 ? "text-emerald-700" : "text-rose-600"
}

function ScreenerPerformanceChart({
  points,
  screenerName,
}: {
  points: ScreenerPerformancePoint[]
  screenerName: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || points.length === 0) return

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 330,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#777b84",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: 11,
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: "rgba(46, 46, 46, 0.035)" },
        horzLines: { color: "rgba(46, 46, 46, 0.055)" },
      },
      rightPriceScale: {
        borderColor: "rgba(46, 46, 46, 0.10)",
        scaleMargins: { top: 0.14, bottom: 0.12 },
      },
      timeScale: {
        borderColor: "rgba(46, 46, 46, 0.10)",
        rightOffset: 1,
        barSpacing: 20,
        minBarSpacing: 8,
        timeVisible: false,
      },
      crosshair: {
        vertLine: { color: "rgba(42, 44, 48, 0.18)", labelBackgroundColor: "#202124" },
        horzLine: { color: "rgba(42, 44, 48, 0.12)", labelBackgroundColor: "#202124" },
      },
      localization: {
        priceFormatter: (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`,
      },
    })

    const benchmarkSeries = chart.addSeries(LineSeries, {
      title: "IHSG",
      color: "#557d79",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerRadius: 3,
    })
    const screenerSeries = chart.addSeries(LineSeries, {
      title: screenerName,
      color: "#d07225",
      lineWidth: 3,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerRadius: 4,
    })

    benchmarkSeries.setData(points.map((point) => ({ time: point.time as Time, value: point.benchmark })))
    screenerSeries.setData(points.map((point) => ({ time: point.time as Time, value: point.screener })))
    screenerSeries.createPriceLine({
      price: 0,
      color: "rgba(46, 46, 46, 0.18)",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: false,
      title: "",
    })

    chart.timeScale().fitContent()

    const observer = new ResizeObserver(([entry]) => {
      chart.applyOptions({ width: Math.floor(entry.contentRect.width) })
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      chart.remove()
    }
  }, [points, screenerName])

  return (
    <div
      ref={containerRef}
      className="h-[330px] w-full"
      aria-label={`Grafik return ${screenerName} dibandingkan IHSG`}
    />
  )
}

function StockWatchlistSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stocks, setStocks] = useState<WatchlistStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingTicker, setRemovingTicker] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch("/api/watchlist/stocks")
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.error || "Gagal memuat saham tersimpan")
        if (cancelled) return

        setStocks(result.stocks.map((stock: { id: number; ticker: string; snapshot?: Record<string, unknown> | null }) => {
          const snapshot = stock.snapshot ?? {}
          const numberValue = (key: string) => typeof snapshot[key] === "number" ? snapshot[key] as number : 0
          return {
            id: stock.id,
            ticker: stock.ticker,
            name: typeof snapshot.sector === "string" && snapshot.sector ? snapshot.sector : "Saham IDX",
            score: numberValue("score"),
            price: numberValue("price"),
            day: numberValue("day"),
            week: numberValue("week"),
            month: numberValue("month"),
            ma20: numberValue("ma20"),
            gap52wLow: numberValue("gap52wLow"),
          }
        }))
      })
      .catch((error) => {
        console.error("Failed to load portfolio stocks:", error)
        if (!cancelled) toast.error("Saham pantauan gagal dimuat")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredStocks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return stocks
    return stocks.filter(
      (stock) =>
        stock.ticker.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query),
    )
  }, [searchTerm, stocks])

  async function removeStock(ticker: string) {
    if (removingTicker) return
    setRemovingTicker(ticker)

    try {
      const response = await fetch(`/api/watchlist/stocks?ticker=${encodeURIComponent(ticker)}`, { method: "DELETE" })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || "Gagal menghapus saham")
      setStocks((current) => current.filter((stock) => stock.ticker !== ticker))
      toast.success(`${ticker} dihapus dari pantauan`)
    } catch (error) {
      console.error("Failed to remove portfolio stock:", error)
      toast.error("Saham gagal dihapus")
    } finally {
      setRemovingTicker(null)
    }
  }

  return (
    <section aria-labelledby="stock-watchlist-heading">
      <SectionHeading
        id="stock-watchlist-heading"
        title="Saham pantauan"
        description="Saham yang Anda simpan dari hasil screener, lengkap dengan snapshot saat saham ditambahkan."
        aside={(
          <div className="flex flex-wrap gap-2">
            <SummaryPill label="Tersimpan" value={stocks.length} hint="saham" />
          </div>
        )}
      />

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <label className="sr-only" htmlFor="portfolio-stock-search">
              Cari ticker atau nama saham
            </label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-[#d07225] focus:ring-2 focus:ring-[#d07225]/10"
              id="portfolio-stock-search"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari ticker atau nama..."
              type="search"
              value={searchTerm}
            />
          </div>
          <Link
            className="inline-flex h-9 items-center gap-1 self-start rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-[#d07225]/50 hover:text-[#a65b1d] sm:self-auto"
            href="/screener"
          >
            Tambah saham
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[minmax(250px,1.55fr)_84px_repeat(6,minmax(80px,0.65fr))] items-center border-b border-border/70 bg-muted/45 px-5 py-3">
              {["Saham", "Score", "Price", "1D", "5D", "1M", "MA-20", "52W Low"].map((heading, index) => (
                <div
                  key={heading}
                  className={cn(
                    "text-[11px] font-medium text-muted-foreground",
                    index > 0 && "text-right",
                  )}
                >
                  {heading}
                </div>
              ))}
            </div>

            <div>
              {filteredStocks.map((stock) => (
                <div
                  key={stock.ticker}
                  className="group grid grid-cols-[minmax(250px,1.55fr)_84px_repeat(6,minmax(80px,0.65fr))] items-center border-b border-border/60 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-muted/35"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border bg-background p-1.5">
                      <Image
                        alt={`${stock.ticker} logo`}
                        className="object-contain"
                        fill
                        sizes="40px"
                        src={`/stock_icons/${stock.ticker}.png`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          className="font-ibm-plex-mono text-sm font-bold text-foreground transition-colors hover:text-[#a65b1d]"
                          href={`/analyze-v2?ticker=${stock.ticker}`}
                        >
                          {stock.ticker}
                        </Link>
                        <button
                          aria-label={`Hapus ${stock.ticker} dari saham pantauan`}
                          className="text-[#d07225] transition hover:text-[#a65b1d] disabled:opacity-40"
                          disabled={removingTicker === stock.ticker}
                          onClick={() => void removeStock(stock.ticker)}
                          type="button"
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-md bg-muted px-2 font-ibm-plex-mono text-xs font-semibold">
                      {stock.score}
                    </span>
                  </div>
                  <div className="text-right font-ibm-plex-mono text-xs font-semibold">
                    {rupiahFormatter.format(stock.price)}
                  </div>
                  <div className="text-right"><PercentageValue value={stock.day} /></div>
                  <div className="text-right"><PercentageValue value={stock.week} /></div>
                  <div className="text-right"><PercentageValue value={stock.month} /></div>
                  <div className="text-right font-ibm-plex-mono text-xs text-foreground/80">
                    {rupiahFormatter.format(stock.ma20)}
                  </div>
                  <div className="text-right"><PercentageValue value={stock.gap52wLow} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {filteredStocks.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold">{isLoading ? "Memuat saham…" : stocks.length === 0 ? "Belum ada saham tersimpan" : "Saham tidak ditemukan"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stocks.length === 0 ? "Simpan saham dari tabel hasil Screener untuk melihatnya di sini." : "Coba ticker atau sektor yang berbeda."}
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-5 py-3 text-[11px] text-muted-foreground">
          <span>Klik ticker untuk membuka analisis lengkap.</span>
          <span className="font-ibm-plex-mono">{filteredStocks.length} / {stocks.length} tampil</span>
        </div>
      </div>
    </section>
  )
}

type ScreenerWorkspaceView = "overview" | "stocks" | "criteria"

function ScreenerMatchesList({ matches }: { matches: ScreenerMatch[] }) {
  if (matches.length === 0) {
    return (
      <div className="px-4 py-9 text-center text-sm text-muted-foreground">
        Belum ada snapshot hasil. Buka dan jalankan screener untuk memperbarui daftar saham.
      </div>
    )
  }

  return (
    <div>
      {matches.map((stock) => (
        <Link
          key={stock.ticker}
          className="group flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3 transition last:border-b-0 hover:bg-muted/35"
          href={`/analyze-v2?ticker=${stock.ticker}`}
        >
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border bg-background p-1.5">
            <Image
              alt={`${stock.ticker} logo`}
              className="object-contain"
              fill
              sizes="40px"
              src={`/stock_icons/${stock.ticker}.png`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-ibm-plex-mono text-sm font-bold">{stock.ticker}</span>
              {stock.isNew ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-ibm-plex-mono text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  New
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{stock.name}</p>
          </div>
          <div className="hidden text-right sm:block">
            <div className="font-ibm-plex-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
              Score
            </div>
            <div className="mt-0.5 font-ibm-plex-mono text-sm font-bold">{stock.score}</div>
          </div>
          <div className="w-20 text-right font-ibm-plex-mono text-xs font-semibold sm:w-24">
            {rupiahFormatter.format(stock.price)}
          </div>
          <div className="w-[70px] text-right">
            <PercentageValue value={stock.change} />
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[#a65b1d]" />
        </Link>
      ))}
    </div>
  )
}

function ScreenerWatchlistSection() {
  const [followedScreeners, setFollowedScreeners] = useState<FollowedScreener[]>([])
  const [selectedScreenerId, setSelectedScreenerId] = useState<number | null>(null)
  const [activeView, setActiveView] = useState<ScreenerWorkspaceView>("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch("/api/watchlist/screeners")
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.error || "Gagal memuat screener tersimpan")
        if (cancelled) return

        const mapped: FollowedScreener[] = result.screeners.map((screener: {
          id: number
          name: string
          description?: string | null
          category?: string | null
          filterLabels?: string[] | null
          latestMatches?: Array<Record<string, unknown>> | null
          lastRunAt?: string | null
        }) => ({
          id: screener.id,
          name: screener.name,
          category: screener.category || "Kustom",
          summary: screener.description || "Kombinasi filter screener tersimpan.",
          freshMatches: 0,
          lastRun: screener.lastRunAt
            ? new Date(screener.lastRunAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : "Belum dijalankan",
          filters: screener.filterLabels ?? [],
          performance: [],
          matches: (screener.latestMatches ?? []).map((match) => ({
            ticker: typeof match.ticker === "string" ? match.ticker : "",
            name: typeof match.sector === "string" && match.sector ? match.sector : "Saham IDX",
            score: typeof match.score === "number" ? match.score : 0,
            price: typeof match.price === "number" ? match.price : 0,
            change: typeof match.change === "number" ? match.change : 0,
          })).filter((match) => Boolean(match.ticker)),
        }))

        const screeners = mapped.length > 0 ? mapped : DEMO_SAVED_SCREENERS
        setFollowedScreeners(screeners)
        setSelectedScreenerId((current) => current ?? screeners[0]?.id ?? null)
      })
      .catch((error) => {
        console.error("Failed to load portfolio screeners:", error)
        if (!cancelled) {
          setFollowedScreeners(DEMO_SAVED_SCREENERS)
          setSelectedScreenerId(DEMO_SAVED_SCREENERS[0].id)
          toast.error("Screener tersimpan gagal dimuat; menampilkan data demo")
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const selectedScreener =
    followedScreeners.find((screener) => screener.id === selectedScreenerId) ??
    followedScreeners[0]
  const totalMatches = followedScreeners.reduce((sum, screener) => sum + screener.matches.length, 0)
  const selectedPerformance = selectedScreener ? getPerformanceSummary(selectedScreener) : null
  const overviewMatches = selectedScreener?.matches.slice(0, 4) ?? []

  async function deleteScreener() {
    if (!selectedScreener || selectedScreener.isDemo || isDeleting) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/watchlist/screeners/${selectedScreener.id}`, { method: "DELETE" })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || "Gagal menghapus screener")

      setFollowedScreeners((current) => {
        const next = current.filter((screener) => screener.id !== selectedScreener.id)
        setSelectedScreenerId(next[0]?.id ?? null)
        return next
      })
      toast.success("Screener dihapus")
    } catch (error) {
      console.error("Failed to delete saved screener:", error)
      toast.error("Screener gagal dihapus")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading || !selectedScreener) {
    return (
      <section aria-labelledby="screener-watchlist-heading">
        <SectionHeading
          id="screener-watchlist-heading"
          title="Screener tersimpan"
          description="Simpan kombinasi filter dari halaman Screener untuk membukanya kembali dengan cepat."
        />
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-semibold">{isLoading ? "Memuat screener…" : "Belum ada screener tersimpan"}</p>
          <p className="mt-1 text-sm text-muted-foreground">Screener yang Anda simpan akan muncul di sini.</p>
          {!isLoading ? (
            <Link className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-[#d07225] px-4 text-sm font-medium text-white hover:bg-[#b9631f]" href="/screener">
              Buka Screener
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="screener-watchlist-heading">
      <SectionHeading
        id="screener-watchlist-heading"
        title="Performa screener"
        description="Bandingkan screener tersimpan dengan IHSG, lalu periksa saham dan kriterianya dalam satu konteks."
        aside={(
          <div className="flex flex-wrap gap-2">
            <SummaryPill label="Tersimpan" value={followedScreeners.length} hint="screener" />
            <SummaryPill label="Terpantau" value={totalMatches} hint="saham" />
            {selectedScreener.isDemo ? <SummaryPill label="Mode" value="Preview" /> : null}
          </div>
        )}
      />

      <div className="grid overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-border/70 bg-muted/35 p-3 lg:border-b-0 lg:border-r">
          <div className="px-2 pb-3 pt-1">
            <div className="text-xs font-medium text-muted-foreground">
              Screener tersimpan
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {followedScreeners.map((screener) => {
              const isSelected = selectedScreenerId === screener.id
              const performance = getPerformanceSummary(screener)
              return (
                <button
                  key={screener.id}
                  aria-pressed={isSelected}
                  className={cn(
                    "w-full rounded-lg border p-3.5 text-left transition-all",
                    isSelected
                      ? "border-[#d07225]/40 bg-card shadow-sm"
                      : "border-transparent hover:border-border hover:bg-card/80",
                  )}
                  onClick={() => {
                    setSelectedScreenerId(screener.id)
                    setActiveView("overview")
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {screener.name}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {screener.category}
                      </div>
                    </div>
                    {screener.freshMatches > 0 ? (
                      <span className="rounded-md bg-[#d07225]/10 px-2 py-1 text-[10px] font-semibold text-[#a65b1d]">
                        +{screener.freshMatches}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-y border-border/60 py-2.5">
                    <div>
                      <div className="font-ibm-plex-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">Return</div>
                      <div className={cn("mt-1 font-ibm-plex-mono text-sm font-semibold", performanceTone(performance.screenerReturn))}>
                        {formatPerformance(performance.screenerReturn)}
                      </div>
                    </div>
                    <div>
                      <div className="font-ibm-plex-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">Alpha</div>
                      <div className={cn("mt-1 font-ibm-plex-mono text-sm font-semibold", performanceTone(performance.alpha))}>
                        {formatPerformance(performance.alpha)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between font-ibm-plex-mono text-[9px] text-muted-foreground">
                    <span>{screener.matches.length} saham</span>
                    <span>{screener.lastRun}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <Link
            className="mt-3 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-3 text-sm font-medium text-[#a65b1d] transition hover:border-[#d07225] hover:bg-card"
            href="/screener"
          >
            Simpan screener baru
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  {selectedScreener.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                  <Check className="h-3 w-3" />
                  {selectedScreener.isDemo ? "Data demo" : "Tersimpan"}
                </span>
              </div>
              <h3 className="mt-3 font-heading text-xl font-semibold tracking-tight">
                {selectedScreener.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {selectedScreener.summary}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {!selectedScreener.isDemo ? (
                <button
                  type="button"
                  onClick={() => void deleteScreener()}
                  disabled={isDeleting}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
                  aria-label={`Hapus screener ${selectedScreener.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <Link
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-[#d07225]/60 hover:text-[#a65b1d]"
                href={selectedScreener.isDemo ? "/screener" : `/screener?saved=${selectedScreener.id}`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {selectedScreener.isDemo ? "Coba screener" : "Buka screener"}
              </Link>
            </div>
          </div>

          <div className="border-b border-border/70 px-5 sm:px-6">
            <div className="flex gap-1 overflow-x-auto py-2">
              {([
                { id: "overview", label: "Overview", icon: LineChart },
                { id: "stocks", label: `Semua saham · ${selectedScreener.matches.length}`, icon: List },
                { id: "criteria", label: "Kriteria", icon: SlidersHorizontal },
              ] as const).map((view) => {
                const Icon = view.icon
                const isActive = activeView === view.id
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                      isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {view.label}
                  </button>
                )
              })}
            </div>
          </div>

          {activeView === "overview" ? (
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="font-ibm-plex-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Return ternormalisasi</div>
                  <h4 className="mt-1 text-base font-semibold">Performa vs IHSG</h4>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-[#d07225]" />{selectedScreener.name}</span>
                  <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-[#557d79]" />IHSG</span>
                  <span className="rounded-md border border-border bg-muted/30 px-2 py-1 font-ibm-plex-mono text-[9px]">3 bulan</span>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-border/70 bg-white px-1 pt-2">
                {selectedScreener.performance.length > 0 ? (
                  <ScreenerPerformanceChart key={selectedScreener.id} points={selectedScreener.performance} screenerName={selectedScreener.name} />
                ) : (
                  <div className="flex h-[330px] flex-col items-center justify-center px-6 text-center">
                    <LineChart className="h-7 w-7 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-semibold">Pelacakan performa belum dimulai</p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">Return akan tersedia setelah sistem mencatat basket awal dan harga penutupan harian screener ini.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/70 bg-border/70 sm:grid-cols-5">
                {[
                  { label: "Return", value: selectedPerformance?.screenerReturn ?? null },
                  { label: "IHSG", value: selectedPerformance?.benchmarkReturn ?? null },
                  { label: "Alpha", value: selectedPerformance?.alpha ?? null },
                  { label: "Max drawdown", value: selectedPerformance?.maximumDrawdown ?? null },
                ].map((metric) => (
                  <div key={metric.label} className="bg-card px-3 py-3.5">
                    <div className="text-[10px] text-muted-foreground">{metric.label}</div>
                    <div className={cn("mt-1 font-ibm-plex-mono text-sm font-semibold", performanceTone(metric.value))}>{formatPerformance(metric.value)}</div>
                  </div>
                ))}
                <button type="button" onClick={() => setActiveView("stocks")} className="bg-card px-3 py-3.5 text-left transition-colors hover:bg-muted/40">
                  <div className="text-[10px] text-muted-foreground">Current matches</div>
                  <div className="mt-1 flex items-center gap-1 font-ibm-plex-mono text-sm font-semibold">
                    {selectedScreener.matches.length} saham
                    <ChevronRight className="h-3.5 w-3.5 text-[#a65b1d]" />
                  </div>
                </button>
              </div>

              <div className="mt-7 flex items-end justify-between gap-4">
                <div>
                  <div className="font-ibm-plex-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current matches</div>
                  <div className="mt-1 text-sm font-medium">Saham yang lolos pada snapshot terakhir</div>
                </div>
                <button type="button" onClick={() => setActiveView("stocks")} className="text-xs font-semibold text-[#a65b1d] hover:text-[#7d4416]">Lihat semua</button>
              </div>
              <div className="mt-3 overflow-hidden rounded-lg border border-border/70">
                <ScreenerMatchesList matches={overviewMatches} />
              </div>
            </div>
          ) : null}

          {activeView === "stocks" ? (
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="font-ibm-plex-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hasil terbaru</div>
                  <h4 className="mt-1 text-base font-semibold">{selectedScreener.matches.length} saham lolos kriteria</h4>
                </div>
                <div className="font-ibm-plex-mono text-[9px] text-muted-foreground">Last run {selectedScreener.lastRun}</div>
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
                <ScreenerMatchesList matches={selectedScreener.matches} />
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">Klik saham untuk membuka analisis lengkap.</p>
            </div>
          ) : null}

          {activeView === "criteria" ? (
            <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
              <div className="rounded-lg border border-border/70 p-4">
                <div className="font-ibm-plex-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Kriteria aktif</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedScreener.filters.length > 0 ? selectedScreener.filters.map((filter) => (
                    <span key={filter} className="rounded-md border border-border bg-muted/35 px-2.5 py-1.5 font-ibm-plex-mono text-[10px] text-foreground/80">{filter}</span>
                  )) : <span className="text-sm text-muted-foreground">Tidak ada label kriteria pada snapshot ini.</span>}
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{selectedScreener.summary}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/25 p-4">
                <div className="text-sm font-semibold">Tracking</div>
                <dl className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Benchmark</dt><dd className="font-medium">IHSG</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Pembobotan</dt><dd className="font-medium">Equal weight</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Last run</dt><dd className="font-medium">{selectedScreener.lastRun}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Matches</dt><dd className="font-medium">{selectedScreener.matches.length} saham</dd></div>
                </dl>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function PortfolioMarketSections() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-14 px-4 sm:space-y-16 sm:px-6 lg:px-8">
      <ScreenerWatchlistSection />
      <StockWatchlistSection />
    </div>
  )
}
