    -- Migration: Add GoPay accounts table and update subscriptions table for recurring payments
-- Run this after migration-payment-subscriptions.sql

-- Create payment method enum
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('credit_card', 'gopay');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create GoPay link status enum
DO $$ BEGIN
    CREATE TYPE gopay_link_status AS ENUM ('pending', 'active', 'expired', 'disabled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create GoPay accounts table
CREATE TABLE IF NOT EXISTS gopay_accounts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    
    -- User info (Clerk user ID)
    user_id TEXT NOT NULL UNIQUE,
    user_email TEXT,
    
    -- GoPay account info from Midtrans
    account_id TEXT NOT NULL,
    account_status gopay_link_status NOT NULL DEFAULT 'pending',
    
    -- Metadata
    payment_option_token TEXT,
    metadata TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    linked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_gopay_accounts_user_id ON gopay_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_gopay_accounts_account_id ON gopay_accounts(account_id);

-- Add payment_method column to payment_subscriptions if not exists
DO $$ BEGIN
    ALTER TABLE payment_subscriptions ADD COLUMN payment_method payment_method NOT NULL DEFAULT 'credit_card';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add gopay_account_id column to payment_subscriptions if not exists
DO $$ BEGIN
    ALTER TABLE payment_subscriptions ADD COLUMN gopay_account_id BIGINT REFERENCES gopay_accounts(id);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_gopay_account ON payment_subscriptions(gopay_account_id);

-- Add comment for documentation
COMMENT ON TABLE gopay_accounts IS 'Stores linked GoPay accounts for recurring/subscription payments via Midtrans';
COMMENT ON COLUMN gopay_accounts.account_id IS 'GoPay account_id from Midtrans used for recurring charges';
COMMENT ON COLUMN gopay_accounts.payment_option_token IS 'Token from payment_options for executing charges';
