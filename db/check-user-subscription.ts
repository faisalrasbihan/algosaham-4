/**
 * Script to check user subscription status and recent payments
 * Run with: npx tsx db/check-user-subscription.ts
 */

import 'dotenv/config';
import { db } from './index';
import { users, payments } from './schema';
import { desc } from 'drizzle-orm';

async function checkUserSubscription() {
    try {
        console.log('🔍 Checking user subscription status...\n');

        // Get all users
        const allUsers = await db.select().from(users);
        console.log(`Found ${allUsers.length} users:\n`);

        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. User: ${user.email}`);
            console.log(`   Clerk ID: ${user.clerkId}`);
            console.log(`   Subscription Tier: ${user.subscriptionTier}`);
            console.log(`   Subscription Status: ${user.subscriptionStatus}`);
            console.log(`   Period Start: ${user.subscriptionPeriodStart || 'N/A'}`);
            console.log(`   Period End: ${user.subscriptionPeriodEnd || 'N/A'}`);
            console.log('');
        });

        // Get recent payments
        console.log('\n💳 Recent payments:\n');
        const recentPayments = await db
            .select()
            .from(payments)
            .orderBy(desc(payments.createdAt))
            .limit(10);

        if (recentPayments.length === 0) {
            console.log('No payments found in database.');
        } else {
            recentPayments.forEach((payment, index) => {
                console.log(`${index + 1}. Order ID: ${payment.orderId}`);
                console.log(`   User ID: ${payment.userId}`);
                console.log(`   Status: ${payment.transactionStatus}`);
                console.log(`   Amount: ${payment.grossAmount} ${payment.currency}`);
                console.log(`   Tier: ${payment.subscriptionTier}`);
                console.log(`   Billing: ${payment.billingPeriod}`);
                console.log(`   Payment Type: ${payment.paymentType}`);
                console.log(`   Created: ${payment.createdAt}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking subscription:', error);
        process.exit(1);
    }
}

checkUserSubscription();
