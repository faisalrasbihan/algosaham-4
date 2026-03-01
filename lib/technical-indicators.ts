export interface TechnicalIndicatorDefinition {
  name: string
  description: string
  params: Record<string, string | number>
}

export interface TechnicalIndicatorCategoryDefinition {
  id: string
  name: string
  indicators: TechnicalIndicatorDefinition[]
}

export const technicalIndicatorCategories: TechnicalIndicatorCategoryDefinition[] = [
  {
    id: "momentum",
    name: "Momentum",
    indicators: [
      { name: "RSI", description: "Relative Strength Index — oversold/overbought signals", params: { period: 14, oversold: 30, overbought: 70 } },
      { name: "MACD", description: "MACD line crosses above signal line", params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
      { name: "Stochastic", description: "Stochastic Oscillator %K crosses %D", params: { kPeriod: 14, dPeriod: 3, oversold: 20, overbought: 80 } },
    ],
  },
  {
    id: "moving-averages",
    name: "Moving Averages",
    indicators: [
      { name: "SMA Crossover", description: "Buy on Golden Cross (Short SMA > Long SMA)", params: { shortPeriod: 20, longPeriod: 50 } },
      { name: "SMA Trend", description: "Buy when Short SMA is above Long SMA", params: { shortPeriod: 20, longPeriod: 50 } },
      { name: "EMA Crossover", description: "Buy on Golden Cross (Short EMA > Long EMA)", params: { shortPeriod: 12, longPeriod: 26 } },
    ],
  },
  {
    id: "volatility",
    name: "Volatility",
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
    indicators: [
      { name: "ADX", description: "Average Directional Index — strong trend", params: { period: 14, threshold: 25 } },
      { name: "Parabolic SAR", description: "SAR dots flip below price", params: { afStart: 0.02, afStep: 0.02, afMax: 0.2 } },
      { name: "Supertrend", description: "Price crosses above Supertrend line", params: { period: 10, multiplier: 3 } },
    ],
  },
  {
    id: "candlestick",
    name: "Candlestick Patterns",
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
    indicators: [
      { name: "Pivot Points", description: "Price bouncing off support level", params: {} },
      { name: "Donchian Channel", description: "Breakout above Donchian High", params: { period: 20 } },
    ],
  },
  {
    id: "flow",
    name: "Flow Indicators",
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
    indicators: [
      { name: "Volatility Regime", description: "Volatility regime detection (low/high)", params: { period: 20, lookback: 60, lowThreshold: -0.5, highThreshold: 1.0, mode: "BOTH" } },
      { name: "Calendar Effect", description: "Month-end or seasonal effects", params: { mode: "MONTH_END", days: 3 } },
      { name: "Sector Relative Strength", description: "Sector outperforming the market", params: { period: 20, threshold: 0.0 } },
    ],
  },
]

export const technicalIndicatorCount = technicalIndicatorCategories.reduce(
  (count, category) => count + category.indicators.length,
  0,
)

export function technicalIndicatorNameToKey(name: string) {
  return `technical:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`
}

export function technicalIndicatorNameToApiType(name: string) {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "")
}
