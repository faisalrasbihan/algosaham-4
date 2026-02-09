/**
 * Script to update existing users from 'free' to 'ritel' tier
 * Run with: npx tsx db/update-free-to-ritel.ts
 */

import 'dotenv/config';
import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function updateFreeTiers() {
    try {
        console.log('🔄 Updating users with "free" tier to "ritel"...\n');

        // Update all users with 'free' tier to 'ritel'
        const result = await db
            .update(users)
            .set({ subscriptionTier: 'ritel' })
            .where(eq(users.subscriptionTier, 'free'));

        console.log('✅ Updated users from "free" to "ritel"');

        // Also update 'pro' to 'bandar' if any exist
        const result2 = await db
            .update(users)
            .set({ subscriptionTier: 'bandar' })
            .where(eq(users.subscriptionTier, 'pro'));

        console.log('✅ Updated users from "pro" to "bandar"');

        // Show updated users
        console.log('\n📋 Current users:');
        const allUsers = await db.select().from(users);
        allUsers.forEach((user) => {
            console.log(`  - ${user.email}: ${user.subscriptionTier}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error updating tiers:', error);
        process.exit(1);
    }
}

updateFreeTiers();
