import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createPayAccount } from "@/lib/midtrans";

/**
 * GoPay Account Linking API
 * 
 * This endpoint initiates the GoPay account linking process.
 * The user will be redirected to GoPay app/website to authorize the linking.
 * After authorization, they'll be redirected back to the callback URL.
 * 
 * IMPORTANT: GoPay Tokenization must be enabled in your Midtrans Dashboard:
 * Settings > Payment Channels > Enable "GoPay Tokenization"
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to link your GoPay account." },
                { status: 401 }
            );
        }

        const user = await currentUser();
        const body = await request.json();

        const { phoneNumber } = body as {
            phoneNumber: string;
        };

        if (!phoneNumber) {
            return NextResponse.json(
                { error: "Phone number is required for GoPay linking." },
                { status: 400 }
            );
        }

        // Clean phone number - remove leading 0 and add country code format
        let cleanPhone = phoneNumber.replace(/\D/g, '');

        // Remove leading 62 if present (will be added as country code)
        if (cleanPhone.startsWith('62')) {
            cleanPhone = cleanPhone.substring(2);
        }
        // Remove leading 0 if present
        if (cleanPhone.startsWith('0')) {
            cleanPhone = cleanPhone.substring(1);
        }

        console.log("Initiating GoPay linking for phone:", cleanPhone);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirectUrl = `${baseUrl}/api/subscriptions/gopay/callback?userId=${userId}`;

        // Create GoPay Pay Account (initiate linking)
        const response = await createPayAccount({
            payment_type: 'gopay',
            gopay_partner: {
                phone_number: cleanPhone,
                country_code: '62', // Indonesia
                redirect_url: redirectUrl,
            },
        });

        // Log the full response for debugging
        console.log("Midtrans GoPay response:", JSON.stringify(response, null, 2));

        // Check if we got an error status - allow 201 (Created), 200 (OK), and 202 (Accepted/Pending)
        if (response.status_code && !['200', '201', '202'].includes(response.status_code)) {
            console.error("Midtrans returned error status:", response.status_code, response.status_message);
            throw new Error(`Midtrans error: ${response.status_code} - ${response.status_message || 'Unknown error'}`);
        }

        // Find the activation URL from actions - check various possible action names
        const possibleActionNames = [
            'activation-deeplink',
            'activation-web',
            'activate',
            'deeplink',
            'qr-code',
            'generate-qr-code'
        ];

        let activateAction = null;
        if (response.actions && Array.isArray(response.actions)) {
            console.log("Available actions:", response.actions.map(a => a.name));

            for (const actionName of possibleActionNames) {
                activateAction = response.actions.find(
                    (action) => action.name === actionName
                );
                if (activateAction) break;
            }

            // If still not found, just use the first action with a URL
            if (!activateAction && response.actions.length > 0) {
                activateAction = response.actions.find(action => action.url);
            }
        }

        if (!activateAction) {
            console.error("No activation action found. Full response:", response);

            // Check if GoPay Tokenization might not be enabled
            const errorMessage = !response.actions || response.actions.length === 0
                ? "GoPay Tokenization might not be enabled. Please enable it in Midtrans Dashboard: Settings > Payment Channels > GoPay Tokenization"
                : `No activation URL found. Available actions: ${response.actions?.map(a => a.name).join(', ') || 'none'}`;

            throw new Error(errorMessage);
        }

        return NextResponse.json({
            success: true,
            data: {
                accountId: response.account_id,
                accountStatus: response.account_status,
                activationUrl: activateAction.url,
                activationType: activateAction.name,
            },
        });
    } catch (error) {
        console.error("Error linking GoPay account:", error);

        // Provide more helpful error message
        let errorMessage = error instanceof Error ? error.message : "Failed to link GoPay account";

        // Check for common issues
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            errorMessage = "Invalid Midtrans credentials. Please check your MIDTRANS_SERVER_KEY.";
        } else if (errorMessage.includes('404')) {
            errorMessage = "GoPay Tokenization API not found. Make sure GoPay Tokenization is enabled in your Midtrans Dashboard.";
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
