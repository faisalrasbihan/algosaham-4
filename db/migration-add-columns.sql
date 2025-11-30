-- ============================================
-- Complete Database Migration Script
-- ============================================
-- This script adds all missing columns to match the seed data requirements
-- Run this in your PostgreSQL client BEFORE running the seed scripts

-- ============================================
-- 1. ALTER STRATEGIES TABLE
-- ============================================

-- Add missing columns to strategies table
ALTER TABLE strategies 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS starting_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS total_returns numeric,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- ============================================
-- 2. VERIFY THE CHANGES
-- ============================================

-- Check all columns in strategies table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'strategies' 
ORDER BY ordinal_position;

-- ============================================
-- EXPECTED COLUMNS AFTER MIGRATION:
-- ============================================
-- 1.  id - bigint (IDENTITY)
-- 2.  creator_id - bigint
-- 3.  name - text
-- 4.  description - text (NEW)
-- 5.  starting_time - timestamp with time zone (NEW)
-- 6.  total_returns - numeric (NEW)
-- 7.  created_at - timestamp with time zone (NEW)
-- 8.  sharpe_ratio - numeric
-- 9.  max_drawdown - numeric
-- 10. win_rate - numeric
-- 11. total_stocks - integer
-- 12. aum - numeric
-- 13. monthly_return - numeric
-- 14. three_month_return - numeric
-- 15. six_month_return - numeric
-- 16. ytd_return - numeric
-- 17. weekly_return - numeric
-- 18. daily_return - numeric
-- 19. volatility - numeric
-- 20. sortino_ratio - numeric
-- 21. calmar_ratio - numeric
-- 22. beta - numeric
-- 23. alpha - numeric

-- ============================================
-- NEXT STEPS
-- ============================================
-- After running this migration, you can seed the data using:
-- 1. npm run db:seed (TypeScript seed)
--    OR
-- 2. psql $DATABASE_URL -f db/seed-all.sql (SQL seed)

