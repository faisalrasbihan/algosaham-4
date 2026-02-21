"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface IndicatorPanel {
  score: number
  confidence: string
  series: Record<string, number[]>
  signals: string[]
  commentary: string
  flow_strength_pct_5d?: number
}

interface IndicatorPanelsData {
  movingAverage: IndicatorPanel
  rsi: IndicatorPanel
  foreignFlow: IndicatorPanel
}

interface IndicatorPanelsProps {
  data: IndicatorPanelsData
  dates: string[]
}

export function IndicatorPanels({ data, dates }: IndicatorPanelsProps) {
  const [activePanel, setActivePanel] = useState<"movingAverage" | "rsi" | "foreignFlow">("movingAverage")

  const panels = {
    movingAverage: {
      title: "Moving Average",
      data: data.movingAverage,
      color: "#305250",
    },
    rsi: {
      title: "RSI (Relative Strength Index)",
      data: data.rsi,
      color: "#d07225",
    },
    foreignFlow: {
      title: "Foreign Flow (NBSA)",
      data: data.foreignFlow,
      color: "#305250",
    },
  }

  const currentPanel = panels[activePanel]

  // Prepare chart data
  const chartData = dates.map((date, index) => {
    const dataPoint: Record<string, string | number> = { date }
    Object.entries(currentPanel.data.series).forEach(([key, values]) => {
      dataPoint[key] = values[index]
    })
    return dataPoint
  })

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Indikator Detail</h3>
        <div className="flex gap-2">
          <Button
            variant={activePanel === "movingAverage" ? "default" : "outline"}
            size="sm"
            onClick={() => setActivePanel("movingAverage")}
            className={activePanel === "movingAverage" ? "bg-[#305250] text-white hover:bg-[#305250]/90" : ""}
          >
            MA
          </Button>
          <Button
            variant={activePanel === "rsi" ? "default" : "outline"}
            size="sm"
            onClick={() => setActivePanel("rsi")}
            className={activePanel === "rsi" ? "bg-[#305250] text-white hover:bg-[#305250]/90" : ""}
          >
            RSI
          </Button>
          <Button
            variant={activePanel === "foreignFlow" ? "default" : "outline"}
            size="sm"
            onClick={() => setActivePanel("foreignFlow")}
            className={activePanel === "foreignFlow" ? "bg-[#305250] text-white hover:bg-[#305250]/90" : ""}
          >
            Foreign Flow
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h4 className="text-lg font-medium mb-2">{currentPanel.title}</h4>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="capitalize">
              {currentPanel.data.confidence}
            </Badge>
            {activePanel === "foreignFlow" && currentPanel.data.flow_strength_pct_5d && (
              <span className="text-sm text-muted-foreground">
                Flow Strength: {currentPanel.data.flow_strength_pct_5d.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <div className={`text-3xl font-bold ${getScoreColor(currentPanel.data.score)}`}>
          {currentPanel.data.score}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.slice(5)}
              stroke="#6b7280"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            {Object.keys(currentPanel.data.series).map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={index === 0 ? currentPanel.color : `hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={2}
                dot={false}
                name={key.toUpperCase().replace(/_/g, " ")}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Signals */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-2">Sinyal</h4>
        <ul className="space-y-2">
          {currentPanel.data.signals.map((signal, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Commentary */}
      <div className="p-4 rounded-lg bg-slate-50 border border-border">
        <h4 className="text-sm font-semibold mb-2">Komentar AI</h4>
        <p className="text-sm leading-relaxed text-slate-700">{currentPanel.data.commentary}</p>
      </div>
    </Card>
  )
}
