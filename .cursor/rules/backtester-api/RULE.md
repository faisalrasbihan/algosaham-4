---
description: Detailed documentation for Backtesting and Stock Screening engines, including indicator parameters.
globs: lib/backtest/**/*, app/api/run_backtest/**/*, components/backtest-strategy-builder.tsx
alwaysApply: false
---

# Backtester & Screening API Documentation

## Overview

This API provides two main functionalities:
1. **Backtesting** - Simulate trading strategies on historical data
2. **Screening** - Find stocks matching specific criteria

Both endpoints use the same indicator and filter system, making it easy to screen for stocks and then backtest strategies on them.

---

## Endpoints

### POST `/run_backtest`

Run a backtest simulation with the given strategy configuration.

**Request Body:**
```json
{
  "config": {
    "backtestId": "my_strategy_001",
    "filters": { ... },
    "fundamentalIndicators": [ ... ],
    "technicalIndicators": [ ... ],
    "backtestConfig": { ... }
  }
}
```

**Response:**
```json
{
  "summary": {
    "initialCapital": 100000000,
    "finalValue": 112500000,
    "totalReturn": 12.5,
    "annualizedReturn": 15.2,
    "totalTrades": 45,
    "winRate": 62.5,
    "maxDrawdown": -8.3,
    "sharpeRatio": 1.45
  },
  "trades": [ ... ],
  "dailyPortfolio": [ ... ],
  "monthlyPerformance": [ ... ]
}
```

---

### POST `/screen_stocks`

Screen stocks based on filters and indicators.

**Request Body:**
```json
{
  "config": {
    "screeningId": "value_momentum_screen",
    "filters": { ... },
    "fundamentalIndicators": [ ... ],
    "technicalIndicators": [ ... ]
  }
}
```

**Response:**
```json
{
  "totalStocks": 15,
  "screened": [
    {
      "ticker": "BBCA",
      "companyName": "Bank Central Asia",
      "fundamentals": { "peRatio": 18.5, "roe": 21.2 },
      "technicals": { "buySignal": true, "reasons": "RSI(14) oversold" }
    }
  ],
  "summary": {
    "totalFiltered": 850,
    "passedFilters": 120,
    "passedFundamentals": 45,
    "passedTechnicals": 15
  }
}
```

---

## Configuration Structure

### Complete Configuration Example

```json
{
  "backtestId": "momentum_strategy_v1",
  
  "filters": {
    "tickers": ["BBCA", "BBRI", "BMRI"],
    "marketCap": ["large", "mid"],
    "syariah": false,
    "minDailyValue": 1000000000,
    "sectors": ["Finance", "Consumer"]
  },
  
  "fundamentalIndicators": [
    { "type": "PE_RATIO", "max": 20 },
    { "type": "ROE", "min": 15 },
    { "type": "DE_RATIO", "max": 1.5 }
  ],
  
  "technicalIndicators": [
    { "type": "RSI", "period": 14, "oversold": 30, "overbought": 70 },
    { "type": "SMA_CROSSOVER", "shortPeriod": 20, "longPeriod": 50 }
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
      "stopLossPercent": 5,
      "takeProfitPercent": 10,
      "maxHoldingDays": 30
    }
  }
}
```

---

## Filters

Filters reduce the universe of stocks before applying indicators.

| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `tickers` | string[] | Specific stock codes | `["BBCA", "BBRI"]` |
| `marketCap` | string[] | Market cap categories | `["large", "mid"]` |
| `syariah` | boolean | Syariah-compliant only | `true` |
| `minDailyValue` | number | Min daily traded value (IDR) | `1000000000` |
| `sectors` | string[] | Industry sectors | `["Finance"]` |

### Market Cap Categories

| Category | Market Cap Range (IDR) |
|----------|----------------------|
| `large` | ≥ 10 Trillion |
| `mid` | 1-10 Trillion |
| `small` | < 1 Trillion |

---

## Fundamental Indicators

Filter stocks based on financial metrics.

| Type | Description | Typical Range | Example Config |
|------|-------------|---------------|----------------|
| `PE_RATIO` | Price to Earnings | 5-30 | `{"type": "PE_RATIO", "max": 20}` |
| `PBV` | Price to Book Value | 0.5-5 | `{"type": "PBV", "max": 3}` |
| `ROE` | Return on Equity (%) | 5-30 | `{"type": "ROE", "min": 15}` |
| `ROA` | Return on Assets (%) | 2-15 | `{"type": "ROA", "min": 5}` |
| `DE_RATIO` | Debt to Equity | 0-3 | `{"type": "DE_RATIO", "max": 1}` |
| `NPM` | Net Profit Margin (%) | 5-30 | `{"type": "NPM", "min": 10}` |
| `EPS` | Earnings Per Share | varies | `{"type": "EPS", "min": 100}` |

**Usage:**
- `min`: Stock must have value ≥ this
- `max`: Stock must have value ≤ this
- Both can be combined: `{"type": "PE_RATIO", "min": 5, "max": 20}`

---

## Technical Indicators

### Signal Window (All Indicators)

All indicators support `signalWindow` parameter:
- **Default: 3 days**
- If a signal triggered in the last N days, it's still considered active
- Set to 1 for same-day only signals

```json
{ "type": "RSI", "period": 14, "signalWindow": 5 }
```

---

## Indicator Categories

### 📈 Moving Average Indicators (3)

Trend-following indicators based on price averages.

| Indicator | Description | Buy Signal |
|-----------|-------------|------------|
| **SMA_CROSSOVER** | Golden/Death cross signals | Short SMA crosses above Long SMA |
| **SMA_TREND** | Trend following | Short SMA is above Long SMA |
| **EMA_CROSSOVER** | Faster EMA crossover | Short EMA crosses above Long EMA |

#### SMA_CROSSOVER

```json
{
  "type": "SMA_CROSSOVER",
  "shortPeriod": 20,
  "longPeriod": 50,
  "signalWindow": 3
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `shortPeriod` | 20 | Fast moving average period |
| `longPeriod` | 50 | Slow moving average period |

#### SMA_TREND

```json
{
  "type": "SMA_TREND",
  "shortPeriod": 20,
  "longPeriod": 50,
  "signalWindow": 3
}
```

**Difference from SMA_CROSSOVER:**
- SMA_CROSSOVER: Only signals when the cross happens
- SMA_TREND: Signals continuously while short > long

#### EMA_CROSSOVER

```json
{
  "type": "EMA_CROSSOVER",
  "shortPeriod": 12,
  "longPeriod": 26,
  "signalWindow": 3
}
```

---

### 🔥 Momentum Indicators (3)

Measure the rate of price change and overbought/oversold conditions.

| Indicator | Description | Buy Signal |
|-----------|-------------|------------|
| **RSI** | Relative Strength Index | RSI < oversold (30) |
| **MACD** | Moving Average Convergence Divergence | MACD crosses above signal |
| **STOCHASTIC** | Stochastic Oscillator | %K crosses %D in oversold zone |

#### RSI

```json
{
  "type": "RSI",
  "period": 14,
  "oversold": 30,
  "overbought": 70,
  "signalWindow": 3
}
```

#### MACD

```json
{
  "type": "MACD",
  "fastPeriod": 12,
  "slowPeriod": 26,
  "signalPeriod": 9,
  "signalWindow": 3
}
```

#### STOCHASTIC

```json
{
  "type": "STOCHASTIC",
  "kPeriod": 14,
  "dPeriod": 3,
  "oversold": 20,
  "overbought": 80,
  "signalWindow": 3
}
```

---

### 📉 Volatility Indicators (3)

Measure price volatility and potential breakouts.

| Indicator | Description | Buy Signal |
|-----------|-------------|------------|
| **BOLLINGER_BANDS** | Volatility bands around SMA | Price touches lower band |
| **ATR** | Average True Range | No direct signal (volatility measure) |
| **VOLATILITY_BREAKOUT** | Detects volatility spikes | Volatility exceeds threshold |

#### BOLLINGER_BANDS

```json
{
  "type": "BOLLINGER_BANDS",
  "period": 20,
  "stdDev": 2,
  "signalWindow": 3
}
```

#### ATR

```json
{
  "type": "ATR",
  "period": 14
}
```

**Use for:** Position sizing and stop-loss calculation (no direct signal).

#### VOLATILITY_BREAKOUT

```json
{
  "type": "VOLATILITY_BREAKOUT",
  "period": 20,
  "multiplier": 2,
  "signalWindow": 3
}
```

---

### 📦 Volume Indicators (4)

Analyze trading volume to confirm price movements.

| Indicator | Description | Buy Signal |
|-----------|-------------|------------|
| **VOLUME_SMA** | Volume spike detection | Volume ≥ threshold × average |
| **OBV** | On-Balance Volume | OBV above its SMA |
| **VWAP** | Volume-Weighted Average Price | Price above VWAP |
| **VOLUME_PRICE_TREND** | VPT indicator | VPT above its SMA |

#### VOLUME_SMA

```json
{
  "type": "VOLUME_SMA",
  "period": 20,
  "threshold": 1.5,
  "signalWindow": 3
}
```

#### OBV

```json
{
  "type": "OBV",
  "period": 20,
  "signalWindow": 3
}
```

#### VWAP

```json
{
  "type": "VWAP",
  "period": 20,
  "signalWindow": 3
}
```

#### VOLUME_PRICE_TREND

```json
{
  "type": "VOLUME_PRICE_TREND",
  "period": 20,
  "signalWindow": 3
}
```

---

### 📈 Trend Indicators (3)

Identify trend direction and strength.

| Indicator | Description | Buy Signal |
|-----------|-------------|------------|
| **ADX** | Average Directional Index | ADX > threshold AND +DI > -DI |
| **PARABOLIC_SAR** | Stop and Reverse | SAR flips below price |
| **SUPERTREND** | Dynamic support/resistance | Price crosses above Supertrend |

#### ADX

```json
{
  "type": "ADX",
  "period": 14,
  "threshold": 25,
  "signalWindow": 3
}
```

#### PARABOLIC_SAR

```json
{
  "type": "PARABOLIC_SAR",
  "afStart": 0.02,
  "afStep": 0.02,
  "afMax": 0.2,
  "signalWindow": 3
}
```

#### SUPERTREND

```json
{
  "type": "SUPERTREND",
  "period": 10,
  "multiplier": 3,
  "signalWindow": 3
}
```

---

### 🎯 Support & Resistance Indicators (3)

Identify key price levels for entries and exits.

| Indicator | Description | Buy Signal |
|-----------|-------------|------------|
| **PIVOT_POINTS** | Classic floor trader levels | Price bounces off support |
| **DONCHIAN_CHANNEL** | Breakout channels | Price breaks above channel |
| **KELTNER_CHANNEL** | ATR-based channels | Price at lower channel |

#### PIVOT_POINTS

```json
{
  "type": "PIVOT_POINTS",
  "signalWindow": 3
}
```

#### DONCHIAN_CHANNEL

```json
{
  "type": "DONCHIAN_CHANNEL",
  "period": 20,
  "signalWindow": 3
}
```

#### KELTNER_CHANNEL

```json
{
  "type": "KELTNER_CHANNEL",
  "period": 20,
  "atrPeriod": 10,
  "multiplier": 2,
  "signalWindow": 3
}
```

---

### 🕯️ Candlestick Patterns - Single Candle (4)

Single candlestick bullish reversal patterns.

| Pattern | Description | Signal |
|---------|-------------|--------|
| **DOJI** | Indecision candle | Bullish reversal after downtrend |
| **HAMMER** | Long lower shadow | Bullish reversal after downtrend |
| **INVERTED_HAMMER** | Long upper shadow | Bullish reversal after downtrend |
| **BULLISH_MARUBOZU** | Strong bullish, no shadows | Strong momentum buy |

#### DOJI

```json
{
  "type": "DOJI",
  "bodyThreshold": 10,
  "trendPeriod": 5,
  "signalWindow": 3
}
```

#### HAMMER

```json
{
  "type": "HAMMER",
  "shadowRatio": 2,
  "bodyMaxPct": 35,
  "trendPeriod": 5,
  "signalWindow": 3
}
```

#### INVERTED_HAMMER

```json
{
  "type": "INVERTED_HAMMER",
  "shadowRatio": 2,
  "bodyMaxPct": 35,
  "trendPeriod": 5,
  "signalWindow": 3
}
```

#### BULLISH_MARUBOZU

```json
{
  "type": "BULLISH_MARUBOZU",
  "maxShadowPct": 5,
  "minBodyPct": 90,
  "signalWindow": 3
}
```

---

### 🕯️ Candlestick Patterns - Double Candle (4)

Two-candlestick bullish reversal patterns.

| Pattern | Description | Signal |
|---------|-------------|--------|
| **BULLISH_ENGULFING** | Bullish candle engulfs bearish | Strong bullish reversal |
| **BULLISH_HARAMI** | Small bullish inside large bearish | Bullish reversal |
| **PIERCING_LINE** | Opens below, closes above midpoint | Bullish reversal |
| **TWEEZER_BOTTOM** | Two candles with matching lows | Support confirmation |

#### BULLISH_ENGULFING

```json
{
  "type": "BULLISH_ENGULFING",
  "signalWindow": 3
}
```

#### BULLISH_HARAMI

```json
{
  "type": "BULLISH_HARAMI",
  "signalWindow": 3
}
```

#### PIERCING_LINE

```json
{
  "type": "PIERCING_LINE",
  "minPenetration": 50,
  "signalWindow": 3
}
```

#### TWEEZER_BOTTOM

```json
{
  "type": "TWEEZER_BOTTOM",
  "tolerance": 0.1,
  "signalWindow": 3
}
```

---

### 🕯️ Candlestick Patterns - Triple Candle (3)

Three-candlestick bullish reversal patterns.

| Pattern | Description | Signal |
|---------|-------------|--------|
| **MORNING_STAR** | Three-candle reversal | Strong bullish reversal |
| **THREE_WHITE_SOLDIERS** | Three consecutive bullish candles | Strong bullish momentum |
| **THREE_INSIDE_UP** | Bullish Harami + confirmation | Bullish reversal |

#### MORNING_STAR

```json
{
  "type": "MORNING_STAR",
  "signalWindow": 3
}
```

#### THREE_WHITE_SOLDIERS

```json
{
  "type": "THREE_WHITE_SOLDIERS",
  "minBodyPct": 60,
  "signalWindow": 3
}
```

#### THREE_INSIDE_UP

```json
{
  "type": "THREE_INSIDE_UP",
  "signalWindow": 3
}
```

---

### 🕯️ Candlestick Patterns - Continuation (1)

Continuation patterns that signal trend will continue.

| Pattern | Description | Signal |
|---------|-------------|--------|
| **RISING_THREE_METHODS** | Brief pullback in uptrend | Bullish continuation |

#### RISING_THREE_METHODS

```json
{
  "type": "RISING_THREE_METHODS",
  "signalWindow": 3
}
```

---

### 📊 Chart Patterns - Reversal (2)

Multi-day geometric patterns signaling trend reversals.

| Pattern | Description | Signal | Lookback |
|---------|-------------|--------|----------|
| **FALLING_WEDGE** | Converging downward trendlines | Bullish breakout | 30 days |
| **DOUBLE_BOTTOM** | W-shaped pattern | Breakout above neckline | 40 days |

#### FALLING_WEDGE

Converging trendlines with both support and resistance falling, but support falling faster.

```json
{
  "type": "FALLING_WEDGE",
  "lookbackPeriod": 30,
  "peakWindow": 5,
  "minTouches": 2,
  "minRSquared": 0.7,
  "signalWindow": 3
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `lookbackPeriod` | 30 | Days to look back for pattern |
| `peakWindow` | 5 | Window for peak/trough detection |
| `minTouches` | 2 | Min touches per trendline |
| `minRSquared` | 0.7 | Min R² for valid trendline |

#### DOUBLE_BOTTOM

Classic W-shaped reversal pattern with two troughs at similar levels.

```json
{
  "type": "DOUBLE_BOTTOM",
  "lookbackPeriod": 40,
  "peakWindow": 5,
  "priceTolerance": 3,
  "minTroughDistance": 10,
  "signalWindow": 3
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `lookbackPeriod` | 40 | Days to look back for pattern |
| `priceTolerance` | 3 | Max % difference between bottoms |
| `minTroughDistance` | 10 | Min bars between troughs |

---

### 📊 Chart Patterns - Continuation (2)

Multi-day geometric patterns signaling trend will continue.

| Pattern | Description | Signal | Lookback |
|---------|-------------|--------|----------|
| **BULL_FLAG** | Flagpole + consolidation | Breakout continuation | 25 days |
| **ASCENDING_TRIANGLE** | Flat resistance + rising support | Bullish breakout | 30 days |

#### BULL_FLAG

Strong upward move (flagpole) followed by brief consolidation (flag).

```json
{
  "type": "BULL_FLAG",
  "flagpoleMovePercent": 5,
  "flagpoleMaxBars": 10,
  "flagMinBars": 5,
  "flagMaxBars": 15,
  "maxFlagRetracement": 50,
  "signalWindow": 3
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `flagpoleMovePercent` | 5 | Min % move for flagpole |
| `flagpoleMaxBars` | 10 | Max bars for flagpole |
| `flagMinBars` | 5 | Min bars for flag |
| `flagMaxBars` | 15 | Max bars for flag |
| `maxFlagRetracement` | 50 | Max % retracement during flag |

#### ASCENDING_TRIANGLE

Flat resistance with rising support (higher lows).

```json
{
  "type": "ASCENDING_TRIANGLE",
  "lookbackPeriod": 30,
  "peakWindow": 5,
  "minTouches": 2,
  "resistanceTolerance": 1.5,
  "signalWindow": 3
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `lookbackPeriod` | 30 | Days to look back |
| `minTouches` | 2 | Min touches for resistance |
| `resistanceTolerance` | 1.5 | Max % variance in resistance |

---

## Backtest Configuration

### Portfolio Settings

```json
"portfolio": {
  "positionSizePercent": 20,
  "minPositionPercent": 5,
  "maxPositions": 5
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `positionSizePercent` | 20 | Max % of portfolio per position |
| `minPositionPercent` | 5 | Min % to open a position |
| `maxPositions` | 5 | Maximum concurrent positions |

### Risk Management

```json
"riskManagement": {
  "stopLossPercent": 5,
  "takeProfitPercent": 10,
  "maxHoldingDays": 30
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `stopLossPercent` | 5 | Sell if price drops X% from entry |
| `takeProfitPercent` | 10 | Sell if price rises X% from entry |
| `maxHoldingDays` | 30 | Force sell after X days |

### Trading Costs

```json
"tradingCosts": {
  "brokerFee": 0.15,
  "sellFee": 0.15,
  "minimumFee": 1000
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `brokerFee` | 0.15 | Buy commission (%) |
| `sellFee` | 0.15 | Sell commission (%) |
| `minimumFee` | 1000 | Minimum fee per transaction (IDR) |

---

## Strategy Presets

Quick-start configurations for common strategies.

### Basic Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `conservative` | Large-cap value, PE<15, low debt | SMA_TREND |
| `balanced` | Growth + value mix | RSI |
| `aggressive` | Higher risk momentum | SMA_CROSSOVER, RSI |

### Trend Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `trend_following` | Follow strong trends | ADX, SUPERTREND |

### Reversal Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `reversal` | Candlestick reversals | RSI, ENGULFING |
| `double_bottom_hunter` | W-shaped patterns | DOUBLE_BOTTOM, RSI |
| `falling_wedge` | Wedge breakouts | FALLING_WEDGE, RSI |
| `candlestick_reversal` | Pattern reversals | HAMMER, MORNING_STAR |

### Value Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `value_investor` | Cheap quality stocks | PE<12, ROE>12, SMA_TREND |
| `dividend_yield` | Quality dividend stocks | ROE>15, NPM>10, SMA_TREND |

### Momentum Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `momentum_trader` | Ride momentum | MACD, VOLUME_SMA |
| `three_soldiers` | Strong momentum | THREE_WHITE_SOLDIERS, VOLUME_SMA |

### Breakout Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `breakout_hunter` | Channel breakouts | DONCHIAN_CHANNEL, VOLUME_SMA |
| `bull_flag_breakout` | Flag patterns | BULL_FLAG, VOLUME_SMA |
| `ascending_triangle` | Triangle breakouts | ASCENDING_TRIANGLE, ADX |

### Swing Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `swing_trader` | Swing trades | RSI, BOLLINGER_BANDS |

### Syariah Preset

| Preset | Description | Filters |
|--------|-------------|---------|
| `syariah_conservative` | Syariah-compliant | Syariah=true, DE<0.8 |

---

## Signal Logic

When multiple indicators are configured, signals are combined using AND logic by default:
- **All indicators must agree** for a buy/sell signal

With `signalWindow: 3` (default):
- A signal is valid if it triggered within the last 3 days
- This allows for confirmation across multiple indicators that may not trigger on the exact same day

---

## Best Practices

### Choosing Indicators

1. **Don't use too many** - 2-3 indicators is usually optimal
2. **Combine different types** - e.g., trend (SMA) + momentum (RSI)
3. **Match to market conditions:**
   - Trending markets: SMA_CROSSOVER, ADX, SUPERTREND
   - Ranging markets: RSI, BOLLINGER_BANDS, STOCHASTIC

### Good Combinations

| Strategy | Combination | Rationale |
|----------|-------------|-----------|
| Momentum + Volume | MACD + VOLUME_SMA | Volume confirms momentum |
| Trend + Momentum | SMA_TREND + RSI | Momentum confirms trend |
| Pattern + Filter | BULL_FLAG + ADX | ADX confirms trend strength |
| Reversal + Volume | HAMMER + VOLUME_SMA | Volume confirms reversal |

### Chart Pattern Notes

Chart patterns (FALLING_WEDGE, DOUBLE_BOTTOM, BULL_FLAG, ASCENDING_TRIANGLE) require more historical data:
- **Minimum 3 months** of data recommended
- More computationally expensive than simple indicators
- Best combined with a momentum or volume indicator for confirmation

---

## Indicator Summary

| Category | Count | Indicators |
|----------|-------|------------|
| Moving Average | 3 | SMA_CROSSOVER, SMA_TREND, EMA_CROSSOVER |
| Momentum | 3 | RSI, MACD, STOCHASTIC |
| Volatility | 3 | BOLLINGER_BANDS, ATR, VOLATILITY_BREAKOUT |
| Volume | 4 | VOLUME_SMA, OBV, VWAP, VOLUME_PRICE_TREND |
| Trend | 3 | ADX, PARABOLIC_SAR, SUPERTREND |
| Support/Resistance | 3 | PIVOT_POINTS, DONCHIAN_CHANNEL, KELTNER_CHANNEL |
| Candlestick (Single) | 4 | DOJI, HAMMER, INVERTED_HAMMER, BULLISH_MARUBOZU |
| Candlestick (Double) | 4 | BULLISH_ENGULFING, BULLISH_HARAMI, PIERCING_LINE, TWEEZER_BOTTOM |
| Candlestick (Triple) | 3 | MORNING_STAR, THREE_WHITE_SOLDIERS, THREE_INSIDE_UP |
| Candlestick (Continuation) | 1 | RISING_THREE_METHODS |
| Chart Pattern (Reversal) | 2 | FALLING_WEDGE, DOUBLE_BOTTOM |
| Chart Pattern (Continuation) | 2 | BULL_FLAG, ASCENDING_TRIANGLE |
| **Total** | **35** | |

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Unknown indicator: XYZ` | Invalid indicator type | Check spelling, use valid types |
| `Invalid date format` | Wrong date format | Use `YYYY-MM-DD` format |
| `Data cache not loaded` | Server starting up | Wait and retry |

### Validation

The API validates:
- Indicator types exist
- Required parameters are provided
- Date ranges are valid (start < end)
- Numeric parameters are in valid ranges
