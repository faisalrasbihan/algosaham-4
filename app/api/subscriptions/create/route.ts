import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSnapToken, createSubscription } from "@/lib/midtrans";
import { ensureUserInDatabase } from "@/lib/ensure-user";

// Plan pricing configuration
const PLAN_PRICING = {
    suhu: {
        monthly: 89500,
        yearly: 44750 * 12, // Annual price (50% discount)
    },
    bandar: {
        monthly: 189000,
        yearly: 94500 * 12, // Annual price (50% discount)
    },
} as const;

type PlanType = keyof typeof PLAN_PRICING;
type BillingInterval = 'monthly' | 'yearly';
type PaymentMethod = 'credit_card' | 'gopay';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to subscribe." },
                { status: 401 }
            );
        }

        // Ensure user exists in database (upsert logic)
        await ensureUserInDatabase();

        const user = await currentUser();
        const body = await request.json();

        const { planType, billingInterval, paymentMethod, gopayAccountId, gopayToken } = body as {
            planType: PlanType;
            billingInterval: BillingInterval;
            paymentMethod?: PaymentMethod;
            gopayAccountId?: string; // GoPay account_id for recurring
            gopayToken?: string; // GoPay token for recurring
        };

        // Validate plan type
        if (!planType || !PLAN_PRICING[planType]) {
            return NextResponse.json(
                { error: "Invalid plan type. Choose 'suhu' or 'bandar'." },
                { status: 400 }
            );
        }

        // Validate billing interval
        if (!billingInterval || !['monthly', 'yearly'].includes(billingInterval)) {
            return NextResponse.json(
                { error: "Invalid billing interval. Choose 'monthly' or 'yearly'." },
                { status: 400 }
            );
        }

        // Get price for selected plan and interval
        const amount = PLAN_PRICING[planType][billingInterval];

        // Generate unique order ID (max 50 chars for Midtrans)
        const shortUserId = userId.replace('user_', '').slice(0, 8);
        const orderId = `AS-${planType[0].toUpperCase()}-${shortUserId}-${Date.now()}`;

        // Determine payment method
        const method = paymentMethod || 'credit_card';

        // =====================================================
        // GOPAY RECURRING SUBSCRIPTION
        // =====================================================
        if (method === 'gopay') {
            // If we have tokenization data (account ID & token), create a recurring subscription
            // Otherwise, fallback to one-time payment via Snap
            if (gopayAccountId && gopayToken) {
                // Create a recurring subscription with GoPay
                try {
                    const subscriptionName = `AlgoSaham ${planType.charAt(0).toUpperCase() + planType.slice(1)} - ${billingInterval}`;

                    const subscription = await createSubscription({
                        name: subscriptionName,
                        amount: amount.toString(),
                        currency: 'IDR',
                        payment_type: 'gopay',
                        token: gopayToken,
                        schedule: {
                            interval: billingInterval === 'monthly' ? 1 : 12,
                            interval_unit: 'month',
                            max_interval: billingInterval === 'monthly' ? 12 : 5, // 1 year or 5 years max
                        },
                        gopay: {
                            account_id: gopayAccountId,
                        },
                        customer_details: {
                            first_name: user?.firstName || undefined,
                            last_name: user?.lastName || undefined,
                            email: user?.emailAddresses[0]?.emailAddress || undefined,
                            phone: user?.phoneNumbers[0]?.phoneNumber || undefined,
                        },
                        metadata: {
                            user_id: userId,
                            plan_type: planType,
                            billing_interval: billingInterval,
                        },
                    });

                    return NextResponse.json({
                        success: true,
                        data: {
                            subscriptionId: subscription.id,
                            status: subscription.status,
                            paymentMethod: 'gopay',
                            orderId,
                            amount,
                            planType,
                            billingInterval,
                        },
                    });
                } catch (error) {
                    console.error("Error creating GoPay subscription:", error);
                    return NextResponse.json(
                        { error: error instanceof Error ? error.message : "Failed to create GoPay subscription" },
                        { status: 500 }
                    );
                }
            } else {
                // Fallback: One-time payment using Snap
                // User will scan QR code or use Deeplink
                const snapResponse = await getSnapToken({
                    transaction_details: {
                        order_id: orderId,
                        gross_amount: amount,
                    },
                    customer_details: {
                        first_name: user?.firstName || undefined,
                        last_name: user?.lastName || undefined,
                        email: user?.emailAddresses[0]?.emailAddress || undefined,
                        phone: user?.phoneNumbers[0]?.phoneNumber || undefined,
                    },
                    // enabled_payments: ['gopay', 'qris'],
                    callbacks: {
                        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/harga?status=success`,
                        error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/harga?status=error`,
                        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/harga?status=pending`,
                    },
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        token: snapResponse.token,
                        redirectUrl: snapResponse.redirect_url,
                        paymentMethod: 'gopay',
                        orderId,
                        amount,
                        planType,
                        billingInterval,
                    },
                });
            }
        }

        // =====================================================
        // CREDIT CARD - USE SNAP FOR INITIAL PAYMENT
        // After successful payment, we'll create the recurring subscription
        // using the saved_token_id from the webhook
        // =====================================================

        // Get Snap token for payment popup
        const snapResponse = await getSnapToken({
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            credit_card: {
                secure: true,
                save_card: true, // Enable card saving for subscription
            },
            customer_details: {
                first_name: user?.firstName || undefined,
                last_name: user?.lastName || undefined,
                email: user?.emailAddresses[0]?.emailAddress || undefined,
                phone: user?.phoneNumbers[0]?.phoneNumber || undefined,
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/harga?status=success`,
                error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/harga?status=error`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/harga?status=pending`,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                token: snapResponse.token,
                redirectUrl: snapResponse.redirect_url,
                paymentMethod: 'credit_card',
                orderId,
                amount,
                planType,
                billingInterval,
            },
        });
    } catch (error) {
        console.error("Error creating subscription:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create subscription" },
            { status: 500 }
        );
    }
}
