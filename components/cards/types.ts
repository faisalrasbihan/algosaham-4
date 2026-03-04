import type { BacktestRequest, BacktestResult } from "@/lib/api"

export interface Strategy {
    id: string
    subscriptionId?: string
    name: string
    description?: string
    creator?: string
    totalReturn: number
    yoyReturn: number
    momReturn: number
    weeklyReturn: number
    maxDrawdown: number
    sharpeRatio: number
    sortinoRatio: number
    calmarRatio: number
    profitFactor: number
    winRate: number
    totalTrades: number
    avgTradeDuration: number // in days
    stocksHeld: number
    createdDate: string
    lastRunDate?: string
    qualityScore?: string
    subscribers?: number
    isSubscribed?: boolean
    subscriptionDate?: string
    returnSinceSubscription?: number
    snapshotHoldings?: { symbol: string, color?: string }[] | null
    topHoldings?: { symbol: string, color?: string }[] | null
    snapshotReturn?: number
    backtestConfig?: BacktestRequest | null
    backtestTrades?: BacktestResult["trades"]
    backtestSummary?: BacktestResult["summary"]
    backtestCurrentPrices?: Record<string, number>
}
