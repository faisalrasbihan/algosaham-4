import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { strategies, users } from "@/db/schema";
import { BacktestRequest } from "@/lib/api";
import crypto from "crypto";
import { eq } from "drizzle-orm";

// Helper function to ensure user exists in database
async function ensureUserExists(userId: string) {
    try {
        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        if (!existingUser) {
            // Get user details from Clerk
            const clerkUser = await currentUser();

            if (!clerkUser) {
                throw new Error("Could not fetch user from Clerk");
            }

            // Create user in database
            await db.insert(users).values({
                clerkId: userId,
                email: clerkUser.emailAddresses[0]?.emailAddress || '',
                name: clerkUser.firstName && clerkUser.lastName
                    ? `${clerkUser.firstName} ${clerkUser.lastName}`
                    : clerkUser.firstName || clerkUser.lastName || null,
                imageUrl: clerkUser.imageUrl || null,
                subscriptionTier: 'free',
                subscriptionStatus: 'active',
            });

            console.log('✅ User auto-created in database:', userId);
        }
    } catch (error) {
        console.error('❌ Error ensuring user exists:', error);
        throw error;
    }
}

// Helper function to calculate quality score from Sharpe ratio
function calculateQualityScore(sharpeRatio: number | null | undefined): string {
    if (sharpeRatio === null || sharpeRatio === undefined) {
        return "Unknown";
    }

    // Quality score ranges based on Sharpe ratio
    // Poor: < 1.0
    // Good: 1.0 - 2.0
    // Excellent: > 2.0
    if (sharpeRatio < 1.0) {
        return "Poor";
    } else if (sharpeRatio >= 1.0 && sharpeRatio <= 2.0) {
        return "Good";
    } else {
        return "Excellent";
    }
}

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

        // Ensure user exists in database (auto-create if needed)
        await ensureUserExists(userId);

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

        // Fetch user's subscription tier
        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        const userTier = user?.subscriptionTier || 'free';
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

        // Log the backtest results structure for debugging
        console.log('📊 Backtest Results Structure:', JSON.stringify({
            hasSummary: !!backtestResults?.summary,
            hasSignals: !!backtestResults?.signals,
            hasRecentSignals: !!(backtestResults as any)?.recentSignals,
            summaryKeys: backtestResults?.summary ? Object.keys(backtestResults.summary) : [],
            totalReturn: backtestResults?.summary?.totalReturn,
            winRate: backtestResults?.summary?.winRate,
            totalTrades: backtestResults?.summary?.totalTrades,
        }, null, 2));

        // Extract metadata from backtest results if available
        const totalReturn = backtestResults?.summary?.totalReturn ?? null;
        const maxDrawdown = backtestResults?.summary?.maxDrawdown ?? null;
        const successRate = backtestResults?.summary?.winRate ?? null;
        const totalTrades = backtestResults?.summary?.totalTrades ?? 0;
        const sharpeRatio = backtestResults?.summary?.sharpeRatio ?? null;

        // Calculate total unique stocks from signals (check both locations)
        let totalStocks = 0;
        if (backtestResults?.signals && Array.isArray(backtestResults.signals)) {
            totalStocks = new Set(backtestResults.signals.map((s: any) => s.ticker)).size;
        } else if ((backtestResults as any)?.recentSignals?.signals) {
            totalStocks = new Set((backtestResults as any).recentSignals.signals.map((s: any) => s.ticker)).size;
        }

        console.log('💾 Saving strategy with metadata:', {
            totalReturn,
            maxDrawdown,
            successRate,
            totalTrades,
            totalStocks,
            sharpeRatio,
        });

        // Calculate quality score from Sharpe ratio
        const qualityScore = calculateQualityScore(sharpeRatio);

        // Insert Strategy with metadata
        const [newStrategy] = await db.insert(strategies).values({
            name,
            description,
            creatorId: userId,
            configHash,
            totalReturn: totalReturn?.toString(),
            maxDrawdown: maxDrawdown?.toString(),
            successRate: successRate?.toString(),
            totalTrades,
            totalStocks,
            qualityScore,
            isPublic,
            isActive: true,
        }).returning();

        // Increment user's saved strategies count
        await db.update(users)
            .set({ savedStrategiesCount: (user?.savedStrategiesCount || 0) + 1 })
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
