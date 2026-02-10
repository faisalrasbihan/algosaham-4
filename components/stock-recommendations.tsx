"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Sparkles, BarChart3 } from "lucide-react"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMemo } from "react"

// API Signal format from backtest
interface ApiSignal {
  date: string
  ticker: string
  companyName: string
  close?: number
  price?: number
  currentPrice?: number
  reasons: string | string[]
  indicators?: Record<string, number>
  daysAgo?: number
  signal?: string
  sector?: string
  marketCap?: string
  stopLoss?: number
  takeProfit?: number
  riskRewardRatio?: number
  method?: {
    stopLoss: string
    takeProfit: string
  }
}

// API Trade format from backtest
interface ApiTrade {
  date: string
  ticker: string
  companyName: string
  action: "BUY" | "SELL"
  quantity: number
  price: number
  value: number
  portfolioValue: number
  reason: string
  profitLoss?: number
  profitLossPercent?: number
  holdingDays?: number
}

interface StockRecommendation {
  ticker: string
  name: string
  days: number
  return: number
  maxDrawdown: number
  entryPrice: number
  currentPrice: number
  signal: "buy" | "sell"
  reasons?: string
  reasonsList?: string[] // Array of reasons for bullet points
  date?: string
  sector?: string
  marketCap?: string
  stopLoss?: number
  takeProfit?: number
  riskRewardRatio?: number
}

interface StockRecommendationsProps {
  signals?: ApiSignal[]
  trades?: ApiTrade[]
}

export function StockRecommendations({ signals = [], trades = [] }: StockRecommendationsProps) {
  console.log('🎯 [STOCK RECOMMENDATIONS] Component rendered with:', {
    signalsCount: signals.length,
    tradesCount: trades.length,
    signals: signals,
    trades: trades
  })

  // Map API signals to component format
  const signalStocks: StockRecommendation[] = useMemo(() => {
    console.log('🎯 [STOCK RECOMMENDATIONS] Processing signals:', signals)
    if (!signals || !Array.isArray(signals) || signals.length === 0) {
      return []
    }
    return signals.map(signal => {
      // Handle reasons as string or array
      const reasonsText = Array.isArray(signal.reasons)
        ? signal.reasons.join('; ')
        : signal.reasons

      // Handle price field (can be 'close' or 'price')
      const entryPrice = signal.price || signal.close || 0
      const currentPrice = signal.currentPrice || entryPrice

      // Calculate return percentage
      const returnPercent = entryPrice > 0
        ? ((currentPrice - entryPrice) / entryPrice) * 100
        : 0

      return {
        ticker: signal.ticker,
        name: signal.companyName,
        days: signal.daysAgo || 0,
        return: returnPercent,
        maxDrawdown: 0,
        entryPrice: entryPrice,
        currentPrice: currentPrice,
        signal: (signal.signal?.toLowerCase() === 'sell' ? 'sell' : 'buy') as "buy" | "sell",
        reasons: reasonsText,
        reasonsList: Array.isArray(signal.reasons) ? signal.reasons : (signal.reasons ? [signal.reasons] : []),
        date: signal.date,
        sector: signal.sector,
        marketCap: signal.marketCap,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        riskRewardRatio: signal.riskRewardRatio,
      }
    })
  }, [signals])

  // Map API trades to portfolio holdings (only open positions)
  const portfolioStocks: StockRecommendation[] = useMemo(() => {
    // Group trades by ticker to find open positions
    const positionMap = new Map<string, { buy: ApiTrade, sells: ApiTrade[] }>()

    trades.forEach(trade => {
      if (trade.action === "BUY") {
        if (!positionMap.has(trade.ticker)) {
          positionMap.set(trade.ticker, { buy: trade, sells: [] })
        }
      } else if (trade.action === "SELL") {
        const position = positionMap.get(trade.ticker)
        if (position) {
          position.sells.push(trade)
        }
      }
    })

    // Convert open positions to recommendations
    const holdings: StockRecommendation[] = []
    positionMap.forEach((position, ticker) => {
      // Only include if there are more buys than sells (open position)
      if (position.sells.length === 0) {
        // Find the most recent sell to get current performance
        const lastSell = position.sells[position.sells.length - 1]

        holdings.push({
          ticker: position.buy.ticker,
          name: position.buy.companyName,
          days: lastSell?.holdingDays || 0,
          return: lastSell?.profitLossPercent || 0,
          maxDrawdown: 0, // Not available in trade data
          entryPrice: position.buy.price,
          currentPrice: lastSell?.price || position.buy.price,
          signal: "buy" as const,
          reasons: position.buy.reason,
        })
      }
    })

    return holdings
  }, [trades])

  const renderStockTable = (stocks: StockRecommendation[]) => {
    if (stocks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">No signals yet</p>
          <p className="text-xs text-muted-foreground/70">
            Run a backtest to see stock recommendations
          </p>
        </div>
      )
    }

    return (
      <TooltipProvider>
        <div className="overflow-y-auto max-h-full">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-white">
                  Stock
                </th>
                <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-white">
                  Days
                </th>
                <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-white">
                  Entry
                </th>
                <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-white">
                  Return
                </th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <Tooltip key={index} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 relative">
                            <Image
                              src={`/stock_icons/${stock.ticker}.png`}
                              alt={stock.ticker}
                              width={32}
                              height={32}
                              className="object-cover"
                              onError={(e) => {
                                // Fallback to colored circle with initials if image fails to load
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.className = `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${stock.return > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`
                                  parent.textContent = stock.ticker.substring(0, 2)
                                }
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-mono font-semibold text-sm text-foreground">{stock.ticker}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-mono text-sm text-foreground">{stock.days}d</span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-mono text-sm text-muted-foreground">{stock.entryPrice.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span
                            className={`font-mono text-sm font-semibold ${stock.return > 0 ? "text-green-700" : stock.return < 0 ? "text-red-600" : "text-muted-foreground"
                              }`}
                          >
                            {stock.return === 0 ? "0.0%" : `${stock.return.toFixed(1)}%`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="p-0 min-w-[280px] max-w-[320px] overflow-hidden">
                    <div className="space-y-0">
                      {/* Header */}
                      <div className="bg-slate-50 p-3 border-b border-slate-200">
                        <div className="font-bold text-base text-foreground">{stock.ticker}</div>
                        <div className="text-xs text-muted-foreground">{stock.name}</div>

                      </div>

                      <div className="p-3 space-y-3">
                        {/* Signal Action */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground">Signal:</span>
                          <span className={`font-bold uppercase text-sm px-2 py-0.5 rounded ${stock.signal === 'buy'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {stock.signal}
                          </span>
                        </div>

                        {/* Price Information */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Entry Price:</span>
                            <span className="text-xs font-semibold text-foreground font-mono">
                              Rp {stock.entryPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Current Price:</span>
                            <span className="text-xs font-semibold text-foreground font-mono">
                              Rp {stock.currentPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                            <span className="text-xs font-medium text-muted-foreground">Return:</span>
                            <span className={`text-sm font-bold font-mono ${stock.return > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {stock.return > 0 ? '+' : ''}{stock.return.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        {/* Risk Management */}
                        {(stock.stopLoss || stock.takeProfit) && (
                          <div className="pt-2 border-t border-slate-200 space-y-1.5">
                            <div className="text-xs font-medium text-muted-foreground mb-1.5">Risk Management</div>
                            {stock.stopLoss && (
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Stop Loss:</span>
                                <span className="text-xs font-semibold text-red-600 font-mono">
                                  Rp {stock.stopLoss.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {stock.takeProfit && (
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Take Profit:</span>
                                <span className="text-xs font-semibold text-green-600 font-mono">
                                  Rp {stock.takeProfit.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {stock.riskRewardRatio && (
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Risk/Reward:</span>
                                <span className="text-xs font-semibold text-foreground font-mono">
                                  1:{stock.riskRewardRatio.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Signal Reasons */}
                        {stock.reasonsList && stock.reasonsList.length > 0 && (
                          <div className="pt-2 border-t border-slate-200">
                            <div className="text-xs font-medium text-muted-foreground mb-1.5">Signal Reasons</div>
                            <ul className="text-xs text-foreground space-y-1 ml-3">
                              {stock.reasonsList.map((reason, idx) => (
                                <li key={idx} className="list-disc leading-relaxed">{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Additional Info */}
                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                          {stock.date && (
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Date:</span>
                              <span className="text-xs font-medium text-foreground">{stock.date}</span>
                            </div>
                          )}
                          {stock.days >= 0 && (
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Days Ago:</span>
                              <span className="text-xs font-medium text-foreground">
                                {stock.days === 0 ? 'Today' : `${stock.days}d ago`}
                              </span>
                            </div>
                          )}
                          {stock.sector && (
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Sector:</span>
                              <span className="text-xs font-medium text-foreground capitalize">{stock.sector}</span>
                            </div>
                          )}
                          {stock.marketCap && (
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Market Cap:</span>
                              <span className="text-xs font-medium text-foreground capitalize">{stock.marketCap}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </tbody>
          </table>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <Card className="rounded-md h-full flex flex-col">
      <Tabs defaultValue="signal" className="w-full h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0 flex flex-row items-center justify-between">
          <CardTitle className="text-foreground font-mono font-bold text-base">Stock Recommendations</CardTitle>
          <TabsList className="h-8">
            <TabsTrigger value="signal" className="text-xs">
              Signal
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-xs">
              Portfolio
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4 pt-0">
          <TabsContent value="signal" className="mt-0 h-full">
            {renderStockTable(signalStocks)}
          </TabsContent>
          <TabsContent value="portfolio" className="mt-0 h-full">
            {renderStockTable(portfolioStocks)}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
