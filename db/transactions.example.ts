/**
 * Example of using transactions with Drizzle ORM
 * Transactions ensure data consistency and atomicity
 */

import { db } from "./index";
import { strategies, indicators, trades } from "./schema";
import { eq } from "drizzle-orm";
import type { NewStrategy, NewIndicator, NewTrade } from "./types";

/**
 * Create a strategy with its indicators in a single transaction
 * If any operation fails, all changes are rolled back
 */
export async function createStrategyWithIndicators(
  strategyData: NewStrategy,
  indicatorsData: NewIndicator[]
) {
  return await db.transaction(async (tx) => {
    // Insert strategy
    const [newStrategy] = await tx
      .insert(strategies)
      .values(strategyData)
      .returning();

    // Insert indicators with the new strategy ID
    const newIndicators = await tx
      .insert(indicators)
      .values(
        indicatorsData.map((indicator) => ({
          ...indicator,
          strategyId: newStrategy.id,
        }))
      )
      .returning();

    return {
      strategy: newStrategy,
      indicators: newIndicators,
    };
  });
}

/**
 * Record multiple trades for a strategy
 * All trades are inserted atomically
 */
export async function recordStrategyTrades(
  strategyId: number,
  tradesData: Omit<NewTrade, "strategyId">[]
) {
  return await db.transaction(async (tx) => {
    // Insert all trades
    const newTrades = await tx
      .insert(trades)
      .values(
        tradesData.map((trade) => ({
          ...trade,
          strategyId,
        }))
      )
      .returning();

    // Update strategy metrics based on trades
    // (This is a simplified example - actual calculation would be more complex)
    const totalTrades = newTrades.length;
    
    await tx
      .update(strategies)
      .set({
        totalStocks: totalTrades,
      })
      .where(eq(strategies.id, strategyId));

    return newTrades;
  });
}

/**
 * Batch update multiple strategy performance metrics
 * Ensures all updates succeed or none do
 */
export async function updateMultipleStrategyMetrics(
  updates: Array<{
    strategyId: number;
    metrics: {
      totalReturns?: string;
      sharpeRatio?: string;
      maxDrawdown?: string;
    };
  }>
) {
  return await db.transaction(async (tx) => {
    const results = [];

    for (const update of updates) {
      const [result] = await tx
        .update(strategies)
        .set(update.metrics)
        .where(eq(strategies.id, update.strategyId))
        .returning();

      results.push(result);
    }

    return results;
  });
}

/**
 * Example of transaction with error handling
 */
export async function safeCreateStrategy(strategyData: NewStrategy) {
  try {
    return await db.transaction(async (tx) => {
      const [newStrategy] = await tx
        .insert(strategies)
        .values(strategyData)
        .returning();

      // You can add validation or additional operations here
      if (!newStrategy.name || newStrategy.name.trim() === "") {
        // Throwing an error will rollback the transaction
        throw new Error("Strategy name cannot be empty");
      }

      return newStrategy;
    });
  } catch (error) {
    console.error("Failed to create strategy:", error);
    throw error;
  }
}

