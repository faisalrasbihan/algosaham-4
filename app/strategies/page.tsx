"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { ShowcaseStrategyCard } from "@/components/cards/showcase-strategy-card"
import { MarketplaceStrategyCard } from "@/components/cards/marketplace-strategy-card"
import { popularStrategies } from "@/components/cards/data" // Keep for showcase if needed, or replace
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Strategy } from "@/components/cards/types"

export default function Strategies() {
  const [exploreStrategies, setExploreStrategies] = useState<Strategy[]>([])
  const [isLoadingExplore, setIsLoadingExplore] = useState(true)
  const [subscribedIds, setSubscribedIds] = useState<string[]>([])
  const [subscriptionLoading, setSubscriptionLoading] = useState<Record<string, boolean>>({})

  // Fetch initial data (strategies + user subscriptions)
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingExplore(true)

        // 1. Fetch Explore Strategies
        const stratResponse = await fetch('/api/strategies/public')
        if (stratResponse.ok) {
          const data = await stratResponse.json()
          if (data.success && data.data) {
            // Map IDs to strings if needed
            const mappedStrategies = data.data.map((s: any) => ({
              ...s,
              id: s.id.toString(),
              createdDate: s.createdAt,
              winRate: parseFloat(s.successRate || 0),
              totalReturn: parseFloat(s.totalReturn || 0),
              maxDrawdown: parseFloat(s.maxDrawdown || 0),
              sharpeRatio: parseFloat(s.sharpeRatio || 0),
              stocksHeld: s.totalStocks || 0,
            }))
            setExploreStrategies(mappedStrategies)
          }
        }

        // 2. Fetch User Subscriptions
        const subResponse = await fetch('/api/subscriptions/list')
        if (subResponse.ok) {
          const data = await subResponse.json()
          if (data.success && data.data) {
            setSubscribedIds(data.data.map((sub: any) => sub.id?.toString() || sub.strategyId?.toString())) // Handle different contract if needed
          }
        }

      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load strategies")
      } finally {
        setIsLoadingExplore(false)
      }
    }

    fetchData()
  }, [])

  const handleSubscribe = async (strategyId: string) => {
    const isSubscribed = subscribedIds.includes(strategyId)
    setSubscriptionLoading(prev => ({ ...prev, [strategyId]: true }))

    try {
      const endpoint = isSubscribed
        ? '/api/strategies/unsubscribe'
        : '/api/strategies/subscribe'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Action failed')
      }

      // Update state
      if (isSubscribed) {
        setSubscribedIds(prev => prev.filter(id => id !== strategyId))
        toast.success("Unsubscribed from strategy")
      } else {
        setSubscribedIds(prev => [...prev, strategyId])
        toast.success("Subscribed to strategy")
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update subscription")
    } finally {
      setSubscriptionLoading(prev => ({ ...prev, [strategyId]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-background dotted-background">
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

          {/* Marketplace / Explore Section */}
          <section>
            <div className="px-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-1">Explore Strategies</h2>
                <p className="text-muted-foreground">Discover more strategies from the community</p>
              </div>

              {isLoadingExplore ? (
                <div className="text-center py-8 text-muted-foreground">Loading strategies...</div>
              ) : exploreStrategies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No public strategies found.</div>
              ) : (
                <div className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                  {exploreStrategies.map((strategy) => (
                    <MarketplaceStrategyCard
                      key={strategy.id}
                      strategy={strategy}
                      className="w-80 flex-shrink-0"
                      isSubscribed={subscribedIds.includes(strategy.id)}
                      isLoading={subscriptionLoading[strategy.id]}
                      onSubscribe={handleSubscribe}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
