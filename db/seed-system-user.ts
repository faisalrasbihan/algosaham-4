import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually (before importing db)
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
});

import { db } from "./index"
import { users } from "./schema"

async function seedSystemUser() {
    try {
        console.log("🌱 Seeding system user...")

        await db.insert(users).values({
            clerkId: "system_showcase",
            email: "showcase@algosaham.com",
            name: "AlgoSaham Official",
            subscriptionTier: "pro",
            subscriptionStatus: "active",
        }).onConflictDoNothing()

        console.log("✅ System user created successfully")
        console.log("   - Clerk ID: system_showcase")
        console.log("   - Name: AlgoSaham Official")
        console.log("   - Tier: Pro")

        process.exit(0)
    } catch (error) {
        console.error("❌ Error seeding system user:", error)
        process.exit(1)
    }
}

seedSystemUser()
