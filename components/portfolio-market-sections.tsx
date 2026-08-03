"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  RefreshCw,
  Search,
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

type FollowedScreener = {
  id: number
  name: string
  category: string
  summary: string
  matches: ScreenerMatch[]
  freshMatches: number
  lastRun: string
  filters: string[]
}

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

function TradingViewIhsgChart() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ""

    const widgetSlot = document.createElement("div")
    widgetSlot.className = "tradingview-widget-container__widget h-full w-full"
    container.appendChild(widgetSlot)

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "IDX:COMPOSITE",
      interval: "D",
      timezone: "exchange",
      theme: "light",
      backgroundColor: "#ffffff",
      gridColor: "rgba(46, 46, 46, 0.06)",
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      calendar: false,
      details: false,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      save_image: false,
      withdateranges: true,
      studies: ["MASimple@tv-basicstudies"],
      support_host: "https://www.tradingview.com",
    })
    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [])

  return (
    <div className="h-[430px] w-full sm:h-[520px]">
      <div
        ref={containerRef}
        className="tradingview-widget-container h-[calc(100%_-_24px)] w-full"
        aria-label="Grafik live IHSG dari TradingView"
      />
      <div className="flex h-6 items-center justify-end px-2 text-[10px] text-muted-foreground">
        <a
          href="https://www.tradingview.com/symbols/IDX-COMPOSITE/"
          rel="noopener nofollow"
          target="_blank"
          className="transition-colors hover:text-foreground"
        >
          IHSG chart by TradingView
        </a>
      </div>
    </div>
  )
}

function IhsgIndexSection() {
  return (
    <section aria-label="Ringkasan pasar IHSG">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <SummaryPill label="Indeks" value="IDX:COMPOSITE" />
        <SummaryPill label="Bursa" value="IDX" hint="Jakarta" />
        <SummaryPill label="Zona waktu" value="WIB" />
      </div>

      <article className="overflow-hidden rounded-xl border border-border/80 bg-card p-1 shadow-sm">
        <TradingViewIhsgChart />
      </article>
    </section>
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

function ScreenerWatchlistSection() {
  const [followedScreeners, setFollowedScreeners] = useState<FollowedScreener[]>([])
  const [selectedScreenerId, setSelectedScreenerId] = useState<number | null>(null)
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
          matches: (screener.latestMatches ?? []).map((match) => ({
            ticker: typeof match.ticker === "string" ? match.ticker : "",
            name: typeof match.sector === "string" && match.sector ? match.sector : "Saham IDX",
            score: typeof match.score === "number" ? match.score : 0,
            price: typeof match.price === "number" ? match.price : 0,
            change: typeof match.change === "number" ? match.change : 0,
          })).filter((match) => Boolean(match.ticker)),
        }))

        setFollowedScreeners(mapped)
        setSelectedScreenerId((current) => current ?? mapped[0]?.id ?? null)
      })
      .catch((error) => {
        console.error("Failed to load portfolio screeners:", error)
        if (!cancelled) toast.error("Screener tersimpan gagal dimuat")
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

  async function deleteScreener() {
    if (!selectedScreener || isDeleting) return
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
        title="Screener tersimpan"
        description="Kombinasi filter yang Anda simpan, beserta snapshot hasil terakhir saat screener dijalankan."
        aside={(
          <div className="flex flex-wrap gap-2">
            <SummaryPill label="Tersimpan" value={followedScreeners.length} hint="screener" />
            <SummaryPill label="Snapshot" value={totalMatches} hint="saham" />
          </div>
        )}
      />

      <div className="grid overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="border-b border-border/70 bg-muted/35 p-3 lg:border-b-0 lg:border-r">
          <div className="px-2 pb-3 pt-1">
            <div className="text-xs font-medium text-muted-foreground">
              Screener tersimpan
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
                  Tersimpan
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
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => void deleteScreener()}
                disabled={isDeleting}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
                aria-label={`Hapus screener ${selectedScreener.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <Link
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-[#d07225]/60 hover:text-[#a65b1d]"
                href={`/screener?saved=${selectedScreener.id}`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Buka screener
              </Link>
            </div>
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
              {selectedScreener.matches.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Screener ini disimpan sebelum menghasilkan hasil. Buka dan jalankan kembali untuk memperbarui snapshot.
                </div>
              ) : selectedScreener.matches.map((stock) => (
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
                href={`/screener?saved=${selectedScreener.id}`}
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
