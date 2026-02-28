import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { strategies, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BacktestRequest } from "@/lib/api";
import { BacktestExecutionError, runBacktestWithQuota, summarizeBacktestResult } from "@/lib/server/backtest";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { strategyId } = body;

        if (!strategyId) {
            return NextResponse.json(
                { success: false, error: "Strategy ID is required" },
                { status: 400 }
            );
        }

        // 1. Get Strategy
        const strategy = await db.query.strategies.findFirst({
            where: eq(strategies.id, strategyId),
        });

        if (!strategy) {
            return NextResponse.json(
                { success: false, error: "Strategy not found" },
                { status: 404 }
            );
        }

        // Only the creator can rerun? Wait, if it's public, maybe subscribers can rerun?
        // But the user said "Rerun button on My Strategies section".
        // Let's ensure the user is the creator.
        if (strategy.creatorId !== userId) {
            return NextResponse.json(
                { success: false, error: "Not authorized to rerun this strategy" },
                { status: 403 }
            );
        }

        // 2. Extract Config
        if (!strategy.config) {
            return NextResponse.json(
                { success: false, error: "Config not found for this strategy. Please remake the strategy." },
                { status: 400 }
            );
        }

        const config = structuredClone(strategy.config as BacktestRequest);

        // Let's modify the end date to today for latest rerun
        const today = new Date();
        const endDateStr = today.toISOString().split('T')[0];
        // Calculate the same duration or just update end date 
        // We'll just set endDate to today to get the latest data.
        if (config.backtestConfig) {
            // Keep the same duration roughly or just use the start date defined in config
            // If they want to refresh, usually the end date is moved to today.
            config.backtestConfig.endDate = endDateStr;
        }

        const backtestResults = await runBacktestWithQuota({
            config,
            userId,
            requireUser: true,
            errors: {
                config: () => ({
                    status: 500,
                    body: {
                        success: false,
                        error: "Server configuration error",
                        details: "RAILWAY_URL is not configured.",
                    },
                }),
                userNotFound: () => ({
                    status: 404,
                    body: {
                        success: false,
                        error: "User not found",
                    },
                }),
                quotaExceeded: ({ used, limit }) => ({
                    status: 403,
                    body: {
                        error: "Daily backtest limit reached",
                        message: `You have used ${used}/${limit} backtests for today. Upgrade your plan for more.`,
                    },
                }),
                railway: ({ status, details }) => ({
                    status: 500,
                    body: {
                        success: false,
                        error: "Failed to rerun strategy",
                        message: `Railway error HTTP ${status}: ${details.substring(0, 100)}`,
                    },
                }),
            },
        });

        const metadata = summarizeBacktestResult(backtestResults);

        // 6. Update Database
        const updatedStrategies = await db.update(strategies)
            .set({
                config, // update config to include the new endDate
                totalReturn: metadata.totalReturn?.toString(),
                maxDrawdown: metadata.maxDrawdown?.toString(),
                successRate: metadata.successRate?.toString(),
                sharpeRatio: metadata.sharpeRatio?.toString(),
                totalTrades: metadata.totalTrades,
                totalStocks: metadata.totalStocks,
                qualityScore: metadata.qualityScore,
                updatedAt: new Date(),
                topHoldings: metadata.topHoldings,
            })
            .where(eq(strategies.id, strategyId))
            .returning();

        // 7. Note: A background worker could update all Subscribed strategy records, 
        //   but for now we are just returning the updated strategy to front-end.
        //   If we need to update active subs instantly:
        await db.update(subscriptions)
            .set({
                currentReturn: metadata.totalReturn?.toString(),
                updatedAt: new Date(),
                lastCalculatedAt: new Date()
            })
            .where(eq(subscriptions.strategyId, strategyId));

        return NextResponse.json({
            success: true,
            strategy: updatedStrategies[0],
            message: "Strategy backtest re-run successfully",
        });

    } catch (error) {
        if (error instanceof BacktestExecutionError) {
            return NextResponse.json(error.body, { status: error.status });
        }

        console.error("Error rerunning strategy:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to rerun strategy",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
