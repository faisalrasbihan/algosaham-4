"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  Bell,
  BellOff,
  Check,
  ChevronRight,
  Flame,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { SectionHeader as SystemSectionHeader } from "@/components/page-layout"

type MarketPeriod = {
  id: string
  label: string
  change: number
  points: number[]
}

type WatchlistStock = {
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

type FollowedScreener = {
  id: string
  name: string
  category: string
  summary: string
  matches: ScreenerMatch[]
  freshMatches: number
  lastRun: string
  filters: string[]
}

const marketPeriods: MarketPeriod[] = [
  {
    id: "1D",
    label: "1D",
    change: 0.74,
    points: [7248, 7276, 7264, 7271, 7292, 7286, 7304, 7317, 7309, 7326],
  },
  {
    id: "5D",
    label: "5D",
    change: 1.91,
    points: [7188, 7212, 7199, 7238, 7251, 7243, 7280, 7296, 7311, 7326],
  },
  {
    id: "1M",
    label: "1M",
    change: -0.63,
    points: [7372, 7358, 7381, 7340, 7317, 7334, 7301, 7287, 7310, 7326],
  },
  {
    id: "6M",
    label: "6M",
    change: 8.2,
    points: [6772, 6841, 6903, 6888, 7035, 7104, 7071, 7192, 7278, 7326],
  },
  {
    id: "YTD",
    label: "YTD",
    change: 4.85,
    points: [6987, 7042, 7011, 7108, 7160, 7138, 7212, 7254, 7289, 7326],
  },
  {
    id: "1Y",
    label: "1Y",
    change: 12.43,
    points: [6516, 6634, 6701, 6878, 6952, 7018, 7142, 7089, 7240, 7326],
  },
]

const watchlistStocks: WatchlistStock[] = [
  {
    ticker: "BBRI",
    name: "Bank Rakyat Indonesia",
    score: 88,
    price: 4820,
    day: 1.05,
    week: 3.1,
    month: 5.82,
    ma20: 4694,
    gap52wLow: 18.44,
  },
  {
    ticker: "BBCA",
    name: "Bank Central Asia",
    score: 84,
    price: 10150,
    day: 0.5,
    week: 1.75,
    month: 3.31,
    ma20: 9972,
    gap52wLow: 15.08,
  },
  {
    ticker: "TLKM",
    name: "Telkom Indonesia",
    score: 81,
    price: 3110,
    day: -0.64,
    week: 2.3,
    month: 4.01,
    ma20: 3048,
    gap52wLow: 12.27,
  },
  {
    ticker: "ANTM",
    name: "Aneka Tambang",
    score: 78,
    price: 1685,
    day: 2.12,
    week: 4.66,
    month: 8.01,
    ma20: 1609,
    gap52wLow: 24.81,
  },
  {
    ticker: "GOTO",
    name: "GoTo Gojek Tokopedia",
    score: 72,
    price: 69,
    day: -1.43,
    week: 0,
    month: -2.82,
    ma20: 70,
    gap52wLow: 9.52,
  },
]

const followedScreeners: FollowedScreener[] = [
  {
    id: "undervalued-quality",
    name: "Murah Berkualitas",
    category: "Value",
    summary: "Valuasi masih masuk akal, sementara kualitas bisnis tetap terjaga.",
    freshMatches: 2,
    lastRun: "10 menit lalu",
    filters: ["PE ≤ 8", "ROE ≥ 12", "SMA Trend"],
    matches: [
      { ticker: "BSSR", name: "Baramulti Suksessarana", score: 86, price: 4290, change: 0.23, isNew: true },
      { ticker: "TSPC", name: "Tempo Scan Pacific", score: 79, price: 2580, change: -0.39 },
      { ticker: "BFIN", name: "BFI Finance Indonesia", score: 74, price: 785, change: 0, isNew: true },
    ],
  },
  {
    id: "fresh-breakout-base",
    name: "Breakout Baru",
    category: "Momentum",
    summary: "Harga baru meninggalkan area konsolidasi dengan konfirmasi yang cukup.",
    freshMatches: 3,
    lastRun: "5 menit lalu",
    filters: ["Base 20D", "Breakout ≥ 1.5%", "Volume ≥ 1.5×"],
    matches: [
      { ticker: "ANTM", name: "Aneka Tambang", score: 91, price: 1685, change: 2.12, isNew: true },
      { ticker: "ADRO", name: "Alamtri Resources", score: 85, price: 2470, change: 1.44, isNew: true },
      { ticker: "BBRI", name: "Bank Rakyat Indonesia", score: 77, price: 4820, change: 1.05, isNew: true },
    ],
  },
  {
    id: "calm-volume-dry-up",
    name: "Volume Sepi",
    category: "Setup",
    summary: "Transaksi menyusut dan volatilitas mereda sebelum potensi pergerakan baru.",
    freshMatches: 1,
    lastRun: "1 jam lalu",
    filters: ["Volume Dry-up", "Low Volatility", "Range 20D"],
    matches: [
      { ticker: "BBCA", name: "Bank Central Asia", score: 82, price: 10150, change: 0.5 },
      { ticker: "TLKM", name: "Telkom Indonesia", score: 76, price: 3110, change: -0.64, isNew: true },
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

function MarketChart({ points }: { points: number[] }) {
  const width = 760
  const height = 250
  const inset = 12
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = Math.max(max - min, 1)
  const coordinates = points.map((point, index) => {
    const x = inset + (index / (points.length - 1)) * (width - inset * 2)
    const y = inset + ((max - point) / range) * (height - inset * 2)
    return { x, y }
  })
  const line = coordinates.map(({ x, y }) => `${x},${y}`).join(" ")
  const area = `${coordinates[0].x},${height} ${line} ${coordinates[coordinates.length - 1].x},${height}`

  return (
    <div className="relative h-[250px] w-full">
      <svg
        aria-label="Grafik pergerakan IHSG"
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <linearGradient id="portfolio-market-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5e9a82" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#5e9a82" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            stroke="#ece8e1"
            strokeDasharray="3 7"
            strokeWidth="1"
            x1="0"
            x2={width}
            y1={height * ratio}
            y2={height * ratio}
          />
        ))}
        <polygon fill="url(#portfolio-market-area)" points={area} />
        <polyline
          fill="none"
          points={line}
          stroke="#4d8a72"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={coordinates[coordinates.length - 1].x}
          cy={coordinates[coordinates.length - 1].y}
          fill="#fffdf9"
          r="5"
          stroke="#4d8a72"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="pointer-events-none absolute inset-x-1 bottom-0 flex justify-between font-ibm-plex-mono text-[9px] text-muted-foreground sm:text-[10px]">
        {["09:00", "10:30", "12:00", "14:30", "16:00"].map((time) => (
          <span key={time}>{time}</span>
        ))}
      </div>
    </div>
  )
}

function IhsgIndexSection() {
  const [selectedPeriod, setSelectedPeriod] = useState("1D")
  const activePeriod = marketPeriods.find((period) => period.id === selectedPeriod) ?? marketPeriods[0]

  return (
    <section aria-labelledby="ihsg-index-heading">
      <SectionHeading
        id="ihsg-index-heading"
        title="Ringkasan IHSG"
        description="Ringkasan kondisi pasar untuk membantu membaca sinyal pada strategi dan saham yang sedang kamu pantau."
        aside={(
          <div className="flex flex-wrap gap-2">
            <SummaryPill label="Composite" value="IDX:IHSG" />
            <SummaryPill label="Session" value="Open" hint="09:00–16:00 WIB" />
            <SummaryPill label="Sync" value="16:00" hint="WIB" />
          </div>
        )}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <article className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                IHSG · Jakarta Composite
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  7.326,12
                </span>
                <PercentageValue className="text-sm" value={activePeriod.change} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Penutupan sebelumnya 7.272,30</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-700/20 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              Bullish intraday
            </div>
          </div>

          <div className="px-4 pb-4 pt-2 sm:px-6">
            <MarketChart points={activePeriod.points} />
            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
              {marketPeriods.map((period) => {
                const isActive = selectedPeriod === period.id
                return (
                  <button
                    key={period.id}
                    aria-pressed={isActive}
                    className={cn(
                      "rounded-md border px-2 py-2 text-center transition-colors",
                      isActive
                        ? "border-[#d07225]/50 bg-[#d07225]/8"
                        : "border-transparent hover:border-border hover:bg-muted/60",
                    )}
                    onClick={() => setSelectedPeriod(period.id)}
                    type="button"
                  >
                    <span className="block font-ibm-plex-mono text-[10px] font-semibold text-foreground">
                      {period.label}
                    </span>
                    <PercentageValue className="mt-1 block text-[10px]" value={period.change} />
                  </button>
                )
              })}
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Flame className="h-4 w-4 text-[#d07225]" />
            Market pulse
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: "Volume", value: "12,4B", hint: "lot hari ini" },
              { label: "Value", value: "Rp 9,8T", hint: "nilai transaksi" },
              { label: "Advancers", value: "312", hint: "saham naik", tone: "positive" },
              { label: "Decliners", value: "241", hint: "saham turun", tone: "negative" },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border border-border/70 bg-muted/25 p-4">
                <div className="text-xs font-medium text-muted-foreground">
                  {metric.label}
                </div>
                <div
                  className={cn(
                    "mt-2 font-heading text-2xl font-semibold tracking-tight",
                    metric.tone === "positive" && "text-emerald-700",
                    metric.tone === "negative" && "text-rose-600",
                    !metric.tone && "text-foreground",
                  )}
                >
                  {metric.value}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{metric.hint}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-border/70 pt-5 text-sm leading-5 text-foreground/80">
            <div className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
              Energi memimpin penguatan, didukung saham komoditas.
            </div>
            <div className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
              Properti tertahan di tengah sentimen suku bunga.
            </div>
            <div className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#d07225]" />
              Arus dana asing masih mencatatkan net buy.
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function StockWatchlistSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [favorites, setFavorites] = useState(() => new Set(["BBRI", "ANTM"]))
  const [alerts, setAlerts] = useState(() => new Set(["BBRI", "TLKM"]))

  const filteredStocks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return watchlistStocks
    return watchlistStocks.filter(
      (stock) =>
        stock.ticker.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query),
    )
  }, [searchTerm])

  function toggleSet(
    ticker: string,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
  ) {
    setter((current) => {
      const next = new Set(current)
      if (next.has(ticker)) next.delete(ticker)
      else next.add(ticker)
      return next
    })
  }

  return (
    <section aria-labelledby="stock-watchlist-heading">
      <SectionHeading
        id="stock-watchlist-heading"
        title="Saham pantauan"
        description="Saham yang kamu ikuti, disusun agar perubahan harga, score, dan posisi terhadap tren bisa dipindai dalam sekali lihat."
        aside={(
          <div className="flex flex-wrap gap-2">
            <SummaryPill label="Followed" value={watchlistStocks.length} hint="saham" />
            <SummaryPill label="Alerts On" value={alerts.size} hint="aktif" />
            <WhatsAppNotificationToggle sectionLabel="stock watchlist" />
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
                          aria-label={`${favorites.has(stock.ticker) ? "Hapus" : "Tambah"} ${stock.ticker} dari favorit`}
                          className="text-muted-foreground transition hover:text-[#d07225]"
                          onClick={() => toggleSet(stock.ticker, setFavorites)}
                          type="button"
                        >
                          <Star
                            className={cn("h-3.5 w-3.5", favorites.has(stock.ticker) && "fill-[#d07225] text-[#d07225]")}
                          />
                        </button>
                        <button
                          aria-label={`${alerts.has(stock.ticker) ? "Matikan" : "Aktifkan"} alert ${stock.ticker}`}
                          className="text-muted-foreground transition hover:text-[#487b78]"
                          onClick={() => toggleSet(stock.ticker, setAlerts)}
                          type="button"
                        >
                          {alerts.has(stock.ticker) ? (
                            <Bell className="h-3.5 w-3.5 fill-[#487b78]/20 text-[#487b78]" />
                          ) : (
                            <BellOff className="h-3.5 w-3.5" />
                          )}
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
            <p className="font-ibm-plex-mono text-sm font-semibold">Saham tidak ditemukan</p>
            <p className="mt-1 text-xs text-muted-foreground">Coba ticker atau nama emiten yang berbeda.</p>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-5 py-3 text-[11px] text-muted-foreground">
          <span>Klik ticker untuk membuka analisis lengkap.</span>
          <span className="font-ibm-plex-mono">{filteredStocks.length} / {watchlistStocks.length} shown</span>
        </div>
      </div>
    </section>
  )
}

function ScreenerWatchlistSection() {
  const [selectedScreenerId, setSelectedScreenerId] = useState(followedScreeners[0].id)
  const selectedScreener =
    followedScreeners.find((screener) => screener.id === selectedScreenerId) ??
    followedScreeners[0]
  const totalMatches = followedScreeners.reduce((sum, screener) => sum + screener.matches.length, 0)
  const totalFreshMatches = followedScreeners.reduce((sum, screener) => sum + screener.freshMatches, 0)

  return (
    <section aria-labelledby="screener-watchlist-heading">
      <SectionHeading
        id="screener-watchlist-heading"
        title="Screener tersimpan"
        description="Screener yang kamu ikuti diringkas menjadi daftar sinyal, sehingga perubahan penting tidak tenggelam di antara seluruh saham."
        aside={(
          <div className="flex flex-wrap gap-2">
            <SummaryPill label="Followed" value={followedScreeners.length} hint="screeners" />
            <SummaryPill label="Matches" value={totalMatches} hint="saham" />
            <SummaryPill label="New Today" value={totalFreshMatches} hint="sinyal" />
            <WhatsAppNotificationToggle sectionLabel="screener watchlist" />
          </div>
        )}
      />

      <div className="grid overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="border-b border-border/70 bg-muted/35 p-3 lg:border-b-0 lg:border-r">
          <div className="px-2 pb-3 pt-1">
            <div className="text-xs font-medium text-muted-foreground">
              Screener diikuti
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {followedScreeners.map((screener) => {
              const isSelected = selectedScreenerId === screener.id
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
                  onClick={() => setSelectedScreenerId(screener.id)}
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
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {screener.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between font-ibm-plex-mono text-[9px] text-muted-foreground">
                    <span>{screener.matches.length} matches</span>
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
            Ikuti screener baru
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
                <span className="inline-flex items-center gap-1 font-ibm-plex-mono text-[9px] text-emerald-700">
                  <Check className="h-3 w-3" />
                  Followed
                </span>
              </div>
              <h3 className="mt-3 font-heading text-xl font-semibold tracking-tight">
                {selectedScreener.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {selectedScreener.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedScreener.filters.map((filter) => (
                  <span
                    key={filter}
                    className="rounded-md border border-border bg-muted/35 px-2.5 py-1 font-ibm-plex-mono text-[10px] text-foreground/75"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>
            <Link
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-[#d07225]/60 hover:text-[#a65b1d]"
              href={`/screener?preset=${selectedScreener.id}`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Buka screener
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="font-ibm-plex-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Hasil terbaru
                </div>
                <div className="mt-1 text-sm font-medium">
                  {selectedScreener.matches.length} saham lolos kriteria
                </div>
              </div>
              <div className="font-ibm-plex-mono text-[9px] text-muted-foreground">
                Last run {selectedScreener.lastRun}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
              {selectedScreener.matches.map((stock) => (
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

            <div className="mt-4 flex flex-col gap-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Klik saham untuk membuka analisis lengkap.</span>
              <Link
                className="inline-flex items-center gap-1 font-ibm-plex-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a65b1d] hover:text-[#7d4416]"
                href={`/screener?preset=${selectedScreener.id}`}
              >
                Lihat semua
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PortfolioMarketSections() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-14 px-4 sm:space-y-16 sm:px-6 lg:px-8">
      <IhsgIndexSection />
      <StockWatchlistSection />
      <ScreenerWatchlistSection />
    </div>
  )
}
