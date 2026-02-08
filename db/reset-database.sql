-- ============================================
-- CLEAN SLATE DATABASE RESET
-- This will drop ALL tables and recreate with the new schema
-- ============================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop old tables that are no longer needed
DROP TABLE IF EXISTS indicators CASCADE;
DROP TABLE IF EXISTS notification_stocks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS fundamentals CASCADE;
DROP TABLE IF EXISTS stocks CASCADE;

-- ============================================
-- CREATE TABLES WITH NEW SCHEMA
-- ============================================

-- USERS TABLE
CREATE TABLE users (
  clerk_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  image_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STRATEGIES TABLE
CREATE TABLE strategies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  config_hash TEXT NOT NULL UNIQUE,
  total_return NUMERIC,
  max_drawdown NUMERIC,
  success_rate NUMERIC,
  total_trades INTEGER DEFAULT 0,
  total_stocks INTEGER DEFAULT 0,
  quality_score TEXT,
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS TABLE
CREATE TABLE subscriptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  strategy_id BIGINT NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  snapshot_return NUMERIC,
  snapshot_value NUMERIC,
  snapshot_date TIMESTAMPTZ,
  current_return NUMERIC,
  current_value NUMERIC,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  last_calculated_at TIMESTAMPTZ
);

-- PAYMENTS TABLE
CREATE TABLE payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  transaction_id TEXT,
  transaction_status TEXT NOT NULL,
  transaction_time TIMESTAMPTZ,
  settlement_time TIMESTAMPTZ,
  gross_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  payment_type TEXT NOT NULL,
  masked_card TEXT,
  card_type TEXT,
  bank TEXT,
  va_number TEXT,
  payment_code TEXT,
  fraud_status TEXT,
  status_code TEXT,
  status_message TEXT,
  signature_key TEXT,
  subscription_tier TEXT,
  billing_period TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_strategies_creator ON strategies(creator_id);
CREATE INDEX idx_strategies_config_hash ON strategies(config_hash);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_strategy ON subscriptions(strategy_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Database reset complete!' as status;
