import { NextRequest, NextResponse } from "next/server";
import { getPayAccount } from "@/lib/midtrans";

/**
 * GoPay Account Linking Callback
 * 
 * This endpoint is called after the user completes GoPay linking in the GoPay app.
 * It verifies the account status and redirects the user back to the pricing page.
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const accountId = searchParams.get('account_id');

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        if (!userId) {
            console.error("GoPay callback: Missing userId");
            return NextResponse.redirect(`${baseUrl}/harga?gopay=error&message=missing_user`);
        }

        // If we have an account_id from Midtrans, check its status
        if (accountId) {
            try {
                const accountStatus = await getPayAccount(accountId);

                if (accountStatus.account_status === 'ENABLED') {
                    // Account successfully linked
                    // TODO: Save to database
                    console.log(`GoPay account ${accountId} successfully linked for user ${userId}`);

                    // Get the payment token from metadata
                    const paymentToken = accountStatus.metadata?.payment_options?.[0]?.token;

                    // Redirect to pricing page with success
                    const successUrl = new URL(`${baseUrl}/harga`);
                    successUrl.searchParams.set('gopay', 'success');
                    successUrl.searchParams.set('accountId', accountId);
                    if (paymentToken) {
                        successUrl.searchParams.set('token', paymentToken);
                    }

                    return NextResponse.redirect(successUrl.toString());
                } else if (accountStatus.account_status === 'PENDING') {
                    // Still pending, user might have cancelled
                    return NextResponse.redirect(`${baseUrl}/harga?gopay=pending`);
                } else {
                    // Expired or disabled
                    return NextResponse.redirect(`${baseUrl}/harga?gopay=error&status=${accountStatus.account_status}`);
                }
            } catch (error) {
                console.error("Error checking GoPay account status:", error);
                return NextResponse.redirect(`${baseUrl}/harga?gopay=error&message=status_check_failed`);
            }
        }

        // No account_id provided, redirect with error
        return NextResponse.redirect(`${baseUrl}/harga?gopay=error&message=no_account_id`);
    } catch (error) {
        console.error("GoPay callback error:", error);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/harga?gopay=error`);
    }
}
