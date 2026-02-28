"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PerformanceChart, BenchmarkType } from "@/components/performance-chart"
import { StockRecommendations } from "@/components/stock-recommendations"
import { MonthlyPerformanceHeatmap } from "@/components/monthly-performance-heatmap"
import { TradeHistoryTable } from "@/components/trade-history-table"
import { Loader2, AlertCircle, TrendingUp, BarChart3, Activity, Target, Zap, Clock, Trophy, TrendingDown, Pencil, LogIn } from "lucide-react"
import { BacktestResult } from "@/lib/api"
import { useUser, useClerk } from "@clerk/nextjs"
import { useUserTier } from "@/context/user-tier-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface StrategyPreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    strategyId: string | null
    strategyName?: string
}

export function StrategyPreviewDialog({
    open,
    onOpenChange,
    strategyId,
    strategyName,
}: StrategyPreviewDialogProps) {
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const [results, setResults] = useState<BacktestResult | null>(null)
    const [strategy, setStrategy] = useState<{ id: number; name: string; description?: string } | null>(null)
    const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkType>("ihsg")
    const [elapsedTime, setElapsedTime] = useState("0.0")
    const [previewState, setPreviewState] = useState<'confirm' | 'showing'>('confirm')

    const { isSignedIn, isLoaded } = useUser()
    const { openSignIn } = useClerk()
    const { limits, usage, refreshTier } = useUserTier()

    useEffect(() => {
        if (open && isLoaded && !isSignedIn) {
            onOpenChange(false)
            openSignIn()
        }
    }, [open, isLoaded, isSignedIn, onOpenChange, openSignIn])

    // Elapsed time ticker
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (loading) {
            const startTime = Date.now()
            setElapsedTime("0.0")
            interval = setInterval(() => {
                const ms = Date.now() - startTime
                setElapsedTime((ms / 1000).toFixed(1))
            }, 100)
        }
        return () => clearInterval(interval)
    }, [loading])

    // Fetch preview when dialog opens with a strategy
    const fetchPreview = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)
        setResults(null)
        setStrategy(null)

        try {
            const response = await fetch("/api/strategies/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ strategyId: id }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.message || "Failed to load strategy preview")
            }

            setResults(data.results)
            setStrategy(data.strategy)

            // Refresh user tier context to update the consumed backtest quota
            if (isSignedIn) {
                refreshTier()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load preview")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!open) {
            // Reset state on close
            setResults(null)
            setError(null)
            setStrategy(null)
            setLoading(false)
            setPreviewState('confirm')
        }
    }, [open])

    const handleConfirmPreview = () => {
        if (!strategyId) return
        setPreviewState('showing')
        fetchPreview(strategyId)
    }

    const handleEditStrategy = async () => {
        if (!strategyId) return
        setIsEditing(true)
        try {
            // Pre-fetch the strategy config to ensure instant loading on the builder page
            const response = await fetch(`/api/strategies/${strategyId}`)
            if (response.ok) {
                const data = await response.json()
                if (data.success && data.strategy) {
                    sessionStorage.setItem(`strategy_prefetch_${strategyId}`, JSON.stringify(data.strategy))
                }
            }
        } catch (error) {
            console.error("Failed to prefetch strategy:", error)
        } finally {
            setIsEditing(false)
            onOpenChange(false)
            router.push(`/backtest?strategyId=${strategyId}`)
        }
    }

    const displayName = strategy?.name || strategyName || "Strategy Preview"

    // Build performance stats array (same logic as ResultsPanel)
    const performanceStats = results ? [
        {
            label: "Total Return",
            value: `${(results.summary?.totalReturn || 0).toFixed(1)}%`,
            positive: (results.summary?.totalReturn || 0) >= 0,
            icon: TrendingUp,
            tooltip: "Persentase keuntungan atau kerugian total portofolio selama periode backtest."
        },
        {
            label: "Annualized Return",
            value: `${(results.summary?.annualizedReturn || 0).toFixed(1)}%`,
            positive: (results.summary?.annualizedReturn || 0) >= 0,
            icon: BarChart3,
            tooltip: "Compound Annual Growth Rate (CAGR) mewakili pertumbuhan tahunan portofolio."
        },
        {
            label: "Max Drawdown",
            value: `${(results.summary?.maxDrawdown || 0).toFixed(1)}%`,
            positive: (results.summary?.maxDrawdown || 0) >= 0,
            icon: Activity,
            tooltip: "Kerugian maksimum dari puncak tertinggi ke titik terendah portofolio."
        },
        {
            label: "Win Rate",
            value: `${(results.summary?.winRate || 0).toFixed(1)}%`,
            positive: (results.summary?.winRate || 0) >= 50,
            icon: Target,
            tooltip: "Persentase perdagangan yang menguntungkan dari semua perdagangan."
        },
        {
            label: "Sharpe Ratio",
            value: `${(results.summary?.sharpeRatio || 0).toFixed(2)}`,
            positive: (results.summary?.sharpeRatio || 0) >= 1,
            icon: Zap,
            tooltip: "Rasio risk-adjusted return. > 1 dianggap baik, > 2 sangat baik."
        },
        {
            label: "Total Trades",
            value: `${results.summary?.totalTrades || 0}`,
            neutral: true,
            icon: BarChart3,
            tooltip: "Total jumlah perdagangan yang dieksekusi selama periode backtest."
        },
        {
            label: "Avg Hold Days",
            value: `${(results.summary?.averageHoldingDays || 0).toFixed(1)}`,
            neutral: true,
            icon: Clock,
            tooltip: "Rata-rata jumlah hari posisi saham ditahan."
        },
        {
            label: "Best Trade",
            value: results.summary?.bestTickers?.[0]?.ticker || results.summary?.bestTrade?.ticker || "N/A",
            subValue: results.summary?.bestTickers?.[0]?.totalReturnPct != null
                ? `+${results.summary.bestTickers[0].totalReturnPct.toFixed(1)}%`
                : results.summary?.bestTrade?.return != null
                    ? `+${results.summary.bestTrade.return.toFixed(1)}%`
                    : null,
            subPositive: true,
            icon: Trophy,
            tooltip: "Saham yang menghasilkan persentase keuntungan tertinggi."
        },
    ] : []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={previewState === 'confirm'
                    ? "sm:max-w-md"
                    : "max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden flex flex-col"
                }
                onPointerDownOutside={(e) => {
                    if (loading) e.preventDefault()
                }}
            >
                {previewState === 'confirm' ? (
                    <>
                        {!isLoaded ? (
                            <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin" /></div>
                        ) : !isSignedIn ? null : (
                            <>
                                <DialogHeader className="items-center text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                        <BarChart3 className="h-8 w-8 text-slate-600" />
                                    </div>
                                    <DialogTitle className="font-mono text-xl">Preview Strategi</DialogTitle>
                                    <DialogDescription className="font-mono text-sm text-muted-foreground text-center pt-2 w-full" asChild>
                                        <div className="space-y-3">
                                            {limits.backtest !== -1 && usage.backtest >= limits.backtest ? (
                                                <>
                                                    <p>Kuota backtest kamu sudah habis.</p>
                                                    <p className="text-sm">
                                                        Kamu telah menggunakan{' '}
                                                        <span
                                                            className="inline-block px-2 py-0.5 rounded-md font-semibold text-xs text-red-700"
                                                            style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                                        >
                                                            {usage.backtest}/{limits.backtest}
                                                        </span>{' '}
                                                        slot kuota. Upgrade plan untuk menambah kuota.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>Apakah kamu yakin ingin membuka preview strategi ini?</p>
                                                    <p className="text-sm">
                                                        Sisa kuota backtest kamu:{' '}
                                                        <span
                                                            className="inline-block px-2 py-0.5 rounded-md font-semibold text-xs text-foreground"
                                                            style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: 'rgba(140, 188, 185, 0.15)' }}
                                                        >
                                                            {limits.backtest === -1 ? '∞' : (limits.backtest - usage.backtest)}
                                                        </span>
                                                        {limits.backtest !== -1 && (
                                                            <span className="text-muted-foreground"> dari {limits.backtest} slot</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Membuka preview akan memotong kuota backtest kamu.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-3 pt-4 w-full">
                                    {limits.backtest !== -1 && usage.backtest >= limits.backtest ? (
                                        <Link href="/harga" onClick={() => onOpenChange(false)} className="w-full block">
                                            <Button className="w-full font-mono bg-[#d07225] text-white hover:bg-[#a65b1d]">
                                                Upgrade Plan
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className="w-full font-mono bg-[#d07225] text-white hover:bg-[#a65b1d]" onClick={handleConfirmPreview}>
                                            Ya, Lanjutkan
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full font-mono" onClick={() => onOpenChange(false)}>
                                        Batal
                                    </Button>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {/* Fixed Header */}
                        <div className="border-b border-border px-6 py-4 flex-shrink-0 flex items-start justify-between gap-4 pr-12">
                            <DialogHeader>
                                <DialogTitle className="font-mono text-lg font-bold flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: '#d07225' }}
                                    />
                                    {displayName}
                                </DialogTitle>
                                {strategy?.description && (
                                    <DialogDescription className="text-sm text-muted-foreground mt-1 text-left">
                                        {strategy.description}
                                    </DialogDescription>
                                )}
                            </DialogHeader>
                            {strategyId && (
                                <Button
                                    onClick={handleEditStrategy}
                                    disabled={isEditing}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1.5 border-[#d07225]/30 text-[#d07225] hover:bg-[#d07225] hover:text-white transition-colors"
                                >
                                    {isEditing ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Pencil className="w-3.5 h-3.5" />
                                    )}
                                    <span className="hidden sm:inline">Edit Strategy</span>
                                </Button>
                            )}
                        </div>

                        {/* Scrollable Content */}
                        <ScrollArea className="flex-1 h-[calc(90vh-80px)]">
                            <div className="p-6">
                                {/* Loading State */}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-32">
                                        <div className="relative">
                                            <div
                                                className="absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse"
                                                style={{ backgroundColor: '#d07225' }}
                                            />
                                            <Loader2
                                                className="h-12 w-12 animate-spin relative z-10"
                                                style={{ color: '#d07225' }}
                                            />
                                        </div>
                                        <p className="text-muted-foreground font-mono text-sm mt-6">
                                            Memuat preview strategi...
                                        </p>
                                        <p className="text-muted-foreground/60 font-mono text-xs mt-1">
                                            {elapsedTime}s
                                        </p>
                                        <div className="flex items-center gap-2 mt-4">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                                                    style={{
                                                        backgroundColor: '#d07225',
                                                        animationDelay: `${i * 0.15}s`,
                                                        opacity: 0.4 + (i * 0.2),
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && !loading && (
                                    <div className="flex flex-col items-center justify-center py-32">
                                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                            <AlertCircle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <h3 className="text-base font-semibold text-foreground mb-2">
                                            Gagal Memuat Preview
                                        </h3>
                                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                {/* Results */}
                                {results && !loading && (
                                    <div className="space-y-6">
                                        {/* === SECTION 1: Performance Chart === */}
                                        <Card className="rounded-md">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-foreground font-mono font-bold text-base">
                                                    Performance Chart
                                                </CardTitle>
                                                {/* Benchmark Toggle */}
                                                <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-mono">
                                                    <button
                                                        onClick={() => setSelectedBenchmark("ihsg")}
                                                        className={`px-3 py-1.5 rounded-md transition-all ${selectedBenchmark === "ihsg"
                                                            ? "bg-white text-slate-900 shadow-sm"
                                                            : "text-slate-500 hover:text-slate-700"
                                                            }`}
                                                    >
                                                        IHSG
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedBenchmark("lq45")}
                                                        className={`px-3 py-1.5 rounded-md transition-all ${selectedBenchmark === "lq45"
                                                            ? "bg-white text-slate-900 shadow-sm"
                                                            : "text-slate-500 hover:text-slate-700"
                                                            }`}
                                                    >
                                                        LQ45
                                                    </button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-[350px]">
                                                    <PerformanceChart
                                                        data={results?.dailyPortfolio}
                                                        selectedBenchmark={selectedBenchmark}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* === SECTION 2: Key Statistics === */}
                                        <Card className="rounded-md">
                                            <CardHeader>
                                                <CardTitle className="text-foreground font-mono font-bold text-base">
                                                    Key Statistics
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <TooltipProvider>
                                                        {performanceStats.map((stat, index) => (
                                                            <Tooltip key={index}>
                                                                <TooltipTrigger asChild>
                                                                    <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border/50 hover:bg-secondary/70 transition-colors">
                                                                        <div className="flex items-center justify-center gap-1.5 mb-2">
                                                                            <stat.icon className="w-3 h-3 text-muted-foreground" />
                                                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                                                                {stat.label}
                                                                            </span>
                                                                        </div>
                                                                        {'subValue' in stat && stat.subValue ? (
                                                                            <div className="flex items-baseline justify-center gap-2">
                                                                                <span className="font-mono text-xl font-bold text-foreground">
                                                                                    {stat.value}
                                                                                </span>
                                                                                <span
                                                                                    className={`font-mono text-sm font-semibold ${stat.subPositive ? "text-green-600" : "text-red-500"}`}
                                                                                >
                                                                                    {stat.subValue}
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <div
                                                                                className={`font-mono text-xl font-bold ${('neutral' in stat && stat.neutral)
                                                                                    ? "text-foreground"
                                                                                    : stat.positive
                                                                                        ? "text-green-700"
                                                                                        : "text-red-600"
                                                                                    }`}
                                                                            >
                                                                                {stat.value}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="max-w-xs text-sm">{stat.tooltip}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ))}
                                                    </TooltipProvider>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* === SECTION 3: Current Portfolio / Stock Recommendations === */}
                                        <div>
                                            <StockRecommendations
                                                signals={results?.recentSignals?.signals || results?.signals}
                                                trades={results?.trades}
                                                currentPortfolio={(results as any)?.currentPortfolio}
                                            />
                                        </div>

                                        {/* === SECTION 4: Monthly Performance Heatmap === */}
                                        <MonthlyPerformanceHeatmap
                                            monthlyPerformance={results?.monthlyPerformance}
                                        />

                                        {/* === SECTION 5: Trade History === */}
                                        <Card className="rounded-md">
                                            <CardHeader>
                                                <CardTitle className="text-foreground font-mono font-bold text-base">
                                                    Trade History
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <TradeHistoryTable trades={results?.trades} />
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
