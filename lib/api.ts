// API service for communicating with FastAPI backend

const isDev = process.env.NODE_ENV === 'development'
const log = isDev ? console.log.bind(console) : () => { }

export interface BacktestRequest {
  backtestId: string
  filters: {
    marketCap: string[]
    syariah: boolean
    minDailyValue?: number
    tickers?: string[]
    sectors?: string[]
  }
  fundamentalIndicators: Array<{
    type: string
    min?: number
    max?: number
  }>
  technicalIndicators: Array<{
    type: string
    [key: string]: any
  }>
  backtestConfig: {
    initialCapital: number
    startDate: string
    endDate: string
    tradingCosts: {
      brokerFee: number
      sellFee: number
      minimumFee: number
    }
    portfolio: {
      positionSizePercent: number
      minPositionPercent: number
      maxPositions: number
    }
    riskManagement: {
      stopLossPercent: number
      takeProfitPercent: number
      maxHoldingDays: number
    }
  }
}

export interface BacktestResult {
  summary?: {
    initialCapital: number
    finalValue: number
    totalReturn: number
    annualizedReturn: number
    totalTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    maxDrawdown: number
    sharpeRatio: number
    averageHoldingDays: number
    bestTrade?: {
      ticker: string
      return: number
    }
    worstTrade?: {
      ticker: string
      return: number
    }
  }
  recentSignals?: {
    scannedDays: number
    signals: Array<{
      date: string
      ticker: string
      companyName: string
      close?: number
      price?: number
      reasons: string | string[]
      indicators?: Record<string, number>
      daysAgo?: number
      signal?: string
      sector?: string
      marketCap?: string
    }>
    summary?: {
      totalSignals: number
      uniqueStocks: number
      byDay?: Record<string, number>
    }
  }
  signals?: Array<{
    date: string
    ticker: string
    companyName: string
    close: number
    reasons: string
    indicators?: Record<string, number>
  }>
  trades?: Array<{
    date: string
    ticker: string
    companyName: string
    action: 'BUY' | 'SELL'
    quantity: number
    price: number
    value: number
    portfolioValue: number
    reason: string
    profitLoss?: number
    profitLossPercent?: number
    holdingDays?: number
  }>
  dailyPortfolio?: Array<{
    date: string
    portfolioValue: number
    portfolioNormalized: number
    ihsgValue: number
    lq45Value: number
    drawdown: number
    month?: Record<string, any>
  }>
  performanceData?: Array<{
    date: string
    value: number
  }>
  monthlyReturns?: Record<string, number>
  monthlyPerformance?: Array<{
    month: string
    winRate: number
    returns: number
    benchmarkReturns: number
    probability: number
    tradesCount: number
  }>
  error?: string
}

export class ApiService {
  static async runBacktest(config: BacktestRequest, isInitial: boolean = false): Promise<BacktestResult> {
    try {
      const requestBody = { config, isInitial }
      log('📤 [REQUEST]', JSON.stringify(requestBody, null, 2))

      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message // Use the user-friendly message
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else {
            // Fallback to text if no JSON
            errorMessage = await response.text()
          }
        } catch (e) {
          errorMessage = await response.text()
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      log('📥 [RESPONSE]', JSON.stringify(result, null, 2))

      return result
    } catch (error) {
      console.error('❌ [ERROR]', error)
      throw error
    }
  }
}
