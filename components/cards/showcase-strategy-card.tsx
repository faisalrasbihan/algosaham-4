"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { Crown, Lock, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Strategy } from "./types"
import { generateSparklineData, generateHeatmapData } from "./utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// Bandar tier colors — consistent with navbar
const BANDAR_COLORS = {
    bg: '#d4af37',
    bgLight: 'rgba(212, 175, 55, 0.08)',
    bgMedium: 'rgba(212, 175, 55, 0.15)',
    text: '#d4af37',
    gradient: 'linear-gradient(135deg, #d4af37, #f0c75e)',
}

interface ShowcaseStrategyCardProps {
    strategy: Strategy
    onSubscribe?: (id: string) => void
    onCardClick?: () => void
    isSubscribed?: boolean
    isLoading?: boolean
    userTier?: string
}

export function ShowcaseStrategyCard({ strategy, onSubscribe, onCardClick, isSubscribed = false, isLoading = false, userTier = 'ritel' }: ShowcaseStrategyCardProps) {
    const [hoveredBar, setHoveredBar] = useState<number | null>(null)

    // Memoize the data so it doesn't regenerate on hover
    const sparklineData = useMemo(() => generateSparklineData(strategy.totalReturn), [strategy.totalReturn])
    const heatmapData = useMemo(() => generateHeatmapData(), [])

    const maxSparkline = Math.max(...sparklineData.map((d) => d.value))
    const minSparkline = Math.min(...sparklineData.map((d) => d.value))
    const sparklineRange = maxSparkline - minSparkline

    const isBandarUser = userTier?.toLowerCase() === 'bandar'

    const cardContent = (
        <Card
            className="min-w-[520px] flex-shrink-0 border border-border/60 hover:border-border transition-all duration-200 bg-gradient-to-br from-amber-50/40 to-card relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01]"
            onClick={() => {
                if (isBandarUser) onCardClick?.()
            }}
        >
            <CardContent className="p-5 relative z-10">
                <div className="space-y-3">
                    {/* Header: Title + Bandar Badge */}
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-foreground">{strategy.name}</h3>
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-sm flex-shrink-0 text-[10px] font-bold tracking-wide cursor-default"
                                        style={{
                                            background: BANDAR_COLORS.gradient,
                                            color: '#ffffff',
                                        }}
                                    >
                                        <Crown className="w-3 h-3" />
                                        BANDAR
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[200px]">
                                    <p className="text-xs">Strategi eksklusif untuk pengguna <strong>Bandar Plan</strong>. Upgrade untuk berlangganan.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Return with Sparkline */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Return</div>
                            <div
                                className={`text-3xl font-bold ${strategy.totalReturn >= 0 ? "text-emerald-600" : "text-red-500"}`}
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                                {strategy.totalReturn >= 0 ? "+" : ""}
                                {strategy.totalReturn.toFixed(2)}%
                            </div>
                        </div>

                        <div className="relative">
                            <div className="flex items-end gap-0.5 h-12 w-[134px]">
                                {sparklineData.map((data, i) => {
                                    const height = ((data.value - minSparkline) / sparklineRange) * 100
                                    return (
                                        <div
                                            key={i}
                                            className={`flex-1 ${strategy.totalReturn >= 0 ? "bg-emerald-400/50" : "bg-red-400/50"} rounded-sm transition-all ${hoveredBar === i ? "opacity-100" : "opacity-60"}`}
                                            style={{ height: `${height}%` }}
                                            onMouseEnter={() => setHoveredBar(i)}
                                            onMouseLeave={() => setHoveredBar(null)}
                                        />
                                    )
                                })}
                            </div>
                            {/* Tooltip */}
                            {hoveredBar !== null && (
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-md px-3 py-2 shadow-lg z-20 whitespace-nowrap">
                                    <div className="text-xs font-semibold text-foreground">{sparklineData[hoveredBar].month}</div>
                                    <div
                                        className={`text-xs font-semibold ${sparklineData[hoveredBar].return >= 0 ? "text-emerald-600" : "text-red-500"}`}
                                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                    >
                                        {sparklineData[hoveredBar].return >= 0 ? "+" : ""}
                                        {sparklineData[hoveredBar].return.toFixed(2)}%
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-4 pt-1">
                        {/* Left side metrics */}
                        <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
                            <div>
                                <div className="text-muted-foreground mb-0.5">Trades</div>
                                <div className="font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{strategy.totalTrades}</div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Success Rate</div>
                                <div
                                    className={`font-semibold ${strategy.winRate >= 60
                                        ? "text-emerald-600"
                                        : strategy.winRate >= 40
                                            ? "text-amber-500"
                                            : "text-red-500"
                                        }`}
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    {strategy.winRate.toFixed(0)}%
                                </div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Stocks</div>
                                <div className="font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{strategy.stocksHeld}</div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Quality</div>
                                <div
                                    className={`font-semibold ${strategy.sharpeRatio >= 2
                                        ? "text-emerald-600"
                                        : strategy.sharpeRatio >= 1
                                            ? "text-amber-500"
                                            : "text-red-500"
                                        }`}
                                >
                                    {strategy.sharpeRatio >= 2
                                        ? "Excellent"
                                        : strategy.sharpeRatio >= 1.5
                                            ? "Good"
                                            : strategy.sharpeRatio >= 1
                                                ? "Fair"
                                                : "Poor"}
                                </div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Avg Duration</div>
                                <div className="font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{strategy.avgTradeDuration}d</div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Max. Drawdown</div>
                                <div className="font-semibold text-red-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>-{Math.abs(strategy.maxDrawdown).toFixed(1)}%</div>
                            </div>
                        </div>

                        {/* Heatmap */}
                        <div className="flex-shrink-0">
                            <div className="text-xs text-muted-foreground mb-1">Monthly Performance</div>
                            <div className="grid grid-cols-6 gap-1">
                                {heatmapData.map((data, i) => (
                                    <div
                                        key={i}
                                        className={`w-5 h-5 rounded-sm ${data.color} flex items-center justify-center relative group`}
                                        title={`${data.month}: ${data.value >= 0 ? "+" : ""}${data.value.toFixed(1)}%`}
                                    >
                                        <span className="text-[8px] font-semibold text-foreground/60" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                            {data.month.charAt(0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Subscribe button */}
                    <div className="pt-2" onClick={(e) => { if (isBandarUser) e.stopPropagation() }}>
                        {isBandarUser ? (
                            <Button
                                size="sm"
                                className="w-full text-white font-medium hover:opacity-90 transition-all"
                                style={{ background: BANDAR_COLORS.gradient }}
                                onClick={() => onSubscribe?.(strategy.id)}
                                disabled={isLoading || isSubscribed}
                            >
                                {isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full font-medium transition-all cursor-pointer hover:text-white"
                                style={{
                                    borderColor: BANDAR_COLORS.bg,
                                    color: BANDAR_COLORS.text,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#d07225'
                                    e.currentTarget.style.borderColor = '#d07225'
                                    e.currentTarget.style.color = '#ffffff'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = ''
                                    e.currentTarget.style.borderColor = BANDAR_COLORS.bg
                                    e.currentTarget.style.color = BANDAR_COLORS.text
                                }}
                            >
                                <Lock className="w-3.5 h-3.5 mr-1.5" />
                                Upgrade untuk berlangganan
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const popoverContent = (
        <PopoverContent side="bottom" className="w-[260px] p-4 z-50" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: BANDAR_COLORS.gradient }}
                    >
                        <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Bandar Exclusive</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Strategi showcase eksklusif ini hanya tersedia untuk pengguna <strong className="text-foreground">Bandar Plan</strong>. Upgrade sekarang untuk akses penuh.
                </p>
                <Link href="/harga">
                    <Button
                        size="sm"
                        className="w-full text-white font-medium hover:opacity-90 transition-all group"
                        style={{ background: BANDAR_COLORS.gradient }}
                    >
                        Upgrade Plan
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                </Link>
            </div>
        </PopoverContent>
    )

    if (!isBandarUser) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    {cardContent}
                </PopoverTrigger>
                {popoverContent}
            </Popover>
        )
    }

    return cardContent
}
