import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { strategies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BacktestExecutionError } from "@/lib/server/backtest";
import { refreshStrategyPerformance } from "@/lib/server/strategy-refresh";

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

        const { strategy: updatedStrategy } = await refreshStrategyPerformance(strategy, {
            userId,
            consumeQuota: true,
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
                        message: `Anda telah menggunakan ${used}/${limit} backtest untuk hari ini. Upgrade paket Anda untuk lebih banyak.`,
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

        return NextResponse.json({
            success: true,
            strategy: updatedStrategy,
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
