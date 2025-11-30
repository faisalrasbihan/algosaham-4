/**
 * Example queries using Drizzle ORM
 * This file demonstrates common query patterns
 */

import { db } from "./index";
import { stocks, strategies, trades, fundamentals, indicators, subscriptions } from "./schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import type { NewStock, NewStrategy, NewTrade } from "./types";

// ============================================
// SELECT Queries
// ============================================

// Get all stocks
export async function getAllStocks() {
  return await db.select().from(stocks);
}

// Get stock by symbol
export async function getStockBySymbol(symbol: string) {
  return await db
    .select()
    .from(stocks)
    .where(eq(stocks.stockSymbol, symbol))
    .limit(1);
}

// Get all Syariah stocks
export async function getSyariahStocks() {
  return await db
    .select()
    .from(stocks)
    .where(eq(stocks.isSyariah, true));
}

// Get strategy with its indicators (using relations)
export async function getStrategyWithIndicators(strategyId: number) {
  return await db.query.strategies.findFirst({
    where: eq(strategies.id, strategyId),
    with: {
      indicators: true,
      trades: {
        with: {
          stock: true,
        },
      },
    },
  });
}

// Get top performing strategies
export async function getTopStrategies(limit: number = 10) {
  return await db
    .select()
    .from(strategies)
    .orderBy(desc(strategies.totalReturns))
    .limit(limit);
}

// Get trades for a specific strategy
export async function getStrategyTrades(strategyId: number) {
  return await db
    .select()
    .from(trades)
    .where(eq(trades.strategyId, strategyId))
    .orderBy(desc(trades.tradingDate));
}

// Get stock fundamentals for a date range
export async function getStockFundamentals(
  stockId: number,
  startDate: string,
  endDate: string
) {
  return await db
    .select()
    .from(fundamentals)
    .where(
      and(
        eq(fundamentals.stockId, stockId),
        gte(fundamentals.date, startDate),
        lte(fundamentals.date, endDate)
      )
    )
    .orderBy(desc(fundamentals.date));
}

// ============================================
// INSERT Queries
// ============================================

// Insert a new stock
export async function createStock(stock: NewStock) {
  return await db.insert(stocks).values(stock).returning();
}

// Insert a new strategy
export async function createStrategy(strategy: NewStrategy) {
  return await db.insert(strategies).values(strategy).returning();
}

// Insert multiple trades (batch insert)
export async function createTrades(tradesData: NewTrade[]) {
  return await db.insert(trades).values(tradesData).returning();
}

// ============================================
// UPDATE Queries
// ============================================

// Update strategy performance metrics
export async function updateStrategyMetrics(
  strategyId: number,
  metrics: {
    totalReturns?: string;
    sharpeRatio?: string;
    maxDrawdown?: string;
    winRate?: string;
  }
) {
  return await db
    .update(strategies)
    .set(metrics)
    .where(eq(strategies.id, strategyId))
    .returning();
}

// Update stock information
export async function updateStock(
  stockId: number,
  data: Partial<NewStock>
) {
  return await db
    .update(stocks)
    .set(data)
    .where(eq(stocks.id, stockId))
    .returning();
}

// ============================================
// DELETE Queries
// ============================================

// Delete a strategy (will cascade to related records based on your DB constraints)
export async function deleteStrategy(strategyId: number) {
  return await db
    .delete(strategies)
    .where(eq(strategies.id, strategyId))
    .returning();
}

// ============================================
// COMPLEX Queries with Joins
// ============================================

// Get user subscriptions with strategy details
export async function getUserSubscriptions(userId: number) {
  return await db.query.subscriptions.findMany({
    where: eq(subscriptions.userId, userId),
    with: {
      strategy: {
        with: {
          indicators: true,
        },
      },
    },
  });
}

// Get strategy performance with trade count
export async function getStrategyPerformance(strategyId: number) {
  const [strategy] = await db
    .select()
    .from(strategies)
    .where(eq(strategies.id, strategyId))
    .limit(1);

  const tradesList = await db
    .select()
    .from(trades)
    .where(eq(trades.strategyId, strategyId));

  return {
    ...strategy,
    totalTrades: tradesList.length,
    trades: tradesList,
  };
}

