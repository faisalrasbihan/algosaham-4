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
import { Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { StrategyPreviewDialog } from "@/components/strategy-preview-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Dialog states: 'confirm' | 'loading' | 'success'
type SubscribeDialogState = 'confirm' | 'loading' | 'success'

export default function Strategies() {
  const [exploreStrategies, setExploreStrategies] = useState<Strategy[]>([])
  const [isLoadingExplore, setIsLoadingExplore] = useState(true)
  const [subscribedIds, setSubscribedIds] = useState<string[]>([])
  const [subscriptionLoading, setSubscriptionLoading] = useState<Record<string, boolean>>({})

  // Subscribe confirmation dialog state
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false)
  const [strategyToSubscribe, setStrategyToSubscribe] = useState<string | null>(null)
  const [dialogState, setDialogState] = useState<SubscribeDialogState>('confirm')
  const [subscribedStrategyName, setSubscribedStrategyName] = useState("")

  // Strategy Preview dialog state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewStrategyId, setPreviewStrategyId] = useState<string | null>(null)
  const [previewStrategyName, setPreviewStrategyName] = useState<string | undefined>(undefined)

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
      setDialogState('confirm')
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
      }

      refreshTier()
      return true
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui langganan")
      return false
    } finally {
      setSubscriptionLoading(prev => ({ ...prev, [strategyId]: false }))
    }
  }

  // Confirm subscribe from the dialog
  const handleConfirmSubscribe = async () => {
    if (!strategyToSubscribe) return

    // Find the strategy name for the success message
    const strategy = exploreStrategies.find(s => s.id === strategyToSubscribe)
    setSubscribedStrategyName(strategy?.name || "")

    // Move to loading state
    setDialogState('loading')

    const success = await performSubscriptionAction(strategyToSubscribe, false)

    if (success) {
      // Move to success state
      setDialogState('success')
    } else {
      // On error, close the dialog
      setSubscribeDialogOpen(false)
      setDialogState('confirm')
      setStrategyToSubscribe(null)
    }
  }

  // Close the dialog and reset state
  const handleCloseDialog = () => {
    setSubscribeDialogOpen(false)
    setDialogState('confirm')
    setStrategyToSubscribe(null)
  }

  const subscriptionQuotaReached = limits.subscriptions !== -1 && usage.subscriptions >= limits.subscriptions
  const subscriptionsRemaining = limits.subscriptions === -1 ? '∞' : (limits.subscriptions - usage.subscriptions)

  // Handler for opening strategy preview
  const handleCardClick = (strategy: Strategy) => {
    setPreviewStrategyId(strategy.id)
    setPreviewStrategyName(strategy.name)
    setPreviewDialogOpen(true)
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
                <p className="text-muted-foreground">Top-performing strategies we curated for you</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                {popularStrategies.map((strategy) => (
                  <ShowcaseStrategyCard key={strategy.id} strategy={strategy} userTier={tier} onCardClick={() => handleCardClick(strategy)} />
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
                      onCardClick={() => handleCardClick(strategy)}
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
      <Dialog open={subscribeDialogOpen} onOpenChange={(open) => {
        // Only allow closing when not in loading state
        if (!open && dialogState !== 'loading') {
          handleCloseDialog()
        }
      }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
          // Prevent closing during loading
          if (dialogState === 'loading') e.preventDefault()
        }}>
          {/* Loading State */}
          {dialogState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground font-mono">Memproses langganan...</p>
            </div>
          )}

          {/* Success State */}
          {dialogState === 'success' && (
            <>
              <DialogHeader className="items-center text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <DialogTitle className="font-mono text-xl">Berhasil Berlangganan!</DialogTitle>
                <DialogDescription className="font-mono text-sm text-muted-foreground text-center pt-2">
                  Kamu berhasil berlangganan strategi{' '}
                  {subscribedStrategyName && (
                    <span className="font-semibold text-foreground">&quot;{subscribedStrategyName}&quot;</span>
                  )}
                  . Strategi ini sekarang tersedia di portofolio kamu.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={handleCloseDialog}
                  className="w-full font-mono bg-[#d07225] hover:bg-[#a65b1d]"
                >
                  Continue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCloseDialog()
                    window.location.href = "/portfolio"
                  }}
                  className="w-full font-mono"
                >
                  Lihat Strategi Saya
                </Button>
              </div>
            </>
          )}

          {/* Confirmation State */}
          {dialogState === 'confirm' && (
            <>
              <DialogHeader>
                <DialogTitle>Berlangganan Strategi</DialogTitle>
                <DialogDescription asChild>
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
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Batal
                </Button>
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
                  <Button onClick={handleConfirmSubscribe}>
                    Ya, Berlangganan
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Strategy Preview Dialog */}
      <StrategyPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        strategyId={previewStrategyId}
        strategyName={previewStrategyName}
      />
    </div>
  )
}
