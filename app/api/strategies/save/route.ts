import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { strategies, users } from "@/db/schema";
import { BacktestRequest } from "@/lib/api";
import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { ensureUserInDatabase } from "@/lib/ensure-user";
import { summarizeBacktestResult } from "@/lib/server/backtest";

// Helper function to generate config hash
function generateConfigHash(config: BacktestRequest): string {
    const configString = JSON.stringify(config);
    return crypto.createHash('sha256').update(configString).digest('hex').substring(0, 16);
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

        // Ensure user exists in database and retrieve user info
        const user = await ensureUserInDatabase();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, description, config, backtestResults, isPrivate } = body as {
            name: string;
            description: string;
            config: BacktestRequest;
            isPrivate?: boolean;
            backtestResults?: {
                summary?: {
                    totalReturn?: number;
                    maxDrawdown?: number;
                    winRate?: number;
                    totalTrades?: number;
                    sharpeRatio?: number;
                };
                signals?: any[];
            };
        };

        if (!name) {
            return NextResponse.json(
                { success: false, error: "Name is required" },
                { status: 400 }
            );
        }

        const userTier = user?.subscriptionTier || 'ritel';
        const limit = user?.savedStrategiesLimit ?? 1; // Default to 1 if not set
        const current = user?.savedStrategiesCount || 0;

        // Check limit (unless unlimited = -1)
        if (limit !== -1 && current >= limit) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Strategy limit reached",
                    message: `You have reached your limit of ${limit} saved strategies. Upgrade your plan to save more.`
                },
                { status: 403 }
            );
        }

        // Determine if strategy should be public
        // Free tier: always public (isPublic = true)
        // Bandar tier: can choose (isPublic = !isPrivate)
        // Other tiers: always public (isPublic = true)
        let isPublic = true;
        if (userTier === 'bandar' && isPrivate) {
            isPublic = false;
        }

        // Generate config hash for Redis linking
        const configHash = generateConfigHash(config);

        const metadata = summarizeBacktestResult(backtestResults);

        // Insert Strategy with metadata
        const [newStrategy] = await db.insert(strategies).values({
            name,
            description,
            creatorId: userId,
            configHash,
            config,
            totalReturn: metadata.totalReturn?.toString(),
            maxDrawdown: metadata.maxDrawdown?.toString(),
            successRate: metadata.successRate?.toString(),
            sharpeRatio: metadata.sharpeRatio?.toString(),
            totalTrades: metadata.totalTrades,
            totalStocks: metadata.totalStocks,
            qualityScore: metadata.qualityScore,
            isPublic,
            isActive: true,
            topHoldings: metadata.topHoldings,
        }).returning();

        // Increment user's saved strategies count safely using atomic sql update
        await db.update(users)
            .set({ savedStrategiesCount: sql`${users.savedStrategiesCount} + 1` })
            .where(eq(users.clerkId, userId));

        return NextResponse.json({
            success: true,
            data: newStrategy,
        });
    } catch (error) {
        console.error("Error saving strategy:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to save strategy",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
