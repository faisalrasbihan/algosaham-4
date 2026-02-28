"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { StockSearch } from "@/components/stock-search"
import { useUser, useClerk } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Brain,
    Zap,
    Clock,
    Layers,
    ArrowLeft,
    Info,
    Activity,
    Users,
    BarChart3,
    ShieldCheck,
    AlertTriangle,
    CircleDot,
    PieChart,
    LogIn,
} from "lucide-react"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
} from "recharts"
import { AdvancedMultiChart } from "@/components/advanced-multi-chart"

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const MOCK = {
    ticker: "BBCA",
    companyName: "PT Bank Central Asia Tbk",
    sector: "Financials",
    marketCapGroup: "Large",
    syariah: false,
    dataMode: "EOD",
    asOf: "2026-02-21",
    price: 9725,
    changePct: 1.83,
    volume: 42_850_000,
    high52w: 10_400,
    low52w: 7_850,

    overallScore: 74,
    confidence: "high",
    marketBias: "bullish",
    oneLiner: "Momentum kuat didukung fundamental solid — potensi continuation masih terbuka.",
    llmSummary:
        "BBCA menunjukkan penguatan tren jangka menengah dengan dukungan moving average 50 dan 200 yang konfluens bullish. RSI masih di zona comfortable (58), jauh dari overbought. Foreign flow menunjukkan net buy konsisten selama 5 hari terakhir (Rp 142M net buy). Fundamental tetap menjadi salah satu terkuat di sektor perbankan dengan ROE di atas 20%. Risiko utama ada di valuasi premium (P/E 24.1x vs rata-rata sektor 11.8x).",
    drivers: [
        "Trend naik konfluens MA50 & MA200",
        "Foreign flow net buy 5 hari",
        "RSI comfortable zone",
        "ROE > 20%",
    ],

    technical: {
        score: 71,
        confidence: "high",
        trend: "uptrend",
        momentum: "bullish",
        volatility: "moderate",
        indicators: {
            ma20: 9540,
            ma20History: [9300, 9350, 9420, 9480, 9510, 9530, 9540],
            ma50: 9280,
            ma50History: [9100, 9150, 9200, 9240, 9260, 9270, 9280],
            ma200: 8900,
            ma200History: [8840, 8850, 8860, 8870, 8880, 8890, 8900],
            rsi14: 58.4,
            rsi14History: [45, 48, 54, 59, 62, 60, 58.4],
            macd: { text: "Bullish Crossover", value: "0.24" },
            macdHistory: [-0.1, -0.05, 0.02, 0.1, 0.15, 0.2, 0.24],
            stochastic: { text: "Neutral", value: "62.5" },
            stochasticHistory: [30, 45, 60, 75, 80, 70, 62.5],
            bollingerBands: "Upper Band",
            atr: 120, // Average True Range
            volumeAvg: "45.2M",
            support1: 9450,
            support2: 9200,
            resistance1: 9850,
            resistance2: 10100
        },
        signals: [
            "Harga di atas MA50 dan MA200 — konfirmasi uptrend",
            "Golden cross terbentuk 12 hari yang lalu",
            "RSI di 58 — masih ada ruang naik sebelum overbought",
            "MACD histogram meningkat — momentum positif",
            "Volume di atas rata-rata 30 hari — partisipasi kuat",
        ],
    },

    fundamental: {
        score: 78,
        confidence: "high",
        valuation: "premium",
        metrics: {
            pe_ratio: 24.1,
            pe_sector_avg: 11.8,
            pbv: 4.8,
            pbv_sector_avg: 1.9,
            roe: 22.4,
            roa: 3.4,
            der: 0.6,
            npm: 38.2,
            eps_growth_yoy: 8.7,
            revenue_growth_yoy: 6.3,
            dividend_yield: 2.1,
            market_cap_t: 1210,
        },
        quarterly: [
            { period: "Q1'24", revenue: 22.4, netIncome: 12.1, npm: 36.2, roe: 21.1, eps: 298 },
            { period: "Q2'24", revenue: 23.8, netIncome: 12.9, npm: 37.8, roe: 21.8, eps: 316 },
            { period: "Q3'24", revenue: 24.2, netIncome: 13.3, npm: 38.1, roe: 22.0, eps: 328 },
            { period: "Q4'24", revenue: 25.1, netIncome: 14.0, npm: 38.9, roe: 22.6, eps: 345 },
            { period: "Q1'25", revenue: 24.9, netIncome: 13.8, npm: 37.5, roe: 21.9, eps: 340 },
            { period: "Q2'25", revenue: 26.0, netIncome: 14.5, npm: 38.0, roe: 22.3, eps: 358 },
            { period: "Q3'25", revenue: 26.8, netIncome: 14.9, npm: 38.4, roe: 22.5, eps: 367 },
            { period: "Q4'25", revenue: 27.3, netIncome: 15.2, npm: 38.6, roe: 22.6, eps: 375 },
        ],
        signals: [
            "Valuasi premium dibanding sektor — wajar untuk market leader",
            "ROE konsisten di atas 20% — efisiensi tinggi",
            "NPM meningkat stabil setiap kuartal — margin sehat",
            "DER rendah — struktur modal konservatif",
            "EPS growth YoY 8.7% — pertumbuhan laba solid",
        ],
    },

    riskPlan: {
        entryReference: "support level",
        entryPrice: 9600,
        stopLoss: 9200,
        takeProfit: 10400,
        riskReward: 2.0,
        holdingWindowDays: 15,
        notes: [
            "Entry dekat support MA50 untuk risk-reward optimal",
            "Stop loss di bawah swing low terakhir",
            "Target profit di resistance 52-week high",
            "Pertimbangkan trailing stop jika harga menembus Rp 10.000",
        ],
    },

    indicators: {
        movingAverage: {
            score: 72,
            confidence: "high",
            signals: [
                "Harga di atas semua MA utama (20/50/200) — bullish alignment",
                "Golden cross MA50 × MA200 terkonfirmasi",
                "Jarak harga ke MA200 +8.2% — belum overstretched",
            ],
            commentary:
                "Konfigurasi moving average saat ini menunjukkan bullish alignment yang kuat. Golden cross yang terbentuk 12 hari lalu semakin dikonfirmasi oleh price action. Jarak ke MA200 masih reasonable, menunjukkan tren belum overextended.",
        },
        rsi: {
            score: 65,
            confidence: "neutral",
            signals: [
                "RSI (14) di 58 — nyaman di zona bullish",
                "Tidak ada divergence bearish terdeteksi",
                "RSI masih jauh dari overbought (70+)",
            ],
            commentary:
                "RSI menunjukkan momentum yang sehat tanpa tanda-tanda overbought. Posisi di 58 memberikan ruang untuk kenaikan lebih lanjut sebelum mencapai zona jenuh beli.",
        },
        foreignFlow: {
            score: 80,
            confidence: "high",
            flowStrength5d: 2.34,
            signals: [
                "Net foreign buy Rp 142M dalam 5 hari terakhir",
                "Asing akumulasi konsisten di area support",
                "Flow strength 2.34% — akumulasi signifikan",
            ],
            commentary:
                "Aliran dana asing sangat positif dengan net buy konsisten selama 5 sesi terakhir. Pola akumulasi terlihat di area support, menunjukkan smart money masuk. Ini menjadi salah satu driver utama rekomendasi bullish.",
        },
    },

    ohlcv: {
        dates: Array.from({ length: 60 }, (_, i) => {
            const d = new Date("2025-12-01")
            d.setDate(d.getDate() + i)
            return d.toISOString().slice(0, 10)
        }),
        close: [
            8950, 9000, 8980, 9050, 9100, 9080, 9120, 9180, 9150, 9200, 9170, 9220, 9250, 9280, 9300,
            9270, 9310, 9350, 9380, 9400, 9370, 9350, 9380, 9420, 9450, 9430, 9470, 9500, 9480, 9520,
            9550, 9530, 9560, 9590, 9570, 9600, 9620, 9580, 9610, 9640, 9620, 9650, 9680, 9700, 9670,
            9690, 9720, 9710, 9740, 9760, 9730, 9750, 9700, 9680, 9710, 9730, 9700, 9720, 9710, 9725,
        ],
        ma20: [
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, 9210, 9220, 9230, 9248, 9270, 9290, 9305, 9320, 9340, 9355, 9372,
            9390, 9400, 9412, 9428, 9440, 9456, 9472, 9482, 9496, 9510, 9520, 9534, 9550, 9564, 9574,
            9588, 9600, 9610, 9622, 9636, 9644, 9656, 9664, 9672, 9680, 9690, 9696, 9704, 9710, 9716,
        ],
        ma50: [
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, 9350, 9360, 9370, 9380, 9390, 9400, 9410, 9420, 9430, 9440, 9450,
        ],
        rsi: [
            55, 58, 56, 60, 62, 61, 63, 65, 63, 64, 62, 64, 65, 66, 67,
            65, 66, 68, 69, 70, 68, 66, 67, 69, 70, 69, 71, 72, 70, 71,
            72, 70, 71, 72, 70, 71, 72, 69, 70, 71, 70, 71, 72, 73, 71,
            71, 72, 71, 73, 74, 72, 73, 70, 68, 69, 70, 68, 69, 68, 58,
        ],
        foreignFlowCumulative: [
            0, 12, 8, 22, 35, 30, 42, 55, 48, 60, 53, 62, 70, 78, 85,
            80, 88, 95, 102, 110, 105, 100, 105, 115, 125, 120, 130, 140, 135, 142,
            150, 145, 152, 160, 155, 162, 170, 164, 170, 178, 172, 180, 188, 195, 188,
            192, 200, 196, 205, 212, 205, 210, 200, 195, 200, 208, 200, 206, 210, 142,
        ],
    },
}

// ─── SMALL HELPERS ──────────────────────────────────────────────────────────

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

function ScoreBar({ score }: { score: number }) {
    const pct = Math.min(Math.max(score, 0), 100)
    return (
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: "#d07225" }}
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
        <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="text-right">
                <span className="text-sm font-semibold font-ibm-plex-mono">{value}</span>
                {sub && <div className="text-[11px] text-muted-foreground/60">{sub}</div>}
            </div>
        </div>
    )
}

function SparklineRow({ label, value, sub, data, dataKey = "value", stroke = "#d07225" }: { label: string; value: string; sub?: string; data: any[]; dataKey?: string; stroke?: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <span className="text-sm text-muted-foreground w-1/3 truncate pr-2">{label}</span>
            <div className="h-8 w-20 sm:w-24 shrink-0 mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="text-right w-1/3 shrink-0">
                <span className="text-sm font-semibold font-ibm-plex-mono">{value}</span>
                {sub && <div className="text-[11px] text-muted-foreground/60">{sub}</div>}
            </div>
        </div>
    )
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
            <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground">{p.name}:</span>
                    <span className="font-semibold font-ibm-plex-mono">{typeof p.value === "number" ? p.value.toLocaleString("id-ID") : p.value}</span>
                </div>
            ))}
        </div>
    )
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

function AnalyzeV2Content() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const urlTicker = searchParams.get('ticker')

    const [loading, setLoading] = useState(false)
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)
    const { isSignedIn, isLoaded } = useUser()
    const { openSignIn } = useClerk()

    const handleSearch = async (ticker: string) => {
        if (isLoaded && !isSignedIn) {
            openSignIn()
            return
        }
        setLoading(true)
        router.push(`/analyze-v2?ticker=${ticker.toUpperCase()}`)
    }

    useEffect(() => {
        setLoading(false)
    }, [urlTicker])

    if (!urlTicker) {
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

    const d = { ...MOCK }
    if (urlTicker) {
        d.ticker = urlTicker.toUpperCase()
    }
    const isPositive = d.changePct >= 0
    const potentialLoss = ((d.riskPlan.entryPrice - d.riskPlan.stopLoss) / d.riskPlan.entryPrice) * 100
    const potentialGain = ((d.riskPlan.takeProfit - d.riskPlan.entryPrice) / d.riskPlan.entryPrice) * 100

    return (
        <div className="min-h-screen bg-background dotted-background flex flex-col">
            <Navbar />
            <TickerTape />

            <div className="flex-1 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 md:mt-7 space-y-5">

                    {/* Back */}
                    <button
                        onClick={() => router.push('/analyze-v2')}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-[#d07225]/30 hover:bg-card transition-colors group shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Kembali ke Pencarian
                    </button>

                    {/* ━━━ HERO CARD ━━━ */}
                    <Card className="p-6 sm:p-8 border-border/70 bg-card shadow-sm overflow-hidden">
                        <div className="-mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 h-1 bg-gradient-to-r from-[#487b78] via-[#d07225] to-transparent" />
                        {/* Row 1: Stock info + Price + Score */}
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-7">

                            {/* Stock identity */}
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
                                                    ; (e.target as HTMLImageElement).parentElement!.appendChild(span)
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl font-bold font-ibm-plex-mono tracking-tight">{d.ticker}</h1>
                                            {d.syariah && <Badge variant="outline" className="text-[10px]">Syariah</Badge>}
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

                            {/* Price */}
                            <div className="flex-shrink-0 lg:text-right rounded-xl border border-border/70 bg-background/70 px-4 py-3">
                                <div className="text-3xl sm:text-4xl font-bold font-ibm-plex-mono">
                                    Rp {d.price.toLocaleString("id-ID")}
                                </div>
                                <div className={`text-sm font-semibold flex items-center lg:justify-end gap-1 mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {isPositive ? "+" : ""}{d.changePct.toFixed(2)}%
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground lg:justify-end font-ibm-plex-mono">
                                    <span>Vol {(d.volume / 1e6).toFixed(1)}M</span>
                                    <span>52w H {d.high52w.toLocaleString("id-ID")}</span>
                                    <span>52w L {d.low52w.toLocaleString("id-ID")}</span>
                                </div>
                            </div>

                            {/* Overall Score */}
                            <div className="flex-shrink-0 text-center lg:text-right rounded-xl border border-border/70 bg-background/70 px-4 py-3 min-w-[150px]">
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Skor Keseluruhan</div>
                                <div className="text-5xl font-bold font-ibm-plex-mono text-foreground">{d.overallScore}</div>
                                <div className="mt-2 mb-1"><ScoreBar score={d.overallScore} /></div>
                                <div className="flex items-center gap-2 justify-center lg:justify-end mt-2">
                                    <Badge variant="outline" className="text-[10px] capitalize">{d.confidence}</Badge>
                                    <AiBadge />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border mb-6" />

                        {/* ━━━ ADVANCED MULTI-CHART ━━━ */}
                        <div className="mb-8 pt-2">
                            <AdvancedMultiChart data={d.ohlcv as any} symbol={d.ticker} />
                        </div>

                        {/* Row 2: AI Summary */}
                        <div className="mb-7 rounded-xl border border-border/70 bg-background/60 p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">Ringkasan AI</span>
                                <AiBadge />
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">{d.llmSummary}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="secondary" className="capitalize text-xs gap-1">
                                    {d.marketBias === "bullish" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {d.marketBias}
                                </Badge>
                                {d.drivers.map((driver, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-card text-muted-foreground border border-border/70">
                                        {driver}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border mb-6" />

                        {/* Row 3: Risk Management */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">Rencana Risk Management</span>
                                <AiBadge />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                                {/* Entry */}
                                <div className="p-3 rounded-lg border border-border/70 bg-background/70">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Entry</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono">{d.riskPlan.entryPrice.toLocaleString("id-ID")}</div>
                                    <div className="text-[10px] text-muted-foreground capitalize mt-0.5">{d.riskPlan.entryReference}</div>
                                </div>
                                {/* Stop Loss */}
                                <div className="p-3 rounded-lg border border-red-200/70 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/20">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Stop Loss</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono text-red-600">{d.riskPlan.stopLoss.toLocaleString("id-ID")}</div>
                                    <div className="text-[10px] text-red-600 mt-0.5 font-ibm-plex-mono">-{potentialLoss.toFixed(2)}%</div>
                                </div>
                                {/* Take Profit */}
                                <div className="p-3 rounded-lg border border-emerald-200/70 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Take Profit</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono text-green-600">{d.riskPlan.takeProfit.toLocaleString("id-ID")}</div>
                                    <div className="text-[10px] text-green-600 mt-0.5 font-ibm-plex-mono">+{potentialGain.toFixed(2)}%</div>
                                </div>
                                {/* R/R */}
                                <div className="p-3 rounded-lg border border-border/70 bg-background/70">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">R/R Ratio</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono">1:{d.riskPlan.riskReward.toFixed(1)}</div>
                                </div>
                                {/* Holding */}
                                <div className="p-3 rounded-lg border border-border/70 bg-background/70">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Holding</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono">{d.riskPlan.holdingWindowDays}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">hari</span>
                                    </div>
                                </div>
                                {/* Confidence */}
                                <div className="p-3 rounded-lg border border-border/70 bg-background/70">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Confidence</div>
                                    <div className="text-lg font-bold font-ibm-plex-mono capitalize">{d.riskPlan.holdingWindowDays > 10 ? "Medium" : "High"}</div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="p-3 rounded-lg bg-background/70 border border-border/70">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">Catatan Penting</span>
                                    <AiBadge />
                                </div>
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



                    {/* ━━━ TECHNICAL + FUNDAMENTAL ━━━ */}
                    <div className="grid lg:grid-cols-2 gap-5">

                        {/* Technical */}
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
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold font-ibm-plex-mono">{d.technical.score}</div>
                                    <div className="w-20 mt-1"><ScoreBar score={d.technical.score} /></div>
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
                                    <StatRow label="Support Terdekat (S1)" value={`Rp ${d.technical.indicators.support1.toLocaleString("id-ID")}`} sub={`Support kuat di S2: Rp ${d.technical.indicators.support2.toLocaleString("id-ID")}`} />
                                    <StatRow label="Resisten Terdekat (R1)" value={`Rp ${d.technical.indicators.resistance1.toLocaleString("id-ID")}`} sub={`Resisten kuat di R2: Rp ${d.technical.indicators.resistance2.toLocaleString("id-ID")}`} />
                                    <StatRow label="Avg Volume (30D)" value={d.technical.indicators.volumeAvg} />
                                    <StatRow label="ATR (Volatility)" value={`Rp ${d.technical.indicators.atr}`} />
                                </TabsContent>

                                <TabsContent value="indicators">
                                    <SparklineRow label="Moving Average 20" value={`Rp ${d.technical.indicators.ma20.toLocaleString("id-ID")}`} sub={d.price > d.technical.indicators.ma20 ? "Harga di atas MA20" : "Harga di bawah MA20"} data={d.technical.indicators.ma20History.map((v, i) => ({ i, value: v }))} stroke={d.price > d.technical.indicators.ma20 ? "#16a34a" : "#dc2626"} />
                                    <SparklineRow label="Moving Average 50" value={`Rp ${d.technical.indicators.ma50.toLocaleString("id-ID")}`} sub={d.price > d.technical.indicators.ma50 ? "Harga di atas MA50" : "Harga di bawah MA50"} data={d.technical.indicators.ma50History.map((v, i) => ({ i, value: v }))} stroke={d.price > d.technical.indicators.ma50 ? "#16a34a" : "#dc2626"} />
                                    <SparklineRow label="Moving Average 200" value={`Rp ${d.technical.indicators.ma200.toLocaleString("id-ID")}`} sub={d.price > d.technical.indicators.ma200 ? "Harga di atas MA200" : "Harga di bawah MA200"} data={d.technical.indicators.ma200History.map((v, i) => ({ i, value: v }))} stroke={d.price > d.technical.indicators.ma200 ? "#16a34a" : "#dc2626"} />
                                    <SparklineRow label="RSI (14)" value={d.technical.indicators.rsi14.toString()} sub={d.technical.indicators.rsi14 > 50 ? "Zona Bullish" : "Zona Bearish"} data={d.technical.indicators.rsi14History.map((v, i) => ({ i, value: v }))} stroke="#8b5cf6" />
                                    <SparklineRow label="MACD" value={d.technical.indicators.macd.value} sub={d.technical.indicators.macd.text} data={d.technical.indicators.macdHistory.map((v, i) => ({ i, value: v }))} stroke="#d07225" />
                                    <SparklineRow label="Stochastic" value={d.technical.indicators.stochastic.value} sub={d.technical.indicators.stochastic.text} data={d.technical.indicators.stochasticHistory.map((v, i) => ({ i, value: v }))} stroke="#0ea5e9" />
                                    <StatRow label="Bollinger Bands" value={d.technical.indicators.bollingerBands} />
                                </TabsContent>
                            </Tabs>

                            <div className="border-t border-border pt-4 mt-4">
                                <div className="text-xs font-semibold text-muted-foreground mb-2">Sinyal Teknikal</div>
                                <ul className="space-y-0.5">
                                    {d.technical.signals.map((s, i) => <SignalItem key={i} text={s} />)}
                                </ul>
                            </div>
                        </Card>

                        {/* Fundamental */}
                        <Card className="p-6 border-border/70 bg-card shadow-sm overflow-hidden">
                            <div className="-mx-6 -mt-6 mb-5 h-1 bg-gradient-to-r from-[#d07225] to-transparent" />
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <PieChart className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="text-sm font-semibold">Analisis Fundamental</h3>
                                        <AiBadge />
                                    </div>
                                    <p className="text-xs text-muted-foreground capitalize">Valuasi: {d.fundamental.valuation} · MCap {d.fundamental.metrics.market_cap_t}T</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold font-ibm-plex-mono">{d.fundamental.score}</div>
                                    <div className="w-20 mt-1"><ScoreBar score={d.fundamental.score} /></div>
                                </div>
                            </div>

                            <Tabs defaultValue="overview">
                                <TabsList variant="line" className="mb-4">
                                    <TabsTrigger value="overview" className="text-xs">Ikhtisar</TabsTrigger>
                                    <TabsTrigger value="quarterly" className="text-xs">Data Kuartal</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview">
                                    <StatRow label="P/E Ratio" value={`${d.fundamental.metrics.pe_ratio.toFixed(1)}x`} sub={`Sektor avg: ${d.fundamental.metrics.pe_sector_avg.toFixed(1)}x`} />
                                    <StatRow label="PBV" value={`${d.fundamental.metrics.pbv.toFixed(1)}x`} sub={`Sektor avg: ${d.fundamental.metrics.pbv_sector_avg.toFixed(1)}x`} />
                                    <StatRow label="ROE" value={`${d.fundamental.metrics.roe.toFixed(1)}%`} />
                                    <StatRow label="ROA" value={`${d.fundamental.metrics.roa.toFixed(1)}%`} />
                                    <StatRow label="DER" value={`${d.fundamental.metrics.der.toFixed(1)}x`} />
                                    <StatRow label="Net Profit Margin" value={`${d.fundamental.metrics.npm.toFixed(1)}%`} />
                                    <StatRow label="EPS Growth YoY" value={`+${d.fundamental.metrics.eps_growth_yoy.toFixed(1)}%`} />
                                    <StatRow label="Revenue Growth YoY" value={`+${d.fundamental.metrics.revenue_growth_yoy.toFixed(1)}%`} />
                                    <StatRow label="Dividend Yield" value={`${d.fundamental.metrics.dividend_yield.toFixed(1)}%`} />
                                </TabsContent>

                                <TabsContent value="quarterly">
                                    {/* Bar chart */}
                                    <div className="h-36 mb-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={d.fundamental.quarterly} barGap={2}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                <XAxis dataKey="period" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                                                <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="revenue" fill="var(--secondary)" stroke="var(--border)" radius={[2, 2, 0, 0]} name="Revenue (T)" />
                                                <Bar dataKey="netIncome" fill="#d07225" radius={[2, 2, 0, 0]} name="Laba Bersih (T)" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto rounded-lg border border-border/70 bg-background/60">
                                        <table className="w-full text-[11px]">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="text-left pb-2 text-muted-foreground font-medium">Periode</th>
                                                    <th className="text-right pb-2 text-muted-foreground font-medium">Rev (T)</th>
                                                    <th className="text-right pb-2 text-muted-foreground font-medium">Laba (T)</th>
                                                    <th className="text-right pb-2 text-muted-foreground font-medium">NPM</th>
                                                    <th className="text-right pb-2 text-muted-foreground font-medium">ROE</th>
                                                    <th className="text-right pb-2 text-muted-foreground font-medium">EPS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {d.fundamental.quarterly.map((q, i) => (
                                                    <tr key={i} className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                                                        <td className="py-2 font-medium font-ibm-plex-mono">{q.period}</td>
                                                        <td className="py-2 text-right font-ibm-plex-mono">{q.revenue.toFixed(1)}</td>
                                                        <td className="py-2 text-right font-ibm-plex-mono">{q.netIncome.toFixed(1)}</td>
                                                        <td className="py-2 text-right font-ibm-plex-mono">{q.npm.toFixed(1)}%</td>
                                                        <td className="py-2 text-right font-ibm-plex-mono">{q.roe.toFixed(1)}%</td>
                                                        <td className="py-2 text-right font-ibm-plex-mono">{q.eps}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Signals */}
                            <div className="border-t border-border pt-4 mt-4">
                                <div className="text-xs font-semibold text-muted-foreground mb-2">Sinyal Fundamental</div>
                                <ul className="space-y-0.5">
                                    {d.fundamental.signals.map((s, i) => <SignalItem key={i} text={s} />)}
                                </ul>
                            </div>
                        </Card>
                    </div>



                    {/* Footer */}
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
