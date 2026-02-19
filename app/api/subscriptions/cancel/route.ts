import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await db.update(users)
            .set({ subscriptionStatus: 'canceled' })
            .where(eq(users.clerkId, userId));

        return NextResponse.json({ success: true, message: "Subscription canceled successfully." });
    } catch (error) {
        console.error("Error canceling subscription:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
