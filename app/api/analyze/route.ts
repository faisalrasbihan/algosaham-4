import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureUserInDatabase } from "@/lib/ensure-user";
import {
    getDailyQuotaSnapshot,
    getUserWithSyncedSubscriptionState,
    incrementDailyQuotaUsage,
} from "@/lib/server/subscription-state";

const rawUrl = process.env.RAILWAY_URL || '';
const RAILWAY_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await ensureUserInDatabase();

        const user = await getUserWithSyncedSubscriptionState(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        const { limit, used } = getDailyQuotaSnapshot(user, "analyze");
        if (limit !== -1 && used >= limit) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Daily analysis limit reached",
                    message: `Anda telah menggunakan ${used}/${limit} analisis untuk hari ini. Upgrade paket Anda untuk lebih banyak.`,
                },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { ticker } = body;

        if (!ticker) {
            return NextResponse.json(
                { success: false, error: "Ticker is required" },
                { status: 400 }
            );
        }

        if (!RAILWAY_URL) {
            return NextResponse.json(
                { success: false, error: "Server config error", details: "RAILWAY_URL is not configured." },
                { status: 500 }
            );
        }

        // Call remote server analysis API
        const response = await fetch(`${RAILWAY_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Analyze API error HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();

        await incrementDailyQuotaUsage(userId, "analyze");

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        console.error("Error analyzing ticker:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to analyze ticker",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
