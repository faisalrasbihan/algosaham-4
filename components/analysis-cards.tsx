"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TechnicalAnalysisData {
  score: number
  confidence: string
  trend: string
  momentum: string
  volatility: string
  signals: string[]
}

interface FundamentalAnalysisData {
  score: number
  confidence: string
  valuation: string
  metrics: {
    pe_ratio: number
    pbv: number
    roe: number
    der: number
    npm: number
  }
}

interface AnalysisCardsProps {
  technical: TechnicalAnalysisData
  fundamental: FundamentalAnalysisData
}

export function AnalysisCards({ technical, fundamental }: AnalysisCardsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Technical Analysis */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Analisis Teknikal</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {technical.trend} • {technical.momentum}
            </p>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(technical.score)}`}>{technical.score}</div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Trend</span>
            <Badge variant="secondary" className="capitalize">
              {technical.trend}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Momentum</span>
            <Badge variant="secondary" className="capitalize">
              {technical.momentum}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Volatilitas</span>
            <Badge variant="secondary" className="capitalize">
              {technical.volatility}
            </Badge>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Sinyal</h4>
            <ul className="space-y-2">
              {technical.signals.map((signal, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Fundamental Analysis */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Analisis Fundamental</h3>
            <p className="text-sm text-muted-foreground capitalize">Valuasi: {fundamental.valuation}</p>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(fundamental.score)}`}>{fundamental.score}</div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="text-xs text-muted-foreground mb-1">P/E Ratio</div>
              <div className="text-lg font-semibold">{fundamental.metrics.pe_ratio.toFixed(1)}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="text-xs text-muted-foreground mb-1">PBV</div>
              <div className="text-lg font-semibold">{fundamental.metrics.pbv.toFixed(1)}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="text-xs text-muted-foreground mb-1">ROE</div>
              <div className="text-lg font-semibold">{fundamental.metrics.roe.toFixed(1)}%</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="text-xs text-muted-foreground mb-1">DER</div>
              <div className="text-lg font-semibold">{fundamental.metrics.der.toFixed(1)}</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50">
            <div className="text-xs text-muted-foreground mb-1">Net Profit Margin</div>
            <div className="text-lg font-semibold">{fundamental.metrics.npm.toFixed(1)}%</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
