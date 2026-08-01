"use client"

import { TradePlanCard } from "@/components/trade-plan-card"

const riskPlan = {
    entryReference: "close",
    entryPrice: 2480,
    stopLoss: 2350,
    takeProfit: 2830,
    riskReward: 3.3,
    holdingTerm: "medium",
    confidence: "medium",
    summary: "Preview only.",
    notes: [],
    currentPrice: 2480,
    levels: {
        supports: [
            { rank: 1, label: "Support 1", price: 2420 },
            { rank: 2, label: "Support 2", price: 2350 },
        ],
        resistances: [
            { rank: 1, label: "Resistance 1", price: 2540 },
            { rank: 2, label: "Resistance 2", price: 2750 },
            { rank: 3, label: "Resistance 3", price: 2830 },
        ],
    },
}

export default function Page() {
    return (
        <div className="p-10 bg-background min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,1.25fr)_minmax(220px,1fr)] gap-3 items-stretch max-w-3xl">
                {/* tall sibling to force the trade card to stretch, mirroring the real page */}
                <div className="rounded-xl border border-border/70 bg-background/70 p-4 h-[340px] flex items-center justify-center text-sm text-muted-foreground">
                    tall sibling (forces stretch)
                </div>
                <TradePlanCard riskPlan={riskPlan} watchItems={["Volume", "Market"]} currentPrice={2480} />
            </div>
        </div>
    )
}
