# Analyze V2.1 API Documentation

> **Status:** Proposed / additive update to [`API_ANALYZE_V2.md`](./API_ANALYZE_V2.md).
> **Compatibility:** Backward-compatible. Every new field is additive — existing V2 clients keep working. The redesigned **AI View** and **Trade Plan** cards in `app/analyze-v2/page.tsx` consume the new fields, with graceful fallback to V2 fields when absent.

## What changed vs V2

| Area | Change | Drives |
| --- | --- | --- |
| `riskPlan.levels` | **NEW** — 3 ranked support + 3 ranked resistance levels, each with a price, a technical `basis`, and an optional precomputed `distancePct`. | New **Trade Plan** multi-line price bar (`components/trade-plan-card.tsx`) |
| `riskPlan.currentPrice` | **NEW** — echo of the root `price` so the Trade Plan card is self-contained. | Trade Plan current-price marker |
| `riskPlan.holdingTerm` | Clarified enum (`short` \| `medium` \| `long`). Replaces the V2 free-form `holdingWindowDays` (still accepted). | Trade Plan tooltip "Hold" line |
| `aiView.headline` | **NEW** — short title for the AI View card. | AI View header |
| `aiView.conviction`, `aiView.horizon` | **NEW** — model conviction + intended time horizon. | AI View metadata |
| `aiView.bull` / `aiView.bear` | **NEW** — structured cases (`summary` + `points[]` + `conviction`). Supersede the flat `bullCase` / `bearCase` strings (still accepted). | AI View "Bullish View" / "Bearish View" |
| `aiView.catalysts` | **NEW** — upcoming dated events worth watching. | AI View / watch items |

---

## Endpoint

### POST `/analyze-v2`
Analyze a single ticker (EOD-only) and return a UI-ready monolithic JSON payload.

### Request

```json
{ "ticker": "BBCA" }
```

---

## Response Structure (root)

Unchanged root fields are abbreviated; only additions are highlighted inline.

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
  "watchItems": [
    "RUPS dividen 12 Mar",
    "Rilis laba Q1 akhir April"
  ],

  "aiView": { ... },        // EXPANDED (see below)
  "technical": { ... },     // unchanged from V2
  "fundamental": { ... },   // unchanged from V2
  "riskPlan": { ... },      // EXPANDED (see below)
  "ohlcv": { ... }          // unchanged from V2
}
```

---

## Object Definitions

### `aiView` (expanded)

Powers the **AI View** card: a short headline, the `Ringkasan Singkat` (still sourced from root `llmSummary`), `Driver Utama` (root `drivers`), and the two structured cases rendered as the red **Bearish View** / green **Bullish View** blocks.

```json
{
  "headline": "Momentum kuat, valuasi masih wajar",
  "coreThesis": "Bank dengan ROE tinggi dan funding murah; tren harga searah MA50/MA200.",
  "whatChanged": "Foreign net buy 5 hari beruntun membalik outflow bulan lalu.",
  "conviction": "high",
  "horizon": "1-3 bulan",

  "bull": {
    "summary": "Tren naik konfluens dengan fundamental solid dan flow asing yang membaik.",
    "points": [
      "Harga bertahan di atas MA50 & MA200",
      "ROE 22% di atas rata-rata sektor",
      "Net buy asing 5 hari beruntun"
    ],
    "conviction": "medium"
  },
  "bear": {
    "summary": "Valuasi premium membuat saham rentan koreksi bila momentum melemah.",
    "points": [
      "PBV 4.8x jauh di atas sektor",
      "RSI mendekati overbought",
      "Gagal bertahan di atas support MA50 membatalkan tesis"
    ],
    "conviction": "low"
  },

  "catalysts": [
    { "label": "RUPS & pengumuman dividen", "date": "2026-03-12", "impact": "positive" },
    { "label": "Rilis laba Q1", "date": "2026-04-28", "impact": "neutral" }
  ]
}
```

**Field notes**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `headline` | `string` | optional | ≤ 60 chars. Falls back to `oneLiner` then a generated line. |
| `coreThesis` | `string` | optional | One-paragraph thesis. |
| `whatChanged` | `string` | optional | Most recent change in the setup; used as a driver fallback. |
| `conviction` | `"low" \| "medium" \| "high"` | optional | Overall model conviction in the bias. |
| `horizon` | `string` | optional | Human-readable, e.g. `"1-3 bulan"`. |
| `bull.summary` / `bear.summary` | `string` | recommended | Replaces flat `bullCase` / `bearCase`. |
| `bull.points` / `bear.points` | `string[]` | optional | 2–4 bullet reasons; rendered under the case summary. |
| `bull.conviction` / `bear.conviction` | `"low" \| "medium" \| "high"` | optional | Per-case strength. |
| `catalysts[]` | `Array<{ label; date?; impact? }>` | optional | `impact`: `"positive" \| "neutral" \| "negative"`. Dates ISO `YYYY-MM-DD`. |

> **Back-compat:** if `aiView.bull` / `aiView.bear` are absent, the client still reads the V2 flat strings `aiView.bullCase` / `aiView.bearCase`.

---

### `riskPlan` (expanded)

The redesigned Trade Plan card renders a single horizontal price axis with the current price in the middle, **3 support lines to the left** and **3 resistance lines to the right**, spaced proportionally to real price gaps and shaded by `rank` (nearest = most saturated). Hovering a line shows its `label`, `price`, `basis`, and distance. The card-level tooltip still shows the Entry / Stop / Target grid and watch items.

```json
{
  "entryReference": "support_level",
  "entryPrice": 9600,
  "stopLoss": 9200,
  "takeProfit": 10400,
  "riskReward": 2.0,
  "holdingTerm": "medium",
  "confidence": "high",
  "summary": "Entry dekat support MA50 untuk risk-reward optimal.",
  "notes": [
    "Entry dekat support MA50 untuk risk-reward optimal",
    "Stop loss di bawah swing low terakhir"
  ],

  "currentPrice": 9725,

  "levels": {
    "supports": [
      { "rank": 1, "label": "Support 1", "price": 9450, "basis": "MA50",      "distancePct": -2.83 },
      { "rank": 2, "label": "Support 2", "price": 9200, "basis": "Swing low",  "distancePct": -5.40 },
      { "rank": 3, "label": "Support 3", "price": 8900, "basis": "MA200",      "distancePct": -8.48 }
    ],
    "resistances": [
      { "rank": 1, "label": "Resistance 1", "price": 9850,  "basis": "Prev high",   "distancePct": 1.29 },
      { "rank": 2, "label": "Resistance 2", "price": 10100, "basis": "Fib 1.618",   "distancePct": 3.86 },
      { "rank": 3, "label": "Resistance 3", "price": 10400, "basis": "52w high",    "distancePct": 6.94 }
    ]
  }
}
```

**Field notes**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `currentPrice` | `number` | recommended | Echo of root `price`. If omitted, client uses root `price`. |
| `holdingTerm` | `"short" \| "medium" \| "long"` | recommended | V2 `holdingWindowDays` still accepted as fallback. |
| `levels.supports` | `PriceLevel[]` | recommended | Exactly **3**, ordered by `rank` ascending (1 = nearest/strongest). All prices **below** `currentPrice`. |
| `levels.resistances` | `PriceLevel[]` | recommended | Exactly **3**, ordered by `rank` ascending. All prices **above** `currentPrice`. |

**`PriceLevel`**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `rank` | `1 \| 2 \| 3` | yes | 1 = nearest to price (strongest), 3 = furthest (weakest). Drives line color intensity. |
| `label` | `string` | yes | Display label, e.g. `"Support 1"`. |
| `price` | `number` | yes | Absolute price in IDR. |
| `basis` | `string` | optional | Technical origin shown on hover, e.g. `"MA50"`, `"Fib 1.618"`, `"Swing low"`, `"52w high"`. |
| `distancePct` | `number` | optional | Signed % vs `currentPrice`. Client derives it if omitted. |

> **Invariants the client relies on:** supports strictly below `currentPrice`, resistances strictly above, both arrays sorted by `rank`. If fewer than 3 levels are available, send what you have (the card scales) — but keep them rank-ordered.

---

## TypeScript reference

```ts
type Conviction = "low" | "medium" | "high"

interface AiCase {
  summary: string
  points?: string[]
  conviction?: Conviction
}

interface AiCatalyst {
  label: string
  date?: string // ISO YYYY-MM-DD
  impact?: "positive" | "neutral" | "negative"
}

interface AiView {
  headline?: string
  coreThesis?: string
  whatChanged?: string
  conviction?: Conviction
  horizon?: string
  bull?: AiCase
  bear?: AiCase
  catalysts?: AiCatalyst[]
  // Deprecated (V2 fallback):
  bullCase?: string
  bearCase?: string
}

interface PriceLevel {
  rank: 1 | 2 | 3
  label: string
  price: number
  basis?: string
  distancePct?: number
}

interface RiskPlan {
  entryReference: string
  entryPrice: number
  stopLoss: number
  takeProfit: number
  riskReward: number
  holdingTerm: "short" | "medium" | "long"
  confidence: Conviction
  summary?: string
  notes: string[]
  currentPrice?: number
  levels?: {
    supports: PriceLevel[]
    resistances: PriceLevel[]
  }
}
```

---

## Client mapping cheatsheet

| UI element | Source field |
| --- | --- |
| AI View · header title | `aiView.headline` → `oneLiner` |
| AI View · Ringkasan Singkat | `llmSummary` |
| AI View · Driver Utama | `drivers[]` (fallback `aiView.whatChanged`) |
| AI View · Bullish View | `aiView.bull.summary` + `aiView.bull.points[]` (fallback `aiView.bullCase`) |
| AI View · Bearish View | `aiView.bear.summary` + `aiView.bear.points[]` (fallback `aiView.bearCase`) |
| Trade Plan · current price marker | `riskPlan.currentPrice` → root `price` |
| Trade Plan · support lines (L→R) | `riskPlan.levels.supports[]` by `rank` |
| Trade Plan · resistance lines | `riskPlan.levels.resistances[]` by `rank` |
| Trade Plan · line hover | `label` · `basis` · `price` · `distancePct` |
| Trade Plan · card tooltip grid | `entryPrice` / `stopLoss` / `takeProfit` / `riskReward` / `holdingTerm` / `summary` |
| Trade Plan · Things To Watch | root `watchItems[]` |

---

## Developer Notes

1. **Additive only.** No V2 field is removed or renamed. The frontend reads new fields when present and falls back otherwise, so backend and frontend can ship independently.
2. **Levels are pre-ranked, not pre-positioned.** Send absolute prices + `rank`; the client computes horizontal positions from the price domain so spacing reflects real gaps. Do not send pixel/percent positions.
3. **Keep `basis` short.** It appears in a compact hover tooltip — prefer `"Fib 1.618"` over `"Fibonacci extension 1.618 from swing"`.
4. **Catalysts vs watch items.** `watchItems` is the generic root-level list (plain strings) rendered in the Trade Plan tooltip. `aiView.catalysts` is the richer, dated variant for the AI narrative — both may be populated.
```
