"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useClerk, useUser } from "@clerk/nextjs"
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Brain,
    CircleDot,
    Clock,
    ExternalLink,
    Info,
    Layers,
    Newspaper,
    PieChart,
    TrendingDown,
    TrendingUp,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { StockSearch } from "@/components/stock-search"
import { AdvancedMultiChart } from "@/components/advanced-multi-chart"
import { TradingViewSingleTickerCard } from "@/components/tradingview-single-ticker-card"
import { TradePlanCard } from "@/components/trade-plan-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Confidence = "low" | "medium" | "high"
type MarketBias = "bullish" | "bearish" | "neutral"

type AnalyzeResponse = {
    ticker: string
    companyName: string
    sector: string
    marketCapGroup: string
    syariah: boolean
    dataMode: string
    asOf: string
    price: number
    changePct: number
    volume: number
    high52w: number
    low52w: number
    overallScore: number
    confidence: Confidence
    marketBias: MarketBias
    llmSummary: string
    drivers: string[]
    aiView?: {
        coreThesis?: string
        bullCase?: string
        bearCase?: string
        whatChanged?: string
    }
    watchItems?: string[]
    technical: {
        score: number
        trend: string
        momentum: string
        volatility: string
        summary?: string
        signals: string[]
        indicatorNotes?: Record<string, string>
        indicators: {
            ma20: number
            ma20History: number[]
            ma50: number
            ma50History: number[]
            ma200: number
            ma200History: number[]
            rsi14: number
            rsi14History: number[]
            macd: { value: string; text: string }
            macdHistory: number[]
            stochastic: { value: string; text: string }
            stochasticHistory: number[]
            bollingerBands: string
            atr: number
            volumeAvg: number
            support1: number
            support2: number
            resistance1: number
            resistance2: number
        }
    }
    fundamental: {
        score: number
        valuation: string
        summary?: string
        signals: string[]
        metricNotes?: Record<string, string>
        metrics: {
            pe_ratio: number | null
            pe_sector_avg: number | null
            pbv: number | null
            pbv_sector_avg: number | null
            roe: number | null
            roa: number | null
            der: number | null
            npm: number | null
            eps_growth_yoy: number | null
            revenue_growth_yoy: number | null
            dividend_yield: number | null
            market_cap_t: number | null
        }
        quarterly: Array<{
            period: string
            revenue: number | null
            netIncome: number | null
            npm: number | null
            roe: number | null
            eps: number | null
        }>
    }
    riskPlan: {
        entryReference: string
        entryPrice: number
        stopLoss: number
        takeProfit: number
        riskReward: number
        holdingTerm: string
        confidence: Confidence
        summary?: string
        notes: string[]
    }
}

type NewsStory = {
    title: string
    url: string
    source: string
    publishedAt?: string
    snippet?: string
    imageUrl?: string
    faviconUrl?: string
}

function getScoreBarColor(score: number) {
    const clamped = Math.min(Math.max(score, 0), 100)

    if (clamped < 40) return "#dc2626"
    if (clamped < 60) return "#ea580c"
    if (clamped < 75) return "#d97706"
    return "#16a34a"
}

function ScoreBar({ score, color }: { score: number; color?: string }) {
    const pct = Math.min(Math.max(score, 0), 100)
    return (
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color || "#d07225" }}
            />
        </div>
    )
}

function SignalItem({ text }: { text: string }) {
    return (
        <li className="text-sm text-muted-foreground flex items-start gap-2.5 py-1">
            <CircleDot className="w-3.5 h-3.5 mt-0.5 text-primary/50 flex-shrink-0" />
            <span>{text}</span>
        </li>
    )
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 gap-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="text-right">
                <span className="text-sm font-semibold font-ibm-plex-mono">{value}</span>
                {sub ? <div className="text-[11px] text-muted-foreground/60">{sub}</div> : null}
            </div>
        </div>
    )
}

function QuarterlyMetricRow({
    label,
    periods,
    values,
    format,
}: {
    label: string
    periods: string[]
    values: Array<number | null>
    format: (value: number | null) => string
}) {
    const points = values
        .map((value, i) => ({ value, i }))
        .filter((p): p is { value: number; i: number } => p.value !== null && Number.isFinite(p.value))

    const numeric = points.map((p) => p.value)
    const min = numeric.length ? Math.min(...numeric) : 0
    const max = numeric.length ? Math.max(...numeric) : 0
    const span = max - min
    const lastIndex = values.length - 1

    const latest = [...values].reverse().find((value) => value !== null && Number.isFinite(value)) ?? null
    const first = numeric.length ? numeric[0] : null
    const lastNumeric = numeric.length ? numeric[numeric.length - 1] : null
    const trendUp = first !== null && lastNumeric !== null ? lastNumeric >= first : true
    const lineColor = trendUp ? "#16a34a" : "#dc2626"

    // Coordinates in a 0..100 / 0..100 viewBox, y inverted (higher value = top)
    const coords = points.map((p) => ({
        ...p,
        x: lastIndex > 0 ? (p.i / lastIndex) * 100 : 50,
        y: span > 0 ? (1 - (p.value - min) / span) * 80 + 10 : 50,
    }))
    const linePath = coords.map((c, idx) => `${idx === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" ")
    const gradientId = `spark-${label.replace(/[^a-z0-9]/gi, "")}`

    return (
        <div className="flex items-center gap-3 sm:gap-4 py-3.5 border-b border-border/50 last:border-0">
            <span className="w-20 sm:w-24 shrink-0 text-sm text-muted-foreground">{label}</span>

            <div className="relative h-10 flex-1">
                {coords.length > 1 ? (
                    <svg
                        className="absolute inset-0 h-full w-full overflow-visible"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
                                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d={`${linePath} L${coords[coords.length - 1].x.toFixed(2)},100 L${coords[0].x.toFixed(2)},100 Z`}
                            fill={`url(#${gradientId})`}
                        />
                        <path
                            d={linePath}
                            fill="none"
                            stroke={lineColor}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                ) : (
                    <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                )}

                {coords.map((c) => (
                    <Tooltip key={c.i} delayDuration={50}>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="group absolute -translate-x-1/2 -translate-y-1/2 p-1.5"
                                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                                aria-label={`${periods[c.i]}: ${format(c.value)}`}
                            >
                                <span
                                    className={cn(
                                        "block h-1.5 w-1.5 rounded-full ring-2 ring-background transition-all",
                                        c.i === lastIndex
                                            ? "scale-100 opacity-100"
                                            : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: lineColor }}
                                />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-xs">
                                <div className="font-medium">{periods[c.i]}</div>
                                <div className="text-muted-foreground">{label}</div>
                                <div className="mt-0.5 font-ibm-plex-mono font-semibold">{format(c.value)}</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>

            <span className="w-20 sm:w-24 shrink-0 text-right text-sm font-semibold font-ibm-plex-mono">
                {format(latest)}
            </span>
        </div>
    )
}

function formatNumber(value: number | null | undefined, digits = 1) {
    if (value === null || value === undefined || Number.isNaN(value)) return "N/A"
    return value.toLocaleString("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

function formatCompactVolume(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) return "N/A"
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toLocaleString("id-ID")
}

function formatTrillionValue(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) return "N/A"
    return `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })}T`
}

function formatRupiah(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) return "N/A"
    return `Rp ${value.toLocaleString("id-ID")}`
}

function formatEntryReference(value: string | null | undefined) {
    if (!value) return "Referensi entry"

    const normalized = value.toLowerCase().replace(/[\s-]+/g, "_")
    const labels: Record<string, string> = {
        close: "Harga terakhir",
        last_close: "Harga terakhir",
        support: "Area support",
        support_level: "Area support",
        swing_low: "Swing low",
        fibonacci: "Fibonacci",
        atr: "ATR",
        ma20: "MA20",
        ma50: "MA50",
        ma200: "MA200",
    }

    return labels[normalized] || value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatNewsTime(value: string | null | undefined) {
    if (!value) return null

    const timestamp = new Date(value).getTime()
    if (Number.isNaN(timestamp)) return null

    const diffMs = Date.now() - timestamp
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diffMs < hour) return "Baru saja"
    if (diffMs < day) return `${Math.max(1, Math.floor(diffMs / hour))} jam lalu`
    if (diffMs < 30 * day) return `${Math.max(1, Math.floor(diffMs / day))} hari lalu`

    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(timestamp))
}

type FinancialScale = "rupiah" | "trillions"

function inferQuarterlyFinancialScale(
    rows: Array<{
        revenue: number | null
        netIncome: number | null
    }>
): FinancialScale {
    const values = rows
        .flatMap((row) => [row.revenue, row.netIncome])
        .filter((value): value is number => value !== null && Number.isFinite(value) && value !== 0)

    if (values.length === 0) return "rupiah"

    const largestMagnitude = Math.max(...values.map((value) => Math.abs(value)))
    return largestMagnitude < 10000 ? "trillions" : "rupiah"
}

function formatFinancialMagnitude(value: number | null | undefined, scale: FinancialScale = "rupiah") {
    if (value === null || value === undefined || Number.isNaN(value)) return "N/A"

    if (scale === "trillions") {
        const absValue = Math.abs(value)

        if (absValue >= 1) {
            const digits = absValue >= 100 ? 0 : absValue >= 10 ? 1 : 2
            return `Rp ${value.toLocaleString("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: digits })}T`
        }

        if (absValue >= 0.001) {
            const billions = value * 1000
            const absBillions = Math.abs(billions)
            const digits = absBillions >= 100 ? 0 : 1
            return `Rp ${billions.toLocaleString("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: digits })}B`
        }

        const millions = value * 1_000_000
        return `Rp ${millions.toLocaleString("id-ID", { maximumFractionDigits: 0 })}M`
    }

    if (Math.abs(value) >= 1e12) return `Rp ${formatNumber(value / 1e12, 2)}T`
    if (Math.abs(value) >= 1e9) return `Rp ${formatNumber(value / 1e9, 2)}B`
    if (Math.abs(value) >= 1e6) return `Rp ${formatNumber(value / 1e6, 2)}M`

    return `Rp ${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`
}

function AnalyzeV2Content() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const urlTicker = searchParams.get("ticker")
    const { isSignedIn, isLoaded } = useUser()
    const { openSignIn } = useClerk()

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<AnalyzeResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [newsLoading, setNewsLoading] = useState(false)
    const [newsStories, setNewsStories] = useState<NewsStory[]>([])
    const [newsError, setNewsError] = useState<string | null>(null)
    const signInOpenedRef = useRef(false)

    const handleSearch = async (ticker: string) => {
        const normalizedTicker = ticker.toUpperCase()

        if (isLoaded && !isSignedIn) {
            signInOpenedRef.current = true
            void openSignIn()
            return
        }

        setLoading(true)
        setError(null)
        router.push(`/analyze-v2?ticker=${normalizedTicker}`)
    }

    useEffect(() => {
        if (!urlTicker) {
            setData(null)
            setLoading(false)
            setError(null)
            setNewsStories([])
            setNewsError(null)
            setNewsLoading(false)
            signInOpenedRef.current = false
            return
        }

        if (isLoaded && !isSignedIn) {
            if (!signInOpenedRef.current) {
                signInOpenedRef.current = true
                void openSignIn()
            }
            setData(null)
            setError(null)
            setLoading(false)
            setNewsStories([])
            setNewsError(null)
            setNewsLoading(false)
            return
        }

        signInOpenedRef.current = false

        const normalizedTicker = urlTicker.toUpperCase()
        let cancelled = false

        async function loadAnalysis() {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ticker: normalizedTicker }),
                })

                const result = await response.json()

                if (!response.ok || !result?.success || !result?.data) {
                    throw new Error(result?.message || result?.error || "Gagal memuat analisis.")
                }

                if (!cancelled) {
                    setData(result.data as AnalyzeResponse)
                }
            } catch (err) {
                if (!cancelled) {
                    setData(null)
                    setError(err instanceof Error ? err.message : "Gagal memuat analisis.")
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadAnalysis()

        return () => {
            cancelled = true
        }
    }, [urlTicker, isLoaded, isSignedIn, openSignIn])

    useEffect(() => {
        if (!data || !isSignedIn) {
            setNewsStories([])
            setNewsError(null)
            setNewsLoading(false)
            return
        }

        const analysis = data
        const controller = new AbortController()
        let cancelled = false

        async function loadNews() {
            try {
                setNewsLoading(true)
                setNewsError(null)

                const response = await fetch("/api/analyze/news", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ticker: analysis.ticker,
                        companyName: analysis.companyName,
                        sector: analysis.sector,
                    }),
                    signal: controller.signal,
                })

                const result = await response.json()

                if (!response.ok || !result?.success) {
                    throw new Error(result?.error || "Gagal memuat berita terkait.")
                }

                if (!cancelled) {
                    setNewsStories(Array.isArray(result.stories) ? result.stories : [])
                }
            } catch (err) {
                if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
                    setNewsStories([])
                    setNewsError(err instanceof Error ? err.message : "Gagal memuat berita terkait.")
                }
            } finally {
                if (!cancelled) {
                    setNewsLoading(false)
                }
            }
        }

        loadNews()

        return () => {
            cancelled = true
            controller.abort()
        }
    }, [data, isSignedIn])

    if (!urlTicker || (loading && !data)) {
        return (
            <div className="min-h-screen bg-background dotted-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center -mt-10 md:-mt-16">
                    <StockSearch onSearch={handleSearch} loading={loading} />
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-background dotted-background flex flex-col">
                <Navbar />
                <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                    <button
                        onClick={() => router.push("/analyze-v2")}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-[#d07225]/30 hover:bg-card transition-colors group shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Kembali ke Pencarian
                    </button>

                    <Card className="mt-5 p-6 border-border/70 bg-card shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-[#d07225] mt-0.5" />
                            <div>
                                <h2 className="text-lg font-semibold">Analisis tidak tersedia</h2>
                                <p className="text-sm text-muted-foreground mt-1">{error || "Data tidak ditemukan."}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    const d = data
    const quarterlyFinancialScale = inferQuarterlyFinancialScale(d.fundamental.quarterly)
    const bullCase = d.aiView?.bullCase || d.fundamental.summary || `${d.ticker} menjadi lebih menarik jika valuasi murah mulai diikuti pemulihan momentum dan tekanan jual mereda.`
    const bearCase = d.aiView?.bearCase || d.riskPlan.summary || `Risiko utama ada pada pelemahan lanjutan jika harga gagal bertahan di area stop dan sinyal teknikal belum berbalik.`
    const summaryDrivers = (d.drivers.length ? d.drivers : [
        d.aiView?.whatChanged || `Perhatikan konfirmasi harga, volume, dan flow pasar sebelum menaikkan conviction.`,
    ]).slice(0, 4)
    const watchItems = (d.watchItems?.length ? d.watchItems : [
        `Stop ${formatRupiah(d.riskPlan.stopLoss)}`,
        `Target ${formatRupiah(d.riskPlan.takeProfit)}`,
        `Entry ${formatEntryReference(d.riskPlan.entryReference)}`,
        ...d.riskPlan.notes,
    ]).slice(0, 7)

    return (
        <div className="min-h-screen bg-background dotted-background flex flex-col">
            <Navbar />
            <div className="flex-1 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 md:mt-7 space-y-5">
                    <button
                        onClick={() => router.push("/analyze-v2")}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-[#d07225]/30 hover:bg-card transition-colors group shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Kembali ke Pencarian
                    </button>

                    <Card className="p-6 sm:p-8 border-border/70 bg-card shadow-sm overflow-hidden">
                        <div className="mb-7 space-y-5">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center border border-border flex-shrink-0 relative overflow-hidden">
                                        <Image
                                            src={`/stock_icons/${d.ticker}.png`}
                                            alt={d.ticker}
                                            fill
                                            sizes="44px"
                                            className="object-contain p-1.5"
                                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                (e.target as HTMLImageElement).style.display = "none"
                                                const span = document.createElement("span")
                                                span.className = "font-bold text-base font-ibm-plex-mono text-muted-foreground absolute inset-0 flex items-center justify-center"
                                                span.textContent = d.ticker.charAt(0)
                                                    ; (e.target as HTMLImageElement).parentElement?.appendChild(span)
                                            }}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="text-2xl font-bold font-ibm-plex-mono tracking-tight leading-none">{d.ticker}</h1>
                                            {d.syariah ? <Badge variant="outline" className="text-[10px]">Syariah</Badge> : null}
                                            <Badge variant="outline" className="text-[10px]">{d.dataMode}</Badge>
                                        </div>
                                        <p className="mt-1 truncate text-sm text-muted-foreground">{d.companyName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-x-3 gap-y-1 text-xs text-muted-foreground flex-wrap lg:justify-end">
                                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{d.sector}</span>
                                    <span className="text-border">·</span>
                                    <span className="capitalize">{d.marketCapGroup} Cap</span>
                                    <span className="text-border">·</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Per {d.asOf}</span>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(320px,1.25fr)_minmax(220px,1fr)_minmax(220px,1fr)] gap-3 items-stretch min-w-0">
                                <TradingViewSingleTickerCard
                                    ticker={d.ticker}
                                    price={d.price}
                                    changePct={d.changePct}
                                    volumeLabel={formatCompactVolume(d.volume)}
                                    high52w={d.high52w}
                                    low52w={d.low52w}
                                />

                                <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 min-h-[136px] h-full flex flex-col justify-center gap-5">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Technical Score</div>
                                        <div className="mt-2 flex items-end justify-between gap-4">
                                            <div className="text-3xl font-bold font-ibm-plex-mono text-foreground leading-none">{d.technical.score}</div>
                                            <div className="w-24 pb-1"><ScoreBar score={d.technical.score} color={getScoreBarColor(d.technical.score)} /></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Fundamental Score</div>
                                        <div className="mt-2 flex items-end justify-between gap-4">
                                            <div className="text-3xl font-bold font-ibm-plex-mono text-foreground leading-none">{d.fundamental.score}</div>
                                            <div className="w-24 pb-1"><ScoreBar score={d.fundamental.score} color={getScoreBarColor(d.fundamental.score)} /></div>
                                        </div>
                                    </div>
                                </div>

                                <TradePlanCard riskPlan={d.riskPlan} watchItems={watchItems} currentPrice={d.price} />
                            </div>
                        </div>

                        <div className="h-px bg-border mb-6" />

                        <div className="mb-8 pt-2">
                            <AdvancedMultiChart
                                data={{ dates: [], close: [], ma20: [], ma50: [], foreignFlowCumulative: [] }}
                                symbol={d.ticker}
                            />
                        </div>
                    </Card>

                    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
                        <section>
                            <div className="p-6 sm:p-7">
                                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-base font-semibold">AI View</span>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border/70">
                                        <div className="md:pr-6">
                                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Ringkasan Singkat</div>
                                            <p className="text-sm leading-relaxed text-muted-foreground">{d.llmSummary}</p>
                                        </div>

                                        <div className="md:pl-6">
                                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Driver Utama</div>
                                            <ul className="grid grid-cols-1 gap-y-2">
                                                {summaryDrivers.map((driver, i) => (
                                                    <li key={`${driver}-${i}`} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                                                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#d07225]" />
                                                        <span>{driver}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 border-t border-border/70 pt-5 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border/70">
                                        <div className="md:pr-6">
                                            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-xl border border-red-600/20 bg-red-600/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-red-700">
                                                <TrendingDown className="h-3.5 w-3.5" />
                                                Bearish View
                                            </div>
                                            <p className="text-sm leading-relaxed text-muted-foreground">{bearCase}</p>
                                        </div>

                                        <div className="md:pl-6">
                                            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-xl border border-green-600/20 bg-green-600/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-green-700">
                                                <TrendingUp className="h-3.5 w-3.5" />
                                                Bullish View
                                            </div>
                                            <p className="text-sm leading-relaxed text-muted-foreground">{bullCase}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Card>

                    <Card className="p-6 sm:p-7 border-border/70 bg-card shadow-sm overflow-hidden">
                        <div className="-mx-6 sm:-mx-7 -mt-6 sm:-mt-7 mb-5 h-px bg-border" />
                        <div className="flex items-center gap-2 mb-4">
                            <Newspaper className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">Berita Terkait</span>
                        </div>

                        {newsLoading ? (
                            <div className="grid gap-x-8 md:grid-cols-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-t border-border/70 py-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                                        <div className="h-16 w-[88px] bg-muted animate-pulse sm:h-20 sm:w-28" />
                                        <div className="min-w-0 pt-0.5">
                                            <div className="mb-3 h-3 w-32 bg-muted animate-pulse" />
                                            <div className="mb-2 h-4 w-full bg-muted animate-pulse" />
                                            <div className="h-4 w-3/4 bg-muted animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : newsStories.length > 0 ? (
                            <div className="grid gap-x-8 md:grid-cols-2">
                                {newsStories.map((story) => {
                                    const publishedLabel = formatNewsTime(story.publishedAt)

                                    return (
                                        <a
                                            key={story.url}
                                            href={story.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-t border-border/70 py-4 transition-colors hover:bg-muted/20 sm:grid-cols-[112px_minmax(0,1fr)]"
                                        >
                                            <div className="relative h-16 w-[88px] overflow-hidden bg-muted sm:h-20 sm:w-28">
                                                {story.imageUrl ? (
                                                    <img
                                                        src={story.imageUrl}
                                                        alt=""
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        loading="lazy"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display = "none"
                                                        }}
                                                    />
                                                ) : story.faviconUrl ? (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                                        <img
                                                            src={story.faviconUrl}
                                                            alt=""
                                                            className="h-7 w-7 opacity-70"
                                                            loading="lazy"
                                                            onError={(event) => {
                                                                event.currentTarget.style.display = "none"
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                                        <Newspaper className="h-5 w-5 text-muted-foreground/60" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 pt-0.5">
                                                <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                                                    <div className="min-w-0 truncate">
                                                        <span className="font-medium text-foreground/75">{story.source}</span>
                                                        {publishedLabel ? <span> · {publishedLabel}</span> : null}
                                                    </div>
                                                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-80" />
                                                </div>
                                                <div className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-[#d07225]">
                                                    {story.title}
                                                </div>
                                                {story.snippet ? (
                                                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                        {story.snippet}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </a>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="border-t border-border/70 py-4 text-sm text-muted-foreground">
                                {newsError ? "Berita belum tersedia saat ini." : "Belum ada berita relevan."}
                            </div>
                        )}
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-5">
                        <Card className="p-6 border-border/70 bg-card shadow-sm overflow-hidden">
                            <div className="-mx-6 -mt-6 mb-5 h-px bg-border" />
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="text-sm font-semibold">Analisis Teknikal</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground capitalize">{d.technical.trend} · {d.technical.momentum} · {d.technical.volatility}</p>
                                    {d.technical.summary ? <p className="text-xs text-muted-foreground mt-2">{d.technical.summary}</p> : null}
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold font-ibm-plex-mono">{d.technical.score}</div>
                                    <div className="w-20 mt-1"><ScoreBar score={d.technical.score} color={getScoreBarColor(d.technical.score)} /></div>
                                </div>
                            </div>

                            <Tabs defaultValue="overview">
                                <TabsList variant="line" className="mb-4">
                                    <TabsTrigger value="overview" className="text-xs">Profil Aksi</TabsTrigger>
                                    <TabsTrigger value="indicators" className="text-xs">Indikator Detail</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview">
                                    <div className="grid grid-cols-3 gap-2 mb-5">
                                        <div className="p-2.5 rounded-lg bg-background/70 border border-border/70 text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Trend</div>
                                            <div className="text-xs font-semibold capitalize">{d.technical.trend}</div>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-background/70 border border-border/70 text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Momentum</div>
                                            <div className="text-xs font-semibold capitalize">{d.technical.momentum}</div>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-background/70 border border-border/70 text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Volatilitas</div>
                                            <div className="text-xs font-semibold capitalize">{d.technical.volatility}</div>
                                        </div>
                                    </div>
                                    <StatRow label="Support Terdekat (S1)" value={`Rp ${formatNumber(d.technical.indicators.support1, 1)}`} sub={`S2: Rp ${formatNumber(d.technical.indicators.support2, 1)}`} />
                                    <StatRow label="Resisten Terdekat (R1)" value={`Rp ${formatNumber(d.technical.indicators.resistance1, 1)}`} sub={`R2: Rp ${formatNumber(d.technical.indicators.resistance2, 1)}`} />
                                    <StatRow label="Avg Volume" value={formatCompactVolume(d.technical.indicators.volumeAvg)} sub={d.technical.indicatorNotes?.volumeAvg} />
                                    <StatRow label="ATR" value={`Rp ${formatNumber(d.technical.indicators.atr, 1)}`} sub={d.technical.indicatorNotes?.atr} />
                                </TabsContent>

                                <TabsContent value="indicators">
                                    <StatRow label="MA20" value={`Rp ${formatNumber(d.technical.indicators.ma20, 0)}`} sub={d.technical.indicatorNotes?.ma20} />
                                    <StatRow label="MA50" value={`Rp ${formatNumber(d.technical.indicators.ma50, 1)}`} sub={d.technical.indicatorNotes?.ma50} />
                                    <StatRow label="MA200" value={`Rp ${formatNumber(d.technical.indicators.ma200, 2)}`} sub={d.technical.indicatorNotes?.ma200} />
                                    <StatRow label="RSI (14)" value={formatNumber(d.technical.indicators.rsi14, 2)} sub={d.technical.indicatorNotes?.rsi14} />
                                    <StatRow label="MACD" value={d.technical.indicators.macd.value} sub={`${d.technical.indicators.macd.text}${d.technical.indicatorNotes?.macd ? ` · ${d.technical.indicatorNotes.macd}` : ""}`} />
                                    <StatRow label="Stochastic" value={d.technical.indicators.stochastic.value} sub={`${d.technical.indicators.stochastic.text}${d.technical.indicatorNotes?.stochastic ? ` · ${d.technical.indicatorNotes.stochastic}` : ""}`} />
                                    <StatRow label="Bollinger Bands" value={d.technical.indicators.bollingerBands} sub={d.technical.indicatorNotes?.bollingerBands} />
                                </TabsContent>
                            </Tabs>

                            <div className="border-t border-border pt-4 mt-4">
                                <div className="text-xs font-semibold text-muted-foreground mb-2">Sinyal Teknikal</div>
                                <ul className="space-y-0.5">
                                    {d.technical.signals.map((signal, i) => <SignalItem key={i} text={signal} />)}
                                </ul>
                            </div>
                        </Card>

                        <Card className="p-6 border-border/70 bg-card shadow-sm overflow-hidden">
                            <div className="-mx-6 -mt-6 mb-5 h-px bg-border" />
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <PieChart className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="text-sm font-semibold">Analisis Fundamental</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground capitalize">Valuasi: {d.fundamental.valuation} · MCap {formatTrillionValue(d.fundamental.metrics.market_cap_t)}</p>
                                    {d.fundamental.summary ? <p className="text-xs text-muted-foreground mt-2">{d.fundamental.summary}</p> : null}
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold font-ibm-plex-mono">{d.fundamental.score}</div>
                                    <div className="w-20 mt-1"><ScoreBar score={d.fundamental.score} color={getScoreBarColor(d.fundamental.score)} /></div>
                                </div>
                            </div>

                            <Tabs defaultValue="overview">
                                <TabsList variant="line" className="mb-4">
                                    <TabsTrigger value="overview" className="text-xs">Ikhtisar</TabsTrigger>
                                    <TabsTrigger value="quarterly" className="text-xs">Data Kuartal</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview">
                                    <StatRow label="P/E Ratio" value={d.fundamental.metrics.pe_ratio !== null ? `${formatNumber(d.fundamental.metrics.pe_ratio, 1)}x` : "N/A"} sub={d.fundamental.metricNotes?.pe_ratio || (d.fundamental.metrics.pe_sector_avg !== null ? `Sektor avg: ${formatNumber(d.fundamental.metrics.pe_sector_avg, 1)}x` : undefined)} />
                                    <StatRow label="PBV" value={d.fundamental.metrics.pbv !== null ? `${formatNumber(d.fundamental.metrics.pbv, 2)}x` : "N/A"} sub={d.fundamental.metricNotes?.pbv || (d.fundamental.metrics.pbv_sector_avg !== null ? `Sektor avg: ${formatNumber(d.fundamental.metrics.pbv_sector_avg, 2)}x` : undefined)} />
                                    <StatRow label="ROE" value={d.fundamental.metrics.roe !== null ? `${formatNumber(d.fundamental.metrics.roe, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.roe} />
                                    <StatRow label="ROA" value={d.fundamental.metrics.roa !== null ? `${formatNumber(d.fundamental.metrics.roa, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.roa} />
                                    <StatRow label="DER" value={d.fundamental.metrics.der !== null ? `${formatNumber(d.fundamental.metrics.der, 2)}x` : "N/A"} sub={d.fundamental.metricNotes?.der} />
                                    <StatRow label="Net Profit Margin" value={d.fundamental.metrics.npm !== null ? `${formatNumber(d.fundamental.metrics.npm, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.npm} />
                                    <StatRow label="EPS Growth YoY" value={d.fundamental.metrics.eps_growth_yoy !== null ? `${d.fundamental.metrics.eps_growth_yoy > 0 ? "+" : ""}${formatNumber(d.fundamental.metrics.eps_growth_yoy, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.eps_growth_yoy} />
                                    <StatRow label="Revenue Growth YoY" value={d.fundamental.metrics.revenue_growth_yoy !== null ? `${d.fundamental.metrics.revenue_growth_yoy > 0 ? "+" : ""}${formatNumber(d.fundamental.metrics.revenue_growth_yoy, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.revenue_growth_yoy} />
                                    <StatRow label="Dividend Yield" value={d.fundamental.metrics.dividend_yield !== null ? `${formatNumber(d.fundamental.metrics.dividend_yield, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.dividend_yield} />
                                </TabsContent>

                                <TabsContent value="quarterly" className="mt-3">
                                    {(() => {
                                        const periods = d.fundamental.quarterly.map((q) => q.period)
                                        const percentFormat = (value: number | null) =>
                                            value !== null && Number.isFinite(value) ? `${formatNumber(value, 2)}%` : "N/A"
                                        const epsFormat = (value: number | null) =>
                                            value !== null && Number.isFinite(value) ? formatNumber(value, 2) : "N/A"
                                        const magnitudeFormat = (value: number | null) =>
                                            formatFinancialMagnitude(value, quarterlyFinancialScale)

                                        const rows: Array<{ label: string; values: Array<number | null>; format: (value: number | null) => string }> = [
                                            { label: "Revenue", values: d.fundamental.quarterly.map((q) => q.revenue), format: magnitudeFormat },
                                            { label: "Laba Bersih", values: d.fundamental.quarterly.map((q) => q.netIncome), format: magnitudeFormat },
                                            { label: "NPM", values: d.fundamental.quarterly.map((q) => q.npm), format: percentFormat },
                                            { label: "ROE", values: d.fundamental.quarterly.map((q) => q.roe), format: percentFormat },
                                            { label: "EPS", values: d.fundamental.quarterly.map((q) => q.eps), format: epsFormat },
                                        ]

                                        return (
                                            <TooltipProvider>
                                                <div>
                                                    {rows.map((row) => (
                                                        <QuarterlyMetricRow
                                                            key={row.label}
                                                            label={row.label}
                                                            periods={periods}
                                                            values={row.values}
                                                            format={row.format}
                                                        />
                                                    ))}
                                                </div>
                                            </TooltipProvider>
                                        )
                                    })()}
                                </TabsContent>
                            </Tabs>

                            <div className="border-t border-border pt-4 mt-4">
                                <div className="text-xs font-semibold text-muted-foreground mb-2">Sinyal Fundamental</div>
                                <ul className="space-y-0.5">
                                    {d.fundamental.signals.map((signal, i) => <SignalItem key={i} text={signal} />)}
                                </ul>
                            </div>
                        </Card>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-card/70 px-4 py-3 text-center text-[11px] text-muted-foreground/70 shadow-sm">
                        <Info className="w-3 h-3 inline mr-1 -mt-0.5" />
                        Analisis ini dihasilkan oleh AI dan bukan merupakan saran investasi. Selalu lakukan riset mandiri sebelum mengambil keputusan investasi.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AnalyzeV2Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <AnalyzeV2Content />
        </Suspense>
    )
}
