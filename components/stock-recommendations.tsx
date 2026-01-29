"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Sparkles, BarChart3 } from "lucide-react"
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
  close: number
  reasons: string
  indicators?: Record<string, number>
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
}

interface StockRecommendationsProps {
  signals?: ApiSignal[]
  trades?: ApiTrade[]
}

export function StockRecommendations({ signals = [], trades = [] }: StockRecommendationsProps) {
  // Map API signals to component format
  const signalStocks: StockRecommendation[] = useMemo(() => {
    return signals.map(signal => ({
      ticker: signal.ticker,
      name: signal.companyName,
      days: 0, // Signal just triggered
      return: 0, // Not yet in position
      maxDrawdown: 0,
      entryPrice: signal.close,
      currentPrice: signal.close,
      signal: "buy" as const,
      reasons: signal.reasons,
    }))
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
      <div className="w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Stock
              </th>
              <th className="text-right py-2 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Entry
              </th>
              <th className="text-right py-2 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Live
              </th>
              <th className="text-right py-2 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                P/L%
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, index) => (
              <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-1">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${stock.return > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                        >
                          {stock.ticker.substring(0, 2)}
                        </div>
                        <div className="font-mono font-semibold text-sm text-foreground">{stock.ticker}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="p-4 min-w-[240px] max-w-[320px]">
                      <div className="space-y-2">
                        <div>
                          <div className="font-bold text-sm text-foreground">{stock.ticker}</div>
                          <div className="text-xs text-muted-foreground">{stock.name}</div>
                        </div>
                        {stock.reasons && (
                          <div className="pt-2 border-t border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Signal Reasons:</div>
                            <div className="text-xs text-foreground">{stock.reasons}</div>
                          </div>
                        )}
                        <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Action:</span>
                            <span className="font-medium uppercase text-foreground">{stock.signal}</span>
                          </div>
                          {stock.days > 0 && (
                            <div className="flex justify-between mt-1">
                              <span>Days Held:</span>
                              <span className="font-medium text-foreground">{stock.days}d</span>
                            </div>
                          )}
                          {stock.maxDrawdown !== 0 && (
                            <div className="flex justify-between mt-1">
                              <span>Max Drawdown:</span>
                              <span className="text-red-500 font-medium">{stock.maxDrawdown}%</span>
                            </div>
                          )}
                          {stock.return !== 0 && (
                            <div className="flex justify-between mt-1">
                              <span>Return:</span>
                              <span className={stock.return > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                                {stock.return > 0 ? "+" : ""}{stock.return}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="py-3 px-1 text-right">
                  <span className="font-mono text-sm text-muted-foreground">{stock.entryPrice.toLocaleString()}</span>
                </td>
                <td className="py-3 px-1 text-right">
                  <span className="font-mono text-sm text-foreground">{stock.currentPrice.toLocaleString()}</span>
                </td>
                <td className="py-3 px-1 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {stock.return > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-700" />
                    ) : stock.return < 0 ? (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    ) : null}
                    <span
                      className={`font-mono text-sm font-semibold ${stock.return > 0 ? "text-green-700" : stock.return < 0 ? "text-red-600" : "text-muted-foreground"
                        }`}
                    >
                      {stock.return === 0 ? "-" : Math.abs(stock.return).toFixed(1)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Card className="rounded-md h-full flex flex-col">
        <Tabs defaultValue="signal" className="w-full h-full flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="text-foreground font-mono font-bold text-base">Recommendation</CardTitle>
            <TabsList className="h-8">
              <TabsTrigger value="signal" className="text-xs">
                Signal
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="text-xs">
                Holdings
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto overflow-x-hidden pt-0 scrollbar-hide">
            <TabsContent value="signal" className="mt-0">
              {renderStockTable(signalStocks)}
            </TabsContent>
            <TabsContent value="portfolio" className="mt-0">
              {renderStockTable(portfolioStocks)}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </TooltipProvider>
  )
}
