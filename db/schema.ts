import { pgTable, bigserial, text, boolean, timestamp, numeric, integer, date, jsonb, bigint, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Stocks table - independent
export const stocks = pgTable("stocks", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  stockSymbol: text("stock_symbol").notNull().unique(),
  companyName: text("company_name").notNull(),
  sector: text("sector"),
  isSyariah: boolean("is_syariah").default(false),
  isIdx30: boolean("is_idx30").default(false),
  isLq45: boolean("is_lq45").default(false),
});

// Strategies table - independent
export const strategies = pgTable("strategies", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  creatorId: bigint("creator_id", { mode: "number" }).notNull().default(0),
  name: text("name").notNull(),
  description: text("description"),
  startingTime: timestamp("starting_time", { withTimezone: true }),
  totalReturns: numeric("total_returns"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  sharpeRatio: numeric("sharpe_ratio"),
  maxDrawdown: numeric("max_drawdown"),
  winRate: numeric("win_rate"),
  totalStocks: integer("total_stocks"),
  aum: numeric("aum"),
  monthlyReturn: numeric("monthly_return"),
  threeMonthReturn: numeric("three_month_return"),
  sixMonthReturn: numeric("six_month_return"),
  ytdReturn: numeric("ytd_return"),
  weeklyReturn: numeric("weekly_return"),
  dailyReturn: numeric("daily_return"),
  volatility: numeric("volatility"),
  sortinoRatio: numeric("sortino_ratio"),
  calmarRatio: numeric("calmar_ratio"),
  beta: numeric("beta"),
  alpha: numeric("alpha"),
});

// Fundamentals table - depends on stocks
export const fundamentals = pgTable("fundamentals", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  stockId: bigint("stock_id", { mode: "number" }).references(() => stocks.id),
  date: date("date").notNull(),
  assets: numeric("assets"),
  liabilities: numeric("liabilities"),
  equity: numeric("equity"),
  sales: numeric("sales"),
  ebt: numeric("ebt"),
  profit: numeric("profit"),
  profitAttributable: numeric("profit_attributable"),
  bookValue: numeric("book_value"),
  eps: numeric("eps"),
  peRatio: numeric("pe_ratio"),
  pbv: numeric("pbv"),
  der: numeric("der"),
  roa: numeric("roa"),
  roe: numeric("roe"),
});

// Indicators table - depends on strategies
export const indicators = pgTable("indicators", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  strategyId: bigint("strategy_id", { mode: "number" }).references(() => strategies.id),
  name: text("name").notNull(),
  parameters: jsonb("parameters"),
});

// Subscriptions table - depends on strategies
export const subscriptions = pgTable("subscriptions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  strategyId: bigint("strategy_id", { mode: "number" }).notNull().references(() => strategies.id),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow().notNull(),
  totalReturn: numeric("total_return"),
  dailyReturn: numeric("daily_return"),
  weeklyReturn: numeric("weekly_return"),
  monthlyReturn: numeric("monthly_return"),
  mtdReturn: numeric("mtd_return"),
  ytdReturn: numeric("ytd_return"),
});

// Notifications table - depends on strategies
export const notifications = pgTable("notifications", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: bigint("user_id", { mode: "number" }),
  strategyId: bigint("strategy_id", { mode: "number" }).references(() => strategies.id),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
});

// Trades table - depends on strategies and stocks
export const trades = pgTable("trades", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  strategyId: bigint("strategy_id", { mode: "number" }).references(() => strategies.id),
  stockId: bigint("stock_id", { mode: "number" }).references(() => stocks.id),
  tradingDate: date("trading_date").notNull(),
  position: text("position", { enum: ["BUY", "SELL"] }).notNull(),
  price: numeric("price").notNull(),
  lotSize: integer("lot_size").notNull(),
  totalPosition: numeric("total_position").notNull(),
});

// Notification stocks junction table - depends on notifications and stocks
export const notificationStocks = pgTable("notification_stocks", {
  notificationId: bigint("notification_id", { mode: "number" }).notNull().references(() => notifications.id),
  stockId: bigint("stock_id", { mode: "number" }).notNull().references(() => stocks.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.notificationId, table.stockId] }),
}));

// Relations for better query experience
export const stocksRelations = relations(stocks, ({ many }) => ({
  fundamentals: many(fundamentals),
  trades: many(trades),
  notificationStocks: many(notificationStocks),
}));

export const strategiesRelations = relations(strategies, ({ many }) => ({
  indicators: many(indicators),
  subscriptions: many(subscriptions),
  notifications: many(notifications),
  trades: many(trades),
}));

export const fundamentalsRelations = relations(fundamentals, ({ one }) => ({
  stock: one(stocks, {
    fields: [fundamentals.stockId],
    references: [stocks.id],
  }),
}));

export const indicatorsRelations = relations(indicators, ({ one }) => ({
  strategy: one(strategies, {
    fields: [indicators.strategyId],
    references: [strategies.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  strategy: one(strategies, {
    fields: [subscriptions.strategyId],
    references: [strategies.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  strategy: one(strategies, {
    fields: [notifications.strategyId],
    references: [strategies.id],
  }),
  notificationStocks: many(notificationStocks),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  strategy: one(strategies, {
    fields: [trades.strategyId],
    references: [strategies.id],
  }),
  stock: one(stocks, {
    fields: [trades.stockId],
    references: [stocks.id],
  }),
}));

export const notificationStocksRelations = relations(notificationStocks, ({ one }) => ({
  notification: one(notifications, {
    fields: [notificationStocks.notificationId],
    references: [notifications.id],
  }),
  stock: one(stocks, {
    fields: [notificationStocks.stockId],
    references: [stocks.id],
  }),
}));

