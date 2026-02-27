"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, BarChart3, Target, Clock, Activity } from "lucide-react"
import { Strategy } from "./types"

interface MinimalStrategyCardProps {
    strategy: Strategy
}

export function MinimalStrategyCard({ strategy }: MinimalStrategyCardProps) {
    const isPositive = strategy.totalReturn >= 0

    const getQualityLabel = (sharpe: number) => {
        if (sharpe >= 2) return { label: "Excellent", color: "text-emerald-600 bg-emerald-50" }
        if (sharpe >= 1.5) return { label: "Good", color: "text-blue-600 bg-blue-50" }
        if (sharpe >= 1) return { label: "Fair", color: "text-amber-600 bg-amber-50" }
        return { label: "Poor", color: "text-red-600 bg-red-50" }
    }

    const quality = getQualityLabel(strategy.sharpeRatio)

    return (
        <Card className="w-[300px] flex-shrink-0 border border-border/60 hover:border-border transition-all duration-200 bg-card">
            <CardContent className="p-5">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate">{strategy.name}</h3>
                            {strategy.creator && (
                                <p className="text-xs text-muted-foreground mt-0.5">by {strategy.creator}</p>
                            )}
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-sm flex-shrink-0 ${quality.color}`}>
                            {quality.label}
                        </span>
                    </div>

                    {/* Return highlight */}
                    <div className="flex items-baseline gap-2">
                        <span
                            className={`text-2xl font-bold font-mono ${isPositive ? "text-emerald-600" : "text-red-500"}`}
                        >
                            {isPositive ? "+" : ""}{strategy.totalReturn.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">total return</span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border/60" />

                    {/* Metrics grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-[10px] text-muted-foreground">Win Rate</span>
                            </div>
                            <span
                                className="text-sm font-semibold text-foreground font-mono"
                            >
                                {strategy.winRate.toFixed(0)}%
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-[10px] text-muted-foreground">Trades</span>
                            </div>
                            <span
                                className="text-sm font-semibold text-foreground font-mono"
                            >
                                {strategy.totalTrades}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1">
                                <Activity className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-[10px] text-muted-foreground">Drawdown</span>
                            </div>
                            <span
                                className="text-sm font-semibold text-red-500 font-mono"
                            >
                                {strategy.maxDrawdown.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                                Avg <span className="font-mono">{strategy.avgTradeDuration}d</span> hold
                            </span>
                        </div>
                        <span><span className="font-mono">{strategy.stocksHeld}</span> stocks</span>
                        {strategy.subscribers !== undefined && (
                            <span><span className="font-mono">{strategy.subscribers.toLocaleString()}</span> subscribers</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
