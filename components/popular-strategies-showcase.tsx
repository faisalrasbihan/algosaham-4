"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Heart, Info, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Strategy {
  id: string;
  name: string;
  description: string;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  stocksHeld: number;
  subscribers: number;
}

const popularStrategies: Strategy[] = [
  {
    id: "p1",
    name: "IDX30 Mean Reversion",
    description: "Advanced mean reversion strategy targeting IDX30 stocks with statistical arbitrage techniques for optimal entry and exit points",
    totalReturn: 42.8,
    maxDrawdown: -9.5,
    sharpeRatio: 2.45,
    winRate: 74.2,
    totalTrades: 234,
    stocksHeld: 18,
    subscribers: 1247,
  },
  {
    id: "p2",
    name: "Commodity Momentum Master",
    description: "High-frequency momentum strategy for mining and energy stocks with dynamic position sizing",
    totalReturn: 38.6,
    maxDrawdown: -11.3,
    sharpeRatio: 2.12,
    winRate: 69.8,
    totalTrades: 189,
    stocksHeld: 22,
    subscribers: 892,
  },
  {
    id: "p3",
    name: "Consumer Defensive Shield",
    description: "Low-risk strategy focusing on consumer staples with consistent returns and minimal volatility exposure",
    totalReturn: 16.4,
    maxDrawdown: -4.2,
    sharpeRatio: 1.98,
    winRate: 78.5,
    totalTrades: 156,
    stocksHeld: 9,
    subscribers: 654,
  },
  {
    id: "p4",
    name: "Banking Sector Breakout",
    description: "Momentum-based strategy capitalizing on banking sector volatility and breakout patterns with technical indicators",
    totalReturn: 31.2,
    maxDrawdown: -8.7,
    sharpeRatio: 2.28,
    winRate: 71.4,
    totalTrades: 198,
    stocksHeld: 12,
    subscribers: 1089,
  },
  {
    id: "p5",
    name: "Tech Growth Accelerator",
    description: "Growth-focused strategy targeting emerging technology companies with strong fundamentals and market momentum",
    totalReturn: 54.3,
    maxDrawdown: -15.2,
    sharpeRatio: 1.87,
    winRate: 65.3,
    totalTrades: 267,
    stocksHeld: 25,
    subscribers: 1523,
  },
  {
    id: "p6",
    name: "Dividend Aristocrats",
    description: "Conservative income strategy focusing on high-dividend blue-chip stocks with long track records of consistent payouts",
    totalReturn: 12.8,
    maxDrawdown: -3.1,
    sharpeRatio: 2.56,
    winRate: 82.1,
    totalTrades: 124,
    stocksHeld: 8,
    subscribers: 743,
  },
  {
    id: "p7",
    name: "Small Cap Value Hunter",
    description: "Value investing approach targeting undervalued small-cap stocks with strong balance sheets and growth potential",
    totalReturn: 47.9,
    maxDrawdown: -12.8,
    sharpeRatio: 2.03,
    winRate: 68.7,
    totalTrades: 312,
    stocksHeld: 32,
    subscribers: 967,
  },
  {
    id: "p8",
    name: "Infrastructure Play",
    description: "Long-term strategy focused on infrastructure and construction sector growth driven by government spending",
    totalReturn: 28.5,
    maxDrawdown: -7.4,
    sharpeRatio: 2.19,
    winRate: 73.6,
    totalTrades: 176,
    stocksHeld: 14,
    subscribers: 821,
  },
];

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="py-4">
      <Card className="w-[340px] md:w-[380px] min-h-[480px] snap-start hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group shrink-0">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-foreground group-hover:text-ochre transition-colors">{strategy.name}</h3>
              </div>
              <div>
                <p className={`text-sm text-muted-foreground leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}>{strategy.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-xs text-ochre hover:text-ochre/80 font-medium mt-1 flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Return highlight */}
            <div className="border-t border-b border-border py-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Return</span>
                </div>
                <div className="text-4xl font-mono font-bold text-green-600">+{strategy.totalReturn}%</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3 font-mono flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Max. Drawdown</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-sm font-semibold ${Math.abs(strategy.maxDrawdown) <= 10 ? "text-green-600" : "text-yellow-600"}`}>{strategy.maxDrawdown}%</span>
                    <div className="relative inline-block group/tooltip">
                      <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Maximum peak-to-trough decline
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-sm font-semibold ${strategy.winRate >= 70 ? "text-green-600" : "text-yellow-600"}`}>{strategy.winRate.toFixed(0)}%</span>
                    <div className="relative inline-block group/tooltip">
                      <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Percentage of profitable trades
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Quality</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-xs font-semibold ${strategy.sharpeRatio >= 2 ? "text-green-600" : "text-yellow-600"}`}>{strategy.sharpeRatio >= 2 ? "Excellent" : "Good"}</span>
                    <div className="relative inline-block group/tooltip">
                      <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Sharpe Ratio: {strategy.sharpeRatio.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Trades</div>
                  <span className="text-xs text-foreground font-semibold">{strategy.totalTrades}</span>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Stocks</div>
                  <span className="text-xs text-foreground font-semibold">{strategy.stocksHeld}</span>
                </div>
              </div>
            </div>

            {/* CTA button */}
            <Button className="w-full bg-ochre hover:bg-ochre/90 text-white mt-auto">
              <Heart className="w-4 h-4 mr-2" />
              Berlangganan Strategi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PopularStrategiesShowcase() {
  return (
    <section className="py-12">
      {/* Section header */}
      <div className="px-6 mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 text-balance">Strategi Terbaik dari Komunitas</h2>
          <p className="text-base text-muted-foreground text-pretty leading-relaxed">Temukan strategi yang terbukti berhasil dari komunitas trader ahli kami. Berlangganan untuk mengikuti trading mereka dan replikasi kesuksesan mereka.</p>
        </div>
      </div>

      {/* Strategy cards grid */}
      <div className="relative mb-8">
        <div className="flex gap-6 overflow-x-auto pb-4 py-1 snap-x snap-mandatory scrollbar-hide pl-6 pr-0">
          {popularStrategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
      </div>

      {/* View all button */}
      <div className="text-center px-6">
        <Button size="lg" variant="outline" className="bg-transparent">
          Lihat Semua Strategi
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </section>
  );
}
