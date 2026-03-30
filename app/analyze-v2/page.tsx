"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useClerk, useUser } from "@clerk/nextjs"
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowLeft,
    ArrowUpRight,
    Brain,
    CircleDot,
    Clock,
    Info,
    Layers,
    PieChart,
    ShieldCheck,
    Sparkles,
    Minus,
    TrendingDown,
    TrendingUp,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { StockSearch } from "@/components/stock-search"
import { AdvancedMultiChart } from "@/components/advanced-multi-chart"
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

function AiBadge() {
    return (
        <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: "rgba(208,114,37,0.1)", color: "#d07225", border: "1px solid rgba(208,114,37,0.2)" }}
        >
            <Sparkles className="w-2.5 h-2.5" />
            AI
        </span>
    )
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

    if (!urlTicker || (loading && !data)) {
        return (
            <div className="min-h-screen bg-background dotted-background flex flex-col">
                <Navbar />
                <TickerTape />
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
                <TickerTape />
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
    const isPositive = d.changePct >= 0
    const potentialLoss = ((d.riskPlan.entryPrice - d.riskPlan.stopLoss) / d.riskPlan.entryPrice) * 100
    const potentialGain = ((d.riskPlan.takeProfit - d.riskPlan.entryPrice) / d.riskPlan.entryPrice) * 100
    const bias = biasMeta(d.marketBias)
    const BiasIcon = bias.icon
    const quarterlyFinancialScale = inferQuarterlyFinancialScale(d.fundamental.quarterly)

    return (
        <div className="min-h-screen bg-background dotted-background flex flex-col">
            <Navbar />
            <TickerTape />
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

                        <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-7">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-border flex-shrink-0 relative overflow-hidden">
                                        <Image
                                            src={`/stock_icons/${d.ticker}.png`}
                                            alt={d.ticker}
                                            fill
                                            sizes="40px"
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
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl font-bold font-ibm-plex-mono tracking-tight">{d.ticker}</h1>
                                            {d.syariah ? <Badge variant="outline" className="text-[10px]">Syariah</Badge> : null}
                                            <Badge variant="outline" className="text-[10px]">{d.dataMode}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{d.companyName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-1">
                                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{d.sector}</span>
                                    <span>·</span>
                                    <span className="capitalize">{d.marketCapGroup} Cap</span>
                                    <span>·</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Per {d.asOf}</span>
                                </div>
                            </div>

                            <div className="flex-shrink-0 w-full lg:w-auto grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                                <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 h-full flex flex-col lg:text-right">
                                    <div className="text-3xl sm:text-4xl font-bold font-ibm-plex-mono">Rp {d.price.toLocaleString("id-ID")}</div>
                                    <div className={`text-sm font-semibold flex items-center lg:justify-end gap-1 mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        {isPositive ? "+" : ""}{d.changePct.toFixed(2)}%
                                    </div>
                                    <div className="flex items-center gap-4 mt-auto pt-2 text-[11px] text-muted-foreground lg:justify-end font-ibm-plex-mono">
                                        <span>Vol {formatCompactVolume(d.volume)}</span>
                                        <span>52w H {d.high52w.toLocaleString("id-ID")}</span>
                                        <span>52w L {d.low52w.toLocaleString("id-ID")}</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Technical Score</div>
                                        <div className="flex items-end justify-between gap-3">
                                            <div className="text-3xl font-bold font-ibm-plex-mono text-foreground">{d.technical.score}</div>
                                            <div className="w-24"><ScoreBar score={d.technical.score} color={getScoreBarColor(d.technical.score)} /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Fundamental Score</div>
                                        <div className="flex items-end justify-between gap-3">
                                            <div className="text-3xl font-bold font-ibm-plex-mono text-foreground">{d.fundamental.score}</div>
                                            <div className="w-24"><ScoreBar score={d.fundamental.score} color={getScoreBarColor(d.fundamental.score)} /></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 justify-end mt-3">
                                        <Badge variant="outline" className="text-[10px] capitalize">{d.confidence}</Badge>
                                        <AiBadge />
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

                        <div className="mb-7 rounded-xl border border-border/70 bg-background/60 p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">Ringkasan AI</span>
                                <AiBadge />
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">{d.llmSummary}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="secondary" className="capitalize text-xs gap-1">
                                    <BiasIcon className="w-3 h-3" />
                                    {bias.label}
                                </Badge>
                                {d.drivers.map((driver, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-card text-muted-foreground border border-border/70">
                                        {driver}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-border mb-6" />

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">Rencana Risk Management</span>
                                <AiBadge />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                                <div className="p-3 rounded-lg border border-border/70 bg-white">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Entry</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono">{d.riskPlan.entryPrice.toLocaleString("id-ID")}</div>
                                    <div className="text-[10px] text-muted-foreground capitalize mt-0.5">{d.riskPlan.entryReference}</div>
                                </div>
                                <div className="p-3 rounded-lg border border-red-200/70 bg-white">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Stop Loss</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono text-red-600">{d.riskPlan.stopLoss.toLocaleString("id-ID")}</div>
                                    <div className="text-[10px] text-red-600 mt-0.5 font-ibm-plex-mono">-{potentialLoss.toFixed(2)}%</div>
                                </div>
                                <div className="p-3 rounded-lg border border-emerald-200/70 bg-white">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Take Profit</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono text-green-600">{d.riskPlan.takeProfit.toLocaleString("id-ID")}</div>
                                    <div className="text-[10px] text-green-600 mt-0.5 font-ibm-plex-mono">+{potentialGain.toFixed(2)}%</div>
                                </div>
                                <div className="p-3 rounded-lg border border-border/70 bg-white">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">R/R Ratio</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono">1:{d.riskPlan.riskReward.toFixed(2)}</div>
                                </div>
                                <div className="p-3 rounded-lg border border-border/70 bg-white">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Holding</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono capitalize">{d.riskPlan.holdingTerm}</div>
                                </div>
                                <div className="p-3 rounded-lg border border-border/70 bg-white">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Confidence</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono capitalize">{d.riskPlan.confidence}</div>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-white border border-border/70">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">Catatan Penting</span>
                                    <AiBadge />
                                </div>
                                {d.riskPlan.summary ? <p className="text-xs text-muted-foreground mb-2">{d.riskPlan.summary}</p> : null}
                                <ul className="space-y-0.5">
                                    {d.riskPlan.notes.map((note, i) => (
                                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>{note}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-5">
                        <Card className="p-6 border-border/70 bg-card shadow-sm overflow-hidden">
                            <div className="-mx-6 -mt-6 mb-5 h-1 bg-gradient-to-r from-[#487b78] to-transparent" />
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="text-sm font-semibold">Analisis Teknikal</h3>
                                        <AiBadge />
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
                            <div className="-mx-6 -mt-6 mb-5 h-1 bg-gradient-to-r from-[#d07225] to-transparent" />
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <PieChart className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="text-sm font-semibold">Analisis Fundamental</h3>
                                        <AiBadge />
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
