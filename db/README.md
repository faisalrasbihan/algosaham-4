# Database Setup

This directory contains the Drizzle ORM configuration and schema for the AlgoSaham application.

## Structure

- `schema.ts` - Database schema definitions (tables, columns, relations)
- `index.ts` - Database connection and Drizzle instance
- `types.ts` - TypeScript types for database models
- `queries.example.ts` - Example queries and patterns

## Database Schema

### Tables

1. **stocks** - Stock information (IDX stocks)
2. **strategies** - Trading strategies
3. **fundamentals** - Stock fundamental data
4. **indicators** - Strategy indicators configuration
5. **subscriptions** - User subscriptions to strategies
6. **notifications** - User notifications
7. **trades** - Trading history
8. **notification_stocks** - Junction table for notifications and stocks

## Usage

### Importing the Database Instance

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

### Using TypeScript Types

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

### Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database (good for development)
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio (visual database explorer)

## Workflow

### Development (Recommended)
1. Modify `schema.ts` to add/change tables
2. Run `npm run db:push` to sync changes to your database immediately
3. No migration files are created, changes are applied directly

### Production
1. Modify `schema.ts`
2. Run `npm run db:generate` to create migration files
3. Review migration files in `/drizzle` folder
4. Run `npm run db:migrate` to apply migrations
5. Commit migration files to version control

## Common Query Patterns

See `queries.example.ts` for detailed examples of:
- SELECT queries with filters and ordering
- INSERT operations (single and batch)
- UPDATE operations
- DELETE operations
- Complex queries with joins and relations

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Column Types](https://orm.drizzle.team/docs/column-types/pg)
- [Drizzle Queries](https://orm.drizzle.team/docs/rqb)

