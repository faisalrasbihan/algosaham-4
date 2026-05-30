CREATE TABLE "screener_preset_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "screener_preset_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "screener_presets" (
	"preset_id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"preset_name" text NOT NULL,
	"summary" text,
	"config" jsonb NOT NULL,
	"tag" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "screener_presets" ADD CONSTRAINT "screener_presets_category_id_screener_preset_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."screener_preset_categories"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "screener_preset_categories" ("id", "name", "label", "description", "sort_order") VALUES
	('setup', 'Sebelum Saham Bergerak', 'SETUP', 'Kompresi harga atau volume sebelum saham mulai bergerak.', 10),
	('breakout', 'Baru Breakout', 'BREAKOUT', 'Saham yang baru keluar dari konsolidasi dengan dukungan volume atau trend.', 20),
	('value', 'Saham Lagi Murah', 'VALUE', 'Filter saham value dengan valuation rendah, kualitas laba, atau momentum awal.', 30),
	('level', 'Entry di Level Penting', 'LEVEL', 'Setup di area acuan seperti VWAP, pivot, atau support yang sedang direbut ulang.', 40),
	('trend', 'Tren Lagi Kencang', 'TREND', 'Trend-following untuk saham yang arah naiknya sudah lebih terkonfirmasi.', 50),
	('momentum', 'Ikut Momentum', 'MOMENTUM', 'Saham yang mulai punya percepatan teknikal dari MACD, RSI, atau kombinasi momentum.', 60),
	('dip-buy', 'Beli Saat Turun', 'DIP BUY', 'Mean-reversion untuk saham yang oversold dan mulai menunjukkan potensi pantulan.', 70)
ON CONFLICT ("id") DO UPDATE SET
	"name" = excluded."name",
	"label" = excluded."label",
	"description" = excluded."description",
	"sort_order" = excluded."sort_order",
	"updated_at" = now();
--> statement-breakpoint
INSERT INTO "screener_presets" ("preset_id", "category_id", "preset_name", "summary", "config", "tag", "sort_order") VALUES
	('calm-volume-dry-up', 'setup', 'Volume Lagi Sepi', 'Transaksinya lagi tenang - sering jadi tanda mau ada gerakan besar.', '{"screeningId":"calm_before_the_move__volume_dry_up","fundamentalIndicators":[],"technicalIndicators":[{"type":"VOLUME_DRY_UP","period":20,"dryUpThreshold":0.5,"consecutiveDays":3}]}'::jsonb, 'scalping', 10),
	('calm-low-vol-regime', 'setup', 'Harga Lagi Adem', 'Pergerakan harga lagi kalem, biasanya fase kompresi sebelum bergerak.', '{"screeningId":"calm_before_the_move__low_volatility_regime","fundamentalIndicators":[],"technicalIndicators":[{"type":"VOLATILITY_REGIME","period":20,"lookback":60,"lowThreshold":-0.5,"highThreshold":1,"mode":"LOW_VOL"}]}'::jsonb, 'setup', 20),
	('fresh-breakout-base', 'breakout', 'Lepas dari Konsolidasi', 'Baru tembus dari area sideways, dikonfirmasi volume yang ramai.', '{"screeningId":"fresh_breakout_with_volume__base_breakout","fundamentalIndicators":[],"technicalIndicators":[{"type":"BASE_BREAKOUT","basePeriod":20,"breakoutPct":1.5,"maxBaseRange":15,"volumeMultiplier":1.5}]}'::jsonb, 'breakout', 10),
	('fresh-breakout-volume-spike', 'breakout', 'Volume Meledak', 'Volume tiba-tiba ramai - sering jadi sinyal ada yang serius beli.', '{"screeningId":"fresh_breakout_with_volume__volume_spike","fundamentalIndicators":[],"technicalIndicators":[{"type":"VOLUME_SMA","period":20,"threshold":1.5}]}'::jsonb, 'scalping', 20),
	('fresh-breakout-volume-adx', 'breakout', 'Volume Ramai + Tren Kuat', 'Volume meledak dan arah trennya sudah jelas, bukan kebetulan.', '{"screeningId":"fresh_breakout_with_volume__volume_spike_adx_trend","fundamentalIndicators":[],"technicalIndicators":[{"type":"VOLUME_SMA","period":20,"threshold":1.5},{"type":"ADX","period":14,"threshold":25}]}'::jsonb, 'breakout', 30),
	('undervalued-quality', 'value', 'Murah tapi Berkualitas', 'Harga lagi diskon, tapi bisnisnya tetap untung sehat.', '{"screeningId":"undervalued_picks__quality_value","fundamentalIndicators":[{"type":"PBV","max":1.8},{"type":"ROE","min":15}],"technicalIndicators":[]}'::jsonb, 'value', 10),
	('undervalued-momentum', 'value', 'Murah dan Mulai Naik', 'Saham yang masih murah dan sudah mulai dilirik pasar.', '{"screeningId":"undervalued_picks__value_with_momentum","fundamentalIndicators":[{"type":"PE_RATIO","max":15}],"technicalIndicators":[{"type":"MACD","fastPeriod":12,"slowPeriod":26,"signalPeriod":9}]}'::jsonb, 'value', 20),
	('level-vwap', 'level', 'Balik ke Garis VWAP', 'Harga kembali di atas garis acuan transaksi harian.', '{"screeningId":"level_based_entries__vwap_reclaim","fundamentalIndicators":[],"technicalIndicators":[{"type":"VWAP","period":20}]}'::jsonb, 'intraday', 10),
	('level-pivot', 'level', 'Mantul dari Support', 'Harga lagi mantul dari level support yang biasanya dijagain.', '{"screeningId":"level_based_entries__pivot_support_bounce","fundamentalIndicators":[],"technicalIndicators":[{"type":"PIVOT_POINTS"}]}'::jsonb, 'support', 20),
	('trend-supertrend', 'trend', 'Tren Masih Lanjut', 'Saham yang trennya masih kuat, belum ada tanda mau balik arah.', '{"screeningId":"trend_with_conviction__supertrend_continuation","fundamentalIndicators":[],"technicalIndicators":[{"type":"SUPERTREND","period":10,"multiplier":3}]}'::jsonb, 'trend-following', 10),
	('trend-adx', 'trend', 'Tren Solid, Bukan Asal Naik', 'Pergerakannya terarah dan stabil, bukan zig-zag tanpa arah.', '{"screeningId":"trend_with_conviction__adx_trend_strength","fundamentalIndicators":[],"technicalIndicators":[{"type":"ADX","period":14,"threshold":25}]}'::jsonb, 'trend-following', 20),
	('trend-parabolic', 'trend', 'Sinyal Lanjut Tren', 'Sistem SAR konfirmasi tren masih jalan tanpa gangguan.', '{"screeningId":"trend_with_conviction__parabolic_sar_trend","fundamentalIndicators":[],"technicalIndicators":[{"type":"PARABOLIC_SAR","afStart":0.02,"afStep":0.02,"afMax":0.2}]}'::jsonb, 'trend-following', 30),
	('momentum-macd', 'momentum', 'Momentum Mulai Cepat', 'MACD nunjukin percepatan, biasanya tanda mulai gerak serius.', '{"screeningId":"ride_the_momentum__macd_momentum","fundamentalIndicators":[],"technicalIndicators":[{"type":"MACD","fastPeriod":12,"slowPeriod":26,"signalPeriod":9}]}'::jsonb, 'momentum', 10),
	('momentum-rsi-macd', 'momentum', 'Bangkit dari Tekanan', 'Saham yang habis tertekan dan mulai pulih dengan momentum kuat.', '{"screeningId":"ride_the_momentum__rsi_macd_momentum","fundamentalIndicators":[],"technicalIndicators":[{"type":"RSI","period":14,"oversold":35,"overbought":70},{"type":"MACD","fastPeriod":12,"slowPeriod":26,"signalPeriod":9}]}'::jsonb, 'momentum', 20),
	('dip-stochastic', 'dip-buy', 'Mantul dari Jenuh Jual', 'Saham yang kelewat dijual dan mulai dibeli lagi.', '{"screeningId":"buy_the_dip__stochastic_oversold_bounce","fundamentalIndicators":[],"technicalIndicators":[{"type":"STOCHASTIC","kPeriod":14,"dPeriod":3,"oversold":20,"overbought":80}]}'::jsonb, 'dip-buy', 10),
	('dip-bollinger', 'dip-buy', 'Mantul dari Batas Bawah', 'Harga nyentuh batas bawah Bollinger dan mulai naik balik.', '{"screeningId":"buy_the_dip__bollinger_band_bounce","fundamentalIndicators":[],"technicalIndicators":[{"type":"BOLLINGER_BANDS","period":20,"stdDev":2}]}'::jsonb, 'dip-buy', 20),
	('dip-rsi', 'dip-buy', 'Habis Dibanting, Mulai Naik', 'Setelah dijual habis-habisan, harga mulai mantul.', '{"screeningId":"buy_the_dip__rsi_oversold_bounce","fundamentalIndicators":[],"technicalIndicators":[{"type":"RSI","period":14,"oversold":30,"overbought":70}]}'::jsonb, 'dip-buy', 30)
ON CONFLICT ("preset_id") DO UPDATE SET
	"category_id" = excluded."category_id",
	"preset_name" = excluded."preset_name",
	"summary" = excluded."summary",
	"config" = excluded."config",
	"tag" = excluded."tag",
	"sort_order" = excluded."sort_order",
	"updated_at" = now();
