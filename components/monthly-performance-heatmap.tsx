"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  if (!monthlyPerformance || monthlyPerformance.length === 0) {
    return (
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-foreground font-mono font-bold text-base">Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-muted-foreground font-ibm-plex-mono text-sm">
            No monthly performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const metrics = [
    { label: "Win Rate (%)", key: "winRate" as const, format: (v: number) => `${v.toFixed(0)}%` },
    { label: "Returns (%)", key: "returns" as const, format: (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%` },
    { label: "Benchmark (%)", key: "benchmarkReturns" as const, format: (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%` },
    { label: "Probability", key: "probability" as const, format: (v: number) => v.toFixed(2) },
  ]

  const getScaledTextColor = (metricKey: "winRate" | "returns" | "benchmarkReturns", value: number) => {
    const clamp = (input: number, min: number, max: number) => Math.min(Math.max(input, min), max)
    const mixChannel = (from: number, to: number, amount: number) => Math.round(from + (to - from) * amount)

    const positiveColor = [0, 184, 83]
    const negativeColor = [220, 38, 38]
    const neutralColor = [100, 116, 139]

    let normalized = 0

    if (metricKey === "winRate") {
      normalized = clamp((value - 50) / 50, -1, 1)
    } else {
      normalized = clamp(value / 15, -1, 1)
    }

    if (Math.abs(normalized) < 0.08) {
      return `rgb(${neutralColor.join(", ")})`
    }

    const intensity = Math.max(Math.abs(normalized), 0.2)
    const targetColor = normalized > 0 ? positiveColor : negativeColor
    const channels = neutralColor.map((channel, index) => mixChannel(channel, targetColor[index], intensity))

    return `rgb(${channels.join(", ")})`
  }

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-foreground font-mono font-bold text-base">Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent className="pb-8">
        <Table className="min-w-[720px] text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px] font-semibold text-muted-foreground">Metric</TableHead>
              {monthlyPerformance.map((item) => (
                <TableHead
                  key={item.month}
                  className="min-w-[110px] text-center font-semibold text-muted-foreground"
                >
                  {item.month}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.key}>
                <TableCell className="font-ibm-plex-mono font-medium text-foreground whitespace-nowrap">
                  {metric.label}
                </TableCell>
                {monthlyPerformance.map((item) => {
                  const value = item[metric.key]
                  const safeValue = typeof value === "number" ? value : 0

                  return (
                    <TableCell
                      key={`${item.month}-${metric.key}`}
                      className="font-ibm-plex-mono text-center text-foreground"
                      style={
                        metric.key === "probability"
                          ? undefined
                          : {
                              color: getScaledTextColor(metric.key, safeValue),
                            }
                      }
                      title={`${item.month}: ${metric.format(safeValue)}`}
                    >
                      {metric.format(safeValue)}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
