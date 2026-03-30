"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bell, BellPlus, ArrowUpDown, Search, SlidersHorizontal, Star, StarOff, Columns3, Plus, X, ChevronDown, Save, Sparkles, Check } from "lucide-react"
import { toast } from "sonner"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TickerTape } from "@/components/ticker-tape"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { BacktestRequest } from "@/lib/api"
import {
  technicalIndicatorCategories,
  technicalIndicatorNameToApiType,
  technicalIndicatorNameToKey,
} from "@/lib/technical-indicators"
import { useClerk, useUser } from "@clerk/nextjs"

type ScreenerRow = {
  stockCode: string
  open: number | null
  high: number | null
  low: number | null
  close: number | null
  volume: number | null
  freq: number | null
  valuasi: number | null
  nbsa: number | null
  prevClose: number | null
  gapPct: number | null
  prevDailyValue: number | null
  isValidOhlcv: boolean
  isZeroOhlc: boolean
  month: number | null
  sector: string | null
  assets: number | null
  liabilities: number | null
  equity: number | null
  sales: number | null
  ebt: number | null
  profit: number | null
  profitAttributable: number | null
  bookValue: number | null
  eps: number | null
  peRatio: number | null
  pbv: number | null
  der: number | null
  roa: number | null
  roe: number | null
  npm: number | null
  financialDate: string | null
  marketCap: number | null
  marketCapGroup: string | null
  isSyariah: boolean
  sma20: number | null
  sma50: number | null
  volumeSma20: number | null
  valueSma20: number | null
  nbsa5d: number | null
  value5d: number | null
  nbsaRatio5d: number | null
  changeD1Pct: number | null
  change5DPct: number | null
  change1MPct: number | null
  change1YPct: number | null
}

type ScreenerApiResponse = {
  screeningId: string
  latestDate: string | null
  rows: ScreenerRow[]
  summary: {
    totalSignals: number
    uniqueStocks: number
    byDay: Record<string, number>
    stocksScanned: number
    passedFilters: number
    passedFundamentals: number
  }
  dateRange: {
    from?: string
    to?: string
  } | null
}

type AlertDraft = {
  ticker: string
  type: "masuk-radar" | "technical-score" | "rsi"
  threshold: string
  isActive: boolean
}

type SavedAlert = AlertDraft & {
  id: string
  createdAt: string
}

type RuleCategory = "technical" | "fundamental"
type RuleMode = "range" | "select" | "params"

type FilterOption = { label: string; value: string }
type FilterParamDefinition = {
  label: string
  options?: FilterOption[]
}

type FilterDefinition = {
  label: string
  category: RuleCategory
  mode: RuleMode
  description: string
  defaultParams: Record<string, string>
  options?: FilterOption[]
  paramDefinitions?: Record<string, FilterParamDefinition>
  groupLabel?: string
  apiType?: string
}

type PresetIndicatorConfig = {
  type: string
  [key: string]: string | number | boolean | undefined
}

type ScreenerPreset = {
  id: string
  name: string
  group: string
  summary: string
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

type ColumnKind = "currency" | "number" | "percent" | "text" | "boolean" | "date"

type ColumnConfig = {
  id: Exclude<ColumnId, "action">
  label: string
  kind: ColumnKind
  sortable?: boolean
  headClassName?: string
  cellClassName?: string
}

type SortKey = keyof ScreenerRow

const COLUMN_LABELS = {
  stockCode: "Saham",
  open: "Open",
  high: "High",
  low: "Low",
  close: "Harga",
  changeD1Pct: "1D Chg",
  change5DPct: "5D Chg",
  change1MPct: "1M Chg",
  change1YPct: "1Y Chg",
  freq: "Freq",
  valuasi: "Mkt Cap",
  nbsa: "NBSA",
  prevClose: "Prev Close",
  gapPct: "Gap %",
  prevDailyValue: "Prev Value",
  isValidOhlcv: "Valid OHLCV",
  isZeroOhlc: "Zero OHLC",
  month: "Month",
  assets: "Assets",
  liabilities: "Liabilities",
  equity: "Equity",
  sales: "Sales",
  ebt: "EBT",
  profit: "Profit",
  profitAttributable: "Profit Attr.",
  bookValue: "Book Value",
  eps: "EPS",
  peRatio: "PE",
  pbv: "PBV",
  der: "DER",
  roa: "ROA",
  roe: "ROE",
  npm: "NPM",
  financialDate: "Financial Date",
  marketCap: "Market Cap",
  sma20: "SMA 20",
  sma50: "SMA 50",
  volumeSma20: "Vol SMA 20",
  valueSma20: "Value SMA 20",
  nbsa5d: "NBSA 5D",
  value5d: "Value 5D",
  nbsaRatio5d: "NBSA Ratio 5D",
  action: "Action",
} as const

type ColumnId = keyof typeof COLUMN_LABELS

const COLUMN_CONFIGS: ColumnConfig[] = [
  { id: "changeD1Pct", label: "1D Chg", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "change5DPct", label: "5D Chg", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "change1MPct", label: "1M Chg", kind: "percent", sortable: true, headClassName: "w-[120px] text-right", cellClassName: "w-[120px] text-right font-ibm-plex-mono" },
  { id: "change1YPct", label: "1Y Chg", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "close", label: "Harga", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "open", label: "Open", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "high", label: "High", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "low", label: "Low", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "freq", label: "Freq", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "valuasi", label: "Mkt Cap", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "nbsa", label: "NBSA", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "prevClose", label: "Prev Close", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "gapPct", label: "Gap %", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "prevDailyValue", label: "Prev Value", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "isValidOhlcv", label: "Valid OHLCV", kind: "boolean", sortable: true, headClassName: "min-w-[112px]" },
  { id: "isZeroOhlc", label: "Zero OHLC", kind: "boolean", sortable: true, headClassName: "min-w-[104px]" },
  { id: "month", label: "Month", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "assets", label: "Assets", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "liabilities", label: "Liabilities", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "equity", label: "Equity", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "sales", label: "Sales", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "ebt", label: "EBT", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "profit", label: "Profit", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "profitAttributable", label: "Profit Attr.", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "bookValue", label: "Book Value", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "eps", label: "EPS", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "peRatio", label: "PE", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "pbv", label: "PBV", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "der", label: "DER", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "roa", label: "ROA", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "roe", label: "ROE", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "npm", label: "NPM", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "financialDate", label: "Financial Date", kind: "date", sortable: true, headClassName: "min-w-[118px]" },
  { id: "marketCap", label: "Market Cap", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "sma20", label: "SMA 20", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "sma50", label: "SMA 50", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "volumeSma20", label: "Vol SMA 20", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "valueSma20", label: "Value SMA 20", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "nbsa5d", label: "NBSA 5D", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "value5d", label: "Value 5D", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "nbsaRatio5d", label: "NBSA Ratio 5D", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
]

const COLUMN_TEMPLATES = {
  recommended: ["stockCode", "changeD1Pct", "change5DPct", "change1MPct", "change1YPct", "close", "valuasi", "peRatio", "pbv", "roe", "marketCap", "sma20", "sma50", "nbsaRatio5d", "action"],
  technical: ["stockCode", "changeD1Pct", "change5DPct", "change1MPct", "change1YPct", "close", "gapPct", "prevDailyValue", "sma20", "sma50", "volumeSma20", "valueSma20", "nbsa5d", "nbsaRatio5d", "action"],
  fundamental: ["stockCode", "change1MPct", "change1YPct", "close", "marketCap", "assets", "liabilities", "equity", "sales", "profit", "eps", "peRatio", "pbv", "der", "roa", "roe", "npm", "action"],
  all: ["stockCode", ...COLUMN_CONFIGS.map((column) => column.id), "action"],
} as const

type ColumnTemplateKey = keyof typeof COLUMN_TEMPLATES
const FIXED_COLUMN_IDS: ColumnId[] = ["stockCode", "action"]

function formatParamLabel(paramKey: string) {
  return paramKey
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/Pct/g, " %")
    .replace(/^./, (value) => value.toUpperCase())
}

const QUICK_FILTER_LIBRARY: Record<string, FilterDefinition> = {
  changePct: {
    label: "Chg.",
    category: "technical",
    mode: "range",
    description: "Perubahan harga harian.",
    defaultParams: { min: "0", max: "" },
    groupLabel: "Screener Metrics",
  },
  monthChangePct: {
    label: "1M Chg",
    category: "technical",
    mode: "range",
    description: "Performa satu bulan.",
    defaultParams: { min: "0", max: "" },
    groupLabel: "Screener Metrics",
  },
  ytdChangePct: {
    label: "1Y Chg",
    category: "technical",
    mode: "range",
    description: "Performa satu tahun berjalan.",
    defaultParams: { min: "0", max: "" },
    groupLabel: "Screener Metrics",
  },
  rsi: {
    label: "RSI",
    category: "technical",
    mode: "range",
    description: "Momentum oscillator.",
    defaultParams: { min: "40", max: "70" },
    groupLabel: "Screener Metrics",
  },
  ma20GapPct: {
    label: "MA-20",
    category: "technical",
    mode: "range",
    description: "Jarak harga terhadap MA-20.",
    defaultParams: { min: "0", max: "" },
    groupLabel: "Screener Metrics",
  },
  ma5GapPct: {
    label: "MA-5",
    category: "technical",
    mode: "range",
    description: "Jarak harga terhadap MA-5.",
    defaultParams: { min: "0", max: "" },
    groupLabel: "Screener Metrics",
  },
  trend: {
    label: "Trend",
    category: "technical",
    mode: "select",
    description: "Arah trend utama.",
    defaultParams: { value: "uptrend" },
    options: [
      { label: "Uptrend", value: "uptrend" },
      { label: "Sideways", value: "sideways" },
      { label: "Downtrend", value: "downtrend" },
    ],
    groupLabel: "Screener Metrics",
  },
  technicalScore: {
    label: "Technical Score",
    category: "technical",
    mode: "range",
    description: "Skor teknikal internal.",
    defaultParams: { min: "70", max: "" },
    groupLabel: "Screener Metrics",
  },
  pe: {
    label: "PE",
    category: "fundamental",
    mode: "range",
    description: "Price to earnings.",
    defaultParams: { min: "", max: "15" },
  },
  pbv: {
    label: "PBV",
    category: "fundamental",
    mode: "range",
    description: "Price to book.",
    defaultParams: { min: "", max: "3" },
  },
  roe: {
    label: "ROE",
    category: "fundamental",
    mode: "range",
    description: "Return on equity.",
    defaultParams: { min: "10", max: "" },
  },
  epsGrowth: {
    label: "EPS YoY",
    category: "fundamental",
    mode: "range",
    description: "Pertumbuhan EPS tahunan.",
    defaultParams: { min: "0", max: "" },
  },
  valuation: {
    label: "Value",
    category: "fundamental",
    mode: "select",
    description: "Kategori valuasi.",
    defaultParams: { value: "value" },
    options: [
      { label: "Value", value: "value" },
      { label: "Fair", value: "fair" },
      { label: "Premium", value: "premium" },
    ],
  },
  fundamentalScore: {
    label: "Fundamental Score",
    category: "fundamental",
    mode: "range",
    description: "Skor fundamental internal.",
    defaultParams: { min: "70", max: "" },
  },
}

const technicalParamOptions: Record<string, Record<string, FilterOption[]>> = {
  [technicalIndicatorNameToKey("Foreign Flow")]: {
    flowType: [
      { label: "Accumulation", value: "accumulation" },
      { label: "Distribution", value: "distribution" },
    ],
  },
  [technicalIndicatorNameToKey("Volatility Regime")]: {
    mode: [
      { label: "Both", value: "BOTH" },
      { label: "Low", value: "LOW" },
      { label: "High", value: "HIGH" },
    ],
  },
  [technicalIndicatorNameToKey("Calendar Effect")]: {
    mode: [
      { label: "Month End", value: "MONTH_END" },
      { label: "Month Start", value: "MONTH_START" },
      { label: "Turn Of Month", value: "TURN_OF_MONTH" },
    ],
  },
}

const importedTechnicalFilterLibrary: Record<string, FilterDefinition> = Object.fromEntries(
  technicalIndicatorCategories.flatMap((category) =>
    category.indicators.map((indicator) => {
      const key = technicalIndicatorNameToKey(indicator.name)
      return [
        key,
        {
          label: indicator.name,
          category: "technical",
          mode: "params",
          description: indicator.description,
          defaultParams: Object.fromEntries(
            Object.entries(indicator.params).map(([paramKey, value]) => [paramKey, String(value)]),
          ),
          paramDefinitions: Object.fromEntries(
            Object.keys(indicator.params).map((paramKey) => [
              paramKey,
              {
                label: formatParamLabel(paramKey),
                options: technicalParamOptions[key]?.[paramKey],
              },
            ]),
          ),
          groupLabel: category.name,
          apiType: technicalIndicatorNameToApiType(indicator.name),
        } as FilterDefinition,
      ]
    }),
  ),
)

const FILTER_LIBRARY: Record<string, FilterDefinition> = {
  ...QUICK_FILTER_LIBRARY,
  ...importedTechnicalFilterLibrary,
}

type FilterKey = keyof typeof FILTER_LIBRARY

const technicalFilterGroups = Array.from(
  (Object.entries(FILTER_LIBRARY) as [FilterKey, FilterDefinition][])
    .filter(([, definition]) => definition.category === "technical")
    .reduce((groups, [key, definition]) => {
      const groupLabel = definition.groupLabel ?? "Technical"
      const existing = groups.get(groupLabel)
      if (existing) {
        existing.push([key, definition])
      } else {
        groups.set(groupLabel, [[key, definition]])
      }
      return groups
    }, new Map<string, [FilterKey, FilterDefinition][]>())
    .entries(),
).map(([groupLabel, entries]) => ({ groupLabel, entries }))

type ScreenerRule = {
  id: string
  key: FilterKey
  category: RuleCategory
  params: Record<string, string>
}

const SCREENER_PRESETS: ScreenerPreset[] = [
  {
    id: "calm-volume-dry-up",
    name: "Volume Dry-Up",
    group: "Calm Before the Move",
    summary: "Cari saham yang volume-nya mengecil sebelum potensi gerak berikutnya.",
    config: {
      screeningId: "calm_before_the_move__volume_dry_up",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "VOLUME_DRY_UP", period: 20, dryUpThreshold: 0.5, consecutiveDays: 3 },
      ],
    },
  },
  {
    id: "calm-low-vol-regime",
    name: "Low Volatility Regime",
    group: "Calm Before the Move",
    summary: "Fokus ke regime volatilitas rendah untuk fase kompresi harga.",
    config: {
      screeningId: "calm_before_the_move__low_volatility_regime",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "VOLATILITY_REGIME", period: 20, lookback: 60, lowThreshold: -0.5, highThreshold: 1, mode: "LOW" },
      ],
    },
  },
  {
    id: "fresh-breakout-base",
    name: "Base Breakout",
    group: "Fresh Breakout with Volume",
    summary: "Breakout dari base rapat dengan validasi volume.",
    config: {
      screeningId: "fresh_breakout_with_volume__base_breakout",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "BASE_BREAKOUT", basePeriod: 20, breakoutPct: 1.5, maxBaseRange: 15, volumeMultiplier: 1.5 },
      ],
    },
  },
  {
    id: "fresh-breakout-volume-spike",
    name: "Volume Spike",
    group: "Fresh Breakout with Volume",
    summary: "Sorot saham yang baru menunjukkan lonjakan volume signifikan.",
    config: {
      screeningId: "fresh_breakout_with_volume__volume_spike",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "VOLUME_SMA", period: 20, threshold: 1.5 },
      ],
    },
  },
  {
    id: "fresh-breakout-volume-adx",
    name: "Volume Spike + ADX Trend",
    group: "Fresh Breakout with Volume",
    summary: "Gabungkan volume spike dengan kekuatan trend yang sudah terkonfirmasi.",
    config: {
      screeningId: "fresh_breakout_with_volume__volume_spike_adx_trend",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "VOLUME_SMA", period: 20, threshold: 1.5 },
        { type: "ADX", period: 14, threshold: 25 },
      ],
    },
  },
  {
    id: "undervalued-quality",
    name: "Quality Value",
    group: "Undervalued Picks",
    summary: "Saring saham value dengan profitabilitas yang tetap sehat.",
    config: {
      screeningId: "undervalued_picks__quality_value",
      fundamentalIndicators: [
        { type: "PBV", max: 1.8 },
        { type: "ROE", min: 15 },
      ],
      technicalIndicators: [],
    },
  },
  {
    id: "undervalued-momentum",
    name: "Value with Momentum",
    group: "Undervalued Picks",
    summary: "Value setup yang mulai didukung momentum teknikal.",
    config: {
      screeningId: "undervalued_picks__value_with_momentum",
      fundamentalIndicators: [
        { type: "PE_RATIO", max: 15 },
      ],
      technicalIndicators: [
        { type: "MACD", fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      ],
    },
  },
  {
    id: "level-vwap",
    name: "VWAP Reclaim",
    group: "Level-Based Entries",
    summary: "Masuk saat harga kembali reclaim area VWAP sebagai level acuan.",
    config: {
      screeningId: "level_based_entries__vwap_reclaim",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "VWAP", period: 20 },
      ],
    },
  },
  {
    id: "level-pivot",
    name: "Pivot Support Bounce",
    group: "Level-Based Entries",
    summary: "Cari bounce dari pivot support untuk entry dekat level defensif.",
    config: {
      screeningId: "level_based_entries__pivot_support_bounce",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "PIVOT_POINTS" },
      ],
    },
  },
  {
    id: "trend-supertrend",
    name: "Supertrend Continuation",
    group: "Trend With Conviction",
    summary: "Trend-following setup untuk saham yang masih melanjutkan impuls.",
    config: {
      screeningId: "trend_with_conviction__supertrend_continuation",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "SUPERTREND", period: 10, multiplier: 3 },
      ],
    },
  },
  {
    id: "trend-adx",
    name: "ADX Trend Strength",
    group: "Trend With Conviction",
    summary: "Pilih saham dengan trend kuat dan noise lebih rendah.",
    config: {
      screeningId: "trend_with_conviction__adx_trend_strength",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "ADX", period: 14, threshold: 25 },
      ],
    },
  },
  {
    id: "trend-parabolic",
    name: "Parabolic SAR Trend",
    group: "Trend With Conviction",
    summary: "Setup trend continuation berbasis flip SAR yang bersih.",
    config: {
      screeningId: "trend_with_conviction__parabolic_sar_trend",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "PARABOLIC_SAR", afStart: 0.02, afStep: 0.02, afMax: 0.2 },
      ],
    },
  },
  {
    id: "momentum-macd",
    name: "MACD Momentum",
    group: "Ride the Momentum",
    summary: "Cari percepatan tren lewat crossover MACD standar.",
    config: {
      screeningId: "ride_the_momentum__macd_momentum",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "MACD", fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      ],
    },
  },
  {
    id: "momentum-rsi-macd",
    name: "RSI + MACD Momentum",
    group: "Ride the Momentum",
    summary: "Momentum combo untuk setup yang sudah mulai pulih dari tekanan jual.",
    config: {
      screeningId: "ride_the_momentum__rsi_macd_momentum",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "RSI", period: 14, oversold: 35, overbought: 70 },
        { type: "MACD", fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      ],
    },
  },
  {
    id: "dip-stochastic",
    name: "Stochastic Oversold Bounce",
    group: "Buy the Dip",
    summary: "Pantau saham yang rebound dari area oversold oscillator.",
    config: {
      screeningId: "buy_the_dip__stochastic_oversold_bounce",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "STOCHASTIC", kPeriod: 14, dPeriod: 3, oversold: 20, overbought: 80 },
      ],
    },
  },
  {
    id: "dip-bollinger",
    name: "Bollinger Band Bounce",
    group: "Buy the Dip",
    summary: "Mean reversion setup dari sentuhan lower band.",
    config: {
      screeningId: "buy_the_dip__bollinger_band_bounce",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "BOLLINGER_BANDS", period: 20, stdDev: 2 },
      ],
    },
  },
  {
    id: "dip-rsi",
    name: "RSI Oversold Bounce",
    group: "Buy the Dip",
    summary: "Cari oversold pullback yang mulai siap memantul.",
    config: {
      screeningId: "buy_the_dip__rsi_oversold_bounce",
      fundamentalIndicators: [],
      technicalIndicators: [
        { type: "RSI", period: 14, oversold: 30, overbought: 70 },
      ],
    },
  },
]

const PRESET_GROUPS = Array.from(
  SCREENER_PRESETS.reduce((groups, preset) => {
    const existing = groups.get(preset.group)
    if (existing) {
      existing.push(preset)
    } else {
      groups.set(preset.group, [preset])
    }
    return groups
  }, new Map<string, ScreenerPreset[]>()),
)

const defaultAlertDraft: AlertDraft = {
  ticker: "",
  type: "masuk-radar",
  threshold: "75",
  isActive: true,
}

function getColumnTemplate(template: ColumnTemplateKey): ColumnId[] {
  return [...COLUMN_TEMPLATES[template]]
}

function formatPercent(value: number | null, digits = 1) {
  if (value === null) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}

function normalizeStoredColumnIds(columnId: string): ColumnId[] {
  if (columnId === "ticker") return ["stockCode"]
  if (columnId === "price") return ["close"]
  if (columnId === "changePct") return ["gapPct"]
  if (columnId === "monthChangePct") return ["change1MPct"]
  if (columnId === "ytdChangePct") return ["change1YPct"]
  if (columnId === "value") return ["valuasi"]
  if (columnId === "ma20") return ["sma20"]
  if (columnId === "ma5" || columnId === "ma50") return ["sma50"]
  if (columnId === "pe") return ["peRatio"]
  if (columnId in COLUMN_LABELS) return [columnId as ColumnId]
  return []
}

function createRule(key: FilterKey): ScreenerRule {
  const definition = FILTER_LIBRARY[key]
  return {
    id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key,
    category: definition.category,
    params: { ...definition.defaultParams },
  }
}

function createRuleWithParams(key: FilterKey, params: Record<string, string>): ScreenerRule {
  const definition = FILTER_LIBRARY[key]
  return {
    id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key,
    category: definition.category,
    params,
  }
}

function parseOptionalNumber(value: string | undefined) {
  if (!value || value.trim() === "") return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseRuleParamValue(value: string | undefined) {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  if (trimmed === "") return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : trimmed
}

function getConfiguredRuleParams(params: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(params)
      .map(([paramKey, value]) => [paramKey, parseRuleParamValue(value)] as const)
      .filter(([, value]) => value !== undefined),
  )
}

function findFilterKeyByApiType(type: string, category: RuleCategory): FilterKey | null {
  const matchedEntry = (Object.entries(FILTER_LIBRARY) as [FilterKey, FilterDefinition][])
    .find(([_, definition]) => definition.category === category && definition.apiType === type)

  if (matchedEntry) return matchedEntry[0]

  const fallbackMap: Partial<Record<string, FilterKey>> = {
    PE_RATIO: "pe",
    PBV: "pbv",
    ROE: "roe",
    EPS_GROWTH: "epsGrowth",
    VALUATION: "valuation",
    FUNDAMENTAL_SCORE: "fundamentalScore",
    TECHNICAL_SCORE: "technicalScore",
    TREND: "trend",
    DAILY_CHANGE: "changePct",
    MONTH_CHANGE: "monthChangePct",
    YEAR_CHANGE: "ytdChangePct",
    MA20_GAP: "ma20GapPct",
    MA5_GAP: "ma5GapPct",
  }

  return fallbackMap[type] ?? null
}

function createRuleFromPresetIndicator(indicator: PresetIndicatorConfig, category: RuleCategory): ScreenerRule | null {
  const filterKey = findFilterKeyByApiType(indicator.type, category)
  if (!filterKey) return null

  const definition = FILTER_LIBRARY[filterKey]
  const nextParams = { ...definition.defaultParams }

  Object.entries(indicator).forEach(([paramKey, value]) => {
    if (paramKey === "type" || value === undefined) return
    nextParams[paramKey] = String(value)
  })

  return createRuleWithParams(filterKey, nextParams)
}

function formatRuleSummary(rule: ScreenerRule) {
  const definition = FILTER_LIBRARY[rule.key]

  if (definition.mode === "params") {
    const configuredCount = Object.values(rule.params).filter((value) => value.trim() !== "").length
    return configuredCount > 0 ? `${definition.label} (${configuredCount})` : definition.label
  }

  if (definition.mode === "select") {
    const selected = definition.options?.find((option) => option.value === rule.params.value)?.label ?? rule.params.value
    return `${definition.label}: ${selected || "Any"}`
  }

  const min = rule.params.min?.trim()
  const max = rule.params.max?.trim()

  if (min && max) return `${definition.label}: ${min}-${max}`
  if (min) return `${definition.label} ≥ ${min}`
  if (max) return `${definition.label} ≤ ${max}`
  return definition.label
}

function TickerCircleIcon({ ticker }: { ticker: string }) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
      {hasError ? (
        <span className="font-ibm-plex-mono text-[11px] font-semibold text-muted-foreground">
          {ticker.slice(0, 2)}
        </span>
      ) : (
        <Image
          src={`/stock_icons/${ticker}.png`}
          alt={`${ticker} icon`}
          fill
          sizes="32px"
          className="object-contain"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}

export function ScreenerPage() {
  const { isLoaded, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const [search, setSearch] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [marketCapFilter, setMarketCapFilter] = useState("all")
  const [syariahFilter, setSyariahFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("close")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [radarTickers, setRadarTickers] = useState<string[]>([])
  const [alerts, setAlerts] = useState<SavedAlert[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertDraft, setAlertDraft] = useState<AlertDraft>(defaultAlertDraft)
  const [columnTemplate, setColumnTemplate] = useState<ColumnTemplateKey>("recommended")
  const [visibleColumnIds, setVisibleColumnIds] = useState<ColumnId[]>(() => getColumnTemplate("recommended"))
  const [activeRules, setActiveRules] = useState<ScreenerRule[]>([])
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [saveStrategyOpen, setSaveStrategyOpen] = useState(false)
  const [strategyName, setStrategyName] = useState("")
  const [strategyDescription, setStrategyDescription] = useState("")
  const [savingStrategy, setSavingStrategy] = useState(false)
  const [indicatorSearch, setIndicatorSearch] = useState("")
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [screenerRows, setScreenerRows] = useState<ScreenerRow[]>([])
  const [latestSnapshotDate, setLatestSnapshotDate] = useState<string | null>(null)
  const [screeningSummary, setScreeningSummary] = useState<ScreenerApiResponse["summary"] | null>(null)
  const [screeningDateRange, setScreeningDateRange] = useState<ScreenerApiResponse["dateRange"]>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [runElapsedTime, setRunElapsedTime] = useState("0.0")
  const [runError, setRunError] = useState<string | null>(null)

  useEffect(() => {
    const storedRadar = window.localStorage.getItem("algosaham-screener-radar")
    const storedAlerts = window.localStorage.getItem("algosaham-screener-alerts")
    const storedColumns = window.localStorage.getItem("algosaham-screener-columns")
    const storedTemplate = window.localStorage.getItem("algosaham-screener-column-template")

    if (storedRadar) {
      try {
        setRadarTickers(JSON.parse(storedRadar))
      } catch {
        setRadarTickers([])
      }
    }

    if (storedAlerts) {
      try {
        setAlerts(JSON.parse(storedAlerts))
      } catch {
        setAlerts([])
      }
    }

    if (storedColumns) {
      try {
        const parsed = JSON.parse(storedColumns) as string[]
        const normalizedColumns = parsed.flatMap((columnId) => normalizeStoredColumnIds(columnId))
        const normalized = Array.from(new Set([...FIXED_COLUMN_IDS, ...normalizedColumns])) as ColumnId[]
        setVisibleColumnIds(normalized)
      } catch {
        setVisibleColumnIds(getColumnTemplate("recommended"))
      }
    }

    if (storedTemplate && storedTemplate in COLUMN_TEMPLATES) {
      setColumnTemplate(storedTemplate as ColumnTemplateKey)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem("algosaham-screener-radar", JSON.stringify(radarTickers))
  }, [radarTickers])

  useEffect(() => {
    window.localStorage.setItem("algosaham-screener-alerts", JSON.stringify(alerts))
  }, [alerts])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      const startTime = Date.now()
      setRunElapsedTime("0.0")
      interval = setInterval(() => {
        const ms = Date.now() - startTime
        setRunElapsedTime((ms / 1000).toFixed(1))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    window.localStorage.setItem("algosaham-screener-columns", JSON.stringify(visibleColumnIds))
  }, [visibleColumnIds])

  useEffect(() => {
    window.localStorage.setItem("algosaham-screener-column-template", columnTemplate)
  }, [columnTemplate])

  const sectors = useMemo(
    () =>
      Array.from(
        new Set(
          screenerRows
            .map((row) => row.sector)
            .filter((sector): sector is string => Boolean(sector)),
        ),
      ).sort(),
    [screenerRows],
  )
  const normalizedIndicatorSearch = indicatorSearch.trim().toLowerCase()
  const filteredTechnicalFilterGroups = technicalFilterGroups
    .map(({ groupLabel, entries }) => ({
      groupLabel,
      entries: entries.filter(([, definition]) =>
        !normalizedIndicatorSearch ||
        definition.label.toLowerCase().includes(normalizedIndicatorSearch) ||
        definition.description.toLowerCase().includes(normalizedIndicatorSearch),
      ),
    }))
    .filter((group) => group.entries.length > 0)
  const filteredFundamentalFilters = (Object.entries(FILTER_LIBRARY) as [FilterKey, FilterDefinition][])
    .filter(([, definition]) => definition.category === "fundamental")
    .filter(([, definition]) =>
      !normalizedIndicatorSearch ||
      definition.label.toLowerCase().includes(normalizedIndicatorSearch) ||
      definition.description.toLowerCase().includes(normalizedIndicatorSearch),
    )

  function buildScreenerConfig(): BacktestRequest {
    return {
      backtestId: activePresetId ? `screener_${activePresetId}` : `screener_${Date.now()}`,
      filters: {
        marketCap: marketCapFilter === "all" ? [] : [marketCapFilter.toLowerCase()],
        syariah: syariahFilter === "all" ? undefined : syariahFilter === "yes",
        sectors: sectorFilter === "all" ? undefined : [sectorFilter],
      },
      fundamentalIndicators: activeRules
        .filter((rule) => rule.category === "fundamental")
        .map((rule) => {
          switch (rule.key) {
            case "pe":
              return { type: "PE_RATIO", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            case "pbv":
              return { type: "PBV", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            case "roe":
              return { type: "ROE", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            case "epsGrowth":
              return { type: "EPS_GROWTH", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            case "valuation":
              return { type: "VALUATION", value: rule.params.value }
            case "fundamentalScore":
              return { type: "FUNDAMENTAL_SCORE", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            default:
              return { type: rule.key.toUpperCase(), min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
          }
        }),
      technicalIndicators: activeRules
        .filter((rule) => rule.category === "technical")
        .map((rule) => {
          const definition = FILTER_LIBRARY[rule.key]

          if (definition.mode === "params") {
            return {
              type: definition.apiType ?? technicalIndicatorNameToApiType(definition.label),
              ...getConfiguredRuleParams(rule.params),
            }
          }

          switch (rule.key) {
            case "rsi":
              return { type: "RSI", oversold: parseOptionalNumber(rule.params.min), overbought: parseOptionalNumber(rule.params.max) }
            case "trend":
              return { type: "TREND", value: rule.params.value }
            case "changePct":
              return { type: "DAILY_CHANGE", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            case "monthChangePct":
              return { type: "MONTH_CHANGE", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            case "ytdChangePct":
              return { type: "YEAR_CHANGE", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            case "ma20GapPct":
              return { type: "MA20_GAP", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            case "ma5GapPct":
              return { type: "MA5_GAP", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            case "technicalScore":
              return { type: "TECHNICAL_SCORE", min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
            default:
              return { type: rule.key.toUpperCase(), min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
          }
        }),
      backtestConfig: {
        initialCapital: 100000000,
        startDate: "2025-01-01",
        endDate: "2026-02-28",
        tradingCosts: {
          brokerFee: 0.15,
          sellFee: 0.15,
          minimumFee: 1000,
        },
        portfolio: {
          positionSizePercent: 25,
          minPositionPercent: 5,
          maxPositions: 4,
        },
        riskManagement: {
          stopLossPercent: 8,
          takeProfitPercent: 20,
          maxHoldingDays: 60,
        },
      },
    }
  }

  async function runScreener() {
    setIsRunning(true)
    setRunError(null)

    try {
      const response = await fetch("/api/screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: buildScreenerConfig() }),
      })

      const result = await response.json() as ScreenerApiResponse & { error?: string; details?: string }
      if (!response.ok) {
        throw new Error(result.details || result.error || "Gagal menjalankan screener.")
      }

      setScreenerRows(result.rows)
      setLatestSnapshotDate(result.latestDate)
      setScreeningSummary(result.summary)
      setScreeningDateRange(result.dateRange)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menjalankan screener."
      setRunError(message)
      toast.error(message)
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    void runScreener()
  }, [])

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return [...screenerRows]
      .filter((row) => {
        const matchesSearch =
          !normalizedSearch ||
          row.stockCode.toLowerCase().includes(normalizedSearch) ||
          row.sector?.toLowerCase().includes(normalizedSearch)
        const matchesSector = sectorFilter === "all" || row.sector === sectorFilter
        const matchesMarketCap = marketCapFilter === "all" || row.marketCapGroup?.toLowerCase() === marketCapFilter.toLowerCase()
        const matchesSyariah =
          syariahFilter === "all" ||
          (syariahFilter === "yes" && row.isSyariah) ||
          (syariahFilter === "no" && !row.isSyariah)
        return matchesSearch && matchesSector && matchesMarketCap && matchesSyariah
      })
      .sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]

        if (typeof aValue === "string" || typeof bValue === "string") {
          const result = String(aValue ?? "").localeCompare(String(bValue ?? ""))
          return sortDirection === "asc" ? result : -result
        }

        const result = Number(aValue ?? 0) - Number(bValue ?? 0)
        return sortDirection === "asc" ? result : -result
      })
  }, [marketCapFilter, screenerRows, search, sectorFilter, sortDirection, sortKey, syariahFilter])

  function toggleRadar(ticker: string) {
    setRadarTickers((current) => current.includes(ticker) ? current.filter((item) => item !== ticker) : [...current, ticker])
  }

  function handleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc")
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === "stockCode" || nextKey === "peRatio" || nextKey === "pbv" ? "asc" : "desc")
  }

  function openAlertDialog(ticker: string) {
    setAlertDraft({ ...defaultAlertDraft, ticker, threshold: ticker ? "75" : defaultAlertDraft.threshold })
    setDialogOpen(true)
  }

  function saveAlert() {
    if (!alertDraft.ticker) return

    const alert: SavedAlert = {
      ...alertDraft,
      id: `${alertDraft.ticker}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    setAlerts((current) => [alert, ...current])
    setDialogOpen(false)
    setAlertDraft(defaultAlertDraft)
  }

  function toggleColumnVisibility(columnId: ColumnId, checked: boolean) {
    if (FIXED_COLUMN_IDS.includes(columnId)) return

    setVisibleColumnIds((current) => {
      const next = checked
        ? Array.from(new Set([...current, columnId])) as ColumnId[]
        : current.filter((id) => id !== columnId)

      return Array.from(new Set([...FIXED_COLUMN_IDS, ...next])) as ColumnId[]
    })
    setColumnTemplate("recommended")
  }

  function addRule(key: FilterKey) {
    setActivePresetId(null)
    setActiveRules((current) => {
      if (current.some((rule) => rule.key === key)) return current
      return [...current, createRule(key)]
    })
  }

  function updateRuleParam(ruleId: string, paramKey: string, value: string) {
    setActivePresetId(null)
    setActiveRules((current) =>
      current.map((rule) => (rule.id === ruleId ? { ...rule, params: { ...rule.params, [paramKey]: value } } : rule)),
    )
  }

  function removeRule(ruleId: string) {
    setActivePresetId(null)
    setActiveRules((current) => current.filter((rule) => rule.id !== ruleId))
    setEditingRuleId((current) => (current === ruleId ? null : current))
  }

  function applyPreset(preset: ScreenerPreset) {
    const nextRules = [
      ...preset.config.fundamentalIndicators
        .map((indicator) => createRuleFromPresetIndicator(indicator, "fundamental"))
        .filter((rule): rule is ScreenerRule => rule !== null),
      ...preset.config.technicalIndicators
        .map((indicator) => createRuleFromPresetIndicator(indicator, "technical"))
        .filter((rule): rule is ScreenerRule => rule !== null),
    ]

    setEditingRuleId(null)
    setActiveRules(nextRules)
    setActivePresetId(preset.id)

    if (preset.config.filters?.marketCap?.length === 1) {
      const [marketCap] = preset.config.filters.marketCap
      setMarketCapFilter(marketCap.toLowerCase())
    }

    if (preset.config.filters?.sectors?.length === 1) {
      setSectorFilter(preset.config.filters.sectors[0])
    }

    if (typeof preset.config.filters?.syariah === "boolean") {
      setSyariahFilter(preset.config.filters.syariah ? "yes" : "no")
    }
  }

  async function handleSaveStrategy() {
    if (!strategyName.trim()) return

    setSavingStrategy(true)
    const config = buildScreenerConfig()

    try {
      const response = await fetch("/api/strategies/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: strategyName,
          description: strategyDescription,
          config,
          backtestResults: {
            recentSignals: {
              signals: filteredRows.slice(0, 10).map((row) => ({
                ticker: row.stockCode,
                date: new Date().toISOString(),
              })),
            },
          },
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Gagal menyimpan strategy.")
      }

      setSaveStrategyOpen(false)
      setStrategyName("")
      setStrategyDescription("")
    } catch (error) {
      console.error("Save strategy error:", error)
    } finally {
      setSavingStrategy(false)
    }
  }

  function handleOpenSaveStrategy() {
    if (isLoaded && !isSignedIn) {
      openSignIn()
      return
    }

    setSaveStrategyOpen(true)
  }

  function handleRunScreener() {
    void runScreener()
    const table = document.getElementById("screener-results")
    table?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function formatNumericValue(value: number | null, digits = 0) {
    if (value === null) return "—"
    return value.toLocaleString("id-ID", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  }

  function formatColumnValue(row: ScreenerRow, column: ColumnConfig) {
    const value = row[column.id]

    if (value === null || value === undefined) return "—"

    if (column.kind === "boolean") {
      return value ? "Yes" : "No"
    }

    if (column.kind === "date") {
      return typeof value === "string" ? value : "—"
    }

    if (column.kind === "text") {
      return String(value)
    }

    if (column.kind === "percent") {
      return formatPercent(typeof value === "number" ? value : null, 2)
    }

    if (column.kind === "currency") {
      return formatNumericValue(typeof value === "number" ? value : null, 2)
    }

    return formatNumericValue(typeof value === "number" ? value : null)
  }

  const columns: DataTableColumn<ScreenerRow>[] = [
    {
      id: "stockCode",
      headClassName: "w-[136px] min-w-[136px]",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("stockCode")}>
          Saham <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cellClassName: "py-2 pr-2",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <TickerCircleIcon ticker={row.stockCode} />
          <Link href={`/analyze-v2?ticker=${row.stockCode}`} className="font-ibm-plex-mono text-sm font-semibold tracking-[0.1em] text-foreground hover:text-[#d07225]">
            {row.stockCode}
          </Link>
        </div>
      ),
    },
    ...COLUMN_CONFIGS.map((column) => ({
      id: column.id,
      headClassName: column.headClassName,
      cellClassName: column.cellClassName,
      header: column.sortable ? (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort(column.id as SortKey)}>
          {column.label} <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ) : column.label,
      cell: (row: ScreenerRow) => {
        const value = row[column.id]
        const isPositivePercent = column.kind === "percent" && typeof value === "number" && value > 0
        const isNegativePercent = column.kind === "percent" && typeof value === "number" && value < 0

        return (
          <span className={isPositivePercent ? "text-emerald-600" : isNegativePercent ? "text-rose-600" : undefined}>
            {formatColumnValue(row, column)}
          </span>
        )
      },
    })),
    {
      id: "action",
      headClassName: "min-w-[96px] text-right",
      cellClassName: "text-right",
      header: "Action",
      cell: (row) => {
        const inRadar = radarTickers.includes(row.stockCode)
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant={inRadar ? "secondary" : "ghost"}
              size="icon"
              className={`h-7 w-7 ${inRadar ? "text-[#d07225]" : "text-muted-foreground"}`}
              onClick={() => toggleRadar(row.stockCode)}
              aria-label={inRadar ? `Hapus ${row.stockCode} dari radar` : `Tambah ${row.stockCode} ke radar`}
              title={inRadar ? "Radar aktif" : "Tambah radar"}
            >
              {inRadar ? <Star className="h-3.5 w-3.5 fill-current" /> : <StarOff className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => openAlertDialog(row.stockCode)}
              disabled={!inRadar}
              aria-label={`Buat alert untuk ${row.stockCode}`}
              title="Buat alert"
            >
              <BellPlus className="h-3.5 w-3.5" />
            </Button>
          </div>
        )
      },
    },
  ]

  const visibleColumns = columns.filter((column) => visibleColumnIds.includes(column.id as ColumnId))
  const activePreset = SCREENER_PRESETS.find((preset) => preset.id === activePresetId) ?? null
  const screenerTableClassName =
    visibleColumns.length <= 8
      ? "w-max min-w-[720px] md:min-w-[980px]"
      : visibleColumns.length <= 14
        ? "w-max min-w-[1040px] md:min-w-[1480px]"
        : "w-max min-w-[1500px] md:min-w-[2200px]"

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <TickerTape />
      <main className="flex-1 dotted-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <section className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#487b78] via-[#d07225] to-transparent" />
            <div className="p-6 sm:p-8">
              <div className="max-w-3xl space-y-3">
                <Badge variant="outline" className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#d07225] border-[#d07225]/25 bg-[#d07225]/10">
                  Screener
                </Badge>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold font-ibm-plex-mono tracking-tight text-balance">pantau semua saham dalam satu radar</h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                    Filter, urutkan, dan tandai saham berdasarkan data fundamental dan teknikal. Alert disimpan lokal untuk versi awal halaman ini.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  Screener Builder
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 gap-2 border-border/70 bg-transparent px-3 text-foreground hover:border-[#d07225]/35 hover:bg-[#d07225]/5"
                    >
                      <Sparkles className="h-4 w-4 text-[#d07225]" />
                      Preset
                      {activePreset ? (
                        <span className="hidden max-w-[170px] truncate text-xs text-muted-foreground md:inline">
                          {activePreset.name}
                        </span>
                      ) : null}
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[380px] max-h-[34rem] overflow-y-auto border-border/70 p-1.5">
                    <DropdownMenuLabel className="px-2 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Preset Screener
                    </DropdownMenuLabel>
                    {(activePreset || activeRules.length > 0) ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setActivePresetId(null)
                            setEditingRuleId(null)
                            setActiveRules([])
                          }}
                          className="mb-1 rounded-md text-rose-600 focus:text-rose-600"
                        >
                          Reset filter builder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    ) : null}
                    {PRESET_GROUPS.map(([groupLabel, presets], index) => (
                      <div key={groupLabel}>
                        <DropdownMenuLabel className="px-2 pb-1 pt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {groupLabel}
                        </DropdownMenuLabel>
                        {presets.map((preset) => {
                          const isActive = activePresetId === preset.id
                          return (
                            <DropdownMenuItem
                              key={preset.id}
                              onClick={() => applyPreset(preset)}
                              className="items-start gap-3 rounded-lg px-3 py-3"
                            >
                              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d07225]/10 text-[#d07225]">
                                {isActive ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                              </div>
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">{preset.name}</span>
                                  {isActive ? (
                                    <span className="rounded-full bg-[#d07225]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d07225]">
                                      Active
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-xs leading-relaxed text-muted-foreground">{preset.summary}</p>
                              </div>
                            </DropdownMenuItem>
                          )
                        })}
                        {index < PRESET_GROUPS.length - 1 ? <DropdownMenuSeparator /> : null}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 gap-2 border-[#d7dddc] bg-white px-3 text-[#487b78] hover:border-[#bfd0ce] hover:bg-[#f7f9f9] hover:text-[#3f6a68]"
                    >
                      <Plus className="h-4 w-4" />
                      Indicator
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80 max-h-[32rem] overflow-y-auto">
                    <DropdownMenuLabel>Tambah filter screener</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={indicatorSearch}
                          onChange={(event) => setIndicatorSearch(event.target.value)}
                          placeholder="Cari indicator..."
                          className="h-9 border-border/70 bg-background pl-8 text-sm"
                        />
                      </div>
                    </div>
                    {filteredTechnicalFilterGroups.map(({ groupLabel, entries }) => (
                      <div key={groupLabel}>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {groupLabel}
                        </DropdownMenuLabel>
                        {entries.map(([key, definition]) => {
                          const alreadyActive = activeRules.some((rule) => rule.key === key)
                          return (
                            <DropdownMenuItem
                              key={key}
                              disabled={alreadyActive}
                              onClick={() => addRule(key)}
                              className="flex items-start justify-between gap-3 py-2"
                            >
                              <div>
                                <div className="text-sm font-medium">{definition.label}</div>
                                <div className="text-xs text-muted-foreground">{definition.description}</div>
                              </div>
                              <Plus className="h-3.5 w-3.5 self-center text-muted-foreground" />
                            </DropdownMenuItem>
                          )
                        })}
                      </div>
                    ))}
                    {filteredFundamentalFilters.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          Fundamental
                        </DropdownMenuLabel>
                      </>
                    )}
                    {filteredFundamentalFilters.map(([key, definition]) => {
                        const alreadyActive = activeRules.some((rule) => rule.key === key)
                        return (
                          <DropdownMenuItem
                            key={key}
                            disabled={alreadyActive}
                            onClick={() => addRule(key)}
                            className="flex items-start justify-between gap-3 py-2"
                          >
                            <div>
                              <div className="text-sm font-medium">{definition.label}</div>
                              <div className="text-xs text-muted-foreground">{definition.description}</div>
                            </div>
                            <Plus className="h-3.5 w-3.5 self-center text-muted-foreground" />
                          </DropdownMenuItem>
                        )
                      })}
                    {filteredTechnicalFilterGroups.length === 0 && filteredFundamentalFilters.length === 0 && (
                      <div className="px-3 py-6 text-sm text-muted-foreground">
                        Tidak ada indicator yang cocok.
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex flex-wrap gap-2">
                  {activeRules.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Belum ada indicator.
                    </span>
                  ) : (
                    activeRules.map((rule) => {
                      const definition = FILTER_LIBRARY[rule.key]
                      const isRange = definition.mode === "range"
                      const isSelect = definition.mode === "select"
                      const paramEntries = Object.entries(definition.paramDefinitions ?? {}) as [string, FilterParamDefinition][]

                      return (
                        <Popover
                          key={rule.id}
                          open={editingRuleId === rule.id}
                          onOpenChange={(open) => setEditingRuleId(open ? rule.id : null)}
                        >
                          <div className="inline-flex items-center">
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-9 items-center gap-2 rounded-l-md border border-r-0 border-border/70 bg-muted/25 px-2.5 font-ibm-plex-mono text-[11px] text-foreground transition-colors hover:border-[#d07225]/40 hover:bg-[#d07225]/5"
                                title={`Edit ${definition.label}`}
                              >
                                <span>{formatRuleSummary(rule)}</span>
                              </button>
                            </PopoverTrigger>
                            <button
                              type="button"
                              onClick={() => removeRule(rule.id)}
                              className="inline-flex h-9 items-center justify-center rounded-r-md border border-border/70 bg-muted/25 px-2 text-muted-foreground transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Hapus ${definition.label}`}
                              title={`Hapus ${definition.label}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>

                          <PopoverContent align="start" className="w-72 space-y-3 border-border/70 bg-card p-4">
                            <div className="space-y-1">
                              <div className="font-ibm-plex-mono text-sm font-semibold">{definition.label}</div>
                              <div className="text-xs text-muted-foreground">{definition.description}</div>
                            </div>

                            {isRange ? (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">Min</label>
                                  <Input
                                    value={rule.params.min ?? ""}
                                    onChange={(event) => updateRuleParam(rule.id, "min", event.target.value)}
                                    className="h-9 bg-background font-ibm-plex-mono text-sm"
                                    placeholder="Kosongkan"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">Max</label>
                                  <Input
                                    value={rule.params.max ?? ""}
                                    onChange={(event) => updateRuleParam(rule.id, "max", event.target.value)}
                                    className="h-9 bg-background font-ibm-plex-mono text-sm"
                                    placeholder="Kosongkan"
                                  />
                                </div>
                              </div>
                            ) : isSelect ? (
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Value</label>
                                <Select
                                  value={rule.params.value}
                                  onValueChange={(value) => updateRuleParam(rule.id, "value", value)}
                                >
                                  <SelectTrigger className="h-9 bg-background font-ibm-plex-mono text-sm">
                                    <SelectValue placeholder="Pilih nilai" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {definition.options?.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : paramEntries.length > 0 ? (
                              <div className="grid gap-3 sm:grid-cols-2">
                                {paramEntries.map(([paramKey, paramDefinition]) => (
                                  <div key={paramKey} className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      {paramDefinition.label}
                                    </label>
                                    {paramDefinition.options ? (
                                      <Select
                                        value={rule.params[paramKey] ?? ""}
                                        onValueChange={(value) => updateRuleParam(rule.id, paramKey, value)}
                                      >
                                        <SelectTrigger className="h-9 bg-background font-ibm-plex-mono text-sm">
                                          <SelectValue placeholder={`Pilih ${paramDefinition.label}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {paramDefinition.options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Input
                                        value={rule.params[paramKey] ?? ""}
                                        onChange={(event) => updateRuleParam(rule.id, paramKey, event.target.value)}
                                        className="h-9 bg-background font-ibm-plex-mono text-sm"
                                        placeholder="Kosongkan"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                Indicator ini tidak memiliki parameter tambahan.
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      )
                    })
                  )}
                </div>

              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <div className="xl:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari ticker atau sector"
                    className="pl-9 bg-background border-border/70 text-sm focus-visible:ring-[#d07225]"
                  />
                </div>

                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="bg-background border-border/70">
                    <SelectValue placeholder="Semua sektor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua sektor</SelectItem>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={marketCapFilter} onValueChange={setMarketCapFilter}>
                  <SelectTrigger className="bg-background border-border/70">
                    <SelectValue placeholder="market_cap_group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua market cap</SelectItem>
                    <SelectItem value="large">Large cap</SelectItem>
                    <SelectItem value="mid">Mid cap</SelectItem>
                    <SelectItem value="small">Small cap</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={syariahFilter} onValueChange={setSyariahFilter}>
                  <SelectTrigger className="bg-background border-border/70">
                    <SelectValue placeholder="is_syariah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua syariah</SelectItem>
                    <SelectItem value="yes">Syariah</SelectItem>
                    <SelectItem value="no">Non-syariah</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={`${sortKey}:${sortDirection}`} onValueChange={(value) => {
                  const [key, direction] = value.split(":") as [SortKey, "asc" | "desc"]
                  setSortKey(key)
                  setSortDirection(direction)
                }}>
                  <SelectTrigger className="bg-background border-border/70">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="close:desc">Close tertinggi</SelectItem>
                    <SelectItem value="changeD1Pct:desc">D-1 change tertinggi</SelectItem>
                    <SelectItem value="change5DPct:desc">5D change tertinggi</SelectItem>
                    <SelectItem value="change1MPct:desc">1M change tertinggi</SelectItem>
                    <SelectItem value="change1YPct:desc">1Y change tertinggi</SelectItem>
                    <SelectItem value="marketCap:desc">market_cap terbesar</SelectItem>
                    <SelectItem value="peRatio:asc">pe_ratio terendah</SelectItem>
                    <SelectItem value="roe:desc">ROE tertinggi</SelectItem>
                    <SelectItem value="stockCode:asc">Ticker A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 gap-2 rounded-md border-border/70 bg-white px-4 text-foreground shadow-sm hover:border-border/70 hover:bg-white"
                      >
                        <Columns3 className="h-4 w-4 text-muted-foreground" />
                        Pilih kolom
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuGroup>
                        {Object.entries(COLUMN_LABELS)
                          .filter(([columnId]) => !FIXED_COLUMN_IDS.includes(columnId as ColumnId))
                          .map(([columnId, label]) => (
                            <DropdownMenuCheckboxItem
                              key={columnId}
                              checked={visibleColumnIds.includes(columnId as ColumnId)}
                              onCheckedChange={(checked) => toggleColumnVisibility(columnId as ColumnId, checked)}
                            >
                              {label}
                            </DropdownMenuCheckboxItem>
                          ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="font-ibm-plex-mono text-sm text-muted-foreground">
                    <span>{activeRules.length} filter aktif</span>
                    <span className="px-2">→</span>
                    <span className="text-[#487b78]">{filteredRows.length} saham ditemukan</span>
                    {latestSnapshotDate ? <span className="pl-2">latest: {latestSnapshotDate}</span> : null}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 self-end">
                  <Button
                    className={`h-11 gap-2 rounded-md border px-4 shadow-sm transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-100 ${isRunning
                      ? "border-border bg-secondary text-muted-foreground"
                      : "border-transparent bg-[#d07225] text-white hover:bg-[#b8641f]"
                      }`}
                    onClick={handleRunScreener}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <>
                        <span>Running... ({runElapsedTime}s)</span>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Run Screening
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-md border-border/70 bg-background font-ibm-plex-mono text-foreground hover:border-[#d07225]/35 hover:bg-[#d07225]/5"
                    onClick={handleOpenSaveStrategy}
                    aria-label="Create New Strategy"
                    title="Create New Strategy"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </div>

            </div>
          </section>

          {(screeningSummary || runError) && (
            <section className="rounded-xl border border-border/70 bg-card shadow-sm">
              <div className="grid gap-3 p-5 text-sm sm:grid-cols-2 xl:grid-cols-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Rows Returned</div>
                  <div className="mt-1 font-ibm-plex-mono text-lg">{screeningSummary?.totalSignals ?? 0}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Unique Stocks</div>
                  <div className="mt-1 font-ibm-plex-mono text-lg">{screeningSummary?.uniqueStocks ?? 0}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Stocks Scanned</div>
                  <div className="mt-1 font-ibm-plex-mono text-lg">{screeningSummary?.stocksScanned ?? 0}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Matched Universe</div>
                  <div className="mt-1 font-ibm-plex-mono text-lg">{screeningSummary?.passedFundamentals ?? 0}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Snapshot Date</div>
                  <div className="mt-1 font-ibm-plex-mono text-sm">
                    {screeningDateRange?.from && screeningDateRange?.to ? `${screeningDateRange.from} → ${screeningDateRange.to}` : "—"}
                  </div>
                </div>
                {runError ? (
                  <div className="sm:col-span-2 xl:col-span-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                    {runError}
                  </div>
                ) : null}
              </div>
            </section>
          )}

          <div id="screener-results">
            <DataTable
              columns={visibleColumns}
              data={filteredRows}
              getRowId={(row) => row.stockCode}
              emptyMessage="Tidak ada saham yang cocok dengan filter saat ini."
              tableClassName={screenerTableClassName}
              initialPageSize={20}
              pageSizeOptions={[20, 40, 60, 80]}
              paginationResetKey={`${search}|${sectorFilter}|${marketCapFilter}|${syariahFilter}|${sortKey}|${sortDirection}|${activeRules.map((rule) => `${rule.key}:${JSON.stringify(rule.params)}`).join("|")}`}
            />
          </div>

        </div>
      </main>

      <Footer />

      <Dialog open={saveStrategyOpen} onOpenChange={setSaveStrategyOpen}>
        <DialogContent className="border-border/70 bg-card shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-ibm-plex-mono">Create New Strategy</DialogTitle>
            <DialogDescription>
              Simpan preset screener ini sebagai strategy baru.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama strategy</label>
              <Input
                value={strategyName}
                onChange={(event) => setStrategyName(event.target.value)}
                placeholder="Contoh: RSI + Value Large Cap"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <textarea
                value={strategyDescription}
                onChange={(event) => setStrategyDescription(event.target.value)}
                placeholder="Jelaskan preset screener ini."
                className="min-h-[96px] w-full rounded-md border border-border/70 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-[#d07225]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveStrategyOpen(false)}>Batal</Button>
            <Button onClick={handleSaveStrategy} disabled={savingStrategy || !strategyName.trim()} className="gap-2">
              <Save className="h-4 w-4" />
              Simpan strategy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/70 bg-card shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-ibm-plex-mono">Buat Alert Radar</DialogTitle>
            <DialogDescription>
              Simpan alert untuk ticker di radar. Saat backend alert siap, struktur ini bisa disambungkan ke notifikasi real-time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Ticker</div>
              <div className="mt-1 font-ibm-plex-mono font-semibold text-lg">{alertDraft.ticker || "-"}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jenis Alert</label>
              <Select value={alertDraft.type} onValueChange={(value: AlertDraft["type"]) => setAlertDraft((current) => ({ ...current, type: value }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk-radar">Saat saham masuk radar</SelectItem>
                  <SelectItem value="technical-score">Saat technical score tinggi</SelectItem>
                  <SelectItem value="rsi">Saat RSI oversold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {alertDraft.type !== "masuk-radar" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Threshold</label>
                <Input
                  value={alertDraft.threshold}
                  onChange={(e) => setAlertDraft((current) => ({ ...current, threshold: e.target.value }))}
                  className="bg-background font-ibm-plex-mono"
                />
              </div>
            )}

            <label className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-background/70 px-4 py-3">
              <div>
                <div className="text-sm font-medium">Alert aktif</div>
                <div className="text-xs text-muted-foreground">Simpan dalam keadaan aktif.</div>
              </div>
              <Switch checked={alertDraft.isActive} onCheckedChange={(checked) => setAlertDraft((current) => ({ ...current, isActive: checked }))} />
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={saveAlert}>Simpan Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
