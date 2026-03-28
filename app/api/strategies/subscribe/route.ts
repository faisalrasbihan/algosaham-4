import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { strategies, subscriptions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const OFFICIAL_CREATOR_KEYWORDS = ["algosaham"];

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
        const parsedStrategyId = strategyId !== undefined && strategyId !== null ? Number(strategyId) : null;
        const hasValidStrategyId = parsedStrategyId !== null && Number.isFinite(parsedStrategyId);

        if (!hasValidStrategyId) {
            return NextResponse.json(
                { success: false, error: "A valid strategyId is required" },
                { status: 400 }
            );
        }

        // 1. Get user and check limits
        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        const limit = user.subscriptionsLimit;
        const current = user.subscriptionsCount || 0;

        // Check quota (unless unlimited = -1)
        if (limit !== -1 && current >= limit) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Subscription limit reached",
                    message: `Anda telah mencapai batas ${limit} langganan strategi. Upgrade paket Anda untuk mengikuti lebih banyak strategi.`
                },
                { status: 403 }
            );
        }

        // 2. Check if already subscribed
        const existingSub = await db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.strategyId, parsedStrategyId!)
            ),
        });

        if (existingSub) {
            return NextResponse.json(
                { success: false, error: "Already subscribed to this strategy" },
                { status: 400 }
            );
        }

        // 3. Get Strategy details for snapshot
        const strategy = await db.query.strategies.findFirst({
            where: eq(strategies.id, parsedStrategyId!),
            with: {
                creator: true,
            },
        });

        if (!strategy) {
            return NextResponse.json(
                { success: false, error: "Strategy not found" },
                { status: 404 }
            );
        }

        if (!strategy.isPublic) {
            return NextResponse.json(
                { success: false, error: "Cannot subscribe to a private strategy" },
                { status: 403 }
            );
        }

        const userTier = (user.subscriptionTier || "ritel").toLowerCase();
        const normalizedCreator = strategy.creator?.name?.trim().toLowerCase() || "";
        const isOfficialStrategy = OFFICIAL_CREATOR_KEYWORDS.some((keyword) => normalizedCreator.includes(keyword));

        if (userTier === "ritel" && isOfficialStrategy) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Official strategies require a paid plan",
                    message: "Strategi official hanya tersedia untuk plan Suhu dan Bandar. Upgrade plan untuk mulai berlangganan."
                },
                { status: 403 }
            );
        }

        // 4. Create Subscription
        await db.transaction(async (tx) => {
            await tx.insert(subscriptions).values({
                userId,
                strategyId: parsedStrategyId!,
                snapshotReturn: strategy.totalReturn,
                snapshotValue: null, // Can be set if we track portfolio value
                snapshotHoldings: strategy.topHoldings, // Top 3 stocks when subscribed
                snapshotDate: new Date(),
                currentReturn: strategy.totalReturn, // Store latest absolute strategy return
                isActive: true,
            });

            // 5. Increment user's subscription count
            await tx.update(users)
                .set({ subscriptionsCount: (user.subscriptionsCount || 0) + 1 })
                .where(eq(users.clerkId, userId));

            // 6. Increment strategy's subscriber count
            await tx.update(strategies)
                .set({ subscribers: (strategy.subscribers || 0) + 1 })
                .where(eq(strategies.id, parsedStrategyId!));
        });

        return NextResponse.json({
            success: true,
            message: "Successfully subscribed to strategy",
        });

    } catch (error) {
        console.error("Error subscribing to strategy:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to subscribe",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
