import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPayAccount } from "@/lib/midtrans";

/**
 * Check GoPay Account Status
 * 
 * Poll this endpoint to check if the GoPay linking is complete.
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const accountId = searchParams.get('accountId');

        if (!accountId) {
            return NextResponse.json(
                { error: "Account ID is required" },
                { status: 400 }
            );
        }

        const accountStatus = await getPayAccount(accountId);

        return NextResponse.json({
            success: true,
            data: {
                accountId: accountStatus.account_id,
                status: accountStatus.account_status,
                paymentOptions: accountStatus.metadata?.payment_options,
            },
        });
    } catch (error) {
        console.error("Error checking GoPay status:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to check account status" },
            { status: 500 }
        );
    }
}
