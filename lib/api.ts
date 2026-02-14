// API service for communicating with FastAPI backend

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
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    console.log('🌐 [API SERVICE] Making request to:', endpoint)
    console.log('🌐 [API SERVICE] Request options:', {
      method: options.method,
      headers: options.headers,
      body: options.body ? 'Body present' : 'No body'
    })

    const url = endpoint
    console.log('🌐 [API SERVICE] Full URL:', url)

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const finalOptions = { ...defaultOptions, ...options }
    console.log('🌐 [API SERVICE] Final request options:', finalOptions)

    try {
      console.log('📡 [API SERVICE] Sending fetch request...')
      const response = await fetch(url, finalOptions)

      console.log('📡 [API SERVICE] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [API SERVICE] Response not OK:', errorText)
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      console.log('✅ [API SERVICE] Response OK, parsing JSON...')
      const result = await response.json()
      console.log('📊 [API SERVICE] Parsed response keys:', Object.keys(result))
      console.log('📈 [API SERVICE] Response sample:', JSON.stringify(result, null, 2).substring(0, 300) + '...')

      return result
    } catch (error) {
      console.error('💥 [API SERVICE] Fetch error:', error)
      console.error('💥 [API SERVICE] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      throw error
    }
  }

  static async runBacktest(config: BacktestRequest): Promise<BacktestResult> {
    try {
      const requestBody = { config }
      console.log('📤 [REQUEST]', JSON.stringify(requestBody, null, 2))

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
      console.log('📥 [RESPONSE]', JSON.stringify(result, null, 2))

      return result
    } catch (error) {
      console.error('❌ [ERROR]', error)
      throw error
    }
  }
}
