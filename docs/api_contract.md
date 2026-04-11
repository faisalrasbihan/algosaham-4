# Backtesting & Screening API

This document is the contract for the frontend. It focuses on what can be sent, what comes back, and how to interpret the results without drowning in implementation details.

**Endpoints**

| Endpoint | Method | Purpose | Request Body |
| --- | --- | --- | --- |
| `/run_backtest` | POST | Run a full backtest with the provided configuration | `{ "config": { ... } }` |
| `/screen_stocks` | POST | Scan recent trading days for buy signals | `{ "config": { ... }, "scan_days": 5 }` |

`scan_days` is optional; default is `5` trading days.

**Request Envelope**

All requests must wrap the configuration in a `config` object.

```json
// /run_backtest
{
  "config": {
    "backtestId": "momentum_v1",
    "filters": { "marketCap": ["large", "mid"] },
    "fundamentalIndicators": [
      { "type": "PE_RATIO", "max": 20 }
    ],
    "technicalIndicators": [
      { "type": "RSI", "period": 14, "oversold": 30, "overbought": 70 }
    ],
    "signalAlignmentDays": 3,
    "backtestConfig": {
      "initialCapital": 100000000,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "tradingCosts": { "brokerFee": 0.15, "sellFee": 0.15, "minimumFee": 1000 },
      "portfolio": { "positionSizePercent": 20, "maxPositions": 5 },
      "riskManagement": {
        "stopLoss": { "method": "ATR", "atrMultiplier": 2.0, "atrPeriod": 14 },
        "takeProfit": { "method": "RISK_REWARD", "riskRewardRatio": 2.0 },
        "maxHoldingDays": 21
      }
    }
  }
}
```

```json
// /screen_stocks
{
  "config": {
    "screeningId": "screen_momentum",
    "filters": { "minDailyValue": 1000000000 },
    "technicalIndicators": [
      { "type": "SMA_CROSSOVER", "shortPeriod": 20, "longPeriod": 50 }
    ],
    "riskManagement": {
      "stopLoss": { "method": "FIXED", "percent": 5 },
      "takeProfit": { "method": "FIXED", "percent": 10 }
    }
  },
  "scan_days": 5
}
```

**Config Schema**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `backtestId` | string | Optional | Identifier used in backtest responses. |
| `screeningId` | string | Optional | Identifier used in screening responses (preferred over `backtestId`). |
| `filters` | object | Optional | Stock universe filters. |
| `fundamentalIndicators` | array | Optional | Fundamental filters (min/max). |
| `technicalIndicators` | array | Optional | Technical signal definitions. |
| `signalAlignmentDays` | number | Optional | Align signals across indicators using event age (see Notes). |
| `backtestConfig` | object | Required for `/run_backtest` | Ignored by `/screen_stocks` except `riskManagement` and `signalAlignmentDays`. |
| `riskManagement` | object | Optional | Only used by `/screen_stocks`; `/run_backtest` reads this from `backtestConfig`. |

**BacktestConfig**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `initialCapital` | number | Yes | Starting cash in IDR. |
| `startDate` | string | Yes | `YYYY-MM-DD` (inclusive). |
| `endDate` | string | Yes | `YYYY-MM-DD` (inclusive). |
| `tradingCosts` | object | Optional | Trading fees and slippage. |
| `portfolio` | object | Optional | Position sizing and limits. |
| `riskManagement` | object | Optional | Stop loss / take profit / max hold. |
| `dividendPolicy` | object | Optional | Dividend cashflow behavior. |
| `signalAlignmentDays` | number | Optional | Can be set here or top-level. |

**TradingCosts**

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `brokerFee` | number | `0` | Buy fee in percent (0.15 = 0.15%). |
| `sellFee` | number | `0` | Sell fee in percent. |
| `minimumFee` | number | `0` | Minimum fee in IDR. |
| `slippageBps` | number | `0` | Slippage in bps applied to execution price. |
| `spreadBps` | number | `0` | Half-spread in bps applied on each side. |

**Portfolio**

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `positionSizePercent` | number | `20` | Max allocation per position (percent of portfolio). |
| `minPositionPercent` | number | `0` | Minimum allocation per position (percent). |
| `maxPositions` | number | `5` | Max number of open positions. |

**Risk Management**

Defaults: `stopLoss` 5% FIXED, `takeProfit` 10% FIXED, `maxHoldingDays` 30.

| Field | Type | Notes |
| --- | --- | --- |
| `stopLoss` | object | `method` = `FIXED` or `ATR`. |
| `takeProfit` | object | `method` = `FIXED`, `ATR`, or `RISK_REWARD`. |
| `maxHoldingDays` | number | Exit after N trading days. |
| `exitSignals` | object | Optional exit rules and priority. |

Stop loss fields:

| Field | Type | Notes |
| --- | --- | --- |
| `method` | string | `FIXED` or `ATR`. |
| `percent` | number | Required for `FIXED`. |
| `atrMultiplier` | number | Required for `ATR`. |
| `atrPeriod` | number | Optional for `ATR` (default 14). |

Take profit fields:

| Field | Type | Notes |
| --- | --- | --- |
| `method` | string | `FIXED`, `ATR`, or `RISK_REWARD`. |
| `percent` | number | Required for `FIXED`. |
| `atrMultiplier` | number | Required for `ATR`. |
| `atrPeriod` | number | Optional for `ATR` (default 14). |
| `riskRewardRatio` | number | Required for `RISK_REWARD`. |

ExitSignals:

| Field | Type | Notes |
| --- | --- | --- |
| `exitRules` | array | Items: `STOP_LOSS`, `TAKE_PROFIT`, `MAX_HOLD`. |
| `exitPriority` | array | Priority order if multiple exit rules trigger. |

**DividendPolicy**

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `enabled` | boolean | `true` | Enable dividend cashflows. |
| `eligibilityDate` | string | `announcement_date` | Also accepts `effective_date`, `record_date`. |
| `creditDate` | string | `payment_date` | Also accepts `record_date`. |
| `baseCurrency` | string | `IDR` | Base currency for payouts. |
| `taxBps` | number | `0` | Withholding tax in bps. |
| `fxRates` | object | `{}` | Map of currency -> FX rate to base. |
| `skipNonBaseCurrency` | boolean | `true` | Skip dividends without FX rate. |

**Filters**

| Field | Type | Notes |
| --- | --- | --- |
| `tickers` | string or string[] | Exact tickers to include. |
| `marketCap` | string or string[] | `small`, `mid`, `large`. |
| `minDailyValue` | number | Minimum daily traded value (IDR). |
| `syariah` | boolean | Require Syariah-compliant. |
| `sectors` | string[] | Match dataset `sector` values. |
| `rules` | object | Custom numeric filters by column name. |

Market cap groups are precomputed in the dataset (`market_cap_group`). Current pipeline thresholds (IDR):
- `large`: >= 10,000,000,000,000
- `mid`: >= 1,000,000,000,000 and < 10,000,000,000,000
- `small`: < 1,000,000,000,000

Sector values (canonical):
- Energy
- Basic Materials
- Industrials
- Consumer Cyclicals
- Consumer Non-Cyclicals
- Healthcare
- Financials
- Properties & Real Estate
- Technology
- Transportation & Logistics
- Infrastructure

Sector normalization (performed in the data layer). If a value does not match any rule below, it passes through unchanged:

| Raw sector | sector |
| --- | --- |
| `CONST , PROP AND REAL ESTATE` | `Properties & Real Estate` |
| `Properties & Real Estate` | `Properties & Real Estate` |
| `INFRASTRUCTURE, UTIL & TRANS.` | `Infrastructure` |
| `Infrastructures` | `Infrastructure` |
| `Transportation & Logistic` | `Transportation & Logistics` |
| `Transportation & Logistics` | `Transportation & Logistics` |
| `TRADE AND SERVICES` | `Consumer Cyclicals` |
| `Trade and Services` | `Consumer Cyclicals` |
| `MINING` | `Basic Materials` |
| `Mining` | `Basic Materials` |

`filters.rules` only guarantees these columns (others may not be loaded): `pe_ratio`, `pbv`, `roe`, `der`, `roa`, `npm`, `eps`.

`filters.rules` examples:

```json
"rules": {
  "pe_ratio": { "max": 15 },
  "roe": { "min": 10 },
  "der": { "max": 1 }
}
```

**Fundamental Indicators**

Each item accepts `min` and/or `max`.

| Type | Description |
| --- | --- |
| `PE_RATIO` | Price to Earnings Ratio |
| `PBV` | Price to Book Value |
| `ROE` | Return on Equity |
| `DE_RATIO` | Debt to Equity Ratio |
| `ROA` | Return on Assets |
| `NPM` | Net Profit Margin |
| `EPS` | Earnings Per Share |

Example:

```json
"fundamentalIndicators": [
  { "type": "PE_RATIO", "max": 20 },
  { "type": "ROE", "min": 15 }
]
```

**Technical Indicators**

All indicators accept `signalWindow` (default 3) unless noted. `signalAlignmentDays` (config-level) can further tighten timing by requiring indicator events to fall within N days of each other.

If no technical indicators are provided, no buy signals are generated.

Moving Averages:

| Type | Params (defaults) |
| --- | --- |
| `SMA_CROSSOVER` | `shortPeriod` (20), `longPeriod` (50) |
| `SMA_TREND` | `shortPeriod` (20), `longPeriod` (50) |
| `EMA_CROSSOVER` | `shortPeriod` (12), `longPeriod` (26) |

Momentum:

| Type | Params (defaults) |
| --- | --- |
| `RSI` | `period` (14), `oversold` (30), `overbought` (70) |
| `MACD` | `fastPeriod` (12), `slowPeriod` (26), `signalPeriod` (9) |
| `STOCHASTIC` | `kPeriod` (14), `dPeriod` (3), `oversold` (20), `overbought` (80) |

Volatility:

| Type | Params (defaults) |
| --- | --- |
| `BOLLINGER_BANDS` | `period` (20), `stdDev` (2) |
| `ATR` | `period` (14), no signals (risk sizing only) |
| `VOLATILITY_BREAKOUT` | `period` (20), `multiplier` (2) |
| `VOLATILITY_REGIME` | `period` (20), `lookback` (60), `lowThreshold` (-0.5), `highThreshold` (1.0), `mode` (BOTH) |

Volume:

| Type | Params (defaults) |
| --- | --- |
| `VOLUME_SMA` | `period` (20), `threshold` (1.5) |
| `OBV` | `period` (20) |
| `VWAP` | `period` (20) |
| `VOLUME_PRICE_TREND` | `period` (20) |
| `ACCUMULATION_BASE` | `declinePeriod` (60), `minDeclinePct` (30), `basePeriod` (20), `maxBaseRange` (15), `volumeIncreasePct` (50) |
| `BASE_BREAKOUT` | `basePeriod` (30), `maxBaseRange` (15), `breakoutPct` (2), `volumeMultiplier` (1.5) |
| `VOLUME_DRY_UP` | `period` (20), `dryUpThreshold` (0.5), `consecutiveDays` (3) |
| `CLIMAX_VOLUME` | `period` (20), `climaxMultiplier` (3.0), `priorDeclinePct` (15), `priorDeclineDays` (20) |
| `ACCUMULATION_DISTRIBUTION` | `period` (20) |

Trend:

| Type | Params (defaults) |
| --- | --- |
| `ADX` | `period` (14), `threshold` (25) |
| `PARABOLIC_SAR` | `afStart` (0.02), `afStep` (0.02), `afMax` (0.2) |
| `SUPERTREND` | `period` (10), `multiplier` (3) |

Support & Resistance:

| Type | Params (defaults) |
| --- | --- |
| `PIVOT_POINTS` | none (signalWindow only) |
| `DONCHIAN_CHANNEL` | `period` (20) |
| `KELTNER_CHANNEL` | `period` (20), `atrPeriod` (10), `multiplier` (2) |

Candlestick (Single):

| Type | Params (defaults) |
| --- | --- |
| `DOJI` | `bodyThreshold` (10), `trendPeriod` (5) |
| `HAMMER` | `shadowRatio` (2), `bodyMaxPct` (35), `trendPeriod` (5) |
| `INVERTED_HAMMER` | `shadowRatio` (2), `bodyMaxPct` (35), `trendPeriod` (5) |
| `BULLISH_MARUBOZU` | `maxShadowPct` (5), `minBodyPct` (90) |

Candlestick (Multi):

| Type | Params (defaults) |
| --- | --- |
| `BULLISH_ENGULFING` | none (signalWindow only) |
| `BULLISH_HARAMI` | none (signalWindow only) |
| `PIERCING_LINE` | `minPenetration` (50) |
| `TWEEZER_BOTTOM` | `tolerance` (0.1) |
| `MORNING_STAR` | none (signalWindow only) |
| `THREE_WHITE_SOLDIERS` | `minBodyPct` (60) |
| `THREE_INSIDE_UP` | none (signalWindow only) |
| `RISING_THREE_METHODS` | none (signalWindow only) |

Chart Patterns:

| Type | Params (defaults) |
| --- | --- |
| `FALLING_WEDGE` | `lookbackPeriod` (30), `peakWindow` (5), `minTouches` (2), `minRSquared` (0.7) |
| `DOUBLE_BOTTOM` | `lookbackPeriod` (40), `peakWindow` (5), `priceTolerance` (3), `minTroughDistance` (10) |
| `CUP_AND_HANDLE` | `cupMinBars` (20), `cupMaxBars` (60), `handleMinBars` (5), `handleMaxBars` (15), `maxHandleRetracement` (50), `cupDepthMinPct` (15), `cupDepthMaxPct` (50) |
| `INVERSE_HEAD_SHOULDERS` | `lookbackPeriod` (50), `peakWindow` (5), `shoulderTolerance` (5), `minHeadDepth` (3) |
| `ROUNDING_BOTTOM` | `lookbackPeriod` (40), `minCurvature` (0.6), `breakoutPct` (2) |
| `BULL_FLAG` | `flagpoleMovePercent` (5), `flagpoleMaxBars` (10), `flagMinBars` (5), `flagMaxBars` (15), `maxFlagRetracement` (50) |
| `ASCENDING_TRIANGLE` | `lookbackPeriod` (30), `peakWindow` (5), `minTouches` (2), `resistanceTolerance` (1.5) |

Chart Patterns (Imminent):

| Type | Params (defaults) |
| --- | --- |
| `BULL_FLAG_IMMINENT` | `flagpoleMovePercent` (5), `flagpoleMaxBars` (10), `flagMinBars` (3), `flagMaxBars` (12), `maxFlagRetracement` (50), `proximityPct` (3) |
| `FALLING_WEDGE_IMMINENT` | `lookbackPeriod` (25), `peakWindow` (5), `minTouches` (2), `minRSquared` (0.65), `proximityPct` (3) |
| `DOUBLE_BOTTOM_IMMINENT` | `lookbackPeriod` (40), `peakWindow` (5), `priceTolerance` (3), `minTroughDistance` (10), `proximityPct` (3) |
| `ASCENDING_TRIANGLE_IMMINENT` | `lookbackPeriod` (30), `peakWindow` (5), `minTouches` (2), `resistanceTolerance` (1.5), `proximityPct` (2) |

Flow (IDX):

| Type | Params (defaults) |
| --- | --- |
| `FOREIGN_FLOW` | `period` (5), `flowType` (accumulation), `minNetBuy` (1B), `consecutiveDays` (3) |
| `FOREIGN_REVERSAL` | `sellPeriod` (10), `buyPeriod` (5), `minSellValue` (5B), `minBuyValue` (2B) |
| `ARA_RECOVERY` | `lookbackDays` (3), `minAraCount` (1), `araThresholdPct` (90) |
| `ARB_RECOVERY` | `lookbackDays` (5), `recoveryDays` (2), `arbThresholdPct` (90), `minRecoveryPct` (5) |
| `ARA_BREAKOUT` | `araLookback` (10), `consolidationDays` (3), `breakoutPct` (2) |

Regime & Calendar:

| Type | Params (defaults) |
| --- | --- |
| `CALENDAR_EFFECT` | `mode` (MONTH_END), `days` (3), `signalWindow` default is `1` |
| `SECTOR_RELATIVE_STRENGTH` | `period` (20), `threshold` (0.0) |

**Execution Model & Assumptions**

| Topic | Behavior |
| --- | --- |
| Signal timing | Signals are evaluated on day T close. |
| Entry timing | Entries execute at day T+1 open (next trading day). |
| Exit timing | SL/TP use intraday high/low; max-hold exits at close. |
| Multiple entries | Same-day entries are ordered by liquidity (`prev_daily_value`, else `close * volume`). |
| Signal logic | Multiple indicators are combined with AND logic. |
| Valid OHLCV | Rows with `is_valid_ohlcv = false` are ignored when available. |
| Corporate actions | Prices are adjusted for splits and rights issues before indicator calculation. |
| Lot size | Quantities are rounded down to IDX lot size (100 shares). |
| Tick rounding | SL is rounded up; TP is rounded down to IDX ticks. |

**Responses**

`/screen_stocks` response shape:

```json
{
  "screeningId": "screen_momentum",
  "scannedDays": 5,
  "dateRange": { "from": "2024-12-23", "to": "2024-12-27" },
  "signals": [ ... ],
  "summary": { ... }
}
```

Complete `/screen_stocks` response example:

```json
{
  "screeningId": "screen_momentum",
  "scannedDays": 5,
  "dateRange": {
    "from": "2024-12-23",
    "to": "2024-12-27"
  },
  "signals": [
    {
      "ticker": "BBCA",
      "companyName": "Bank Central Asia",
      "date": "2024-12-27",
      "daysAgo": 0,
      "signal": "BUY",
      "reasons": ["RSI(14) oversold", "SMA(20,50) golden cross"],
      "price": 9850,
      "currentPrice": 10050,
      "sector": "Financials",
      "marketCap": "large",
      "stopLoss": 9350,
      "takeProfit": 10850,
      "riskRewardRatio": 2.0,
      "method": {
        "stopLoss": "FIXED",
        "takeProfit": "FIXED"
      }
    }
  ],
  "summary": {
    "totalSignals": 1,
    "uniqueStocks": 1,
    "byDay": {
      "2024-12-27": 1
    },
    "stocksScanned": 850,
    "passedFilters": 150,
    "passedFundamentals": 45
  }
}
```

Signal fields:

| Field | Type | Notes |
| --- | --- | --- |
| `ticker` | string | Stock ticker. |
| `companyName` | string | Company name. |
| `date` | string | Signal date `YYYY-MM-DD`. |
| `daysAgo` | number | 0 = most recent trading day. |
| `signal` | string | Always `BUY`. |
| `reasons` | string[] | Indicator reason strings. |
| `price` | number | Close price on signal day. |
| `currentPrice` | number | Latest close as of `dateRange.to`. |
| `sector` | string | Dataset sector. |
| `marketCap` | string | `small`, `mid`, `large`. |
| `stopLoss` | number | Suggested SL (signal-day close). |
| `takeProfit` | number | Suggested TP (signal-day close). |
| `riskRewardRatio` | number | Present when TP is `RISK_REWARD`. |
| `method` | object | `{ stopLoss, takeProfit }` methods used. |

Screening summary fields:

| Field | Type | Notes |
| --- | --- | --- |
| `totalSignals` | number | Total BUY signals in scan window. |
| `uniqueStocks` | number | Distinct tickers with signals. |
| `byDay` | object | Map of `YYYY-MM-DD` -> count. |
| `stocksScanned` | number | Tickers scanned (latest snapshot). |
| `passedFilters` | number | Tickers passing stock filters. |
| `passedFundamentals` | number | Tickers passing fundamentals. |

`/run_backtest` response shape:

```json
{
  "summary": { ... },
  "trades": [ ... ],
  "dailyPortfolio": [ ... ],
  "monthlyPerformance": [ ... ],
  "recentSignals": { ... },
  "currentPortfolio": { ... },
  "dividends": [ ... ]
}
```

Complete `/run_backtest` response example:

```json
{
  "summary": {
    "initialCapital": 100000000,
    "finalValue": 112500000,
    "totalReturnIdr": 12500000,
    "totalReturn": 12.5,
    "annualizedReturn": 12.9,
    "benchmarkReturn": 8.4,
    "totalTrades": 2,
    "closedTrades": 1,
    "winningTrades": 1,
    "losingTrades": 0,
    "breakevenTrades": 0,
    "winRate": 100.0,
    "maxDrawdown": -3.2,
    "profitFactor": 2.4,
    "sharpeRatio": 1.45,
    "averageHoldingDays": 7,
    "bestTickers": [
      { "ticker": "BBCA", "totalReturnIdr": 600000, "totalReturnPct": 6.2, "trades": 1 }
    ]
  },
  "trades": [
    {
      "date": "2024-06-03",
      "ticker": "BBCA",
      "action": "BUY",
      "quantity": 1000,
      "price": 9850,
      "value": 9850000,
      "portfolioValue": 100000000,
      "reason": "RSI(14) oversold"
    },
    {
      "date": "2024-06-10",
      "ticker": "BBCA",
      "action": "SELL",
      "quantity": 1000,
      "price": 10450,
      "value": 10450000,
      "portfolioValue": 112500000,
      "reason": "Take profit hit (10500)",
      "profitLoss": 600000,
      "profitLossPercent": 6.2,
      "holdingDays": 7
    }
  ],
  "dailyPortfolio": [
    {
      "date": "2024-06-03",
      "portfolioValue": 100000000,
      "portfolioNormalized": 100,
      "ihsgValue": 100,
      "lq45Value": 100,
      "drawdown": 0
    },
    {
      "date": "2024-06-10",
      "portfolioValue": 112500000,
      "portfolioNormalized": 112.5,
      "ihsgValue": 102.1,
      "lq45Value": 101.3,
      "drawdown": 0
    }
  ],
  "monthlyPerformance": [
    {
      "month": "Jun 24",
      "winRate": 100,
      "returns": 12.5,
      "benchmarkReturns": 2.1,
      "probability": 0.9,
      "tradesCount": 1
    }
  ],
  "recentSignals": {
    "screeningId": "momentum_v1",
    "scannedDays": 5,
    "dateRange": { "from": "2024-06-03", "to": "2024-06-10" },
    "signals": [
      {
        "ticker": "BBCA",
        "companyName": "Bank Central Asia",
        "date": "2024-06-10",
        "daysAgo": 0,
        "signal": "BUY",
        "reasons": ["SMA(20,50) golden cross"],
        "price": 10450,
        "currentPrice": 10450,
        "sector": "Financials",
        "marketCap": "large",
        "stopLoss": 9950,
        "takeProfit": 11200,
        "riskRewardRatio": 2.0,
        "method": { "stopLoss": "FIXED", "takeProfit": "FIXED" }
      }
    ],
    "summary": {
      "totalSignals": 1,
      "uniqueStocks": 1,
      "byDay": { "2024-06-10": 1 },
      "stocksScanned": 850,
      "passedFilters": 150,
      "passedFundamentals": 45
    }
  },
  "currentPortfolio": {
    "cash": 112500000,
    "totalValue": 112500000,
    "openPositionsValue": 0,
    "openPositionsCount": 0,
    "positions": []
  },
  "dividends": []
}
```

Summary fields:

| Field | Type | Notes |
| --- | --- | --- |
| `initialCapital` | number | Starting cash. |
| `finalValue` | number | Final portfolio value. |
| `totalReturnIdr` | number | Net PnL in IDR. |
| `totalReturn` | number | Percent. |
| `annualizedReturn` | number | Percent. |
| `benchmarkReturn` | number | IHSG percent (if available). |
| `totalTrades` | number | BUY + SELL. |
| `closedTrades` | number | SELL only. |
| `winningTrades` | number | SELL only. |
| `losingTrades` | number | SELL only. |
| `breakevenTrades` | number | SELL only. |
| `winRate` | number | Percent. |
| `maxDrawdown` | number | Percent. |
| `profitFactor` | number | Gross profit / gross loss. |
| `sharpeRatio` | number | Daily Sharpe. |
| `averageHoldingDays` | number | SELL only. |
| `bestTickers` | array | Top 3 tickers by total profit. |

Trade fields:

| Field | Type | Notes |
| --- | --- | --- |
| `date` | string | Trade date `YYYY-MM-DD`. |
| `ticker` | string | Stock ticker. |
| `action` | string | `BUY` or `SELL`. |
| `quantity` | number | Share count. |
| `price` | number | Executed price (after slippage). |
| `value` | number | Cash impact (after fees). |
| `portfolioValue` | number | Portfolio value after trade. |
| `reason` | string | Signal/exit reason. |
| `profitLoss` | number | SELL only. |
| `profitLossPercent` | number | SELL only. |
| `holdingDays` | number | SELL only. |

DailyPortfolio fields:

| Field | Type | Notes |
| --- | --- | --- |
| `date` | string | `YYYY-MM-DD`. |
| `portfolioValue` | number | Mark-to-market value. |
| `portfolioNormalized` | number | 100 = start. |
| `ihsgValue` | number | IHSG normalized (if available). |
| `lq45Value` | number | LQ45 normalized (if available). |
| `drawdown` | number | Percent from peak. |

MonthlyPerformance fields:

| Field | Type | Notes |
| --- | --- | --- |
| `month` | string | Example: `"Mar 24"`. |
| `winRate` | number | Percent (closed trades). |
| `returns` | number | Portfolio return percent. |
| `benchmarkReturns` | number | IHSG percent (if available). |
| `probability` | number | 0-1 score. |
| `tradesCount` | number | Closed trades. |

CurrentPortfolio fields:

| Field | Type | Notes |
| --- | --- | --- |
| `cash` | number | Remaining cash. |
| `totalValue` | number | Cash + open positions. |
| `openPositionsValue` | number | Value of open positions. |
| `openPositionsCount` | number | Count of open positions. |
| `positions` | array | Sorted by market value desc. |
| `positions[].ticker` | string | Stock ticker. |
| `positions[].companyName` | string | Company name. |
| `positions[].quantity` | number | Share count. |
| `positions[].entryDate` | string | `YYYY-MM-DD`. |
| `positions[].entryPrice` | number | Buy price. |
| `positions[].currentPrice` | number | Last close in dataset. |
| `positions[].marketValue` | number | Quantity * currentPrice. |
| `positions[].unrealizedPnL` | number | PnL in IDR. |
| `positions[].unrealizedPnLPercent` | number | PnL percent. |
| `positions[].holdingDays` | number | Days since entry. |

Dividend event fields (if enabled):

| Field | Type | Notes |
| --- | --- | --- |
| `date` | string | Record date (trading day). |
| `ticker` | string | Stock ticker. |
| `quantity` | number | Shares held on record date. |
| `cash_amount` | number | Dividend per share (original currency). |
| `gross_amount` | number | Gross cash after FX conversion. |
| `net_amount` | number | Net cash after tax. |
| `currency` | string | Original currency. |
| `payment_date` | string | Trading day credited. |
| `record_date` | string | Trading day eligible. |
