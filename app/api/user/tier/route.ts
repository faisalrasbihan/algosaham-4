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

        // Fetch user from database
        const user = await getUserWithSyncedSubscriptionState(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            tier: user.subscriptionTier || "free",
        });
    } catch (error) {
        console.error("Error fetching user tier:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
