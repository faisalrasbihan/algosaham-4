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

const fundamentalIndicators = [
  { name: "PE Ratio", description: "Price to Earnings ratio", params: { min: 0, max: 50 } },
  { name: "PBV Ratio", description: "Price to Book Value ratio", params: { min: 0, max: 10 } },
  { name: "ROE", description: "Return on Equity percentage", params: { min: 0, max: 100 } },
  { name: "DER", description: "Debt to Equity Ratio", params: { min: 0, max: 5 } },
  { name: "EPS", description: "Earnings Per Share", params: { min: 0, max: 1000 } },
  { name: "Dividend Yield", description: "Annual dividend yield percentage", params: { min: 0, max: 20 } },
]

const technicalIndicators = [
  { name: "RSI", description: "Relative Strength Index", params: { period: 14, oversold: 30, overbought: 70 } },
  { name: "SMA Crossover", description: "Simple Moving Average crossover", params: { shortPeriod: 20, longPeriod: 50 } },
  { name: "EMA Crossover", description: "Exponential Moving Average crossover", params: { shortPeriod: 12, longPeriod: 26 } },
  { name: "MACD", description: "Moving Average Convergence Divergence", params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
  { name: "Bollinger Bands", description: "Bollinger Bands indicator", params: { period: 20, stdDev: 2 } },
  { name: "Stochastic", description: "Stochastic oscillator", params: { kPeriod: 14, dPeriod: 3, smooth: 3 } },
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
          <DialogTitle className="font-mono text-accent">
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
