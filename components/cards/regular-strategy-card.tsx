"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, Edit, Trash2, Heart, RefreshCw, Loader2, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Strategy } from "./types"

interface RegularStrategyCardProps {
    strategy: Strategy
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
    onRerun?: (id: string) => void
    onSubscribe?: (id: string) => void
    isRerunning?: boolean
    isSubscribing?: boolean
}

export function RegularStrategyCard({ strategy, onEdit, onDelete, onRerun, onSubscribe, isRerunning, isSubscribing }: RegularStrategyCardProps) {
    return (
        <Card className="flex-shrink-0 w-80 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-foreground truncate">{strategy.name}</h3>
                            </div>

                            {strategy.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{strategy.description}</p>
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
                                        className={`text-xs font-semibold ${strategy.qualityScore === 'Excellent' ? "text-green-600" :
                                            strategy.qualityScore === 'Good' ? "text-yellow-600" :
                                                "text-red-600"
                                            }`}
                                    >
                                        {strategy.qualityScore || 'Unknown'}
                                    </span>
                                    <div className="relative inline-block group">
                                        <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            Based on Sharpe Ratio
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

                    {strategy.lastRunDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                            <Clock className="w-3 h-3" />
                            Last Run: {strategy.lastRunDate}
                        </div>
                    )}

                    <div className={`flex items-center gap-2 ${strategy.lastRunDate ? 'pt-1' : 'pt-2 border-t border-border'}`}>
                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isRerunning) onRerun?.(strategy.id);
                                        }}
                                        disabled={isRerunning}
                                        className="h-9 flex-1 hover:bg-[#d07225] hover:text-white hover:border-[#d07225] transition-colors"
                                    >
                                        {isRerunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Jalankan ulang backtest</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isSubscribing) onSubscribe?.(strategy.id);
                                        }}
                                        disabled={isSubscribing}
                                        className="h-9 flex-1 hover:bg-[#d07225] hover:text-white hover:border-[#d07225] transition-colors"
                                    >
                                        {isSubscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Berlangganan strategi ini</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit?.(strategy.id);
                                        }}
                                        className="h-9 flex-1 hover:bg-[#d07225] hover:text-white hover:border-[#d07225] transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit strategi</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete?.(strategy.id);
                                        }}
                                        className="h-9 flex-1 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Hapus strategi</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
