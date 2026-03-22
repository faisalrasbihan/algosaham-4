ALTER TABLE users
  ADD COLUMN IF NOT EXISTS screening_limit INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS screening_used_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS screening_last_reset TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE users
  ALTER COLUMN analyze_limit SET DEFAULT 3,
  ALTER COLUMN backtest_limit SET DEFAULT 3,
  ALTER COLUMN subscriptions_limit SET DEFAULT 1;

UPDATE users
SET
  analyze_limit = CASE subscription_tier
    WHEN 'suhu' THEN 20
    WHEN 'bandar' THEN -1
    ELSE 3
  END,
  screening_limit = CASE subscription_tier
    WHEN 'suhu' THEN 20
    WHEN 'bandar' THEN -1
    ELSE 3
  END,
  backtest_limit = CASE subscription_tier
    WHEN 'suhu' THEN 20
    WHEN 'bandar' THEN -1
    ELSE 3
  END,
  subscriptions_limit = CASE subscription_tier
    WHEN 'suhu' THEN 10
    WHEN 'bandar' THEN -1
    ELSE 1
  END,
  analyze_used_today = COALESCE(analyze_used_today, 0),
  screening_used_today = COALESCE(screening_used_today, 0),
  backtest_used_today = COALESCE(backtest_used_today, 0),
  screening_last_reset = COALESCE(screening_last_reset, NOW()),
  updated_at = NOW();
