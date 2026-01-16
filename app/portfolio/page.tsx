"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { SubscribedStrategyCard } from "@/components/cards/subscribed-strategy-card"
import { RegularStrategyCard } from "@/components/cards/regular-strategy-card"
import { subscribedStrategies, savedStrategies } from "@/components/cards/data"
import { useUser, RedirectToSignIn } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export default function Portfolio() {
    const { isLoaded, isSignedIn } = useUser()
    const [shouldRedirect, setShouldRedirect] = useState(false)

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            setShouldRedirect(true)
        }
    }, [isLoaded, isSignedIn])

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
                            <div className="flex gap-5 overflow-x-auto pb-4 py-1 scrollbar-hide pl-6 pr-6 -mx-6">
                                {savedStrategies.map((strategy) => (
                                    <RegularStrategyCard key={strategy.id} strategy={strategy} />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
