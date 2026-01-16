"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { CardCarousel } from "@/components/card-carousel"
import { StrategyCardSkeleton } from "@/components/strategy-card-skeleton"
import { MarketplaceStrategyCard } from "./cards/marketplace-strategy-card"
import { Strategy } from "./cards/types"

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
    id: dbStrategy.id.toString(),
    name: dbStrategy.name,
    description: dbStrategy.description || undefined,
    totalReturn: parseFloat(dbStrategy.ytdReturn || dbStrategy.totalReturns || "0"),
    yoyReturn: 0, // Default or fetch if available
    momReturn: 0,
    weeklyReturn: 0,
    maxDrawdown: parseFloat(dbStrategy.maxDrawdown || "0"),
    sharpeRatio: parseFloat(dbStrategy.sharpeRatio || "0"),
    sortinoRatio: 0,
    calmarRatio: 0,
    profitFactor: 0,
    winRate: parseFloat(dbStrategy.winRate || "0"),
    // These fields don't exist in DB, use reasonable defaults
    totalTrades: Math.floor((dbStrategy.totalStocks || 0) * (15 + index * 5)), // Estimate based on stocks held
    avgTradeDuration: 5,
    stocksHeld: dbStrategy.totalStocks || 0,
    createdDate: new Date().toISOString(), // Mock date
    subscribers: Math.floor(500 + Math.random() * 1000), // Random for now
  }
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
            Strategi trading terbaik, tanpa pikir panjang.
          </h2>
          <p className="text-base text-muted-foreground text-pretty leading-relaxed">
            Dibuat dari analisis data historis berbasis ML dan sudah dicoba komunitas trader. Kamu tinggal ikuti atau modifikasi biar makin cuan.
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
              <MarketplaceStrategyCard key={strategy.id} strategy={strategy} className="w-[300px] md:w-[340px]" />
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

