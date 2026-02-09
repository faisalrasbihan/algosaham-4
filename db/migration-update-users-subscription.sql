-- ============================================
-- Migration: Update Users Table for Subscription Tiers
-- ============================================
-- This script updates the users table to support the new subscription tier system
-- Run this in your PostgreSQL client to update the schema

-- ============================================
-- 1. ADD NEW COLUMNS TO USERS TABLE
-- ============================================

-- Add subscription period tracking columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_period_start timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_period_end timestamp with time zone;

-- ============================================
-- 2. UPDATE EXISTING DATA
-- ============================================

-- Update existing users with 'free' tier to 'ritel'
UPDATE users 
SET subscription_tier = 'ritel' 
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;

-- Update existing users with 'premium' tier to 'suhu'
UPDATE users 
SET subscription_tier = 'suhu' 
WHERE subscription_tier = 'premium';

-- Update existing users with 'pro' tier to 'bandar'
UPDATE users 
SET subscription_tier = 'bandar' 
WHERE subscription_tier = 'pro';

-- ============================================
-- 3. ALTER DEFAULT VALUE
-- ============================================

-- Update the default value for new users
ALTER TABLE users 
ALTER COLUMN subscription_tier SET DEFAULT 'ritel';

-- ============================================
-- 4. VERIFY THE CHANGES
-- ============================================

-- Check all columns in users table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check current subscription tiers
SELECT 
  subscription_tier, 
  COUNT(*) as user_count
FROM users
GROUP BY subscription_tier;

-- ============================================
-- EXPECTED COLUMNS AFTER MIGRATION:
-- ============================================
-- 1.  clerk_id - text (PRIMARY KEY)
-- 2.  email - text
-- 3.  name - text
-- 4.  image_url - text
-- 5.  subscription_tier - text (DEFAULT 'ritel')
-- 6.  subscription_status - text (DEFAULT 'active')
-- 7.  subscription_period_start - timestamp with time zone (NEW)
-- 8.  subscription_period_end - timestamp with time zone (NEW)
-- 9.  created_at - timestamp with time zone
-- 10. updated_at - timestamp with time zone

-- ============================================
-- VALID SUBSCRIPTION TIERS:
-- ============================================
-- - ritel (free tier)
-- - suhu (premium tier - Rp99,000/month or Rp49,500/month yearly)
-- - bandar (pro tier - Rp189,000/month or Rp94,500/month yearly)
