import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { strategies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import type { BacktestRequest } from "@/lib/api";
import { BacktestExecutionError, runBacktestWithQuota } from "@/lib/server/backtest";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { strategyId } = body;

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please log in to preview strategies." },
                { status: 401 }
            );
        }

        if (!strategyId) {
            return NextResponse.json(
                { success: false, error: "Strategy ID is required" },
                { status: 400 }
            );
        }

        // Validate that strategyId is a valid numeric ID
        const numericId = parseInt(strategyId);
        if (isNaN(numericId)) {
            return NextResponse.json(
                { success: false, error: "Preview tidak tersedia untuk strategi ini" },
                { status: 400 }
            );
        }

        // Fetch the strategy (must be public and active)
        const [strategy] = await db
            .select()
            .from(strategies)
            .where(
                and(
                    eq(strategies.id, numericId),
                    eq(strategies.isActive, true),
                    eq(strategies.isPublic, true)
                )
            )
            .limit(1);

        if (!strategy) {
            return NextResponse.json(
                { success: false, error: "Strategy not found" },
                { status: 404 }
            );
        }

        if (!strategy.config) {
            return NextResponse.json(
                { success: false, error: "Strategy config not available" },
                { status: 400 }
            );
        }

        const backtestResults = await runBacktestWithQuota({
            config: strategy.config as BacktestRequest,
            userId,
            requireUser: true,
            errors: {
                config: () => ({
                    status: 500,
                    body: { success: false, error: "Server configuration error" },
                }),
                userNotFound: () => ({
                    status: 404,
                    body: { success: false, error: "User not found" },
                }),
                quotaExceeded: () => ({
                    status: 403,
                    body: { success: false, error: "Daily backtest limit reached. Please upgrade your plan." },
                }),
                railway: ({ status, statusText, details }) => {
                    console.error("[PREVIEW] Railway error:", status, details.substring(0, 200));
                    return {
                        status,
                        body: { success: false, error: `Backtest failed: ${statusText}` },
                    };
                },
            },
        });

        return NextResponse.json({
            success: true,
            strategy: {
                id: strategy.id,
                name: strategy.name,
                description: strategy.description,
            },
            results: backtestResults,
        });
    } catch (error) {
        if (error instanceof BacktestExecutionError) {
            return NextResponse.json(error.body, { status: error.status });
        }

        console.error("[PREVIEW] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to preview strategy",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
