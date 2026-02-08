-- Migration: Update schema to match updated_schema.ts
-- This migration creates users and payments tables, and modifies strategies and subscriptions tables

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  clerk_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  image_url TEXT,
  
  -- Subscription info
  subscription_tier TEXT DEFAULT 'free', -- free, premium, pro
  subscription_status TEXT DEFAULT 'active', -- active, canceled, expired, past_due
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. CREATE PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  
  -- Midtrans core fields
  order_id TEXT NOT NULL UNIQUE,
  transaction_id TEXT,
  transaction_status TEXT NOT NULL, -- capture, settlement, pending, deny, cancel, expire, refund
  transaction_time TIMESTAMPTZ,
  settlement_time TIMESTAMPTZ,
  
  -- Amount details
  gross_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  
  -- Payment details
  payment_type TEXT NOT NULL, -- credit_card, gopay, bank_transfer, qris, etc
  
  -- For card payments
  masked_card TEXT,
  card_type TEXT,
  bank TEXT,
  
  -- For VA payments
  va_number TEXT,
  
  -- For e-wallet
  payment_code TEXT,
  
  -- Fraud detection
  fraud_status TEXT,
  
  -- Status tracking
  status_code TEXT,
  status_message TEXT,
  
  -- Signature for verification
  signature_key TEXT,
  
  -- What they paid for
  subscription_tier TEXT,
  billing_period TEXT,
  
  -- Subscription period this payment covers
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  -- Additional metadata from Midtrans
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_status ON payments(transaction_status);

-- ============================================
-- 3. MODIFY STRATEGIES TABLE
-- ============================================

-- Add new columns to strategies table
ALTER TABLE strategies 
  ADD COLUMN IF NOT EXISTS config_hash TEXT,
  ADD COLUMN IF NOT EXISTS total_return NUMERIC,
  ADD COLUMN IF NOT EXISTS max_drawdown NUMERIC,
  ADD COLUMN IF NOT EXISTS success_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS total_trades INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_stocks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_score TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update creator_id to be TEXT if it's not already (for Clerk ID compatibility)
-- Note: This assumes creator_id can be converted or is already compatible
-- If there's existing data, you may need a data migration step here

-- Make config_hash unique after it's populated
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_strategies_config_hash ON strategies(config_hash);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strategies_creator_id ON strategies(creator_id);
CREATE INDEX IF NOT EXISTS idx_strategies_is_public ON strategies(is_public);
CREATE INDEX IF NOT EXISTS idx_strategies_is_active ON strategies(is_active);

-- ============================================
-- 4. MODIFY SUBSCRIPTIONS TABLE
-- ============================================

-- Drop old columns that are being replaced
ALTER TABLE subscriptions
  DROP COLUMN IF EXISTS total_return,
  DROP COLUMN IF EXISTS daily_return,
  DROP COLUMN IF EXISTS weekly_return,
  DROP COLUMN IF EXISTS monthly_return,
  DROP COLUMN IF EXISTS mtd_return,
  DROP COLUMN IF EXISTS ytd_return;

-- Add new columns for snapshot and current performance tracking
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS snapshot_return NUMERIC,
  ADD COLUMN IF NOT EXISTS snapshot_value NUMERIC,
  ADD COLUMN IF NOT EXISTS snapshot_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_return NUMERIC,
  ADD COLUMN IF NOT EXISTS current_value NUMERIC,
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_calculated_at TIMESTAMPTZ;

-- Update user_id to be TEXT if it's not already (for Clerk ID compatibility)
-- Note: This assumes user_id can be converted or is already compatible

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_strategy_id ON subscriptions(strategy_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);

-- ============================================
-- 5. ADD FOREIGN KEY CONSTRAINTS (if not exists)
-- ============================================

-- Note: These constraints assume that creator_id and user_id have been migrated to clerk_id format
-- If you have existing data, you'll need to migrate the IDs first

-- For strategies table - add foreign key to users
-- ALTER TABLE strategies 
--   ADD CONSTRAINT fk_strategies_creator 
--   FOREIGN KEY (creator_id) 
--   REFERENCES users(clerk_id) 
--   ON DELETE CASCADE;

-- For subscriptions table - add foreign key to users
-- ALTER TABLE subscriptions 
--   ADD CONSTRAINT fk_subscriptions_user 
--   FOREIGN KEY (user_id) 
--   REFERENCES users(clerk_id) 
--   ON DELETE CASCADE;

-- ============================================
-- NOTES
-- ============================================
-- 1. The foreign key constraints for creator_id and user_id are commented out
--    because they require existing data to be migrated to Clerk IDs first.
--    Uncomment these after migrating existing user IDs.
--
-- 2. The config_hash unique constraint is commented out because it needs to be
--    populated first. Uncomment after populating config_hash for all strategies.
--
-- 3. This migration is designed to be safe and non-destructive. It adds new
--    columns but doesn't remove old ones (except for subscriptions where we
--    explicitly drop columns that are being replaced).
--
-- 4. After running this migration, you should:
--    - Update db/index.ts to import from updated_schema
--    - Set up the Clerk webhook
--    - Test user creation flow
