"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Info, TrendingUp, TrendingDown, Calendar, HeartOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Strategy } from "./types"

interface SubscribedStrategyCardProps {
    strategy: Strategy
    onUnsubscribe?: (id: string) => void
}

export function SubscribedStrategyCard({ strategy, onUnsubscribe }: SubscribedStrategyCardProps) {
    const recommendedStocks = (strategy as any).recommendedStocks || [
        { symbol: "BBCA", color: "bg-blue-600" },
        { symbol: "BBRI", color: "bg-orange-500" },
        { symbol: "BREN", color: "bg-green-600" },
    ];

    return (
        <Card className="flex-shrink-0 w-80 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-foreground truncate">{strategy.name}</h3>
                                <Badge variant="secondary" className="bg-ochre/20 text-ochre-100 border-ochre/30 text-xs font-medium">
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

                    <div className="flex justify-center py-2">
                        <div className="flex -space-x-2 overflow-hidden justify-center p-1">
                            {recommendedStocks.slice(0, 3).map((stock: any, idx: number) => (
                                <Avatar key={idx} className="inline-block h-7 w-7 rounded-full border-2 border-background">
                                    <AvatarImage src={`/stock_icons/${stock.symbol}.png`} alt={stock.symbol} />
                                    <AvatarFallback className={`${stock.color} text-white text-[9px] font-bold`}>
                                        {stock.symbol}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {recommendedStocks.length > 3 && (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-bold">
                                    +{recommendedStocks.length - 3}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-b border-border py-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                {strategy.totalReturn >= 0 ? (
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                ) : (
                                    <TrendingDown className="w-3 h-3 text-red-600" />
                                )}
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Strategy Performance
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-0.5">Total Return</div>
                                    <div
                                        className={`text-xl font-mono ${strategy.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {strategy.totalReturn > 0 ? "+" : ""}
                                        {strategy.totalReturn}%
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-0.5">Since Subscribed</div>
                                    <div
                                        className={`text-xl font-mono ${(strategy.returnSinceSubscription || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {(strategy.returnSinceSubscription || 0) > 0 ? "+" : ""}
                                        {strategy.returnSinceSubscription || 0}%
                                    </div>
                                </div>
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
                        Subscribed: {new Date(strategy.subscriptionDate || strategy.createdDate).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnsubscribe?.(strategy.id);
                            }}
                            className="text-xs text-red-600 hover:text-red-700 w-full"
                        >
                            <HeartOff className="w-3 h-3 mr-1" />
                            Unsubscribe
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
