import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSubscription } from "@/lib/midtrans";

// Midtrans webhook notification handler
// This endpoint receives payment status notifications from Midtrans

// GET handler for webhook health check (Midtrans tests the URL)
export async function GET(request: NextRequest) {
    return NextResponse.json({
        status: "ok",
        message: "Midtrans webhook endpoint is ready",
        timestamp: new Date().toISOString(),
    });
}


interface MidtransNotification {
    transaction_time: string;
    transaction_status: string;
    transaction_id: string;
    status_message: string;
    status_code: string;
    signature_key: string;
    settlement_time?: string;
    payment_type: string;
    order_id: string;
    merchant_id: string;
    gross_amount: string;
    fraud_status?: string;
    currency: string;
    // Card specific fields
    masked_card?: string;
    card_type?: string;
    bank?: string;
    approval_code?: string;
    channel_response_code?: string;
    channel_response_message?: string;
    // GoPay specific fields
    payment_option_type?: string;
    // Subscription specific fields
    saved_token_id?: string;
    saved_token_id_expired_at?: string;
    // Subscription notification type
    subscription_id?: string;
}

// Verify Midtrans signature
function verifySignature(notification: MidtransNotification): boolean {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const { order_id, status_code, gross_amount, signature_key } = notification;

    // SHA512(order_id + status_code + gross_amount + server_key)
    const payload = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const calculatedSignature = crypto.createHash('sha512').update(payload).digest('hex');

    return calculatedSignature === signature_key;
}

// Parse order ID to extract plan info
// Format: AS-{PLAN_INITIAL}-{USER_ID_SHORT}-{TIMESTAMP}
function parseOrderId(orderId: string): { planType: string; userId: string } | null {
    const parts = orderId.split('-');
    if (parts.length < 4 || parts[0] !== 'AS') {
        return null;
    }

    const planInitial = parts[1];
    const planType = planInitial === 'S' ? 'suhu' : planInitial === 'B' ? 'bandar' : 'free';
    const userId = parts[2];

    return { planType, userId };
}

// Determine billing interval from amount
function getBillingInterval(amount: string, planType: string): 'monthly' | 'yearly' {
    const numAmount = parseInt(amount, 10);

    // Monthly prices
    const monthlyPrices = { suhu: 89500, bandar: 189000 };

    // If the amount matches monthly price, it's monthly
    if (planType === 'suhu' && numAmount === monthlyPrices.suhu) return 'monthly';
    if (planType === 'bandar' && numAmount === monthlyPrices.bandar) return 'monthly';

    // Otherwise, it's yearly
    return 'yearly';
}

export async function POST(request: NextRequest) {
    try {
        const notification: MidtransNotification = await request.json();

        console.log("Received Midtrans notification:", {
            order_id: notification.order_id,
            transaction_status: notification.transaction_status,
            payment_type: notification.payment_type,
            subscription_id: notification.subscription_id,
        });

        // Verify Midtrans signature before processing any payment changes
        const isValidSignature = verifySignature(notification);
        if (!isValidSignature) {
            const isSandbox = process.env.MIDTRANS_MODE === 'sandbox';
            if (!isSandbox) {
                console.error("Invalid Midtrans signature for order:", notification.order_id);
                return NextResponse.json(
                    { error: "Invalid signature" },
                    { status: 403 }
                );
            }
            console.warn("Invalid signature for order (sandbox bypass):", notification.order_id);
        }

        const {
            order_id,
            transaction_status,
            transaction_id,
            payment_type,
            gross_amount,
            fraud_status,
            status_message,
            saved_token_id,
            subscription_id,
        } = notification;

        // Parse order ID to get user info
        const orderInfo = parseOrderId(order_id);
        if (!orderInfo) {
            console.log("Could not parse order ID:", order_id);
            return NextResponse.json({ success: true });
        }

        const { planType, userId } = orderInfo;
        const billingInterval = getBillingInterval(gross_amount, planType);

        // Handle different transaction statuses
        switch (transaction_status) {
            case 'capture':
                // For credit card transactions
                if (fraud_status === 'accept') {
                    await handleSuccessfulPayment({
                        orderId: order_id,
                        transactionId: transaction_id,
                        userId,
                        planType,
                        amount: gross_amount,
                        paymentType: payment_type,
                        savedTokenId: saved_token_id,
                        billingInterval,
                    });
                } else if (fraud_status === 'challenge') {
                    // Payment needs manual review
                    console.log(`Payment ${order_id} needs fraud review`);
                }
                break;

            case 'settlement':
                // Payment successful
                await handleSuccessfulPayment({
                    orderId: order_id,
                    transactionId: transaction_id,
                    userId,
                    planType,
                    amount: gross_amount,
                    paymentType: payment_type,
                    savedTokenId: saved_token_id,
                    billingInterval,
                });
                break;

            case 'pending':
                // Payment is pending
                console.log(`Payment ${order_id} is pending`);
                break;

            case 'deny':
            case 'cancel':
            case 'expire':
                // Payment failed/cancelled/expired
                console.log(`Payment ${order_id} status: ${transaction_status}`);
                await handleFailedPayment({
                    orderId: order_id,
                    transactionId: transaction_id,
                    userId,
                    status: transaction_status,
                    statusMessage: status_message,
                });
                break;

            case 'refund':
            case 'partial_refund':
                // Handle refund
                console.log(`Payment ${order_id} refunded`);
                await handleRefund({
                    orderId: order_id,
                    transactionId: transaction_id,
                    userId,
                });
                break;

            default:
                console.log(`Unknown transaction status: ${transaction_status}`);
        }

        // Handle subscription-specific notifications
        if (subscription_id) {
            console.log(`Subscription notification for ${subscription_id}: ${transaction_status}`);
            await handleSubscriptionNotification({
                subscriptionId: subscription_id,
                transactionStatus: transaction_status,
                userId,
            });
        }

        // Always return 200 OK to Midtrans
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing webhook:", error);
        // Still return 200 to prevent Midtrans from retrying
        return NextResponse.json({ success: true, error: "Internal processing error" });
    }
}

interface SuccessfulPaymentData {
    orderId: string;
    transactionId: string;
    userId: string;
    planType: string;
    amount: string;
    paymentType: string;
    savedTokenId?: string;
    billingInterval: 'monthly' | 'yearly';
}

async function handleSuccessfulPayment(data: SuccessfulPaymentData) {
    console.log("Processing successful payment:", data);

    try {
        // Import database utilities
        const { db } = await import("@/db");
        const { users, payments } = await import("@/db/schema");
        const { eq, like } = await import("drizzle-orm");

        // Calculate subscription period
        const now = new Date();
        const periodStart = now;
        let periodEnd: Date;

        if (data.billingInterval === 'monthly') {
            // Add 1 month
            periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else {
            // Add 1 year
            periodEnd = new Date(now);
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        // Find user by clerkId prefix (shortUserId = first 8 chars of clerkId after 'user_' prefix)
        // Use a targeted DB query instead of fetching all users
        const matchingUsers = await db.select().from(users)
            .where(like(users.clerkId, `user_${data.userId}%`))
            .limit(1);
        const user = matchingUsers[0];

        if (!user) {
            console.error(`User not found for userId: ${data.userId}`);
            return;
        }

        // Update user's subscription tier and period
        await db.update(users)
            .set({
                subscriptionTier: data.planType, // 'suhu' or 'bandar'
                subscriptionStatus: 'active',
                subscriptionPeriodStart: periodStart,
                subscriptionPeriodEnd: periodEnd,
                updatedAt: now,
            })
            .where(eq(users.clerkId, user.clerkId));

        console.log(`Updated user ${user.clerkId} to ${data.planType} tier until ${periodEnd.toISOString()}`);

        // Create payment record
        await db.insert(payments).values({
            userId: user.clerkId,
            orderId: data.orderId,
            transactionId: data.transactionId,
            transactionStatus: 'settlement',
            transactionTime: now,
            settlementTime: now,
            grossAmount: data.amount,
            currency: 'IDR',
            paymentType: data.paymentType,
            fraudStatus: 'accept',
            subscriptionTier: data.planType,
            billingPeriod: data.billingInterval,
            periodStart: periodStart,
            periodEnd: periodEnd,
            metadata: {
                savedTokenId: data.savedTokenId,
                initialPayment: true,
            },
        });

        console.log(`Created payment record for order ${data.orderId}`);

        // If we have a saved_token_id from credit card, create a recurring subscription
        if (data.savedTokenId && data.paymentType === 'credit_card') {
            try {
                console.log("Creating credit card recurring subscription with saved token...");

                const subscriptionName = `AlgoSaham ${data.planType.charAt(0).toUpperCase() + data.planType.slice(1)} - ${data.billingInterval}`;
                const amount = parseInt(data.amount, 10);

                // Get the monthly amount for recurring
                const monthlyAmount = data.billingInterval === 'yearly'
                    ? Math.round(amount / 12)  // Divide yearly amount by 12
                    : amount;

                const subscription = await createSubscription({
                    name: subscriptionName,
                    amount: monthlyAmount.toString(),
                    currency: 'IDR',
                    payment_type: 'credit_card',
                    token: data.savedTokenId,
                    schedule: {
                        interval: 1, // Always charge monthly
                        interval_unit: 'month',
                        max_interval: data.billingInterval === 'monthly' ? 12 : 12, // 1 year
                        start_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19), // Start in 30 days
                    },
                    customer_details: {
                        // Note: We don't have customer details here, they will come from the initial transaction
                    },
                    metadata: {
                        user_id: user.clerkId,
                        plan_type: data.planType,
                        billing_interval: data.billingInterval,
                        initial_order_id: data.orderId,
                    },
                });

                console.log(`Created recurring subscription ${subscription.id} for user ${user.clerkId}`);

                // TODO: Save subscription to paymentSubscriptions table if needed
                // await db.insert(paymentSubscriptions).values({ ... });

            } catch (error) {
                console.error("Error creating recurring subscription:", error);
                // Don't throw - the initial payment was still successful
            }
        }

        console.log(`Successfully processed payment for user ${user.clerkId}, plan: ${data.planType}`);
    } catch (error) {
        console.error("Error in handleSuccessfulPayment:", error);
        throw error;
    }
}

interface FailedPaymentData {
    orderId: string;
    transactionId: string;
    userId: string;
    status: string;
    statusMessage: string;
}

async function handleFailedPayment(data: FailedPaymentData) {
    console.log("Processing failed payment:", data);

    try {
        // Import database utilities
        const { db } = await import("@/db");
        const { users, payments } = await import("@/db/schema");
        const { like } = await import("drizzle-orm");

        // Find user by clerkId prefix (targeted query, no full-table scan)
        const matchingUsers = await db.select().from(users)
            .where(like(users.clerkId, `user_${data.userId}%`))
            .limit(1);
        const user = matchingUsers[0];

        if (!user) {
            console.error(`User not found for userId: ${data.userId}`);
            return;
        }

        // Parse order ID to get plan info
        const orderInfo = parseOrderId(data.orderId);
        if (!orderInfo) {
            console.error(`Could not parse order ID: ${data.orderId}`);
            return;
        }

        // Create payment record for failed payment
        await db.insert(payments).values({
            userId: user.clerkId,
            orderId: data.orderId,
            transactionId: data.transactionId,
            transactionStatus: data.status, // deny, cancel, expire
            transactionTime: new Date(),
            grossAmount: "0", // We don't have the amount in failed payment notification
            currency: 'IDR',
            paymentType: 'unknown',
            statusMessage: data.statusMessage,
            subscriptionTier: orderInfo.planType,
            metadata: {
                failureReason: data.statusMessage,
            },
        });

        console.log(`Recorded failed payment for user ${user.clerkId}: ${data.statusMessage}`);
    } catch (error) {
        console.error("Error in handleFailedPayment:", error);
    }
}

interface RefundData {
    orderId: string;
    transactionId: string;
    userId: string;
}

async function handleRefund(data: RefundData) {
    console.log("Processing refund:", data);

    // TODO: Update subscription status to cancelled
    // TODO: Create refund transaction record

    console.log(`Refund processed for user ${data.userId}`);
}

interface SubscriptionNotificationData {
    subscriptionId: string;
    transactionStatus: string;
    userId: string;
}

async function handleSubscriptionNotification(data: SubscriptionNotificationData) {
    console.log("Processing subscription notification:", data);

    // Handle recurring payment statuses
    switch (data.transactionStatus) {
        case 'settlement':
            console.log(`Recurring payment successful for subscription ${data.subscriptionId}`);
            // TODO: Extend subscription period
            // TODO: Create transaction record
            break;

        case 'deny':
        case 'expire':
            console.log(`Recurring payment failed for subscription ${data.subscriptionId}`);
            // TODO: Handle failed recurring payment
            // TODO: Maybe downgrade user plan or send notification
            break;

        default:
            console.log(`Subscription ${data.subscriptionId} status: ${data.transactionStatus}`);
    }
}
