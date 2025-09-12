"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PerformanceChart } from "@/components/performance-chart"
import { TradeHistoryTable } from "@/components/trade-history-table"
import { MonthlyPerformanceHeatmap } from "@/components/monthly-performance-heatmap"

export function ResultsPanel() {
  const performanceStats = [
    { label: "Total Return", value: "+45.2%", positive: true },
    { label: "Annual Return", value: "+18.7%", positive: true },
    { label: "Max Drawdown", value: "-12.8%", positive: false },
    { label: "Win Rate", value: "67.3%", positive: true },
    { label: "Total Trades", value: "156", neutral: true },
    { label: "Avg Hold Days", value: "23.4", neutral: true },
    { label: "Best Stock", value: "BBCA", positive: true },
    { label: "Worst Stock", value: "TLKM", positive: false },
  ]

  return (
    <div className="p-6 space-y-6 py-3.5 px-3.5">
      {/* Performance Chart */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-foreground font-mono font-bold text-base">Performance Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart />
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-foreground font-mono font-bold text-base">Performance Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 bg-secondary/50 rounded-lg border border-border/50 hover:bg-secondary/70 transition-colors"
              >
                <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                  {stat.label}
                </div>
                <div
                  className={`font-mono text-xl font-bold ${
                    stat.positive ? "text-green-700" : stat.positive === false ? "text-red-600" : "text-foreground"
                  }`}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance Heatmap */}
      <MonthlyPerformanceHeatmap />

      {/* Trade History */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-foreground font-mono font-bold text-base">Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeHistoryTable />
        </CardContent>
      </Card>
    </div>
  )
}
