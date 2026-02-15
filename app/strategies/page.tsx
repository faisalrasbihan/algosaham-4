"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { ShowcaseStrategyCard } from "@/components/cards/showcase-strategy-card"
import { MarketplaceStrategyCard } from "@/components/cards/marketplace-strategy-card"
import { MinimalStrategyCard } from "@/components/cards/minimal-strategy-card"
import { popularStrategies } from "@/components/cards/data" // Keep for showcase if needed, or replace
import { useState, useEffect } from "react"
import { StrategyCardSkeleton } from "@/components/strategy-card-skeleton"
import { toast } from "sonner"
import { Strategy } from "@/components/cards/types"
import { useUserTier } from "@/context/user-tier-context"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Strategies() {
  const [exploreStrategies, setExploreStrategies] = useState<Strategy[]>([])
  const [isLoadingExplore, setIsLoadingExplore] = useState(true)
  const [subscribedIds, setSubscribedIds] = useState<string[]>([])
  const [subscriptionLoading, setSubscriptionLoading] = useState<Record<string, boolean>>({})

  // Subscribe confirmation dialog state
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false)
  const [strategyToSubscribe, setStrategyToSubscribe] = useState<string | null>(null)
  const [isSubscribing, setIsSubscribing] = useState(false)

  const { tier, limits, usage, refreshTier } = useUserTier()

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

  // When user clicks subscribe/unsubscribe button on a card
  const handleSubscribeClick = (strategyId: string) => {
    const isSubscribed = subscribedIds.includes(strategyId)

    if (isSubscribed) {
      // Unsubscribe fires directly (no confirmation needed here — portfolio page has its own)
      performSubscriptionAction(strategyId, true)
    } else {
      // Subscribe: show confirmation dialog
      setStrategyToSubscribe(strategyId)
      refreshTier() // Fetch fresh quota
      setSubscribeDialogOpen(true)
    }
  }

  // Perform the actual subscribe/unsubscribe API call
  const performSubscriptionAction = async (strategyId: string, isUnsubscribe: boolean) => {
    setSubscriptionLoading(prev => ({ ...prev, [strategyId]: true }))

    try {
      const endpoint = isUnsubscribe
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
      if (isUnsubscribe) {
        setSubscribedIds(prev => prev.filter(id => id !== strategyId))
        toast.success("Berhenti berlangganan strategi")
      } else {
        setSubscribedIds(prev => [...prev, strategyId])
        toast.success("Berhasil berlangganan strategi")
      }

      refreshTier()
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui langganan")
    } finally {
      setSubscriptionLoading(prev => ({ ...prev, [strategyId]: false }))
    }
  }

  // Confirm subscribe from the dialog
  const handleConfirmSubscribe = async () => {
    if (!strategyToSubscribe) return
    setIsSubscribing(true)
    await performSubscriptionAction(strategyToSubscribe, false)
    setIsSubscribing(false)
    setSubscribeDialogOpen(false)
    setStrategyToSubscribe(null)
  }

  const subscriptionQuotaReached = limits.subscriptions !== -1 && usage.subscriptions >= limits.subscriptions
  const subscriptionsRemaining = limits.subscriptions === -1 ? '∞' : (limits.subscriptions - usage.subscriptions)

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
              <div className="flex gap-4 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                {popularStrategies.map((strategy) => (
                  <ShowcaseStrategyCard key={strategy.id} strategy={strategy} userTier={tier} />
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
                <div className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                  {[1, 2, 3, 4].map((i) => (
                    <StrategyCardSkeleton key={i} />
                  ))}
                </div>
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
                      onSubscribe={handleSubscribeClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Minimal Strategy Cards — uncomment to enable */}
          {/* <section>
            <div className="px-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-1">Quick Overview</h2>
                <p className="text-muted-foreground">At a glance strategy performance</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                {popularStrategies.map((strategy) => (
                  <MinimalStrategyCard key={strategy.id} strategy={strategy} />
                ))}
              </div>
            </div>
          </section> */}
        </div>
      </div>

      {/* Subscribe Confirmation Dialog */}
      <AlertDialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Berlangganan Strategi</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {subscriptionQuotaReached ? (
                  <>
                    <p>Kuota langganan kamu sudah habis.</p>
                    <p className="text-sm">
                      Kamu telah menggunakan{' '}
                      <span
                        className="inline-block px-2 py-0.5 rounded-md font-semibold text-xs text-red-700"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        {usage.subscriptions}/{limits.subscriptions}
                      </span>{' '}
                      slot langganan. Upgrade plan untuk menambah kuota.
                    </p>
                  </>
                ) : (
                  <>
                    <p>Apakah kamu yakin ingin berlangganan strategi ini?</p>
                    <p className="text-sm">
                      Sisa kuota langganan kamu:{' '}
                      <span
                        className="inline-block px-2 py-0.5 rounded-md font-semibold text-xs text-foreground"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: 'rgba(140, 188, 185, 0.15)' }}
                      >
                        {subscriptionsRemaining}
                      </span>
                      {limits.subscriptions !== -1 && (
                        <span className="text-muted-foreground"> dari {limits.subscriptions} slot</span>
                      )}
                    </p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubscribing}>Batal</AlertDialogCancel>
            {subscriptionQuotaReached ? (
              <Link href="/harga">
                <Button
                  size="sm"
                  className="text-white font-medium hover:opacity-90"
                  style={{ backgroundColor: '#d07225' }}
                >
                  Upgrade Plan
                </Button>
              </Link>
            ) : (
              <AlertDialogAction onClick={handleConfirmSubscribe} disabled={isSubscribing}>
                {isSubscribing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSubscribing ? 'Memproses...' : 'Ya, Berlangganan'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
