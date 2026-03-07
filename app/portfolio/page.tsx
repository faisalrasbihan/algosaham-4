"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { SubscribedStrategyCard } from "@/components/cards/subscribed-strategy-card"
import { RegularStrategyCard } from "@/components/cards/regular-strategy-card"
import { useUser, RedirectToSignIn } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useCallback } from "react"
import { Loader2, CheckCircle } from "lucide-react"
import { StrategyCardSkeleton } from "@/components/strategy-card-skeleton"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useUserTier } from "@/context/user-tier-context"
import { toast } from "sonner"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Strategy as CardStrategy } from "@/components/cards/types"
import type { BacktestRequest, BacktestResult } from "@/lib/api"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Dialog states for unsubscribe: 'confirm' | 'loading' | 'success'
type UnsubscribeDialogState = 'confirm' | 'loading' | 'success'

type StrategyHolding = {
    symbol: string
    color?: string
}

interface Strategy {
    id: number
    name: string
    description: string | null
    creatorId: string
    createdAt: Date
    updatedAt?: Date | string
    // New schema fields
    totalReturn?: string | null
    maxDrawdown?: string | null
    successRate?: string | null
    totalTrades?: number | null
    totalStocks?: number | null
    qualityScore?: string | null
    configHash?: string | null
    isPublic?: boolean
    isActive?: boolean
}

function SectionSummary({
    items,
}: {
    items: Array<{ label: string; value: string | number; hint?: string }>
}) {
    return (
        <div className="mt-3 flex flex-wrap items-center gap-2">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5"
                >
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {item.label}
                    </div>
                    <div className="text-sm font-semibold text-foreground leading-none">
                        {item.value}
                    </div>
                    {item.hint ? (
                        <div className="text-xs text-muted-foreground leading-none">{item.hint}</div>
                    ) : null}
                </div>
            ))}
        </div>
    )
}

function PortfolioEmptyState({
    title,
    description,
    actionLabel,
    onAction,
}: {
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}) {
    return (
        <div className="py-3">
            <div className="w-full rounded-2xl border border-border/60 bg-white/55 px-8 py-12 text-center backdrop-blur-md">
                <p className="text-2xl font-semibold text-foreground">{title}</p>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
                {actionLabel && onAction ? (
                    <button
                        type="button"
                        onClick={onAction}
                        className="mt-5 font-ibm-plex-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#d07225] hover:text-[#a65b1d]"
                    >
                        {actionLabel}
                    </button>
                ) : null}
            </div>
        </div>
    )
}

type JournalEntry = {
    dateKey: string
    dateLabel: string
    ticker: string
    color: string
    action: "BUY" | "SELL"
    entryPrice: number
    currentPrice: number
    value: number
}

type SubscriptionApiRow = {
    id: number | string
    subscriptionId?: number | string
    name: string
    description?: string | null
    creator?: string
    totalReturn?: string | number | null
    maxDrawdown?: string | number | null
    sharpeRatio?: string | number | null
    successRate?: string | number | null
    totalTrades?: number | null
    totalStocks?: number | null
    createdAt?: string
    subscribers?: number
    subscribedAt: string
    returnSinceSubscription?: string | number | null
    snapshotHoldings?: StrategyHolding[] | null
    topHoldings?: StrategyHolding[] | null
    snapshotReturn?: string | number | null
    config?: BacktestRequest | null
}

const currencyFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
})

function toOptionalNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    return null
}

function toNumber(value: unknown, fallback = 0): number {
    return toOptionalNumber(value) ?? fallback
}

function deriveTopHoldingsFromTrades(trades?: BacktestResult["trades"]): StrategyHolding[] | null {
    if (!trades?.length) {
        return null
    }

    const latestBuys = [...trades]
        .filter((trade) => trade.action === "BUY")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const holdings: StrategyHolding[] = []
    const seen = new Set<string>()
    const colors = ["bg-blue-600", "bg-orange-500", "bg-green-600"]

    for (const trade of latestBuys) {
        if (seen.has(trade.ticker)) {
            continue
        }

        seen.add(trade.ticker)
        holdings.push({
            symbol: trade.ticker,
            color: colors[holdings.length] ?? "bg-slate-600",
        })

        if (holdings.length === 3) {
            break
        }
    }

    return holdings.length > 0 ? holdings : null
}

function mapSubscriptionToCardStrategy(subscription: SubscriptionApiRow): CardStrategy {
    return {
        id: subscription.id.toString(),
        subscriptionId: subscription.subscriptionId?.toString(),
        name: subscription.name,
        description: subscription.description || undefined,
        creator: subscription.creator || 'Unknown',
        totalReturn: toNumber(subscription.totalReturn),
        yoyReturn: 0,
        momReturn: 0,
        weeklyReturn: 0,
        maxDrawdown: toNumber(subscription.maxDrawdown),
        sharpeRatio: toNumber(subscription.sharpeRatio),
        sortinoRatio: 0,
        calmarRatio: 0,
        profitFactor: 0,
        winRate: toNumber(subscription.successRate),
        totalTrades: subscription.totalTrades || 0,
        avgTradeDuration: 0,
        stocksHeld: subscription.totalStocks || 0,
        createdDate: subscription.createdAt || new Date().toISOString(),
        subscribers: subscription.subscribers || 0,
        subscriptionDate: subscription.subscribedAt,
        returnSinceSubscription: toNumber(subscription.returnSinceSubscription),
        snapshotHoldings: subscription.snapshotHoldings,
        topHoldings: subscription.topHoldings || subscription.snapshotHoldings,
        snapshotReturn: toOptionalNumber(subscription.snapshotReturn) ?? undefined,
        backtestConfig: subscription.config ?? null,
    }
}

function applyBacktestToSubscribedStrategy(strategy: CardStrategy, backtestResult: BacktestResult): CardStrategy {
    const totalReturn = toNumber(backtestResult.summary?.totalReturn, strategy.totalReturn)
    const snapshotReturn = strategy.snapshotReturn ?? null
    const calculatedSinceSubscribed = snapshotReturn !== null
        ? Number((totalReturn - snapshotReturn).toFixed(2))
        : strategy.returnSinceSubscription
    const currentPrices = (backtestResult.recentSignals?.signals || []).reduce<Record<string, number>>((acc, signal) => {
        const latestPrice = toOptionalNumber(signal.price) ?? toOptionalNumber(signal.close)
        if (signal.ticker && latestPrice !== null && acc[signal.ticker] === undefined) {
            acc[signal.ticker] = latestPrice
        }
        return acc
    }, {})

    return {
        ...strategy,
        totalReturn,
        maxDrawdown: toNumber(backtestResult.summary?.maxDrawdown, strategy.maxDrawdown),
        sharpeRatio: toNumber(backtestResult.summary?.sharpeRatio, strategy.sharpeRatio),
        profitFactor: toNumber(backtestResult.summary?.profitFactor, strategy.profitFactor),
        winRate: toNumber(backtestResult.summary?.winRate, strategy.winRate),
        totalTrades: Math.trunc(toNumber(backtestResult.summary?.totalTrades, strategy.totalTrades)),
        avgTradeDuration: toNumber(backtestResult.summary?.averageHoldingDays, strategy.avgTradeDuration),
        stocksHeld: Math.max(
            strategy.stocksHeld,
            deriveTopHoldingsFromTrades(backtestResult.trades)?.length || 0,
            backtestResult.summary?.bestTickers?.length || 0,
        ),
        returnSinceSubscription: calculatedSinceSubscribed,
        topHoldings: deriveTopHoldingsFromTrades(backtestResult.trades) || strategy.topHoldings || strategy.snapshotHoldings,
        backtestTrades: backtestResult.trades,
        backtestSummary: backtestResult.summary,
        backtestCurrentPrices: currentPrices,
    }
}

function createTradingJournal(strategy: CardStrategy): JournalEntry[] {
    if (strategy.backtestTrades?.length) {
        return strategy.backtestTrades
            .map((trade) => {
                const tradeDate = new Date(trade.date)

                return {
                    dateKey: trade.date,
                    dateLabel: tradeDate.toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                    }),
                    ticker: trade.ticker,
                    color: "bg-slate-600",
                    action: trade.action,
                    entryPrice: trade.price,
                    currentPrice: strategy.backtestCurrentPrices?.[trade.ticker] ?? trade.price,
                    value: trade.value,
                }
            })
            .sort((a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime())
    }

    const holdings = (strategy.snapshotHoldings || strategy.topHoldings || [
        { symbol: "BBCA", color: "bg-blue-600" },
        { symbol: "BBRI", color: "bg-orange-500" },
        { symbol: "TLKM", color: "bg-green-600" },
    ]).slice(0, 3)

    return Array.from({ length: 7 }, (_, dayOffset) => {
        const date = new Date()
        date.setHours(0, 0, 0, 0)
        date.setDate(date.getDate() - dayOffset)

        const dailyHoldings = holdings.slice(0, ((dayOffset + holdings.length - 1) % holdings.length) + 1)

        return dailyHoldings.map((holding: StrategyHolding, index: number) => {
            const symbolSeed = holding.symbol
                .split("")
                .reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0)
            const basePrice = 900 + (symbolSeed % 18) * 215 + dayOffset * 37 + index * 19
            const entryPrice = Math.round(basePrice * 10) * 10
            const exposureFactor = 0.22 + index * 0.06 + (6 - dayOffset) * 0.015
            const value = Math.round(entryPrice * (85 + index * 20) * (1 + exposureFactor))
            const tradeSide: "BUY" | "SELL" = (dayOffset + index) % 2 === 0 ? "BUY" : "SELL"

            return {
                dateKey: date.toISOString().slice(0, 10),
                dateLabel: date.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                }),
                ticker: holding.symbol,
                color: holding.color || "bg-slate-600",
                action: tradeSide,
                entryPrice,
                currentPrice: entryPrice,
                value,
            }
        })
    }).flat()
}

function summarizeJournal(entries: JournalEntry[]) {
    return {
        buyCount: entries.filter((entry) => entry.action === "BUY").length,
        sellCount: entries.filter((entry) => entry.action === "SELL").length,
    }
}

export default function Portfolio() {
    const { isLoaded, isSignedIn } = useUser()
    const router = useRouter()
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const [savedStrategies, setSavedStrategies] = useState<Strategy[]>([])
    const [subscribedStrategies, setSubscribedStrategies] = useState<CardStrategy[]>([])
    const [isLoadingStrategies, setIsLoadingStrategies] = useState(true)
    const [isLoadingSubscribed, setIsLoadingSubscribed] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [unsubscribeDialogOpen, setUnsubscribeDialogOpen] = useState(false)
    const [strategyToUnsubscribe, setStrategyToUnsubscribe] = useState<{ strategyId: string; subscriptionId?: string } | null>(null)
    const [unsubscribeDialogState, setUnsubscribeDialogState] = useState<UnsubscribeDialogState>('confirm')
    const [unsubscribedStrategyName, setUnsubscribedStrategyName] = useState("")

    // Subscribe Dialog State
    type SubscribeDialogState = 'confirm' | 'loading' | 'success'
    const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false)
    const [strategyToSubscribe, setStrategyToSubscribe] = useState<string | null>(null)
    const [subscribeDialogState, setSubscribeDialogState] = useState<SubscribeDialogState>('confirm')
    const [subscribedStrategyName, setSubscribedStrategyName] = useState("")
    const [selectedSubscribedStrategy, setSelectedSubscribedStrategy] = useState<CardStrategy | null>(null)
    const [isLoadingSelectedSubscribedStrategy, setIsLoadingSelectedSubscribedStrategy] = useState(false)

    // Rerun Dialog State
    const [rerunDialogOpen, setRerunDialogOpen] = useState(false)
    const [strategyToRerun, setStrategyToRerun] = useState<string | null>(null)

    const [isRerunning, setIsRerunning] = useState<Record<string, boolean>>({})
    const [isSubscribing, setIsSubscribing] = useState<Record<string, boolean>>({})

    const { tier, limits, usage, refreshTier } = useUserTier()

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            setShouldRedirect(true)
        }
    }, [isLoaded, isSignedIn])

    const fetchData = useCallback(async () => {
        if (!isSignedIn) return

        // Fetch Saved Strategies
        try {
            setIsLoadingStrategies(true)
            const response = await fetch('/api/strategies/list')
            const data = await response.json()

            if (data.success && data.strategies) {
                setSavedStrategies(data.strategies)
            }
        } catch (error) {
            console.error('Failed to fetch strategies:', error)
        } finally {
            setIsLoadingStrategies(false)
        }

        // Fetch Subscribed Strategies
        try {
            setIsLoadingSubscribed(true)
            const response = await fetch('/api/subscriptions/list')
            const data = await response.json()

            if (data.success && data.data) {
                const mappedSubscribed: CardStrategy[] = (data.data as SubscriptionApiRow[]).map(mapSubscriptionToCardStrategy)
                setSubscribedStrategies(mappedSubscribed)
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error)
        } finally {
            setIsLoadingSubscribed(false)
        }
    }, [isSignedIn])

    useEffect(() => {
        if (isSignedIn) {
            fetchData()
        }
    }, [isSignedIn, fetchData])

    const handleUnsubscribeClick = (strategy: CardStrategy) => {
        setStrategyToUnsubscribe({
            strategyId: strategy.id,
            subscriptionId: strategy.subscriptionId,
        })
        setUnsubscribedStrategyName(strategy.name || "")
        setUnsubscribeDialogState('confirm')
        setUnsubscribeDialogOpen(true)
    }

    const handleUnsubscribeConfirm = async () => {
        if (!strategyToUnsubscribe) return

        // Move to loading state
        setUnsubscribeDialogState('loading')

        try {
            const numericStrategyId = Number(strategyToUnsubscribe.strategyId)
            const numericSubscriptionId = strategyToUnsubscribe.subscriptionId ? Number(strategyToUnsubscribe.subscriptionId) : null
            const response = await fetch('/api/strategies/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    strategyId: Number.isFinite(numericStrategyId) ? numericStrategyId : strategyToUnsubscribe.strategyId,
                    subscriptionId: numericSubscriptionId !== null && Number.isFinite(numericSubscriptionId) ? numericSubscriptionId : undefined,
                })
            })

            const data = await response.json()

            if (data.success) {
                setSubscribedStrategies(prev => prev.filter((s) => {
                    if (strategyToUnsubscribe.subscriptionId && s.subscriptionId) {
                        return s.subscriptionId !== strategyToUnsubscribe.subscriptionId
                    }
                    return s.id !== strategyToUnsubscribe.strategyId
                }))
                // Move to success state
                setUnsubscribeDialogState('success')
            } else {
                toast.error(data.error || 'Gagal berhenti berlangganan')
                // Close dialog on error
                handleCloseUnsubscribeDialog()
            }
        } catch (error) {
            console.error('Error unsubscribing:', error)
            toast.error('Gagal berhenti berlangganan')
            // Close dialog on error
            handleCloseUnsubscribeDialog()
        }
    }

    const handleCloseUnsubscribeDialog = () => {
        setUnsubscribeDialogOpen(false)
        setUnsubscribeDialogState('confirm')
        setStrategyToUnsubscribe(null)
    }

    const handleEdit = async (id: string) => {
        try {
            // Fetch the strategy details
            const response = await fetch(`/api/strategies/${id}`)
            const data = await response.json()

            if (data.success && data.strategy) {
                // Store the strategy config in localStorage to load in backtest page
                localStorage.setItem('editStrategy', JSON.stringify(data.strategy))
                // Navigate to backtest page
                router.push('/backtest')
            } else {
                toast.error('Gagal memuat strategi')
            }
        } catch (error) {
            console.error('Error loading strategy:', error)
            toast.error('Gagal memuat strategi')
        }
    }

    const handleDeleteClick = (id: string) => {
        setStrategyToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!strategyToDelete) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/strategies/delete?id=${strategyToDelete}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (data.success) {
                // Remove from local state
                setSavedStrategies(prev => prev.filter(s => s.id.toString() !== strategyToDelete))
                toast.success('Strategi berhasil dihapus')
            } else {
                toast.error(data.error || 'Gagal menghapus strategi')
            }
        } catch (error) {
            console.error('Error deleting strategy:', error)
            toast.error('Gagal menghapus strategi')
        } finally {
            setIsDeleting(false)
            setDeleteDialogOpen(false)
            setStrategyToDelete(null)
        }
    }

    const handleRerunClick = (id: string) => {
        setStrategyToRerun(id)
        refreshTier()
        setRerunDialogOpen(true)
    }

    const handleConfirmRerun = async () => {
        const id = strategyToRerun
        if (!id) return

        setRerunDialogOpen(false)
        setStrategyToRerun(null)

        setIsRerunning(prev => ({ ...prev, [id]: true }));

        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    const response = await fetch('/api/strategies/rerun', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ strategyId: id })
                    });

                    const data = await response.json();

                    if (data.success && data.strategy) {
                        // Update the specific strategy in local state instead of doing a full refetch
                        setSavedStrategies(prev => prev.map(s =>
                            s.id.toString() === id
                                ? { ...s, ...data.strategy, id: s.id }
                                : s
                        ));

                        // If they are unexpectedly subscribed to it, update it there too
                        setSubscribedStrategies(prev => prev.map(s =>
                            s.id === id
                                ? { ...s, totalReturn: parseFloat(data.strategy.totalReturn) || s.totalReturn }
                                : s
                        ));

                        refreshTier();
                        resolve(data);
                    } else {
                        reject(new Error(data.error || 'Failed to rerun strategy'));
                    }
                } catch (error) {
                    reject(error instanceof Error ? error : new Error('Failed to rerun strategy'));
                } finally {
                    setIsRerunning(prev => ({ ...prev, [id]: false }));
                }
            }),
            {
                loading: 'Menjalankan ulang backtest...',
                success: 'Berhasil memperbarui data backtest',
                error: (err) => err.message || 'Gagal menjalankan ulang backtest'
            }
        );
    }

    const handleSubscribeClick = (id: string) => {
        const isSubscribed = subscribedStrategies.some(s => s.id === id)

        if (isSubscribed) {
            toast.info("Anda sudah berlangganan strategi ini")
            return
        }

        setStrategyToSubscribe(id)
        setSubscribeDialogState('confirm')
        refreshTier()
        setSubscribeDialogOpen(true)
    }

    const handleOpenTradingJournal = async (strategy: CardStrategy) => {
        setSelectedSubscribedStrategy(strategy)

        if (!strategy.backtestConfig) {
            return
        }

        setIsLoadingSelectedSubscribedStrategy(true)

        try {
            const configObj = {
                ...strategy.backtestConfig,
                backtestConfig: {
                    ...strategy.backtestConfig.backtestConfig
                }
            }
            if (strategy.subscriptionDate) {
                const subDate = new Date(strategy.subscriptionDate)
                if (!isNaN(subDate.getTime())) {
                    configObj.backtestConfig.startDate = subDate.toISOString().split('T')[0]
                }
            }

            const response = await fetch('/api/backtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: configObj,
                    isInitial: true,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.message || errorData?.error || 'Gagal memuat trade history')
            }

            const backtestResult = await response.json() as BacktestResult
            setSelectedSubscribedStrategy((current) => {
                if (!current || current.id !== strategy.id) {
                    return current
                }

                return applyBacktestToSubscribedStrategy(current, backtestResult)
            })
        } catch (error) {
            console.error('Failed to load subscribed strategy backtest:', error)
            toast.error(error instanceof Error ? error.message : 'Gagal memuat trade history')
        } finally {
            setIsLoadingSelectedSubscribedStrategy(false)
        }
    }

    const handleConfirmSubscribe = async () => {
        if (!strategyToSubscribe) return

        const strategy = savedStrategies.find(s => s.id.toString() === strategyToSubscribe)
        setSubscribedStrategyName(strategy?.name || "")
        setSubscribeDialogState('loading')

        try {
            const response = await fetch('/api/strategies/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategyId: strategyToSubscribe })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Action failed')
            }

            setSubscribeDialogState('success')
            fetchData()
            refreshTier()
        } catch (error) {
            console.error('Subscription error:', error)
            toast.error(error instanceof Error ? error.message : "Gagal memperbarui langganan")
            handleCloseSubscribeDialog()
        }
    }

    const handleCloseSubscribeDialog = () => {
        setSubscribeDialogOpen(false)
        setSubscribeDialogState('confirm')
        setStrategyToSubscribe(null)
    }

    if (shouldRedirect) {
        return <RedirectToSignIn />
    }

    // Prevent flash of content before redirect
    if (!isLoaded || !isSignedIn) {
        return null
    }

    const subscribedCount = subscribedStrategies.length
    const myStrategiesCount = savedStrategies.length

    const subscriptionLimitReached =
        limits.subscriptions !== -1 && usage.subscriptions >= limits.subscriptions
    const subscriptionSlotsValue =
        limits.subscriptions === -1
            ? "Unlimited"
            : `${Math.max(0, limits.subscriptions - usage.subscriptions)} left`
    const subscriptionSlotsHint =
        limits.subscriptions === -1
            ? "No subscription cap"
            : `${usage.subscriptions}/${limits.subscriptions} used`

    const backtestLimitReached = limits.backtest !== -1 && usage.backtest >= limits.backtest
    const backtestSlotsValue =
        limits.backtest === -1
            ? "Unlimited"
            : `${Math.max(0, limits.backtest - usage.backtest)} left`
    const backtestSlotsHint =
        limits.backtest === -1
            ? "No rerun cap"
            : `${usage.backtest}/${limits.backtest} used`

    const selectedJournalEntries = selectedSubscribedStrategy
        ? (selectedSubscribedStrategy.backtestConfig && !selectedSubscribedStrategy.backtestTrades
            ? []
            : createTradingJournal(selectedSubscribedStrategy))
        : []
    const selectedJournalSummary = summarizeJournal(selectedJournalEntries)
    const groupedJournalEntries = selectedJournalEntries.reduce<Record<string, { label: string; entries: JournalEntry[] }>>((groups, entry) => {
        if (!groups[entry.dateKey]) {
            groups[entry.dateKey] = {
                label: entry.dateLabel,
                entries: [],
            }
        }

        groups[entry.dateKey].entries.push(entry)
        return groups
    }, {})

    return (
        <div className="min-h-screen bg-background dotted-background">
            <Navbar />
            <TickerTape />
            <div className="flex-1 overflow-y-auto mt-8 pb-8">

                <div className="space-y-12">
                    {/* Subscribed Strategies Section */}
                    <section>
                        <div className="px-6">
                            <div className="mb-6">
                                <div>
                                    <h2 className="flex items-center gap-2 font-ibm-plex-mono text-2xl font-bold text-foreground">
                                        <span className="h-5 w-[3px] rounded-full bg-gradient-to-b from-[#d07225] to-[#487b78]" aria-hidden="true" />
                                        <span>subscribed strategies</span>
                                    </h2>
                                    <p className="mt-1 max-w-2xl font-sans text-sm text-muted-foreground">
                                        Strategi yang kamu ikuti dari komunitas. Kami akan mengirimkan notifikasi setiap ada signal baru yang muncul pada strategi-strategi ini. Performa strategi ini <strong className="font-semibold text-ochre">diperbarui secara otomatis setiap hari</strong>.
                                    </p>
                                    <SectionSummary
                                        items={[
                                            {
                                                label: "Subscribed",
                                                value: subscribedCount,
                                                hint: subscribedCount === 1 ? "strategy" : "strategies",
                                            },
                                            {
                                                label: subscriptionLimitReached ? "Slots Full" : "Slots Left",
                                                value: subscriptionSlotsValue,
                                                hint: subscriptionSlotsHint,
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                            {isLoadingSubscribed ? (
                                <div className="flex gap-5 overflow-x-auto pt-4 pb-6 scrollbar-hide pl-6 pr-6 -mx-6">
                                    {[1, 2, 3].map((i) => (
                                        <StrategyCardSkeleton key={i} type="subscribed" />
                                    ))}
                                </div>
                            ) : subscribedStrategies.length === 0 ? (
                                <PortfolioEmptyState
                                    title="Belum ada strategi yang kamu ikuti"
                                    description="Mulai isi portofolio dengan mengikuti strategi publik dari komunitas. Update performa dan signal baru akan muncul di sini."
                                    actionLabel="Eksplor Strategi"
                                    onAction={() => router.push('/strategies')}
                                />
                            ) : (
                                <div className="flex gap-5 overflow-x-auto pt-4 pb-6 scrollbar-hide pl-6 pr-6 -mx-6">
                                    {subscribedStrategies.map((strategy) => (
                                        <SubscribedStrategyCard
                                            key={strategy.id}
                                            strategy={strategy}
                                            onUnsubscribe={handleUnsubscribeClick}
                                            onClick={handleOpenTradingJournal}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* My Strategies Section */}
                    <section>
                        <div className="px-6">
                            <div className="mb-6">
                                <div>
                                    <h2 className="flex items-center gap-2 font-ibm-plex-mono text-2xl font-bold text-foreground">
                                        <span className="h-5 w-[3px] rounded-full bg-gradient-to-b from-[#d07225] to-[#487b78]" aria-hidden="true" />
                                        <span>my strategies</span>
                                    </h2>
                                    <p className="mt-1 max-w-2xl font-sans text-sm text-muted-foreground">
                                        Strategi yang kamu buat dan simpan. Data yang ditampilkan <strong className="font-semibold text-ochre">bersifat statis</strong>, jalankan ulang (<em>rerun</em>) secara berkala untuk melihat hasil <em>backtest</em> terbaru.
                                    </p>
                                    <SectionSummary
                                        items={[
                                            {
                                                label: "Saved",
                                                value: myStrategiesCount,
                                                hint: myStrategiesCount === 1 ? "strategy" : "strategies",
                                            },
                                            {
                                                label: backtestLimitReached ? "Rerun Quota" : "Backtests Left",
                                                value: backtestSlotsValue,
                                                hint: backtestSlotsHint,
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                            {isLoadingStrategies ? (
                                <div className="flex gap-5 overflow-x-auto pt-4 pb-6 scrollbar-hide pl-6 pr-6 -mx-6">
                                    {[1, 2, 3].map((i) => (
                                        <StrategyCardSkeleton key={i} type="regular" />
                                    ))}
                                </div>
                            ) : savedStrategies.length === 0 ? (
                                <PortfolioEmptyState
                                    title="Belum ada strategi tersimpan"
                                    description="Strategi yang kamu buat di halaman Simulasi akan muncul di sini. Simpan strategi pertamamu untuk mulai membangun library pribadi."
                                    actionLabel="Buka Simulasi"
                                    onAction={() => router.push('/backtest')}
                                />
                            ) : (
                                <div className="flex gap-5 overflow-x-auto pt-4 pb-6 scrollbar-hide pl-6 pr-6 -mx-6">
                                    {savedStrategies.map((strategy) => (
                                        <RegularStrategyCard
                                            key={strategy.id}
                                            strategy={{
                                                id: strategy.id.toString(),
                                                name: strategy.name,
                                                description: strategy.description || '',
                                                winRate: Number(strategy.successRate) || 0,
                                                totalReturn: Number(strategy.totalReturn) || 0,
                                                yoyReturn: 0,
                                                momReturn: 0,
                                                weeklyReturn: 0,
                                                sharpeRatio: 0,
                                                sortinoRatio: 0,
                                                calmarRatio: 0,
                                                maxDrawdown: Number(strategy.maxDrawdown) || 0,
                                                profitFactor: 0,
                                                totalTrades: strategy.totalTrades || 0,
                                                avgTradeDuration: 0,
                                                stocksHeld: strategy.totalStocks || 0,
                                                createdDate: new Date(strategy.createdAt).toLocaleDateString(),
                                                lastRunDate: new Date(strategy.updatedAt || strategy.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':'),
                                                qualityScore: strategy.qualityScore || 'Unknown',
                                            }}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                            onRerun={handleRerunClick}
                                            onSubscribe={handleSubscribeClick}
                                            isRerunning={isRerunning[strategy.id.toString()]}
                                            isSubscribing={isSubscribing[strategy.id.toString()]}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Strategi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah kamu yakin ingin menghapus strategi ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                'Hapus'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Unsubscribe Confirmation Dialog */}
            <Dialog open={unsubscribeDialogOpen} onOpenChange={(open) => {
                // Only allow closing when not in loading state
                if (!open && unsubscribeDialogState !== 'loading') {
                    handleCloseUnsubscribeDialog()
                }
            }}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
                    // Prevent closing during loading
                    if (unsubscribeDialogState === 'loading') e.preventDefault()
                }}>
                    {/* Loading State */}
                    {unsubscribeDialogState === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground font-mono">Memproses...</p>
                        </div>
                    )}

                    {/* Success State */}
                    {unsubscribeDialogState === 'success' && (
                        <>
                            <DialogHeader className="items-center text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <DialogTitle className="font-mono text-xl">Berhasil Berhenti Berlangganan!</DialogTitle>
                                <DialogDescription className="font-mono text-sm text-muted-foreground text-center pt-2">
                                    Kamu berhasil berhenti berlangganan strategi{' '}
                                    {unsubscribedStrategyName && (
                                        <span className="font-semibold text-foreground">&quot;{unsubscribedStrategyName}&quot;</span>
                                    )}
                                    . Kamu bisa berlangganan lagi kapan saja.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-3 pt-4">
                                <Button
                                    onClick={handleCloseUnsubscribeDialog}
                                    className="w-full font-mono bg-[#d07225] hover:bg-[#a65b1d]"
                                >
                                    Lanjut
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        handleCloseUnsubscribeDialog()
                                        router.push('/strategies')
                                    }}
                                    className="w-full font-mono"
                                >
                                    Lihat Strategi Lain
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Confirmation State */}
                    {unsubscribeDialogState === 'confirm' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Berhenti Berlangganan</DialogTitle>
                                <DialogDescription>
                                    Apakah kamu yakin ingin berhenti berlangganan strategi ini? Kamu bisa berlangganan lagi kapan saja.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleCloseUnsubscribeDialog}>
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleUnsubscribeConfirm}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Ya, Berhenti
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Subscribe Confirmation Dialog */}
            <Dialog open={subscribeDialogOpen} onOpenChange={(open) => {
                if (!open && subscribeDialogState !== 'loading') {
                    handleCloseSubscribeDialog()
                }
            }}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
                    if (subscribeDialogState === 'loading') e.preventDefault()
                }}>
                    {subscribeDialogState === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground font-mono">Memproses langganan...</p>
                        </div>
                    )}

                    {subscribeDialogState === 'success' && (
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
                                    onClick={handleCloseSubscribeDialog}
                                    className="w-full font-mono bg-[#d07225] hover:bg-[#a65b1d]"
                                >
                                    Lanjut
                                </Button>
                            </div>
                        </>
                    )}

                    {subscribeDialogState === 'confirm' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Berlangganan Strategi</DialogTitle>
                                <DialogDescription asChild>
                                    <div className="space-y-3">
                                        {limits.subscriptions !== -1 && usage.subscriptions >= limits.subscriptions ? (
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
                                                        {limits.subscriptions === -1 ? '∞' : (limits.subscriptions - usage.subscriptions)}
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
                                <Button variant="outline" onClick={handleCloseSubscribeDialog}>
                                    Batal
                                </Button>
                                {limits.subscriptions !== -1 && usage.subscriptions >= limits.subscriptions ? (
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

            {/* Rerun Confirmation Dialog */}
            <Dialog open={rerunDialogOpen} onOpenChange={setRerunDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Jalankan Ulang Backtest</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-3">
                                {limits.backtest !== -1 && usage.backtest >= limits.backtest ? (
                                    <>
                                        <p>Kuota backtest kamu sudah habis.</p>
                                        <p className="text-sm">
                                            Kamu telah menggunakan{' '}
                                            <span
                                                className="inline-block px-2 py-0.5 rounded-md font-semibold text-xs text-red-700"
                                                style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                            >
                                                {usage.backtest}/{limits.backtest}
                                            </span>{' '}
                                            kuota backtest. Upgrade plan untuk menambah kuota.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>Apakah kamu yakin ingin menjalankan ulang strategi ini?</p>
                                        <p className="text-sm">
                                            Sisa kuota backtest kamu:{' '}
                                            <span
                                                className="inline-block px-2 py-0.5 rounded-md font-semibold text-xs text-foreground"
                                                style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: 'rgba(140, 188, 185, 0.15)' }}
                                            >
                                                {limits.backtest === -1 ? '∞' : (limits.backtest - usage.backtest)}
                                            </span>
                                            {limits.backtest !== -1 && (
                                                <span className="text-muted-foreground"> dari {limits.backtest} slot</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Menjalankan ulang strategi akan memotong kuota backtest kamu.
                                        </p>
                                    </>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRerunDialogOpen(false)}>
                            Batal
                        </Button>
                        {limits.backtest !== -1 && usage.backtest >= limits.backtest ? (
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
                            <Button onClick={handleConfirmRerun}>
                                Ya, Jalankan
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(selectedSubscribedStrategy)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedSubscribedStrategy(null)
                        setIsLoadingSelectedSubscribedStrategy(false)
                    }
                }}
            >
                <DialogContent className="max-w-4xl overflow-hidden border-border/70 bg-background p-0">
                    {selectedSubscribedStrategy ? (
                        <>
                            <DialogHeader className="border-b border-border/70 px-6 py-5">
                                <div className="pr-10">
                                    <Badge variant="secondary" className="mb-3 inline-flex bg-ochre/15 text-ochre-100 border-ochre/30">
                                        Trading Journal
                                    </Badge>
                                    <DialogTitle className="text-left text-xl">
                                        {selectedSubscribedStrategy.name}
                                    </DialogTitle>
                                </div>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Riwayat trade hasil backtest strategi ini, diurutkan dari hari terbaru dan dikelompokkan per tanggal.
                                </DialogDescription>
                                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Total Buy</div>
                                        <div className="mt-1 text-lg font-semibold text-foreground">{selectedJournalSummary.buyCount}</div>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Total Sell</div>
                                        <div className="mt-1 text-lg font-semibold text-foreground">
                                            {selectedJournalSummary.sellCount}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Annualized Return</div>
                                        <div className="mt-1 text-lg font-semibold text-foreground">
                                            {selectedSubscribedStrategy.backtestSummary?.annualizedReturn !== undefined
                                                ? `${selectedSubscribedStrategy.backtestSummary.annualizedReturn > 0 ? "+" : ""}${selectedSubscribedStrategy.backtestSummary.annualizedReturn.toFixed(2)}%`
                                                : "N/A"}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Drawdown</div>
                                        <div className="mt-1 text-lg font-semibold text-foreground">
                                            {`${(selectedSubscribedStrategy.backtestSummary?.maxDrawdown ?? selectedSubscribedStrategy.maxDrawdown).toFixed(2)}%`}
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <ScrollArea className="max-h-[70vh] px-6 py-5">
                                <div className="space-y-6">
                                    {isLoadingSelectedSubscribedStrategy ? (
                                        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memuat trade history dari backtest...
                                        </div>
                                    ) : null}
                                    {!isLoadingSelectedSubscribedStrategy && selectedJournalEntries.length === 0 ? (
                                        <div className="rounded-3xl border border-border/70 bg-white/80 px-6 py-12 text-center shadow-[0_14px_34px_rgba(54,53,55,0.06)]">
                                            <p className="text-sm font-medium text-foreground">Belum ada trade history</p>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Backtest untuk strategi ini belum menghasilkan trade yang bisa ditampilkan.
                                            </p>
                                        </div>
                                    ) : null}
                                    {Object.entries(groupedJournalEntries).map(([dateKey, group]) => (
                                        <div key={dateKey} className="space-y-3">
                                            <div className="px-1">
                                                <h3 className="font-ibm-plex-mono text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                                                    {group.label}
                                                </h3>
                                            </div>

                                            <section className="rounded-3xl border border-border/70 bg-white/80 shadow-[0_14px_34px_rgba(54,53,55,0.06)]">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="hover:bg-transparent">
                                                            <TableHead className="px-4 font-ibm-plex-mono text-[11px] uppercase tracking-[0.16em]">Ticker</TableHead>
                                                            <TableHead className="font-ibm-plex-mono text-[11px] uppercase tracking-[0.16em]">Action</TableHead>
                                                            <TableHead className="font-ibm-plex-mono text-[11px] uppercase tracking-[0.16em]">Entry Price</TableHead>
                                                            <TableHead className="font-ibm-plex-mono text-[11px] uppercase tracking-[0.16em]">
                                                                <TooltipProvider delayDuration={200}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span className="cursor-help">Curr Price</span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                                                                            Harga terbaru yang tersedia dari hasil backtest untuk ticker ini. Jika tidak ada update terbaru, nilainya mengikuti entry price.
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </TableHead>
                                                            <TableHead className="pr-4 text-right font-ibm-plex-mono text-[11px] uppercase tracking-[0.16em]">Value</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {group.entries.map((entry) => (
                                                            <TableRow key={`${entry.dateKey}-${entry.ticker}`} className="hover:bg-muted/30">
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="group relative flex items-center gap-3">
                                                                        <Avatar className="h-8 w-8 border border-border/60">
                                                                            <AvatarImage src={`/stock_icons/${entry.ticker}.png`} alt={entry.ticker} />
                                                                            <AvatarFallback className={`${entry.color} text-[10px] font-bold text-white`}>
                                                                                {entry.ticker}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="font-mono text-sm font-semibold text-foreground">{entry.ticker}</span>

                                                                        <div className="pointer-events-none absolute left-0 top-full z-30 mt-3 hidden min-w-[200px] rounded-2xl border border-border/70 bg-white/95 p-4 shadow-[0_18px_40px_rgba(54,53,55,0.14)] backdrop-blur-sm group-hover:block">
                                                                            <div className="mb-1 font-ibm-plex-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ochre">
                                                                                Dive Deep
                                                                            </div>
                                                                            <div className="text-sm text-foreground">
                                                                                Lihat analisis lengkap untuk <span className="font-mono font-semibold">{entry.ticker}</span>.
                                                                            </div>
                                                                            <Link
                                                                                href={`/analyze-v2?ticker=${entry.ticker}`}
                                                                                className="pointer-events-auto mt-3 inline-flex items-center rounded-full border border-[#d07225]/25 bg-[#d07225]/10 px-3 py-1.5 font-ibm-plex-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a65b1d] transition-colors hover:bg-[#d07225] hover:text-white"
                                                                            >
                                                                                Open Analysis
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`font-mono text-xs ${entry.action === "BUY"
                                                                            ? "bg-green-100 text-green-700 border-green-200"
                                                                            : "bg-red-100 text-red-700 border-red-200"
                                                                            }`}
                                                                    >
                                                                        {entry.action}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="font-mono text-sm text-foreground">
                                                                    {currencyFormatter.format(entry.entryPrice)}
                                                                </TableCell>
                                                                <TableCell className="font-mono text-sm text-foreground">
                                                                    {currencyFormatter.format(entry.currentPrice)}
                                                                </TableCell>
                                                                <TableCell className="pr-4 text-right font-mono text-sm font-semibold text-foreground">
                                                                    {currencyFormatter.format(entry.value)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </section>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    )
}
