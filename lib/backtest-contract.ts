import type {
  BacktestRequest,
  RiskManagementConfig,
  ScreenerRequest,
  StopLossConfig,
  TakeProfitConfig,
} from "@/lib/api";

const DEFAULT_BACKTEST_TRADING_COSTS = {
  brokerFee: 0.15,
  sellFee: 0.15,
  minimumFee: 1000,
  slippageBps: 0,
  spreadBps: 0,
} as const;

const DEFAULT_BACKTEST_PORTFOLIO = {
  positionSizePercent: 25,
  minPositionPercent: 5,
  maxPositions: 4,
} as const;

const DEFAULT_BACKTEST_RISK = {
  stopLossPercent: 7,
  takeProfitPercent: 15,
  maxHoldingDays: 14,
} as const;

const DEFAULT_SCREENING_RISK = {
  stopLossPercent: 8,
  takeProfitPercent: 20,
  maxHoldingDays: 60,
} as const;

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeStopLoss(
  value: unknown,
  fallbackPercent: number,
): StopLossConfig {
  if (isPlainObject(value) && (value.method === "FIXED" || value.method === "ATR")) {
    if (value.method === "FIXED") {
      return {
        method: "FIXED",
        percent: toFiniteNumber(value.percent) ?? fallbackPercent,
      };
    }

    return {
      method: "ATR",
      atrMultiplier: toFiniteNumber(value.atrMultiplier) ?? 2,
      atrPeriod: toFiniteNumber(value.atrPeriod) ?? 14,
    };
  }

  return {
    method: "FIXED",
    percent: toFiniteNumber(isPlainObject(value) ? value.stopLossPercent : undefined) ?? fallbackPercent,
  };
}

function normalizeTakeProfit(
  value: unknown,
  fallbackPercent: number,
): TakeProfitConfig {
  if (isPlainObject(value) && (value.method === "FIXED" || value.method === "ATR" || value.method === "RISK_REWARD")) {
    if (value.method === "FIXED") {
      return {
        method: "FIXED",
        percent: toFiniteNumber(value.percent) ?? fallbackPercent,
      };
    }

    if (value.method === "ATR") {
      return {
        method: "ATR",
        atrMultiplier: toFiniteNumber(value.atrMultiplier) ?? 2,
        atrPeriod: toFiniteNumber(value.atrPeriod) ?? 14,
      };
    }

    return {
      method: "RISK_REWARD",
      riskRewardRatio: toFiniteNumber(value.riskRewardRatio) ?? 2,
    };
  }

  return {
    method: "FIXED",
    percent: toFiniteNumber(isPlainObject(value) ? value.takeProfitPercent : undefined) ?? fallbackPercent,
  };
}

function normalizeRiskManagement(
  value: unknown,
  defaults: {
    stopLossPercent: number
    takeProfitPercent: number
    maxHoldingDays: number
  },
): RiskManagementConfig {
  const raw = isPlainObject(value) ? value : {};

  return {
    stopLoss: normalizeStopLoss(raw.stopLoss ?? raw, defaults.stopLossPercent),
    takeProfit: normalizeTakeProfit(raw.takeProfit ?? raw, defaults.takeProfitPercent),
    maxHoldingDays: toFiniteNumber(raw.maxHoldingDays) ?? defaults.maxHoldingDays,
    exitSignals: isPlainObject(raw.exitSignals)
      ? {
        exitRules: Array.isArray(raw.exitSignals.exitRules) ? raw.exitSignals.exitRules : undefined,
        exitPriority: Array.isArray(raw.exitSignals.exitPriority) ? raw.exitSignals.exitPriority : undefined,
      }
      : undefined,
  };
}

export function getFixedStopLossPercent(riskManagement?: RiskManagementConfig | null): number {
  const stopLoss = riskManagement?.stopLoss;
  return stopLoss?.method === "FIXED" ? stopLoss.percent : DEFAULT_BACKTEST_RISK.stopLossPercent;
}

export function getFixedTakeProfitPercent(riskManagement?: RiskManagementConfig | null): number {
  const takeProfit = riskManagement?.takeProfit;
  return takeProfit?.method === "FIXED" ? takeProfit.percent : DEFAULT_BACKTEST_RISK.takeProfitPercent;
}

export function normalizeBacktestContractConfig(config: BacktestRequest): BacktestRequest {
  const rawFilters = isPlainObject(config.filters) ? config.filters : {};
  const rawBacktestConfig: Record<string, any> = isPlainObject(config.backtestConfig) ? config.backtestConfig : {};

  return {
    backtestId:
      typeof config.backtestId === "string" && config.backtestId.trim().length > 0
        ? config.backtestId
        : `backtest_${Date.now()}`,
    filters: {
      marketCap:
        Array.isArray(rawFilters.marketCap) && rawFilters.marketCap.length > 0
          ? rawFilters.marketCap
          : ["large"],
      syariah: typeof rawFilters.syariah === "boolean" ? rawFilters.syariah : undefined,
      minDailyValue: toFiniteNumber(rawFilters.minDailyValue),
      tickers: Array.isArray(rawFilters.tickers) ? rawFilters.tickers : undefined,
      sectors: Array.isArray(rawFilters.sectors) ? rawFilters.sectors : undefined,
      rules: isPlainObject(rawFilters.rules) ? rawFilters.rules : undefined,
    },
    fundamentalIndicators: Array.isArray(config.fundamentalIndicators) ? config.fundamentalIndicators : [],
    technicalIndicators: Array.isArray(config.technicalIndicators) ? config.technicalIndicators : [],
    signalAlignmentDays:
      toFiniteNumber(config.signalAlignmentDays) ?? toFiniteNumber(rawBacktestConfig.signalAlignmentDays),
    backtestConfig: {
      initialCapital: toFiniteNumber(rawBacktestConfig.initialCapital) ?? 100000000,
      startDate:
        typeof rawBacktestConfig.startDate === "string" && rawBacktestConfig.startDate.trim().length > 0
          ? rawBacktestConfig.startDate
          : "2024-01-01",
      endDate:
        typeof rawBacktestConfig.endDate === "string" && rawBacktestConfig.endDate.trim().length > 0
          ? rawBacktestConfig.endDate
          : "2024-12-31",
      tradingCosts: {
        ...DEFAULT_BACKTEST_TRADING_COSTS,
        ...(isPlainObject(rawBacktestConfig.tradingCosts) ? rawBacktestConfig.tradingCosts : {}),
      },
      portfolio: {
        ...DEFAULT_BACKTEST_PORTFOLIO,
        ...(isPlainObject(rawBacktestConfig.portfolio) ? rawBacktestConfig.portfolio : {}),
      },
      riskManagement: normalizeRiskManagement(
        rawBacktestConfig.riskManagement,
        DEFAULT_BACKTEST_RISK,
      ),
      dividendPolicy: isPlainObject(rawBacktestConfig.dividendPolicy) ? rawBacktestConfig.dividendPolicy : undefined,
      signalAlignmentDays: toFiniteNumber(rawBacktestConfig.signalAlignmentDays),
    },
  };
}

export function normalizeScreeningContractConfig(config: ScreenerRequest): ScreenerRequest {
  const rawFilters = isPlainObject(config.filters) ? config.filters : {};
  const rawBacktestConfig: Record<string, any> = isPlainObject(config.backtestConfig) ? config.backtestConfig : {};
  const screeningId =
    typeof config.screeningId === "string" && config.screeningId.trim().length > 0
      ? config.screeningId
      : typeof config.backtestId === "string" && config.backtestId.trim().length > 0
        ? config.backtestId
        : `screening_${Date.now()}`;

  return {
    screeningId,
    filters: {
      marketCap: Array.isArray(rawFilters.marketCap) ? rawFilters.marketCap : undefined,
      syariah: typeof rawFilters.syariah === "boolean" ? rawFilters.syariah : undefined,
      minDailyValue: toFiniteNumber(rawFilters.minDailyValue),
      tickers: Array.isArray(rawFilters.tickers) ? rawFilters.tickers : undefined,
      sectors: Array.isArray(rawFilters.sectors) ? rawFilters.sectors : undefined,
      rules: isPlainObject(rawFilters.rules) ? rawFilters.rules : undefined,
    },
    fundamentalIndicators: Array.isArray(config.fundamentalIndicators) ? config.fundamentalIndicators : [],
    technicalIndicators: Array.isArray(config.technicalIndicators) ? config.technicalIndicators : [],
    signalAlignmentDays:
      toFiniteNumber(config.signalAlignmentDays) ?? toFiniteNumber(rawBacktestConfig.signalAlignmentDays),
    riskManagement: normalizeRiskManagement(
      config.riskManagement ?? rawBacktestConfig.riskManagement,
      DEFAULT_SCREENING_RISK,
    ),
  };
}
