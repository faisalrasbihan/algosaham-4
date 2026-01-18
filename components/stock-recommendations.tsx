"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StockRecommendation {
  ticker: string
  name: string
  days: number
  return: number
  maxDrawdown: number
  entryPrice: number
  currentPrice: number
  signal: "buy" | "sell"
}

export function StockRecommendations() {
  const signalStocks: StockRecommendation[] = [
    {
      ticker: "BBCA",
      name: "Bank Central Asia",
      days: 15,
      return: 12.5,
      maxDrawdown: -2.1,
      entryPrice: 8750,
      currentPrice: 9844,
      signal: "buy",
    },
    {
      ticker: "ASII",
      name: "Astra International",
      days: 8,
      return: 8.3,
      maxDrawdown: -1.5,
      entryPrice: 5200,
      currentPrice: 5632,
      signal: "buy",
    },
    {
      ticker: "TLKM",
      name: "Telkom Indonesia",
      days: 5,
      return: -3.2,
      maxDrawdown: -4.5,
      entryPrice: 3850,
      currentPrice: 3727,
      signal: "buy",
    },
    {
      ticker: "UNVR",
      name: "Unilever Indonesia",
      days: 12,
      return: 6.2,
      maxDrawdown: -3.8,
      entryPrice: 3890,
      currentPrice: 4131,
      signal: "buy",
    },
  ]

  const portfolioStocks: StockRecommendation[] = [
    {
      ticker: "BBRI",
      name: "Bank Rakyat Indonesia",
      days: 45,
      return: 18.9,
      maxDrawdown: -4.2,
      entryPrice: 4200,
      currentPrice: 4994,
      signal: "buy",
    },
    {
      ticker: "BMRI",
      name: "Bank Mandiri",
      days: 32,
      return: 14.3,
      maxDrawdown: -3.1,
      entryPrice: 5500,
      currentPrice: 6287,
      signal: "buy",
    },
    {
      ticker: "ANTM",
      name: "Aneka Tambang",
      days: 28,
      return: -5.8,
      maxDrawdown: -12.4,
      entryPrice: 1850,
      currentPrice: 1743,
      signal: "buy",
    },
    {
      ticker: "BBCA",
      name: "Bank Central Asia",
      days: 15,
      return: 12.5,
      maxDrawdown: -2.1,
      entryPrice: 8750,
      currentPrice: 9844,
      signal: "buy",
    },
    {
      ticker: "INDF",
      name: "Indofood Sukses",
      days: 22,
      return: 9.1,
      maxDrawdown: -5.5,
      entryPrice: 6800,
      currentPrice: 7419,
      signal: "buy",
    },
    {
      ticker: "ICBP",
      name: "Indofood CBP",
      days: 18,
      return: 7.4,
      maxDrawdown: -2.9,
      entryPrice: 10500,
      currentPrice: 11277,
      signal: "buy",
    },
  ]

  const renderStockTable = (stocks: StockRecommendation[]) => (
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
                  <TooltipContent side="right" className="p-4 min-w-[240px]">
                    <div className="space-y-2">
                      <div>
                        <div className="font-bold text-sm text-foreground">{stock.ticker}</div>
                        <div className="text-xs text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Action:</span>
                          <span className="font-medium uppercase text-foreground">{stock.signal}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Days Held:</span>
                          <span className="font-medium text-foreground">{stock.days}d</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Max Drawdown:</span>
                          <span className="text-red-500 font-medium">{stock.maxDrawdown}%</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Return:</span>
                          <span className={stock.return > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                            {stock.return > 0 ? "+" : ""}{stock.return}%
                          </span>
                        </div>
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
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span
                    className={`font-mono text-sm font-semibold ${stock.return > 0 ? "text-green-700" : "text-red-600"
                      }`}
                  >
                    {Math.abs(stock.return).toFixed(1)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

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
