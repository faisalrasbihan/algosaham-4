export interface Strategy {
    id: string
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
    qualityScore?: string
    subscribers?: number
    isSubscribed?: boolean
    subscriptionDate?: string
    returnSinceSubscription?: number
}
