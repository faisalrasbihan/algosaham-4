"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bell, BellPlus, ArrowUpDown, ArrowUpRight, Search, SlidersHorizontal, Star, StarOff, Columns3, Plus, X, ChevronDown, ChevronLeft, ChevronRight, Save, Check, Info, Moon, Rocket, TrendingUp, Zap, Gauge, Gem, Layers } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ScreenerRequest } from "@/lib/api"
import { normalizeScreeningContractConfig } from "@/lib/backtest-contract"
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
  alignmentScore: number | null
  alignmentBreakdown: AlignmentBreakdownItem[]
  signalDate: string | null
}

type AlignmentBreakdownItem = {
  indicator: string
  score: number | null
}

type ScreenerApiResponse = {
  screeningId: string
  scannedDays: number
  signals: Array<{
    ticker: string
    companyName: string
    date: string | null
    daysAgo: number
    signal: string
    reasons: string[]
    price: number | null
    currentPrice: number | null
    sector: string | null
    marketCap: string | null
    stopLoss: number | null
    takeProfit: number | null
    alignmentScore?: number | null
    alignmentBreakdown?: AlignmentBreakdownItem[]
    method?: {
      stopLoss: string | null
      takeProfit: string | null
    }
  }>
  latestDate: string | null
  rows: ScreenerRow[]
  summary: {
    totalSignals: number
    uniqueStocks: number
    byDay: Record<string, number>
    stocksScanned: number
    passedFilters: number
    passedFundamentals: number
    avgAlignment?: number
    maxAlignment?: number
  }
  dateRange: {
    from?: string
    to?: string
  } | null
}

type ScreenerPresetsResponse = {
  success: boolean
  presets?: ScreenerPreset[]
  error?: string
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
  groupLabel: string
  groupDescription: string | null
  summary: string
  tag: string | null
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

const DEFAULT_SCREENER_PRESET_ID = "calm-volume-dry-up"

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
  alignmentScore: "Alignment",
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

const COLUMN_TOOLTIPS: Record<ColumnId, string> = {
  stockCode: "Kode saham emiten yang muncul di hasil screener.",
  alignmentScore: "Skor keselarasan 0-100 dari backend: seberapa kuat sinyal teknikal saham ini sejajar dalam window scan. Arahkan kursor ke skor untuk rincian per indikator. Kosong (—) saat screener berjalan tanpa indikator teknikal.",
  open: "Harga pembukaan pada sesi perdagangan terakhir.",
  high: "Harga tertinggi pada sesi perdagangan terakhir.",
  low: "Harga terendah pada sesi perdagangan terakhir.",
  close: "Harga penutupan terakhir pada snapshot screener.",
  changeD1Pct: "Persentase perubahan harga dibanding penutupan 1 hari bursa sebelumnya.",
  change5DPct: "Persentase perubahan harga dibanding penutupan 5 hari bursa sebelumnya.",
  change1MPct: "Persentase perubahan harga dibanding penutupan sekitar 1 bulan atau 21 hari bursa sebelumnya.",
  change1YPct: "Persentase perubahan harga dibanding penutupan sekitar 1 tahun atau 252 hari bursa sebelumnya.",
  freq: "Frekuensi transaksi saham pada snapshot terakhir.",
  valuasi: "Nilai valuasi atau market cap versi dataset screener.",
  nbsa: "Nilai net buy sell asing pada periode harian terakhir.",
  prevClose: "Harga penutupan pada hari bursa sebelumnya.",
  gapPct: "Persentase gap harian dari field gap pada snapshot data.",
  prevDailyValue: "Nilai transaksi harian pada sesi sebelumnya.",
  isValidOhlcv: "Menandakan data open, high, low, close, dan volume valid.",
  isZeroOhlc: "Menandakan ada nilai open, high, low, atau close yang bernilai nol.",
  month: "Bulan dari snapshot data yang sedang digunakan.",
  assets: "Total aset perusahaan dari laporan keuangan terbaru.",
  liabilities: "Total liabilitas atau kewajiban perusahaan.",
  equity: "Total ekuitas perusahaan.",
  sales: "Total penjualan atau pendapatan perusahaan.",
  ebt: "Earnings before tax atau laba sebelum pajak.",
  profit: "Laba bersih perusahaan.",
  profitAttributable: "Laba yang dapat diatribusikan ke pemilik entitas induk.",
  bookValue: "Nilai buku perusahaan atau book value.",
  eps: "Earnings per share atau laba per saham.",
  peRatio: "Price to earnings ratio, yaitu harga dibanding laba per saham.",
  pbv: "Price to book value, yaitu harga dibanding nilai buku.",
  der: "Debt to equity ratio, yaitu utang dibanding ekuitas.",
  roa: "Return on assets, yaitu laba terhadap aset dalam persen.",
  roe: "Return on equity, yaitu laba terhadap ekuitas dalam persen.",
  npm: "Net profit margin, yaitu laba bersih terhadap penjualan dalam persen.",
  financialDate: "Tanggal laporan keuangan yang dipakai untuk data fundamental.",
  marketCap: "Kapitalisasi pasar emiten pada snapshot terbaru.",
  sma20: "Simple moving average harga penutupan 20 hari.",
  sma50: "Simple moving average harga penutupan 50 hari.",
  volumeSma20: "Rata-rata volume transaksi 20 hari.",
  valueSma20: "Rata-rata nilai transaksi 20 hari.",
  nbsa5d: "Akumulasi net buy sell asing selama 5 hari terakhir.",
  value5d: "Akumulasi nilai transaksi selama 5 hari terakhir.",
  nbsaRatio5d: "Rasio net buy sell asing terhadap nilai transaksi 5 hari dalam persen.",
  action: "Aksi cepat untuk menambahkan saham ke radar atau membuat alert.",
}

const COLUMN_CONFIGS: ColumnConfig[] = [
  { id: "alignmentScore", label: "Alignment", kind: "number", sortable: true, headClassName: "w-[112px] text-right", cellClassName: "text-right" },
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
  recommended: ["stockCode", "alignmentScore", "changeD1Pct", "change5DPct", "change1MPct", "change1YPct", "close", "valuasi", "peRatio", "pbv", "roe", "marketCap", "sma20", "sma50", "nbsaRatio5d", "action"],
  technical: ["stockCode", "changeD1Pct", "change5DPct", "change1MPct", "change1YPct", "close", "gapPct", "prevDailyValue", "sma20", "sma50", "volumeSma20", "valueSma20", "nbsa5d", "nbsaRatio5d", "action"],
  fundamental: ["stockCode", "change1MPct", "change1YPct", "close", "marketCap", "assets", "liabilities", "equity", "sales", "profit", "eps", "peRatio", "pbv", "der", "roa", "roe", "npm", "action"],
  all: ["stockCode", ...COLUMN_CONFIGS.map((column) => column.id), "action"],
} as const

type ColumnTemplateKey = keyof typeof COLUMN_TEMPLATES
const FIXED_COLUMN_IDS: ColumnId[] = ["stockCode", "action"]

const SCREENER_SECTOR_OPTIONS = [
  "Energy",
  "Basic Materials",
  "Industrials",
  "Consumer Cyclicals",
  "Consumer Non-Cyclicals",
  "Healthcare",
  "Financials",
  "Properties & Real Estate",
  "Technology",
  "Transportation & Logistics",
  "Infrastructure",
] as const

const QUICK_FILTER_RELATED_COLUMNS: Partial<Record<string, ColumnId[]>> = {
  changePct: ["changeD1Pct"],
  monthChangePct: ["change1MPct"],
  ytdChangePct: ["change1YPct"],
  ma20GapPct: ["close", "sma20"],
  ma5GapPct: ["close", "sma50"],
  trend: ["close", "sma20", "sma50"],
  pe: ["peRatio"],
  pbv: ["pbv"],
  roe: ["roe"],
}

const METRIC_GUIDE_ITEMS = [
  {
    label: "Harga",
    description: "Harga penutupan terakhir pada snapshot screener.",
  },
  {
    label: "Gap %",
    description: "Gap harian yang berasal dari field `gap_pct` pada snapshot harian. Dipisahkan dari change 1D yang dihitung dari close vs prev close.",
  },
  {
    label: "1D / 5D / 1M / 1Y Chg",
    description: "Perubahan persentase close saat ini dibanding close 1, 5, 21, dan 252 hari bursa sebelumnya.",
  },
  {
    label: "PE",
    description: "Price to Earnings ratio: harga saham dibanding earnings per share.",
  },
  {
    label: "ROE",
    description: "Return on Equity: laba terhadap ekuitas, ditampilkan dalam persen.",
  },
  {
    label: "Market Cap",
    description: "Nilai kapitalisasi pasar emiten pada snapshot terbaru.",
  },
  {
    label: "SMA 20 / SMA 50",
    description: "Rata-rata pergerakan harga penutupan 20 dan 50 hari.",
  },
] as const

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
    label: "MA-50",
    category: "technical",
    mode: "range",
    description: "Jarak harga terhadap MA-50.",
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
      { label: "Low", value: "LOW_VOL" },
      { label: "High", value: "HIGH_VOL" },
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

const CLIENT_SIDE_RULE_KEYS: FilterKey[] = [
  "changePct",
  "monthChangePct",
  "ytdChangePct",
  "ma20GapPct",
  "ma5GapPct",
  "trend",
]

const PRESET_INDICATOR_LABELS: Record<string, string> = {
  PE_RATIO: "P/E",
  PBV: "PBV",
  ROE: "ROE",
  RSI: "RSI",
  MACD: "MACD",
  ADX: "ADX",
  VWAP: "VWAP",
  STOCHASTIC: "Stochastic",
  BOLLINGER_BANDS: "Bollinger",
  SUPERTREND: "Supertrend",
  PARABOLIC_SAR: "SAR",
  PIVOT_POINTS: "Pivot",
  VOLUME_SMA: "Volume",
  VOLUME_DRY_UP: "Volume Sepi",
  VOLATILITY_REGIME: "Volatilitas",
  BASE_BREAKOUT: "Base Breakout",
}

function getPresetFilterLabels(preset: ScreenerPreset): string[] {
  const fundamentals = preset.config.fundamentalIndicators.map((ind) => {
    const base = PRESET_INDICATOR_LABELS[ind.type] ?? ind.type
    const min = typeof ind.min === "number" ? ind.min : null
    const max = typeof ind.max === "number" ? ind.max : null
    if (min !== null && max !== null) return `${base} ${min}–${max}`
    if (max !== null) return `${base} <${max}`
    if (min !== null) return `${base} >${min}`
    return base
  })

  const technicals = preset.config.technicalIndicators.map((ind) => {
    const base = PRESET_INDICATOR_LABELS[ind.type] ?? ind.type
    switch (ind.type) {
      case "RSI":
      case "STOCHASTIC":
        return typeof ind.oversold === "number" ? `${base} <${ind.oversold}` : base
      case "ADX":
        return typeof ind.threshold === "number" ? `${base} >${ind.threshold}` : base
      case "VOLUME_SMA":
        return typeof ind.threshold === "number" ? `${base} >${ind.threshold}x` : base
      case "VOLUME_DRY_UP":
        return typeof ind.dryUpThreshold === "number" ? `${base} <${ind.dryUpThreshold}x` : base
      case "BASE_BREAKOUT":
        return typeof ind.breakoutPct === "number" ? `${base} ${ind.breakoutPct}%` : base
      default:
        return base
    }
  })

  return [...fundamentals, ...technicals]
}

function getPresetCategoryLabel(preset: ScreenerPreset) {
  return preset.groupLabel || "PRESET"
}

// Category labels are stored uppercase in the DB; tabs read better Title Cased.
function formatCategoryLabel(label: string) {
  return label
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ")
}

// One icon + tint per strategy category. Cards in the same category share an icon
// (icons are not stored per-preset), with a neutral fallback for unknown categories.
type CategoryVisual = { icon: LucideIcon; iconWrap: string }

const PRESET_CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  setup: { icon: Moon, iconWrap: "bg-blue-50 text-blue-600" },
  breakout: { icon: Rocket, iconWrap: "bg-orange-50 text-orange-600" },
  trend: { icon: TrendingUp, iconWrap: "bg-teal-50 text-teal-600" },
  momentum: { icon: Zap, iconWrap: "bg-violet-50 text-violet-600" },
  "dip buy": { icon: Gauge, iconWrap: "bg-sky-50 text-sky-600" },
  value: { icon: Gem, iconWrap: "bg-emerald-50 text-emerald-600" },
  level: { icon: Layers, iconWrap: "bg-indigo-50 text-indigo-600" },
}

const DEFAULT_CATEGORY_VISUAL: CategoryVisual = {
  icon: SlidersHorizontal,
  iconWrap: "bg-slate-100 text-slate-600",
}

function getPresetCategoryVisual(preset: ScreenerPreset): CategoryVisual {
  const key = (preset.groupLabel || preset.group || "").toLowerCase().trim()
  return PRESET_CATEGORY_VISUALS[key] ?? DEFAULT_CATEGORY_VISUAL
}

const ALL_CATEGORIES_LABEL = "Semua"
const PRESETS_PER_PAGE = 8

const defaultAlertDraft: AlertDraft = {
  ticker: "",
  type: "masuk-radar",
  threshold: "75",
  isActive: true,
}

function getColumnTemplate(template: ColumnTemplateKey): ColumnId[] {
  return [...COLUMN_TEMPLATES[template]]
}

function getDefaultColumnTemplate(): ColumnId[] {
  return getColumnTemplate("recommended")
}

function formatPercent(value: number | null, digits = 1) {
  if (value === null) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
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

function getConfiguredRuleParamsWithDefaults(
  params: Record<string, string>,
  defaultParams: Record<string, string>,
) {
  return {
    ...getConfiguredRuleParams(defaultParams),
    ...getConfiguredRuleParams(params),
  }
}

function parseOptionalNumberWithDefault(
  value: string | undefined,
  fallbackValue: string | undefined,
) {
  return parseOptionalNumber(value) ?? parseOptionalNumber(fallbackValue)
}

function findFilterKeyByApiType(type: string, category: RuleCategory): FilterKey | null {
  const matchedEntry = (Object.entries(FILTER_LIBRARY) as [FilterKey, FilterDefinition][])
    .find(([_, definition]) => definition.category === category && definition.apiType === type)

  if (matchedEntry) return matchedEntry[0]

  const fallbackMap: Partial<Record<string, FilterKey>> = {
    PE_RATIO: "pe",
    PBV: "pbv",
    ROE: "roe",
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

function getRelatedColumnsForRule(ruleKey: FilterKey): ColumnId[] {
  return QUICK_FILTER_RELATED_COLUMNS[ruleKey] ?? []
}

function formatRuleSummary(rule: ScreenerRule) {
  const definition = FILTER_LIBRARY[rule.key]
  const usesPercentageDisplay = ["changePct", "monthChangePct", "ytdChangePct", "ma20GapPct", "ma5GapPct"].includes(rule.key)
  const appendPercent = (value: string) => (usesPercentageDisplay ? `${value}%` : value)

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

  if (min && max) return `${definition.label}: ${appendPercent(min)}-${appendPercent(max)}`
  if (min) return `${definition.label} ≥ ${appendPercent(min)}`
  if (max) return `${definition.label} ≤ ${appendPercent(max)}`
  return definition.label
}

function getPercentGap(close: number | null, average: number | null) {
  if (close === null || average === null || average === 0) return null
  return ((close - average) / average) * 100
}

function matchesRangeRule(value: number | null, rule: ScreenerRule) {
  if (value === null) return false

  const min = parseOptionalNumber(rule.params.min)
  const max = parseOptionalNumber(rule.params.max)

  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

function matchesClientSideRule(row: ScreenerRow, rule: ScreenerRule) {
  const closeVsSma20 = getPercentGap(row.close, row.sma20)
  const closeVsSma50 = getPercentGap(row.close, row.sma50)
  const isUptrend =
    row.close !== null &&
    row.sma20 !== null &&
    row.sma50 !== null &&
    row.close >= row.sma20 &&
    row.sma20 >= row.sma50
  const isDowntrend =
    row.close !== null &&
    row.sma20 !== null &&
    row.sma50 !== null &&
    row.close <= row.sma20 &&
    row.sma20 <= row.sma50

  switch (rule.key) {
    case "changePct":
      return matchesRangeRule(row.changeD1Pct, rule)
    case "monthChangePct":
      return matchesRangeRule(row.change1MPct, rule)
    case "ytdChangePct":
      return matchesRangeRule(row.change1YPct, rule)
    case "ma20GapPct":
      return matchesRangeRule(closeVsSma20, rule)
    case "ma5GapPct":
      return matchesRangeRule(closeVsSma50, rule)
    case "trend":
      if (rule.params.value === "uptrend") return isUptrend
      if (rule.params.value === "downtrend") return isDowntrend
      return !isUptrend && !isDowntrend
    default:
      return true
  }
}

function matchesFundamentalRule(row: ScreenerRow, rule: ScreenerRule) {
  switch (rule.key) {
    case "pe":
      return matchesRangeRule(row.peRatio, rule)
    case "pbv":
      return matchesRangeRule(row.pbv, rule)
    case "roe":
      return matchesRangeRule(row.roe, rule)
    default:
      return true
  }
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

function TradingViewMiniChart({ ticker }: { ticker: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ""

    const widgetSlot = document.createElement("div")
    widgetSlot.className = "tradingview-widget-container__widget h-full w-full"
    container.appendChild(widgetSlot)

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: `IDX:${ticker}`,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "12M",
      colorTheme: "light",
      isTransparent: true,
      autosize: true,
    })
    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [ticker])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container h-full w-full"
      aria-label={`${ticker} mini chart`}
    />
  )
}

function ScreenerRowHoverCard({ row }: { row: ScreenerRow }) {
  const hasAlignment = row.alignmentScore !== null
  const alignmentScore = hasAlignment ? Math.round(row.alignmentScore as number) : null

  return (
    <div className="w-[336px] overflow-hidden rounded-md bg-white p-3">
      <div className="h-[178px] overflow-hidden rounded-lg border border-slate-200 bg-white">
        <TradingViewMiniChart ticker={row.stockCode} />
      </div>

      {hasAlignment ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Alignment</span>
            <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-ibm-plex-mono text-xs font-semibold ${alignmentToneClasses(alignmentScore as number)}`}>
              {alignmentScore}/100
            </span>
          </div>
          {row.alignmentBreakdown.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {row.alignmentBreakdown.map((item, index) => (
                <li key={`${item.indicator}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-600">{formatAlignmentIndicator(item.indicator)}</span>
                  <span className="font-ibm-plex-mono font-medium text-slate-700">{item.score ?? "—"}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {row.signalDate ? (
            <p className="mt-2 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
              Sinyal terbaru: {row.signalDate}
            </p>
          ) : null}
        </div>
      ) : null}

      <Button asChild className="mt-3 h-9 w-full gap-2 bg-[#d07225] text-white hover:bg-[#a65b1d]">
        <Link href={`/analyze-v2?ticker=${row.stockCode}`}>
          Analyze now
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  )
}

function formatAlignmentIndicator(indicator: string) {
  return indicator.replace(/_/g, " ").trim()
}

function alignmentToneClasses(score: number) {
  if (score >= 67) return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (score >= 34) return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-slate-200 bg-slate-50 text-slate-600"
}

// At-a-glance score in the table cell. The "why" (breakdown + signal date) lives in the
// row hover card instead of a nested tooltip, because the whole row is already a Radix
// Tooltip trigger in DataTable — nesting a second trigger here would double-pop.
function AlignmentScoreCell({ row }: { row: ScreenerRow }) {
  if (row.alignmentScore === null) {
    return <span className="text-muted-foreground">—</span>
  }

  const score = Math.round(row.alignmentScore)
  return (
    <div className="flex justify-end">
      <span className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-md border px-2 py-0.5 font-ibm-plex-mono text-xs font-semibold ${alignmentToneClasses(score)}`}>
        {score}
      </span>
    </div>
  )
}

export function ScreenerPage() {
  const { isLoaded, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const signInOpenedRef = useRef(false)
  const userConfiguredScreenerRef = useRef(false)
  const defaultPresetAppliedRef = useRef(false)
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
  const [visibleColumnIds, setVisibleColumnIds] = useState<ColumnId[]>(() => getDefaultColumnTemplate())
  const [activeRules, setActiveRules] = useState<ScreenerRule[]>([])
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [saveStrategyOpen, setSaveStrategyOpen] = useState(false)
  const [strategyName, setStrategyName] = useState("")
  const [strategyDescription, setStrategyDescription] = useState("")
  const [savingStrategy, setSavingStrategy] = useState(false)
  const [indicatorSearch, setIndicatorSearch] = useState("")
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES_LABEL)
  const [presetPage, setPresetPage] = useState(1)
  const [screenerPresets, setScreenerPresets] = useState<ScreenerPreset[]>([])
  const [presetsLoading, setPresetsLoading] = useState(true)
  const [presetsError, setPresetsError] = useState<string | null>(null)
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
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadPresets() {
      setPresetsLoading(true)
      setPresetsError(null)

      try {
        const response = await fetch("/api/screener/presets", {
          signal: controller.signal,
        })
        const result = await response.json() as ScreenerPresetsResponse

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Gagal memuat preset screener.")
        }

        const presets = result.presets ?? []
        setScreenerPresets(presets)

        if (!defaultPresetAppliedRef.current && !userConfiguredScreenerRef.current) {
          const defaultPreset = presets.find((preset) => preset.id === DEFAULT_SCREENER_PRESET_ID) ?? presets[0]

          if (defaultPreset) {
            applyPreset(defaultPreset, "default")
            defaultPresetAppliedRef.current = true
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        const message = error instanceof Error ? error.message : "Gagal memuat preset screener."
        setPresetsError(message)
      } finally {
        if (!controller.signal.aborted) {
          setPresetsLoading(false)
        }
      }
    }

    void loadPresets()

    return () => controller.abort()
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

  const presetCategories = useMemo(() => {
    const labels: string[] = []
    for (const preset of screenerPresets) {
      const label = preset.groupLabel || preset.group
      if (label && !labels.includes(label)) labels.push(label)
    }
    return [ALL_CATEGORIES_LABEL, ...labels]
  }, [screenerPresets])

  const visiblePresets = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES_LABEL) return screenerPresets
    return screenerPresets.filter((preset) => (preset.groupLabel || preset.group) === activeCategory)
  }, [screenerPresets, activeCategory])

  const totalPresetPages = Math.max(1, Math.ceil(visiblePresets.length / PRESETS_PER_PAGE))
  const safePresetPage = Math.min(presetPage, totalPresetPages)
  const paginatedPresets = visiblePresets.slice(
    (safePresetPage - 1) * PRESETS_PER_PAGE,
    safePresetPage * PRESETS_PER_PAGE,
  )

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
  const sectorOptions = useMemo(
    () => Array.from(new Set([...SCREENER_SECTOR_OPTIONS, ...sectors])).sort(),
    [sectors],
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

  function buildScreenerConfig(): ScreenerRequest {
    return normalizeScreeningContractConfig({
      screeningId: activePresetId ? `screener_${activePresetId}` : `screener_${Date.now()}`,
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
            default:
              return { type: rule.key.toUpperCase(), min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
          }
        }),
      technicalIndicators: activeRules
        .filter((rule) => rule.category === "technical")
        .filter((rule) => !CLIENT_SIDE_RULE_KEYS.includes(rule.key))
        .map((rule) => {
          const definition = FILTER_LIBRARY[rule.key]

          if (definition.mode === "params") {
            return {
              type: definition.apiType ?? technicalIndicatorNameToApiType(definition.label),
              ...getConfiguredRuleParamsWithDefaults(rule.params, definition.defaultParams),
            }
          }

          switch (rule.key) {
            case "rsi":
              return {
                type: "RSI",
                period: 14,
                oversold: parseOptionalNumberWithDefault(rule.params.min, definition.defaultParams.min),
                overbought: parseOptionalNumberWithDefault(rule.params.max, definition.defaultParams.max),
              }
            default:
              return { type: rule.key.toUpperCase(), min: parseOptionalNumber(rule.params.min), max: parseOptionalNumber(rule.params.max) }
          }
        }),
      riskManagement: {
        stopLoss: {
          method: "FIXED",
          percent: 8,
        },
        takeProfit: {
          method: "FIXED",
          percent: 20,
        },
        maxHoldingDays: 60,
      },
    })
  }

  async function runScreener() {
    if (!isLoaded) return

    if (!isSignedIn) {
      signInOpenedRef.current = true
      void openSignIn()
      return
    }

    signInOpenedRef.current = false
    setIsRunning(true)
    setRunError(null)

    try {
      const response = await fetch("/api/screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: buildScreenerConfig(), scan_days: 5 }),
      })

      const result = await response.json() as ScreenerApiResponse & { error?: string; details?: string }
      if (!response.ok) {
        if (response.status === 401) {
          signInOpenedRef.current = true
          void openSignIn()
          return
        }
        throw new Error(result.details || result.error || "Gagal menjalankan screener.")
      }

      setScreenerRows(result.rows)
      setLatestSnapshotDate(result.latestDate)
      setScreeningSummary(result.summary)
      setScreeningDateRange(result.dateRange)
      // When the backend ranks by alignment, open the table on that ranking.
      if (result.rows.some((row) => row.alignmentScore !== null)) {
        ensureColumnsVisible(["alignmentScore"])
        setSortKey("alignmentScore")
        setSortDirection("desc")
      }
      toast.success("Screener selesai dijalankan.", {
        description: `${result.rows.length} saham ditemukan.`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menjalankan screener."
      setRunError(message)
      toast.error(message)
    } finally {
      setIsRunning(false)
    }
  }

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
        const matchesFundamentals = activeRules
          .filter((rule) => rule.category === "fundamental")
          .every((rule) => matchesFundamentalRule(row, rule))
        const matchesClientRules = activeRules
          .filter((rule) => CLIENT_SIDE_RULE_KEYS.includes(rule.key))
          .every((rule) => matchesClientSideRule(row, rule))
        return matchesSearch && matchesSector && matchesMarketCap && matchesSyariah && matchesFundamentals && matchesClientRules
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
  }, [activeRules, marketCapFilter, screenerRows, search, sectorFilter, sortDirection, sortKey, syariahFilter])

  function toggleRadar(ticker: string) {
    setRadarTickers((current) => current.includes(ticker) ? current.filter((item) => item !== ticker) : [...current, ticker])
  }

  function handleSort(nextKey: SortKey) {
    userConfiguredScreenerRef.current = true

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
  }

  function selectDefaultColumns() {
    setVisibleColumnIds(getDefaultColumnTemplate())
  }

  function ensureColumnsVisible(columnIds: ColumnId[]) {
    if (columnIds.length === 0) return

    setVisibleColumnIds((current) =>
      Array.from(new Set([...FIXED_COLUMN_IDS, ...current, ...columnIds])) as ColumnId[],
    )
  }

  function addRule(key: FilterKey) {
    userConfiguredScreenerRef.current = true
    setActivePresetId(null)
    ensureColumnsVisible(getRelatedColumnsForRule(key))
    setActiveRules((current) => {
      if (current.some((rule) => rule.key === key)) return current
      return [...current, createRule(key)]
    })
  }

  function updateRuleParam(ruleId: string, paramKey: string, value: string) {
    userConfiguredScreenerRef.current = true
    setActivePresetId(null)
    setActiveRules((current) =>
      current.map((rule) => (rule.id === ruleId ? { ...rule, params: { ...rule.params, [paramKey]: value } } : rule)),
    )
  }

  function removeRule(ruleId: string) {
    userConfiguredScreenerRef.current = true
    setActivePresetId(null)
    setActiveRules((current) => current.filter((rule) => rule.id !== ruleId))
    setEditingRuleId((current) => (current === ruleId ? null : current))
  }

  function resetScreenerBuilder() {
    userConfiguredScreenerRef.current = true
    setActivePresetId(null)
    setEditingRuleId(null)
    setActiveRules([])
    setSearch("")
    setSectorFilter("all")
    setMarketCapFilter("all")
    setSyariahFilter("all")
    setSortKey("close")
    setSortDirection("desc")
  }

  function applyPreset(preset: ScreenerPreset, source: "default" | "user" = "user") {
    if (source === "user") {
      userConfiguredScreenerRef.current = true
    }

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
    ensureColumnsVisible(nextRules.flatMap((rule) => getRelatedColumnsForRule(rule.key)))

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

  function handleSectorFilterChange(value: string) {
    userConfiguredScreenerRef.current = true
    setActivePresetId(null)
    setSectorFilter(value)
  }

  function handleMarketCapFilterChange(value: string) {
    userConfiguredScreenerRef.current = true
    setActivePresetId(null)
    setMarketCapFilter(value)
  }

  function handleSyariahFilterChange(value: string) {
    userConfiguredScreenerRef.current = true
    setActivePresetId(null)
    setSyariahFilter(value)
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
    if (!activePresetId && activeRules.length === 0) return
    if (!isLoaded) return

    if (!isSignedIn) {
      signInOpenedRef.current = true
      void openSignIn()
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
      const digits = column.id === "nbsaRatio5d" ? 6 : 2
      return formatPercent(typeof value === "number" ? value : null, digits)
    }

    if (column.kind === "currency") {
      return formatNumericValue(typeof value === "number" ? value : null, 2)
    }

    return formatNumericValue(typeof value === "number" ? value : null)
  }

  function renderColumnHeader(columnId: ColumnId, label: string, sortable = false) {
    const headerContent = sortable ? (
      <button className="inline-flex items-center gap-2" onClick={() => handleSort(columnId as SortKey)}>
        {label} <ArrowUpDown className="h-3.5 w-3.5" />
      </button>
    ) : (
      <span className="inline-flex items-center gap-2">
        {label}
      </span>
    )

    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            {headerContent}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[240px] text-xs leading-relaxed">{COLUMN_TOOLTIPS[columnId]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const columns: DataTableColumn<ScreenerRow>[] = [
    {
      id: "stockCode",
      headClassName: "w-[136px] min-w-[136px]",
      header: renderColumnHeader("stockCode", "Saham", true),
      cellClassName: "py-2 pr-2",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <TickerCircleIcon ticker={row.stockCode} />
          <Link href={`/analyze-v2?ticker=${row.stockCode}`} className="font-ibm-plex-mono text-sm font-semibold tracking-[0.1em] text-foreground hover:text-[#487b78]">
            {row.stockCode}
          </Link>
        </div>
      ),
    },
    ...COLUMN_CONFIGS.map((column) => ({
      id: column.id,
      headClassName: column.headClassName,
      cellClassName: column.cellClassName,
      header: renderColumnHeader(column.id, column.label, column.sortable),
      cell: (row: ScreenerRow) => {
        if (column.id === "alignmentScore") {
          return <AlignmentScoreCell row={row} />
        }
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
      header: renderColumnHeader("action", "Action"),
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
  const activePreset = screenerPresets.find((preset) => preset.id === activePresetId) ?? null
  const canSaveStrategy = Boolean(activePresetId || activeRules.length > 0)
  const screenerTableClassName =
    visibleColumns.length <= 8
      ? "w-max min-w-[720px] md:min-w-[980px]"
      : visibleColumns.length <= 14
        ? "w-max min-w-[1040px] md:min-w-[1480px]"
        : "w-max min-w-[1500px] md:min-w-[2200px]"

  return (
    <div className="h-screen overflow-hidden bg-background dotted-background bg-fixed">
      <div className="fixed inset-x-0 top-0 z-40">
        <Navbar />
      </div>

      <main className="h-full overflow-y-auto pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <section className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#487b78] via-slate-300 to-transparent" />
            <div className="p-6 sm:p-8">
              <div className="max-w-3xl space-y-3">
                <Badge variant="outline" className="border-slate-200 bg-slate-50 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-600">
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
              {/* Strategi Populer — header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Strategi Populer</h2>
                  <p className="text-sm text-muted-foreground">
                    Pilih pola pasar yang ingin kamu cari. Tinggal pilih, atur, lalu jalankan.
                  </p>
                </div>
                <div className="whitespace-nowrap font-ibm-plex-mono text-sm text-muted-foreground">
                  <span className="text-[#487b78]">{filteredRows.length} saham cocok</span>
                  {screeningSummary?.stocksScanned ? <span> dari {screeningSummary.stocksScanned}</span> : null}
                  {latestSnapshotDate ? <span> · update terakhir {latestSnapshotDate}</span> : null}
                </div>
              </div>

              {/* Category tabs */}
              {!presetsLoading && screenerPresets.length > 0 ? (
                <div className="-mx-1 flex flex-wrap items-center gap-1.5 px-1">
                  {presetCategories.map((category, index) => {
                    const isActive = activeCategory === category
                    return (
                      <Fragment key={category}>
                        {index === 1 ? (
                          <span aria-hidden className="mx-1 h-5 w-px self-center bg-border/70" />
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCategory(category)
                            setPresetPage(1)
                          }}
                          className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#487b78]/30 ${
                            isActive
                              ? "border-border bg-background text-foreground shadow-sm"
                              : "border-transparent text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                          }`}
                        >
                          {formatCategoryLabel(category)}
                        </button>
                      </Fragment>
                    )
                  })}
                </div>
              ) : null}
              {presetsError ? <p className="text-xs text-rose-600">{presetsError}</p> : null}

              {/* Strategy grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {presetsLoading ? (
                  Array.from({ length: PRESETS_PER_PAGE }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[184px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
                    />
                  ))
                ) : visiblePresets.length === 0 ? (
                  <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-muted-foreground">
                    {screenerPresets.length === 0
                      ? "Belum ada preset screener aktif di database."
                      : "Tidak ada strategi pada kategori ini."}
                  </div>
                ) : (
                  paginatedPresets.map((preset) => {
                    const isActive = activePresetId === preset.id
                    const visual = getPresetCategoryVisual(preset)
                    const Icon = visual.icon
                    const primaryLabel = getPresetFilterLabels(preset)[0]

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            resetScreenerBuilder()
                          } else {
                            applyPreset(preset)
                          }
                        }}
                        className={`group relative flex flex-col rounded-2xl border bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#487b78]/30 ${
                          isActive
                            ? "border-[#d8b08a] shadow-[0_10px_24px_rgba(180,106,44,0.12)]"
                            : "border-border/70 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${visual.iconWrap}`}>
                            <Icon className="h-3.5 w-3.5" />
                            <span className="font-ibm-plex-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                              {getPresetCategoryLabel(preset)}
                            </span>
                          </span>
                          {isActive ? (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                              <Check className="h-3 w-3" />
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-3 text-sm font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
                          {preset.name}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                          {preset.summary}
                        </p>
                        {primaryLabel ? (
                          <div className="mt-3">
                            <span className="inline-flex rounded-md border border-border/70 bg-background px-2 py-0.5 font-ibm-plex-mono text-[10px] font-medium leading-none text-muted-foreground">
                              {primaryLabel}
                            </span>
                          </div>
                        ) : null}
                      </button>
                    )
                  })
                )}
              </div>

              {/* Pagination */}
              {!presetsLoading && totalPresetPages > 1 ? (
                <div className="flex items-center justify-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-border/70 bg-background text-muted-foreground shadow-sm hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                    onClick={() => setPresetPage((page) => Math.max(1, page - 1))}
                    disabled={safePresetPage === 1}
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPresetPages }).map((_, index) => {
                    const page = index + 1
                    const isCurrent = page === safePresetPage
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setPresetPage(page)}
                        className={`h-8 min-w-8 rounded-md border px-2 font-ibm-plex-mono text-xs font-medium transition-colors ${
                          isCurrent
                            ? "border-[#d07225]/40 bg-[#fff7ef] text-[#8d5627] shadow-sm"
                            : "border-border/70 bg-background text-muted-foreground hover:border-slate-300 hover:bg-slate-50"
                        }`}
                        aria-current={isCurrent ? "page" : undefined}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-border/70 bg-background text-muted-foreground shadow-sm hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                    onClick={() => setPresetPage((page) => Math.min(totalPresetPages, page + 1))}
                    disabled={safePresetPage === totalPresetPages}
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}

              <div className="space-y-4 border-t border-border/70 pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 gap-2 border-border/70 bg-background px-3 text-foreground shadow-sm hover:border-slate-300 hover:bg-slate-50"
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
                              className="flex cursor-pointer items-start justify-between gap-3 py-2 text-foreground focus:bg-slate-100 focus:text-foreground data-[highlighted]:bg-slate-100 data-[highlighted]:text-foreground"
                            >
                              <div>
                                <div className="text-sm font-medium text-foreground">{definition.label}</div>
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
                            className="flex cursor-pointer items-start justify-between gap-3 py-2 text-foreground focus:bg-slate-100 focus:text-foreground data-[highlighted]:bg-slate-100 data-[highlighted]:text-foreground"
                          >
                            <div>
                              <div className="text-sm font-medium text-foreground">{definition.label}</div>
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

                <Button
                  variant="outline"
                  className="h-10 gap-2 border-border/70 bg-background px-3 text-foreground shadow-sm hover:border-slate-300 hover:bg-slate-50"
                  onClick={resetScreenerBuilder}
                  disabled={!activePreset && activeRules.length === 0 && search === "" && sectorFilter === "all" && marketCapFilter === "all" && syariahFilter === "all" && sortKey === "close" && sortDirection === "desc"}
                >
                  Reset
                </Button>

                <Button
                  variant="outline"
                  className="h-10 gap-2 border-border/70 bg-background px-3 text-foreground shadow-sm hover:border-slate-300 hover:bg-slate-50"
                  onClick={handleOpenSaveStrategy}
                  disabled={!canSaveStrategy}
                >
                  <Save className="h-4 w-4" />
                  Simpan Preset
                </Button>
                  </div>

                  <Button
                    className={`h-11 gap-2 rounded-md border px-5 shadow-sm transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-100 ${isRunning
                      ? "border-border bg-secondary text-muted-foreground"
                      : "border-transparent bg-[#d07225] text-white hover:bg-[#b8641f]"
                      }`}
                    onClick={handleRunScreener}
                    disabled={isRunning || !isLoaded}
                  >
                    {isRunning ? (
                      <>
                        <span>Running... ({runElapsedTime}s)</span>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Jalankan Screener
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeRules.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Pilih preset atau tambah indicator.
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
                                className="inline-flex h-9 items-center gap-2 rounded-l-md border border-r-0 border-slate-400 bg-slate-100 px-2.5 font-ibm-plex-mono text-[11px] font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-colors hover:border-slate-500 hover:bg-slate-200 hover:text-slate-900"
                                title={`Edit ${definition.label}`}
                              >
                                <span>{formatRuleSummary(rule)}</span>
                              </button>
                            </PopoverTrigger>
                            <button
                              type="button"
                              onClick={() => removeRule(rule.id)}
                              className="inline-flex h-9 items-center justify-center rounded-r-md border border-slate-400 bg-slate-100 px-2 text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
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
                    onChange={(event) => {
                      userConfiguredScreenerRef.current = true
                      setSearch(event.target.value)
                    }}
                    placeholder="Cari ticker atau sector"
                    className="border-border/70 bg-background pl-9 text-sm focus-visible:ring-[#487b78]"
                  />
                </div>

                <Select value={sectorFilter} onValueChange={handleSectorFilterChange}>
                  <SelectTrigger className="bg-background border-border/70">
                    <SelectValue placeholder="Semua sektor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua sektor</SelectItem>
                    {sectorOptions.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={marketCapFilter} onValueChange={handleMarketCapFilterChange}>
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

                <Select value={syariahFilter} onValueChange={handleSyariahFilterChange}>
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
                  userConfiguredScreenerRef.current = true
                  const [key, direction] = value.split(":") as [SortKey, "asc" | "desc"]
                  setSortKey(key)
                  setSortDirection(direction)
                }}>
                  <SelectTrigger className="bg-background border-border/70">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alignmentScore:desc">Alignment tertinggi</SelectItem>
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
                        className="h-11 gap-2 rounded-md border-border/70 bg-background px-4 text-foreground shadow-sm hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Columns3 className="h-4 w-4 text-muted-foreground" />
                        Pilih kolom
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onSelect={selectDefaultColumns}>
                        Pilih semua kolom default
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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

                  <div className="flex flex-wrap items-center gap-2 font-ibm-plex-mono text-sm text-muted-foreground">
                    <span>{activeRules.length} filter aktif</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                          aria-label="Definisi metrik screener"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[320px] space-y-3 border-border/70 bg-card p-4">
                        <div className="space-y-1">
                          <div className="font-ibm-plex-mono text-sm font-semibold text-foreground">Definisi metrik</div>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            Ringkasan arti parameter utama yang muncul di hasil screener.
                          </p>
                        </div>
                        <div className="space-y-2">
                          {METRIC_GUIDE_ITEMS.map((item) => (
                            <div key={item.label} className="space-y-1">
                              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                                {item.label}
                              </div>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/*
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
          */}

          <div id="screener-results" className="space-y-2">
            {visibleColumns.length > 10 ? (
              <TooltipProvider>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Geser tabel ke samping untuk melihat semua kolom.</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex text-muted-foreground hover:text-foreground" aria-label="Informasi scroll tabel">
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Tabel akan melebar otomatis saat kolom yang dipilih semakin banyak.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            ) : null}
            <DataTable
              columns={visibleColumns}
              data={filteredRows}
              getRowId={(row) => row.stockCode}
              emptyMessage=""
              tableClassName={screenerTableClassName}
              rowClassName="hover:bg-slate-50"
              rowHoverContent={(row) => <ScreenerRowHoverCard row={row} />}
              rowHoverContentClassName="min-w-[336px] max-w-[336px] border-border/70"
              initialPageSize={20}
              pageSizeOptions={[20, 40, 60, 80]}
              paginationResetKey={`${search}|${sectorFilter}|${marketCapFilter}|${syariahFilter}|${sortKey}|${sortDirection}|${activeRules.map((rule) => `${rule.key}:${JSON.stringify(rule.params)}`).join("|")}`}
            />
          </div>

        </div>

        <Footer />
      </main>

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
                className="min-h-[96px] w-full rounded-md border border-border/70 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-[#487b78]"
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
