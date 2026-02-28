# Analyze V2 Non-Chart API Recommendation

## Purpose

This API is intended for the new `analyze-v2` page when we **do not need data for the main chart**.

It should support:

- Hero summary
- AI summary
- Risk management card
- `Analisis Teknikal`
- `Indikator Detail`
- `Analisis Fundamental`
- `Data Kuartal`

It should **not** include:

- candlestick / OHLC arrays
- main chart MACD series
- main chart RSI series
- any large time-series payload used only by `AdvancedMultiChart`

## Recommended API Style

Use **one UI-ready summary endpoint** with a monolithic response, similar to [`API_ANALYZE_V2.md`](/Users/faisalrasbihan/Projects/algosaham-4/API_ANALYZE_V2.md), but without the `ohlcv` object.

Recommended endpoint:

### POST `/analyze-v2-summary`

Request:

```json
{
  "ticker": "BBCA"
}
```

Why this shape is suitable:

- the current `analyze-v2` page reads from a single `d.*` object
- technical, fundamental, and risk sections are rendered together on one page
- removing chart payload makes the response smaller and faster
- `Indikator Detail` still needs short indicator histories, but only as mini-sparklines

## Required Response

```json
{
  "ticker": "BBCA",
  "companyName": "PT Bank Central Asia Tbk",
  "sector": "Financials",
  "marketCapGroup": "Large",
  "syariah": false,
  "dataMode": "EOD",
  "asOf": "2026-02-21",
  "price": 9725,
  "changePct": 1.83,
  "volume": 42850000,
  "high52w": 10400,
  "low52w": 7850,

  "overallScore": 74,
  "confidence": "high",
  "marketBias": "bullish",
  "llmSummary": "BBCA menunjukkan penguatan tren jangka menengah...",
  "drivers": [
    "Trend naik konfluens MA50 & MA200",
    "Foreign flow net buy 5 hari"
  ],

  "technical": {
    "score": 71,
    "trend": "uptrend",
    "momentum": "bullish",
    "volatility": "moderate",
    "indicators": {
      "ma20": 9540,
      "ma20History": [9300, 9350, 9420, 9480, 9510, 9530, 9540],
      "ma50": 9280,
      "ma50History": [9100, 9150, 9200, 9240, 9260, 9270, 9280],
      "ma200": 8900,
      "ma200History": [8840, 8850, 8860, 8870, 8880, 8890, 8900],
      "rsi14": 58.4,
      "rsi14History": [45, 48, 54, 59, 62, 60, 58.4],
      "macd": {
        "value": "0.24",
        "text": "Bullish Crossover"
      },
      "macdHistory": [-0.1, -0.05, 0.02, 0.1, 0.15, 0.2, 0.24],
      "stochastic": {
        "value": "62.5",
        "text": "Neutral"
      },
      "stochasticHistory": [30, 45, 60, 75, 80, 70, 62.5],
      "bollingerBands": "Upper Band",
      "atr": 120,
      "volumeAvg": "45.2M",
      "support1": 9450,
      "support2": 9200,
      "resistance1": 9850,
      "resistance2": 10100
    },
    "signals": [
      "Harga di atas MA50 dan MA200 - konfirmasi uptrend"
    ]
  },

  "fundamental": {
    "score": 78,
    "valuation": "premium",
    "metrics": {
      "pe_ratio": 24.1,
      "pe_sector_avg": 11.8,
      "pbv": 4.8,
      "pbv_sector_avg": 1.9,
      "roe": 22.4,
      "roa": 3.4,
      "der": 0.6,
      "npm": 38.2,
      "eps_growth_yoy": 8.7,
      "revenue_growth_yoy": 6.3,
      "dividend_yield": 2.1,
      "market_cap_t": 1210
    },
    "quarterly": [
      {
        "period": "Q1'24",
        "revenue": 22.4,
        "netIncome": 12.1,
        "npm": 36.2,
        "roe": 21.1,
        "eps": 298
      },
      {
        "period": "Q2'24",
        "revenue": 23.8,
        "netIncome": 12.9,
        "npm": 37.8,
        "roe": 21.8,
        "eps": 316
      }
    ],
    "signals": [
      "Valuasi premium dibanding sektor - wajar untuk market leader"
    ]
  },

  "riskPlan": {
    "entryReference": "support level",
    "entryPrice": 9600,
    "stopLoss": 9200,
    "takeProfit": 10400,
    "riskReward": 2.0,
    "holdingWindowDays": 15,
    "notes": [
      "Entry dekat support MA50 untuk risk-reward optimal"
    ]
  }
}
```

## Section-by-Section Mapping

### 1. Hero Summary

Required fields:

- `ticker`
- `companyName`
- `sector`
- `marketCapGroup`
- `syariah`
- `dataMode`
- `asOf`
- `price`
- `changePct`
- `volume`
- `high52w`
- `low52w`
- `overallScore`
- `confidence`

Notes:

- `price` is still needed even if we remove main chart data
- the technical detail tab compares `price` vs `ma20` / `ma50` / `ma200`

### 2. AI Summary

Required fields:

- `marketBias`
- `llmSummary`
- `drivers`

Not needed:

- `oneLiner` is not currently rendered on the page

### 3. Risk Management

Required fields:

- `riskPlan.entryReference`
- `riskPlan.entryPrice`
- `riskPlan.stopLoss`
- `riskPlan.takeProfit`
- `riskPlan.riskReward`
- `riskPlan.holdingWindowDays`
- `riskPlan.notes`

### 4. Analisis Teknikal

Required fields:

- `technical.score`
- `technical.trend`
- `technical.momentum`
- `technical.volatility`
- `technical.signals`
- `technical.indicators.support1`
- `technical.indicators.support2`
- `technical.indicators.resistance1`
- `technical.indicators.resistance2`
- `technical.indicators.volumeAvg`
- `technical.indicators.atr`

### 5. Indikator Detail

This tab needs **small indicator snapshots**, not full chart series.

Required fields:

- `technical.indicators.ma20`
- `technical.indicators.ma20History`
- `technical.indicators.ma50`
- `technical.indicators.ma50History`
- `technical.indicators.ma200`
- `technical.indicators.ma200History`
- `technical.indicators.rsi14`
- `technical.indicators.rsi14History`
- `technical.indicators.macd.value`
- `technical.indicators.macd.text`
- `technical.indicators.macdHistory`
- `technical.indicators.stochastic.value`
- `technical.indicators.stochastic.text`
- `technical.indicators.stochasticHistory`
- `technical.indicators.bollingerBands`

Recommended rules:

- each `*History` array should contain exactly **7 sequential points**
- keep history arrays ordered **oldest -> newest**
- keep `macd` and `stochastic` in the current page-friendly shape: `{ text, value }`

### 6. Analisis Fundamental

Required fields:

- `fundamental.score`
- `fundamental.valuation`
- `fundamental.signals`
- `fundamental.metrics.pe_ratio`
- `fundamental.metrics.pe_sector_avg`
- `fundamental.metrics.pbv`
- `fundamental.metrics.pbv_sector_avg`
- `fundamental.metrics.roe`
- `fundamental.metrics.roa`
- `fundamental.metrics.der`
- `fundamental.metrics.npm`
- `fundamental.metrics.eps_growth_yoy`
- `fundamental.metrics.revenue_growth_yoy`
- `fundamental.metrics.dividend_yield`
- `fundamental.metrics.market_cap_t`

### 7. Data Kuartal

Required fields for each row:

- `period`
- `revenue`
- `netIncome`
- `npm`
- `roe`
- `eps`

Recommended rules:

- return at least **6 to 8 quarters**
- order data **oldest -> newest**
- `revenue` and `netIncome` should use the same unit across all rows
- if the UI label remains `Revenue (T)` and `Laba Bersih (T)`, backend values should already represent trillions

## Fields That Can Be Removed From the Old Reference

If this endpoint is only for non-chart `analyze-v2`, these fields are unnecessary:

- `ohlcv`
- `oneLiner`
- root-level or extra objects used only by old experiments, such as a separate `indicators` panel object
- any long arrays for chart panes beyond the 7-point sparkline histories

## Suggested TypeScript Shape

```ts
type AnalyzeV2SummaryResponse = {
  ticker: string
  companyName: string
  sector: string
  marketCapGroup: string
  syariah: boolean
  dataMode: "EOD"
  asOf: string
  price: number
  changePct: number
  volume: number
  high52w: number
  low52w: number
  overallScore: number
  confidence: "low" | "medium" | "high"
  marketBias: "bullish" | "bearish" | "neutral"
  llmSummary: string
  drivers: string[]
  technical: {
    score: number
    trend: string
    momentum: string
    volatility: string
    indicators: {
      ma20: number
      ma20History: number[]
      ma50: number
      ma50History: number[]
      ma200: number
      ma200History: number[]
      rsi14: number
      rsi14History: number[]
      macd: {
        value: string
        text: string
      }
      macdHistory: number[]
      stochastic: {
        value: string
        text: string
      }
      stochasticHistory: number[]
      bollingerBands: string
      atr: number
      volumeAvg: string
      support1: number
      support2: number
      resistance1: number
      resistance2: number
    }
    signals: string[]
  }
  fundamental: {
    score: number
    valuation: string
    metrics: {
      pe_ratio: number
      pe_sector_avg: number
      pbv: number
      pbv_sector_avg: number
      roe: number
      roa: number
      der: number
      npm: number
      eps_growth_yoy: number
      revenue_growth_yoy: number
      dividend_yield: number
      market_cap_t: number
    }
    quarterly: Array<{
      period: string
      revenue: number
      netIncome: number
      npm: number
      roe: number
      eps: number
    }>
    signals: string[]
  }
  riskPlan: {
    entryReference: string
    entryPrice: number
    stopLoss: number
    takeProfit: number
    riskReward: number
    holdingWindowDays: number
    notes: string[]
  }
}
```

## Practical Recommendation

If backend already has the full V2 response, the simplest implementation is:

1. keep the existing full analyze endpoint for chart-enabled use cases
2. add a lighter summary endpoint for `analyze-v2` non-chart mode
3. exclude `ohlcv` entirely from the lighter endpoint
4. keep only 7-point indicator histories for `Indikator Detail`
5. keep quarterly arrays for `Data Kuartal`

This gives the page all required data without sending large chart payloads that are not used.
