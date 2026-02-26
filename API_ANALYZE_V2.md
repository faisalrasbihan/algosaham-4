# Analyze V2 API Documentation

## Endpoint

### POST `/analyze-v2`
Analyze a single ticker (EOD-only) and return a comprehensive UI-ready monolithic JSON payload. This refactored payload drives the unified Dashboard UI in `analyze-v2/page.tsx`.

---

## Request

```json
{
  "ticker": "BBCA"
}
```

---

## Response Structure

The V2 Endpoint returns a flattened top-level dictionary instead of nesting things into strict isolated component boundaries like the V1 response. This minimizes parsing on the client side for the Hero UI.

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
  "oneLiner": "Momentum kuat didukung fundamental solid...",
  "llmSummary": "BBCA menunjukkan penguatan tren jangka menengah...",
  "drivers": [
    "Trend naik konfluens MA50 & MA200",
    "Foreign flow net buy 5 hari"
  ],

  "technical": { ... },
  "fundamental": { ... },
  "riskPlan": { ... },
  "ohlcv": { ... }
}
```

---

## Object Definitions

### `technical`
Lightweight technical scoring heavily supplemented by explicit trailing indicators. The new V2 technical card features sparklines (7-day trailing data arrays mapping `*History`).

```json
{
  "score": 71,
  "confidence": "high",
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
    "macd": { "text": "Bullish Crossover", "value": "0.24" },
    "macdHistory": [-0.1, -0.05, 0.02, 0.1, 0.15, 0.2, 0.24],
    "stochastic": { "text": "Neutral", "value": "62.5" },
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
    "Harga di atas MA50 dan MA200 — konfirmasi uptrend"
  ]
}
```

### `fundamental`
Fundamental scoring utilizing static metrics as well as providing deep quarterly revenue arrays to power the historical fundamental BarCharts.

```json
{
  "score": 78,
  "confidence": "high",
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
    { "period": "Q1'24", "revenue": 22.4, "netIncome": 12.1, "npm": 36.2, "roe": 21.1, "eps": 298 },
    { "period": "Q2'24", "revenue": 23.8, "netIncome": 12.9, "npm": 37.8, "roe": 21.8, "eps": 316 }
  ],
  "signals": [
    "Valuasi premium dibanding sektor — wajar untuk market leader"
  ]
}
```

### `riskPlan`
Robust and precise trade planning metrics based on ATR, stop-loss calculations, and swing-lows. Includes specific notes representing trading thesis justifications.

```json
{
  "entryReference": "support level",
  "entryPrice": 9600,
  "stopLoss": 9200,
  "takeProfit": 10400,
  "riskReward": 2.0,
  "holdingWindowDays": 15,
  "notes": [
    "Entry dekat support MA50 untuk risk-reward optimal",
    "Stop loss di bawah swing low terakhir"
  ]
}
```

### `ohlcv`
Used exclusively by the `AdvancedMultiChart` to render raw candlestick data with overlaid moving averages and volume/money flow histograms. Data lengths should be exact (ex. 60 days). Array indexes map 1:1 with `dates`. Note: Padding arrays with `null` before averages catch up is required.

```json
{
  "dates": ["2025-12-01", "2025-12-02", "..."], // e.g. length 60
  "close": [8950, 9000, "..."],
  "ma20": [null, null, null, 9210, "..."], // Begins at index 19
  "ma50": [null, null, null, null, null, 9350, "..."], // Begins at index 49
  "rsi": [55, 58, "..."],
  "foreignFlowCumulative": [0, 12, 8, "..."]
}
```

---

## Developer Notes

1. **Monolithic Design:** This endpoint abandons the isolated nesting approach of `v1` (where Score and Summary were siloed) in favor of placing high-level data immediately at the route root. This allows standard `d.*` dot-walking on the UI.
2. **LLM Implementation:** LLM summary is fetched synchronously during request. We provide a single high-fidelity `llmSummary`, `oneLiner`, `marketBias`, and bulleted `drivers` array on the root level.
3. **Advanced Charting:** The OHLCV object drives all 3 panes of the Lightweight Chart library instance (Main pricepane, MACD pane, Flow pane). Provide accurate `foreignFlowCumulative` integers so daily delta can be properly inverted. 
4. **Sparkline Histories:** All sparklines inside the Technical Details array require exactly **7 sequential datapoints** to render clean minicharts without overwhelming the ReCharts canvas.
