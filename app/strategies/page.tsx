"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { ShowcaseStrategyCard } from "@/components/cards/showcase-strategy-card"
import { MarketplaceStrategyCard } from "@/components/cards/marketplace-strategy-card"
import { popularStrategies } from "@/components/cards/data"

export default function Strategies() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TickerTape />
      <div className="flex-1 overflow-y-auto mt-8 pb-8">
        <div className="space-y-12">
          {/* Featured / Showcase Section */}
          <section>
            <div className="px-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-1">Strategy Showcase</h2>
                <p className="text-muted-foreground">Top-performing strategies of the week</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {popularStrategies.slice(0, 3).map((strategy) => (
                  <ShowcaseStrategyCard key={strategy.id} strategy={strategy} />
                ))}
              </div>
            </div>
          </section>

          {/* Marketplace / Hero Cards Section */}
          <section>
            <div className="px-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-1">Explore Strategies</h2>
                <p className="text-muted-foreground">Discover more strategies from the community</p>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                {/* Displaying popular strategies again as marketplace items for demo - 8x for stress test */}
                {Array(8).fill(popularStrategies).flat().map((strategy, i) => (
                  <MarketplaceStrategyCard key={`mp-${strategy.id}-${i}`} strategy={strategy} className="w-80 flex-shrink-0" />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
