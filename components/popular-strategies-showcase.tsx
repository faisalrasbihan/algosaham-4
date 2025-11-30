"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Heart, Info, ArrowRight, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { CardCarousel } from "@/components/card-carousel"
import { StrategyCardSkeleton } from "@/components/strategy-card-skeleton"

interface Strategy {
  id: number
  name: string
  description: string | null
  totalReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  totalTrades: number
  stocksHeld: number
  subscribers: number
}

interface DBStrategy {
  id: number
  name: string
  description: string | null
  totalReturns: string | null
  ytdReturn: string | null
  maxDrawdown: string | null
  sharpeRatio: string | null
  winRate: string | null
  totalStocks: number | null
}

// Helper function to convert DB strategy to component strategy
function mapDBStrategyToStrategy(dbStrategy: DBStrategy, index: number): Strategy {
  return {
    id: dbStrategy.id,
    name: dbStrategy.name,
    description: dbStrategy.description,
    totalReturn: parseFloat(dbStrategy.ytdReturn || dbStrategy.totalReturns || "0"),
    maxDrawdown: parseFloat(dbStrategy.maxDrawdown || "0"),
    sharpeRatio: parseFloat(dbStrategy.sharpeRatio || "0"),
    winRate: parseFloat(dbStrategy.winRate || "0"),
    // These fields don't exist in DB, use reasonable defaults
    totalTrades: Math.floor((dbStrategy.totalStocks || 0) * (15 + index * 5)), // Estimate based on stocks held
    stocksHeld: dbStrategy.totalStocks || 0,
    subscribers: Math.floor(500 + Math.random() * 1000), // Random for now
  }
}

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="py-4">
      <Card className="w-[340px] md:w-[380px] min-h-[400px] snap-start hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group shrink-0">
        <CardContent className="p-6 h-full flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-foreground group-hover:text-ochre transition-colors">
                {strategy.name}
              </h3>
            </div>
            <div>
              <p className={`text-sm text-muted-foreground leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}>
                {strategy.description || "No description available"}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
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
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Return
                </span>
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
                  <span
                    className={`text-sm font-semibold ${Math.abs(strategy.maxDrawdown) <= 10 ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {strategy.maxDrawdown}%
                  </span>
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
                  <span
                    className={`text-sm font-semibold ${strategy.winRate >= 70 ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {strategy.winRate.toFixed(0)}%
                  </span>
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
                  <span
                    className={`text-xs font-semibold ${strategy.sharpeRatio >= 2 ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {strategy.sharpeRatio >= 2 ? "Excellent" : "Good"}
                  </span>
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
            Subscribe to Strategy
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

export function PopularStrategiesShowcase() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStrategies() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/strategies/popular')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch strategies: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (result.success && result.data) {
          // Map database strategies to component format
          const mappedStrategies = result.data.map((dbStrategy: DBStrategy, index: number) => 
            mapDBStrategyToStrategy(dbStrategy, index)
          )
          setStrategies(mappedStrategies)
        } else {
          throw new Error(result.error || 'Failed to load strategies')
        }
      } catch (err) {
        console.error('Error fetching strategies:', err)
        setError(err instanceof Error ? err.message : 'Failed to load strategies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStrategies()
  }, [])

  return (
    <section className="py-12 dotted-background">
      {/* Section header */}
      <div className="px-6 mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 text-balance">
            Top Performing Strategies
          </h2>
          <p className="text-base text-muted-foreground text-pretty leading-relaxed">
            Discover proven strategies from our community of expert traders. Subscribe to follow their trades and
            replicate their success.
          </p>
        </div>
      </div>

      {/* Strategy cards grid */}
      <div className="mb-8 px-6">
        {isLoading ? (
          <CardCarousel className="snap-x snap-mandatory" noPadding>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <StrategyCardSkeleton key={i} />
            ))}
          </CardCarousel>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : strategies.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No strategies found</p>
          </div>
        ) : (
          <CardCarousel className="snap-x snap-mandatory" noPadding>
            {strategies.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </CardCarousel>
        )}
      </div>

      {/* View all button */}
      <div className="text-center px-6">
        <Button size="lg" variant="outline" className="bg-white text-foreground border-border hover:bg-[#487b78] hover:text-white">
          View All Strategies
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </section>
  )
}
