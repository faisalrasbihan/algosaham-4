"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface MonthlyPerformance {
  month: string
  winRate: number
  returns: number
  benchmarkReturns: number
  probability: number
  tradesCount: number
}

interface MonthlyPerformanceHeatmapProps {
  monthlyPerformance?: MonthlyPerformance[]
}

export function MonthlyPerformanceHeatmap({ monthlyPerformance = [] }: MonthlyPerformanceHeatmapProps) {
  // If no data, show placeholder or empty state
  if (!monthlyPerformance || monthlyPerformance.length === 0) {
    return (
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-foreground font-mono font-bold text-base">Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-muted-foreground font-mono text-sm">
            No monthly performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Define metrics to display based on API structure
  const metrics = [
    { label: "Win Rate (%)", key: "winRate" as const, format: (v: number) => `${v.toFixed(0)}%` },
    { label: "Returns (%)", key: "returns" as const, format: (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%` },
    { label: "Benchmark (%)", key: "benchmarkReturns" as const, format: (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%` },
    { label: "Probability", key: "probability" as const, format: (v: number) => v.toFixed(2) },
  ]

  const getColorIntensity = (value: number, metricKey: string) => {
    let normalizedValue = 0

    if (metricKey === "winRate") {
      normalizedValue = (value - 50) / 50 // 50-100% range
    } else if (metricKey === "returns" || metricKey === "benchmarkReturns") {
      normalizedValue = value / 15 // -15% to +15% range
    } else if (metricKey === "probability") {
      normalizedValue = (value - 0.5) / 0.5 // 0.5-1.0 range
    }

    const intensity = Math.min(Math.max(Math.abs(normalizedValue), 0.1), 1)

    if (normalizedValue >= 0) {
      return `rgba(34, 197, 94, ${intensity})` // Green for positive
    } else {
      return `rgba(239, 68, 68, ${intensity})` // Red for negative
    }
  }

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-foreground font-mono font-bold text-base">Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header with months */}
            <div
              className="grid gap-1 mb-2"
              style={{ gridTemplateColumns: `100px repeat(${monthlyPerformance.length}, 1fr)` }}
            >
              <div className="text-xs font-medium text-muted-foreground p-2"></div>
              {monthlyPerformance.map((item, index) => (
                <div key={index} className="text-xs font-medium text-center text-muted-foreground p-2">
                  {item.month}
                </div>
              ))}
            </div>

            {/* Performance metrics rows */}
            {metrics.map((metric, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-1 mb-1"
                style={{ gridTemplateColumns: `100px repeat(${monthlyPerformance.length}, 1fr)` }}
              >
                <div className="text-xs font-medium text-muted-foreground p-2 flex items-center font-mono whitespace-nowrap">
                  {metric.label}
                </div>
                {monthlyPerformance.map((item, colIndex) => {
                  const value = item[metric.key]
                  // Handle possibly undefined/null values safely
                  const safeValue = typeof value === 'number' ? value : 0

                  return (
                    <div
                      key={colIndex}
                      className="p-2 rounded text-center text-xs font-mono font-medium border border-border/30 hover:border-border transition-colors cursor-pointer h-10 flex items-center justify-center"
                      style={{ backgroundColor: getColorIntensity(safeValue, metric.key) }}
                      title={`${item.month}: ${metric.format(safeValue)}`}
                    >
                      {metric.format(safeValue)}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.7)" }}></div>
            <span>Positive Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(239, 68, 68, 0.7)" }}></div>
            <span>Negative Performance</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
