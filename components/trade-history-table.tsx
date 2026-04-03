"use client"

import { Badge } from "@/components/ui/badge"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"

type TradeHistoryRow = {
  id: string
  date: string
  stock: string
  company: string
  action: "BUY" | "SELL"
  quantity: number
  price: number
  pnl: number
}

interface TradeHistoryTableProps {
  trades?: Array<{
    date: string
    ticker: string
    companyName?: string
    action: "BUY" | "SELL"
    price: number
    quantity: number
    profitLoss?: number
  }>
}

const columns: DataTableColumn<TradeHistoryRow>[] = [
  {
    id: "date",
    header: "DATE",
    cell: (row) => <span className="font-mono text-xs">{row.date}</span>,
    headClassName: "font-mono text-xs text-muted-foreground",
  },
  {
    id: "stock",
    header: "STOCK",
    cell: (row) => <span className="font-mono text-xs font-bold">{row.stock}</span>,
    headClassName: "font-mono text-xs text-muted-foreground",
  },
  {
    id: "company",
    header: "COMPANY",
    cell: (row) => <span className="text-xs">{row.company}</span>,
    headClassName: "font-mono text-xs text-muted-foreground",
  },
  {
    id: "action",
    header: "ACTION",
    cell: (row) => (
      <Badge
        variant="outline"
        className={`font-mono text-xs ${
          row.action === "BUY"
            ? "bg-blue-100 text-blue-700 border-blue-200"
            : "bg-slate-100 text-slate-700 border-slate-200"
        }`}
      >
        {row.action}
      </Badge>
    ),
    headClassName: "font-mono text-xs text-muted-foreground",
  },
  {
    id: "quantity",
    header: "QTY",
    cell: (row) => <span className="font-mono text-xs">{row.quantity.toLocaleString()}</span>,
    headClassName: "font-mono text-xs text-muted-foreground",
  },
  {
    id: "price",
    header: "PRICE",
    cell: (row) => <span className="font-mono text-xs">{row.price.toLocaleString()}</span>,
    headClassName: "font-mono text-xs text-muted-foreground",
  },
  {
    id: "pnl",
    header: "P&L",
    cell: (row) => (
      <span
        className={`font-mono text-xs font-bold ${
          row.pnl > 0 ? "text-[#00B853]" : row.pnl < 0 ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {row.pnl === 0 ? "-" : row.pnl > 0 ? `+${row.pnl.toLocaleString()}` : row.pnl.toLocaleString()}
      </span>
    ),
    headClassName: "font-mono text-xs text-muted-foreground",
  },
]

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const displayTrades: TradeHistoryRow[] = (trades ?? [])
    .map((trade, index) => ({
      id: `${trade.ticker}-${trade.date}-${trade.action}-${index}`,
      date: trade.date,
      stock: trade.ticker,
      company: trade.companyName || trade.ticker,
      action: trade.action,
      quantity: trade.quantity,
      price: trade.price,
      pnl: trade.profitLoss || 0,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <DataTable
      columns={columns}
      data={displayTrades}
      getRowId={(row) => row.id}
      emptyMessage=""
      emptyOverlay={
        <div className="text-center text-muted-foreground font-mono">
          <div className="mb-2 text-lg">No Trade Data</div>
          <p className="text-sm">Run a backtest to see trade history</p>
        </div>
      }
      initialPageSize={20}
      pageSizeOptions={[20, 40, 60, 80]}
      itemLabel="trades"
      tableClassName="min-w-[920px]"
    />
  )
}
