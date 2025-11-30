-- ============================================
-- Complete seed data for AlgoSaham database
-- ============================================
-- This file contains all the initial data needed to populate the database
-- Run this file using: psql -d your_database_name -f seed-all.sql
-- Or copy and paste sections into your PostgreSQL client

-- ============================================
-- 1. STOCKS DATA
-- ============================================
-- Indonesian Stock Exchange (IDX) stocks

INSERT INTO stocks (stock_symbol, company_name, sector, is_syariah, is_idx30, is_lq45) VALUES
-- Banking Sector
('BBCA', 'Bank Central Asia Tbk', 'Finance', false, true, true),
('BBRI', 'Bank Rakyat Indonesia Tbk', 'Finance', false, true, true),
('BMRI', 'Bank Mandiri Tbk', 'Finance', false, true, true),
('BBNI', 'Bank Negara Indonesia Tbk', 'Finance', false, true, true),
('BBTN', 'Bank Tabungan Negara Tbk', 'Finance', false, false, true),

-- Consumer Goods
('ICBP', 'Indofood CBP Sukses Makmur Tbk', 'Consumer Goods', true, true, true),
('INDF', 'Indofood Sukses Makmur Tbk', 'Consumer Goods', false, true, true),
('UNVR', 'Unilever Indonesia Tbk', 'Consumer Goods', false, true, true),
('KLBF', 'Kalbe Farma Tbk', 'Consumer Goods', true, true, true),
('MYOR', 'Mayora Indah Tbk', 'Consumer Goods', true, false, true),

-- Telecommunications
('TLKM', 'Telkom Indonesia Tbk', 'Telecommunications', true, true, true),
('EXCL', 'XL Axiata Tbk', 'Telecommunications', false, false, true),
('ISAT', 'Indosat Tbk', 'Telecommunications', false, false, false),

-- Mining & Energy
('ADRO', 'Adaro Energy Indonesia Tbk', 'Mining', false, true, true),
('PTBA', 'Bukit Asam Tbk', 'Mining', false, true, true),
('ITMG', 'Indo Tambangraya Megah Tbk', 'Mining', false, false, true),
('ANTM', 'Aneka Tambang Tbk', 'Mining', false, true, true),
('INCO', 'Vale Indonesia Tbk', 'Mining', false, false, true),

-- Infrastructure & Construction
('WIKA', 'Wijaya Karya Tbk', 'Infrastructure', true, false, true),
('WSKT', 'Waskita Karya Tbk', 'Infrastructure', false, false, false),
('PTPP', 'PP (Persero) Tbk', 'Infrastructure', true, false, true),
('ADHI', 'Adhi Karya Tbk', 'Infrastructure', true, false, false),

-- Technology
('GOTO', 'GoTo Gojek Tokopedia Tbk', 'Technology', false, true, true),
('BUKA', 'Bukalapak.com Tbk', 'Technology', false, false, false),
('EMTK', 'Elang Mahkota Teknologi Tbk', 'Technology', false, false, false),

-- Cement
('SMGR', 'Semen Indonesia Tbk', 'Basic Materials', false, true, true),
('INTP', 'Indocement Tunggal Prakarsa Tbk', 'Basic Materials', false, false, true),

-- Automotive
('ASII', 'Astra International Tbk', 'Automotive', false, true, true),
('AUTO', 'Astra Otoparts Tbk', 'Automotive', false, false, false),
('GJTL', 'Gajah Tunggal Tbk', 'Automotive', false, false, false),

-- Retail
('ACES', 'Ace Hardware Indonesia Tbk', 'Retail', false, false, true),
('MAPI', 'Mitra Adiperkasa Tbk', 'Retail', false, false, false),
('ERAA', 'Erajaya Swasembada Tbk', 'Retail', false, false, false),

-- Real Estate & Property
('BSDE', 'Bumi Serpong Damai Tbk', 'Property', true, false, true),
('PWON', 'Pakuwon Jati Tbk', 'Property', false, false, true),
('CTRA', 'Ciputra Development Tbk', 'Property', false, false, false);

-- ============================================
-- 2. STRATEGIES DATA
-- ============================================
-- Popular strategies displayed on homepage

INSERT INTO strategies (
  creator_id,
  name,
  description,
  total_returns,
  max_drawdown,
  sharpe_ratio,
  win_rate,
  total_stocks,
  starting_time,
  created_at,
  volatility,
  sortino_ratio,
  calmar_ratio,
  beta,
  alpha,
  daily_return,
  weekly_return,
  monthly_return,
  three_month_return,
  six_month_return,
  ytd_return
) VALUES
-- 1. IDX30 Mean Reversion
(
  0, 'IDX30 Mean Reversion',
  'Advanced mean reversion strategy targeting IDX30 stocks with statistical arbitrage techniques for optimal entry and exit points',
  42.8, -9.5, 2.45, 74.2, 18,
  '2024-01-01 00:00:00+07', NOW(),
  12.5, 2.89, 4.50, 0.92, 5.2,
  0.12, 0.85, 3.57, 10.7, 21.4, 42.8
),

-- 2. Commodity Momentum Master
(
  0, 'Commodity Momentum Master',
  'High-frequency momentum strategy for mining and energy stocks with dynamic position sizing',
  38.6, -11.3, 2.12, 69.8, 22,
  '2024-01-01 00:00:00+07', NOW(),
  15.8, 2.42, 3.42, 1.15, 4.8,
  0.11, 0.78, 3.22, 9.65, 19.3, 38.6
),

-- 3. Consumer Defensive Shield
(
  0, 'Consumer Defensive Shield',
  'Low-risk strategy focusing on consumer staples with consistent returns and minimal volatility exposure',
  16.4, -4.2, 1.98, 78.5, 9,
  '2024-01-01 00:00:00+07', NOW(),
  6.5, 2.35, 3.90, 0.68, 2.1,
  0.05, 0.35, 1.37, 4.1, 8.2, 16.4
),

-- 4. Banking Sector Breakout
(
  0, 'Banking Sector Breakout',
  'Momentum-based strategy capitalizing on banking sector volatility and breakout patterns with technical indicators',
  31.2, -8.7, 2.28, 71.4, 12,
  '2024-01-01 00:00:00+07', NOW(),
  11.2, 2.67, 3.59, 1.05, 3.9,
  0.09, 0.63, 2.60, 7.8, 15.6, 31.2
),

-- 5. Tech Growth Accelerator
(
  0, 'Tech Growth Accelerator',
  'Growth-focused strategy targeting emerging technology companies with strong fundamentals and market momentum',
  54.3, -15.2, 1.87, 65.3, 25,
  '2024-01-01 00:00:00+07', NOW(),
  22.3, 2.15, 3.57, 1.38, 8.2,
  0.15, 1.05, 4.53, 13.58, 27.15, 54.3
),

-- 6. Dividend Aristocrats
(
  0, 'Dividend Aristocrats',
  'Conservative income strategy focusing on high-dividend blue-chip stocks with long track records of consistent payouts',
  12.8, -3.1, 2.56, 82.1, 8,
  '2024-01-01 00:00:00+07', NOW(),
  4.8, 3.12, 4.13, 0.52, 1.8,
  0.04, 0.27, 1.07, 3.2, 6.4, 12.8
),

-- 7. Small Cap Value Hunter
(
  0, 'Small Cap Value Hunter',
  'Value investing approach targeting undervalued small-cap stocks with strong balance sheets and growth potential',
  47.9, -12.8, 2.03, 68.7, 32,
  '2024-01-01 00:00:00+07', NOW(),
  18.5, 2.38, 3.74, 1.25, 6.8,
  0.13, 0.92, 3.99, 11.98, 23.95, 47.9
),

-- 8. Infrastructure Play
(
  0, 'Infrastructure Play',
  'Long-term strategy focused on infrastructure and construction sector growth driven by government spending',
  28.5, -7.4, 2.19, 73.6, 14,
  '2024-01-01 00:00:00+07', NOW(),
  10.8, 2.58, 3.85, 0.95, 3.5,
  0.08, 0.58, 2.38, 7.13, 14.25, 28.5
);

-- ============================================
-- 3. INDICATORS DATA
-- ============================================
-- Sample indicators for strategies

INSERT INTO indicators (strategy_id, name, parameters) VALUES
-- IDX30 Mean Reversion (strategy_id will be 1 if it's the first strategy)
(1, 'RSI', '{"period": 14, "overbought": 70, "oversold": 30}'),
(1, 'Bollinger Bands', '{"period": 20, "std_dev": 2}'),
(1, 'Mean Reversion', '{"lookback_period": 30, "z_score_threshold": 2}'),

-- Commodity Momentum Master
(2, 'Moving Average', '{"short_period": 10, "long_period": 50}'),
(2, 'MACD', '{"fast": 12, "slow": 26, "signal": 9}'),
(2, 'ADX', '{"period": 14, "threshold": 25}'),

-- Consumer Defensive Shield
(3, 'SMA', '{"period": 50}'),
(3, 'Volatility Filter', '{"max_volatility": 15}'),
(3, 'Dividend Yield', '{"min_yield": 3}'),

-- Banking Sector Breakout
(4, 'Breakout Detection', '{"period": 20, "threshold": 1.5}'),
(4, 'Volume Confirmation', '{"volume_factor": 1.5}'),
(4, 'ATR', '{"period": 14}'),

-- Tech Growth Accelerator
(5, 'Momentum', '{"period": 20}'),
(5, 'EMA', '{"short": 12, "long": 26}'),
(5, 'Growth Filter', '{"min_growth_rate": 15}'),

-- Dividend Aristocrats
(6, 'Dividend History', '{"min_consecutive_years": 5}'),
(6, 'Payout Ratio', '{"max_ratio": 70}'),
(6, 'Yield Filter', '{"min_yield": 4}'),

-- Small Cap Value Hunter
(7, 'P/E Ratio', '{"max_pe": 15}'),
(7, 'P/B Ratio', '{"max_pb": 1.5}'),
(7, 'Market Cap Filter', '{"max_market_cap": 5000000000000}'),

-- Infrastructure Play
(8, 'Sector Momentum', '{"period": 30}'),
(8, 'Government Contract', '{"min_contract_value": 1000000000000}'),
(8, 'Technical Breakout', '{"period": 50}');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check inserted stocks
-- SELECT COUNT(*) as total_stocks FROM stocks;
-- SELECT sector, COUNT(*) as count FROM stocks GROUP BY sector ORDER BY count DESC;

-- Check inserted strategies
-- SELECT id, name, total_returns, sharpe_ratio, win_rate FROM strategies ORDER BY total_returns DESC;

-- Check indicators per strategy
-- SELECT s.name as strategy_name, COUNT(i.id) as indicator_count
-- FROM strategies s
-- LEFT JOIN indicators i ON s.id = i.strategy_id
-- GROUP BY s.id, s.name
-- ORDER BY s.id;

-- ============================================
-- NOTES
-- ============================================
-- 1. Strategy IDs will be auto-generated starting from 1
-- 2. Stock IDs will be auto-generated starting from 1
-- 3. Indicator strategy_id references assume strategies are inserted first
-- 4. All timestamps are in Asia/Jakarta timezone (UTC+7)
-- 5. Numeric values for returns are percentages (42.8 = 42.8%)

