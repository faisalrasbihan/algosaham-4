CREATE TABLE "payments" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"order_id" text NOT NULL,
	"transaction_id" text,
	"transaction_status" text NOT NULL,
	"transaction_time" timestamp with time zone,
	"settlement_time" timestamp with time zone,
	"gross_amount" numeric NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"payment_type" text NOT NULL,
	"masked_card" text,
	"card_type" text,
	"bank" text,
	"va_number" text,
	"payment_code" text,
	"fraud_status" text,
	"status_code" text,
	"status_message" text,
	"signature_key" text,
	"subscription_tier" text,
	"billing_period" text,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payments_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "strategies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"creator_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"config_hash" text NOT NULL,
	"total_return" numeric,
	"max_drawdown" numeric,
	"success_rate" numeric,
	"sharpe_ratio" numeric,
	"total_trades" integer DEFAULT 0,
	"total_stocks" integer DEFAULT 0,
	"quality_score" text,
	"subscribers" integer DEFAULT 0,
	"is_public" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"is_showcase" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "strategies_config_hash_unique" UNIQUE("config_hash")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"strategy_id" bigint NOT NULL,
	"snapshot_return" numeric,
	"snapshot_value" numeric,
	"snapshot_date" timestamp with time zone,
	"current_return" numeric,
	"current_value" numeric,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"last_calculated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"clerk_id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image_url" text,
	"subscription_tier" text DEFAULT 'ritel',
	"subscription_status" text DEFAULT 'active',
	"subscription_period_start" timestamp with time zone,
	"subscription_period_end" timestamp with time zone,
	"analyze_limit" integer DEFAULT 5 NOT NULL,
	"analyze_used_today" integer DEFAULT 0,
	"analyze_last_reset" timestamp with time zone DEFAULT now(),
	"backtest_limit" integer DEFAULT 1 NOT NULL,
	"backtest_used_today" integer DEFAULT 0,
	"backtest_last_reset" timestamp with time zone DEFAULT now(),
	"saved_strategies_limit" integer DEFAULT 1 NOT NULL,
	"saved_strategies_count" integer DEFAULT 0,
	"subscriptions_limit" integer DEFAULT 0 NOT NULL,
	"subscriptions_count" integer DEFAULT 0,
	"ai_chat_limit" integer DEFAULT 5,
	"ai_chat_used_today" integer DEFAULT 0,
	"ai_chat_last_reset" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_creator_id_users_clerk_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;