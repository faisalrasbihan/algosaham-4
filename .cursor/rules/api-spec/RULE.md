---
description: Official API specification for the Backtester and Agent endpoints (v2.0).
globs: app/api/**/*, lib/api/**/*
alwaysApply: false
---

# Backtester API Specification v2.0

## Overview

The Backtester API provides two main capabilities:
1. **Agent Chat** - Natural language interface to build trading strategy configurations
2. **Backtest Execution** - Run backtests and get performance results

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Agent Chat    │────▶│  Config Ready   │
│   (Chat UI)     │     │   /agent/invoke │     │  config_ready:  │
│                 │     │                 │     │  true           │
└─────────────────┘     └─────────────────┘     │                 │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Results UI    │◀────│  Run Backtest   │◀────│  User clicks    │
│   (Charts)      │     │  /run_backtest  │     │  "Run" button   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Endpoints

### 1. Chat with Agent

**POST** `/agent/invoke`

Build a trading strategy configuration through natural conversation.

#### Request

```json
{
  "input_text": "I want to test a momentum strategy on large cap stocks",
  "session_id": "user_abc123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input_text` | string | Yes | User's message |
| `session_id` | string | No | Session identifier (default: "default") |

#### Response

```json
{
  "response": "Great choice! For momentum trading...",
  "config_ready": false,
  "backtest_config": null
}
```

When configuration is complete and valid:

```json
{
  "response": "Your configuration is ready! Click 'Run Backtest' to see results.",
  "config_ready": true,
  "backtest_config": {
    "backtestId": "agent_abc123",
    "filters": {
      "marketCap": ["large"]
    },
    "fundamentalIndicators": [],
    "technicalIndicators": [
      {
        "type": "RSI",
        "period": 14,
        "oversold": 30,
        "overbought": 70
      }
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
}
```

| Field | Type | Description |
|-------|------|-------------|
| `response` | string | Agent's text response for chat display |
| `config_ready` | boolean | `true` when configuration is valid |
| `backtest_config` | object \| null | Full config when ready, `null` otherwise |

---

### 2. Get Configuration Status

**GET** `/agent/config/{session_id}`

Retrieve current configuration without chatting.

#### Response

```json
{
  "config_ready": true,
  "config": { /* backtest_config object */ },
  "summary": "📊 **Current Strategy Configuration**\n...",
  "validation_errors": []
}
```

---

### 3. Run Backtest

**POST** `/run_backtest`

Execute a backtest with the configuration from the agent.

#### Request

```json
{
  "config": {
    "backtestId": "agent_abc123",
    "filters": { },
    "fundamentalIndicators": [ ],
    "technicalIndicators": [ ],
    "backtestConfig": { }
  }
}
```

> **Note**: Pass the `backtest_config` object from `/agent/invoke` directly as `config`.

#### Response

```json
{
  "summary": {
    "initialCapital": 100000000,
    "finalValue": 112500000,
    "totalReturn": 12.5,
    "annualizedReturn": 15.2,
    "benchmarkReturn": 8.5,
    "totalTrades": 56,
    "closedTrades": 28,
    "winningTrades": 16,
    "losingTrades": 10,
    "breakevenTrades": 2,
    "winRate": 57.14,
    "maxDrawdown": -6.55,
    "sharpeRatio": 1.45,
    "averageHoldingDays": 12.5,
    "bestTrade": {
      "ticker": "BBCA",
      "return": 25.24
    },
    "worstTrade": {
      "ticker": "ASII",
      "return": -16.18
    }
  },
  "trades": [
    {
      "date": "2024-06-03",
      "ticker": "BBCA",
      "companyName": "Bank Central Asia Tbk",
      "action": "BUY",
      "quantity": 100,
      "price": 9500,
      "value": 950000,
      "portfolioValue": 99050000,
      "reason": "RSI(14) oversold (28.5)"
    },
    {
      "date": "2024-06-18",
      "ticker": "BBCA",
      "companyName": "Bank Central Asia Tbk",
      "action": "SELL",
      "quantity": 100,
      "price": 10450,
      "value": 1045000,
      "portfolioValue": 100095000,
      "reason": "Take profit hit",
      "profitLoss": 95000,
      "profitLossPercent": 10.0,
      "holdingDays": 15
    }
  ],
  "dailyPortfolio": [
    {
      "date": "2024-06-03",
      "portfolioValue": 100000000,
      "portfolioNormalized": 100.0,
      "ihsgValue": 100.0,
      "lq45Value": 100.0,
      "drawdown": 0
    },
    {
      "date": "2024-06-04",
      "portfolioValue": 100250000,
      "portfolioNormalized": 100.25,
      "ihsgValue": 100.15,
      "lq45Value": 100.12,
      "drawdown": 0
    }
  ],
  "monthlyPerformance": [
    {
      "month": "Jun 24",
      "winRate": 65,
      "returns": 4.2,
      "benchmarkReturns": 2.1,
      "probability": 0.68,
      "tradesCount": 12
    },
    {
      "month": "Jul 24",
      "winRate": 72,
      "returns": 7.8,
      "benchmarkReturns": 3.4,
      "probability": 0.74,
      "tradesCount": 8
    }
  ]
}
```

---

## Response Schema Details

### Summary Object

| Field | Type | Description |
|-------|------|-------------|
| `initialCapital` | number | Starting capital in IDR |
| `finalValue` | number | Ending portfolio value |
| `totalReturn` | number | Total return percentage |
| `annualizedReturn` | number | Annualized return percentage |
| `benchmarkReturn` | number \| null | IHSG return for comparison |
| `totalTrades` | number | All trades (BUY + SELL) |
| `closedTrades` | number | Only SELL trades (closed positions) |
| `winningTrades` | number | Trades with profit > 0 |
| `losingTrades` | number | Trades with profit < 0 |
| `breakevenTrades` | number | Trades with profit = 0 |
| `winRate` | number | Win percentage (wins / closedTrades × 100) |
| `maxDrawdown` | number | Maximum drawdown percentage (negative) |
| `sharpeRatio` | number | Risk-adjusted return metric |
| `averageHoldingDays` | number | Average days per trade |
| `bestTrade` | object | Best performing trade |
| `worstTrade` | object | Worst performing trade |

### Trade Object

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Trade date (YYYY-MM-DD) |
| `ticker` | string | Stock ticker |
| `companyName` | string | Company name |
| `action` | string | "BUY" or "SELL" |
| `quantity` | number | Number of shares |
| `price` | number | Price per share |
| `value` | number | Total trade value |
| `portfolioValue` | number | Portfolio value after trade |
| `reason` | string | Trade reason/signal |
| `profitLoss` | number | P&L in IDR (SELL only) |
| `profitLossPercent` | number | P&L percentage (SELL only) |
| `holdingDays` | number | Days held (SELL only) |

### Daily Portfolio Object

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date (YYYY-MM-DD) |
| `portfolioValue` | number | Absolute portfolio value |
| `portfolioNormalized` | number | Portfolio value normalized to 100 at start |
| `ihsgValue` | number \| null | IHSG normalized to 100 at start |
| `lq45Value` | number \| null | LQ45 normalized to 100 at start |
| `drawdown` | number | Current drawdown percentage |

> **Note**: Normalized values allow easy comparison on charts. All start at 100 on day 1.

### Monthly Performance Object

| Field | Type | Description |
|-------|------|-------------|
| `month` | string | Month label ("Jun 24", "Jul 24", etc.) |
| `winRate` | number \| null | Win rate % for trades closed this month |
| `returns` | number | Portfolio return % for the month |
| `benchmarkReturns` | number \| null | IHSG return % for the month |
| `probability` | number \| null | Win probability indicator (0-1) |
| `tradesCount` | number | Number of trades closed this month |

---

## Configuration Schema

### Full Configuration Object

```typescript
interface BacktestConfig {
  backtestId: string;
  filters: Filters;
  fundamentalIndicators: FundamentalIndicator[];
  technicalIndicators: TechnicalIndicator[];
  backtestConfig: BacktestSettings;
}

interface Filters {
  tickers?: string[];
  marketCap?: ("small" | "mid" | "large")[];
  syariah?: boolean;
  minDailyValue?: number;
  sectors?: string[];
}

interface FundamentalIndicator {
  type: "PE_RATIO" | "PBV" | "ROE" | "DE_RATIO" | "ROA" | "NPM" | "EPS";
  min?: number;
  max?: number;
}

interface TechnicalIndicator {
  type: string;
  // Parameters vary by type
}

interface BacktestSettings {
  initialCapital: number;
  startDate: string;
  endDate: string;
  tradingCosts: TradingCosts;
  portfolio: PortfolioSettings;
  riskManagement: RiskSettings;
}
```

### Technical Indicators

| Type | Parameters | Buy Signal |
|------|------------|------------|
| `SMA_CROSSOVER` | `shortPeriod`, `longPeriod` | Short MA crosses above long MA |
| `SMA_TREND` | `shortPeriod`, `longPeriod` | Short MA is above long MA |
| `RSI` | `period`, `oversold`, `overbought` | RSI below oversold level |
| `MACD` | `fastPeriod`, `slowPeriod`, `signalPeriod` | MACD crosses above signal |
| `BOLLINGER_BANDS` | `period`, `stdDev` | Price touches lower band |
| `VOLUME_SMA` | `period`, `threshold` | Volume above threshold × average |
| `OBV` | `period` | OBV trending up |
| `VWAP` | `period` | Price above VWAP |
| `VOLATILITY_BREAKOUT` | `period`, `multiplier` | Volatility expansion |
| `VOLUME_PRICE_TREND` | `period` | VPT confirms price |
| `ATR` | `period` | No direct signal (volatility only) |

---

## Frontend Integration

### Session Management

```javascript
// Generate unique session ID
const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Store in localStorage for persistence
localStorage.setItem('backtester_session', sessionId);
```

### Chat Interface Flow

```javascript
const [messages, setMessages] = useState([]);
const [configReady, setConfigReady] = useState(false);
const [backtestConfig, setBacktestConfig] = useState(null);

async function sendMessage(text) {
  // Add user message to chat
  setMessages(prev => [...prev, { role: 'user', content: text }]);

  const response = await fetch('/agent/invoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_text: text,
      session_id: sessionId
    })
  });

  const data = await response.json();

  // Add assistant message
  setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

  // Check if config is ready
  if (data.config_ready) {
    setConfigReady(true);
    setBacktestConfig(data.backtest_config);
  }
}
```

### Run Backtest Button

```jsx
{configReady && (
  <div className="config-ready-banner">
    <p>✅ Configuration is ready!</p>
    <button onClick={() => runBacktest(backtestConfig)}>
      Run Backtest
    </button>
  </div>
)}
```

### Execute Backtest

```javascript
async function runBacktest(config) {
  setLoading(true);
  
  const response = await fetch('/run_backtest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config })
  });

  const results = await response.json();
  
  // Navigate to results page or display inline
  setResults(results);
  setLoading(false);
}
```

### Charting Daily Performance

```javascript
// Use portfolioNormalized, ihsgValue, lq45Value for comparison chart
// All start at 100, making comparison easy

const chartData = results.dailyPortfolio.map(day => ({
  date: day.date,
  portfolio: day.portfolioNormalized,
  ihsg: day.ihsgValue,
  lq45: day.lq45Value
}));

// Recharts example
<LineChart data={chartData}>
  <XAxis dataKey="date" />
  <YAxis domain={['auto', 'auto']} />
  <Line dataKey="portfolio" stroke="#2563eb" name="Portfolio" />
  <Line dataKey="ihsg" stroke="#10b981" name="IHSG" />
  <Line dataKey="lq45" stroke="#f59e0b" name="LQ45" />
</LineChart>
```

### Monthly Performance Table

```jsx
// Matching your mockup UI
<table>
  <thead>
    <tr>
      <th></th>
      {results.monthlyPerformance.map(m => <th key={m.month}>{m.month}</th>)}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Win Rate (%)</td>
      {results.monthlyPerformance.map(m => (
        <td key={m.month} className={m.winRate >= 50 ? 'positive' : 'negative'}>
          {m.winRate}%
        </td>
      ))}
    </tr>
    <tr>
      <td>Returns (%)</td>
      {results.monthlyPerformance.map(m => (
        <td key={m.month} className={m.returns >= 0 ? 'positive' : 'negative'}>
          {m.returns >= 0 ? '+' : ''}{m.returns}%
        </td>
      ))}
    </tr>
    <tr>
      <td>Benchmark (%)</td>
      {results.monthlyPerformance.map(m => (
        <td key={m.month} className={m.benchmarkReturns >= 0 ? 'positive' : 'negative'}>
          {m.benchmarkReturns >= 0 ? '+' : ''}{m.benchmarkReturns}%
        </td>
      ))}
    </tr>
    <tr>
      <td>Probability</td>
      {results.monthlyPerformance.map(m => (
        <td key={m.month}>{m.probability?.toFixed(2)}</td>
      ))}
    </tr>
  </tbody>
</table>
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid configuration or request |
| 500 | Server error |
| 503 | Data cache not loaded (server starting) |

### Error Response

```json
{
  "detail": "Backtest failed: No data found for the specified date range"
}
```

### Validation Errors (from agent)

When config is incomplete, the agent explains what's missing:

```json
{
  "response": "Your configuration isn't ready yet. You need at least one technical indicator...",
  "config_ready": false,
  "backtest_config": null
}
```

---

## Health Check

**GET** `/health`

```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "info": {
      "total_records": 1170869,
      "date_range": {
        "min_date": "2020-01-02",
        "max_date": "2025-11-07"
      },
      "unique_tickers": 977
    }
  },
  "cache": {
    "loaded": true,
    "rows": 245678,
    "years": 1,
    "size_mb": 45.2
  }
}
```

---

## Quick Reference

| Action | Endpoint | Method |
|--------|----------|--------|
| Chat with agent | `/agent/invoke` | POST |
| Get config status | `/agent/config/{session_id}` | GET |
| Run backtest | `/run_backtest` | POST |
| Health check | `/health` | GET |
| Refresh cache | `/refresh_cache` | POST |

---

## Changelog

### v2.0 (Current)
- **Fixed win rate calculation** - Now only counts closed trades (SELL)
- **Added benchmark data** - IHSG and LQ45 in daily portfolio
- **New monthly performance** - Matches UI mockup with win rate, returns, benchmark, probability
- **Normalized values** - Portfolio and benchmarks normalized to 100 for easy comparison
- **New summary fields** - `closedTrades`, `breakevenTrades`, `benchmarkReturn`

### v1.1
- Agent no longer executes backtests
- Added `config_ready` and `backtest_config` to invoke response

### v1.0
- Initial API specification
