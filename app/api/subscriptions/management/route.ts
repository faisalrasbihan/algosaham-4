import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
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

        // Fetch latest successful payment
        const latestPayment = await db.query.payments.findFirst({
            where: and(
                eq(payments.userId, userId),
                eq(payments.transactionStatus, 'settlement')
            ),
            orderBy: [desc(payments.transactionTime)],
        });

        return NextResponse.json({
            success: true,
            tier: user.subscriptionTier || 'ritel',
            subscriptionStatus: user.subscriptionStatus || 'active',
            nextDue: user.subscriptionPeriodEnd,
            lastPaymentDate: latestPayment?.transactionTime,
            paymentMethod: latestPayment?.paymentType,
            limits: {
                analyze: user.analyzeLimit,
                screening: user.screeningLimit,
                backtest: user.backtestLimit,
                subscriptions: user.subscriptionsLimit,
                savedStrategies: user.savedStrategiesLimit,
            },
            usage: {
                analyze: user.analyzeUsedToday || 0,
                screening: user.screeningUsedToday || 0,
                backtest: user.backtestUsedToday || 0,
                subscriptions: user.subscriptionsCount || 0,
                savedStrategies: user.savedStrategiesCount || 0,
            }
        });

    } catch (error) {
        console.error("Error fetching subscription management data:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
