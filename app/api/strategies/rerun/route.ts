import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { strategies, users, subscriptions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { BacktestRequest } from "@/lib/api";

const rawUrl = process.env.RAILWAY_URL || '';
const RAILWAY_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

// Helper function to calculate quality score from Sharpe ratio
function calculateQualityScore(sharpeRatio: number | null | undefined): string {
    if (sharpeRatio === null || sharpeRatio === undefined) {
        return "Unknown";
    }
    if (sharpeRatio < 1.0) {
        return "Poor";
    } else if (sharpeRatio >= 1.0 && sharpeRatio <= 2.0) {
        return "Good";
    } else {
        return "Excellent";
    }
}

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

        const config = strategy.config as BacktestRequest;

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

        if (!RAILWAY_URL) {
            return NextResponse.json(
                { success: false, error: "Server configuration error", details: "RAILWAY_URL is not configured." },
                { status: 500 }
            );
        }

        // 3. Increment backtest limit for user
        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        if (user) {
            const limit = user.backtestLimit;
            const used = user.backtestUsedToday || 0;

            if (limit !== -1 && used >= limit) {
                return NextResponse.json(
                    {
                        error: "Daily backtest limit reached",
                        message: `You have used ${used}/${limit} backtests for today. Upgrade your plan for more.`
                    },
                    { status: 403 }
                );
            }
        }

        // 4. Hit Backtest API
        const fastApiRequest = { config };
        const response = await fetch(`${RAILWAY_URL}/run_backtest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fastApiRequest),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Railway error HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const backtestResults = await response.json();

        // Increment user's backtest usage
        await db.update(users)
            .set({ backtestUsedToday: sql`${users.backtestUsedToday} + 1` })
            .where(eq(users.clerkId, userId));

        // 5. Extract metadata from results
        const totalReturn = backtestResults?.summary?.totalReturn ?? null;
        const maxDrawdown = backtestResults?.summary?.maxDrawdown ?? null;
        const successRate = backtestResults?.summary?.winRate ?? null;
        const totalTrades = backtestResults?.summary?.totalTrades ?? 0;
        const sharpeRatio = backtestResults?.summary?.sharpeRatio ?? null;

        let totalStocks = 0;
        if (backtestResults?.signals && Array.isArray(backtestResults.signals)) {
            totalStocks = new Set(backtestResults.signals.map((s: any) => s.ticker)).size;
        } else if ((backtestResults as any)?.recentSignals?.signals) {
            totalStocks = new Set((backtestResults as any).recentSignals.signals.map((s: any) => s.ticker)).size;
        }

        const qualityScore = calculateQualityScore(sharpeRatio);

        let topHoldings: { symbol: string; color?: string }[] = [];
        const allSignals = (backtestResults as any)?.recentSignals?.signals || backtestResults?.signals || [];
        if (Array.isArray(allSignals) && allSignals.length > 0) {
            const sortedSignals = [...allSignals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const uniqueTickers = new Set<string>();
            for (const signal of sortedSignals) {
                if (uniqueTickers.size >= 3) break;
                if (!uniqueTickers.has(signal.ticker)) {
                    uniqueTickers.add(signal.ticker);
                    const colors = ["bg-blue-600", "bg-orange-500", "bg-green-600", "bg-purple-600", "bg-red-600"];
                    const color = colors[uniqueTickers.size - 1] || "bg-gray-600";
                    topHoldings.push({ symbol: signal.ticker, color });
                }
            }
        }

        // 6. Update Database
        const updatedStrategies = await db.update(strategies)
            .set({
                config, // update config to include the new endDate
                totalReturn: totalReturn?.toString(),
                maxDrawdown: maxDrawdown?.toString(),
                successRate: successRate?.toString(),
                totalTrades,
                totalStocks,
                qualityScore,
                updatedAt: new Date(),
                topHoldings: topHoldings.length > 0 ? topHoldings : null,
            })
            .where(eq(strategies.id, strategyId))
            .returning();

        // 7. Note: A background worker could update all Subscribed strategy records, 
        //   but for now we are just returning the updated strategy to front-end.
        //   If we need to update active subs instantly:
        await db.update(subscriptions)
            .set({
                currentReturn: totalReturn?.toString(),
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
