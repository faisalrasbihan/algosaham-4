/**
 * Simple database connection test
 * Run with: npx tsx db/test-connection.ts
 */

import { db } from "./index";
import { strategies } from "./schema";
import { eq } from "drizzle-orm";

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  try {
    console.log("📡 Attempting to connect to database...");

    // Try a simple query
    const result = await db
      .select()
      .from(strategies)
      .where(eq(strategies.creatorId, "0"))
      .limit(1);

    console.log("✅ Connection successful!");
    console.log(`📊 Found ${result.length} strategy(ies)\n`);

    if (result.length > 0) {
      console.log("Sample strategy:");
      console.log("  - ID:", result[0].id);
      console.log("  - Name:", result[0].name);
      console.log("  - Total Return:", result[0].totalReturn);
      console.log("  - Success Rate:", result[0].successRate);
      console.log("  - Quality Score:", result[0].qualityScore);
    }

    console.log("\n✨ Database is ready to use!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error("Error details:", error);

    if (error instanceof Error) {
      console.error("\nError message:", error.message);
      console.error("Error stack:", error.stack);
    }

    console.log("\n💡 Please check:");
    console.log("  1. FRONTEND_DB_URL is set correctly in .env");
    console.log("  2. Database server is running and accessible");
    console.log("  3. Credentials are correct");
    console.log("  4. Network/firewall allows the connection");

    process.exit(1);
  }
}

testConnection();
