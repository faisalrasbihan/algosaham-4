import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { strategies, subscriptions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

        // 1. Check if subscription exists
        const existingSub = await db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.strategyId, strategyId)
            ),
        });

        if (!existingSub) {
            return NextResponse.json(
                { success: false, error: "Not subscribed to this strategy" },
                { status: 404 }
            );
        }

        // 2. Remove Subscription & Update Counts
        await db.transaction(async (tx) => {
            // Delete subscription
            await tx.delete(subscriptions)
                .where(and(
                    eq(subscriptions.userId, userId),
                    eq(subscriptions.strategyId, strategyId)
                ));

            // Decrement user's subscription count
            const user = await tx.query.users.findFirst({
                where: eq(users.clerkId, userId),
            });

            if (user && (user.subscriptionsCount || 0) > 0) {
                await tx.update(users)
                    .set({ subscriptionsCount: (user.subscriptionsCount || 0) - 1 })
                    .where(eq(users.clerkId, userId));
            }

            // Decrement strategy's subscriber count
            const strategy = await tx.query.strategies.findFirst({
                where: eq(strategies.id, strategyId),
            });

            if (strategy && (strategy.subscribers || 0) > 0) {
                await tx.update(strategies)
                    .set({ subscribers: (strategy.subscribers || 0) - 1 })
                    .where(eq(strategies.id, strategyId));
            }
        });

        return NextResponse.json({
            success: true,
            message: "Successfully unsubscribed from strategy",
        });

    } catch (error) {
        console.error("Error unsubscribing to strategy:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to unsubscribe",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
