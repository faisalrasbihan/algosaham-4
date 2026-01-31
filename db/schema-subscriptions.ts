import { pgTable, text, timestamp, numeric, bigint, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Subscription plan enum
export const planTypeEnum = pgEnum("plan_type", ["free", "suhu", "bandar"]);

// Subscription status enum
export const subscriptionStatusEnum = pgEnum("subscription_status", [
    "active",
    "inactive",
    "pending",
    "cancelled",
    "expired"
]);

// Billing interval enum
export const billingIntervalEnum = pgEnum("billing_interval", ["monthly", "yearly"]);

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", ["credit_card", "gopay"]);

// GoPay account linking status
export const gopayLinkStatusEnum = pgEnum("gopay_link_status", [
    "pending",
    "active",
    "expired",
    "disabled"
]);

// GoPay linked accounts table - stores linked GoPay accounts for recurring
export const gopayAccounts = pgTable("gopay_accounts", {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

    // User info (Clerk user ID)
    userId: text("user_id").notNull().unique(),
    userEmail: text("user_email"),

    // GoPay account info from Midtrans
    accountId: text("account_id").notNull(), // GoPay account_id for recurring
    accountStatus: gopayLinkStatusEnum("account_status").notNull().default("pending"),

    // Metadata
    paymentOptionToken: text("payment_option_token"), // Token for payment
    metadata: text("metadata"), // JSON string for additional data

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    linkedAt: timestamp("linked_at", { withTimezone: true }), // When user completed linking
    expiresAt: timestamp("expires_at", { withTimezone: true }), // Token expiration
});

// Payment subscriptions table - tracks user payment subscriptions via Midtrans
export const paymentSubscriptions = pgTable("payment_subscriptions", {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

    // User info (Clerk user ID)
    userId: text("user_id").notNull(),
    userEmail: text("user_email"),
    userName: text("user_name"),

    // Plan info
    planType: planTypeEnum("plan_type").notNull().default("free"),
    billingInterval: billingIntervalEnum("billing_interval").notNull().default("monthly"),

    // Payment method info
    paymentMethod: paymentMethodEnum("payment_method").notNull().default("credit_card"),

    // Midtrans subscription info
    midtransSubscriptionId: text("midtrans_subscription_id"),
    midtransToken: text("midtrans_token"), // saved_token_id for credit card

    // GoPay reference (for GoPay recurring)
    gopayAccountId: bigint("gopay_account_id", { mode: "number" }).references(() => gopayAccounts.id),

    // Subscription details
    amount: numeric("amount").notNull(),
    currency: text("currency").notNull().default("IDR"),
    status: subscriptionStatusEnum("status").notNull().default("pending"),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
});

// Payment transactions table - tracks individual payments
export const paymentTransactions = pgTable("payment_transactions", {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

    // Reference to subscription
    subscriptionId: bigint("subscription_id", { mode: "number" }).references(() => paymentSubscriptions.id),
    userId: text("user_id").notNull(),

    // Midtrans transaction info
    midtransTransactionId: text("midtrans_transaction_id"),
    midtransOrderId: text("midtrans_order_id").notNull().unique(),

    // Transaction details
    amount: numeric("amount").notNull(),
    currency: text("currency").notNull().default("IDR"),
    paymentType: text("payment_type"), // credit_card, gopay, etc.
    transactionStatus: text("transaction_status").notNull(), // pending, settlement, expire, cancel, deny

    // Additional info from webhook
    fraudStatus: text("fraud_status"),
    statusMessage: text("status_message"),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    settledAt: timestamp("settled_at", { withTimezone: true }),
});

// Relations
export const gopayAccountsRelations = relations(gopayAccounts, ({ many }) => ({
    subscriptions: many(paymentSubscriptions),
}));

export const paymentSubscriptionsRelations = relations(paymentSubscriptions, ({ one, many }) => ({
    transactions: many(paymentTransactions),
    gopayAccount: one(gopayAccounts, {
        fields: [paymentSubscriptions.gopayAccountId],
        references: [gopayAccounts.id],
    }),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
    subscription: one(paymentSubscriptions, {
        fields: [paymentTransactions.subscriptionId],
        references: [paymentSubscriptions.id],
    }),
}));

// Export types
export type GopayAccount = typeof gopayAccounts.$inferSelect;
export type NewGopayAccount = typeof gopayAccounts.$inferInsert;
export type PaymentSubscription = typeof paymentSubscriptions.$inferSelect;
export type NewPaymentSubscription = typeof paymentSubscriptions.$inferInsert;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof paymentTransactions.$inferInsert;
