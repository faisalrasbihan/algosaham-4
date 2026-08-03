"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { CardCarousel } from "@/components/card-carousel"
import {
  StrategyShowcaseCard,
  StrategyShowcaseCardSkeleton,
} from "./cards/strategy-showcase-card"
import { Strategy } from "./cards/types"
import { PageContainer, SectionHeader } from "@/components/page-layout"

interface DBStrategy {
  id: number
  name: string
  description: string | null
  totalReturn: string | null
  maxDrawdown: string | null
  successRate: string | null
  sharpeRatio: string | null
  totalTrades: number | null
  totalStocks: number | null
  createdAt: string | null
  subscribers: number | null
}

// Helper function to convert DB strategy to component strategy
function mapDBStrategyToStrategy(dbStrategy: DBStrategy): Strategy {
  return {
    id: dbStrategy.id.toString(),
    name: dbStrategy.name,
    description: dbStrategy.description || undefined,
    totalReturn: parseFloat(dbStrategy.totalReturn || "0"),
    maxDrawdown: parseFloat(dbStrategy.maxDrawdown || "0"),
    winRate: parseFloat(dbStrategy.successRate || "0"),
    sharpeRatio: parseFloat(dbStrategy.sharpeRatio || "0"),
    totalTrades: dbStrategy.totalTrades || 0,
    stocksHeld: dbStrategy.totalStocks || 0,
    createdDate: dbStrategy.createdAt || new Date().toISOString(),
    subscribers: dbStrategy.subscribers || 0,

    // Unused fields - set to 0 to satisfy type requirements
    yoyReturn: 0,
    momReturn: 0,
    weeklyReturn: 0,
    sortinoRatio: 0,
    calmarRatio: 0,
    profitFactor: 0,
    avgTradeDuration: 0,
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
          const mappedStrategies = result.data.map((dbStrategy: DBStrategy) =>
            mapDBStrategyToStrategy(dbStrategy)
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
    <section className="bg-transparent pb-12 pt-0 sm:pb-16 sm:pt-1">
      {/* Section header */}
      <PageContainer>
        <SectionHeader
          align="left"
          className="mb-5 [&_h2]:text-xl sm:[&_h2]:text-2xl"
          title="Strategi trading pilihan untuk mulai dieksplorasi"
          description="Dibuat dari analisis data historis dan sudah dicoba komunitas trader. Ikuti langsung atau modifikasi sesuai workflow kamu."
        />
      </PageContainer>

      {/* Strategy cards grid */}
      <PageContainer className="mb-8">
        {isLoading ? (
          <CardCarousel noPadding indicatorStyle="floating" className="snap-x snap-mandatory py-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <StrategyShowcaseCardSkeleton
                key={i}
                className="w-[280px] sm:w-[300px] lg:w-[292px]"
              />
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
          <CardCarousel noPadding indicatorStyle="floating" className="snap-x snap-mandatory py-2">
            {strategies.map((strategy, index) => (
              <StrategyShowcaseCard
                key={strategy.id}
                strategy={strategy}
                iconVariant={index}
                className="w-[280px] sm:w-[300px] lg:w-[292px]"
              />
            ))}
          </CardCarousel>
        )}
      </PageContainer>

      {/* View all button */}
      <PageContainer>
        <Button asChild size="lg" variant="outline">
          <Link href="/strategies">
            Lihat semua strategi
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </PageContainer>
    </section>
  )
}
