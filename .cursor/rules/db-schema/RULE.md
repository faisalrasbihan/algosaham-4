---
description: Comprehensive database documentation including schema definitions, Drizzle ORM usage, seeding instructions, and migration guides.
globs: db/**/*, drizzle/**/*
alwaysApply: false
---

# Database Documentation

This document consolidates database setup, schema, seeding, and migration instructions.

## 1. Database Setup & Schema (from `db/README.md`)

This directory contains the Drizzle ORM configuration and schema for the AlgoSaham application.

### Structure

- `schema.ts` - Database schema definitions (tables, columns, relations)
- `index.ts` - Database connection and Drizzle instance
- `types.ts` - TypeScript types for database models
- `queries.example.ts` - Example queries and patterns

### Database Schema

#### Tables

1. **stocks** - Stock information (IDX stocks)
2. **strategies** - Trading strategies
3. **fundamentals** - Stock fundamental data
4. **indicators** - Strategy indicators configuration
5. **subscriptions** - User subscriptions to strategies
6. **notifications** - User notifications
7. **trades** - Trading history
8. **notification_stocks** - Junction table for notifications and stocks

### Usage

#### Importing the Database Instance

```typescript
import { db } from "@/db";
import { stocks, strategies } from "@/db/schema";
import { eq } from "drizzle-orm";

// Simple query
const allStocks = await db.select().from(stocks);

// Query with where clause
const syariahStocks = await db
  .select()
  .from(stocks)
  .where(eq(stocks.isSyariah, true));

// Query with relations
const strategy = await db.query.strategies.findFirst({
  where: eq(strategies.id, 1),
  with: {
    indicators: true,
    trades: {
      with: {
        stock: true,
      },
    },
  },
});
```

#### Using TypeScript Types

```typescript
import { NewStock, Stock } from "@/db/types";

// Type for inserting a new stock
const newStock: NewStock = {
  stockSymbol: "BBCA",
  companyName: "Bank Central Asia Tbk",
  sector: "Finance",
  isSyariah: false,
  isLq45: true,
};

// Type for a selected stock (includes auto-generated fields)
function processStock(stock: Stock) {
  console.log(stock.id, stock.stockSymbol);
}
```

#### Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database (good for development)
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio (visual database explorer)

### Workflow

#### Development (Recommended)
1. Modify `schema.ts` to add/change tables
2. Run `npm run db:push` to sync changes to your database immediately
3. No migration files are created, changes are applied directly

#### Production
1. Modify `schema.ts`
2. Run `npm run db:generate` to create migration files
3. Review migration files in `/drizzle` folder
4. Run `npm run db:migrate` to apply migrations
5. Commit migration files to version control

### Common Query Patterns

See `queries.example.ts` for detailed examples of:
- SELECT queries with filters and ordering
- INSERT operations (single and batch)
- UPDATE operations
- DELETE operations
- Complex queries with joins and relations

### Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Column Types](https://orm.drizzle.team/docs/column-types/pg)
- [Drizzle Queries](https://orm.drizzle.team/docs/rqb)

---

## 2. Database Seeding (from `db/SEED_README.md`)

This section explains how to populate the database with sample data.

### Seed Files

- **`seed.ts`** - TypeScript seed file (recommended - easiest to use)
- **`seed-all.sql`** - Complete SQL seed file with all data
- **`seed-stocks.sql`** - Only stock data (36 Indonesian stocks)
- **`seed-popular-strategies.sql`** - Only strategy data (8 popular strategies)

### Quick Start

#### Option 1: Using TypeScript Seed (Recommended) ⭐

This is the easiest method - just one command!

```bash
# First, push your schema to the database
npm run db:push

# Then run the seed script
npm run db:seed
```

#### Option 2: Using psql (PostgreSQL CLI)

```bash
# Make sure you're in the project root
cd /Users/faisalrasbihan/Projects/algosaham-4

# Run the complete seed file
psql $DATABASE_URL -f db/seed-all.sql
```

#### Option 3: Copy and paste

1. Open your PostgreSQL client (TablePlus, pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Open `db/seed-all.sql`
4. Copy the entire contents
5. Paste and execute in your SQL client


### What Gets Seeded

#### 📈 Stocks (36 total)
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

#### 🎯 Strategies (8 popular strategies)
1. **IDX30 Mean Reversion** - 42.8% return
2. **Commodity Momentum Master** - 38.6% return
3. **Consumer Defensive Shield** - 16.4% return
4. **Banking Sector Breakout** - 31.2% return
5. **Tech Growth Accelerator** - 54.3% return
6. **Dividend Aristocrats** - 12.8% return
7. **Small Cap Value Hunter** - 47.9% return
8. **Infrastructure Play** - 28.5% return

#### 📊 Indicators (24 total)
- 3 indicators per strategy
- Includes RSI, MACD, Bollinger Bands, Moving Averages, etc.

### Verification

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

### Clean Up (Reset Database)

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

### Notes

- All strategies have `creator_id = 0` (system strategies)
- Stock symbols are real Indonesian Stock Exchange (IDX) tickers
- Timestamps use Asia/Jakarta timezone (UTC+7)
- Return values are stored as numeric percentages (42.8 = 42.8%)
- The data matches what's displayed in the popular strategies section on the homepage

### Troubleshooting

#### "relation does not exist" error
Make sure you've pushed your schema first:
```bash
npm run db:push
```

#### "duplicate key value violates unique constraint"
The database already has data. Clear it first or skip seeding.

#### Permission denied
Make sure your DATABASE_URL has proper permissions to INSERT data.

---

## 3. Migration Instructions (from `db/MIGRATION_INSTRUCTIONS.md`)

### Alternative: Use Drizzle Push to sync schema

Instead of manual ALTER statements, you can use Drizzle to sync your schema. This will automatically add any missing columns.

**OPTION 1: Run this command in your terminal**

```bash
npm run db:push
```

This will:
1. Compare your Drizzle schema (db/schema.ts) with your actual database
2. Generate and execute the necessary ALTER TABLE statements
3. Add any missing columns automatically

**OPTION 2: If you prefer manual control**

If you prefer manual control, you can generate migration files or write SQL migrations manually as described in the Usage section.
