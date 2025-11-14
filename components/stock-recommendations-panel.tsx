"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BacktestResult } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface StockRecommendationsPanelProps {
  backtestResults?: BacktestResult | null
  loading?: boolean
  error?: string | null
}

interface ActivePosition {
  ticker: string
  companyName: string
  buyDate: string
  buyPrice: number
  quantity: number
  value: number
  reason: string
  holdingDays: number
  portfolioValue?: number
}

export function StockRecommendationsPanel({
  backtestResults,
  loading,
  error,
}: StockRecommendationsPanelProps) {
  // Process trades to find active positions (BUY without corresponding SELL)
  const activePositions = useMemo(() => {
    if (!backtestResults?.trades || backtestResults.trades.length === 0) {
      return []
    }

    // Sort trades by date to process chronologically
    const sortedTrades = [...backtestResults.trades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Track open positions: ticker -> array of BUY trades (FIFO)
    const openPositions = new Map<string, Array<typeof sortedTrades[0]>>()

    // Process trades chronologically
    sortedTrades.forEach((trade) => {
      if (trade.action === "BUY") {
        // Add BUY to open positions
        if (!openPositions.has(trade.ticker)) {
          openPositions.set(trade.ticker, [])
        }
        openPositions.get(trade.ticker)!.push(trade)
      } else if (trade.action === "SELL") {
        // Remove corresponding BUY from open positions (FIFO)
        const buys = openPositions.get(trade.ticker)
        if (buys && buys.length > 0) {
          buys.shift() // Remove oldest BUY
          if (buys.length === 0) {
            openPositions.delete(trade.ticker)
          }
        }
      }
    })

    // Convert remaining open positions to ActivePosition format
    const positions: ActivePosition[] = []
    const now = new Date()

    openPositions.forEach((buys, ticker) => {
      // Use the most recent BUY for each ticker
      const latestBuy = buys[buys.length - 1]
      const buyDate = new Date(latestBuy.date)
      const daysDiff = Math.floor(
        (now.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      positions.push({
        ticker: latestBuy.ticker,
        companyName: latestBuy.companyName || latestBuy.ticker,
        buyDate: latestBuy.date,
        buyPrice: latestBuy.price,
        quantity: latestBuy.quantity,
        value: latestBuy.value,
        reason: latestBuy.reason || "Strategy signal",
        holdingDays: daysDiff,
        portfolioValue: latestBuy.portfolioValue,
      })
    })

    // Sort by date (most recent first)
    return positions.sort(
      (a, b) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime()
    )
  }, [backtestResults])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground font-mono text-sm">Loading recommendations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 font-mono text-sm mb-2">Error</div>
          <p className="text-muted-foreground font-mono text-xs">{error}</p>
        </div>
      </div>
    )
  }

  if (activePositions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-muted-foreground font-mono text-sm mb-2">No Active Positions</div>
          <p className="text-muted-foreground font-mono text-xs">
            {backtestResults ? "All positions have been closed" : "Run a backtest to see recommendations"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <div className="mb-3 pb-3 border-b border-border">
        <p className="text-muted-foreground font-mono text-xs">
          {activePositions.length} active position{activePositions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {activePositions.map((position, index) => (
        <Card key={`${position.ticker}-${index}`} className="rounded-md border-border">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="default"
                    className="font-mono text-xs font-bold bg-accent text-accent-foreground"
                  >
                    {position.ticker}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium text-foreground mb-1">
                  {position.companyName}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground font-mono mb-1">Buy Date</div>
                <div className="font-mono text-foreground">{position.buyDate}</div>
              </div>
              <div>
                <div className="text-muted-foreground font-mono mb-1">Holding Days</div>
                <div className="font-mono text-foreground">{position.holdingDays} days</div>
              </div>
              <div>
                <div className="text-muted-foreground font-mono mb-1">Buy Price</div>
                <div className="font-mono text-foreground font-semibold">
                  Rp {position.buyPrice.toLocaleString("id-ID")}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground font-mono mb-1">Quantity</div>
                <div className="font-mono text-foreground">
                  {position.quantity.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground font-mono mb-1">Value</div>
                <div className="font-mono text-foreground font-semibold">
                  Rp {position.value.toLocaleString("id-ID")}
                </div>
              </div>
              {position.reason && (
                <div className="col-span-2">
                  <div className="text-muted-foreground font-mono mb-1">Reason</div>
                  <div className="text-foreground text-xs leading-relaxed">
                    {position.reason}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

