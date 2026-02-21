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

// Dialog states for unsubscribe: 'confirm' | 'loading' | 'success'
type UnsubscribeDialogState = 'confirm' | 'loading' | 'success'

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

    // Subscribe Dialog State
    type SubscribeDialogState = 'confirm' | 'loading' | 'success'
    const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false)
    const [strategyToSubscribe, setStrategyToSubscribe] = useState<string | null>(null)
    const [subscribeDialogState, setSubscribeDialogState] = useState<SubscribeDialogState>('confirm')
    const [subscribedStrategyName, setSubscribedStrategyName] = useState("")

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
    }, [isSignedIn])

    useEffect(() => {
        if (isSignedIn) {
            fetchData()
        }
    }, [isSignedIn, fetchData])

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
                                <p className="text-muted-foreground text-sm max-w-2xl mt-1">
                                    Strategi yang kamu ikuti dari komunitas. Kami akan mengirimkan notifikasi setiap ada signal baru yang muncul pada strategi-strategi ini. Performa strategi ini <strong className="font-semibold text-ochre">diperbarui secara otomatis setiap hari</strong>.
                                </p>
                            </div>
                            {isLoadingSubscribed ? (
                                <div className="flex gap-5 overflow-x-auto pt-4 pb-6 scrollbar-hide pl-6 pr-6 -mx-6">
                                    {[1, 2, 3].map((i) => (
                                        <StrategyCardSkeleton key={i} type="subscribed" />
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
                                <div className="flex gap-5 overflow-x-auto pt-4 pb-6 scrollbar-hide pl-6 pr-6 -mx-6">
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
                                <p className="text-muted-foreground text-sm max-w-2xl mt-1">
                                    Strategi yang kamu buat dan simpan. Data yang ditampilkan <strong className="font-semibold text-ochre">bersifat statis</strong>, jalankan ulang (<em>rerun</em>) secara berkala untuk melihat hasil <em>backtest</em> terbaru.
                                </p>
                            </div>
                            {isLoadingStrategies ? (
                                <div className="flex gap-5 overflow-x-auto pt-4 pb-6 scrollbar-hide pl-6 pr-6 -mx-6">
                                    {[1, 2, 3].map((i) => (
                                        <StrategyCardSkeleton key={i} type="regular" />
                                    ))}
                                </div>
                            ) : savedStrategies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-muted-foreground mb-2">No strategies yet</p>
                                    <p className="text-sm text-muted-foreground">Create your first strategy in the Backtester</p>
                                </div>
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
        </div>
    )
}
