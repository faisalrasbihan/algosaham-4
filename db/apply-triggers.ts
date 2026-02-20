import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function applyTriggers() {
  console.log("🚀 Applying database triggers and functions...");

  try {
    // 1. Function to set quotas based on subscription tier
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION set_plan_quotas()
      RETURNS TRIGGER AS $$
      BEGIN
        CASE NEW.subscription_tier
          WHEN 'ritel' THEN
            NEW.analyze_limit := 5;
            NEW.backtest_limit := 5;
            NEW.saved_strategies_limit := 1;
            NEW.subscriptions_limit := 0;
            NEW.ai_chat_limit := 5;
            
          WHEN 'bandar' THEN
            NEW.analyze_limit := -1;
            NEW.backtest_limit := 25;
            NEW.saved_strategies_limit := 10;
            NEW.subscriptions_limit := 10;
            NEW.ai_chat_limit := -1;
            
          WHEN 'suhu' THEN
            NEW.analyze_limit := -1;
            NEW.backtest_limit := -1;
            NEW.saved_strategies_limit := 50;
            NEW.subscriptions_limit := 100;
            NEW.ai_chat_limit := -1;
        END CASE;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Created set_plan_quotas function");

    // 2. Trigger to auto-set quotas when tier changes
    // Drop trigger if exists to avoid error on recreation
    await db.execute(sql`DROP TRIGGER IF EXISTS set_quotas_on_tier_change ON users`);
    await db.execute(sql`
      CREATE TRIGGER set_quotas_on_tier_change
        BEFORE INSERT OR UPDATE OF subscription_tier ON users
        FOR EACH ROW
        EXECUTE FUNCTION set_plan_quotas();
    `);
    console.log("✅ Created set_quotas_on_tier_change trigger");

    // 3. Function to downgrade expired subscriptions to ritel
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION downgrade_expired_subscriptions()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.subscription_status = 'past_due' AND NEW.subscription_tier != 'ritel' THEN
          NEW.subscription_tier := 'ritel';
          NEW.subscription_status := 'expired';
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Created downgrade_expired_subscriptions function");

    // 4. Trigger to auto-downgrade on status change
    await db.execute(sql`DROP TRIGGER IF EXISTS downgrade_on_past_due ON users`);
    await db.execute(sql`
      CREATE TRIGGER downgrade_on_past_due
        BEFORE UPDATE OF subscription_status ON users
        FOR EACH ROW
        EXECUTE FUNCTION downgrade_expired_subscriptions();
    `);
    console.log("✅ Created downgrade_on_past_due trigger");

    // 5. Function to reset daily quotas
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION reset_daily_quotas()
      RETURNS void AS $$
      BEGIN
        UPDATE users
        SET 
          analyze_used_today = 0,
          analyze_last_reset = now(),
          backtest_used_today = 0,
          backtest_last_reset = now(),
          ai_chat_used_today = 0,
          ai_chat_last_reset = now()
        WHERE 
          analyze_last_reset < CURRENT_DATE
          OR backtest_last_reset < CURRENT_DATE
          OR ai_chat_last_reset < CURRENT_DATE;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Created reset_daily_quotas function");

    // 6. Cron job function to check for expired subscriptions daily
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION check_expired_subscriptions()
      RETURNS void AS $$
      BEGIN
        UPDATE users
        SET 
          subscription_status = 'past_due',
          subscription_tier = 'ritel'
        WHERE 
          subscription_period_end < now()
          AND subscription_status = 'active'
          AND subscription_tier IN ('bandar', 'suhu');
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Created check_expired_subscriptions function");

    console.log("✨ All triggers and functions applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error applying triggers:", error);
    process.exit(1);
  }
}

applyTriggers();
