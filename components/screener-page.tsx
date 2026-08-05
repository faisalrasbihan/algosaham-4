"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bell, ArrowRight, Search, SlidersHorizontal, Columns3, Plus, X, ChevronDown, ChevronUp, ChevronsUpDown, Save, Check, Info, Moon, Rocket, TrendingUp, Zap, Gauge, Gem, Layers, Play, RotateCcw } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { Footer } from "@/components/footer"
import { CardCarousel } from "@/components/card-carousel"
import { PageShell } from "@/components/page-shell"
import { PageHeader } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { SCREENER_PRESETS, type PresetIndicatorConfig, type ScreenerPreset } from "@/lib/screener-presets"
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
  volumeRatio20d: number | null
  avgValue20d: number | null
  valueRatio20d: number | null
  closeVsSma20Pct: number | null
  closeVsSma50Pct: number | null
  nbsa5d: number | null
  value5d: number | null
  nbsaRatio5d: number | null
  changeD1Pct: number | null
  change5DPct: number | null
  return20dPct: number | null
  return60dPct: number | null
  change1MPct: number | null
  change1YPct: number | null
  range20dPct: number | null
  volatility20d: number | null
  distFrom52wHighPct: number | null
  distFrom52wLowPct: number | null
  alignmentScore: number | null
  fundamentalScore: number | null
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
  alignmentScore: "AI Score",
  open: "Open",
  high: "High",
  low: "Low",
  close: "Price",
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
  sma20: "MA-20",
  sma50: "SMA 50",
  volumeSma20: "Vol SMA 20",
  valueSma20: "Value SMA 20",
  volumeRatio20d: "Vol Ratio 20D",
  avgValue20d: "Avg Value 20D",
  valueRatio20d: "Value Ratio 20D",
  closeVsSma20Pct: "Close vs SMA20",
  closeVsSma50Pct: "Close vs SMA50",
  nbsa5d: "NBSA 5D",
  value5d: "Value 5D",
  nbsaRatio5d: "NBSA Ratio 5D",
  return20dPct: "20D Chg",
  return60dPct: "60D Chg",
  range20dPct: "Range 20D",
  volatility20d: "Volatility 20D",
  distFrom52wHighPct: "52W High Gap",
  distFrom52wLowPct: "52W Low Gap",
  action: "Pantau",
} as const

type ColumnId = keyof typeof COLUMN_LABELS

const COLUMN_TOOLTIPS: Record<ColumnId, string> = {
  stockCode: "Kode saham emiten yang muncul di hasil screener.",
  alignmentScore: "AI Score 0-100 dari backend yang merangkum kekuatan sinyal screener untuk saham ini. Jika strategi memakai indikator teknikal dan fundamental, score ini menggabungkan keduanya; rincian per indikator muncul saat baris diarahkan kursor.",
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
  volumeRatio20d: "Volume hari terakhir dibanding rata-rata volume 20 hari. Nilai 2 berarti dua kali rata-rata.",
  avgValue20d: "Rata-rata nilai transaksi 20 hari.",
  valueRatio20d: "Nilai transaksi hari terakhir dibanding rata-rata nilai transaksi 20 hari.",
  closeVsSma20Pct: "Jarak harga penutupan terhadap SMA 20 dalam persen.",
  closeVsSma50Pct: "Jarak harga penutupan terhadap SMA 50 dalam persen.",
  nbsa5d: "Akumulasi net buy sell asing selama 5 hari terakhir.",
  value5d: "Akumulasi nilai transaksi selama 5 hari terakhir.",
  nbsaRatio5d: "Rasio net buy sell asing terhadap nilai transaksi 5 hari dalam persen.",
  return20dPct: "Perubahan harga dibanding 20 hari bursa sebelumnya.",
  return60dPct: "Perubahan harga dibanding 60 hari bursa sebelumnya.",
  range20dPct: "Rentang high-low 20 hari terakhir dalam persen.",
  volatility20d: "Volatilitas return harian 20 hari terakhir.",
  distFrom52wHighPct: "Jarak harga penutupan terhadap high 52 minggu dalam persen.",
  distFrom52wLowPct: "Jarak harga penutupan terhadap low 52 minggu dalam persen.",
  action: "Tambahkan atau hapus saham dari daftar pantauan di Portfolio.",
}

const COLUMN_CONFIGS: ColumnConfig[] = [
  { id: "alignmentScore", label: "AI Score", kind: "number", sortable: true, headClassName: "w-[112px] text-right", cellClassName: "text-right" },
  { id: "changeD1Pct", label: "1D Chg", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "change5DPct", label: "5D Chg", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "change1MPct", label: "1M Chg", kind: "percent", sortable: true, headClassName: "w-[120px] text-right", cellClassName: "w-[120px] text-right font-ibm-plex-mono" },
  { id: "change1YPct", label: "1Y Chg", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "close", label: "Price", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
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
  { id: "sma20", label: "MA-20", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "sma50", label: "SMA 50", kind: "currency", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "volumeSma20", label: "Vol SMA 20", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "valueSma20", label: "Value SMA 20", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "volumeRatio20d", label: "Vol Ratio 20D", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "avgValue20d", label: "Avg Value 20D", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "valueRatio20d", label: "Value Ratio 20D", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "closeVsSma20Pct", label: "Close vs SMA20", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "closeVsSma50Pct", label: "Close vs SMA50", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "nbsa5d", label: "NBSA 5D", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "value5d", label: "Value 5D", kind: "number", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "nbsaRatio5d", label: "NBSA Ratio 5D", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "return20dPct", label: "20D Chg", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "return60dPct", label: "60D Chg", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "range20dPct", label: "Range 20D", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "volatility20d", label: "Volatility 20D", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "distFrom52wHighPct", label: "52W High Gap", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
  { id: "distFrom52wLowPct", label: "52W Low Gap", kind: "percent", sortable: true, headClassName: "text-right", cellClassName: "text-right font-ibm-plex-mono" },
]

const COLUMN_TEMPLATES = {
  recommended: ["stockCode", "alignmentScore", "changeD1Pct", "change5DPct", "change1MPct", "change1YPct", "close", "valuasi", "peRatio", "pbv", "roe", "marketCap", "sma20", "sma50", "nbsaRatio5d", "action"],
  technical: ["stockCode", "changeD1Pct", "change5DPct", "change1MPct", "change1YPct", "close", "gapPct", "prevDailyValue", "sma20", "sma50", "volumeSma20", "valueSma20", "nbsa5d", "nbsaRatio5d", "action"],
  fundamental: ["stockCode", "alignmentScore", "change1MPct", "change1YPct", "close", "marketCap", "assets", "liabilities", "equity", "sales", "profit", "eps", "peRatio", "pbv", "der", "roa", "roe", "npm", "action"],
  all: ["stockCode", ...COLUMN_CONFIGS.map((column) => column.id), "action"],
} as const

type ColumnTemplateKey = keyof typeof COLUMN_TEMPLATES
const FIXED_COLUMN_IDS: ColumnId[] = ["stockCode", "action"]
const PRESET_BASE_COLUMN_IDS: ColumnId[] = ["close", "changeD1Pct", "change5DPct", "change1MPct", "sma20"]

const PRESET_FIELD_COLUMN_IDS: Partial<Record<string, ColumnId[]>> = {
  avg_value_20d: ["avgValue20d"],
  close_vs_sma_20_pct: ["closeVsSma20Pct"],
  close_vs_sma_50_pct: ["closeVsSma50Pct"],
  der: ["der"],
  dist_from_52w_high_pct: ["distFrom52wHighPct"],
  dist_from_52w_low_pct: ["distFrom52wLowPct"],
  market_cap: ["marketCap"],
  pbv: ["pbv"],
  pe_ratio: ["peRatio"],
  range_20d_pct: ["range20dPct"],
  return_1d: ["changeD1Pct"],
  return_5d: ["change5DPct"],
  return_20d: ["return20dPct"],
  return_60d: ["return60dPct"],
  roe: ["roe"],
  value_ratio_20d: ["valueRatio20d"],
  volatility_20d: ["volatility20d"],
  volume_ratio_20d: ["volumeRatio20d"],
}

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

type SavedScreenerConfig = ScreenerRequest & {
  builderState?: {
    rules?: Array<{
      key: string
      params: Record<string, string>
    }>
    search?: string
    sortKey?: string
    sortDirection?: "asc" | "desc"
    visibleColumnIds?: string[]
  }
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
  setup: { icon: Moon, iconWrap: "bg-muted text-muted-foreground" },
  breakout: { icon: Rocket, iconWrap: "bg-muted text-muted-foreground" },
  trend: { icon: TrendingUp, iconWrap: "bg-muted text-muted-foreground" },
  momentum: { icon: Zap, iconWrap: "bg-muted text-muted-foreground" },
  "dip buy": { icon: Gauge, iconWrap: "bg-muted text-muted-foreground" },
  value: { icon: Gem, iconWrap: "bg-muted text-muted-foreground" },
  level: { icon: Layers, iconWrap: "bg-muted text-muted-foreground" },
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

function getColumnTemplate(template: ColumnTemplateKey): ColumnId[] {
  return [...COLUMN_TEMPLATES[template]]
}

function getDefaultColumnTemplate(): ColumnId[] {
  return getColumnTemplate("recommended")
}

function getPresetColumnTemplate(preset: ScreenerPreset): ColumnId[] {
  const mappedColumnIds = preset.defaultFields.flatMap((field) => PRESET_FIELD_COLUMN_IDS[field] ?? [])
  return Array.from(new Set(["stockCode", "alignmentScore", ...PRESET_BASE_COLUMN_IDS, ...mappedColumnIds, "action"])) as ColumnId[]
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

function getCompactFilterLabel(label: string) {
  return label
    .replace(/Accumulation Distribution/g, "A/D")
    .replace(/Inverse Head Shoulders/g, "Inverse H&S")
    .replace(/Relative Strength/g, "RS")
    .replace(/Moving Average/g, "MA")
    .replace(/Volatility/g, "Vol")
    .replace(/Volume/g, "Vol")
    .replace(/Crossover/g, "Cross")
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
    <div className="w-[336px] overflow-hidden bg-white">
      <div className="p-2.5 pb-0">
        <div className="h-[178px] overflow-hidden rounded-lg border border-slate-200 bg-white">
          <TradingViewMiniChart ticker={row.stockCode} />
        </div>
      </div>

      {hasAlignment ? (
        <dl className="px-4 py-3">
          <div className="flex items-center justify-between gap-4 py-2 text-xs">
            <dt className="text-muted-foreground">AI score</dt>
            <dd className="font-ibm-plex-mono font-semibold text-foreground">
              {alignmentScore}/100
            </dd>
          </div>
          {row.alignmentBreakdown.map((item, index) => (
            <div
              key={`${item.indicator}-${index}`}
              className="flex items-center justify-between gap-4 border-t border-border/70 py-2 text-xs"
            >
              <dt className="min-w-0 truncate text-muted-foreground">
                {formatAlignmentIndicator(item.indicator)}
              </dt>
              <dd className="shrink-0 font-ibm-plex-mono font-medium text-foreground">
                {item.score ?? "—"}
              </dd>
            </div>
          ))}
          {row.signalDate ? (
            <div className="flex items-center justify-between gap-4 border-t border-border/70 py-2 text-xs">
              <dt className="text-muted-foreground">Sinyal terbaru</dt>
              <dd className="font-medium text-foreground">{formatSignalDate(row.signalDate)}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <Link
        href={`/analyze-v2?ticker=${row.stockCode}`}
        className="group flex h-12 cursor-pointer items-center justify-between border-t border-[#d07225]/15 bg-[#fbf7f2] px-4 text-sm font-semibold text-[#9a541c] transition-colors hover:bg-[#f7eee5] hover:text-[#7f4315] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d07225]/35"
      >
        <span>Deep dive {row.stockCode}</span>
        <ArrowRight className="h-4 w-4 text-[#d07225] transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}

function formatAlignmentIndicator(indicator: string) {
  const normalized = indicator.replace(/_/g, " ").trim()
  if (normalized.toLowerCase() === "fundamentals") return "Fundamentals"
  return normalized
}

function formatSignalDate(value: string) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : new Date(value)

  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed)
}

function alignmentToneClasses(score: number) {
  if (score >= 67) return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (score >= 34) return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-slate-200 bg-slate-50 text-slate-600"
}

// The detailed breakdown lives in the cursor-anchored row preview so the compact score
// badge can stay readable without introducing another competing hover target.
function ScoreBadgeCell({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-muted-foreground">—</span>
  }

  const roundedScore = Math.round(score)
  return (
    <div className="flex justify-end">
      <span className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-md border px-2 py-0.5 font-ibm-plex-mono text-xs font-semibold ${alignmentToneClasses(roundedScore)}`}>
        {roundedScore}
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
  const savedScreenerLoadedRef = useRef(false)
  const [search, setSearch] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [marketCapFilter, setMarketCapFilter] = useState("all")
  const [syariahFilter, setSyariahFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("close")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [radarTickers, setRadarTickers] = useState<string[]>([])
  const [savingRadarTickers, setSavingRadarTickers] = useState<string[]>([])
  const [visibleColumnIds, setVisibleColumnIds] = useState<ColumnId[]>(() => getDefaultColumnTemplate())
  const [activeRules, setActiveRules] = useState<ScreenerRule[]>([])
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [saveScreenerOpen, setSaveScreenerOpen] = useState(false)
  const [screenerName, setScreenerName] = useState("")
  const [screenerDescription, setScreenerDescription] = useState("")
  const [savingScreener, setSavingScreener] = useState(false)
  const [indicatorSearch, setIndicatorSearch] = useState("")
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES_LABEL)
  const screenerPresets = SCREENER_PRESETS
  const [screenerRows, setScreenerRows] = useState<ScreenerRow[]>([])
  const [latestSnapshotDate, setLatestSnapshotDate] = useState<string | null>(null)
  const [screeningSummary, setScreeningSummary] = useState<ScreenerApiResponse["summary"] | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [runElapsedTime, setRunElapsedTime] = useState("0.0")
  const [runError, setRunError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      if (isLoaded) setRadarTickers([])
      return
    }

    let cancelled = false
    fetch("/api/watchlist/stocks")
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.error || "Gagal memuat saham tersimpan")
        if (!cancelled) setRadarTickers(result.stocks.map((stock: { ticker: string }) => stock.ticker))
      })
      .catch((error) => {
        console.error("Failed to load saved stocks:", error)
        if (!cancelled) toast.error("Saham tersimpan gagal dimuat")
      })

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (defaultPresetAppliedRef.current || userConfiguredScreenerRef.current) return

    const defaultPreset = screenerPresets.find((preset) => preset.id === DEFAULT_SCREENER_PRESET_ID) ?? screenerPresets[0]
    if (!defaultPreset) return

    applyPreset(defaultPreset, "default")
    defaultPresetAppliedRef.current = true
  }, [])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || savedScreenerLoadedRef.current) return

    const savedId = new URLSearchParams(window.location.search).get("saved")
    if (!savedId) return

    savedScreenerLoadedRef.current = true
    userConfiguredScreenerRef.current = true

    fetch(`/api/watchlist/screeners/${encodeURIComponent(savedId)}`)
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.error || "Gagal memuat screener")
        applySavedScreenerConfig(result.screener.config, result.screener.sourcePresetId)
        setScreenerName(result.screener.name ?? "")
        setScreenerDescription(result.screener.description ?? "")
        toast.success(`Screener “${result.screener.name}” dimuat`)
      })
      .catch((error) => {
        console.error("Failed to load saved screener:", error)
        toast.error("Screener tersimpan gagal dimuat")
      })
  }, [isLoaded, isSignedIn])

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
    if (!screeningSummary) return

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("screener-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [screeningSummary])

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
    setScreenerRows([])
    setLatestSnapshotDate(null)
    setScreeningSummary(null)

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

  async function toggleRadar(row: ScreenerRow) {
    if (!isLoaded || savingRadarTickers.includes(row.stockCode)) return
    if (!isSignedIn) {
      signInOpenedRef.current = true
      void openSignIn()
      return
    }

    const ticker = row.stockCode
    const wasSaved = radarTickers.includes(ticker)
    setSavingRadarTickers((current) => [...current, ticker])
    setRadarTickers((current) => wasSaved ? current.filter((item) => item !== ticker) : [...current, ticker])

    try {
      const response = await fetch(
        wasSaved ? `/api/watchlist/stocks?ticker=${encodeURIComponent(ticker)}` : "/api/watchlist/stocks",
        wasSaved
          ? { method: "DELETE" }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ticker,
                snapshot: {
                  sector: row.sector,
                  score: row.alignmentScore,
                  price: row.close,
                  day: row.changeD1Pct,
                  week: row.change5DPct,
                  month: row.change1MPct,
                  ma20: row.sma20,
                  gap52wLow: row.distFrom52wLowPct,
                },
              }),
            },
      )
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || "Gagal memperbarui saham tersimpan")
      toast.success(wasSaved ? `${ticker} dihapus dari pantauan` : `${ticker} disimpan ke Portfolio`)
    } catch (error) {
      console.error("Failed to update saved stock:", error)
      setRadarTickers((current) => wasSaved
        ? Array.from(new Set([...current, ticker]))
        : current.filter((item) => item !== ticker))
      toast.error("Saham tersimpan gagal diperbarui")
    } finally {
      setSavingRadarTickers((current) => current.filter((item) => item !== ticker))
    }
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
    setVisibleColumnIds(getPresetColumnTemplate(preset))

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

  function applySavedScreenerConfig(config: SavedScreenerConfig, sourcePresetId?: string | null) {
    const savedBuilderRules = config.builderState?.rules?.flatMap((savedRule) => {
      if (!savedRule || typeof savedRule.key !== "string") return []
      if (!Object.prototype.hasOwnProperty.call(FILTER_LIBRARY, savedRule.key)) return []

      const key = savedRule.key as FilterKey
      const params = savedRule.params && typeof savedRule.params === "object"
        ? Object.fromEntries(
            Object.entries(savedRule.params)
              .filter(([, value]) => typeof value === "string")
              .map(([name, value]) => [name, value]),
          )
        : { ...FILTER_LIBRARY[key].defaultParams }

      return [createRuleWithParams(key, params)]
    })

    const nextRules = savedBuilderRules?.length
      ? savedBuilderRules
      : [
          ...(config.fundamentalIndicators ?? [])
            .map((indicator) => createRuleFromPresetIndicator(indicator as PresetIndicatorConfig, "fundamental"))
            .filter((rule): rule is ScreenerRule => rule !== null),
          ...(config.technicalIndicators ?? [])
            .map((indicator) => createRuleFromPresetIndicator(indicator as PresetIndicatorConfig, "technical"))
            .filter((rule): rule is ScreenerRule => rule !== null),
        ]

    setEditingRuleId(null)
    setActiveRules(nextRules)
    setActivePresetId(sourcePresetId && screenerPresets.some((preset) => preset.id === sourcePresetId) ? sourcePresetId : null)
    const savedColumns = config.builderState?.visibleColumnIds?.filter(
      (columnId): columnId is ColumnId => Object.prototype.hasOwnProperty.call(COLUMN_LABELS, columnId),
    )
    const relatedColumns = nextRules.flatMap((rule) => getRelatedColumnsForRule(rule.key))
    setVisibleColumnIds(
      Array.from(new Set([
        ...FIXED_COLUMN_IDS,
        ...(savedColumns?.length ? savedColumns : getDefaultColumnTemplate()),
        ...relatedColumns,
      ])) as ColumnId[],
    )

    if (typeof config.builderState?.search === "string") {
      setSearch(config.builderState.search.slice(0, 80))
    }
    if (
      config.builderState?.sortKey &&
      config.builderState.sortKey !== "action" &&
      Object.prototype.hasOwnProperty.call(COLUMN_LABELS, config.builderState.sortKey)
    ) {
      setSortKey(config.builderState.sortKey as SortKey)
    }
    if (config.builderState?.sortDirection === "asc" || config.builderState?.sortDirection === "desc") {
      setSortDirection(config.builderState.sortDirection)
    }

    const filters = config.filters
    setMarketCapFilter(filters?.marketCap?.length === 1 ? String(filters.marketCap[0]).toLowerCase() : "all")
    setSectorFilter(filters?.sectors?.length === 1 ? String(filters.sectors[0]) : "all")
    setSyariahFilter(typeof filters?.syariah === "boolean" ? (filters.syariah ? "yes" : "no") : "all")
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

  async function handleSaveScreener() {
    if (!screenerName.trim()) return

    setSavingScreener(true)
    const config: SavedScreenerConfig = {
      ...buildScreenerConfig(),
      builderState: {
        rules: activeRules.map((rule) => ({
          key: rule.key,
          params: { ...rule.params },
        })),
        search,
        sortKey,
        sortDirection,
        visibleColumnIds,
      },
    }

    try {
      const response = await fetch("/api/watchlist/screeners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: screenerName,
          description: screenerDescription,
          category: activePreset?.groupLabel ?? "Kustom",
          sourcePresetId: activePresetId,
          config,
          filterLabels: activeRules.map((rule) => FILTER_LIBRARY[rule.key].label),
          latestMatches: filteredRows.slice(0, 20).map((row) => ({
            ticker: row.stockCode,
            score: row.alignmentScore,
            price: row.close,
            change: row.changeD1Pct,
            sector: row.sector,
          })),
          lastRunAt: screenerRows.length > 0 ? new Date().toISOString() : null,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Gagal menyimpan screener.")
      }

      setSaveScreenerOpen(false)
      setScreenerName("")
      setScreenerDescription("")
      toast.success("Screener disimpan ke Portfolio")
    } catch (error) {
      console.error("Save screener error:", error)
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan screener")
    } finally {
      setSavingScreener(false)
    }
  }

  function handleOpenSaveScreener() {
    if (!activePresetId && activeRules.length === 0) return
    if (!isLoaded) return

    if (!isSignedIn) {
      signInOpenedRef.current = true
      void openSignIn()
      return
    }

    if (!screenerName.trim() && activePreset) setScreenerName(activePreset.name)
    setSaveScreenerOpen(true)
  }

  function handleRunScreener() {
    void runScreener()
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
      const digits = column.id === "close" ? 0 : 2
      return formatNumericValue(typeof value === "number" ? value : null, digits)
    }

    const digits = column.id === "volumeRatio20d" ? 2 : 0
    return formatNumericValue(typeof value === "number" ? value : null, digits)
  }

  function renderColumnHeader(
    columnId: ColumnId,
    label: string,
    sortable = false,
    align: "left" | "right" = "left",
  ) {
    const isActiveSort = sortable && sortKey === columnId
    const SortIcon = isActiveSort
      ? sortDirection === "asc" ? ChevronUp : ChevronDown
      : ChevronsUpDown
    const sortIcon = (
      <SortIcon
        className={`h-3.5 w-3.5 shrink-0 transition-opacity ${isActiveSort ? "opacity-80" : "opacity-0 group-hover/sort:opacity-40 group-focus-visible/sort:opacity-40"}`}
        aria-hidden="true"
      />
    )

    const headerContent = sortable ? (
      <button
        type="button"
        className={`group/sort items-center gap-1.5 whitespace-nowrap transition-colors hover:text-foreground focus-visible:outline-none ${align === "right" ? "flex w-full justify-end" : "inline-flex"} ${isActiveSort ? "font-semibold text-foreground" : "text-muted-foreground"}`}
        onClick={() => handleSort(columnId as SortKey)}
        aria-label={`Urutkan berdasarkan ${label}${isActiveSort ? `, saat ini ${sortDirection === "asc" ? "menaik" : "menurun"}` : ""}`}
      >
        {align === "right" ? sortIcon : null}
        <span>{label}</span>
        {align === "left" ? sortIcon : null}
      </button>
    ) : (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
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
      ariaSort: sortKey === "stockCode" ? (sortDirection === "asc" ? "ascending" : "descending") : undefined,
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
      ariaSort: column.sortable && sortKey === column.id ? (sortDirection === "asc" ? "ascending" as const : "descending" as const) : undefined,
      header: renderColumnHeader(
        column.id,
        column.label,
        column.sortable,
        column.headClassName?.includes("text-right") ? "right" : "left",
      ),
      cell: (row: ScreenerRow) => {
        if (column.id === "alignmentScore") {
          return <ScoreBadgeCell score={row.alignmentScore} />
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
      headClassName: "w-[88px] min-w-[88px] text-right",
      cellClassName: "text-right",
      header: renderColumnHeader("action", "Pantau", false, "right"),
      cell: (row) => {
        const inRadar = radarTickers.includes(row.stockCode)
        return (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full transition-colors ${inRadar ? "bg-[#fbf1e8] text-[#d07225] hover:bg-[#f7e5d5] hover:text-[#b8621f]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              onClick={() => void toggleRadar(row)}
              disabled={savingRadarTickers.includes(row.stockCode)}
              aria-pressed={inRadar}
              aria-label={inRadar ? `Hapus ${row.stockCode} dari Portfolio` : `Pantau ${row.stockCode} di Portfolio`}
              title={inRadar ? "Tersimpan di Portfolio" : "Pantau di Portfolio"}
            >
              <Bell className={`h-4 w-4 ${inRadar ? "fill-current" : ""}`} />
            </Button>
          </div>
        )
      },
    },
  ]

  const columnById = new Map(columns.map((column) => [column.id as ColumnId, column]))
  const visibleColumns = visibleColumnIds
    .map((columnId) => columnById.get(columnId))
    .filter((column): column is DataTableColumn<ScreenerRow> => column !== undefined)
  const activePreset = screenerPresets.find((preset) => preset.id === activePresetId) ?? null
  const canSaveScreener = Boolean(activePresetId || activeRules.length > 0)
  const screenerTableClassName =
    visibleColumns.length <= 8
      ? "w-full min-w-full md:min-w-[980px]"
      : visibleColumns.length <= 14
        ? "w-full min-w-[1040px] md:min-w-[1480px]"
        : "w-full min-w-[1500px] md:min-w-[2200px]"

  return (
    <PageShell>
      <main className="flex min-h-[calc(100svh-5rem)] min-w-0 flex-1 flex-col">
          <PageHeader
            compact
            className="border-b-0 bg-transparent [&>div]:pb-7 [&>div]:pt-10 sm:[&>div]:pb-8 sm:[&>div]:pt-14"
            title="Pantau semua saham dalam satu radar"
            description="Filter, urutkan, dan tandai saham berdasarkan data fundamental dan teknikal."
          />

          <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">

          <section className="min-w-0">
            <div className="w-full min-w-0 space-y-4">
              {/* Category tabs */}
              {screenerPresets.length > 0 ? (
                <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
                  <div className="flex w-max items-center gap-1.5 md:mx-auto">
                    {presetCategories.map((category) => {
                      const isActive = activeCategory === category
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                            isActive
                              ? "border-border bg-muted text-foreground"
                              : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          {formatCategoryLabel(category)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {/* Strategy rail */}
              {visiblePresets.length === 0 ? (
                <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-muted-foreground">
                  {screenerPresets.length === 0
                    ? "Belum ada preset screener aktif."
                    : "Tidak ada strategi pada kategori ini."}
                </div>
              ) : (
                <CardCarousel
                  noPadding
                  showControls={false}
                  rightFadeWidth={72}
                  className="snap-x overscroll-x-contain pb-2"
                >
                  {visiblePresets.map((preset) => {
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
                        className={`group relative flex min-h-36 w-[220px] shrink-0 snap-start flex-col rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:w-[260px] ${
                          isActive
                            ? "border-primary/45 bg-primary/[0.035] shadow-sm"
                            : "border-border/80 bg-card hover:border-foreground/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${visual.iconWrap}`}>
                            <Icon className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                              {getPresetCategoryLabel(preset)}
                            </span>
                          </span>
                          {isActive ? (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3 w-3" />
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-3 text-sm font-semibold leading-snug tracking-tight text-foreground line-clamp-1">
                          {preset.name}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">
                          {preset.summary}
                        </p>
                        {primaryLabel ? (
                          <div className="mt-3">
                            <span className="inline-flex rounded-md border border-border/70 bg-background px-2 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                              {primaryLabel}
                            </span>
                          </div>
                        ) : null}
                      </button>
                    )
                  })}
                </CardCarousel>
              )}

              <div className="w-full min-w-0 space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)]">
                  <div className="min-w-0 space-y-4 lg:pr-1">
                <div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Susun filter</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Pilih preset di atas atau buat filter sendiri.</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 gap-2 border-border bg-background px-3 text-foreground shadow-none hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah filter
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
                          placeholder="Cari filter..."
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
                        Tidak ada filter yang cocok.
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={resetScreenerBuilder}
                        disabled={!activePreset && activeRules.length === 0 && search === "" && sectorFilter === "all" && marketCapFilter === "all" && syariahFilter === "all" && sortKey === "close" && sortDirection === "desc"}
                        aria-label="Reset filter"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset filter</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={handleOpenSaveScreener}
                        disabled={!canSaveScreener}
                        aria-label="Simpan preset"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Simpan preset</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                </div>
                  </div>

                <div className="min-w-0 lg:border-l lg:border-border/70 lg:pl-5">
                  <h3 className="mb-2.5 text-sm font-medium text-foreground">Active Filters</h3>

                <div className="flex min-w-0 flex-wrap gap-2">
                  {activeRules.length === 0 ? (
                    <div className="w-full rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
                      Belum ada filter. Pilih preset atau tambahkan filter.
                    </div>
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
                          <div className="group inline-flex h-9 w-fit items-center rounded-md border border-border/70 bg-muted/25 transition-colors hover:border-border hover:bg-muted/45">
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="h-full whitespace-nowrap px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                title={`Edit ${definition.label}`}
                              >
                                {getCompactFilterLabel(definition.label)}
                              </button>
                            </PopoverTrigger>
                            <button
                              type="button"
                              onClick={() => removeRule(rule.id)}
                              className="mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
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
                                Filter ini tidak memiliki parameter tambahan.
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      )
                    })
                  )}
                </div>
                </div>
                </div>

                <div
                  className="-mx-4 -mb-4 flex min-w-0 flex-col gap-4 border-t border-border/70 bg-muted/20 px-4 py-4 sm:-mx-5 sm:-mb-5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  aria-live="polite"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span
                        className={`h-2 w-2 rounded-full ${activeRules.length > 0 ? "bg-[#d07225]" : "bg-muted-foreground/30"}`}
                        aria-hidden="true"
                      />
                      {isRunning ? "Screener sedang berjalan" : activeRules.length > 0 ? "Siap dijalankan" : "Screener belum siap"}
                    </div>
                    <p className={`mt-1 text-xs ${runError ? "text-destructive" : "text-muted-foreground"}`}>
                      {isRunning
                        ? `Memindai saham yang sesuai · ${runElapsedTime} detik`
                        : runError
                          ? runError
                          : activeRules.length > 0
                            ? `${activeRules.length} filter akan diterapkan ke seluruh saham IDX.`
                            : "Tambahkan setidaknya satu filter untuk menjalankan screener."}
                    </p>
                  </div>

                  <Button
                    className={`h-11 w-full shrink-0 gap-2 rounded-md border px-5 shadow-sm transition-colors disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 sm:w-auto ${isRunning
                      ? "border-border bg-secondary text-muted-foreground"
                      : "border-transparent bg-[#d07225] text-white hover:bg-[#b8641f]"
                      }`}
                    onClick={handleRunScreener}
                    disabled={isRunning || !isLoaded || activeRules.length === 0}
                  >
                    {isRunning ? (
                      <>
                        <span>Menjalankan...</span>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        Jalankan Screener
                      </>
                    )}
                  </Button>
                </div>

              </div>

              {screeningSummary ? (
                <>
              <div className="flex flex-col gap-2 border-t border-border/70 pt-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Hasil screener</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Cari, urutkan, dan sesuaikan kolom setelah screener dijalankan.</p>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  <span>
                    <span className="text-foreground">{filteredRows.length} saham cocok</span>
                    {screeningSummary.stocksScanned ? ` dari ${screeningSummary.stocksScanned}` : ""}
                    {latestSnapshotDate ? ` · ${latestSnapshotDate}` : ""}
                  </span>
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
                    <SelectValue placeholder="Semua market cap" />
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
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
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
                    <SelectItem value="alignmentScore:desc">AI Score tertinggi</SelectItem>
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

                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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

                </>
              ) : null}

            </div>
          </section>

          {screeningSummary ? (
            <div id="screener-results" className="scroll-mt-24 space-y-2">
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
                  emptyMessage="Tidak ada saham yang cocok dengan filter ini."
                  tableClassName={screenerTableClassName}
                  rowClassName="hover:bg-slate-50"
                  rowHoverContent={(row) => <ScreenerRowHoverCard row={row} />}
                  rowHoverContentClassName="min-w-[336px] max-w-[336px] rounded-xl border-border/70"
                  initialPageSize={20}
                  pageSizeOptions={[20, 40, 60, 80]}
                  paginationResetKey={`${search}|${sectorFilter}|${marketCapFilter}|${syariahFilter}|${sortKey}|${sortDirection}|${activeRules.map((rule) => `${rule.key}:${JSON.stringify(rule.params)}`).join("|")}`}
                />
            </div>
          ) : null}

          </div>

      </main>

      <Footer />

      <Dialog open={saveScreenerOpen} onOpenChange={setSaveScreenerOpen}>
        <DialogContent className="border-border/70 bg-card shadow-xl">
          <DialogHeader>
            <DialogTitle>Simpan preset screener</DialogTitle>
            <DialogDescription>
              Simpan kombinasi filter ini agar bisa digunakan kembali.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama screener</label>
              <Input
                value={screenerName}
                onChange={(event) => setScreenerName(event.target.value)}
                placeholder="Contoh: RSI + Value Large Cap"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <textarea
                value={screenerDescription}
                onChange={(event) => setScreenerDescription(event.target.value)}
                placeholder="Jelaskan preset screener ini."
                className="min-h-[96px] w-full rounded-md border border-border/70 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-[#487b78]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveScreenerOpen(false)}>Batal</Button>
            <Button onClick={handleSaveScreener} disabled={savingScreener || !screenerName.trim()} className="gap-2">
              <Save className="h-4 w-4" />
              {savingScreener ? "Menyimpan…" : "Simpan screener"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageShell>
  )
}
