"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { SubscribedStrategyCard } from "@/components/cards/subscribed-strategy-card"
import { RegularStrategyCard } from "@/components/cards/regular-strategy-card"
import { useUser, RedirectToSignIn } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Loader2, CheckCircle } from "lucide-react"
import { StrategyCardSkeleton } from "@/components/strategy-card-skeleton"
import { useRouter } from "next/navigation"
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

// Dialog states for unsubscribe: 'confirm' | 'loading' | 'success'
type UnsubscribeDialogState = 'confirm' | 'loading' | 'success'

interface Strategy {
    id: number
    name: string
    description: string | null
    creatorId: string
    createdAt: Date
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

export default function Portfolio() {
    const { isLoaded, isSignedIn } = useUser()
    const router = useRouter()
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const [savedStrategies, setSavedStrategies] = useState<Strategy[]>([])
    const [subscribedStrategies, setSubscribedStrategies] = useState<any[]>([])
    const [isLoadingStrategies, setIsLoadingStrategies] = useState(true)
    const [isLoadingSubscribed, setIsLoadingSubscribed] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [unsubscribeDialogOpen, setUnsubscribeDialogOpen] = useState(false)
    const [strategyToUnsubscribe, setStrategyToUnsubscribe] = useState<string | null>(null)
    const [unsubscribeDialogState, setUnsubscribeDialogState] = useState<UnsubscribeDialogState>('confirm')
    const [unsubscribedStrategyName, setUnsubscribedStrategyName] = useState("")

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            setShouldRedirect(true)
        }
    }, [isLoaded, isSignedIn])

    // Fetch user's saved strategies and subscriptions
    useEffect(() => {
        const fetchData = async () => {
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
                    // Map API data to component format
                    const mappedSubscribed = data.data.map((s: any) => ({
                        id: s.id.toString(),
                        name: s.name,
                        description: s.description,
                        creator: s.creator || 'Unknown',
                        totalReturn: parseFloat(s.totalReturn || 0),
                        yoyReturn: 0,
                        momReturn: 0,
                        weeklyReturn: 0,
                        maxDrawdown: parseFloat(s.maxDrawdown || 0),
                        sharpeRatio: parseFloat(s.sharpeRatio || 0),
                        sortinoRatio: 0,
                        calmarRatio: 0,
                        profitFactor: 0,
                        winRate: parseFloat(s.successRate || 0),
                        totalTrades: s.totalTrades || 0,
                        avgTradeDuration: 0,
                        stocksHeld: s.totalStocks || 0,
                        createdDate: s.createdAt || new Date().toISOString(),
                        subscribers: s.subscribers || 0,
                        subscriptionDate: s.subscribedAt,
                        returnSinceSubscription: parseFloat(s.returnSinceSubscription || 0),
                        snapshotHoldings: s.snapshotHoldings,
                        topHoldings: s.topHoldings
                    }))
                    setSubscribedStrategies(mappedSubscribed)
                }
            } catch (error) {
                console.error('Failed to fetch subscriptions:', error)
            } finally {
                setIsLoadingSubscribed(false)
            }
        }

        if (isSignedIn) {
            fetchData()
        }
    }, [isSignedIn])

    const handleUnsubscribeClick = (id: string) => {
        setStrategyToUnsubscribe(id)
        setUnsubscribeDialogState('confirm')
        setUnsubscribeDialogOpen(true)
    }

    const handleUnsubscribeConfirm = async () => {
        if (!strategyToUnsubscribe) return

        // Find the strategy name for the success message
        const strategy = subscribedStrategies.find(s => s.id === strategyToUnsubscribe)
        setUnsubscribedStrategyName(strategy?.name || "")

        // Move to loading state
        setUnsubscribeDialogState('loading')

        try {
            const response = await fetch('/api/strategies/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategyId: strategyToUnsubscribe })
            })

            const data = await response.json()

            if (data.success) {
                setSubscribedStrategies(prev => prev.filter(s => s.id !== strategyToUnsubscribe))
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
                toast.error('Failed to load strategy')
            }
        } catch (error) {
            console.error('Error loading strategy:', error)
            toast.error('Failed to load strategy')
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
                toast.success('Strategy deleted successfully')
            } else {
                toast.error(data.error || 'Failed to delete strategy')
            }
        } catch (error) {
            console.error('Error deleting strategy:', error)
            toast.error('Failed to delete strategy')
        } finally {
            setIsDeleting(false)
            setDeleteDialogOpen(false)
            setStrategyToDelete(null)
        }
    }

    if (shouldRedirect) {
        return <RedirectToSignIn />
    }

    // Prevent flash of content before redirect
    if (!isLoaded || !isSignedIn) {
        return null
    }

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
                                <h2 className="text-2xl font-bold text-foreground">Subscribed Strategies</h2>
                                <p className="text-muted-foreground">Strategies you are following from the community</p>
                            </div>
                            {isLoadingSubscribed ? (
                                <div className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                                    {[1, 2, 3].map((i) => (
                                        <StrategyCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : subscribedStrategies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-accent/20 rounded-lg mx-6 border border-dashed border-muted">
                                    <p className="text-muted-foreground mb-2">You haven't subscribed to any strategies yet</p>
                                    <Button variant="outline" onClick={() => router.push('/strategies')}>
                                        Explore Strategies
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                                    {subscribedStrategies.map((strategy) => (
                                        <SubscribedStrategyCard
                                            key={strategy.id}
                                            strategy={strategy}
                                            onUnsubscribe={handleUnsubscribeClick}
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
                                <h2 className="text-2xl font-bold text-foreground">My Strategies</h2>
                                <p className="text-muted-foreground">Strategies you've created and backtested</p>
                            </div>
                            {isLoadingStrategies ? (
                                <div className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                                    {[1, 2, 3].map((i) => (
                                        <StrategyCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : savedStrategies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-muted-foreground mb-2">No strategies yet</p>
                                    <p className="text-sm text-muted-foreground">Create your first strategy in the Backtester</p>
                                </div>
                            ) : (
                                <div className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
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
                                                qualityScore: strategy.qualityScore || 'Unknown',
                                            }}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
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
                        <AlertDialogTitle>Delete Strategy</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this strategy? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
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
                                    Continue
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
        </div>
    )
}
