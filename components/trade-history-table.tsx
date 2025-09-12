"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const trades = [
  {
    date: "2024-01-15",
    stock: "BBCA",
    company: "Bank Central Asia",
    action: "SELL",
    quantity: 1000,
    price: 9850,
    pnl: 485000,
  },
  {
    date: "2024-01-12",
    stock: "ASII",
    company: "Astra International",
    action: "BUY",
    quantity: 500,
    price: 6200,
    pnl: 0,
  },
  {
    date: "2024-01-10",
    stock: "TLKM",
    company: "Telkom Indonesia",
    action: "SELL",
    quantity: 2000,
    price: 3850,
    pnl: -125000,
  },
  {
    date: "2024-01-08",
    stock: "UNVR",
    company: "Unilever Indonesia",
    action: "BUY",
    quantity: 800,
    price: 4250,
    pnl: 0,
  },
  {
    date: "2024-01-05",
    stock: "BBRI",
    company: "Bank Rakyat Indonesia",
    action: "SELL",
    quantity: 1500,
    price: 4950,
    pnl: 337500,
  },
  { date: "2024-01-03", stock: "BMRI", company: "Bank Mandiri", action: "BUY", quantity: 1200, price: 6800, pnl: 0 },
  {
    date: "2023-12-28",
    stock: "GGRM",
    company: "Gudang Garam",
    action: "SELL",
    quantity: 300,
    price: 58500,
    pnl: 1275000,
  },
  { date: "2023-12-26", stock: "ICBP", company: "Indofood CBP", action: "BUY", quantity: 600, price: 11200, pnl: 0 },
  {
    date: "2023-12-22",
    stock: "KLBF",
    company: "Kalbe Farma",
    action: "SELL",
    quantity: 4000,
    price: 1580,
    pnl: -96000,
  },
  {
    date: "2023-12-20",
    stock: "INTP",
    company: "Indocement Tunggal",
    action: "BUY",
    quantity: 400,
    price: 9750,
    pnl: 0,
  },
]

export function TradeHistoryTable() {
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
          {trades.map((trade, index) => (
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
