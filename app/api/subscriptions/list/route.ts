import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { subscriptions, strategies, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userSubscriptions = await db
            .select({
                subscriptionId: subscriptions.id,
                subscribedAt: subscriptions.createdAt,
                snapshotHoldings: subscriptions.snapshotHoldings, // Add this
                strategy: {
                    id: strategies.id,
                    name: strategies.name,
                    description: strategies.description,
                    creatorId: strategies.creatorId,
                    creator: users.name, // Join to get creator name
                    totalReturn: strategies.totalReturn,
                    maxDrawdown: strategies.maxDrawdown,
                    successRate: strategies.successRate,
                    sharpeRatio: strategies.sharpeRatio,
                    totalTrades: strategies.totalTrades,
                    totalStocks: strategies.totalStocks,
                    subscribers: strategies.subscribers,
                    createdAt: strategies.createdAt,
                    // Subscription specific performance
                    returnSinceSubscription: subscriptions.currentReturn, // Assuming we track this
                }
            })
            .from(subscriptions)
            .innerJoin(strategies, eq(subscriptions.strategyId, strategies.id))
            .leftJoin(users, eq(strategies.creatorId, users.clerkId))
            .where(eq(subscriptions.userId, userId))
            .orderBy(desc(subscriptions.createdAt));

        // Format the response
        const formattedSubscriptions = userSubscriptions.map(sub => ({
            ...sub.strategy,
            subscriptionId: sub.subscriptionId,
            subscribedAt: sub.subscribedAt,
            snapshotHoldings: sub.snapshotHoldings, // Add this
            // Calculate return since subscription if needed, or use stored value
            // For now passing raw strategy data + subscription metadata
        }));

        return NextResponse.json({
            success: true,
            data: formattedSubscriptions
        });

    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
