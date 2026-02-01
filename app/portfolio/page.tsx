"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { SubscribedStrategyCard } from "@/components/cards/subscribed-strategy-card"
import { RegularStrategyCard } from "@/components/cards/regular-strategy-card"
import { subscribedStrategies } from "@/components/cards/data"
import { useUser, RedirectToSignIn } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface Strategy {
    id: number
    name: string
    description: string | null
    config: any
    userId: string
    createdAt: Date
    updatedAt: Date
    indicators?: any[]
    // Database fields
    winRate?: string | null
    totalReturns?: string | null
    ytdReturn?: string | null
    monthlyReturn?: string | null
    weeklyReturn?: string | null
    sharpeRatio?: string | null
    sortinoRatio?: string | null
    calmarRatio?: string | null
    maxDrawdown?: string | null
    totalStocks?: number | null
}

export default function Portfolio() {
    const { isLoaded, isSignedIn } = useUser()
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const [savedStrategies, setSavedStrategies] = useState<Strategy[]>([])
    const [isLoadingStrategies, setIsLoadingStrategies] = useState(true)

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

    if (shouldRedirect) {
        return <RedirectToSignIn />
    }

    // Prevent flash of content before redirect
    if (!isLoaded || !isSignedIn) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <TickerTape />
            <div className="flex-1 overflow-y-auto mt-8 pb-8">

                <div className="space-y-12">
                    {/* Subscribed Strategies Section */}
                    <section>
                        <div className="px-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Subscribed Strategies</h2>
                                <p className="text-muted-foreground">Strategies you're following from other traders</p>
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
                                                winRate: Number(strategy.winRate) || 0,
                                                totalReturn: Number(strategy.totalReturns) || 0,
                                                yoyReturn: Number(strategy.ytdReturn) || 0,
                                                momReturn: Number(strategy.monthlyReturn) || 0,
                                                weeklyReturn: Number(strategy.weeklyReturn) || 0,
                                                sharpeRatio: Number(strategy.sharpeRatio) || 0,
                                                sortinoRatio: Number(strategy.sortinoRatio) || 0,
                                                calmarRatio: Number(strategy.calmarRatio) || 0,
                                                maxDrawdown: Number(strategy.maxDrawdown) || 0,
                                                profitFactor: 0,
                                                totalTrades: strategy.totalStocks || 0,
                                                avgTradeDuration: 0,
                                                stocksHeld: strategy.totalStocks || 0,
                                                createdDate: new Date(strategy.createdAt).toLocaleDateString(),
                                            }}
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
