"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  ChevronRight,
  Zap,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowUpRight,
  Layers,
  LineChart,
  Shield,
  Globe,
  Settings2,
} from "lucide-react"

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

interface IndicatorDef {
  name: string
  description: string
  params: Record<string, any>
}

interface IndicatorCategory {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string, style?: React.CSSProperties }>
  indicators: IndicatorDef[]
}

// 52 technical indicators across 10 categories
const technicalIndicatorCategories: IndicatorCategory[] = [
  {
    id: "momentum",
    name: "Momentum",
    icon: Zap,
    indicators: [
      { name: "RSI", description: "Relative Strength Index — oversold/overbought signals", params: { period: 14, oversold: 30, overbought: 70 } },
      { name: "MACD", description: "MACD line crosses above signal line", params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
      { name: "Stochastic", description: "Stochastic Oscillator %K crosses %D", params: { kPeriod: 14, dPeriod: 3, oversold: 20, overbought: 80 } },
    ],
  },
  {
    id: "moving-averages",
    name: "Moving Averages",
    icon: TrendingUp,
    indicators: [
      { name: "SMA Crossover", description: "Buy on Golden Cross (Short SMA > Long SMA)", params: { shortPeriod: 20, longPeriod: 50 } },
      { name: "SMA Trend", description: "Buy when Short SMA is above Long SMA", params: { shortPeriod: 20, longPeriod: 50 } },
      { name: "EMA Crossover", description: "Buy on Golden Cross (Short EMA > Long EMA)", params: { shortPeriod: 12, longPeriod: 26 } },
    ],
  },
  {
    id: "volatility",
    name: "Volatility",
    icon: Activity,
    indicators: [
      { name: "Bollinger Bands", description: "Price touches Lower Band (mean reversion)", params: { period: 20, stdDev: 2 } },
      { name: "ATR", description: "Average True Range — volatility measure", params: { period: 14 } },
      { name: "Volatility Breakout", description: "Volatility exceeds historical average", params: { period: 20, multiplier: 2 } },
      { name: "Keltner Channel", description: "Price at Lower Keltner Channel", params: { period: 20, atrPeriod: 10, multiplier: 2 } },
    ],
  },
  {
    id: "volume",
    name: "Volume",
    icon: BarChart3,
    indicators: [
      { name: "Volume SMA", description: "Volume spike above average", params: { period: 20, threshold: 1.5 } },
      { name: "OBV", description: "On-Balance Volume trending up", params: { period: 20 } },
      { name: "VWAP", description: "Price above Volume Weighted Average", params: { period: 20 } },
      { name: "Volume Price Trend", description: "VPT trending up", params: { period: 20 } },
      { name: "Accumulation Base", description: "Decline + consolidation + volume increase", params: { declinePeriod: 60, minDeclinePct: 30, basePeriod: 20, maxBaseRange: 15, volumeIncreasePct: 50 } },
      { name: "Base Breakout", description: "Breakout from tight range with volume", params: { basePeriod: 30, maxBaseRange: 15, breakoutPct: 2, volumeMultiplier: 1.5 } },
      { name: "Volume Dry Up", description: "Decreasing volume before move", params: { period: 20, dryUpThreshold: 0.5, consecutiveDays: 3 } },
      { name: "Climax Volume", description: "Extreme volume spike after decline", params: { period: 20, climaxMultiplier: 3.0, priorDeclinePct: 15, priorDeclineDays: 20 } },
      { name: "Accumulation Distribution", description: "A/D Line rising above MA", params: { period: 20 } },
    ],
  },
  {
    id: "trend",
    name: "Trend",
    icon: ArrowUpRight,
    indicators: [
      { name: "ADX", description: "Average Directional Index — strong trend", params: { period: 14, threshold: 25 } },
      { name: "Parabolic SAR", description: "SAR dots flip below price", params: { afStart: 0.02, afStep: 0.02, afMax: 0.2 } },
      { name: "Supertrend", description: "Price crosses above Supertrend line", params: { period: 10, multiplier: 3 } },
    ],
  },
  {
    id: "candlestick",
    name: "Candlestick Patterns",
    icon: Layers,
    indicators: [
      { name: "Doji", description: "Doji candle after downtrend", params: { bodyThreshold: 10, trendPeriod: 5 } },
      { name: "Hammer", description: "Hammer candle after downtrend", params: { shadowRatio: 2, bodyMaxPct: 35, trendPeriod: 5 } },
      { name: "Inverted Hammer", description: "Inverted Hammer after downtrend", params: { shadowRatio: 2, bodyMaxPct: 35, trendPeriod: 5 } },
      { name: "Bullish Marubozu", description: "Strong bullish candle with no shadows", params: { maxShadowPct: 5, minBodyPct: 90 } },
      { name: "Bullish Engulfing", description: "Bullish candle engulfs prior bearish", params: {} },
      { name: "Bullish Harami", description: "Small bullish inside large bearish", params: {} },
      { name: "Piercing Line", description: "Bullish candle penetrates >50% of prior", params: { minPenetration: 50 } },
      { name: "Tweezer Bottom", description: "Two candles with matching lows", params: { tolerance: 0.1 } },
      { name: "Morning Star", description: "3-candle bullish reversal pattern", params: {} },
      { name: "Three White Soldiers", description: "3 consecutive strong bullish candles", params: { minBodyPct: 60 } },
      { name: "Three Inside Up", description: "Bullish Harami confirmation", params: {} },
    ],
  },
  {
    id: "chart-patterns",
    name: "Chart Patterns",
    icon: LineChart,
    indicators: [
      { name: "Falling Wedge", description: "Breakout from Falling Wedge", params: { lookbackPeriod: 30, peakWindow: 5, minTouches: 2, minRSquared: 0.7 } },
      { name: "Double Bottom", description: "Breakout from Double Bottom (W)", params: { lookbackPeriod: 40, peakWindow: 5, priceTolerance: 3, minTroughDistance: 10 } },
      { name: "Cup and Handle", description: "Breakout from Cup and Handle", params: { cupMinBars: 20, cupMaxBars: 60, handleMinBars: 5, handleMaxBars: 15, maxHandleRetracement: 50, cupDepthMinPct: 15, cupDepthMaxPct: 50 } },
      { name: "Inverse Head Shoulders", description: "Breakout from Inverse H&S", params: { lookbackPeriod: 50, peakWindow: 5, shoulderTolerance: 5, minHeadDepth: 3 } },
      { name: "Rounding Bottom", description: "Gradual U-shaped recovery", params: { lookbackPeriod: 40, minCurvature: 0.6, breakoutPct: 2 } },
      { name: "Bull Flag", description: "Breakout from Bull Flag", params: { flagpoleMovePercent: 5, flagpoleMaxBars: 10, flagMinBars: 5, flagMaxBars: 15, maxFlagRetracement: 50 } },
      { name: "Ascending Triangle", description: "Breakout from Ascending Triangle", params: { lookbackPeriod: 30, peakWindow: 5, minTouches: 2, resistanceTolerance: 1.5 } },
      { name: "Bull Flag Imminent", description: "Bull Flag formed, near breakout", params: { flagpoleMovePercent: 5, flagpoleMaxBars: 10, flagMinBars: 3, flagMaxBars: 12, maxFlagRetracement: 50, proximityPct: 3 } },
      { name: "Falling Wedge Imminent", description: "Falling Wedge formed, near breakout", params: { lookbackPeriod: 25, peakWindow: 5, minTouches: 2, minRSquared: 0.65, proximityPct: 3 } },
      { name: "Double Bottom Imminent", description: "Double Bottom formed, near breakout", params: { lookbackPeriod: 40, peakWindow: 5, priceTolerance: 3, minTroughDistance: 10, proximityPct: 3 } },
      { name: "Ascending Triangle Imminent", description: "Ascending Triangle formed, near breakout", params: { lookbackPeriod: 30, peakWindow: 5, minTouches: 2, resistanceTolerance: 1.5, proximityPct: 2 } },
    ],
  },
  {
    id: "support-resistance",
    name: "Support & Resistance",
    icon: Shield,
    indicators: [
      { name: "Pivot Points", description: "Price bouncing off support level", params: {} },
      { name: "Donchian Channel", description: "Breakout above Donchian High", params: { period: 20 } },
    ],
  },
  {
    id: "flow",
    name: "Flow Indicators",
    icon: Globe,
    indicators: [
      { name: "Foreign Flow", description: "Foreign accumulation detected", params: { period: 5, flowType: "accumulation", minNetBuy: 1000000000, consecutiveDays: 3 } },
      { name: "Foreign Reversal", description: "Foreign flow switch sell-to-buy", params: { sellPeriod: 10, buyPeriod: 5, minSellValue: 5000000000, minBuyValue: 2000000000 } },
      { name: "ARA Recovery", description: "Recovery from ARA (Upper Limit)", params: { lookbackDays: 3, minAraCount: 1, araThresholdPct: 90 } },
      { name: "ARB Recovery", description: "Bounce from ARB (Lower Limit)", params: { lookbackDays: 5, recoveryDays: 2, arbThresholdPct: 90, minRecoveryPct: 5 } },
      { name: "ARA Breakout", description: "Breakout after ARA consolidation", params: { araLookback: 10, consolidationDays: 3, breakoutPct: 2 } },
    ],
  },
  {
    id: "regime",
    name: "Regime",
    icon: Settings2,
    indicators: [
      { name: "Volatility Regime", description: "Volatility regime detection (low/high)", params: { period: 20, lookback: 60, lowThreshold: -0.5, highThreshold: 1.0, mode: "BOTH" } },
      { name: "Calendar Effect", description: "Month-end or seasonal effects", params: { mode: "MONTH_END", days: 3 } },
      { name: "Sector Relative Strength", description: "Sector outperforming the market", params: { period: 20, threshold: 0.0 } },
    ],
  },
]

export function AddIndicatorModal({ open, onOpenChange, type, onAddIndicator }: AddIndicatorModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["momentum"]))

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("")
      setExpandedCategories(new Set(["momentum"]))
    }
  }, [open])

  const handleAddIndicator = (indicator: IndicatorDef, indicatorType: "fundamental" | "technical") => {
    onAddIndicator({
      name: indicator.name,
      type: indicatorType,
      params: { ...indicator.params },
    })
    onOpenChange(false)
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return technicalIndicatorCategories

    const query = searchQuery.toLowerCase()
    return technicalIndicatorCategories
      .map((category) => ({
        ...category,
        indicators: category.indicators.filter(
          (ind) =>
            ind.name.toLowerCase().includes(query) ||
            ind.description.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.indicators.length > 0)
  }, [searchQuery])

  // When searching, expand all matching categories
  const effectiveExpanded = searchQuery.trim()
    ? new Set(filteredCategories.map((c) => c.id))
    : expandedCategories

  // Fundamental indicators — keep original flat layout
  if (type === "fundamental") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-slate-800">
              Add Fundamental Indicator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {fundamentalIndicators.map((indicator, index) => (
              <div key={index} className="p-3 bg-secondary rounded border-l-2 border-chart-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{indicator.name}</h3>
                    <p className="text-xs text-muted-foreground">{indicator.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddIndicator(indicator, "fundamental")}
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

  // Technical indicators — grouped categorized layout
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-3">
          <DialogHeader>
            <DialogTitle className="font-mono text-foreground text-base">
              Add Technical Indicator
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              52 indicators across 10 categories
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search indicators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm font-mono bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-[#d07225]/40"
            />
          </div>
        </div>

        {/* Category list */}
        <div className="max-h-[420px] overflow-y-auto px-4 pb-5">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No indicators match your search
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredCategories.map((category) => {
                const Icon = category.icon
                const isExpanded = effectiveExpanded.has(category.id)

                return (
                  <div key={category.id}>
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: "#d07225" }} />
                      <span className="text-sm font-medium text-foreground font-mono flex-1 text-left">
                        {category.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums mr-1">
                        {category.indicators.length}
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>

                    {/* Expanded indicator list */}
                    {isExpanded && (
                      <div className="ml-3 mb-1.5 border-l-[1.5px] pl-5" style={{ borderColor: "rgba(208, 114, 37, 0.15)" }}>
                        {category.indicators.map((indicator, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 px-2.5 -ml-1 rounded hover:bg-secondary/60 transition-colors group"
                          >
                            <div className="min-w-0 flex-1 mr-3">
                              <div className="text-[13px] font-mono text-foreground leading-tight">
                                {indicator.name}
                              </div>
                              <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                                {indicator.description}
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddIndicator(indicator, "technical")}
                              className="flex-shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-md border border-transparent text-muted-foreground opacity-0 group-hover:opacity-100 hover:border-[#d07225]/30 hover:bg-[#d07225]/5 hover:text-[#d07225] transition-all"
                              title={`Add ${indicator.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
