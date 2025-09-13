"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MonthlyPerformanceHeatmap() {
  // Generate last 12 months
  const months: { month: string; fullMonth: string }[] = []
  const currentDate = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    months.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      fullMonth: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    })
  }

  // Mock monthly performance data
  const performanceData = [
    { metric: "Win Rate (%)", data: [65, 72, 58, 81, 69, 74, 62, 77, 83, 59, 71, 68] },
    { metric: "Returns (%)", data: [4.2, 7.8, -2.1, 12.3, 5.6, 8.9, -1.4, 9.7, 11.2, -3.2, 6.8, 4.5] },
    { metric: "Benchmark (%)", data: [2.1, 3.4, -1.8, 5.2, 2.9, 4.1, -0.8, 4.6, 5.8, -2.1, 3.2, 2.7] },
    { metric: "Probability", data: [0.68, 0.74, 0.52, 0.85, 0.71, 0.76, 0.58, 0.79, 0.87, 0.54, 0.73, 0.69] },
  ]

  const getColorIntensity = (value: number, metric: string) => {
    let normalizedValue = 0

    if (metric === "Win Rate (%)") {
      normalizedValue = (value - 50) / 50 // 50-100% range
    } else if (metric === "Returns (%)" || metric === "Benchmark (%)") {
      normalizedValue = value / 15 // -15% to +15% range
    } else if (metric === "Probability") {
      normalizedValue = (value - 0.5) / 0.5 // 0.5-1.0 range
    }

    const intensity = Math.min(Math.max(Math.abs(normalizedValue), 0.1), 1)

    if (normalizedValue >= 0) {
      return `rgba(34, 197, 94, ${intensity})` // Green for positive
    } else {
      return `rgba(239, 68, 68, ${intensity})` // Red for negative
    }
  }

  const formatValue = (value: number, metric: string) => {
    if (metric === "Win Rate (%)") {
      return `${value}%`
    } else if (metric === "Returns (%)" || metric === "Benchmark (%)") {
      return `${value > 0 ? "+" : ""}${value}%`
    } else if (metric === "Probability") {
      return value.toFixed(2)
    }
    return value.toString()
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
            <div className="grid grid-cols-13 gap-1 mb-2">
              <div className="text-xs font-medium text-muted-foreground p-2"></div>
              {months.map((month, index) => (
                <div key={index} className="text-xs font-medium text-center text-muted-foreground p-2">
                  {month.month}
                </div>
              ))}
            </div>

            {/* Performance metrics rows */}
            {performanceData.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-13 gap-1 mb-1">
                <div className="text-xs font-medium text-muted-foreground p-2 flex items-center font-mono">
                  {row.metric}
                </div>
                {row.data.map((value, colIndex) => (
                  <div
                    key={colIndex}
                    className="p-2 rounded text-center text-xs font-mono font-medium border border-border/30 hover:border-border transition-colors cursor-pointer"
                    style={{ backgroundColor: getColorIntensity(value, row.metric) }}
                    title={`${months[colIndex].fullMonth}: ${formatValue(value, row.metric)}`}
                  >
                    {formatValue(value, row.metric)}
                  </div>
                ))}
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
