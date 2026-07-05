export type PresetIndicatorConfig = {
  type: string
  [key: string]: string | number | boolean | undefined
}

export type ScreenerPreset = {
  id: string
  name: string
  group: string
  groupLabel: string
  groupDescription: string | null
  summary: string
  tag: string | null
  defaultFields: string[]
  config: {
    screeningId: string
    fundamentalIndicators: PresetIndicatorConfig[]
    technicalIndicators: PresetIndicatorConfig[]
    filters?: {
      marketCap?: string[]
      sectors?: string[]
      syariah?: boolean
    }
  }
}

const CATEGORIES = {
  setup: {
    group: "Sebelum Saham Bergerak",
    groupLabel: "SETUP",
    groupDescription: "Kompresi harga atau volume sebelum saham mulai bergerak.",
  },
  breakout: {
    group: "Baru Breakout",
    groupLabel: "BREAKOUT",
    groupDescription: "Saham yang baru keluar dari konsolidasi dengan dukungan volume atau trend.",
  },
  value: {
    group: "Saham Lagi Murah",
    groupLabel: "VALUE",
    groupDescription: "Filter saham value dengan valuation rendah, kualitas laba, atau momentum awal.",
  },
  level: {
    group: "Entry di Level Penting",
    groupLabel: "LEVEL",
    groupDescription: "Setup di area acuan seperti VWAP, pivot, atau support yang sedang direbut ulang.",
  },
  trend: {
    group: "Tren Lagi Kencang",
    groupLabel: "TREND",
    groupDescription: "Trend-following untuk saham yang arah naiknya sudah lebih terkonfirmasi.",
  },
  momentum: {
    group: "Ikut Momentum",
    groupLabel: "MOMENTUM",
    groupDescription: "Saham yang mulai punya percepatan teknikal dari MACD, RSI, atau kombinasi momentum.",
  },
  dipBuy: {
    group: "Beli Saat Turun",
    groupLabel: "DIP BUY",
    groupDescription: "Mean-reversion untuk saham yang oversold dan mulai menunjukkan potensi pantulan.",
  },
} as const

export const SCREENER_PRESETS: ScreenerPreset[] = [
  {
    id: "calm-volume-dry-up",
    name: "Volume Sepi",
    ...CATEGORIES.setup,
    summary: "Transaksi lagi sepi. Biasanya menarik kalau mulai ada yang masuk.",
    tag: "scalping",
    defaultFields: ["volume_ratio_20d", "avg_value_20d", "return_5d", "range_20d_pct", "volatility_20d"],
    config: {
      screeningId: "calm_before_the_move__volume_dry_up",
      fundamentalIndicators: [],
      technicalIndicators: [
        { consecutiveDays: 5, dryUpThreshold: 0.3, period: 20, signalWindow: 1, type: "VOLUME_DRY_UP" },
        { highThreshold: 1, lookback: 60, lowThreshold: -0.5, mode: "LOW_VOL", period: 20, signalWindow: 1, type: "VOLATILITY_REGIME" },
      ],
    },
  },
  {
    id: "calm-low-vol-regime",
    name: "Harga Tenang",
    ...CATEGORIES.setup,
    summary: "Harga lagi sempit dan belum ke mana-mana.",
    tag: "setup",
    defaultFields: ["range_20d_pct", "volatility_20d", "volume_ratio_20d", "close_vs_sma_20_pct", "return_20d"],
    config: {
      screeningId: "calm_before_the_move__low_volatility_regime",
      fundamentalIndicators: [],
      technicalIndicators: [
        { highThreshold: 1, lookback: 60, lowThreshold: -0.5, mode: "LOW_VOL", period: 20, signalWindow: 1, type: "VOLATILITY_REGIME" },
        { consecutiveDays: 5, dryUpThreshold: 0.3, period: 20, signalWindow: 1, type: "VOLUME_DRY_UP" },
      ],
    },
  },
  {
    id: "fresh-breakout-base",
    name: "Breakout Baru",
    ...CATEGORIES.breakout,
    summary: "Baru keluar dari area konsolidasi.",
    tag: "breakout",
    defaultFields: ["return_5d", "return_20d", "volume_ratio_20d", "value_ratio_20d", "dist_from_52w_high_pct"],
    config: {
      screeningId: "fresh_breakout_with_volume__base_breakout",
      fundamentalIndicators: [],
      technicalIndicators: [
        { basePeriod: 20, breakoutPct: 1.5, maxBaseRange: 15, type: "BASE_BREAKOUT", volumeMultiplier: 1.5 },
      ],
    },
  },
  {
    id: "fresh-breakout-volume-spike",
    name: "Volume Ramai",
    ...CATEGORIES.breakout,
    summary: "Volume naik jauh di atas biasanya.",
    tag: "scalping",
    defaultFields: ["volume_ratio_20d", "value_ratio_20d", "avg_value_20d", "return_1d", "return_5d"],
    config: {
      screeningId: "fresh_breakout_with_volume__volume_spike",
      fundamentalIndicators: [],
      technicalIndicators: [
        { period: 10, signalWindow: 1, threshold: 5, type: "VOLUME_SMA" },
        { period: 14, signalWindow: 1, threshold: 35, type: "ADX" },
      ],
    },
  },
  {
    id: "fresh-breakout-volume-adx",
    name: "Breakout Kuat",
    ...CATEGORIES.breakout,
    summary: "Breakout dengan tren yang sudah mulai terbentuk.",
    tag: "breakout",
    defaultFields: ["return_5d", "return_20d", "volume_ratio_20d", "close_vs_sma_50_pct", "dist_from_52w_high_pct"],
    config: {
      screeningId: "fresh_breakout_with_volume__volume_spike_adx_trend",
      fundamentalIndicators: [],
      technicalIndicators: [
        { period: 10, signalWindow: 1, threshold: 4, type: "VOLUME_SMA" },
        { period: 14, signalWindow: 1, threshold: 45, type: "ADX" },
      ],
    },
  },
  {
    id: "undervalued-quality",
    name: "Murah Berkualitas",
    ...CATEGORIES.value,
    summary: "Valuasinya menarik, bisnisnya tetap sehat.",
    tag: "value",
    defaultFields: ["pe_ratio", "pbv", "roe", "der", "market_cap"],
    config: {
      screeningId: "undervalued_picks__quality_value",
      fundamentalIndicators: [
        { max: 8, type: "PE_RATIO" },
        { min: 12, type: "ROE" },
      ],
      technicalIndicators: [
        { longPeriod: 50, shortPeriod: 30, type: "SMA_TREND" },
      ],
    },
  },
  {
    id: "undervalued-momentum",
    name: "Murah & Bergerak",
    ...CATEGORIES.value,
    summary: "Masih murah, tapi harganya mulai jalan.",
    tag: "value",
    defaultFields: ["pe_ratio", "pbv", "roe", "return_20d", "close_vs_sma_50_pct", "volume_ratio_20d"],
    config: {
      screeningId: "undervalued_picks__value_with_momentum",
      fundamentalIndicators: [
        { max: 10, type: "PE_RATIO" },
      ],
      technicalIndicators: [
        { fastPeriod: 12, signalWindow: 1, signalPeriod: 12, slowPeriod: 26, type: "MACD" },
        { longPeriod: 50, shortPeriod: 30, type: "SMA_TREND" },
      ],
    },
  },
  {
    id: "level-vwap",
    name: "Rebut VWAP",
    ...CATEGORIES.level,
    summary: "Harga kembali di atas VWAP.",
    tag: "intraday",
    defaultFields: ["return_1d", "return_5d", "volume_ratio_20d", "close_vs_sma_20_pct", "value_ratio_20d"],
    config: {
      screeningId: "level_based_entries__vwap_reclaim",
      fundamentalIndicators: [],
      technicalIndicators: [
        { signalWindow: 1, type: "VWAP" },
        { fastPeriod: 12, signalPeriod: 9, signalWindow: 1, slowPeriod: 26, type: "MACD" },
        { period: 10, signalWindow: 1, threshold: 3, type: "VOLUME_SMA" },
      ],
    },
  },
  {
    id: "level-pivot",
    name: "Pantul Support",
    ...CATEGORIES.level,
    summary: "Harga memantul dari area support.",
    tag: "support",
    defaultFields: ["return_1d", "return_5d", "dist_from_52w_low_pct", "close_vs_sma_20_pct", "volume_ratio_20d"],
    config: {
      screeningId: "level_based_entries__pivot_support_bounce",
      fundamentalIndicators: [],
      technicalIndicators: [
        { signalWindow: 1, type: "PIVOT_POINTS" },
        { overbought: 70, oversold: 25, period: 14, signalWindow: 1, type: "RSI" },
      ],
    },
  },
  {
    id: "trend-supertrend",
    name: "Tren Naik",
    ...CATEGORIES.trend,
    summary: "Tren naik masih bertahan.",
    tag: "trend-following",
    defaultFields: ["return_20d", "return_60d", "close_vs_sma_50_pct", "volume_ratio_20d", "dist_from_52w_high_pct"],
    config: {
      screeningId: "trend_with_conviction__supertrend_continuation",
      fundamentalIndicators: [],
      technicalIndicators: [
        { multiplier: 3, period: 10, signalWindow: 1, type: "SUPERTREND" },
        { period: 14, signalWindow: 1, threshold: 60, type: "ADX" },
        { longPeriod: 50, shortPeriod: 30, type: "SMA_TREND" },
      ],
    },
  },
  {
    id: "trend-adx",
    name: "Tren Kuat",
    ...CATEGORIES.trend,
    summary: "Naiknya rapi dan konsisten.",
    tag: "trend-following",
    defaultFields: ["return_20d", "return_60d", "close_vs_sma_50_pct", "volume_ratio_20d", "dist_from_52w_high_pct"],
    config: {
      screeningId: "trend_with_conviction__adx_trend_strength",
      fundamentalIndicators: [],
      technicalIndicators: [
        { period: 14, signalWindow: 1, threshold: 35, type: "ADX" },
        { longPeriod: 50, shortPeriod: 30, type: "SMA_TREND" },
        { fastPeriod: 12, signalPeriod: 12, signalWindow: 1, slowPeriod: 26, type: "MACD" },
      ],
    },
  },
  {
    id: "trend-parabolic",
    name: "Ikut Tren",
    ...CATEGORIES.trend,
    summary: "Belum ada tanda tren selesai.",
    tag: "trend-following",
    defaultFields: ["return_20d", "return_60d", "close_vs_sma_50_pct", "volatility_20d", "dist_from_52w_high_pct"],
    config: {
      screeningId: "trend_with_conviction__parabolic_sar_trend",
      fundamentalIndicators: [],
      technicalIndicators: [
        { afMax: 0.15, afStart: 0.02, afStep: 0.02, signalWindow: 1, type: "PARABOLIC_SAR" },
        { period: 14, signalWindow: 1, threshold: 55, type: "ADX" },
        { longPeriod: 50, shortPeriod: 30, type: "SMA_TREND" },
      ],
    },
  },
  {
    id: "momentum-macd",
    name: "Momentum Naik",
    ...CATEGORIES.momentum,
    summary: "Tenaga naik mulai bertambah.",
    tag: "momentum",
    defaultFields: ["return_5d", "return_20d", "return_60d", "volume_ratio_20d", "value_ratio_20d"],
    config: {
      screeningId: "ride_the_momentum__macd_momentum",
      fundamentalIndicators: [],
      technicalIndicators: [
        { fastPeriod: 12, signalWindow: 1, signalPeriod: 12, slowPeriod: 26, type: "MACD" },
        { longPeriod: 50, shortPeriod: 30, type: "SMA_TREND" },
        { period: 14, signalWindow: 1, threshold: 35, type: "ADX" },
      ],
    },
  },
  {
    id: "momentum-rsi-macd",
    name: "Mulai Pulih",
    ...CATEGORIES.momentum,
    summary: "Mulai bangkit setelah sempat melemah.",
    tag: "momentum",
    defaultFields: ["return_5d", "return_20d", "close_vs_sma_20_pct", "volume_ratio_20d", "value_ratio_20d"],
    config: {
      screeningId: "ride_the_momentum__rsi_macd_momentum",
      fundamentalIndicators: [],
      technicalIndicators: [
        { overbought: 70, oversold: 35, period: 14, signalWindow: 1, type: "RSI" },
        { fastPeriod: 12, signalWindow: 1, signalPeriod: 9, slowPeriod: 26, type: "MACD" },
      ],
    },
  },
  {
    id: "dip-stochastic",
    name: "Oversold",
    ...CATEGORIES.dipBuy,
    summary: "Sudah banyak dijual, mulai ada pantulan.",
    tag: "dip-buy",
    defaultFields: ["return_5d", "return_20d", "dist_from_52w_low_pct", "volume_ratio_20d", "volatility_20d"],
    config: {
      screeningId: "buy_the_dip__stochastic_oversold_bounce",
      fundamentalIndicators: [],
      technicalIndicators: [
        { dPeriod: 5, kPeriod: 20, overbought: 80, oversold: 15, signalWindow: 1, type: "STOCHASTIC" },
        { overbought: 70, oversold: 30, period: 14, signalWindow: 1, type: "RSI" },
      ],
    },
  },
  {
    id: "dip-bollinger",
    name: "Pantul Bawah",
    ...CATEGORIES.dipBuy,
    summary: "Harga memantul dari area bawah Bollinger Band.",
    tag: "dip-buy",
    defaultFields: ["return_5d", "return_20d", "dist_from_52w_low_pct", "range_20d_pct", "volatility_20d"],
    config: {
      screeningId: "buy_the_dip__bollinger_band_bounce",
      fundamentalIndicators: [],
      technicalIndicators: [
        { period: 20, signalWindow: 1, stdDev: 2.2, type: "BOLLINGER_BANDS" },
        { overbought: 70, oversold: 25, period: 14, signalWindow: 1, type: "RSI" },
      ],
    },
  },
  {
    id: "dip-rsi",
    name: "Mulai Rebound",
    ...CATEGORIES.dipBuy,
    summary: "Mulai naik setelah penurunan tajam.",
    tag: "dip-buy",
    defaultFields: ["return_5d", "return_20d", "dist_from_52w_low_pct", "volume_ratio_20d", "volatility_20d"],
    config: {
      screeningId: "buy_the_dip__rsi_oversold_bounce",
      fundamentalIndicators: [],
      technicalIndicators: [
        { overbought: 70, oversold: 25, period: 10, signalWindow: 1, type: "RSI" },
        { period: 20, signalWindow: 1, stdDev: 2.2, type: "BOLLINGER_BANDS" },
      ],
    },
  },
]
