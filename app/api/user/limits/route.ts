import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            tier: user.subscriptionTier || 'ritel',
            subscriptionPeriodEnd: user.subscriptionPeriodEnd,
            limits: {
                backtest: user.backtestLimit,
                subscriptions: user.subscriptionsLimit,
                savedStrategies: user.savedStrategiesLimit,
                aiChat: user.aiChatLimit,
                analyze: user.analyzeLimit
            },
            usage: {
                backtest: user.backtestUsedToday || 0,
                subscriptions: user.subscriptionsCount || 0,
                savedStrategies: user.savedStrategiesCount || 0,
                aiChat: user.aiChatUsedToday || 0,
                analyze: user.analyzeUsedToday || 0
            }
        });

    } catch (error) {
        console.error("Error fetching user limits:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
