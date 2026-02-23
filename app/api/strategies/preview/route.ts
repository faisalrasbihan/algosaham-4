import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { strategies } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const rawUrl = process.env.RAILWAY_URL || "";
const RAILWAY_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { strategyId } = body;

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

        if (!RAILWAY_URL || !rawUrl) {
            return NextResponse.json(
                { success: false, error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Run the backtest with the stored config
        const config = strategy.config as any;

        const response = await fetch(`${RAILWAY_URL}/run_backtest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[PREVIEW] Railway error:", response.status, errorText.substring(0, 200));
            return NextResponse.json(
                { success: false, error: `Backtest failed: ${response.statusText}` },
                { status: response.status }
            );
        }

        const backtestResults = await response.json();

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
