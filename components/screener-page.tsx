"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bell, BellPlus, ArrowUpDown, Radar, Search, SlidersHorizontal, Star, StarOff, Columns3, Plus, X, ChevronDown, LayoutGrid, BarChart3, TrendingUp } from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TickerTape } from "@/components/ticker-tape"
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
import { Switch } from "@/components/ui/switch"
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
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ScreenerRow = {
  ticker: string
  company: string
  sector: string
  marketCapGroup: "Large" | "Mid" | "Small"
  syariah: boolean
  price: number
  changePct: number
  monthChangePct: number
  ytdChangePct: number
  technicalScore: number
  fundamentalScore: number
  trend: "uptrend" | "sideways" | "downtrend"
  rsi: number
  ma20GapPct: number
  ma50GapPct: number
  pe: number
  pbv: number
  roe: number
  epsGrowth: number
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

const SCREENER_ROWS: ScreenerRow[] = [
  { ticker: "BBCA", company: "Bank Central Asia", sector: "Financials", marketCapGroup: "Large", syariah: false, price: 9725, changePct: 1.83, monthChangePct: 6.4, ytdChangePct: 12.8, technicalScore: 74, fundamentalScore: 78, trend: "uptrend", rsi: 58.4, ma20GapPct: 1.6, ma50GapPct: 4.8, pe: 24.1, pbv: 4.8, roe: 22.4, epsGrowth: 8.7 },
  { ticker: "BMRI", company: "Bank Mandiri", sector: "Financials", marketCapGroup: "Large", syariah: false, price: 6225, changePct: 0.96, monthChangePct: 5.1, ytdChangePct: 11.4, technicalScore: 71, fundamentalScore: 76, trend: "uptrend", rsi: 56.2, ma20GapPct: 1.1, ma50GapPct: 4.2, pe: 13.6, pbv: 2.1, roe: 19.1, epsGrowth: 12.3 },
  { ticker: "BBRI", company: "Bank Rakyat Indonesia", sector: "Financials", marketCapGroup: "Large", syariah: false, price: 5030, changePct: -0.42, monthChangePct: 1.8, ytdChangePct: 4.6, technicalScore: 64, fundamentalScore: 74, trend: "sideways", rsi: 49.8, ma20GapPct: -0.5, ma50GapPct: 2.4, pe: 11.8, pbv: 2.2, roe: 18.3, epsGrowth: 10.8 },
  { ticker: "TLKM", company: "Telkom Indonesia", sector: "Infrastructure", marketCapGroup: "Large", syariah: true, price: 3650, changePct: 1.39, monthChangePct: 4.9, ytdChangePct: 9.7, technicalScore: 69, fundamentalScore: 72, trend: "uptrend", rsi: 57.7, ma20GapPct: 3.1, ma50GapPct: 6.4, pe: 12.9, pbv: 2.3, roe: 17.2, epsGrowth: 7.1 },
  { ticker: "ASII", company: "Astra International", sector: "Industrials", marketCapGroup: "Large", syariah: true, price: 4920, changePct: 0.61, monthChangePct: 2.8, ytdChangePct: 7.2, technicalScore: 67, fundamentalScore: 75, trend: "uptrend", rsi: 54.1, ma20GapPct: 1.4, ma50GapPct: 3.6, pe: 8.9, pbv: 1.2, roe: 14.8, epsGrowth: 6.5 },
  { ticker: "ICBP", company: "Indofood CBP", sector: "Consumer", marketCapGroup: "Large", syariah: true, price: 11400, changePct: -0.87, monthChangePct: -2.3, ytdChangePct: 1.4, technicalScore: 59, fundamentalScore: 73, trend: "sideways", rsi: 47.2, ma20GapPct: -1.7, ma50GapPct: 1.1, pe: 14.2, pbv: 2.0, roe: 13.2, epsGrowth: 5.2 },
  { ticker: "ANTM", company: "Aneka Tambang", sector: "Materials", marketCapGroup: "Large", syariah: true, price: 2010, changePct: 2.45, monthChangePct: 9.6, ytdChangePct: 18.5, technicalScore: 77, fundamentalScore: 66, trend: "uptrend", rsi: 63.8, ma20GapPct: 4.5, ma50GapPct: 8.2, pe: 15.3, pbv: 1.6, roe: 11.4, epsGrowth: 18.1 },
  { ticker: "MDKA", company: "Merdeka Copper Gold", sector: "Materials", marketCapGroup: "Mid", syariah: true, price: 2320, changePct: -1.28, monthChangePct: -6.8, ytdChangePct: -12.4, technicalScore: 55, fundamentalScore: 52, trend: "downtrend", rsi: 42.3, ma20GapPct: -3.8, ma50GapPct: -6.2, pe: 31.5, pbv: 2.9, roe: 6.7, epsGrowth: -4.2 },
  { ticker: "CPIN", company: "Charoen Pokphand Indonesia", sector: "Consumer", marketCapGroup: "Large", syariah: true, price: 4860, changePct: 0.83, monthChangePct: 2.1, ytdChangePct: 5.9, technicalScore: 62, fundamentalScore: 68, trend: "sideways", rsi: 51.4, ma20GapPct: 0.8, ma50GapPct: 2.0, pe: 18.6, pbv: 2.7, roe: 12.6, epsGrowth: 9.4 },
  { ticker: "INDF", company: "Indofood Sukses Makmur", sector: "Consumer", marketCapGroup: "Large", syariah: true, price: 6550, changePct: 1.12, monthChangePct: 3.7, ytdChangePct: 8.8, technicalScore: 66, fundamentalScore: 71, trend: "uptrend", rsi: 55.6, ma20GapPct: 1.2, ma50GapPct: 3.5, pe: 7.4, pbv: 0.9, roe: 11.1, epsGrowth: 8.1 },
  { ticker: "ADRO", company: "Alamtri Resources", sector: "Energy", marketCapGroup: "Large", syariah: true, price: 2890, changePct: -0.69, monthChangePct: -1.9, ytdChangePct: 3.1, technicalScore: 61, fundamentalScore: 70, trend: "sideways", rsi: 48.9, ma20GapPct: -0.7, ma50GapPct: 1.5, pe: 5.8, pbv: 1.1, roe: 21.2, epsGrowth: 4.9 },
  { ticker: "PTBA", company: "Bukit Asam", sector: "Energy", marketCapGroup: "Mid", syariah: true, price: 2710, changePct: 0.37, monthChangePct: 1.4, ytdChangePct: 4.8, technicalScore: 58, fundamentalScore: 69, trend: "sideways", rsi: 46.7, ma20GapPct: -1.1, ma50GapPct: 0.9, pe: 6.3, pbv: 1.3, roe: 19.5, epsGrowth: 3.8 },
  { ticker: "UNTR", company: "United Tractors", sector: "Industrials", marketCapGroup: "Large", syariah: true, price: 24450, changePct: 0.74, monthChangePct: 4.1, ytdChangePct: 10.3, technicalScore: 68, fundamentalScore: 74, trend: "uptrend", rsi: 57.1, ma20GapPct: 1.8, ma50GapPct: 4.1, pe: 6.8, pbv: 1.2, roe: 17.8, epsGrowth: 7.9 },
  { ticker: "EXCL", company: "XL Axiata", sector: "Infrastructure", marketCapGroup: "Mid", syariah: true, price: 2250, changePct: 1.58, monthChangePct: 7.3, ytdChangePct: 14.1, technicalScore: 73, fundamentalScore: 60, trend: "uptrend", rsi: 61.2, ma20GapPct: 3.3, ma50GapPct: 5.7, pe: 17.1, pbv: 1.4, roe: 8.9, epsGrowth: 15.6 },
  { ticker: "SIDO", company: "Industri Jamu Sido Muncul", sector: "Healthcare", marketCapGroup: "Mid", syariah: true, price: 620, changePct: 0.32, monthChangePct: 0.8, ytdChangePct: 2.6, technicalScore: 57, fundamentalScore: 67, trend: "sideways", rsi: 45.8, ma20GapPct: -0.9, ma50GapPct: 1.8, pe: 18.3, pbv: 4.3, roe: 24.6, epsGrowth: 5.5 },
  { ticker: "KLBF", company: "Kalbe Farma", sector: "Healthcare", marketCapGroup: "Large", syariah: true, price: 1560, changePct: -0.64, monthChangePct: -1.1, ytdChangePct: 2.2, technicalScore: 60, fundamentalScore: 70, trend: "sideways", rsi: 48.3, ma20GapPct: -0.3, ma50GapPct: 2.2, pe: 22.4, pbv: 3.4, roe: 15.7, epsGrowth: 6.2 },
  { ticker: "ERAA", company: "Erajaya Swasembada", sector: "Consumer", marketCapGroup: "Mid", syariah: true, price: 484, changePct: 3.42, monthChangePct: 12.6, ytdChangePct: 24.8, technicalScore: 79, fundamentalScore: 64, trend: "uptrend", rsi: 66.9, ma20GapPct: 5.2, ma50GapPct: 9.4, pe: 9.8, pbv: 1.7, roe: 16.8, epsGrowth: 14.7 },
  { ticker: "AMRT", company: "Sumber Alfaria Trijaya", sector: "Consumer", marketCapGroup: "Large", syariah: true, price: 2890, changePct: 1.05, monthChangePct: 6.2, ytdChangePct: 13.6, technicalScore: 72, fundamentalScore: 69, trend: "uptrend", rsi: 59.1, ma20GapPct: 2.6, ma50GapPct: 5.5, pe: 30.4, pbv: 8.1, roe: 18.4, epsGrowth: 13.1 },
  { ticker: "BRIS", company: "Bank Syariah Indonesia", sector: "Financials", marketCapGroup: "Large", syariah: true, price: 2480, changePct: 2.12, monthChangePct: 8.4, ytdChangePct: 17.9, technicalScore: 75, fundamentalScore: 71, trend: "uptrend", rsi: 62.4, ma20GapPct: 3.9, ma50GapPct: 7.6, pe: 17.5, pbv: 2.4, roe: 15.3, epsGrowth: 16.2 },
  { ticker: "MAPI", company: "Mitra Adiperkasa", sector: "Consumer", marketCapGroup: "Mid", syariah: true, price: 1645, changePct: -1.15, monthChangePct: -4.6, ytdChangePct: -7.8, technicalScore: 54, fundamentalScore: 63, trend: "downtrend", rsi: 41.9, ma20GapPct: -2.7, ma50GapPct: -4.4, pe: 12.7, pbv: 1.9, roe: 10.4, epsGrowth: 4.1 },
]

const defaultAlertDraft: AlertDraft = {
  ticker: "",
  type: "masuk-radar",
  threshold: "75",
  isActive: true,
}

const SORT_OPTIONS = [
  "ticker",
  "price",
  "changePct",
  "monthChangePct",
  "ytdChangePct",
  "technicalScore",
  "fundamentalScore",
  "rsi",
  "pe",
  "roe",
  "epsGrowth",
] as const

type SortKey = (typeof SORT_OPTIONS)[number]

const COLUMN_LABELS = {
  ticker: "Saham",
  marketCap: "Mkt Cap",
  sector: "Sector",
  price: "Harga",
  changePct: "Change",
  monthChangePct: "1M Perf",
  ytdChangePct: "YTD Perf",
  rsi: "RSI",
  ma20: "MA20",
  ma50: "MA50",
  trend: "Trend",
  pe: "PE",
  pbv: "PBV",
  roe: "ROE",
  epsGrowth: "EPS YoY",
  action: "Action",
} as const

const COLUMN_TEMPLATES = {
  recommended: ["ticker", "marketCap", "sector", "price", "changePct", "monthChangePct", "ytdChangePct", "rsi", "trend", "pe", "roe", "action"],
  technical: ["ticker", "marketCap", "sector", "price", "changePct", "monthChangePct", "rsi", "ma20", "ma50", "trend", "action"],
  fundamental: ["ticker", "marketCap", "sector", "price", "monthChangePct", "ytdChangePct", "pe", "pbv", "roe", "epsGrowth", "action"],
  all: ["ticker", "marketCap", "sector", "price", "changePct", "monthChangePct", "ytdChangePct", "rsi", "ma20", "ma50", "trend", "pe", "pbv", "roe", "epsGrowth", "action"],
} as const

type ColumnTemplateKey = keyof typeof COLUMN_TEMPLATES
type ColumnId = keyof typeof COLUMN_LABELS
type ColumnGroupId = "overview" | "technical" | "fundamental"

const FIXED_COLUMN_IDS: ColumnId[] = ["ticker", "action"]
const OPTIONAL_COLUMN_IDS: ColumnId[] = ["marketCap", "sector", "price", "changePct", "monthChangePct", "ytdChangePct", "rsi", "ma20", "ma50", "trend", "pe", "pbv", "roe", "epsGrowth"]

const COLUMN_GROUPS: {
  id: ColumnGroupId
  label: string
  addLabel: string
  icon: typeof LayoutGrid
  columnIds: ColumnId[]
}[] = [
  {
    id: "overview",
    label: "Overview",
    addLabel: "Add Overview Column",
    icon: LayoutGrid,
    columnIds: ["marketCap", "sector", "price", "changePct", "monthChangePct", "ytdChangePct", "trend"],
  },
  {
    id: "technical",
    label: "Technical Indicators",
    addLabel: "Add Technical Indicator",
    icon: BarChart3,
    columnIds: ["rsi", "ma20", "ma50"],
  },
  {
    id: "fundamental",
    label: "Fundamental Indicators",
    addLabel: "Add Fundamental Indicator",
    icon: TrendingUp,
    columnIds: ["pe", "pbv", "roe", "epsGrowth"],
  },
]

function getColumnTemplate(template: ColumnTemplateKey): ColumnId[] {
  return [...COLUMN_TEMPLATES[template]]
}

function formatPercent(value: number, digits = 1) {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}

function normalizeStoredColumnIds(columnId: string): ColumnId[] {
  if (columnId === "meta") return ["marketCap", "sector"]
  if (columnId in COLUMN_LABELS) return [columnId as ColumnId]
  return []
}

function trendTone(trend: ScreenerRow["trend"]) {
  if (trend === "uptrend") return "text-emerald-600"
  if (trend === "downtrend") return "text-rose-600"
  return "text-amber-600"
}

function TickerCircleIcon({ ticker }: { ticker: string }) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background">
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
          className="object-contain p-1"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}

export function ScreenerPage() {
  const [search, setSearch] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [marketCapFilter, setMarketCapFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("technicalScore")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [onlyRadar, setOnlyRadar] = useState(false)
  const [onlyBullish, setOnlyBullish] = useState(false)
  const [onlySyariah, setOnlySyariah] = useState(false)
  const [radarTickers, setRadarTickers] = useState<string[]>([])
  const [alerts, setAlerts] = useState<SavedAlert[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertDraft, setAlertDraft] = useState<AlertDraft>(defaultAlertDraft)
  const [columnTemplate, setColumnTemplate] = useState<ColumnTemplateKey>("recommended")
  const [visibleColumnIds, setVisibleColumnIds] = useState<ColumnId[]>(() => getColumnTemplate("recommended"))
  const [columnPickerOpen, setColumnPickerOpen] = useState(false)

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
    window.localStorage.setItem("algosaham-screener-columns", JSON.stringify(visibleColumnIds))
  }, [visibleColumnIds])

  useEffect(() => {
    window.localStorage.setItem("algosaham-screener-column-template", columnTemplate)
  }, [columnTemplate])

  const sectors = Array.from(new Set(SCREENER_ROWS.map((row) => row.sector))).sort()

  const filteredRows = SCREENER_ROWS.filter((row) => {
    const matchesSearch = !search || row.ticker.toLowerCase().includes(search.toLowerCase()) || row.company.toLowerCase().includes(search.toLowerCase())
    const matchesSector = sectorFilter === "all" || row.sector === sectorFilter
    const matchesMarketCap = marketCapFilter === "all" || row.marketCapGroup === marketCapFilter
    const matchesRadar = !onlyRadar || radarTickers.includes(row.ticker)
    const matchesBullish = !onlyBullish || (row.technicalScore >= 70 && row.trend === "uptrend" && row.rsi >= 50)
    const matchesSyariah = !onlySyariah || row.syariah
    return matchesSearch && matchesSector && matchesMarketCap && matchesRadar && matchesBullish && matchesSyariah
  }).sort((a, b) => {
    const aValue = a[sortKey]
    const bValue = b[sortKey]

    if (typeof aValue === "string" && typeof bValue === "string") {
      const result = aValue.localeCompare(bValue)
      return sortDirection === "asc" ? result : -result
    }

    const result = Number(aValue) - Number(bValue)
    return sortDirection === "asc" ? result : -result
  })

  function toggleRadar(ticker: string) {
    setRadarTickers((current) => current.includes(ticker) ? current.filter((item) => item !== ticker) : [...current, ticker])
  }

  function handleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc")
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === "ticker" || nextKey === "pe" ? "asc" : "desc")
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

  function applyColumnTemplate(template: ColumnTemplateKey) {
    setColumnTemplate(template)
    setVisibleColumnIds(getColumnTemplate(template))
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

  const activeOptionalColumns = OPTIONAL_COLUMN_IDS.filter((columnId) => visibleColumnIds.includes(columnId))

  const columns: DataTableColumn<ScreenerRow>[] = [
    {
      id: "ticker",
      headClassName: "min-w-[160px]",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("ticker")}>
          Saham <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cellClassName: "py-2",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <TickerCircleIcon ticker={row.ticker} />
          <Link href={`/analyze-v2?ticker=${row.ticker}`} className="font-ibm-plex-mono text-sm font-semibold tracking-[0.1em] text-foreground hover:text-[#d07225]">
            {row.ticker}
          </Link>
        </div>
      ),
    },
    {
      id: "marketCap",
      headClassName: "min-w-[90px]",
      header: "Mkt Cap",
      cellClassName: "text-sm text-muted-foreground",
      cell: (row) => row.marketCapGroup,
    },
    {
      id: "sector",
      headClassName: "min-w-[120px]",
      header: "Sector",
      cellClassName: "text-sm text-muted-foreground",
      cell: (row) => row.sector,
    },
    {
      id: "price",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("price")}>
          Harga <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (row) => row.price.toLocaleString("id-ID"),
    },
    {
      id: "changePct",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("changePct")}>
          Change <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (row) => (
        <span className={`inline-flex w-full items-center justify-end font-medium ${row.changePct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {formatPercent(row.changePct, 2)}
        </span>
      ),
    },
    {
      id: "monthChangePct",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("monthChangePct")}>
          1M Perf <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (row) => <span className={row.monthChangePct >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatPercent(row.monthChangePct, 1)}</span>,
    },
    {
      id: "ytdChangePct",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("ytdChangePct")}>
          YTD Perf <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (row) => <span className={row.ytdChangePct >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatPercent(row.ytdChangePct, 1)}</span>,
    },
    {
      id: "rsi",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("rsi")}>
          RSI <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (row) => row.rsi.toFixed(1),
    },
    {
      id: "ma20",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: "MA20",
      cell: (row) => <span className={row.ma20GapPct >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatPercent(row.ma20GapPct)}</span>,
    },
    {
      id: "ma50",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: "MA50",
      cell: (row) => <span className={row.ma50GapPct >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatPercent(row.ma50GapPct)}</span>,
    },
    {
      id: "trend",
      header: "Trend",
      cell: (row) => <span className={`capitalize text-sm font-medium ${trendTone(row.trend)}`}>{row.trend}</span>,
    },
    {
      id: "pe",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("pe")}>
          PE <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (row) => `${row.pe.toFixed(1)}x`,
    },
    {
      id: "pbv",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: "PBV",
      cell: (row) => `${row.pbv.toFixed(1)}x`,
    },
    {
      id: "roe",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("roe")}>
          ROE <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (row) => `${row.roe.toFixed(1)}%`,
    },
    {
      id: "epsGrowth",
      headClassName: "text-right",
      cellClassName: "text-right font-ibm-plex-mono",
      header: (
        <button className="inline-flex items-center gap-2" onClick={() => handleSort("epsGrowth")}>
          EPS YoY <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (row) => <span className={row.epsGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatPercent(row.epsGrowth)}</span>,
    },
    {
      id: "action",
      headClassName: "min-w-[96px] text-right",
      cellClassName: "text-right",
      header: "Action",
      cell: (row) => {
        const inRadar = radarTickers.includes(row.ticker)
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant={inRadar ? "secondary" : "ghost"}
              size="icon"
              className={`h-7 w-7 ${inRadar ? "text-[#d07225]" : "text-muted-foreground"}`}
              onClick={() => toggleRadar(row.ticker)}
              aria-label={inRadar ? `Hapus ${row.ticker} dari radar` : `Tambah ${row.ticker} ke radar`}
              title={inRadar ? "Radar aktif" : "Tambah radar"}
            >
              {inRadar ? <Star className="h-3.5 w-3.5 fill-current" /> : <StarOff className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => openAlertDialog(row.ticker)}
              disabled={!inRadar}
              aria-label={`Buat alert untuk ${row.ticker}`}
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
                  <h1 className="text-3xl sm:text-4xl font-bold font-ibm-plex-mono tracking-tight text-balance">Pantau semua saham dalam satu radar</h1>
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground font-mono max-w-2xl">
                    Filter, urutkan, dan tandai saham berdasarkan data fundamental dan teknikal. Alert disimpan lokal untuk versi awal halaman ini.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                Filter & Sort
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className="xl:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari ticker atau nama saham"
                    className="pl-9 bg-background border-border/70 focus-visible:ring-[#d07225]"
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
                    <SelectValue placeholder="Semua market cap" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua market cap</SelectItem>
                    <SelectItem value="Large">Large cap</SelectItem>
                    <SelectItem value="Mid">Mid cap</SelectItem>
                    <SelectItem value="Small">Small cap</SelectItem>
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
                    <SelectItem value="technicalScore:desc">Technical score tertinggi</SelectItem>
                    <SelectItem value="fundamentalScore:desc">Fundamental score tertinggi</SelectItem>
                    <SelectItem value="changePct:desc">Perubahan harian tertinggi</SelectItem>
                    <SelectItem value="rsi:desc">RSI tertinggi</SelectItem>
                    <SelectItem value="pe:asc">PE ratio terendah</SelectItem>
                    <SelectItem value="roe:desc">ROE tertinggi</SelectItem>
                    <SelectItem value="ticker:asc">Ticker A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch checked={onlyBullish} onCheckedChange={setOnlyBullish} />
                    Hanya bullish setup
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch checked={onlyRadar} onCheckedChange={setOnlyRadar} />
                    Hanya radar saya
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch checked={onlySyariah} onCheckedChange={setOnlySyariah} />
                    Hanya syariah
                  </label>
                </div>

                <div className="text-sm text-muted-foreground font-mono">
                  {filteredRows.length} saham tampil
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border/70 bg-background/50 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setColumnPickerOpen((current) => !current)}
                    >
                      <Columns3 className="h-4 w-4" />
                      Pilih kolom
                      <ChevronDown className={`h-4 w-4 transition-transform ${columnPickerOpen ? "rotate-180" : ""}`} />
                    </Button>

                    <Select value={columnTemplate} onValueChange={(value: ColumnTemplateKey) => applyColumnTemplate(value)}>
                      <SelectTrigger className="w-[220px] bg-background border-border/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recommended">Template rekomendasi</SelectItem>
                        <SelectItem value="technical">Template technical</SelectItem>
                        <SelectItem value="fundamental">Template fundamental</SelectItem>
                        <SelectItem value="all">Semua kolom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-muted-foreground xl:max-w-md xl:text-right">
                    Template rekomendasi menampilkan kolom yang paling relevan untuk screening harian.
                  </div>
                </div>

                {columnPickerOpen ? (
                  <div className="grid gap-4 lg:grid-cols-3">
                    {COLUMN_GROUPS.map((group) => {
                      const Icon = group.icon
                      const selectedColumns = group.columnIds.filter((columnId) => visibleColumnIds.includes(columnId))
                      const availableColumns = group.columnIds.filter((columnId) => !visibleColumnIds.includes(columnId))

                      return (
                        <div key={group.id} className="rounded-lg border border-border/70 bg-card p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-[#d07225]" />
                              <div>
                                <div className="text-sm font-medium text-foreground">{group.label}</div>
                                <div className="text-xs text-muted-foreground">{selectedColumns.length} aktif</div>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2">
                                  <Plus className="h-3.5 w-3.5" />
                                  {group.addLabel}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel>{group.addLabel}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {availableColumns.length === 0 ? (
                                  <div className="px-2 py-3 text-xs text-muted-foreground">
                                    Semua kolom di grup ini sudah aktif.
                                  </div>
                                ) : (
                                  availableColumns.map((columnId) => (
                                    <DropdownMenuItem
                                      key={columnId}
                                      onClick={() => toggleColumnVisibility(columnId, true)}
                                      className="flex items-center justify-between gap-3"
                                    >
                                      <span>{COLUMN_LABELS[columnId]}</span>
                                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                    </DropdownMenuItem>
                                  ))
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedColumns.length === 0 ? (
                              <span className="text-xs text-muted-foreground">Belum ada kolom dipilih.</span>
                            ) : (
                              selectedColumns.map((columnId) => (
                                <button
                                  key={columnId}
                                  type="button"
                                  onClick={() => toggleColumnVisibility(columnId, false)}
                                  className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:border-[#d07225]/40 hover:bg-[#d07225]/5"
                                  title={`Hapus kolom ${COLUMN_LABELS[columnId]}`}
                                >
                                  <span>{COLUMN_LABELS[columnId]}</span>
                                  <X className="h-3 w-3 text-muted-foreground" />
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeOptionalColumns.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Belum ada kolom tambahan aktif. Buka Pilih kolom untuk menambah indikator.
                      </span>
                    ) : (
                      activeOptionalColumns.map((columnId) => (
                        <button
                          key={columnId}
                          type="button"
                          onClick={() => setColumnPickerOpen(true)}
                          className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-[#d07225]/40 hover:text-foreground"
                        >
                          {COLUMN_LABELS[columnId]}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          <DataTable
            columns={visibleColumns}
            data={filteredRows}
            getRowId={(row) => row.ticker}
            emptyMessage="Tidak ada saham yang cocok dengan filter saat ini."
            tableClassName="min-w-[1120px]"
            initialPageSize={12}
            pageSizeOptions={[12, 24, 36, 48]}
            paginationResetKey={`${search}|${sectorFilter}|${marketCapFilter}|${sortKey}|${sortDirection}|${onlyRadar}|${onlyBullish}|${onlySyariah}`}
          />

        </div>
      </main>

      <Footer />

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
