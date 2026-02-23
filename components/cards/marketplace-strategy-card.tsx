"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Info, Calendar, Heart } from "lucide-react"
import { Strategy } from "./types"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

// Seeded random number generator using strategy id
function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    // Return a number between 67 and 483
    return 67 + Math.abs(hash % (483 - 67 + 1));
}

interface MarketplaceStrategyCardProps {
    strategy: Strategy
    isSubscribed?: boolean
    onSubscribe?: (id: string) => void
    onCardClick?: () => void
    isLoading?: boolean
    className?: string
}

export function MarketplaceStrategyCard({ strategy, isSubscribed = false, onSubscribe, onCardClick, isLoading = false, className }: MarketplaceStrategyCardProps) {
    const randomSubscribers = useMemo(() => seededRandom(strategy.id), [strategy.id]);

    return (
        <Card
            className={cn("flex-shrink-0 w-full hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer relative overflow-hidden", className)}
            onClick={() => onCardClick?.()}
        >
            {/* Subscriber badge - top right corner */}
            <Badge
                variant="secondary"
                className="absolute top-3 right-3 z-10 bg-ochre/20 text-ochre-100 border-ochre/30 text-xs font-medium"
            >
                <Users className="w-3 h-3 mr-1" />
                <span className="font-mono">{randomSubscribers}</span>
            </Badge>

            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-16">
                            <h3 className="text-base font-bold text-foreground truncate">{strategy.name}</h3>

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

                    <div className="border-t border-b border-border py-3">
                        <div className="text-center">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                                Return
                            </span>
                            <div className={`text-3xl font-mono ${strategy.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {strategy.totalReturn > 0 ? "+" : ""}
                                {strategy.totalReturn}%
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2.5 font-mono">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-0.5">Max. Drawdown</div>
                                <div className="flex items-center justify-center gap-1">
                                    <span
                                        className={`text-sm ${Math.abs(strategy.maxDrawdown) <= 10 ? "text-green-600" : Math.abs(strategy.maxDrawdown) <= 20 ? "text-yellow-600" : "text-red-600"}`}
                                    >
                                        {strategy.maxDrawdown}%
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
                                <div className="text-xs text-muted-foreground mb-0.5">Success Rate</div>
                                <div className="flex items-center justify-center gap-1">
                                    <span
                                        className={`text-sm ${strategy.winRate >= 70 ? "text-green-600" : strategy.winRate >= 60 ? "text-yellow-600" : "text-red-600"}`}
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
                                <div className="text-xs text-muted-foreground mb-0.5">Quality</div>
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
                                    <span className="text-xs text-foreground">{strategy.totalTrades}</span>
                                    <div className="relative inline-block group">
                                        <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            Total number of trades executed
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground mb-0.5">Stocks</div>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-xs text-foreground">{strategy.stocksHeld}</span>
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
                        Created: {new Date(strategy.createdDate).toLocaleDateString()}
                    </div>

                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isLoading) onSubscribe?.(strategy.id);
                        }}
                        disabled={isLoading}
                        size="sm"
                        className={
                            isSubscribed
                                ? "w-full text-white text-xs hover:opacity-90"
                                : "w-full bg-primary hover:bg-primary/90 text-xs"
                        }
                        style={isSubscribed ? { backgroundColor: '#487b78' } : undefined}
                    >
                        {isLoading ? (
                            "Loading..."
                        ) : isSubscribed ? (
                            <>
                                <Heart className="w-3 h-3 mr-1 fill-current" />
                                Subscribed
                            </>
                        ) : (
                            <>
                                <Heart className="w-3 h-3 mr-1" />
                                Subscribe
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
