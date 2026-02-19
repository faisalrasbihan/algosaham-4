import { pgTable, text, boolean, timestamp, numeric, integer, bigint, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// USERS - From Clerk
// ============================================
export const users = pgTable("users", {
  clerkId: text("clerk_id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),

  // Subscription info
  subscriptionTier: text("subscription_tier").default("ritel"), // ritel, bandar, suhu
  subscriptionStatus: text("subscription_status").default("active"), // active, canceled, expired, past_due
  subscriptionPeriodStart: timestamp("subscription_period_start", { withTimezone: true }),
  subscriptionPeriodEnd: timestamp("subscription_period_end", { withTimezone: true }),

  // ANALYZE - Daily quota & usage
  analyzeLimit: integer("analyze_limit").notNull().default(5), // ritel: 5, bandar: -1, suhu: -1
  analyzeUsedToday: integer("analyze_used_today").default(0),
  analyzeLastReset: timestamp("analyze_last_reset", { withTimezone: true }).defaultNow(),

  // BACKTEST - Daily quota & usage
  backtestLimit: integer("backtest_limit").notNull().default(1), // ritel: 1, bandar: 25, suhu: -1
  backtestUsedToday: integer("backtest_used_today").default(0),
  backtestLastReset: timestamp("backtest_last_reset", { withTimezone: true }).defaultNow(),

  // SAVED STRATEGIES - Total limit & current count
  savedStrategiesLimit: integer("saved_strategies_limit").notNull().default(1), // ritel: 1, bandar: 10, suhu: 50
  savedStrategiesCount: integer("saved_strategies_count").default(0),

  // SUBSCRIPTIONS - Total limit & current count (following other users' strategies)
  subscriptionsLimit: integer("subscriptions_limit").notNull().default(0), // ritel: 0, bandar: 10, suhu: 100
  subscriptionsCount: integer("subscriptions_count").default(0),

  // AI CHAT - Daily quota & usage
  aiChatLimit: integer("ai_chat_limit").default(5), // ritel: 5, bandar: -1, suhu: -1
  aiChatUsedToday: integer("ai_chat_used_today").default(0),
  aiChatLastReset: timestamp("ai_chat_last_reset", { withTimezone: true }).defaultNow(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================
// STRATEGIES - Card display data + Redis reference
// ============================================
export const strategies = pgTable("strategies", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.clerkId, { onDelete: "cascade" }),

  // Basic info (shown on card)
  name: text("name").notNull(), // "Best Strategy Cuan"
  description: text("description"), // "asdasd"

  // Redis key reference
  configHash: text("config_hash").notNull().unique(), // Links to Redis: backtest:{hash}, summary:{hash}

  // Performance metrics (for card display)
  totalReturn: numeric("total_return"), // "0%"
  maxDrawdown: numeric("max_drawdown"), // "0%"
  successRate: numeric("success_rate"), // "0%" (win rate)
  sharpeRatio: numeric("sharpe_ratio"), // Risk-adjusted return metric

  // Strategy stats (for card display)
  totalTrades: integer("total_trades").default(0), // "0"
  totalStocks: integer("total_stocks").default(0), // "0"
  qualityScore: text("quality_score"), // "Poor", "Good", "Excellent"
  subscribers: integer("subscribers").default(0), // Number of users following this strategy
  topHoldings: jsonb("top_holdings"), // Top 3 stock tickers e.g. ["BBCA", "BMRI", "TLKM"]

  // Visibility/status
  isPublic: boolean("is_public").default(false),
  isActive: boolean("is_active").default(true),
  isShowcase: boolean("is_showcase").default(false), // Featured/showcase strategy

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(), // "Created: 2/1/2026"
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================
// SUBSCRIPTIONS - User follows Strategy with performance tracking
// ============================================
export const subscriptions = pgTable("subscriptions", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  userId: text("user_id").notNull().references(() => users.clerkId, { onDelete: "cascade" }),
  strategyId: bigint("strategy_id", { mode: "number" }).notNull().references(() => strategies.id, { onDelete: "cascade" }),

  // Snapshot at subscription time (baseline for tracking)
  snapshotReturn: numeric("snapshot_return"), // Strategy's total return when user subscribed
  snapshotValue: numeric("snapshot_value"), // Portfolio value when subscribed
  snapshotHoldings: jsonb("snapshot_holdings"), // Top 3 stocks when subscribed
  snapshotDate: timestamp("snapshot_date", { withTimezone: true }), // When snapshot was taken

  // Current performance (updated regularly from Redis)
  currentReturn: numeric("current_return"), // Latest total return from strategy
  currentValue: numeric("current_value"), // Latest portfolio value from strategy

  // Timestamps
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),

  // Last updated (for tracking when metrics were last calculated)
  lastCalculatedAt: timestamp("last_calculated_at", { withTimezone: true }),
});

// ============================================
// PAYMENTS - Aligned with Midtrans webhook notification
// ============================================
export const payments = pgTable("payments", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  userId: text("user_id").notNull().references(() => users.clerkId, { onDelete: "cascade" }),

  // Midtrans core fields
  orderId: text("order_id").notNull().unique(), // Midtrans order_id
  transactionId: text("transaction_id"), // Midtrans transaction_id
  transactionStatus: text("transaction_status").notNull(), // capture, settlement, pending, deny, cancel, expire, refund
  transactionTime: timestamp("transaction_time", { withTimezone: true }), // When transaction initiated
  settlementTime: timestamp("settlement_time", { withTimezone: true }), // When transaction settled

  // Amount details
  grossAmount: numeric("gross_amount").notNull(), // Total amount
  currency: text("currency").notNull().default("IDR"),

  // Payment details
  paymentType: text("payment_type").notNull(), // credit_card, gopay, bank_transfer, qris, etc

  // For card payments
  maskedCard: text("masked_card"), // First 6 and last 4 digits
  cardType: text("card_type"), // credit, debit
  bank: text("bank"), // bni, bca, mandiri, etc

  // For VA payments
  vaNumber: text("va_number"), // Virtual account number

  // For e-wallet
  paymentCode: text("payment_code"), // Payment code for cstore, etc

  // Fraud detection
  fraudStatus: text("fraud_status"), // accept, deny

  // Status tracking
  statusCode: text("status_code"), // HTTP status code from Midtrans
  statusMessage: text("status_message"), // Status message

  // Signature for verification
  signatureKey: text("signature_key"), // SHA512 hash for verification

  // What they paid for
  subscriptionTier: text("subscription_tier"), // premium, pro
  billingPeriod: text("billing_period"), // monthly, yearly

  // Subscription period this payment covers
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),

  // Additional metadata from Midtrans
  metadata: jsonb("metadata"), // Store full webhook payload for reference

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================
// RELATIONS
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
  strategies: many(strategies),
  subscriptions: many(subscriptions),
  payments: many(payments),
}));

export const strategiesRelations = relations(strategies, ({ one, many }) => ({
  creator: one(users, {
    fields: [strategies.creatorId],
    references: [users.clerkId],
  }),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.clerkId],
  }),
  strategy: one(strategies, {
    fields: [subscriptions.strategyId],
    references: [strategies.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.clerkId],
  }),
}));
