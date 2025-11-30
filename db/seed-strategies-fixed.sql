-- SQL statements to populate the popular strategies in the database
-- These strategies will appear on the homepage
-- This version matches your current database schema

-- Insert popular strategies
INSERT INTO strategies (
  creator_id,
  name,
  alpha,
  volatility,
  sortino_ratio,
  calmar_ratio,
  beta,
  sharpe_ratio,
  max_drawdown,
  win_rate,
  total_stocks,
  aum,
  monthly_return,
  three_month_return,
  six_month_return,
  ytd_return,
  weekly_return,
  daily_return
) VALUES
-- 1. IDX30 Mean Reversion
(
  0, -- creator_id (system strategy)
  'IDX30 Mean Reversion',
  5.2, -- alpha
  12.5, -- volatility
  2.89, -- sortino_ratio
  4.50, -- calmar_ratio
  0.92, -- beta
  2.45, -- sharpe_ratio
  -9.5, -- max_drawdown
  74.2, -- win_rate
  18, -- total_stocks
  NULL, -- aum
  3.57, -- monthly_return
  10.7, -- three_month_return
  21.4, -- six_month_return
  42.8, -- ytd_return
  0.85, -- weekly_return
  0.12 -- daily_return
),

-- 2. Commodity Momentum Master
(
  0,
  'Commodity Momentum Master',
  4.8,
  15.8,
  2.42,
  3.42,
  1.15,
  2.12,
  -11.3,
  69.8,
  22,
  NULL,
  3.22,
  9.65,
  19.3,
  38.6,
  0.78,
  0.11
),

-- 3. Consumer Defensive Shield
(
  0,
  'Consumer Defensive Shield',
  2.1,
  6.5,
  2.35,
  3.90,
  0.68,
  1.98,
  -4.2,
  78.5,
  9,
  NULL,
  1.37,
  4.1,
  8.2,
  16.4,
  0.35,
  0.05
),

-- 4. Banking Sector Breakout
(
  0,
  'Banking Sector Breakout',
  3.9,
  11.2,
  2.67,
  3.59,
  1.05,
  2.28,
  -8.7,
  71.4,
  12,
  NULL,
  2.60,
  7.8,
  15.6,
  31.2,
  0.63,
  0.09
),

-- 5. Tech Growth Accelerator
(
  0,
  'Tech Growth Accelerator',
  8.2,
  22.3,
  2.15,
  3.57,
  1.38,
  1.87,
  -15.2,
  65.3,
  25,
  NULL,
  4.53,
  13.58,
  27.15,
  54.3,
  1.05,
  0.15
),

-- 6. Dividend Aristocrats
(
  0,
  'Dividend Aristocrats',
  1.8,
  4.8,
  3.12,
  4.13,
  0.52,
  2.56,
  -3.1,
  82.1,
  8,
  NULL,
  1.07,
  3.2,
  6.4,
  12.8,
  0.27,
  0.04
),

-- 7. Small Cap Value Hunter
(
  0,
  'Small Cap Value Hunter',
  6.8,
  18.5,
  2.38,
  3.74,
  1.25,
  2.03,
  -12.8,
  68.7,
  32,
  NULL,
  3.99,
  11.98,
  23.95,
  47.9,
  0.92,
  0.13
),

-- 8. Infrastructure Play
(
  0,
  'Infrastructure Play',
  3.5,
  10.8,
  2.58,
  3.85,
  0.95,
  2.19,
  -7.4,
  73.6,
  14,
  NULL,
  2.38,
  7.13,
  14.25,
  28.5,
  0.58,
  0.08
);

-- Verify the inserted data
SELECT id, name, sharpe_ratio, max_drawdown, win_rate, total_stocks, ytd_return
FROM strategies 
WHERE creator_id = 0 
ORDER BY ytd_return DESC;

