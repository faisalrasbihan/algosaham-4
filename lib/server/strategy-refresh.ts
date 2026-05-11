import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { strategies, subscriptions } from "@/db/schema";
import type { BacktestRequest } from "@/lib/api";
import {
  type ErrorFactories,
  runBacktestWithQuota,
  summarizeBacktestResult,
} from "@/lib/server/backtest";

type RefreshableStrategy = Pick<typeof strategies.$inferSelect, "id" | "config">;

type StrategyRefreshFailure = {
  strategyId: number;
  name?: string | null;
  error: string;
};

type StrategyRefreshSkipped = {
  strategyId: number;
  name?: string | null;
  reason: string;
};

export type StrategyRefreshSummary = {
  refreshed: number;
  skipped: number;
  failed: number;
  refreshedStrategyIds: number[];
  skippedStrategies: StrategyRefreshSkipped[];
  errors: StrategyRefreshFailure[];
};

type RefreshStrategyPerformanceOptions = {
  userId?: string | null;
  consumeQuota?: boolean;
  requireUser?: boolean;
  errors?: ErrorFactories;
};

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function refreshStrategyPerformance(
  strategy: RefreshableStrategy,
  {
    userId,
    consumeQuota = true,
    requireUser = false,
    errors,
  }: RefreshStrategyPerformanceOptions = {},
) {
  const config = structuredClone(strategy.config as BacktestRequest);

  if (config.backtestConfig) {
    config.backtestConfig.endDate = getTodayDateString();
  }

  const backtestResults = await runBacktestWithQuota({
    config,
    userId,
    consumeQuota,
    requireUser,
    errors,
  });

  const metadata = summarizeBacktestResult(backtestResults);
  const now = new Date();

  const updatedStrategies = await db
    .update(strategies)
    .set({
      config,
      totalReturn: metadata.totalReturn?.toString(),
      maxDrawdown: metadata.maxDrawdown?.toString(),
      successRate: metadata.successRate?.toString(),
      sharpeRatio: metadata.sharpeRatio?.toString(),
      totalTrades: metadata.totalTrades,
      totalStocks: metadata.totalStocks,
      qualityScore: metadata.qualityScore,
      updatedAt: now,
      topHoldings: metadata.topHoldings,
    })
    .where(eq(strategies.id, strategy.id))
    .returning();

  await db
    .update(subscriptions)
    .set({
      currentReturn: metadata.totalReturn?.toString(),
      updatedAt: now,
      lastCalculatedAt: now,
    })
    .where(and(eq(subscriptions.strategyId, strategy.id), eq(subscriptions.isActive, true)));

  return {
    strategy: updatedStrategies[0],
    metadata,
  };
}

export async function refreshSubscribedActiveStrategies(): Promise<StrategyRefreshSummary> {
  const subscribedStrategies = await db
    .selectDistinct({
      id: strategies.id,
      name: strategies.name,
      config: strategies.config,
    })
    .from(strategies)
    .innerJoin(subscriptions, eq(subscriptions.strategyId, strategies.id))
    .where(and(eq(strategies.isActive, true), eq(subscriptions.isActive, true)));

  const summary: StrategyRefreshSummary = {
    refreshed: 0,
    skipped: 0,
    failed: 0,
    refreshedStrategyIds: [],
    skippedStrategies: [],
    errors: [],
  };

  for (const strategy of subscribedStrategies) {
    if (!strategy.config) {
      summary.skipped += 1;
      summary.skippedStrategies.push({
        strategyId: strategy.id,
        name: strategy.name,
        reason: "Missing strategy config",
      });
      continue;
    }

    try {
      await refreshStrategyPerformance(strategy, {
        consumeQuota: false,
        requireUser: false,
        errors: {
          config: () => ({
            status: 500,
            body: {
              success: false,
              error: "Server configuration error",
              details: "RAILWAY_URL is not configured.",
            },
          }),
          railway: ({ status, details }) => ({
            status: 500,
            body: {
              success: false,
              error: "Failed to refresh strategy",
              message: `Railway error HTTP ${status}: ${details.substring(0, 100)}`,
            },
          }),
        },
      });

      summary.refreshed += 1;
      summary.refreshedStrategyIds.push(strategy.id);
    } catch (error) {
      summary.failed += 1;
      summary.errors.push({
        strategyId: strategy.id,
        name: strategy.name,
        error: getErrorMessage(error),
      });
    }
  }

  return summary;
}
