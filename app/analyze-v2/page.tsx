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
    ShieldCheck,
    Minus,
    TrendingDown,
    TrendingUp,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { StockSearch } from "@/components/stock-search"
import { AdvancedMultiChart } from "@/components/advanced-multi-chart"
import { TradingViewSingleTickerCard } from "@/components/tradingview-single-ticker-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

function formatPercentValue(value: number | null | undefined, direction: "gain" | "loss") {
    if (value === null || value === undefined || Number.isNaN(value)) return "N/A"
    const prefix = direction === "gain" ? "+" : "-"
    return `${prefix}${Math.abs(value).toFixed(2)}%`
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

function formatConfidence(value: Confidence | string | null | undefined) {
    if (!value) return "N/A"

    const labels: Record<string, string> = {
        low: "Rendah",
        medium: "Sedang",
        high: "Tinggi",
    }

    return labels[value.toLowerCase()] || value
}

function formatHoldingTerm(value: string | null | undefined) {
    if (!value) return "N/A"

    const labels: Record<string, string> = {
        short: "Pendek",
        short_term: "Pendek",
        medium: "Menengah",
        medium_term: "Menengah",
        long: "Panjang",
        long_term: "Panjang",
    }

    const normalized = value.toLowerCase().replace(/[\s-]+/g, "_")
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

function biasMeta(bias: MarketBias) {
    if (bias === "bullish") return { icon: TrendingUp, label: "bullish" }
    if (bias === "bearish") return { icon: TrendingDown, label: "bearish" }
    return { icon: Minus, label: "neutral" }
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
    const potentialLoss = d.riskPlan.entryPrice ? ((d.riskPlan.entryPrice - d.riskPlan.stopLoss) / d.riskPlan.entryPrice) * 100 : null
    const potentialGain = d.riskPlan.entryPrice ? ((d.riskPlan.takeProfit - d.riskPlan.entryPrice) / d.riskPlan.entryPrice) * 100 : null
    const bias = biasMeta(d.marketBias)
    const BiasIcon = bias.icon
    const quarterlyFinancialScale = inferQuarterlyFinancialScale(d.fundamental.quarterly)
    const riskMetrics = [
        {
            label: "Entry",
            value: formatRupiah(d.riskPlan.entryPrice),
            sub: formatEntryReference(d.riskPlan.entryReference),
        },
        {
            label: "Stop loss",
            value: formatRupiah(d.riskPlan.stopLoss),
            sub: formatPercentValue(potentialLoss, "loss"),
            subClassName: "text-red-700",
        },
        {
            label: "Take profit",
            value: formatRupiah(d.riskPlan.takeProfit),
            sub: formatPercentValue(potentialGain, "gain"),
            subClassName: "text-green-700",
        },
        {
            label: "R/R ratio",
            value: `1:${d.riskPlan.riskReward.toFixed(2)}`,
            sub: "Reward terhadap risiko",
        },
        {
            label: "Holding",
            value: formatHoldingTerm(d.riskPlan.holdingTerm),
            sub: "Horizon posisi",
        },
        {
            label: "Confidence",
            value: formatConfidence(d.riskPlan.confidence),
            sub: "Kualitas setup",
        },
    ]

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
                        <div className="-mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 h-1 bg-gradient-to-r from-[#487b78] via-[#d07225] to-transparent" />

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

                                <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 min-h-[136px] h-full flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Technical Score</div>
                                        <div className="mt-3 flex items-end justify-between gap-4">
                                            <div className="text-4xl font-bold font-ibm-plex-mono text-foreground leading-none">{d.technical.score}</div>
                                            <div className="w-28 pb-1"><ScoreBar score={d.technical.score} color={getScoreBarColor(d.technical.score)} /></div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground capitalize">
                                        <span>{d.technical.trend}</span>
                                        <span className="text-border">·</span>
                                        <span>{d.technical.momentum}</span>
                                        <span className="text-border">·</span>
                                        <span>{d.technical.volatility}</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 min-h-[136px] h-full flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Fundamental Score</div>
                                        <div className="mt-3 flex items-end justify-between gap-4">
                                            <div className="text-4xl font-bold font-ibm-plex-mono text-foreground leading-none">{d.fundamental.score}</div>
                                            <div className="w-28 pb-1"><ScoreBar score={d.fundamental.score} color={getScoreBarColor(d.fundamental.score)} /></div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                        <span className="capitalize">Valuasi: {d.fundamental.valuation}</span>
                                        <Badge variant="outline" className="text-[10px] capitalize">{d.confidence}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border mb-6" />

                        <div className="mb-8 pt-2">
                            <AdvancedMultiChart
                                data={{ dates: [], close: [], ma20: [], ma50: [], foreignFlowCumulative: [] }}
                                symbol={d.ticker}
                            />
                        </div>

                        <div className="mb-7 rounded-xl border border-border/70 bg-background/70 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-semibold">Ringkasan AI</span>
                                    </div>
                                    <p className="max-w-5xl text-sm leading-relaxed text-muted-foreground">{d.llmSummary}</p>
                                </div>
                                <Badge variant="secondary" className="w-fit shrink-0 capitalize text-xs gap-1">
                                    <BiasIcon className="w-3 h-3" />
                                    {bias.label}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {d.drivers.map((driver, i) => (
                                    <span key={i} className="text-xs leading-relaxed px-2.5 py-1 rounded-md bg-card text-muted-foreground border border-border/70">
                                        {driver}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-border mb-6" />

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-semibold">Rencana Risk Management</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 mb-4">
                                {riskMetrics.map((metric) => (
                                    <div key={metric.label} className="min-h-[104px] rounded-lg border border-border/70 bg-background/70 p-3.5">
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{metric.label}</div>
                                        <div className="text-base font-bold font-ibm-plex-mono leading-tight text-foreground break-words">{metric.value}</div>
                                        <div className={`mt-1 text-[11px] leading-snug ${metric.subClassName || "text-muted-foreground"}`}>{metric.sub}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 rounded-lg bg-background/70 border border-border/70">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">Catatan Penting</span>
                                </div>
                                {d.riskPlan.summary ? <p className="text-sm leading-relaxed text-muted-foreground mb-2">{d.riskPlan.summary}</p> : null}
                                <ul className="space-y-1">
                                    {d.riskPlan.notes.map((note, i) => (
                                        <li key={i} className="text-sm leading-relaxed text-muted-foreground flex items-start gap-2">
                                            <span className="mt-1 text-muted-foreground/70">•</span>
                                            <span>{note}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

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
                                    <div className="overflow-x-auto rounded-xl border border-border/70 bg-background/60">
                                        <table className="min-w-full text-[11px] sm:text-xs">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="px-4 py-3 text-left text-muted-foreground font-medium first:pl-5">Periode</th>
                                                    <th className="px-4 py-3 text-right text-muted-foreground font-medium">Revenue</th>
                                                    <th className="px-4 py-3 text-right text-muted-foreground font-medium">Laba Bersih</th>
                                                    <th className="px-4 py-3 text-right text-muted-foreground font-medium">NPM</th>
                                                    <th className="px-4 py-3 text-right text-muted-foreground font-medium">ROE</th>
                                                    <th className="px-4 py-3 text-right text-muted-foreground font-medium last:pr-5">EPS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {d.fundamental.quarterly.map((q, i) => (
                                                    <tr key={i} className="border-b border-border/40 transition-colors hover:bg-muted/30 last:border-0">
                                                        <td className="px-4 py-3 font-medium font-ibm-plex-mono first:pl-5">{q.period}</td>
                                                        <td className="px-4 py-3 text-right font-ibm-plex-mono whitespace-nowrap">{formatFinancialMagnitude(q.revenue, quarterlyFinancialScale)}</td>
                                                        <td className="px-4 py-3 text-right font-ibm-plex-mono whitespace-nowrap">{formatFinancialMagnitude(q.netIncome, quarterlyFinancialScale)}</td>
                                                        <td className="px-4 py-3 text-right font-ibm-plex-mono whitespace-nowrap">{q.npm !== null ? `${formatNumber(q.npm, 2)}%` : "N/A"}</td>
                                                        <td className="px-4 py-3 text-right font-ibm-plex-mono whitespace-nowrap">{q.roe !== null ? `${formatNumber(q.roe, 2)}%` : "N/A"}</td>
                                                        <td className="px-4 py-3 text-right font-ibm-plex-mono whitespace-nowrap last:pr-5">{q.eps !== null ? formatNumber(q.eps, 2) : "N/A"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
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
