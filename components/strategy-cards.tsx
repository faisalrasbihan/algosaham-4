"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Edit,
  Trash2,
  Heart,
  HeartOff,
  Plus,
  ChevronRight,
  Info,
} from "lucide-react"
import { useState, useRef, useEffect, useMemo } from "react"

interface Strategy {
  id: string
  name: string
  description?: string
  creator?: string
  totalReturn: number
  yoyReturn: number // Added YoY return
  momReturn: number // Added MoM return
  weeklyReturn: number // Added weekly return
  maxDrawdown: number
  sharpeRatio: number
  sortinoRatio: number // Added new backtesting indicators
  calmarRatio: number
  profitFactor: number
  winRate: number
  totalTrades: number
  avgTradeDuration: number // in days
  stocksHeld: number // Added number of stocks held
  createdDate: string
  subscribers?: number
  isSubscribed?: boolean
  subscriptionDate?: string // Added subscription-specific data
  returnSinceSubscription?: number // Added subscription-specific data
}

const savedStrategies: Strategy[] = [
  {
    id: "1",
    name: "BBCA Momentum Pro",
    totalReturn: 24.5,
    yoyReturn: 18.2, // Added YoY return data
    momReturn: 2.1, // Added MoM return data
    weeklyReturn: 0.5, // Added weekly return data
    maxDrawdown: -8.2,
    sharpeRatio: 1.85,
    sortinoRatio: 2.12, // Added new indicator values for all strategies
    calmarRatio: 2.99,
    profitFactor: 1.68,
    winRate: 68.5,
    totalTrades: 142,
    avgTradeDuration: 3.2,
    stocksHeld: 5, // Added stocks held data
    createdDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Multi-Stock RSI Divergence",
    totalReturn: 18.7,
    yoyReturn: 15.3,
    momReturn: 1.8,
    weeklyReturn: 0.4,
    maxDrawdown: -12.1,
    sharpeRatio: 1.42,
    sortinoRatio: 1.78,
    calmarRatio: 1.55,
    profitFactor: 1.45,
    winRate: 61.3,
    totalTrades: 89,
    avgTradeDuration: 5.8,
    stocksHeld: 12,
    createdDate: "2024-02-03",
  },
  {
    id: "3",
    name: "Banking Sector Breakout",
    totalReturn: 31.2,
    yoyReturn: 28.7,
    momReturn: 3.4,
    weeklyReturn: 0.8,
    maxDrawdown: -15.8,
    sharpeRatio: 2.1,
    sortinoRatio: 2.45,
    calmarRatio: 1.97,
    profitFactor: 1.89,
    winRate: 72.4,
    totalTrades: 67,
    avgTradeDuration: 7.1,
    stocksHeld: 8,
    createdDate: "2024-01-28",
  },
  {
    id: "4",
    name: "TLKM Swing Trader",
    totalReturn: 15.3,
    yoyReturn: 12.8,
    momReturn: 1.2,
    weeklyReturn: 0.3,
    maxDrawdown: -6.8,
    sharpeRatio: 1.67,
    sortinoRatio: 1.89,
    calmarRatio: 2.25,
    profitFactor: 1.52,
    winRate: 64.2,
    totalTrades: 78,
    avgTradeDuration: 4.5,
    stocksHeld: 3,
    createdDate: "2024-02-10",
  },
  {
    id: "5",
    name: "Mining Stock Momentum",
    totalReturn: 42.1,
    yoyReturn: 38.9,
    momReturn: 4.7,
    weeklyReturn: 1.1,
    maxDrawdown: -18.5,
    sharpeRatio: 2.34,
    sortinoRatio: 2.78,
    calmarRatio: 2.27,
    profitFactor: 2.12,
    winRate: 69.7,
    totalTrades: 156,
    avgTradeDuration: 2.8,
    stocksHeld: 15,
    createdDate: "2024-01-05",
  },
  {
    id: "6",
    name: "Consumer Goods Scalper",
    totalReturn: 12.8,
    yoyReturn: 11.2,
    momReturn: 0.9,
    weeklyReturn: 0.2,
    maxDrawdown: -4.3,
    sharpeRatio: 1.89,
    sortinoRatio: 2.15,
    calmarRatio: 2.98,
    profitFactor: 1.73,
    winRate: 75.6,
    totalTrades: 234,
    avgTradeDuration: 1.2,
    stocksHeld: 7,
    createdDate: "2024-02-18",
  },
  {
    id: "7",
    name: "Property REIT Strategy",
    totalReturn: 8.9,
    yoyReturn: 7.8,
    momReturn: 0.6,
    weeklyReturn: 0.1,
    maxDrawdown: -3.1,
    sharpeRatio: 1.45,
    sortinoRatio: 1.67,
    calmarRatio: 2.87,
    profitFactor: 1.38,
    winRate: 71.2,
    totalTrades: 45,
    avgTradeDuration: 12.5,
    stocksHeld: 4,
    createdDate: "2024-02-25",
  },
  {
    id: "8",
    name: "Energy Sector Reversal",
    totalReturn: 35.7,
    yoyReturn: 32.1,
    momReturn: 4.2,
    weeklyReturn: 0.9,
    maxDrawdown: -22.4,
    sharpeRatio: 1.98,
    sortinoRatio: 2.34,
    calmarRatio: 1.59,
    profitFactor: 1.95,
    winRate: 58.9,
    totalTrades: 112,
    avgTradeDuration: 6.3,
    stocksHeld: 11,
    createdDate: "2024-01-12",
  },
  {
    id: "9",
    name: "Blue Chip Dividend Play",
    totalReturn: 11.4,
    yoyReturn: 10.1,
    momReturn: 0.8,
    weeklyReturn: 0.2,
    maxDrawdown: -5.7,
    sharpeRatio: 1.52,
    sortinoRatio: 1.74,
    calmarRatio: 2.0,
    profitFactor: 1.41,
    winRate: 73.8,
    totalTrades: 67,
    avgTradeDuration: 8.9,
    stocksHeld: 6,
    createdDate: "2024-02-08",
  },
]

const popularStrategies: Strategy[] = [
  {
    id: "p1",
    name: "IDX30 Mean Reversion",
    description: "Advanced mean reversion strategy targeting IDX30 stocks with statistical arbitrage",
    creator: "ProTrader_ID",
    totalReturn: 42.8,
    yoyReturn: 39.2,
    momReturn: 4.8,
    weeklyReturn: 1.2,
    maxDrawdown: -9.5,
    sharpeRatio: 2.45,
    sortinoRatio: 2.89,
    calmarRatio: 4.5,
    profitFactor: 2.34,
    winRate: 74.2,
    totalTrades: 234,
    avgTradeDuration: 2.1,
    stocksHeld: 18,
    createdDate: "2023-11-20",
    subscribers: 1247,
  },
  {
    id: "p2",
    name: "Commodity Momentum Master",
    description: "High-frequency momentum strategy for mining and energy stocks",
    creator: "AlgoExpert88",
    totalReturn: 38.6,
    yoyReturn: 35.1,
    momReturn: 4.3,
    weeklyReturn: 1.0,
    maxDrawdown: -11.3,
    sharpeRatio: 2.12,
    sortinoRatio: 2.56,
    calmarRatio: 3.42,
    profitFactor: 2.08,
    winRate: 69.8,
    totalTrades: 189,
    avgTradeDuration: 1.8,
    stocksHeld: 22,
    createdDate: "2023-12-05",
    subscribers: 892,
  },
  {
    id: "p3",
    name: "Consumer Defensive Shield",
    description: "Low-risk strategy focusing on consumer staples with consistent returns",
    creator: "SafeInvestor",
    totalReturn: 16.4,
    yoyReturn: 14.8,
    momReturn: 1.3,
    weeklyReturn: 0.3,
    maxDrawdown: -4.2,
    sharpeRatio: 1.98,
    sortinoRatio: 2.23,
    calmarRatio: 3.9,
    profitFactor: 1.82,
    winRate: 78.5,
    totalTrades: 156,
    avgTradeDuration: 4.7,
    stocksHeld: 9,
    createdDate: "2024-01-10",
    subscribers: 654,
  },
]

const subscribedStrategies: Strategy[] = [
  {
    id: "s1",
    name: "Tech Growth Accelerator",
    description: "Growth-focused strategy targeting technology and digital companies",
    creator: "TechGuru2024",
    totalReturn: 28.9,
    yoyReturn: 25.6,
    momReturn: 3.1,
    weeklyReturn: 0.7,
    maxDrawdown: -13.7,
    sharpeRatio: 1.76,
    sortinoRatio: 2.12,
    calmarRatio: 2.11,
    profitFactor: 1.67,
    winRate: 65.4,
    totalTrades: 98,
    avgTradeDuration: 5.2,
    stocksHeld: 14,
    createdDate: "2024-02-15",
    subscribers: 445,
    isSubscribed: true,
    subscriptionDate: "2024-03-01", // Date when user first subscribed
    returnSinceSubscription: 12.3, // Return since user subscribed
  },
  {
    id: "s2",
    name: "Healthcare Innovator",
    description: "Innovative strategy focusing on healthcare stocks with high growth potential",
    creator: "HealthInvestor",
    totalReturn: 32.1,
    yoyReturn: 29.6,
    momReturn: 2.8,
    weeklyReturn: 0.6,
    maxDrawdown: -10.2,
    sharpeRatio: 2.05,
    sortinoRatio: 2.48,
    calmarRatio: 3.21,
    profitFactor: 1.92,
    winRate: 67.1,
    totalTrades: 110,
    avgTradeDuration: 4.3,
    stocksHeld: 13,
    createdDate: "2024-01-22",
    subscribers: 500,
    isSubscribed: true,
    subscriptionDate: "2024-03-02",
    returnSinceSubscription: 15.4,
  },
  {
    id: "s3",
    name: "Financial Services Diversifier",
    description: "Diversified strategy focusing on financial services stocks",
    creator: "FinanceGuru",
    totalReturn: 26.3,
    yoyReturn: 23.9,
    momReturn: 2.4,
    weeklyReturn: 0.5,
    maxDrawdown: -9.8,
    sharpeRatio: 1.88,
    sortinoRatio: 2.33,
    calmarRatio: 2.67,
    profitFactor: 1.75,
    winRate: 66.8,
    totalTrades: 105,
    avgTradeDuration: 4.8,
    stocksHeld: 12,
    createdDate: "2024-02-07",
    subscribers: 350,
    isSubscribed: true,
    subscriptionDate: "2024-03-03",
    returnSinceSubscription: 13.5,
  },
]

// Utility functions for sparkline and heatmap
const generateSparklineData = (baseReturn: number): { month: string; value: number; return: number }[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const points = 12
  const data: { month: string; value: number; return: number }[] = []
  let current = 100

  for (let i = 0; i < points; i++) {
    const randomChange = (Math.random() - 0.4) * 2
    current = current * (1 + randomChange / 100)
    const monthReturn = randomChange * 2
    data.push({
      month: months[i],
      value: current,
      return: monthReturn,
    })
  }

  // Ensure the final value reflects the actual return
  const scaleFactor = (100 + baseReturn) / current
  return data.map((d) => ({
    ...d,
    value: d.value * scaleFactor,
  }))
}

const generateHeatmapData = (): { month: string; value: number; color: string }[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months.map((month) => {
    const value = (Math.random() - 0.3) * 20
    let color = "bg-emerald-500/20"
    if (value < -5) color = "bg-red-500/40"
    else if (value < 0) color = "bg-red-500/20"
    else if (value > 5) color = "bg-emerald-500/40"
    return { month, value, color }
  })
}

export function StrategyCards() {
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set(["s1", "s2", "s3"]))
  const [showScrollIndicator, setShowScrollIndicator] = useState({
    saved: false,
    popular: false,
    subscribed: false,
  })

  const savedScrollRef = useRef<HTMLDivElement>(null)
  const popularScrollRef = useRef<HTMLDivElement>(null)
  const subscribedScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkOverflow = (ref: React.RefObject<HTMLDivElement>, section: string) => {
      if (ref.current) {
        const hasOverflow = ref.current.scrollWidth > ref.current.clientWidth
        setShowScrollIndicator((prev) => ({ ...prev, [section]: hasOverflow }))
      }
    }

    checkOverflow(savedScrollRef, "saved")
    checkOverflow(popularScrollRef, "popular")
    checkOverflow(subscribedScrollRef, "subscribed")

    const handleResize = () => {
      checkOverflow(savedScrollRef, "saved")
      checkOverflow(popularScrollRef, "popular")
      checkOverflow(subscribedScrollRef, "subscribed")
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleSubscribe = (strategyId: string) => {
    setSubscribed((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(strategyId)) {
        newSet.delete(strategyId)
      } else {
        newSet.add(strategyId)
      }
      return newSet
    })
  }

  const FeaturedStrategyCard = ({ strategy }: { strategy: Strategy }) => {
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
                  className={`text-3xl font-bold font-mono ${
                    strategy.totalReturn >= 0 ? "text-emerald-500" : "text-red-500"
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
                    className={`font-semibold ${
                      strategy.winRate >= 60
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
                    className={`font-semibold ${
                      strategy.sharpeRatio >= 2
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

  const StrategyCard = ({ strategy, type }: { strategy: Strategy; type: "saved" | "popular" | "subscribed" }) => (
    <Card className="flex-shrink-0 w-80 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground truncate">{strategy.name}</h3>
                {(type === "popular" || type === "subscribed") && (
                  <Badge variant="secondary" className="bg-ochre/20 text-ochre-100 border-ochre/30 text-xs font-medium">
                    <Users className="w-3 h-3 mr-1" />
                    <span className="font-mono">{strategy.subscribers}</span>
                  </Badge>
                )}
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

          <div className="border-t border-b border-border py-3">
            {type === "subscribed" ? (
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
                      className={`text-xl font-mono ${(strategy as any).returnSinceSubscription >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {(strategy as any).returnSinceSubscription > 0 ? "+" : ""}
                      {(strategy as any).returnSinceSubscription}%
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Return
                </span>
                <div className={`text-3xl font-mono ${strategy.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {strategy.totalReturn > 0 ? "+" : ""}
                  {strategy.totalReturn}%
                </div>
              </div>
            )}
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
                    <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
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
                    <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
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
                    <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
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
                    <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
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
                    <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
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
            {type === "subscribed"
              ? `Subscribed: ${new Date((strategy as any).subscriptionDate || strategy.createdDate).toLocaleDateString()}`
              : `Created: ${new Date(strategy.createdDate).toLocaleDateString()}`}
          </div>

          <div className="flex items-center gap-2 pt-1">
            {type === "saved" && (
              <>
                <Button variant="default" size="sm" className="text-xs bg-ochre hover:bg-ochre/90 text-white">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-xs text-red-600 hover:text-red-700 bg-transparent">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </>
            )}

            {type === "popular" && (
              <Button
                onClick={() => handleSubscribe(strategy.id)}
                size="sm"
                className={
                  subscribed.has(strategy.id)
                    ? "bg-green-600 hover:bg-green-700 text-xs"
                    : "bg-primary hover:bg-primary/90 text-xs"
                }
              >
                {subscribed.has(strategy.id) ? (
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
            )}

            {type === "subscribed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubscribe(strategy.id)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <HeartOff className="w-3 h-3 mr-1" />
                Unsubscribe
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <section>
        <div className="px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">Strategy Showcase</h2>
            <p className="text-muted-foreground">Top-performing strategies of the week</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeaturedStrategyCard strategy={popularStrategies[0]} />
            <FeaturedStrategyCard strategy={popularStrategies[1]} />
            <FeaturedStrategyCard strategy={popularStrategies[2]} />
          </div>
        </div>
      </section>

      {/* Saved Strategies Section */}
      <section>
        <div className="pl-6 pr-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">My Strategies</h2>
              <p className="text-muted-foreground">Strategies you've created and backtested</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create New Strategy
            </Button>
          </div>
        </div>

        <div className="relative">
          <div ref={savedScrollRef} className="flex overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-0 gap-5">
            {savedStrategies.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} type="saved" />
            ))}
            <div className="w-6 flex-shrink-0" />
          </div>
          {showScrollIndicator.saved && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background via-background/80 to-transparent pl-8 pr-2 py-2">
              <ChevronRight className="w-5 h-5 text-ochre animate-pulse" />
            </div>
          )}
        </div>
      </section>

      {/* Subscribed Strategies Section */}
      <section>
        <div className="pl-6 pr-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Subscribed Strategies</h2>
            <p className="text-muted-foreground">Strategies you're following from other traders</p>
          </div>
        </div>

        <div className="relative">
          <div ref={subscribedScrollRef} className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-0">
            {subscribedStrategies.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} type="subscribed" />
            ))}
            <div className="w-6 flex-shrink-0" />
          </div>
          {showScrollIndicator.subscribed && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background via-background/80 to-transparent pl-8 pr-2 py-2">
              <ChevronRight className="w-5 h-5 text-ochre animate-pulse" />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
