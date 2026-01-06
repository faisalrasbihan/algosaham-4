---
description: Documentation for the AI Agent natural language interface, tools, and conversation flow.
globs: app/agent/**/*, components/chat/**/*
alwaysApply: false
---

# Agent Backtester API Documentation

## Overview

The Agent Backtester provides a **natural language interface** for building trading strategy configurations. Users chat with an AI agent that translates their investment goals into technical parameters.

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

**Key Principle**: The agent **only builds configurations** - it does NOT execute backtests. When the configuration is ready, the frontend shows a "Run Backtest" button that calls `/run_backtest`.

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

#### Response (Config Not Ready)

```json
{
  "response": "Great choice! For momentum trading on large caps, I recommend using RSI to catch oversold conditions and MACD for trend confirmation. Would you like me to set this up?",
  "config_ready": false,
  "backtest_config": null
}
```

#### Response (Config Ready)

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
      },
      {
        "type": "MACD",
        "fastPeriod": 12,
        "slowPeriod": 26,
        "signalPeriod": 9
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

## Agent Tools

The agent has access to these internal tools to build configurations:

### Stock Filters

| Tool | Description |
|------|-------------|
| `update_filters` | Set tickers, market cap, syariah, sectors |

**Parameters:**
- `tickers`: List of stock codes (e.g., ["BBCA", "BBRI"])
- `market_cap`: ["small", "mid", "large"]
- `syariah`: true/false
- `min_daily_value`: Minimum daily value in IDR
- `sectors`: List of sectors

### Technical Indicators

| Tool | Description |
|------|-------------|
| `add_technical_indicator` | Add buy/sell signal indicator |
| `remove_technical_indicator` | Remove an indicator |

**Supported Indicator Types:**

#### Moving Average (3)
- `SMA_CROSSOVER` - Golden/death cross signals
- `SMA_TREND` - Trend following
- `EMA_CROSSOVER` - Faster EMA crossover

#### Momentum (3)
- `RSI` - Relative Strength Index
- `MACD` - Moving Average Convergence Divergence
- `STOCHASTIC` - Stochastic Oscillator

#### Volatility (3)
- `BOLLINGER_BANDS` - Price channels
- `ATR` - Average True Range
- `VOLATILITY_BREAKOUT` - Volatility expansion

#### Volume (4)
- `VOLUME_SMA` - Volume spikes
- `OBV` - On-Balance Volume
- `VWAP` - Volume-Weighted Average Price
- `VOLUME_PRICE_TREND` - VPT indicator

#### Trend (3)
- `ADX` - Average Directional Index
- `PARABOLIC_SAR` - Stop and Reverse
- `SUPERTREND` - Supertrend indicator

#### Support/Resistance (3)
- `PIVOT_POINTS` - Floor trader levels
- `DONCHIAN_CHANNEL` - Breakout channels
- `KELTNER_CHANNEL` - ATR-based channels

#### Candlestick Patterns - Single (4)
- `DOJI` - Indecision reversal
- `HAMMER` - Bullish reversal
- `INVERTED_HAMMER` - Bullish reversal
- `BULLISH_MARUBOZU` - Strong momentum

#### Candlestick Patterns - Double (4)
- `BULLISH_ENGULFING` - Strong reversal
- `BULLISH_HARAMI` - Inside bar reversal
- `PIERCING_LINE` - Bullish reversal
- `TWEEZER_BOTTOM` - Support confirmation

#### Candlestick Patterns - Triple (3)
- `MORNING_STAR` - Three-candle reversal
- `THREE_WHITE_SOLDIERS` - Strong trend
- `THREE_INSIDE_UP` - Harami confirmation

#### Candlestick Patterns - Continuation (1)
- `RISING_THREE_METHODS` - Trend continuation

#### Chart Patterns - Reversal (2)
- `FALLING_WEDGE` - Bullish wedge breakout
- `DOUBLE_BOTTOM` - W-shaped reversal

#### Chart Patterns - Continuation (2)
- `BULL_FLAG` - Flag pattern breakout
- `ASCENDING_TRIANGLE` - Triangle breakout

**Total: 32 indicators**

### Fundamental Filters

| Tool | Description |
|------|-------------|
| `add_fundamental_filter` | Add fundamental criterion |
| `remove_fundamental_filter` | Remove a criterion |

**Supported Types:**
- `PE_RATIO` - Price to Earnings
- `PBV` - Price to Book Value
- `ROE` - Return on Equity
- `DE_RATIO` - Debt to Equity
- `ROA` - Return on Assets
- `NPM` - Net Profit Margin
- `EPS` - Earnings Per Share

### Configuration Management

| Tool | Description |
|------|-------------|
| `update_backtest_settings` | Set capital, dates, risk params |
| `get_config_summary` | Get current config state |
| `list_available_presets` | Show all preset strategies |
| `apply_preset` | Apply a strategy preset |
| `clear_config` | Reset configuration |
| `confirm_config_ready` | Validate and finalize config |

---

## Strategy Presets

The agent can apply these predefined strategies:

### Basic Presets

| Preset | Description | Risk |
|--------|-------------|------|
| `conservative` | Large-cap value stocks, PE<15, low debt | Low |
| `balanced` | Growth + value mix, PE<20, ROE>10 | Medium |
| `aggressive` | Momentum with SMA crossover + RSI | High |

### Trend-Based Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `trend_following` | Follow strong trends | ADX, Supertrend |

### Reversal Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `reversal` | Catch reversals | RSI, Engulfing |
| `double_bottom_hunter` | W-shaped patterns | Double Bottom, RSI |
| `falling_wedge` | Wedge breakouts | Falling Wedge, RSI |

### Value Investing Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `value_investor` | Cheap quality stocks | PE<12, PBV<1.5, ROE>12, SMA |
| `dividend_yield` | Quality dividend stocks | ROE>15, NPM>10, low debt |

### Momentum Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `momentum_trader` | Ride momentum | MACD, Volume |

### Breakout Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `breakout_hunter` | Channel breakouts | Donchian, Volume |
| `bull_flag_breakout` | Flag patterns | Bull Flag, Volume |
| `ascending_triangle` | Triangle breakouts | Ascending Triangle, ADX |

### Swing Trading Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `swing_trader` | Swing trades | RSI, Bollinger |

### Candlestick Presets

| Preset | Description | Indicators |
|--------|-------------|------------|
| `candlestick_reversal` | Pattern reversals | Hammer, Morning Star |
| `three_soldiers` | Strong momentum | Three White Soldiers, Volume |

### Syariah Preset

| Preset | Description | Filters |
|--------|-------------|---------|
| `syariah_conservative` | Syariah-compliant | Syariah=true, DE<0.8 |

---

## Conversation Flow Examples

### Example 1: Building from Scratch

```
User: "I want to find cheap stocks that are starting to go up"

Agent: "Great! That sounds like you want value stocks with momentum signals. 
       Let me set this up:
       - Filter: PE ratio < 15 (cheap)
       - Filter: ROE > 10% (profitable)
       - Signal: RSI when oversold (starting to go up)

       Should I add these to your configuration?"

User: "Yes"

Agent: [Calls tools internally]
       
       "Done! I've added:
       - PE Ratio < 15 (value filter)
       - ROE > 10% (quality filter)
       - RSI oversold signal (buy when RSI < 30)
       
       Your configuration is ready! Click 'Run Backtest' to see results."
```

### Example 2: Using a Preset

```
User: "Show me a conservative strategy"

Agent: [Calls apply_preset("conservative")]
       
       "Applied the 'conservative' preset! This strategy focuses on:
       - Large-cap stocks only
       - PE ratio < 15, Debt/Equity < 1
       - SMA trend following (20/50 day)
       - Stop loss: 5%, Take profit: 10%
       - Max holding: 60 days
       
       Your configuration is ready! Click 'Run Backtest' to see results."
```

### Example 3: Modifying Configuration

```
User: "Can you change the stop loss to 7%?"

Agent: [Calls update_backtest_settings(stop_loss_percent=7)]
       
       "Updated! Stop loss is now 7%. Here's your current config:
       [Shows summary]"
```

### Example 4: Pattern Trading

```
User: "I want to trade chart patterns like flags and wedges"

Agent: "Chart patterns are great for catching breakouts! I recommend:
       - Bull Flag: Catches continuation after strong moves
       - Falling Wedge: Catches bullish reversals
       
       Should I set these up with volume confirmation?"

User: "Yes please"

Agent: [Calls add_technical_indicator(BULL_FLAG)]
       [Calls add_technical_indicator(FALLING_WEDGE)]
       [Calls add_technical_indicator(VOLUME_SMA, threshold=1.5)]
       
       "Done! Note: Chart patterns work best with at least 3 months of data."
```

---

## Frontend Integration

### Session Management

```javascript
// Generate unique session ID
const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Store in localStorage for persistence
localStorage.setItem('backtester_session', sessionId);
```

### Chat Interface

```javascript
const [messages, setMessages] = useState([]);
const [configReady, setConfigReady] = useState(false);
const [backtestConfig, setBacktestConfig] = useState(null);

async function sendMessage(text) {
  // Add user message
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
  setResults(results);
  setLoading(false);
}
```

---

## Language Support

The agent supports both **English** and **Bahasa Indonesia**.

### Detection

The agent detects language from the first message:
- Bahasa keywords: "halo", "saya", "dalam bahasa", "saham", etc.
- Otherwise defaults to English

### Example (Bahasa)

```
User: "Halo, saya ingin mencari saham murah yang sedang naik"

Agent: "Halo! Sepertinya Anda mencari saham value dengan momentum bullish.
       Saya sarankan:
       - Filter PE Ratio < 15 (murah)
       - Filter ROE > 10% (profitable)
       - Sinyal RSI oversold (mulai naik)
       
       Apakah saya harus menambahkan ini ke konfigurasi Anda?"
```

### Translation Guide

| User Says | Technical Translation |
|-----------|----------------------|
| "saham murah" | PE_RATIO, PBV (low values) |
| "saham besar" | marketCap: ["large"] |
| "syariah" | syariah: true |
| "ikut tren" | SMA_CROSSOVER, SMA_TREND |
| "beli saat turun" | RSI oversold |
| "perbankan" | tickers: ["BBCA", "BBRI", "BMRI", "BBNI"] |

---

## Error Handling

### Common Agent Responses

**Unknown Indicator:**
```
"I don't recognize that indicator. Available indicators include: 
RSI, MACD, SMA_CROSSOVER, BOLLINGER_BANDS..."
```

**Invalid Preset:**
```
"I don't have a preset called 'xyz'. Available presets are: 
conservative, balanced, aggressive, trend_following..."
```

**Config Not Valid:**
```
"Your configuration isn't ready yet. You need at least one 
technical indicator for buy/sell signals. Would you like me 
to suggest one?"
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid request |
| 500 | Server error |
| 503 | Data cache not loaded |

---

## Quick Reference

### Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| Chat with agent | `/agent/invoke` | POST |
| Get config status | `/agent/config/{session_id}` | GET |
| Run backtest | `/run_backtest` | POST |

### Indicator Summary

| Category | Count | Examples |
|----------|-------|----------|
| Moving Average | 3 | SMA_CROSSOVER, EMA_CROSSOVER |
| Momentum | 3 | RSI, MACD, STOCHASTIC |
| Volatility | 3 | BOLLINGER_BANDS, ATR |
| Volume | 4 | VOLUME_SMA, OBV, VWAP |
| Trend | 3 | ADX, SUPERTREND |
| Support/Resistance | 3 | PIVOT_POINTS, DONCHIAN |
| Candlestick (Single) | 4 | HAMMER, DOJI |
| Candlestick (Double) | 4 | ENGULFING, HARAMI |
| Candlestick (Triple) | 3 | MORNING_STAR |
| Candlestick (Cont.) | 1 | RISING_THREE_METHODS |
| Chart Pattern (Rev.) | 2 | FALLING_WEDGE, DOUBLE_BOTTOM |
| Chart Pattern (Cont.) | 2 | BULL_FLAG, ASCENDING_TRIANGLE |
| **Total** | **32** | |

### Preset Summary

| Category | Presets |
|----------|---------|
| Basic | conservative, balanced, aggressive |
| Trend | trend_following |
| Reversal | reversal, double_bottom_hunter, falling_wedge |
| Value | value_investor, dividend_yield |
| Momentum | momentum_trader |
| Breakout | breakout_hunter, bull_flag_breakout, ascending_triangle |
| Swing | swing_trader |
| Candlestick | candlestick_reversal, three_soldiers |
| Syariah | syariah_conservative |
| **Total** | **17** |
