-- ============================================
-- Alternative: Use Drizzle Push to sync schema
-- ============================================
-- Instead of manual ALTER statements, you can use Drizzle to sync your schema
-- This will automatically add any missing columns

-- OPTION 1: Run this command in your terminal
-- npm run db:push

-- This will:
-- 1. Compare your Drizzle schema (db/schema.ts) with your actual database
-- 2. Generate and execute the necessary ALTER TABLE statements
-- 3. Add any missing columns automatically

-- OPTION 2: If you prefer manual control, use the migration below

