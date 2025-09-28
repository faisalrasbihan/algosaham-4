"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


interface TradeHistoryTableProps {
  trades?: Array<{
    date: string
    ticker: string
    companyName?: string
    action: 'BUY' | 'SELL'
    price: number
    quantity: number
    profitLoss?: number
  }>
}

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  // Show error state if no trades data
  if (!trades || trades.length === 0) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-mono text-xs text-muted-foreground">DATE</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground">STOCK</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground">COMPANY</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground">ACTION</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground">QTY</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground">PRICE</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="text-muted-foreground font-mono">
                  <div className="text-lg mb-2">No Trade Data</div>
                  <p className="text-sm">Run a backtest to see trade history</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  // Process API trades data
  const displayTrades = trades.map(trade => ({
    date: trade.date,
    stock: trade.ticker,
    company: trade.companyName || trade.ticker,
    action: trade.action,
    quantity: trade.quantity,
    price: trade.price,
    pnl: trade.profitLoss || 0
  }))

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="font-mono text-xs text-muted-foreground">DATE</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">STOCK</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">COMPANY</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">ACTION</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">QTY</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">PRICE</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">P&L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayTrades.map((trade, index) => (
            <TableRow key={index} className="border-border hover:bg-secondary/50">
              <TableCell className="font-mono text-xs">{trade.date}</TableCell>
              <TableCell className="font-mono text-xs font-bold">{trade.stock}</TableCell>
              <TableCell className="text-xs">{trade.company}</TableCell>
              <TableCell>
                <Badge
                  variant={trade.action === "BUY" ? "default" : "destructive"}
                  className={`font-mono text-xs ${
                    trade.action === "BUY"
                      ? "bg-accent text-accent-foreground"
                      : "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {trade.action}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">{trade.quantity.toLocaleString()}</TableCell>
              <TableCell className="font-mono text-xs">{trade.price.toLocaleString()}</TableCell>
              <TableCell
                className={`font-mono text-xs font-bold ${
                  trade.pnl > 0 ? "text-accent" : trade.pnl < 0 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {trade.pnl === 0 ? "-" : trade.pnl > 0 ? `+${trade.pnl.toLocaleString()}` : trade.pnl.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
