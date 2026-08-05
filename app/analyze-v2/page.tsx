"use client"

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useClerk, useUser } from "@clerk/nextjs"
import {
    AlertTriangle,
    ArrowLeft,
    CircleDot,
    Clock,
    Info,
    Layers,
    Newspaper,
    TrendingDown,
    TrendingUp,
} from "lucide-react"
import { Footer } from "@/components/footer"
import { PageShell } from "@/components/page-shell"
import { StockSearch } from "@/components/stock-search"
import { AdvancedMultiChart } from "@/components/advanced-multi-chart"
import { TradePlanCard } from "@/components/trade-plan-card"
import { TickerCircleIcon } from "@/components/ticker-circle-icon"
import { Badge } from "@/components/ui/badge"
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

function AnalyzePageFrame({ children }: { children: ReactNode }) {
    return (
        <PageShell>
            <main className="flex min-h-[calc(100svh-5rem)] flex-1 flex-col">
                {children}
            </main>
            <Footer />
        </PageShell>
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
                <span className="text-sm font-semibold tabular-nums">{value}</span>
                {sub ? <div className="text-[11px] text-muted-foreground/60">{sub}</div> : null}
            </div>
        </div>
    )
}

function ResultSectionHeading({ title }: { title: string }) {
    return (
        <div className="mb-2.5">
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
        </div>
    )
}

function AnalysisSurface({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("overflow-hidden rounded-2xl border border-border/70 bg-card/90", className)}>
            {children}
        </div>
    )
}

function SummaryMetric({
    label,
    value,
    detail,
}: {
    label: string
    value: ReactNode
    detail: string
}) {
    return (
        <div className="min-h-24 bg-card px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            <div className="mt-1.5 text-xl font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl">{value}</div>
            <div className="mt-1 text-[11px] leading-4 text-muted-foreground">{detail}</div>
        </div>
    )
}

function ScoreMetric({ label, score }: { label: string; score: number }) {
    const pct = Math.min(Math.max(score, 0), 100)
    const markerPct = Math.min(Math.max(pct, 2), 98)

    return (
        <div className="bg-card px-4 py-3.5 sm:px-5 sm:py-4" aria-label={`${label}: ${score} dari 100`}>
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            <div className="mt-1.5 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{score}</span>
                    <span className="text-[11px] text-muted-foreground">/100</span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">{getScoreLabel(score)}</span>
            </div>
            <div className="relative mt-3 h-1.5 overflow-visible rounded-full bg-muted">
                <div className="absolute inset-y-0 left-0 rounded-full bg-[#d07225]" style={{ width: `${pct}%` }} />
                {[40, 60, 75].map((threshold) => (
                    <span key={threshold} className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-card/80" style={{ left: `${threshold}%` }} />
                ))}
                <span className="absolute top-1/2 h-2.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" style={{ left: `${markerPct}%` }} />
            </div>
        </div>
    )
}

function BiasMetric({ bias, confidence }: { bias: MarketBias; confidence: Confidence }) {
    const positive = bias === "bullish"
    const negative = bias === "bearish"

    return (
        <div className="bg-card px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="text-xs font-medium text-muted-foreground">Bias pasar</div>
            <div className={cn("mt-2 flex items-center gap-2 text-xl font-semibold tracking-tight", positive && "text-emerald-700", negative && "text-red-600")}>
                {positive ? <TrendingUp className="h-4 w-4" /> : negative ? <TrendingDown className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
                {formatMarketBias(bias)}
            </div>
            <div className="mt-2 text-[11px] leading-4 text-muted-foreground">{formatConfidence(confidence)}</div>
        </div>
    )
}

function getScoreLabel(score: number) {
    if (score >= 85) return "Sangat kuat"
    if (score >= 70) return "Kuat"
    if (score >= 55) return "Moderat"
    if (score >= 40) return "Lemah"
    return "Sangat lemah"
}

function formatMarketBias(value: MarketBias) {
    if (value === "bullish") return "Bullish"
    if (value === "bearish") return "Bearish"
    return "Netral"
}

function formatConfidence(value: Confidence) {
    if (value === "high") return "Keyakinan tinggi"
    if (value === "medium") return "Keyakinan sedang"
    return "Keyakinan rendah"
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
            <AnalyzePageFrame>
                <div className="flex-1">
                    <StockSearch onSearch={handleSearch} loading={loading} />
                </div>
            </AnalyzePageFrame>
        )
    }

    if (error || !data) {
        return (
            <AnalyzePageFrame>
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
            </AnalyzePageFrame>
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
    const coreThesis = d.aiView?.coreThesis || d.llmSummary
    const isPositiveChange = d.changePct >= 0

    return (
        <AnalyzePageFrame>
            <div className="flex-1 pb-16">
                <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6 lg:mt-9 lg:px-8">
                    <button
                        onClick={() => router.push("/analyze-v2")}
                        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Kembali ke Pencarian
                    </button>

                    <header className="mt-8 lg:mt-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                                <TickerCircleIcon ticker={d.ticker} className="h-12 w-12" />
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{d.ticker}</h1>
                                        {d.syariah ? <Badge variant="outline">Syariah</Badge> : null}
                                        <Badge variant="outline">{d.dataMode}</Badge>
                                    </div>
                                    <p className="mt-1 truncate text-sm text-muted-foreground sm:text-base">{d.companyName}</p>
                                </div>
                            </div>

                            <div className="lg:text-right">
                                <div className="text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl">{formatRupiah(d.price)}</div>
                                <div className={cn("mt-1 text-sm font-medium tabular-nums", isPositiveChange ? "text-emerald-700" : "text-red-600")}>
                                    {isPositiveChange ? "+" : ""}{formatNumber(d.changePct, 2)}%
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4" />{d.sector}</span>
                            <span className="capitalize">{d.marketCapGroup} cap</span>
                            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />Per {d.asOf}</span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 lg:grid-cols-4">
                            <ScoreMetric label="Skor keseluruhan" score={d.overallScore} />
                            <ScoreMetric label="Teknikal" score={d.technical.score} />
                            <ScoreMetric label="Fundamental" score={d.fundamental.score} />
                            <BiasMetric bias={d.marketBias} confidence={d.confidence} />
                        </div>
                    </header>

                    <main className="mt-8 space-y-8 sm:space-y-10">
                        <section>
                            <ResultSectionHeading title="Pergerakan harga" />
                            <AnalysisSurface>
                                <AdvancedMultiChart
                                    data={{ dates: [], close: [], ma20: [], ma50: [], foreignFlowCumulative: [] }}
                                    symbol={d.ticker}
                                />
                                <div className="grid grid-cols-2 gap-px border-t border-border/70 bg-border/70 lg:grid-cols-4">
                                    <SummaryMetric label="Volume" value={formatCompactVolume(d.volume)} detail="Volume sesi terakhir" />
                                    <SummaryMetric label="Terendah 52 minggu" value={formatRupiah(d.low52w)} detail="Batas bawah tahunan" />
                                    <SummaryMetric label="Tertinggi 52 minggu" value={formatRupiah(d.high52w)} detail="Batas atas tahunan" />
                                    <SummaryMetric label="Kapitalisasi pasar" value={formatTrillionValue(d.fundamental.metrics.market_cap_t)} detail={`${d.marketCapGroup} cap`} />
                                </div>
                            </AnalysisSurface>
                        </section>

                        <section>
                            <ResultSectionHeading title="Pandangan AI" />
                            <AnalysisSurface>
                                <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                                    <div className="p-5 sm:p-6 lg:border-r lg:border-border/70">
                                        <p className="max-w-3xl text-base font-semibold leading-7 text-foreground">{coreThesis}</p>
                                        {coreThesis !== d.llmSummary ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{d.llmSummary}</p> : null}
                                    </div>
                                    <div className="border-t border-border/70 p-5 sm:p-6 lg:border-t-0">
                                        <h3 className="text-sm font-semibold text-foreground">Driver utama</h3>
                                        <ul className="mt-3 space-y-2">
                                            {summaryDrivers.map((driver, i) => (
                                                <li key={`${driver}-${i}`} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                                                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d07225]" />
                                                    <span>{driver}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="grid border-t border-border/70 md:grid-cols-2">
                                    <div className="bg-emerald-50/35 p-5 sm:p-6 md:border-r md:border-border/70">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><TrendingUp className="h-4 w-4" />Skenario bullish</div>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{bullCase}</p>
                                    </div>
                                    <div className="border-t border-border/70 bg-red-50/30 p-5 sm:p-6 md:border-t-0">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-red-700"><TrendingDown className="h-4 w-4" />Skenario bearish</div>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{bearCase}</p>
                                    </div>
                                </div>
                            </AnalysisSurface>
                        </section>

                        <section>
                            <ResultSectionHeading title="Rencana perdagangan" />
                            <TradePlanCard riskPlan={d.riskPlan} watchItems={watchItems} currentPrice={d.price} />
                        </section>

                        <section>
                            <ResultSectionHeading title="Analisis teknikal" />
                            <AnalysisSurface>
                                {d.technical.summary ? (
                                    <div className="border-b border-border/70 bg-muted/20 px-5 py-3.5 text-sm leading-6 text-muted-foreground sm:px-6">
                                        <span className="mr-2 font-semibold text-foreground">Interpretasi</span>
                                        {d.technical.summary}
                                    </div>
                                ) : null}
                                <div className="grid gap-px bg-border/70 sm:grid-cols-3">
                                    {[
                                        ["Tren", d.technical.trend],
                                        ["Momentum", d.technical.momentum],
                                        ["Volatilitas", d.technical.volatility],
                                    ].map(([label, value]) => (
                                        <div key={label} className="bg-card px-5 py-4">
                                            <div className="text-xs text-muted-foreground">{label}</div>
                                            <div className="mt-1 text-sm font-semibold capitalize text-foreground">{value}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                                    <div className="p-5 sm:p-6 lg:border-r lg:border-border/70">
                                        <Tabs defaultValue="overview">
                                            <TabsList variant="line" className="mb-5">
                                                <TabsTrigger value="overview">Level utama</TabsTrigger>
                                                <TabsTrigger value="indicators">Indikator</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="overview">
                                                <StatRow label="Support terdekat" value={formatRupiah(d.technical.indicators.support1)} sub={`Support berikutnya ${formatRupiah(d.technical.indicators.support2)}`} />
                                                <StatRow label="Resisten terdekat" value={formatRupiah(d.technical.indicators.resistance1)} sub={`Resisten berikutnya ${formatRupiah(d.technical.indicators.resistance2)}`} />
                                                <StatRow label="Rata-rata volume" value={formatCompactVolume(d.technical.indicators.volumeAvg)} sub={d.technical.indicatorNotes?.volumeAvg} />
                                                <StatRow label="ATR" value={formatRupiah(d.technical.indicators.atr)} sub={d.technical.indicatorNotes?.atr} />
                                            </TabsContent>
                                            <TabsContent value="indicators">
                                                <StatRow label="MA20" value={formatRupiah(d.technical.indicators.ma20)} sub={d.technical.indicatorNotes?.ma20} />
                                                <StatRow label="MA50" value={formatRupiah(d.technical.indicators.ma50)} sub={d.technical.indicatorNotes?.ma50} />
                                                <StatRow label="MA200" value={formatRupiah(d.technical.indicators.ma200)} sub={d.technical.indicatorNotes?.ma200} />
                                                <StatRow label="RSI (14)" value={formatNumber(d.technical.indicators.rsi14, 2)} sub={d.technical.indicatorNotes?.rsi14} />
                                                <StatRow label="MACD" value={d.technical.indicators.macd.value} sub={`${d.technical.indicators.macd.text}${d.technical.indicatorNotes?.macd ? ` · ${d.technical.indicatorNotes.macd}` : ""}`} />
                                                <StatRow label="Stochastic" value={d.technical.indicators.stochastic.value} sub={`${d.technical.indicators.stochastic.text}${d.technical.indicatorNotes?.stochastic ? ` · ${d.technical.indicatorNotes.stochastic}` : ""}`} />
                                                <StatRow label="Bollinger Bands" value={d.technical.indicators.bollingerBands} sub={d.technical.indicatorNotes?.bollingerBands} />
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                    <div className="border-t border-border/70 p-5 sm:p-6 lg:border-t-0">
                                        <h3 className="text-sm font-semibold text-foreground">Sinyal teknikal</h3>
                                        <ul className="mt-3 space-y-1">
                                            {d.technical.signals.map((signal, i) => <SignalItem key={i} text={signal} />)}
                                        </ul>
                                    </div>
                                </div>
                            </AnalysisSurface>
                        </section>

                        <section>
                            <ResultSectionHeading title="Analisis fundamental" />
                            <AnalysisSurface>
                                {d.fundamental.summary ? (
                                    <div className="border-b border-border/70 bg-muted/20 px-5 py-3.5 text-sm leading-6 text-muted-foreground sm:px-6">
                                        <span className="mr-2 font-semibold text-foreground">Interpretasi</span>
                                        {d.fundamental.summary}
                                    </div>
                                ) : null}
                                <Tabs defaultValue="overview">
                                    <div className="border-b border-border/70 px-5 pt-4 sm:px-6">
                                        <TabsList variant="line">
                                            <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
                                            <TabsTrigger value="quarterly">Data kuartal</TabsTrigger>
                                        </TabsList>
                                    </div>
                                    <TabsContent value="overview" className="m-0">
                                        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                                            <div className="grid gap-x-8 p-5 sm:grid-cols-2 sm:p-6 lg:border-r lg:border-border/70">
                                                <StatRow label="P/E Ratio" value={d.fundamental.metrics.pe_ratio !== null ? `${formatNumber(d.fundamental.metrics.pe_ratio, 1)}x` : "N/A"} sub={d.fundamental.metricNotes?.pe_ratio || (d.fundamental.metrics.pe_sector_avg !== null ? `Rata-rata sektor ${formatNumber(d.fundamental.metrics.pe_sector_avg, 1)}x` : undefined)} />
                                                <StatRow label="PBV" value={d.fundamental.metrics.pbv !== null ? `${formatNumber(d.fundamental.metrics.pbv, 2)}x` : "N/A"} sub={d.fundamental.metricNotes?.pbv || (d.fundamental.metrics.pbv_sector_avg !== null ? `Rata-rata sektor ${formatNumber(d.fundamental.metrics.pbv_sector_avg, 2)}x` : undefined)} />
                                                <StatRow label="ROE" value={d.fundamental.metrics.roe !== null ? `${formatNumber(d.fundamental.metrics.roe, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.roe} />
                                                <StatRow label="ROA" value={d.fundamental.metrics.roa !== null ? `${formatNumber(d.fundamental.metrics.roa, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.roa} />
                                                <StatRow label="DER" value={d.fundamental.metrics.der !== null ? `${formatNumber(d.fundamental.metrics.der, 2)}x` : "N/A"} sub={d.fundamental.metricNotes?.der} />
                                                <StatRow label="Net profit margin" value={d.fundamental.metrics.npm !== null ? `${formatNumber(d.fundamental.metrics.npm, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.npm} />
                                                <StatRow label="Pertumbuhan EPS" value={d.fundamental.metrics.eps_growth_yoy !== null ? `${d.fundamental.metrics.eps_growth_yoy > 0 ? "+" : ""}${formatNumber(d.fundamental.metrics.eps_growth_yoy, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.eps_growth_yoy} />
                                                <StatRow label="Pertumbuhan pendapatan" value={d.fundamental.metrics.revenue_growth_yoy !== null ? `${d.fundamental.metrics.revenue_growth_yoy > 0 ? "+" : ""}${formatNumber(d.fundamental.metrics.revenue_growth_yoy, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.revenue_growth_yoy} />
                                                <StatRow label="Dividend yield" value={d.fundamental.metrics.dividend_yield !== null ? `${formatNumber(d.fundamental.metrics.dividend_yield, 2)}%` : "N/A"} sub={d.fundamental.metricNotes?.dividend_yield} />
                                                <StatRow label="Kapitalisasi pasar" value={formatTrillionValue(d.fundamental.metrics.market_cap_t)} />
                                            </div>
                                            <div className="border-t border-border/70 p-5 sm:p-6 lg:border-t-0">
                                                <h3 className="text-sm font-semibold text-foreground">Sinyal fundamental</h3>
                                                <ul className="mt-3 space-y-1">
                                                    {d.fundamental.signals.map((signal, i) => <SignalItem key={i} text={signal} />)}
                                                </ul>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="quarterly" className="m-0 p-5 sm:p-6">
                                        {(() => {
                                            const periods = d.fundamental.quarterly.map((q) => q.period)
                                            const percentFormat = (value: number | null) => value !== null && Number.isFinite(value) ? `${formatNumber(value, 2)}%` : "N/A"
                                            const epsFormat = (value: number | null) => value !== null && Number.isFinite(value) ? formatNumber(value, 2) : "N/A"
                                            const magnitudeFormat = (value: number | null) => formatFinancialMagnitude(value, quarterlyFinancialScale)
                                            const rows: Array<{ label: string; values: Array<number | null>; format: (value: number | null) => string }> = [
                                                { label: "Revenue", values: d.fundamental.quarterly.map((q) => q.revenue), format: magnitudeFormat },
                                                { label: "Laba Bersih", values: d.fundamental.quarterly.map((q) => q.netIncome), format: magnitudeFormat },
                                                { label: "NPM", values: d.fundamental.quarterly.map((q) => q.npm), format: percentFormat },
                                                { label: "ROE", values: d.fundamental.quarterly.map((q) => q.roe), format: percentFormat },
                                                { label: "EPS", values: d.fundamental.quarterly.map((q) => q.eps), format: epsFormat },
                                            ]

                                            return (
                                                <TooltipProvider>
                                                    <div>{rows.map((row) => <QuarterlyMetricRow key={row.label} label={row.label} periods={periods} values={row.values} format={row.format} />)}</div>
                                                </TooltipProvider>
                                            )
                                        })()}
                                    </TabsContent>
                                </Tabs>
                            </AnalysisSurface>
                        </section>

                        <section>
                            <ResultSectionHeading title="Berita terkait" />
                            <AnalysisSurface>
                                {newsLoading ? (
                                    <div className="grid gap-x-8 p-6 md:grid-cols-2 sm:p-8">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="grid grid-cols-[minmax(0,1fr)_88px] gap-4 border-b border-border/70 py-5 sm:grid-cols-[minmax(0,1fr)_112px]">
                                                <div><div className="mb-3 h-3 w-32 animate-pulse bg-muted" /><div className="mb-2 h-4 w-full animate-pulse bg-muted" /><div className="h-4 w-3/4 animate-pulse bg-muted" /></div>
                                                <div className="h-16 w-[88px] animate-pulse rounded-lg bg-muted sm:h-20 sm:w-28" />
                                            </div>
                                        ))}
                                    </div>
                                ) : newsStories.length > 0 ? (
                                    <div className="grid gap-x-8 px-6 md:grid-cols-2 sm:px-8">
                                        {newsStories.map((story) => {
                                            const publishedLabel = formatNewsTime(story.publishedAt)
                                            return (
                                                <a key={story.url} href={story.url} target="_blank" rel="noreferrer" className="group grid grid-cols-[minmax(0,1fr)_88px] gap-4 border-b border-border/70 py-6 sm:grid-cols-[minmax(0,1fr)_112px]">
                                                    <div className="min-w-0">
                                                        <div className="mb-2 text-xs text-muted-foreground"><span className="font-medium text-foreground/75">{story.source}</span>{publishedLabel ? <span> · {publishedLabel}</span> : null}</div>
                                                        <div className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-[#d07225]">{story.title}</div>
                                                        {story.snippet ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{story.snippet}</p> : null}
                                                    </div>
                                                    <div className="relative h-16 w-[88px] overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-28">
                                                        {story.imageUrl ? <img src={story.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none" }} /> : story.faviconUrl ? <div className="flex h-full w-full items-center justify-center"><img src={story.faviconUrl} alt="" className="h-7 w-7 opacity-70" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none" }} /></div> : <div className="flex h-full w-full items-center justify-center"><Newspaper className="h-5 w-5 text-muted-foreground/60" /></div>}
                                                    </div>
                                                </a>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-6 text-sm text-muted-foreground sm:p-8">{newsError ? "Berita belum tersedia saat ini." : "Belum ada berita relevan."}</div>
                                )}
                            </AnalysisSurface>
                        </section>

                        <p className="flex items-start justify-center gap-1.5 px-4 text-center text-xs leading-5 text-muted-foreground">
                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            Analisis ini dihasilkan oleh AI dan bukan saran investasi. Selalu lakukan riset mandiri sebelum mengambil keputusan.
                        </p>
                    </main>
                </div>
            </div>
        </AnalyzePageFrame>
    )
}

export default function AnalyzeV2Page() {
    return (
        <Suspense
            fallback={(
                <AnalyzePageFrame>
                    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                </AnalyzePageFrame>
            )}
        >
            <AnalyzeV2Content />
        </Suspense>
    )
}
