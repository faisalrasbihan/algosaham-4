# Backtesting & Screening API Documentation

## Endpoints

### POST `/run_backtest`
Run a backtest simulation with the given strategy configuration.

### POST `/screen_stocks`  
Scan for stocks matching filters and generating buy signals.

Both endpoints use the same configuration structure.

---

## Configuration Structure

```json
{
  "backtestId": "my_strategy_001",
  "filters": { ... },
  "fundamentalIndicators": [ ... ],
  "technicalIndicators": [ ... ],
  "backtestConfig": { ... }
}
```

---

## Filters

| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `tickers` | string[] | Specific stock codes to include | `["BBCA", "BBRI"]` |
| `marketCap` | string[] | Market cap categories: `small` (<1T), `mid` (1-10T), `large` (≥10T IDR) | `["large", "mid"]` |
| `syariah` | boolean | Only include Syariah-compliant stocks | `true` |
| `minDailyValue` | number | Minimum daily traded value in IDR (liquidity filter) | `1000000000` |
| `sectors` | string[] | Industry sectors to include | `["Finance", "Consumer"]` |

---

## Fundamental Indicators

Filter stocks based on financial metrics. Use `min` and/or `max` to set bounds.

| Type | Description | Example |
|------|-------------|---------|
| `PE_RATIO` | Price to Earnings ratio - lower means cheaper relative to earnings | `{"type": "PE_RATIO", "max": 20}` |
| `PBV` | Price to Book Value - lower means cheaper relative to assets | `{"type": "PBV", "max": 3}` |
| `ROE` | Return on Equity (%) - higher means more profitable | `{"type": "ROE", "min": 15}` |
| `ROA` | Return on Assets (%) - higher means more efficient | `{"type": "ROA", "min": 5}` |
| `DE_RATIO` | Debt to Equity - lower means less leveraged/risky | `{"type": "DE_RATIO", "max": 1}` |
| `NPM` | Net Profit Margin (%) - higher means better margins | `{"type": "NPM", "min": 10}` |
| `EPS` | Earnings Per Share - higher means more profitable per share | `{"type": "EPS", "min": 100}` |
| `DIVIDEND_YIELD` | Dividend yield (%) - higher for income investors | `{"type": "DIVIDEND_YIELD", "min": 3}` |

---

## Technical Indicators

> **Note:** All indicators support `signalWindow` parameter (default: 3) - if a signal triggered within the last N days, it's still considered active.

### Moving Average Indicators

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `SMA_CROSSOVER` | Buy when short SMA crosses above long SMA (golden cross), sell on death cross | `shortPeriod` | 20 | Fast moving average period |
| | | `longPeriod` | 50 | Slow moving average period |
| `SMA_TREND` | Buy when short SMA is above long SMA (trend following, less sensitive than crossover) | `shortPeriod` | 20 | Fast moving average period |
| | | `longPeriod` | 50 | Slow moving average period |
| `EMA_CROSSOVER` | Like SMA crossover but EMA reacts faster to recent prices | `shortPeriod` | 12 | Fast EMA period |
| | | `longPeriod` | 26 | Slow EMA period |

```json
{"type": "SMA_CROSSOVER", "shortPeriod": 20, "longPeriod": 50}
```

### Momentum Indicators

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `RSI` | Relative Strength Index - buy when oversold, sell when overbought | `period` | 14 | Lookback period for calculation |
| | | `oversold` | 30 | Buy threshold (RSI below this) |
| | | `overbought` | 70 | Sell threshold (RSI above this) |
| `MACD` | Moving Average Convergence Divergence - buy when MACD crosses above signal line | `fastPeriod` | 12 | Fast EMA period |
| | | `slowPeriod` | 26 | Slow EMA period |
| | | `signalPeriod` | 9 | Signal line smoothing period |
| `STOCHASTIC` | Compares close to price range - buy when %K crosses %D in oversold zone | `kPeriod` | 14 | %K lookback period |
| | | `dPeriod` | 3 | %D smoothing period |
| | | `oversold` | 20 | Buy zone threshold |
| | | `overbought` | 80 | Sell zone threshold |

```json
{"type": "RSI", "period": 14, "oversold": 30, "overbought": 70}
```

### Volatility Indicators

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `BOLLINGER_BANDS` | Price channels based on standard deviation - buy at lower band, sell at upper | `period` | 20 | SMA period for middle band |
| | | `stdDev` | 2 | Number of standard deviations for bands |
| `ATR` | Average True Range - measures volatility, useful for position sizing (no direct signal) | `period` | 14 | Lookback period |
| `VOLATILITY_BREAKOUT` | Buy when current volatility exceeds historical average | `period` | 20 | Volatility calculation period |
| | | `multiplier` | 2 | Threshold = avg volatility × multiplier |

```json
{"type": "BOLLINGER_BANDS", "period": 20, "stdDev": 2}
```

### Volume Indicators

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `VOLUME_SMA` | Buy on volume spike above average (confirms momentum) | `period` | 20 | Volume average period |
| | | `threshold` | 1.5 | Volume must be ≥ threshold × average |
| `OBV` | On-Balance Volume - buy when OBV trends up (accumulation) | `period` | 20 | SMA period for OBV signal |
| `VWAP` | Volume Weighted Average Price - buy when price > VWAP | `period` | 20 | VWAP calculation period |
| `VOLUME_PRICE_TREND` | Combines price change with volume - buy when VPT trends up | `period` | 20 | SMA period for VPT signal |
| `ACCUMULATION_BASE` | Decline + tight consolidation + volume increase (turnaround setup) | `declinePeriod` | 60 | Days to measure prior decline |
| | | `minDeclinePct` | 30 | Min decline % to qualify |
| | | `basePeriod` | 20 | Days of base formation |
| | | `maxBaseRange` | 15 | Max base range % |
| | | `volumeIncreasePct` | 50 | Volume increase vs prior period |
| `BASE_BREAKOUT` | Breakout from tight trading range with volume confirmation | `basePeriod` | 30 | Days of base formation |
| | | `maxBaseRange` | 15 | Max base range % |
| | | `breakoutPct` | 2 | Min % above base high |
| | | `volumeMultiplier` | 1.5 | Volume must be ≥ multiplier × avg |
| `VOLUME_DRY_UP` | Decreasing volume indicating coiling before potential move | `period` | 20 | Lookback period |
| | | `dryUpThreshold` | 0.5 | Volume must be ≤ threshold × avg |
| | | `consecutiveDays` | 3 | Days of low volume required |
| `CLIMAX_VOLUME` | Extreme volume spike after decline (potential capitulation) | `period` | 20 | Volume average period |
| | | `climaxMultiplier` | 3.0 | Volume must be ≥ multiplier × avg |
| | | `priorDeclinePct` | 15 | Min decline before climax |
| | | `priorDeclineDays` | 20 | Days to measure prior decline |
| `ACCUMULATION_DISTRIBUTION` | A/D line rising above MA indicates buying pressure | `period` | 20 | MA period for A/D line |

```json
{"type": "ACCUMULATION_BASE", "declinePeriod": 60, "minDeclinePct": 30, "basePeriod": 20}
{"type": "BASE_BREAKOUT", "basePeriod": 30, "volumeMultiplier": 1.5}
```

### Trend Indicators

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `ADX` | Average Directional Index - buy when trend is strong AND bullish | `period` | 14 | ADX calculation period |
| | | `threshold` | 25 | Minimum ADX for "strong" trend |
| `PARABOLIC_SAR` | Stop and Reverse dots - buy when SAR flips below price | `afStart` | 0.02 | Starting acceleration factor |
| | | `afStep` | 0.02 | AF increment on new highs |
| | | `afMax` | 0.2 | Maximum acceleration factor |
| `SUPERTREND` | ATR-based trend line - buy when price crosses above | `period` | 10 | ATR calculation period |
| | | `multiplier` | 3 | ATR multiplier for band width |

```json
{"type": "ADX", "period": 14, "threshold": 25}
```

### Support/Resistance Indicators

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `PIVOT_POINTS` | Classic floor trader levels - buy at support bounce, sell at resistance | *(none)* | - | Uses previous day OHLC |
| `DONCHIAN_CHANNEL` | Price channel based on highest high/lowest low - buy on breakout | `period` | 20 | Channel lookback period |
| `KELTNER_CHANNEL` | EMA + ATR based channel - buy at lower channel (oversold) | `period` | 20 | EMA period for middle line |
| | | `atrPeriod` | 10 | ATR calculation period |
| | | `multiplier` | 2 | ATR multiplier for channel width |

```json
{"type": "DONCHIAN_CHANNEL", "period": 20}
```

### Candlestick Patterns (Single Candle)

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `DOJI` | Small body candle indicating indecision - bullish reversal after downtrend | `bodyThreshold` | 10 | Max body as % of total range |
| | | `trendPeriod` | 5 | Period to detect prior trend |
| `HAMMER` | Small body at top, long lower shadow - bullish reversal after downtrend | `shadowRatio` | 2 | Lower shadow must be ≥ ratio × body |
| | | `bodyMaxPct` | 35 | Max body as % of total range |
| | | `trendPeriod` | 5 | Period to detect prior downtrend |
| `INVERTED_HAMMER` | Small body at bottom, long upper shadow - bullish reversal after downtrend | `shadowRatio` | 2 | Upper shadow must be ≥ ratio × body |
| | | `bodyMaxPct` | 35 | Max body as % of total range |
| | | `trendPeriod` | 5 | Period to detect prior downtrend |
| `BULLISH_MARUBOZU` | Strong bullish candle with no/tiny shadows - strong momentum | `maxShadowPct` | 5 | Max shadow as % of range |
| | | `minBodyPct` | 90 | Min body as % of range |

```json
{"type": "HAMMER", "shadowRatio": 2, "bodyMaxPct": 35, "trendPeriod": 5}
```

### Candlestick Patterns (Multi-Candle)

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `BULLISH_ENGULFING` | Bullish candle completely engulfs previous bearish candle - strong reversal | *(none)* | - | Auto-detected pattern |
| `BULLISH_HARAMI` | Small bullish candle inside previous large bearish candle - reversal signal | *(none)* | - | Auto-detected pattern |
| `PIERCING_LINE` | Bullish candle opens below previous low, closes above midpoint | `minPenetration` | 50 | Min % penetration into previous body |
| `TWEEZER_BOTTOM` | Two candles with matching lows - support confirmed | `tolerance` | 0.1 | Price tolerance % for matching lows |
| `MORNING_STAR` | 3-candle bullish reversal: bearish → small → bullish | *(none)* | - | Auto-detected pattern |
| `THREE_WHITE_SOLDIERS` | Three consecutive strong bullish candles - strong trend | `minBodyPct` | 60 | Min body as % of range for each candle |
| `THREE_INSIDE_UP` | Bullish Harami + confirmation candle closing higher | *(none)* | - | Auto-detected pattern |
| `RISING_THREE_METHODS` | Large bullish → 3 small bearish → large bullish (continuation) | *(none)* | - | Auto-detected pattern |

```json
{"type": "PIERCING_LINE", "minPenetration": 50}
{"type": "THREE_WHITE_SOLDIERS", "minBodyPct": 60}
```

### Chart Patterns

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `FALLING_WEDGE` | Converging downward trendlines - bullish breakout above resistance | `lookbackPeriod` | 30 | Bars to look back for pattern |
| | | `peakWindow` | 5 | Window for peak/trough detection |
| | | `minTouches` | 2 | Min touches per trendline |
| | | `minRSquared` | 0.7 | Min R² for valid trendline fit |
| `DOUBLE_BOTTOM` | W-shaped pattern - buy on breakout above neckline | `lookbackPeriod` | 40 | Bars to look back for pattern |
| | | `peakWindow` | 5 | Window for peak/trough detection |
| | | `priceTolerance` | 3 | Max % difference between bottoms |
| | | `minTroughDistance` | 10 | Min bars between the two troughs |
| `BULL_FLAG` | Strong upward move + consolidation - buy on breakout | `flagpoleMovePercent` | 5 | Min % move for flagpole |
| | | `flagpoleMaxBars` | 10 | Max bars for flagpole formation |
| | | `flagMinBars` | 5 | Min bars for flag consolidation |
| | | `flagMaxBars` | 15 | Max bars for flag consolidation |
| | | `maxFlagRetracement` | 50 | Max % retracement during flag |
| `ASCENDING_TRIANGLE` | Flat resistance + rising support - buy on resistance breakout | `lookbackPeriod` | 30 | Bars to look back for pattern |
| | | `peakWindow` | 5 | Window for peak/trough detection |
| | | `minTouches` | 2 | Min touches on resistance line |
| | | `resistanceTolerance` | 1.5 | Max % variance in resistance level |
| `CUP_AND_HANDLE` | U-shaped recovery + handle consolidation, breakout signals continuation | `cupMinBars` | 20 | Min bars for cup formation |
| | | `cupMaxBars` | 60 | Max bars for cup formation |
| | | `handleMinBars` | 5 | Min bars for handle |
| | | `handleMaxBars` | 15 | Max bars for handle |
| | | `maxHandleRetracement` | 50 | Max handle pullback % of cup depth |
| | | `cupDepthMinPct` | 15 | Min cup depth % |
| | | `cupDepthMaxPct` | 50 | Max cup depth % |
| `INVERSE_HEAD_SHOULDERS` | Three troughs with middle lowest, neckline breakout signals reversal | `lookbackPeriod` | 50 | Bars to look back |
| | | `peakWindow` | 5 | Window for peak/trough detection |
| | | `shoulderTolerance` | 5 | Max % diff between shoulders |
| | | `minHeadDepth` | 3 | Min % head below shoulders |
| `ROUNDING_BOTTOM` | Gradual U-shaped recovery showing slow accumulation | `lookbackPeriod` | 40 | Bars for pattern detection |
| | | `minCurvature` | 0.6 | Min curvature score |
| | | `breakoutPct` | 2 | Min % above pattern high |

```json
{"type": "DOUBLE_BOTTOM", "lookbackPeriod": 40, "priceTolerance": 3}
{"type": "CUP_AND_HANDLE", "cupMinBars": 20, "cupMaxBars": 60}
```

### Chart Patterns - Imminent (Pre-breakout Entry)

These detect patterns that have formed but haven't broken out yet, allowing earlier entry:

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `BULL_FLAG_IMMINENT` | Bull flag formed, price near breakout level | `flagpoleMovePercent` | 5 | Min % move for flagpole |
| | | `flagpoleMaxBars` | 10 | Max bars for flagpole |
| | | `flagMinBars` | 3 | Min bars for flag |
| | | `flagMaxBars` | 12 | Max bars for flag |
| | | `maxFlagRetracement` | 50 | Max % retracement |
| | | `proximityPct` | 3 | How close to breakout level |
| `FALLING_WEDGE_IMMINENT` | Falling wedge formed, price near resistance | `lookbackPeriod` | 25 | Bars to look back |
| | | `peakWindow` | 5 | Window for peak/trough |
| | | `minTouches` | 2 | Min trendline touches |
| | | `minRSquared` | 0.65 | Min R² for trendline |
| | | `proximityPct` | 3 | How close to resistance |
| `DOUBLE_BOTTOM_IMMINENT` | Double bottom formed, price near neckline | `lookbackPeriod` | 40 | Bars to look back |
| | | `peakWindow` | 5 | Window for peak/trough |
| | | `priceTolerance` | 3 | Max % diff between bottoms |
| | | `minTroughDistance` | 10 | Min bars between troughs |
| | | `proximityPct` | 3 | How close to neckline |
| `ASCENDING_TRIANGLE_IMMINENT` | Ascending triangle formed, price near resistance | `lookbackPeriod` | 30 | Bars to look back |
| | | `peakWindow` | 5 | Window for peak/trough |
| | | `minTouches` | 2 | Min resistance touches |
| | | `resistanceTolerance` | 1.5 | Max % resistance variance |
| | | `proximityPct` | 2 | How close to resistance |

```json
{"type": "BULL_FLAG_IMMINENT", "proximityPct": 3}
{"type": "DOUBLE_BOTTOM_IMMINENT", "lookbackPeriod": 40, "proximityPct": 3}
```

### Foreign Flow Indicators (IDX-Specific)

Based on Net Buy Sell Asing (NBSA) data - foreign investor activity:

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `FOREIGN_FLOW` | Sustained foreign buying (accumulation) or sell-to-buy reversal | `period` | 5 | Lookback period |
| | | `flowType` | "accumulation" | `"accumulation"` or `"reversal"` |
| | | `minNetBuy` | 1000000000 | Min total net buy (IDR) |
| | | `consecutiveDays` | 3 | Days of net buying required |
| `FOREIGN_REVERSAL` | Foreign investors flip from selling to buying | `sellPeriod` | 10 | Days to measure prior selling |
| | | `buyPeriod` | 5 | Days to measure recent buying |
| | | `minSellValue` | 5000000000 | Min prior selling (5B IDR) |
| | | `minBuyValue` | 2000000000 | Min recent buying (2B IDR) |

```json
{"type": "FOREIGN_FLOW", "period": 5, "flowType": "accumulation", "minNetBuy": 1000000000}
{"type": "FOREIGN_REVERSAL", "sellPeriod": 10, "buyPeriod": 5}
```

### ARA/ARB Indicators (IDX-Specific)

Based on Indonesian Auto-Reject price limits:

| Indicator | Description | Parameter | Default | Explanation |
|-----------|-------------|-----------|---------|-------------|
| `ARA_RECOVERY` | Stock hit upper price limit (ARA) - strong momentum play | `lookbackDays` | 3 | Days to look back for ARA |
| | | `minAraCount` | 1 | Min ARA occurrences |
| | | `araThresholdPct` | 90 | % of limit to consider near-ARA |
| `ARB_RECOVERY` | Stock hit lower limit (ARB), now recovering - bounce play | `lookbackDays` | 5 | Days to look back for ARB |
| | | `recoveryDays` | 2 | Days of recovery required |
| | | `arbThresholdPct` | 90 | % of limit to consider near-ARB |
| | | `minRecoveryPct` | 5 | Min bounce from low |
| `ARA_BREAKOUT` | Breakout continuation after ARA + consolidation | `araLookback` | 10 | Days to look for prior ARA |
| | | `consolidationDays` | 3 | Min consolidation days |
| | | `breakoutPct` | 2 | Min % above consolidation high |

> **IDX Price Limits:**
> - Price < 50: ±35%
> - Price 50-200: ±25%
> - Price > 200: ±20%

```json
{"type": "ARA_RECOVERY", "lookbackDays": 3, "minAraCount": 1}
{"type": "ARB_RECOVERY", "lookbackDays": 5, "recoveryDays": 2, "minRecoveryPct": 5}
```

---

## Backtest Configuration

```json
"backtestConfig": {
  "initialCapital": 100000000,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "tradingCosts": {
    "brokerFee": 0.15,
    "sellFee": 0.15,
    "minimumFee": 1000
  },
  "portfolio": {
    "positionSizePercent": 20,
    "minPositionPercent": 5,
    "maxPositions": 5
  },
  "riskManagement": {
    "stopLoss": {
      "method": "FIXED",
      "percent": 5
    },
    "takeProfit": {
      "method": "FIXED",
      "percent": 10
    },
    "maxHoldingDays": 30
  }
}
```

| Section | Parameter | Default | Description |
|---------|-----------|---------|-------------|
| *(root)* | `initialCapital` | 100000000 | Starting capital in IDR |
| | `startDate` | - | Backtest start date (YYYY-MM-DD) |
| | `endDate` | - | Backtest end date (YYYY-MM-DD) |
| **tradingCosts** | `brokerFee` | 0.15 | Buy commission percentage |
| | `sellFee` | 0.15 | Sell commission percentage |
| | `minimumFee` | 1000 | Minimum fee per transaction (IDR) |
| **portfolio** | `positionSizePercent` | 20 | Max % of portfolio per position |
| | `minPositionPercent` | 5 | Min % of portfolio to open a position |
| | `maxPositions` | 5 | Maximum concurrent positions |
| **riskManagement** | `stopLoss` | - | Stop loss configuration (see below) |
| | `takeProfit` | - | Take profit configuration (see below) |
| | `maxHoldingDays` | 30 | Force sell after X days |

### Risk Management Methods

#### Stop Loss Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `FIXED` | Fixed percentage below entry | `percent`: Stop loss % (e.g., 5) |
| `ATR` | Volatility-adaptive using ATR | `atrMultiplier`: ATR × multiplier (e.g., 2.0), `atrPeriod`: ATR period (default 14) |

```json
// Fixed 5% stop loss
"stopLoss": {"method": "FIXED", "percent": 5}

// ATR-based: entry - (ATR × 2)
"stopLoss": {"method": "ATR", "atrMultiplier": 2.0, "atrPeriod": 14}
```

#### Take Profit Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `FIXED` | Fixed percentage above entry | `percent`: Take profit % (e.g., 10) |
| `RISK_REWARD` | Based on stop loss distance × ratio | `riskRewardRatio`: R:R ratio (e.g., 2.0 for 1:2) |

```json
// Fixed 10% take profit
"takeProfit": {"method": "FIXED", "percent": 10}

// Risk-reward: if SL is 5%, TP = 5% × 2 = 10%
"takeProfit": {"method": "RISK_REWARD", "riskRewardRatio": 2.0}
```

#### Example Combinations

```json
// Conservative: Fixed 5% SL, 10% TP
"riskManagement": {
  "stopLoss": {"method": "FIXED", "percent": 5},
  "takeProfit": {"method": "FIXED", "percent": 10},
  "maxHoldingDays": 30
}

// Volatility-adaptive: ATR-based SL, 2:1 R:R TP
"riskManagement": {
  "stopLoss": {"method": "ATR", "atrMultiplier": 2.0, "atrPeriod": 14},
  "takeProfit": {"method": "RISK_REWARD", "riskRewardRatio": 2.0},
  "maxHoldingDays": 21
}

// Tight scalp: 3% SL, 1.5:1 R:R, short holding
"riskManagement": {
  "stopLoss": {"method": "FIXED", "percent": 3},
  "takeProfit": {"method": "RISK_REWARD", "riskRewardRatio": 1.5},
  "maxHoldingDays": 7
}
```

---

## Response Formats

### Backtest Response

```json
{
  "summary": {
    "initialCapital": 100000000,
    "finalValue": 112500000,
    "totalReturn": 12.5,
    "annualizedReturn": 15.2,
    "benchmarkReturn": 8.5,
    "totalTrades": 45,
    "closedTrades": 40,
    "winningTrades": 25,
    "losingTrades": 12,
    "breakevenTrades": 3,
    "winRate": 62.5,
    "maxDrawdown": -8.3,
    "sharpeRatio": 1.45,
    "averageHoldingDays": 12.5,
    "bestTrade": {
      "ticker": "BBCA",
      "return": 18.5
    },
    "worstTrade": {
      "ticker": "ASII",
      "return": -7.2
    }
  },
  "trades": [
    {
      "date": "2024-03-15",
      "ticker": "BBCA",
      "companyName": "Bank Central Asia",
      "action": "BUY",
      "quantity": 500,
      "price": 9850,
      "value": 4925000,
      "portfolioValue": 100000000,
      "reason": "RSI(14) oversold (28.5)"
    },
    {
      "date": "2024-03-28",
      "ticker": "BBCA",
      "companyName": "Bank Central Asia",
      "action": "SELL",
      "quantity": 500,
      "price": 10500,
      "value": 5250000,
      "portfolioValue": 100325000,
      "reason": "TAKE_PROFIT",
      "profitLoss": 325000,
      "profitLossPercent": 6.6,
      "holdingDays": 13
    }
  ],
  "dailyPortfolio": [
    {
      "date": "2024-03-15",
      "portfolioValue": 100000000,
      "portfolioNormalized": 100.0,
      "ihsgValue": 100.0,
      "lq45Value": 100.0,
      "drawdown": 0.0
    }
  ],
  "monthlyPerformance": [
    {
      "month": "Mar 24",
      "winRate": 75.0,
      "returns": 3.2,
      "benchmarkReturns": 1.8,
      "probability": 0.72,
      "tradesCount": 8
    }
  ],
  "recentSignals": {
    "scannedDays": 5,
    "signals": [
      {
        "ticker": "BBCA",
        "companyName": "Bank Central Asia",
        "date": "2024-03-28",
        "daysAgo": 0,
        "signal": "BUY",
        "reasons": ["RSI(14) oversold", "SMA(20,50) golden cross"],
        "price": 9850,
        "sector": "Finance",
        "marketCap": "large"
      }
    ],
    "summary": {
      "totalSignals": 12,
      "uniqueStocks": 8,
      "byDay": {
        "2024-03-28": 4,
        "2024-03-27": 3,
        "2024-03-26": 5
      }
    }
  },
  "currentPortfolio": {
    "cash": 50000000.0,
    "totalValue": 112500000.0,
    "openPositionsValue": 62500000.0,
    "openPositionsCount": 3,
    "positions": [
      {
        "ticker": "BBRI",
        "companyName": "Bank Rakyat Indonesia",
        "quantity": 5000,
        "entryDate": "2024-03-20",
        "entryPrice": 5400,
        "currentPrice": 5650,
        "marketValue": 28250000.0,
        "unrealizedPnL": 1250000.0,
        "unrealizedPnLPercent": 4.63,
        "holdingDays": 8
      }
    ]
  }
}
```

#### Summary Fields

| Field | Description |
|-------|-------------|
| `initialCapital` | Starting capital in IDR |
| `finalValue` | Ending portfolio value in IDR (cash + open positions at market) |
| `totalReturn` | Total return percentage |
| `annualizedReturn` | Return annualized to 252 trading days |
| `benchmarkReturn` | IHSG return over same period (for comparison) |
| `totalTrades` | Total number of trades (buys + sells) |
| `closedTrades` | Number of completed round-trips (sells only) |
| `winningTrades` | Trades with positive P&L |
| `losingTrades` | Trades with negative P&L |
| `breakevenTrades` | Trades with zero P&L |
| `winRate` | Percentage of winning trades |
| `maxDrawdown` | Largest peak-to-trough decline (%) |
| `sharpeRatio` | Risk-adjusted return (higher = better) |
| `averageHoldingDays` | Average days positions were held |
| `bestTrade` | Best performing trade: `{ "ticker": string, "return": number }` |
| `worstTrade` | Worst performing trade: `{ "ticker": string, "return": number }` |

#### Trade Fields

| Field | Description |
|-------|-------------|
| `date` | Trade execution date (YYYY-MM-DD) |
| `ticker` | Stock ticker symbol |
| `companyName` | Company name |
| `action` | `"BUY"` or `"SELL"` |
| `quantity` | Number of shares (always multiple of 100 — IDX lot size) |
| `price` | Execution price per share |
| `value` | Total trade value including fees (BUY: cost; SELL: net proceeds) |
| `portfolioValue` | Portfolio value after trade |
| `reason` | Signal reason (BUY) or exit reason: `"STOP_LOSS"`, `"TAKE_PROFIT"`, `"MAX_HOLDING_DAYS"` (SELL) |
| `profitLoss` | P&L in IDR (SELL only) |
| `profitLossPercent` | P&L percentage (SELL only) |
| `holdingDays` | Days position was held (SELL only) |

#### Daily Portfolio Fields

| Field | Description |
|-------|-------------|
| `date` | Date (YYYY-MM-DD) |
| `portfolioValue` | Total portfolio value in IDR (cash + mark-to-market positions) |
| `portfolioNormalized` | Portfolio value normalized to 100 at start |
| `ihsgValue` | IHSG index normalized to 100 at start (`null` if unavailable) |
| `lq45Value` | LQ45 index normalized to 100 at start (`null` if unavailable) |
| `drawdown` | Current drawdown from peak (%) |

#### Monthly Performance Fields

| Field | Description |
|-------|-------------|
| `month` | Month label (e.g., `"Mar 24"`) |
| `winRate` | Win rate for trades closed that month (%) |
| `returns` | Portfolio return for the month (%) |
| `benchmarkReturns` | IHSG return for the month (%) |
| `probability` | Combined score: `winRate * 0.6 + returnComponent * 0.4` |
| `tradesCount` | Number of trades closed that month |

#### Recent Signals Fields

Buy signals from the last 5 trading days of the backtest period.

| Field | Description |
|-------|-------------|
| `scannedDays` | Number of recent trading days scanned (5) |
| `signals[]` | Array of signal objects (sorted by `daysAgo` then `ticker`) |
| `signals[].ticker` | Stock ticker symbol |
| `signals[].companyName` | Company name |
| `signals[].date` | Date signal was generated (YYYY-MM-DD) |
| `signals[].daysAgo` | 0 = most recent trading day, 1 = day before, etc. |
| `signals[].signal` | Always `"BUY"` |
| `signals[].reasons` | Array of signal reason strings (e.g., `["RSI(14) oversold", "SMA golden cross"]`) |
| `signals[].price` | Closing price when signal triggered |
| `signals[].sector` | Stock sector |
| `signals[].marketCap` | Market cap group: `"small"`, `"mid"`, or `"large"` |
| `summary.totalSignals` | Total buy signals in scanned period |
| `summary.uniqueStocks` | Number of distinct tickers with signals |
| `summary.byDay` | Object mapping date string to signal count per day |

#### Current Portfolio Fields

Snapshot of open (unsold) positions at the end of the backtest period.

| Field | Description |
|-------|-------------|
| `cash` | Remaining cash balance in IDR |
| `totalValue` | Cash + all open positions at market value (matches `summary.finalValue`) |
| `openPositionsValue` | Sum of all position market values |
| `openPositionsCount` | Number of open positions |
| `positions[]` | Array of position objects (sorted by `marketValue` descending) |
| `positions[].ticker` | Stock ticker symbol |
| `positions[].companyName` | Company name |
| `positions[].quantity` | Number of shares held |
| `positions[].entryDate` | Date position was opened (YYYY-MM-DD) |
| `positions[].entryPrice` | Buy price per share |
| `positions[].currentPrice` | Last trading day's closing price |
| `positions[].marketValue` | Current value: `quantity × currentPrice` |
| `positions[].unrealizedPnL` | Unrealized P&L: `(currentPrice - entryPrice) × quantity` |
| `positions[].unrealizedPnLPercent` | Unrealized P&L: `(currentPrice / entryPrice - 1) × 100` |
| `positions[].holdingDays` | Days since entry date |

---

### Screening Response

```json
{
  "totalStocks": 8,
  "screened": [
    {
      "ticker": "BBCA",
      "companyName": "Bank Central Asia",
      "date": "2024-12-27",
      "fundamentals": {
        "marketCapGroup": "large",
        "isSyariah": 0,
        "dailyValue": 1500000000,
        "sector": "Finance",
        "peRatio": 18.5,
        "pbv": 4.2,
        "roe": 21.3,
        "deRatio": 0.8
      },
      "technicals": {
        "buySignal": true,
        "reasons": "RSI(14) oversold (28.5); SMA(20,50) golden cross"
      },
      "indicators": {
        "RSI_14": 28.5,
        "SMA_20": 9750,
        "SMA_50": 9600
      }
    }
  ],
  "summary": {
    "totalFiltered": 850,
    "passedFilters": 150,
    "passedFundamentals": 45,
    "passedTechnicals": 8
  }
}
```

#### Screening Summary Fields

| Field | Description |
|-------|-------------|
| `totalFiltered` | Total stocks before any filters |
| `passedFilters` | Stocks passing market cap/sector/etc filters |
| `passedFundamentals` | Stocks also passing fundamental criteria |
| `passedTechnicals` | Final count with active buy signals |

---

## Complete Example

```json
{
  "backtestId": "momentum_v1",
  "filters": {
    "marketCap": ["large", "mid"],
    "minDailyValue": 1000000000
  },
  "fundamentalIndicators": [
    {"type": "PE_RATIO", "max": 20},
    {"type": "ROE", "min": 15}
  ],
  "technicalIndicators": [
    {"type": "RSI", "period": 14, "oversold": 30, "overbought": 70},
    {"type": "SMA_CROSSOVER", "shortPeriod": 20, "longPeriod": 50}
  ],
  "backtestConfig": {
    "initialCapital": 100000000,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "tradingCosts": {
      "brokerFee": 0.15,
      "sellFee": 0.15,
      "minimumFee": 1000
    },
    "portfolio": {
      "positionSizePercent": 20,
      "minPositionPercent": 5,
      "maxPositions": 5
    },
    "riskManagement": {
      "stopLoss": {"method": "ATR", "atrMultiplier": 2.0, "atrPeriod": 14},
      "takeProfit": {"method": "RISK_REWARD", "riskRewardRatio": 2.0},
      "maxHoldingDays": 21
    }
  }
}
```

---

## Signal Logic

When multiple technical indicators are configured, signals are combined using **AND logic**:
- All indicators must agree for a buy signal to trigger
- The `signalWindow` parameter (default: 3) allows signals that triggered within the last N days to still be considered active, helping multiple indicators align even if they don't trigger on the exact same day

---

## Indicator Summary

| Category | Count | Indicators |
|----------|-------|------------|
| Moving Average | 3 | SMA_CROSSOVER, SMA_TREND, EMA_CROSSOVER |
| Momentum | 3 | RSI, MACD, STOCHASTIC |
| Volatility | 3 | BOLLINGER_BANDS, ATR, VOLATILITY_BREAKOUT |
| Volume | 9 | VOLUME_SMA, OBV, VWAP, VOLUME_PRICE_TREND, ACCUMULATION_BASE, BASE_BREAKOUT, VOLUME_DRY_UP, CLIMAX_VOLUME, ACCUMULATION_DISTRIBUTION |
| Trend | 3 | ADX, PARABOLIC_SAR, SUPERTREND |
| Support/Resistance | 3 | PIVOT_POINTS, DONCHIAN_CHANNEL, KELTNER_CHANNEL |
| Candlestick (Single) | 4 | DOJI, HAMMER, INVERTED_HAMMER, BULLISH_MARUBOZU |
| Candlestick (Multi) | 8 | BULLISH_ENGULFING, BULLISH_HARAMI, PIERCING_LINE, TWEEZER_BOTTOM, MORNING_STAR, THREE_WHITE_SOLDIERS, THREE_INSIDE_UP, RISING_THREE_METHODS |
| Chart Pattern | 7 | FALLING_WEDGE, DOUBLE_BOTTOM, BULL_FLAG, ASCENDING_TRIANGLE, CUP_AND_HANDLE, INVERSE_HEAD_SHOULDERS, ROUNDING_BOTTOM |
| Chart Pattern (Imminent) | 4 | BULL_FLAG_IMMINENT, FALLING_WEDGE_IMMINENT, DOUBLE_BOTTOM_IMMINENT, ASCENDING_TRIANGLE_IMMINENT |
| Foreign Flow (IDX) | 2 | FOREIGN_FLOW, FOREIGN_REVERSAL |
| ARA/ARB (IDX) | 3 | ARA_RECOVERY, ARB_RECOVERY, ARA_BREAKOUT |
| **Total** | **52** | |