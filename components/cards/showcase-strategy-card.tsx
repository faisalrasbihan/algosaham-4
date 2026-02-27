"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { Lock, ArrowUpRight } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

// Bandar tier colors — consistent with navbar
const BANDAR_COLORS = {
    border: 'rgba(191, 160, 74, 0.32)',
    badgeBg: '#d4af37',
    badgeBorder: 'transparent',
    badgeText: '#ffffff',
    glow: 'rgba(212, 175, 55, 0.08)',
    accentDark: '#826923',
    button: '#3c3933',
    buttonHover: '#2f2c27',
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
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Memoize the data so it doesn't regenerate on hover
    const sparklineData = useMemo(() => generateSparklineData(strategy.totalReturn), [strategy.totalReturn])
    const heatmapData = useMemo(() => generateHeatmapData(), [])

    const maxSparkline = Math.max(...sparklineData.map((d) => d.value))
    const minSparkline = Math.min(...sparklineData.map((d) => d.value))
    const sparklineRange = maxSparkline - minSparkline

    const isBandarUser = userTier?.toLowerCase() === 'bandar' || userTier?.toLowerCase() === 'admin'

    const cardContent = (
        <Card
            className="w-[calc(100vw-3rem)] max-w-[520px] flex-shrink-0 border border-border bg-card relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] sm:min-w-[520px]"
            style={{
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px ${BANDAR_COLORS.glow}`,
                borderColor: BANDAR_COLORS.border,
                backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,248,243,0.98) 100%)",
            }}
            onClick={() => {
                if (isBandarUser) onCardClick?.()
            }}
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(191,160,74,0.45), transparent)" }}
            />
            <div
                className="pointer-events-none absolute right-0 top-0 h-32 w-32"
                style={{ background: "radial-gradient(circle at top right, rgba(212,175,55,0.14), transparent 68%)" }}
            />
            <CardContent className="relative z-10 p-4 sm:p-5">
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="pr-8 sm:pr-10">
                            <p
                                className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em]"
                                style={{ color: BANDAR_COLORS.accentDark }}
                            >
                                Master Vault
                            </p>
                            <h3 className="text-base font-bold text-foreground">{strategy.name}</h3>
                        </div>
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-md border text-xs font-bold flex-shrink-0 cursor-default shadow-sm"
                                        style={{
                                            background: BANDAR_COLORS.badgeBg,
                                            borderColor: BANDAR_COLORS.badgeBorder,
                                            color: BANDAR_COLORS.badgeText,
                                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                                        }}
                                        aria-label="Bandar protected strategy"
                                    >
                                        B
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[200px]">
                                    <p className="text-xs">Protected strategy for <strong>Bandar Plan</strong> users only.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Return with Sparkline */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Return</div>
                            <div
                                className={`text-2xl font-bold font-mono sm:text-3xl ${strategy.totalReturn >= 0 ? "text-emerald-600" : "text-red-500"}`}
                            >
                                {strategy.totalReturn >= 0 ? "+" : ""}
                                {strategy.totalReturn.toFixed(2)}%
                            </div>
                        </div>

                        <div className="relative self-start sm:self-auto">
                            <div className="flex h-10 w-full max-w-[148px] items-end gap-0.5 sm:h-12 sm:w-[134px]">
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
                                        className={`text-xs font-semibold font-mono ${sparklineData[hoveredBar].return >= 0 ? "text-emerald-600" : "text-red-500"}`}
                                    >
                                        {sparklineData[hoveredBar].return >= 0 ? "+" : ""}
                                        {sparklineData[hoveredBar].return.toFixed(2)}%
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-start">
                        {/* Left side metrics */}
                        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
                            <div>
                                <div className="text-muted-foreground mb-0.5">Trades</div>
                                <div className="font-semibold text-foreground font-mono">{strategy.totalTrades}</div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Success Rate</div>
                                <div
                                    className={`font-semibold font-mono ${strategy.winRate >= 60
                                        ? "text-emerald-600"
                                        : strategy.winRate >= 40
                                            ? "text-amber-500"
                                            : "text-red-500"
                                        }`}
                                >
                                    {strategy.winRate.toFixed(0)}%
                                </div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Stocks</div>
                                <div className="font-semibold text-foreground font-mono">{strategy.stocksHeld}</div>
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
                                <div className="font-semibold text-foreground font-mono">{strategy.avgTradeDuration}d</div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Max. Drawdown</div>
                                <div className="font-semibold text-red-500 font-mono">-{Math.abs(strategy.maxDrawdown).toFixed(1)}%</div>
                            </div>
                        </div>

                        {/* Heatmap */}
                        <div className="flex-shrink-0">
                            <div className="text-xs text-muted-foreground mb-1">Monthly Performance</div>
                            <div className="grid grid-cols-6 gap-1">
                                {heatmapData.map((data, i) => (
                                    <div
                                        key={i}
                                        className={`flex h-4 w-4 items-center justify-center rounded-sm relative group sm:h-5 sm:w-5 ${data.color}`}
                                        title={`${data.month}: ${data.value >= 0 ? "+" : ""}${data.value.toFixed(1)}%`}
                                    >
                                        <span className="text-[8px] font-semibold text-foreground/60 font-mono">
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
                                className="w-full text-white font-medium transition-colors"
                                style={{ backgroundColor: BANDAR_COLORS.button }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = BANDAR_COLORS.buttonHover
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = BANDAR_COLORS.button
                                }}
                                onClick={() => onSubscribe?.(strategy.id)}
                                disabled={isLoading || isSubscribed}
                            >
                                {isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full font-medium transition-all cursor-pointer bg-transparent"
                                style={{
                                    borderColor: BANDAR_COLORS.border,
                                    color: BANDAR_COLORS.accentDark,
                                    backgroundColor: "rgba(255,255,255,0.72)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(191, 160, 74, 0.12)'
                                    e.currentTarget.style.borderColor = BANDAR_COLORS.badgeBorder
                                    e.currentTarget.style.color = BANDAR_COLORS.accentDark
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.72)'
                                    e.currentTarget.style.borderColor = BANDAR_COLORS.border
                                    e.currentTarget.style.color = BANDAR_COLORS.accentDark
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
        <PopoverContent
            side="bottom"
            className="w-[260px] p-4 z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsPopoverOpen(true)}
            onMouseLeave={() => setIsPopoverOpen(false)}
        >
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div
                        className="flex h-6 w-6 items-center justify-center rounded-md border"
                        style={{
                            background: BANDAR_COLORS.badgeBg,
                            borderColor: BANDAR_COLORS.badgeBorder,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
                        }}
                    >
                        <span className="text-xs font-semibold" style={{ color: BANDAR_COLORS.badgeText }}>B</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">Bandar Exclusive</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Strategi showcase eksklusif ini hanya tersedia untuk pengguna <strong className="text-foreground">Bandar Plan</strong>. Upgrade sekarang untuk akses penuh.
                </p>
                <Link href="/harga">
                    <Button
                        size="sm"
                        className="w-full text-white font-medium transition-colors group"
                        style={{ backgroundColor: BANDAR_COLORS.button }}
                    >
                        Upgrade Plan
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                </Link>
            </div>
        </PopoverContent>
    )

    const dialogContent = (
        <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
                <div
                    className="mx-auto mb-4 mt-2 flex h-12 w-12 items-center justify-center rounded-xl border"
                    style={{
                        background: BANDAR_COLORS.badgeBg,
                        borderColor: BANDAR_COLORS.badgeBorder,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
                    }}
                >
                    <span className="text-lg font-semibold" style={{ color: BANDAR_COLORS.badgeText }}>B</span>
                </div>
                <DialogTitle className="text-center text-xl font-bold font-ibm-plex-mono">Akses Eksklusif Bandar</DialogTitle>
                <DialogDescription className="text-center pt-2 text-muted-foreground">
                    Strategi pada The Master Vault ini merupakan fitur premium yang dikurasi khusus untuk pengguna <strong>Bandar Plan</strong>. Masing-masing strategi disempurnakan oleh tim ahli kami. Upgrade ke paket Bandar untuk mendapat performa terbaik.
                </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-2 pb-2">
                <Link href="/harga" className="w-full">
                    <Button className="w-full text-white transition-colors font-semibold" style={{ backgroundColor: BANDAR_COLORS.button }}>
                        Upgrade ke Bandar
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </DialogContent>
    )

    if (!isBandarUser) {
        return (
            <>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <div
                        onMouseEnter={() => setIsPopoverOpen(true)}
                        onMouseLeave={() => setIsPopoverOpen(false)}
                        onClickCapture={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsPopoverOpen(false)
                            setIsDialogOpen(true)
                        }}
                        className="inline-block"
                    >
                        <PopoverTrigger asChild>
                            <div>{cardContent}</div>
                        </PopoverTrigger>
                    </div>
                    {popoverContent}
                </Popover>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    {dialogContent}
                </Dialog>
            </>
        )
    }

    return cardContent
}
