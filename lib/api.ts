// API service for communicating with FastAPI backend

const isDev = process.env.NODE_ENV === 'development'
const log = isDev ? console.log.bind(console) : () => { }

export type FilterRule = {
  min?: number
  max?: number
}

export type TradingCosts = {
  brokerFee?: number
  sellFee?: number
  minimumFee?: number
  slippageBps?: number
  spreadBps?: number
}

export type PortfolioConfig = {
  positionSizePercent?: number
  minPositionPercent?: number
  maxPositions?: number
}

export type StopLossConfig =
  | {
    method: 'FIXED'
    percent: number
  }
  | {
    method: 'ATR'
    atrMultiplier: number
    atrPeriod?: number
  }

export type TakeProfitConfig =
  | {
    method: 'FIXED'
    percent: number
  }
  | {
    method: 'ATR'
    atrMultiplier: number
    atrPeriod?: number
  }
  | {
    method: 'RISK_REWARD'
    riskRewardRatio: number
  }

export type ExitSignalsConfig = {
  exitRules?: Array<'STOP_LOSS' | 'TAKE_PROFIT' | 'MAX_HOLD'>
  exitPriority?: Array<'STOP_LOSS' | 'TAKE_PROFIT' | 'MAX_HOLD'>
}

export type RiskManagementConfig = {
  stopLoss?: StopLossConfig
  takeProfit?: TakeProfitConfig
  maxHoldingDays?: number
  exitSignals?: ExitSignalsConfig
}

export type DividendPolicyConfig = {
  enabled?: boolean
  eligibilityDate?: string
  creditDate?: string
  baseCurrency?: string
  taxBps?: number
  fxRates?: Record<string, number>
  skipNonBaseCurrency?: boolean
}

export type FundamentalIndicatorConfig = {
  type: string
  min?: number
  max?: number
}

export type TechnicalIndicatorConfig = {
  type: string
  [key: string]: any
}

export type StrategyFilters = {
  marketCap?: string[]
  syariah?: boolean
  minDailyValue?: number
  tickers?: string[]
  sectors?: string[]
  rules?: Record<string, FilterRule>
}

export interface BacktestRequest {
  backtestId?: string
  screeningId?: string
  filters?: StrategyFilters
  fundamentalIndicators?: FundamentalIndicatorConfig[]
  technicalIndicators?: TechnicalIndicatorConfig[]
  signalAlignmentDays?: number
  backtestConfig?: {
    initialCapital: number
    startDate: string
    endDate: string
    tradingCosts?: TradingCosts
    portfolio?: PortfolioConfig
    riskManagement?: RiskManagementConfig
    dividendPolicy?: DividendPolicyConfig
    signalAlignmentDays?: number
  }
  riskManagement?: RiskManagementConfig
}

export interface ScreenerRequest {
  backtestId?: string
  screeningId?: string
  filters?: StrategyFilters
  fundamentalIndicators?: FundamentalIndicatorConfig[]
  technicalIndicators?: TechnicalIndicatorConfig[]
  signalAlignmentDays?: number
  riskManagement?: RiskManagementConfig
  backtestConfig?: BacktestRequest['backtestConfig']
}

export interface BacktestResult {
  summary?: {
    initialCapital: number
    finalValue: number
    totalReturnIdr?: number
    totalReturn: number
    annualizedReturn: number
    benchmarkReturn?: number
    totalTrades: number
    closedTrades?: number
    winningTrades: number
    losingTrades: number
    breakevenTrades?: number
    winRate: number
    maxDrawdown: number
    profitFactor?: number
    sharpeRatio: number
    averageHoldingDays: number
    bestTickers?: Array<{
      ticker: string
      totalReturnIdr: number
      totalReturnPct: number
      trades: number
    }>
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
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else {
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
