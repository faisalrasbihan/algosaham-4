# API Architecture

This document outlines the API structure for the AlgoSaham application.

## Philosophy: Specific Endpoints vs General with Params

We use **specific endpoints** rather than a general endpoint with query parameters for these reasons:

### ✅ Advantages of Specific Endpoints

1. **Clarity**: `/api/strategies/popular` is immediately clear vs `/api/strategies?type=popular`
2. **Type Safety**: Each endpoint can have its own TypeScript interfaces
3. **Caching**: Easier to implement route-level caching strategies
4. **Maintainability**: Easier to track usage, modify behavior, and debug
5. **Performance**: Each endpoint is optimized for its specific use case
6. **Documentation**: Self-documenting REST structure

### API Structure

```
/api
  /strategies
    /popular          GET - Fetch top performing strategies (homepage)
    /[id]             GET - Fetch single strategy by ID
    /user/[userId]    GET - Fetch strategies by user
    /search           GET - Search strategies with filters
  /stocks
    /[symbol]         GET - Fetch stock details
    /search           GET - Search stocks
  /backtest
    /                 POST - Run backtest
```

## Current Endpoints

### `/api/strategies/popular` (GET)

Fetches popular/featured strategies for the homepage showcase.

**Query**: Selects strategies where `creator_id = 0` (system strategies)
**Order**: By `ytd_return DESC`
**Response**:
```typescript
{
  success: boolean
  data: Array<{
    id: number
    name: string
    description: string | null
    totalReturns: string | null
    ytdReturn: string | null
    maxDrawdown: string | null
    sharpeRatio: string | null
    winRate: string | null
    totalStocks: number | null
    // ... other metrics
  }>
  count: number
}
```

## Future Endpoints

As you build out the app, you can add:

- `/api/strategies/[id]` - Single strategy details
- `/api/strategies/user/[userId]` - User's created strategies
- `/api/strategies/search` - Search/filter strategies
- `/api/stocks/[symbol]` - Individual stock data
- `/api/trades/[strategyId]` - Trades for a strategy
- etc.

Each endpoint is focused, maintainable, and optimized for its use case.

