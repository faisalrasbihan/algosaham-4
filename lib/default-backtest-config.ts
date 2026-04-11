import type { BacktestRequest } from "@/lib/api";
import { normalizeBacktestContractConfig } from "@/lib/backtest-contract";

export const STANDARD_BACKTEST_ID = "backtest_1775911462313";

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getStandardBacktestWindow(baseDate: Date = new Date()) {
  const endDate = new Date(baseDate);
  const startDate = new Date(baseDate);
  startDate.setFullYear(startDate.getFullYear() - 1);

  return {
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
  };
}

export function createStandardBacktestConfig(backtestId: string = `backtest_${Date.now()}`): BacktestRequest {
  const { startDate, endDate } = getStandardBacktestWindow();

  return normalizeBacktestContractConfig({
    backtestId,
    filters: {
      marketCap: ["large"],
      syariah: false,
      minDailyValue: 100000000,
      tickers: [],
    },
    fundamentalIndicators: [],
    technicalIndicators: [
      {
        type: "EMA_CROSSOVER",
        longPeriod: 26,
        shortPeriod: 8,
      },
    ],
    backtestConfig: {
      initialCapital: 100000000,
      startDate,
      endDate,
      tradingCosts: {
        brokerFee: 0.15,
        sellFee: 0.15,
        minimumFee: 1000,
        slippageBps: 0,
        spreadBps: 0,
      },
      portfolio: {
        positionSizePercent: 25,
        minPositionPercent: 5,
        maxPositions: 4,
      },
      riskManagement: {
        stopLoss: {
          method: "FIXED",
          percent: 8,
        },
        takeProfit: {
          method: "FIXED",
          percent: 30,
        },
        maxHoldingDays: 30,
      },
    },
  });
}

export function isStandardBacktestConfig(config: BacktestRequest | null | undefined) {
  if (!config?.backtestConfig || !config.filters) {
    return false;
  }

  const filters = config.filters;
  const technicalIndicators = config.technicalIndicators ?? [];
  const riskManagement = config.backtestConfig.riskManagement;

  if ((filters.marketCap ?? []).length !== 1 || filters.marketCap?.[0] !== "large") {
    return false;
  }

  if (filters.syariah !== false) {
    return false;
  }

  if ((filters.minDailyValue ?? 0) !== 100000000) {
    return false;
  }

  if ((filters.tickers ?? []).length !== 0) {
    return false;
  }

  if ((config.fundamentalIndicators ?? []).length !== 0) {
    return false;
  }

  if (technicalIndicators.length !== 1) {
    return false;
  }

  const indicator = technicalIndicators[0];
  if (indicator.type !== "EMA_CROSSOVER" || indicator.shortPeriod !== 8 || indicator.longPeriod !== 26) {
    return false;
  }

  return (
    config.backtestConfig.initialCapital === 100000000 &&
    config.backtestConfig.portfolio?.positionSizePercent === 25 &&
    config.backtestConfig.portfolio?.minPositionPercent === 5 &&
    config.backtestConfig.portfolio?.maxPositions === 4 &&
    config.backtestConfig.tradingCosts?.brokerFee === 0.15 &&
    config.backtestConfig.tradingCosts?.sellFee === 0.15 &&
    config.backtestConfig.tradingCosts?.minimumFee === 1000 &&
    config.backtestConfig.tradingCosts?.slippageBps === 0 &&
    config.backtestConfig.tradingCosts?.spreadBps === 0 &&
    riskManagement?.stopLoss?.method === "FIXED" &&
    riskManagement.stopLoss.percent === 8 &&
    riskManagement?.takeProfit?.method === "FIXED" &&
    riskManagement.takeProfit.percent === 30 &&
    riskManagement?.maxHoldingDays === 30
  );
}
