import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./db";
import { payments, users } from "./db/schema";
import { desc } from "drizzle-orm";

async function main() {
    console.log("Fetching recent payments...");
    const recentPayments = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(5);
    console.log("Recent Payments:");
    console.log(recentPayments.map(p => ({
        id: p.id,
        orderId: p.orderId,
        status: p.transactionStatus,
        tier: p.subscriptionTier,
        date: p.createdAt
    })));

    console.log("\nFetching recent users with non-ritel tier...");
    const premiumUsers = await db.select({
        id: users.id,
        email: users.email,
        tier: users.subscriptionTier,
        status: users.subscriptionStatus,
        updated: users.updatedAt
    }).from(users).orderBy(desc(users.updatedAt)).limit(5);
    console.log(premiumUsers);
    
    process.exit(0);
}

main().catch(console.error);
