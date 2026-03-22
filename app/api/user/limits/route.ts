import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserWithSyncedSubscriptionState } from "@/lib/server/subscription-state";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await getUserWithSyncedSubscriptionState(userId);

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
                analyze: user.analyzeLimit,
                screening: user.screeningLimit,
                backtest: user.backtestLimit,
                subscriptions: user.subscriptionsLimit,
                savedStrategies: user.savedStrategiesLimit,
                aiChat: user.aiChatLimit,
            },
            usage: {
                analyze: user.analyzeUsedToday || 0,
                screening: user.screeningUsedToday || 0,
                backtest: user.backtestUsedToday || 0,
                subscriptions: user.subscriptionsCount || 0,
                savedStrategies: user.savedStrategiesCount || 0,
                aiChat: user.aiChatUsedToday || 0,
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
