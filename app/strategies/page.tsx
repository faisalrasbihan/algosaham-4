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
import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { CardCarousel } from "@/components/card-carousel"

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
]

export default function Strategies() {
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set(["s1"]))

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

  const StrategyCard = ({ strategy, type }: { strategy: Strategy; type: "saved" | "popular" | "subscribed" }) => (
    <Card className="flex-shrink-0 w-72 my-1 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-foreground truncate">{strategy.name}</h3>
                {(type === "popular" || type === "subscribed") && (
                  <Badge variant="secondary" className="bg-ochre/20 text-ochre-100 border-ochre/30 text-xs font-medium">
                    <Users className="w-3 h-3 mr-1" />
                    {strategy.subscribers}
                  </Badge>
                )}
              </div>

              {strategy.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{strategy.description}</p>
              )}

              {strategy.creator && (
                <p className="text-xs text-muted-foreground mb-2">
                  by <span className="text-ochre font-medium">{strategy.creator}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              {type === "subscribed" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {strategy.totalReturn >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm font-bold text-muted-foreground">Annualized Return</span>
                  </div>
                  <div
                    className={`text-2xl font-normal ${strategy.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {strategy.totalReturn > 0 ? "+" : ""}
                    {strategy.totalReturn}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Since Sub:{" "}
                    <span
                      className={`font-medium ${(strategy as any).returnSinceSubscription >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {(strategy as any).returnSinceSubscription > 0 ? "+" : ""}
                      {(strategy as any).returnSinceSubscription}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {strategy.totalReturn >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm font-bold text-muted-foreground">Annualized Return</span>
                  </div>
                  <div
                    className={`text-2xl font-normal ${strategy.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {strategy.totalReturn > 0 ? "+" : ""}
                    {strategy.totalReturn}%
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="text-center">
                <div className="text-muted-foreground mb-1">Max Drawdown</div>
                <div className="font-medium text-red-600">
                  {strategy.maxDrawdown}%
                  <div className="relative inline-block ml-1 group">
                    <Info className="w-2.5 h-2.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Maximum peak-to-trough decline
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-muted-foreground mb-1">Sharpe Ratio</div>
                <div
                  className={`font-medium ${strategy.sharpeRatio >= 1.5 ? "text-green-600" : strategy.sharpeRatio >= 1 ? "text-yellow-600" : "text-red-600"}`}
                >
                  {strategy.sharpeRatio.toFixed(2)}
                  <div className="relative inline-block ml-1 group">
                    <Info className="w-2.5 h-2.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Risk-adjusted return measure
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-muted-foreground mb-1">Win Rate</div>
                <div
                  className={`font-medium ${strategy.winRate >= 70 ? "text-green-600" : strategy.winRate >= 60 ? "text-yellow-600" : "text-red-600"}`}
                >
                  {strategy.winRate}%
                  <div className="relative inline-block ml-1 group">
                    <Info className="w-2.5 h-2.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Percentage of profitable trades
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-muted-foreground mb-1">Stocks</div>
                <div className="font-medium">
                  {strategy.stocksHeld}
                  <div className="relative inline-block ml-1 group">
                    <Info className="w-2.5 h-2.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Number of stocks in portfolio
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {type === "subscribed"
              ? `Subscribed: ${new Date((strategy as any).subscriptionDate || strategy.createdDate).toLocaleDateString()}`
              : `Created: ${new Date(strategy.createdDate).toLocaleDateString()}`}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {type === "saved" && (
              <>
                <Button variant="outline" size="sm" className="text-xs bg-transparent">
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <TickerTape />
      <div className="flex-1 overflow-y-auto mt-8">
        <div className="space-y-8">
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

            <CardCarousel>
              {savedStrategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} type="saved" />
              ))}
            </CardCarousel>
          </section>

          {/* Popular Strategies Section */}
          <section>
            <div className="pl-6 pr-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Popular Strategies</h2>
                  <p className="text-muted-foreground">Top-performing strategies from the community</p>
                </div>
                <Button variant="outline" className="text-sm bg-transparent">
                  See All
                </Button>
              </div>
            </div>

            <CardCarousel>
              {popularStrategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} type="popular" />
              ))}
            </CardCarousel>
          </section>

          {/* Subscribed Strategies Section */}
          <section>
            <div className="pl-6 pr-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Subscribed Strategies</h2>
                <p className="text-muted-foreground">Strategies you're following from other traders</p>
              </div>
            </div>

            <CardCarousel>
              {subscribedStrategies
                .filter((s) => subscribed.has(s.id))
                .map((strategy) => (
                  <StrategyCard key={strategy.id} strategy={strategy} type="subscribed" />
                ))}
              {subscribedStrategies.filter((s) => subscribed.has(s.id)).length === 0 && (
                <Card className="flex-shrink-0 w-80 p-8 text-center">
                  <p className="text-muted-foreground">
                    No subscribed strategies yet. Browse popular strategies to get started!
                  </p>
                </Card>
              )}
            </CardCarousel>
          </section>
        </div>
      </div>
    </div>
  )
}
