# Database Seed Files

This directory contains SQL files to populate your database with sample data for development and testing.

## Files

- **`seed.ts`** - TypeScript seed file (recommended - easiest to use)
- **`seed-all.sql`** - Complete SQL seed file with all data
- **`seed-stocks.sql`** - Only stock data (36 Indonesian stocks)
- **`seed-popular-strategies.sql`** - Only strategy data (8 popular strategies)

## Quick Start

### Option 1: Using TypeScript Seed (Recommended) ⭐

This is the easiest method - just one command!

```bash
# First, push your schema to the database
npm run db:push

# Then run the seed script
npm run db:seed
```

### Option 2: Using psql (PostgreSQL CLI)

```bash
# Make sure you're in the project root
cd /Users/faisalrasbihan/Projects/algosaham-4

# Run the complete seed file
psql $DATABASE_URL -f db/seed-all.sql
```

### Option 3: Copy and paste

1. Open your PostgreSQL client (TablePlus, pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Open `db/seed-all.sql`
4. Copy the entire contents
5. Paste and execute in your SQL client


## What Gets Seeded

### 📈 Stocks (36 total)
- Banking sector: BBCA, BBRI, BMRI, BBNI, BBTN
- Consumer goods: ICBP, INDF, UNVR, KLBF, MYOR
- Telecommunications: TLKM, EXCL, ISAT
- Mining & Energy: ADRO, PTBA, ITMG, ANTM, INCO
- Infrastructure: WIKA, WSKT, PTPP, ADHI
- Technology: GOTO, BUKA, EMTK
- Cement: SMGR, INTP
- Automotive: ASII, AUTO, GJTL
- Retail: ACES, MAPI, ERAA
- Property: BSDE, PWON, CTRA

### 🎯 Strategies (8 popular strategies)
1. **IDX30 Mean Reversion** - 42.8% return
2. **Commodity Momentum Master** - 38.6% return
3. **Consumer Defensive Shield** - 16.4% return
4. **Banking Sector Breakout** - 31.2% return
5. **Tech Growth Accelerator** - 54.3% return
6. **Dividend Aristocrats** - 12.8% return
7. **Small Cap Value Hunter** - 47.9% return
8. **Infrastructure Play** - 28.5% return

### 📊 Indicators (24 total)
- 3 indicators per strategy
- Includes RSI, MACD, Bollinger Bands, Moving Averages, etc.

## Verification

After seeding, verify the data:

```sql
-- Check total stocks
SELECT COUNT(*) as total_stocks FROM stocks;

-- Check stocks by sector
SELECT sector, COUNT(*) as count 
FROM stocks 
GROUP BY sector 
ORDER BY count DESC;

-- Check strategies
SELECT id, name, total_returns, sharpe_ratio, win_rate 
FROM strategies 
ORDER BY total_returns DESC;

-- Check indicators per strategy
SELECT s.name as strategy_name, COUNT(i.id) as indicator_count
FROM strategies s
LEFT JOIN indicators i ON s.id = i.strategy_id
GROUP BY s.id, s.name
ORDER BY s.id;
```

## Clean Up (Reset Database)

If you need to clear the seeded data:

```sql
-- Delete in reverse order due to foreign keys
DELETE FROM indicators;
DELETE FROM strategies;
DELETE FROM stocks;

-- Reset sequences (optional)
ALTER SEQUENCE stocks_id_seq RESTART WITH 1;
ALTER SEQUENCE strategies_id_seq RESTART WITH 1;
ALTER SEQUENCE indicators_id_seq RESTART WITH 1;
```

## Notes

- All strategies have `creator_id = 0` (system strategies)
- Stock symbols are real Indonesian Stock Exchange (IDX) tickers
- Timestamps use Asia/Jakarta timezone (UTC+7)
- Return values are stored as numeric percentages (42.8 = 42.8%)
- The data matches what's displayed in the popular strategies section on the homepage

## Troubleshooting

### "relation does not exist" error
Make sure you've pushed your schema first:
```bash
npm run db:push
```

### "duplicate key value violates unique constraint"
The database already has data. Clear it first or skip seeding.

### Permission denied
Make sure your DATABASE_URL has proper permissions to INSERT data.

## Next Steps

After seeding:
1. Open Drizzle Studio to visualize the data: `npm run db:studio`
2. Test queries using the examples in `db/queries.example.ts`
3. Start building your API endpoints to fetch this data

