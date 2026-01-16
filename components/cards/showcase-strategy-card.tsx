"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState, useMemo } from "react"
import { Strategy } from "./types"
import { generateSparklineData, generateHeatmapData } from "./utils"

interface ShowcaseStrategyCardProps {
    strategy: Strategy
}

export function ShowcaseStrategyCard({ strategy }: ShowcaseStrategyCardProps) {
    const [hoveredBar, setHoveredBar] = useState<number | null>(null)

    // Memoize the data so it doesn't regenerate on hover
    const sparklineData = useMemo(() => generateSparklineData(strategy.totalReturn), [strategy.totalReturn])
    const heatmapData = useMemo(() => generateHeatmapData(), [])

    const maxSparkline = Math.max(...sparklineData.map((d) => d.value))
    const minSparkline = Math.min(...sparklineData.map((d) => d.value))
    const sparklineRange = maxSparkline - minSparkline

    return (
        <Card className="border-ochre/20 hover:border-ochre/40 transition-all duration-300 cursor-pointer bg-gradient-to-br from-ochre/5 via-background to-background relative overflow-hidden">
            {/* Background pattern */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(234, 88, 12, 0.15) 1px, transparent 0)`,
                    backgroundSize: "32px 32px",
                }}
            />

            <CardContent className="p-5 relative z-10">
                <div className="space-y-3">
                    {/* Title */}
                    <h3 className="text-base font-semibold text-foreground">{strategy.name}</h3>

                    {/* Return with Sparkline */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Return</div>
                            <div
                                className={`text-3xl font-bold font-mono ${strategy.totalReturn >= 0 ? "text-emerald-500" : "text-red-500"
                                    }`}
                            >
                                {strategy.totalReturn >= 0 ? "+" : ""}
                                {strategy.totalReturn.toFixed(2)}%
                            </div>
                        </div>

                        <div className="relative">
                            <div className="flex items-end gap-0.5 h-12 w-24">
                                {sparklineData.map((data, i) => {
                                    const height = ((data.value - minSparkline) / sparklineRange) * 100
                                    return (
                                        <div
                                            key={i}
                                            className={`flex-1 ${strategy.totalReturn >= 0 ? "bg-emerald-500/60" : "bg-red-500/60"} rounded-sm transition-all ${hoveredBar === i ? "opacity-100" : "opacity-70"}`}
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
                                        className={`text-xs font-mono font-semibold ${sparklineData[hoveredBar].return >= 0 ? "text-emerald-500" : "text-red-500"}`}
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
                        <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-2 text-xs font-mono">
                            <div>
                                <div className="text-muted-foreground mb-0.5">Trades</div>
                                <div className="font-semibold text-foreground">{strategy.totalTrades}</div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Success Rate</div>
                                <div
                                    className={`font-semibold ${strategy.winRate >= 60
                                        ? "text-emerald-500"
                                        : strategy.winRate >= 40
                                            ? "text-yellow-500"
                                            : "text-red-500"
                                        }`}
                                >
                                    {strategy.winRate.toFixed(0)}%
                                </div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Stocks</div>
                                <div className="font-semibold text-foreground">{strategy.stocksHeld}</div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Quality</div>
                                <div
                                    className={`font-semibold ${strategy.sharpeRatio >= 2
                                        ? "text-emerald-500"
                                        : strategy.sharpeRatio >= 1
                                            ? "text-yellow-500"
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
                                <div className="font-semibold text-foreground">{strategy.avgTradeDuration}d</div>
                            </div>

                            <div>
                                <div className="text-muted-foreground mb-0.5">Max. Drawdown</div>
                                <div className="font-semibold text-red-500">-{Math.abs(strategy.maxDrawdown).toFixed(1)}%</div>
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
                                        <span className="text-[8px] font-mono font-semibold text-foreground/60">
                                            {data.month.charAt(0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
