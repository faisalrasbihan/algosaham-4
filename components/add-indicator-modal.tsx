"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Indicator {
  name: string
  type: "fundamental" | "technical"
  params: Record<string, any>
}

interface AddIndicatorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "fundamental" | "technical"
  onAddIndicator: (indicator: Omit<Indicator, "id">) => void
}

// Fundamental indicators matching API spec
const fundamentalIndicators = [
  { name: "PE Ratio", description: "Price to Earnings ratio", params: { min: 0, max: 50 } },
  { name: "PBV", description: "Price to Book Value ratio", params: { min: 0, max: 10 } },
  { name: "ROE", description: "Return on Equity percentage", params: { min: 0, max: 100 } },
  { name: "DE Ratio", description: "Debt to Equity Ratio", params: { min: 0, max: 5 } },
  { name: "ROA", description: "Return on Assets percentage", params: { min: 0, max: 50 } },
  { name: "NPM", description: "Net Profit Margin percentage", params: { min: 0, max: 100 } },
  { name: "EPS", description: "Earnings Per Share", params: { min: 0, max: 1000 } },
]

// Technical indicators matching API spec
const technicalIndicators = [
  { name: "SMA Crossover", description: "Simple Moving Average crossover signal", params: { shortPeriod: 20, longPeriod: 50 } },
  { name: "SMA Trend", description: "SMA Trend direction analysis", params: { shortPeriod: 20, longPeriod: 50 } },
  { name: "RSI", description: "Relative Strength Index", params: { period: 14, oversold: 30, overbought: 70 } },
  { name: "MACD", description: "Moving Average Convergence Divergence", params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
  { name: "Bollinger Bands", description: "Bollinger Bands indicator", params: { period: 20, stdDev: 2 } },
  { name: "ATR", description: "Average True Range volatility", params: { period: 14 } },
  { name: "Volatility Breakout", description: "Volatility breakout detection", params: { period: 20, multiplier: 2 } },
  { name: "Volume SMA", description: "Volume Moving Average", params: { period: 20, threshold: 1.5 } },
  { name: "OBV", description: "On-Balance Volume", params: { period: 14 } },
  { name: "VWAP", description: "Volume Weighted Average Price", params: { period: 20 } },
  { name: "Volume Price Trend", description: "Volume Price Trend indicator", params: { period: 14 } },
]

export function AddIndicatorModal({ open, onOpenChange, type, onAddIndicator }: AddIndicatorModalProps) {
  const handleAddIndicator = (indicator: any, indicatorType: "fundamental" | "technical") => {
    onAddIndicator({
      name: indicator.name,
      type: indicatorType,
      params: indicator.params,
    })
    onOpenChange(false)
  }

  const indicatorsToShow = type === "fundamental" ? fundamentalIndicators : technicalIndicators

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-slate-800">
            Add {type === "fundamental" ? "Fundamental" : "Technical"} Indicator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {indicatorsToShow.map((indicator, index) => (
            <div key={index} className="p-3 bg-secondary rounded border-l-2 border-chart-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm">{indicator.name}</h3>
                  <p className="text-xs text-muted-foreground">{indicator.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddIndicator(indicator, type)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 px-3 text-xs"
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
