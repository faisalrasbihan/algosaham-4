-- Migration: Add Payment Subscriptions and Transactions tables for Midtrans integration
-- Run this migration to add the payment tables to your database

-- Create enums
DO $$ BEGIN
    CREATE TYPE plan_type AS ENUM ('free', 'suhu', 'bandar');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'pending', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_interval AS ENUM ('monthly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment_subscriptions table
CREATE TABLE IF NOT EXISTS payment_subscriptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  
  -- User info (Clerk user ID)
  user_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  
  -- Plan info
  plan_type plan_type NOT NULL DEFAULT 'free',
  billing_interval billing_interval NOT NULL DEFAULT 'monthly',
  
  -- Midtrans subscription info
  midtrans_subscription_id TEXT,
  midtrans_token TEXT,
  
  -- Subscription details
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  status subscription_status NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  
  -- Reference to subscription
  subscription_id BIGINT REFERENCES payment_subscriptions(id),
  user_id TEXT NOT NULL,
  
  -- Midtrans transaction info
  midtrans_transaction_id TEXT,
  midtrans_order_id TEXT NOT NULL UNIQUE,
  
  -- Transaction details
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  payment_type TEXT,
  transaction_status TEXT NOT NULL,
  
  -- Additional info from webhook
  fraud_status TEXT,
  status_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  settled_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_user_id ON payment_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_status ON payment_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_midtrans_id ON payment_subscriptions(midtrans_subscription_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(midtrans_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(transaction_status);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_payment_subscriptions_updated_at ON payment_subscriptions;
CREATE TRIGGER update_payment_subscriptions_updated_at
    BEFORE UPDATE ON payment_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional, remove in production)
-- INSERT INTO payment_subscriptions (user_id, user_email, plan_type, billing_interval, amount, status)
-- VALUES ('test_user_123', 'test@example.com', 'suhu', 'monthly', 99000, 'active');
