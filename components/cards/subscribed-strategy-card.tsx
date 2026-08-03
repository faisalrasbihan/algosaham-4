"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Info, TrendingUp, TrendingDown, Calendar, HeartOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Strategy } from "./types"

interface SubscribedStrategyCardProps {
    strategy: Strategy
    onUnsubscribe?: (strategy: Strategy) => void
    onClick?: (strategy: Strategy) => void
}

export function SubscribedStrategyCard({ strategy, onUnsubscribe, onClick }: SubscribedStrategyCardProps) {
    const formatPercent = (value: number, digits = 2) => {
        const normalized = Number.isFinite(value) ? value : 0
        return `${normalized > 0 ? "+" : ""}${normalized.toFixed(digits)}%`
    }
    const formatRawPercent = (value: number, digits = 2) => {
        const normalized = Number.isFinite(value) ? value : 0
        return `${normalized.toFixed(digits)}%`
    }

    const recommendedStocks = strategy.snapshotHoldings || strategy.topHoldings || [
        { symbol: "BBCA", color: "bg-blue-600" },
        { symbol: "BBRI", color: "bg-orange-500" },
        { symbol: "BREN", color: "bg-green-600" },
    ];

    return (
        <Card
            className="w-80 flex-shrink-0 cursor-pointer rounded-xl border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md"
            onClick={() => onClick?.(strategy)}
        >
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="truncate font-heading text-base font-semibold text-foreground">{strategy.name}</h3>
                                <Badge variant="secondary" className="border-border bg-muted text-xs font-medium text-muted-foreground">
                                    <Users className="w-3 h-3 mr-1" />
                                    <span className="font-mono">{strategy.subscribers}</span>
                                </Badge>
                            </div>

                            {strategy.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{strategy.description}</p>
                            )}

                            {strategy.creator && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    by <span className="text-ochre font-medium">{strategy.creator}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-border mt-1">
                        <span className="text-xs font-medium text-muted-foreground">Sinyal terbaru</span>
                        <TooltipProvider delayDuration={200}>
                            <div className="flex -space-x-2 py-1 px-1">
                                {recommendedStocks.slice(0, 3).map((stock: any, idx: number) => (
                                    <Tooltip key={idx}>
                                        <TooltipTrigger asChild>
                                            <Avatar className="inline-block h-9 w-9 rounded-full border-2 border-background cursor-pointer hover:border-ochre/50 hover:z-10 transition-colors">
                                                <AvatarImage src={`/stock_icons/${stock.symbol}.png`} alt={stock.symbol} />
                                                <AvatarFallback className={`${stock.color} text-white text-[10px] font-bold`}>
                                                    {stock.symbol}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="text-xs font-medium">{stock.symbol}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                                {recommendedStocks.length > 3 && (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold z-0">
                                        +{recommendedStocks.length - 3}
                                    </div>
                                )}
                            </div>
                        </TooltipProvider>
                    </div>

                    <div className="border-t border-b border-border py-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                {strategy.totalReturn >= 0 ? (
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                ) : (
                                    <TrendingDown className="w-3 h-3 text-red-600" />
                                )}
                                <span className="text-xs font-medium text-muted-foreground">
                                    Performa strategi
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                    <div className="mb-0.5 text-xs text-muted-foreground">Total return</div>
                                    <div
                                        className={`font-ibm-plex-mono text-xl ${strategy.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {formatPercent(strategy.totalReturn)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-0.5 text-xs text-muted-foreground">Sejak diikuti</div>
                                    <div
                                        className={`font-ibm-plex-mono text-xl ${(strategy.returnSinceSubscription || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {formatPercent(strategy.returnSinceSubscription || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                                <div className="mb-0.5 text-xs text-muted-foreground">Drawdown maks.</div>
                                <div className="flex items-center justify-center gap-1">
                                    <span
                                        className={`font-ibm-plex-mono text-sm ${Math.abs(strategy.maxDrawdown) <= 10 ? "text-green-600" : Math.abs(strategy.maxDrawdown) <= 20 ? "text-yellow-600" : "text-red-600"}`}
                                    >
                                        {formatRawPercent(strategy.maxDrawdown)}
                                    </span>
                                    <div className="relative inline-block group">
                                        <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            Maximum peak-to-trough decline
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="mb-0.5 text-xs text-muted-foreground">Tingkat sukses</div>
                                <div className="flex items-center justify-center gap-1">
                                    <span
                                        className={`font-ibm-plex-mono text-sm ${strategy.winRate >= 70 ? "text-green-600" : strategy.winRate >= 60 ? "text-yellow-600" : "text-red-600"}`}
                                    >
                                        {strategy.winRate.toFixed(0)}%
                                    </span>
                                    <div className="relative inline-block group">
                                        <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            Percentage of profitable trades
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <div className="mb-0.5 text-xs text-muted-foreground">Kualitas</div>
                                <div className="flex items-center justify-center gap-1">
                                    <span
                                        className={`text-xs font-semibold ${strategy.sharpeRatio >= 1.5 ? "text-green-600" : strategy.sharpeRatio >= 1 ? "text-yellow-600" : "text-red-600"}`}
                                    >
                                        {strategy.sharpeRatio >= 2
                                            ? "Excellent"
                                            : strategy.sharpeRatio >= 1.5
                                                ? "Good"
                                                : strategy.sharpeRatio >= 1
                                                    ? "Fair"
                                                    : "Poor"}
                                    </span>
                                    <div className="relative inline-block group">
                                        <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            Sharpe Ratio: {strategy.sharpeRatio.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground mb-0.5">Trades</div>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="font-ibm-plex-mono text-xs text-foreground">{strategy.totalTrades}</span>
                                    <div className="relative inline-block group">
                                        <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            Total number of trades executed
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-0.5 text-xs text-muted-foreground">Saham</div>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="font-ibm-plex-mono text-xs text-foreground">{strategy.stocksHeld}</span>
                                    <div className="relative inline-block group">
                                        <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            Number of stocks in portfolio
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                        <Calendar className="w-3 h-3" />
                        Diikuti: {new Date(strategy.subscriptionDate || strategy.createdDate).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnsubscribe?.(strategy);
                            }}
                            className="w-full text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                        >
                            <HeartOff className="w-3 h-3 mr-1" />
                            Berhenti mengikuti
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
