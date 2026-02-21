"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface OverallScoreData {
  overall_score: number
  confidence: string
  market_bias: string
  drivers: string[]
  one_liner: string
  llm_summary: string
}

interface OverallScoreCardProps {
  data: OverallScoreData
}

export function OverallScoreCard({ data }: OverallScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (confidence: string) => {
    const colors: Record<string, string> = {
      high: "border-green-600 text-green-700 bg-green-50",
      neutral: "border-yellow-600 text-yellow-700 bg-yellow-50",
      low: "border-red-600 text-red-700 bg-red-50",
    }
    return colors[confidence] || colors.neutral
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Skor Keseluruhan</h3>
          <p className="text-sm text-muted-foreground">{data.one_liner}</p>
        </div>
        <div className="text-right">
          <div className={`text-5xl font-bold ${getScoreColor(data.overall_score)}`}>
            {data.overall_score}
          </div>
          <Badge variant="outline" className={`mt-2 ${getConfidenceBadge(data.confidence)}`}>
            {data.confidence.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium">Market Bias:</span>
          <Badge variant="secondary" className="capitalize">
            {data.market_bias}
          </Badge>
        </div>
        <div>
          <span className="text-sm font-medium mb-2 block">Key Drivers:</span>
          <div className="flex flex-wrap gap-2">
            {data.drivers.map((driver, index) => (
              <span key={index} className="px-3 py-1 text-sm rounded-md bg-muted">
                {driver}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-50 border border-border">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Ringkasan AI
        </h4>
        <p className="text-sm leading-relaxed text-slate-700">{data.llm_summary}</p>
      </div>
    </Card>
  )
}
