# Backtester API Specification

**Version:** 1.0.0  
**Base URL:** `https://your-api-domain.com`  
**Last Updated:** December 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Endpoints](#endpoints)
3. [Data Types & Enums](#data-types--enums)
4. [Backtest Configuration](#backtest-configuration)
5. [Screening Configuration](#screening-configuration)
6. [Response Formats](#response-formats)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

---

## Overview

The Backtester API provides endpoints for:
- Running backtests with customizable strategies
- Screening stocks based on filters and indicators
- Health monitoring

### Authentication
Currently no authentication required (to be added).

### Content Type
All requests and responses use `application/json`.

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Root - API status |
| `GET` | `/health` | Health check with database/cache status |
| `POST` | `/refresh_cache` | Refresh data cache |
| `POST` | `/run_backtest` | Run a backtest simulation |
| `POST` | `/screen_stocks` | Screen stocks based on criteria |

---

## Data Types & Enums

### Market Cap Groups

```
"small" | "mid" | "large"
```

**Note:** Values are **lowercase**.

### Technical Indicator Types

| Type | Description | Required Parameters |
|------|-------------|---------------------|
| `SMA_CROSSOVER` | Simple Moving Average Crossover | `shortPeriod`, `longPeriod` |
| `SMA_TREND` | SMA Trend Direction | `shortPeriod`, `longPeriod` |
| `RSI` | Relative Strength Index | `period`, `oversold`, `overbought` |
| `MACD` | Moving Average Convergence Divergence | `fastPeriod`, `slowPeriod`, `signalPeriod` |
| `BOLLINGER_BANDS` | Bollinger Bands | `period`, `stdDev` |
| `ATR` | Average True Range | `period` |
| `VOLATILITY_BREAKOUT` | Volatility Breakout | `period`, `multiplier` |
| `VOLUME_SMA` | Volume Moving Average | `period`, `threshold` |
| `OBV` | On-Balance Volume | `period` |
| `VWAP` | Volume Weighted Average Price | `period` |
| `VOLUME_PRICE_TREND` | Volume Price Trend | `period` |

**Note:** Type values are **UPPERCASE with underscores**.

### Fundamental Indicator Types

| Type | Description | Parameters |
|------|-------------|------------|
| `PE_RATIO` | Price to Earnings Ratio | `min`, `max` |
| `PBV` | Price to Book Value | `min`, `max` |
| `ROE` | Return on Equity (%) | `min`, `max` |
| `DE_RATIO` | Debt to Equity Ratio | `min`, `max` |
| `ROA` | Return on Assets (%) | `min`, `max` |
| `NPM` | Net Profit Margin (%) | `min`, `max` |
| `EPS` | Earnings Per Share | `min`, `max` |

**Note:** Type values are **UPPERCASE with underscores**.

---

## Backtest Configuration

### POST `/run_backtest`

#### Request Body

```json
{
  "config": {
    "backtestId": "string",
    "filters": { ... },
    "fundamentalIndicators": [ ... ],
    "technicalIndicators": [ ... ],
    "backtestConfig": { ... }
  }
}
```

#### Full Schema

```typescript
interface BacktestRequest {
  config: {
    // Unique identifier for this backtest
    backtestId: string;
    
    // Stock filters (all optional)
    filters: {
      // Specific tickers to include
      tickers?: string[];
      
      // Market cap filter: "small", "mid", "large"
      marketCap?: string[];
      
      // Minimum daily traded value (in IDR)
      minDailyValue?: number;
      
      // Syariah compliant only
      syariah?: boolean;
      
      // Sector filter
      sectors?: string[];
    };
    
    // Fundamental criteria (all optional)
    fundamentalIndicators: Array<{
      type: "PE_RATIO" | "PBV" | "ROE" | "DE_RATIO" | "ROA" | "NPM" | "EPS";
      min?: number;
      max?: number;
    }>;
    
    // Technical indicators (at least one recommended)
    technicalIndicators: Array<TechnicalIndicator>;
    
    // Backtest settings (required)
    backtestConfig: {
      initialCapital: number;      // Starting capital in IDR
      startDate: string;           // Format: "YYYY-MM-DD"
      endDate: string;             // Format: "YYYY-MM-DD"
      
      tradingCosts: {
        brokerFee: number;         // Buy fee as decimal (0.15 = 0.15%)
        sellFee: number;           // Sell fee as decimal
        minimumFee: number;        // Minimum fee in IDR
      };
      
      portfolio: {
        positionSizePercent: number;    // Max position size (1-100)
        minPositionPercent: number;     // Min position size (1-100)
        maxPositions: number;           // Max concurrent positions
      };
      
      riskManagement: {
        stopLossPercent: number;        // Stop loss percentage (e.g., 5)
        takeProfitPercent: number;      // Take profit percentage (e.g., 10)
        maxHoldingDays: number;         // Max days to hold position
      };
    };
  };
}
```

#### Technical Indicator Schemas

```typescript
// SMA Crossover
{
  type: "SMA_CROSSOVER";
  shortPeriod: number;  // e.g., 20
  longPeriod: number;   // e.g., 50
}

// SMA Trend
{
  type: "SMA_TREND";
  shortPeriod: number;
  longPeriod: number;
}

// RSI
{
  type: "RSI";
  period: number;       // e.g., 14
  oversold: number;     // e.g., 30
  overbought: number;   // e.g., 70
}

// MACD
{
  type: "MACD";
  fastPeriod: number;   // e.g., 12
  slowPeriod: number;   // e.g., 26
  signalPeriod: number; // e.g., 9
}

// Bollinger Bands
{
  type: "BOLLINGER_BANDS";
  period: number;       // e.g., 20
  stdDev: number;       // e.g., 2
}

// Volume SMA
{
  type: "VOLUME_SMA";
  period: number;       // e.g., 20
  threshold: number;    // e.g., 1.5 (150% of average)
}
```

---

## Screening Configuration

### POST `/screen_stocks`

#### Request Body

```json
{
  "config": {
    "screeningId": "string",
    "filters": { ... },
    "fundamentalIndicators": [ ... ],
    "technicalIndicators": [ ... ]
  }
}
```

#### Full Schema

```typescript
interface ScreeningRequest {
  config: {
    screeningId?: string;
    
    filters: {
      tickers?: string[];
      marketCap?: string[];
      minDailyValue?: number;
      syariah?: boolean;
      sectors?: string[];
    };
    
    fundamentalIndicators: Array<{
      type: "PE_RATIO" | "PBV" | "ROE" | "DE_RATIO" | "ROA" | "NPM" | "EPS";
      min?: number;
      max?: number;
    }>;
    
    technicalIndicators: Array<TechnicalIndicator>;
  };
}
```

---

## Response Formats

### Backtest Response

```typescript
interface BacktestResponse {
  summary: {
    initialCapital: number;
    finalValue: number;
    totalReturn: number;           // Percentage
    annualizedReturn: number;      // Percentage
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;               // Percentage
    maxDrawdown: number;           // Percentage (negative)
    sharpeRatio: number;
    averageHoldingDays: number;
    bestTrade: {
      ticker: string;
      return: number;
    };
    worstTrade: {
      ticker: string;
      return: number;
    };
  };
  
  trades: Array<{
    date: string;
    ticker: string;
    companyName: string;
    action: "BUY" | "SELL";
    quantity: number;
    price: number;
    value: number;
    portfolioValue: number;
    reason: string;
    profitLoss?: number;           // Only for SELL
    profitLossPercent?: number;    // Only for SELL
    holdingDays?: number;          // Only for SELL
  }>;
  
  dailyPortfolio: Array<{
    date: string;
    portfolioValue: number;
    benchmarkValue: number;
    drawdown: number;
  }>;
}
```

### Screening Response

```typescript
interface ScreeningResponse {
  totalStocks: number;
  
  screened: Array<{
    ticker: string;
    companyName: string;
    date: string;
    fundamentals?: {
      marketCapGroup?: string;
      isSyariah?: number;
      dailyValue?: number;
      sector?: string;
      peRatio?: number;
      pbv?: number;
      roe?: number;
      deRatio?: number;
    };
    technicals?: {
      buySignal: boolean;
      reasons: string;
    };
    indicators?: Record<string, number>;
  }>;
  
  summary: {
    totalFiltered: number;
    passedFilters: number;
    passedFundamentals: number;
    passedTechnicals: number;
  };
}
```

### Error Response

```typescript
interface ErrorResponse {
  detail: string;
}
```

---

## Error Handling

| Status Code | Meaning |
|-------------|---------|
| `200` | Success |
| `400` | Bad Request - Invalid configuration |
| `503` | Service Unavailable - Cache not loaded |
| `500` | Internal Server Error |

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Unknown indicator: xxx` | Invalid indicator type | Use exact type names (UPPERCASE) |
| `Cache not loaded` | Server starting up | Wait and retry |
| `KeyError: 'backtestConfig'` | Missing required field | Include all required fields |

---

## Examples

### Example 1: Simple SMA Crossover Backtest

```json
{
  "config": {
    "backtestId": "simple_sma_test",
    "filters": {
      "marketCap": ["large"]
    },
    "fundamentalIndicators": [],
    "technicalIndicators": [
      {
        "type": "SMA_CROSSOVER",
        "shortPeriod": 20,
        "longPeriod": 50
      }
    ],
    "backtestConfig": {
      "initialCapital": 100000000,
      "startDate": "2024-01-01",
      "endDate": "2024-06-30",
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

### Example 2: Value Investing with Fundamentals

```json
{
  "config": {
    "backtestId": "value_investing",
    "filters": {
      "marketCap": ["large", "mid"],
      "syariah": true
    },
    "fundamentalIndicators": [
      {"type": "PE_RATIO", "min": 0, "max": 15},
      {"type": "ROE", "min": 15},
      {"type": "DE_RATIO", "max": 1}
    ],
    "technicalIndicators": [
      {
        "type": "RSI",
        "period": 14,
        "oversold": 30,
        "overbought": 70
      }
    ],
    "backtestConfig": {
      "initialCapital": 500000000,
      "startDate": "2023-01-01",
      "endDate": "2024-01-01",
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
        "stopLossPercent": 8,
        "takeProfitPercent": 20,
        "maxHoldingDays": 60
      }
    }
  }
}
```

### Example 3: Specific Tickers Screening

```json
{
  "config": {
    "screeningId": "bank_stocks",
    "filters": {
      "tickers": ["BBCA", "BBRI", "BMRI", "BBNI"]
    },
    "fundamentalIndicators": [
      {"type": "PE_RATIO", "max": 20}
    ],
    "technicalIndicators": [
      {
        "type": "SMA_TREND",
        "shortPeriod": 20,
        "longPeriod": 50
      }
    ]
  }
}
```

### Example 4: Multi-Indicator Strategy

```json
{
  "config": {
    "backtestId": "multi_indicator",
    "filters": {
      "marketCap": ["large"],
      "minDailyValue": 1000000000
    },
    "fundamentalIndicators": [],
    "technicalIndicators": [
      {
        "type": "SMA_CROSSOVER",
        "shortPeriod": 10,
        "longPeriod": 30
      },
      {
        "type": "RSI",
        "period": 14,
        "oversold": 35,
        "overbought": 65
      },
      {
        "type": "VOLUME_SMA",
        "period": 20,
        "threshold": 1.5
      }
    ],
    "backtestConfig": {
      "initialCapital": 200000000,
      "startDate": "2024-01-01",
      "endDate": "2024-06-30",
      "tradingCosts": {
        "brokerFee": 0.15,
        "sellFee": 0.15,
        "minimumFee": 1000
      },
      "portfolio": {
        "positionSizePercent": 15,
        "minPositionPercent": 3,
        "maxPositions": 6
      },
      "riskManagement": {
        "stopLossPercent": 5,
        "takeProfitPercent": 12,
        "maxHoldingDays": 20
      }
    }
  }
}
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2024 | Initial specification |

---

## Contact

For questions or issues, contact the backend team.

