"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, TrendingDown, Sparkles, BarChart3, ArrowRight, ArrowUpRight, Wallet } from "lucide-react"
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

// Portfolio position from backtest currentPortfolio
interface PortfolioPosition {
  ticker: string
  companyName: string
  quantity: number
  entryDate: string
  entryPrice: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  holdingDays: number
}

interface CurrentPortfolio {
  cash: number
  totalValue: number
  openPositionsValue: number
  openPositionsCount: number
  positions: PortfolioPosition[]
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
  currentPortfolio?: CurrentPortfolio
}

/** Format number in short notation: 1.2M, 500K, etc. */
function formatShortNumber(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}jt`
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(1)}rb`
  }
  return value.toLocaleString()
}

export function StockRecommendations({ signals = [], trades = [], currentPortfolio }: StockRecommendationsProps) {
  console.log('🎯 [STOCK RECOMMENDATIONS] Component rendered with:', {
    signalsCount: signals.length,
    tradesCount: trades.length,
    signals: signals,
    trades: trades,
    currentPortfolio: currentPortfolio,
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

  const positions = currentPortfolio?.positions ?? []

  const renderSignalsTable = (stocks: StockRecommendation[]) => {
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
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        Stock
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[180px]">
                      Kode dan nama emiten saham yang mendapat sinyal dari strategi.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="hidden 2xl:table-cell text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-white">
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        Days
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                      Berapa hari yang lalu sinyal ini muncul sejak tanggal sinyal hingga hari ini.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="hidden md:table-cell lg:hidden xl:table-cell text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-white">
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        Entry
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                      Harga masuk (entry price) saat sinyal pertama kali terdeteksi, dalam Rupiah.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-white">
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        Return
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                      Persentase keuntungan atau kerugian sementara dihitung dari harga masuk ke harga saat ini.
                    </TooltipContent>
                  </Tooltip>
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
                            <div className="text-xs text-muted-foreground truncate max-w-[120px] hidden md:block lg:hidden xl:block">{stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden 2xl:table-cell py-3 px-2 text-right">
                        <span className="font-mono text-sm text-foreground">{stock.days}d</span>
                      </td>
                      <td className="hidden md:table-cell lg:hidden xl:table-cell py-3 px-2 text-right">
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

                      {/* Action Button */}
                      <div className="p-3 pt-0 border-t border-slate-100 mt-2">
                        <Button className="w-full text-xs h-8 bg-[#d07225] hover:bg-[#a65b1d] text-white" asChild>
                          <Link href={`/analyze?ticker=${stock.ticker}`}>
                            Analisis Saham <ArrowUpRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
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

  const renderPortfolioTable = (positions: PortfolioPosition[]) => {
    if (positions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">No open positions</p>
          <p className="text-xs text-muted-foreground/70">
            Open positions from the backtest will appear here
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
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        Stock
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[180px]">
                      Kode dan nama emiten saham yang sedang dipegang dalam portofolio simulasi.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="hidden 2xl:table-cell text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-white">
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        Days
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                      Jumlah hari saham ini sudah dipegang sejak tanggal beli hingga hari terakhir backtest.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-white">
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        PnL
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[220px]">
                      Profit and Loss — keuntungan atau kerugian belum terealisasi (unrealized) dari posisi yang masih terbuka, dalam Rupiah dan persentase.
                    </TooltipContent>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, index) => {
                const isPositive = pos.unrealizedPnL >= 0
                return (
                  <Tooltip key={index} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 relative">
                              <Image
                                src={`/stock_icons/${pos.ticker}.png`}
                                alt={pos.ticker}
                                width={32}
                                height={32}
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.className = `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`
                                    parent.textContent = pos.ticker.substring(0, 2)
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-mono font-semibold text-sm text-foreground">{pos.ticker}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[120px] hidden md:block lg:hidden xl:block">{pos.companyName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden 2xl:table-cell py-3 px-2 text-right">
                          <span className="font-mono text-sm text-foreground">{pos.holdingDays}d</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className={`font-mono text-sm font-semibold ${isPositive ? "text-green-700" : "text-red-600"}`}>
                              {isPositive ? "+" : ""}Rp {formatShortNumber(pos.unrealizedPnL)}
                            </span>
                            <span className={`font-mono text-xs ${isPositive ? "text-green-600" : "text-red-500"}`}>
                              {isPositive ? "+" : ""}{pos.unrealizedPnLPercent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="p-0 min-w-[260px] max-w-[300px] overflow-hidden">
                      <div className="space-y-0">
                        {/* Header */}
                        <div className="bg-slate-50 p-3 border-b border-slate-200">
                          <div className="font-bold text-base text-foreground">{pos.ticker}</div>
                          <div className="text-xs text-muted-foreground">{pos.companyName}</div>
                        </div>

                        <div className="p-3 space-y-3">
                          {/* Price Info */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Entry Price:</span>
                              <span className="text-xs font-semibold text-foreground font-mono">
                                Rp {pos.entryPrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Current Price:</span>
                              <span className="text-xs font-semibold text-foreground font-mono">
                                Rp {pos.currentPrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Qty:</span>
                              <span className="text-xs font-semibold text-foreground font-mono">
                                {pos.quantity.toLocaleString()} lot
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Market Value:</span>
                              <span className="text-xs font-semibold text-foreground font-mono">
                                Rp {pos.marketValue.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* PnL */}
                          <div className="pt-2 border-t border-slate-200 space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-muted-foreground">Unrealized PnL:</span>
                              <span className={`text-sm font-bold font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}Rp {pos.unrealizedPnL.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-muted-foreground">Return:</span>
                              <span className={`text-sm font-bold font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Entry Date:</span>
                              <span className="text-xs font-medium text-foreground">{pos.entryDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Holding Days:</span>
                              <span className="text-xs font-medium text-foreground">{pos.holdingDays}d</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="p-3 pt-0 border-t border-slate-100 mt-2">
                          <Button className="w-full text-xs h-8 bg-[#d07225] hover:bg-[#a65b1d] text-white" asChild>
                            <Link href={`/analyze?ticker=${pos.ticker}`}>
                              Analisis Saham <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </tbody>
          </table>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <Card className="rounded-md h-full flex flex-col">
      <Tabs defaultValue="signals" className="flex flex-col flex-1 min-h-0">
        <CardHeader className="pb-0 flex-shrink-0">
          <TabsList variant="line" className="mb-0 gap-5">
            <TabsTrigger value="signals" className="group text-sm font-mono font-bold data-[state=active]:border-[#d07225] data-[state=active]:text-[#d07225] pb-3">
              Signal
              {signalStocks.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-slate-100 text-muted-foreground text-[10px] font-mono font-bold group-data-[state=active]:bg-[#d07225]/10 group-data-[state=active]:text-[#d07225]">
                  {signalStocks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="group text-sm font-mono font-bold data-[state=active]:border-[#d07225] data-[state=active]:text-[#d07225] pb-3">
              Portfolio
              {positions.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-slate-100 text-muted-foreground text-[10px] font-mono font-bold group-data-[state=active]:bg-[#d07225]/10 group-data-[state=active]:text-[#d07225]">
                  {positions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4 pt-2 min-h-0">
          <TabsContent value="signals" className="mt-0 h-full">
            {renderSignalsTable(signalStocks)}
          </TabsContent>
          <TabsContent value="portfolio" className="mt-0 h-full">
            {renderPortfolioTable(positions)}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
