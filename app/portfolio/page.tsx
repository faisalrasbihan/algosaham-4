"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { SubscribedStrategyCard } from "@/components/cards/subscribed-strategy-card"
import { RegularStrategyCard } from "@/components/cards/regular-strategy-card"
import { subscribedStrategies } from "@/components/cards/data"
import { useUser, RedirectToSignIn } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
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
    const [isLoadingStrategies, setIsLoadingStrategies] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            setShouldRedirect(true)
        }
    }, [isLoaded, isSignedIn])

    // Fetch user's saved strategies
    useEffect(() => {
        const fetchStrategies = async () => {
            if (!isSignedIn) return

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
        }

        if (isSignedIn) {
            fetchStrategies()
        }
    }, [isSignedIn])

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
                    {/* Community Strategies Section */}
                    <section>
                        <div className="px-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Community Strategies</h2>
                                <p className="text-muted-foreground">Popular strategies from the community</p>
                            </div>
                            <div className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                                {subscribedStrategies.map((strategy) => (
                                    <SubscribedStrategyCard key={strategy.id} strategy={strategy} />
                                ))}
                            </div>
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
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        </div>
    )
}
