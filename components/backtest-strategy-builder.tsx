"use client"

import type React from "react"
import { useState, useRef, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  X,
  Plus,
  ChevronDown,
  Filter,
  TrendingUp,
  BarChart3,
  Shield,
  Calendar,
  Play,
  Save,
  Check,
  Settings,
  Send,
  ChevronRight,
  Edit,
  Sparkles,
  Loader2,
  Zap,
  CheckCircle,
  Copy,
  CheckCheck,
  Info,
  Lock,
} from "lucide-react"
import { AddIndicatorModal } from "@/components/add-indicator-modal"
import { FundamentalIndicatorDropdown } from "@/components/fundamental-indicator-dropdown"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"
import { useUser, useClerk } from "@clerk/nextjs"
import { toast } from "sonner"
import type { BacktestRequest } from "@/lib/api"
import { useUserTier } from "@/context/user-tier-context"
import {
  getTechnicalIndicatorRequiredTier,
  isTechnicalIndicatorAvailableForTier,
  normalizeTechnicalIndicatorTier,
} from "@/lib/technical-indicators"

interface Indicator {
  id: string
  name: string
  type: "fundamental" | "technical"
  params: Record<string, any>
}

interface BacktestStrategyBuilderProps {
  onRunBacktest: (config: BacktestRequest, isInitial?: boolean) => Promise<void>
  backtestResults?: any | null
}

const strategyBuilderSectionHeaderClass =
  "w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"

const strategyBuilderIndicatorSectionContentClass =
  "py-4 pl-4 pr-5 space-y-3 border-l border-[#d07225]/50 ml-[27px] my-2 w-auto"

const strategyBuilderIndicatorCardClass =
  "rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]"

const strategyBuilderIndicatorViewClass =
  "px-4 py-3 flex items-center justify-between gap-3"

const strategyBuilderIndicatorEditClass = "p-3"

const strategyBuilderAddIndicatorButtonClass =
  "w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-[11px] font-mono font-semibold text-foreground shadow-[0_1px_3px_rgba(15,23,42,0.12)] transition-colors hover:border-[#d07225] hover:bg-[#d07225]/5"

type TierBacktestAccess = {
  maxMonths: number
  maxPresetLabel: string
  upgradeHint: string
}

const BACKTEST_ACCESS_BY_TIER: Record<"ritel" | "suhu" | "bandar" | "admin", TierBacktestAccess> = {
  ritel: {
    maxMonths: 6,
    maxPresetLabel: "Last 6 months",
    upgradeHint: "Suhu",
  },
  suhu: {
    maxMonths: 24,
    maxPresetLabel: "Last 2 years",
    upgradeHint: "Bandar",
  },
  bandar: {
    maxMonths: 48,
    maxPresetLabel: "Last 4 years",
    upgradeHint: "Bandar",
  },
  admin: {
    maxMonths: 48,
    maxPresetLabel: "Last 4 years",
    upgradeHint: "Bandar",
  },
}

const backtestPeriodOptions: Array<{ label: string; months: number }> = [
  { label: "Last 1 month", months: 1 },
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last 1 year", months: 12 },
  { label: "Last 2 years", months: 24 },
  { label: "Last 3 years", months: 36 },
  { label: "Last 4 years", months: 48 },
]

type BacktestPeriodMode = "preset" | "custom"

function formatBacktestDurationLabel(months: number) {
  if (months % 12 === 0) {
    const years = months / 12
    return `${years} tahun`
  }

  return `${months} bulan`
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateInput(value: string) {
  if (!value) return null

  const parsedDate = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readNumberField(value: unknown, fieldName: string) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value)
    if (Number.isFinite(parsedValue)) {
      return parsedValue
    }
  }

  throw new Error(`${fieldName} must be a valid number.`)
}

function readOptionalStringArray(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${fieldName} must be an array of strings.`)
  }

  return value
}

function parseBacktestRequestFromJson(input: string): BacktestRequest {
  let parsed: unknown

  try {
    parsed = JSON.parse(input)
  } catch {
    throw new Error("Invalid JSON. Please check the format and try again.")
  }

  const rawConfig =
    isPlainObject(parsed) && isPlainObject(parsed.config)
      ? parsed.config
      : parsed

  if (!isPlainObject(rawConfig)) {
    throw new Error("Backtest config must be a JSON object.")
  }

  const filters = isPlainObject(rawConfig.filters) ? rawConfig.filters : {}
  const backtestConfig = rawConfig.backtestConfig

  if (!isPlainObject(backtestConfig)) {
    throw new Error("Missing `backtestConfig` in the pasted JSON.")
  }

  if (!isPlainObject(backtestConfig.tradingCosts)) {
    throw new Error("Missing `backtestConfig.tradingCosts` in the pasted JSON.")
  }

  if (!isPlainObject(backtestConfig.portfolio)) {
    throw new Error("Missing `backtestConfig.portfolio` in the pasted JSON.")
  }

  if (!isPlainObject(backtestConfig.riskManagement)) {
    throw new Error("Missing `backtestConfig.riskManagement` in the pasted JSON.")
  }

  const fundamentalIndicators = rawConfig.fundamentalIndicators
  const technicalIndicators = rawConfig.technicalIndicators

  if (fundamentalIndicators !== undefined && !Array.isArray(fundamentalIndicators)) {
    throw new Error("`fundamentalIndicators` must be an array.")
  }

  if (technicalIndicators !== undefined && !Array.isArray(technicalIndicators)) {
    throw new Error("`technicalIndicators` must be an array.")
  }

  const parsedFundamentalIndicators = (fundamentalIndicators ?? []).map((indicator: unknown, index: number) => {
    if (!isPlainObject(indicator) || typeof indicator.type !== "string") {
      throw new Error(`fundamentalIndicators[${index}] must include a string \`type\`.`)
    }

    return {
      type: indicator.type,
      min: indicator.min === undefined ? undefined : readNumberField(indicator.min, `fundamentalIndicators[${index}].min`),
      max: indicator.max === undefined ? undefined : readNumberField(indicator.max, `fundamentalIndicators[${index}].max`),
    }
  })

  const parsedTechnicalIndicators = (technicalIndicators ?? []).map((indicator: unknown, index: number) => {
    if (!isPlainObject(indicator) || typeof indicator.type !== "string") {
      throw new Error(`technicalIndicators[${index}] must include a string \`type\`.`)
    }

    return indicator as BacktestRequest["technicalIndicators"][number]
  })

  return {
    backtestId:
      typeof rawConfig.backtestId === "string" && rawConfig.backtestId.trim()
        ? rawConfig.backtestId
        : `backtest_${Date.now()}`,
    filters: {
      marketCap: readOptionalStringArray(filters.marketCap, "filters.marketCap") ?? ["large"],
      syariah: typeof filters.syariah === "boolean" ? filters.syariah : undefined,
      minDailyValue:
        filters.minDailyValue === undefined
          ? undefined
          : readNumberField(filters.minDailyValue, "filters.minDailyValue"),
      tickers: readOptionalStringArray(filters.tickers, "filters.tickers"),
      sectors: readOptionalStringArray(filters.sectors, "filters.sectors"),
    },
    fundamentalIndicators: parsedFundamentalIndicators,
    technicalIndicators: parsedTechnicalIndicators,
    backtestConfig: {
      initialCapital: readNumberField(backtestConfig.initialCapital, "backtestConfig.initialCapital"),
      startDate:
        typeof backtestConfig.startDate === "string" && backtestConfig.startDate.trim()
          ? backtestConfig.startDate
          : (() => {
            throw new Error("`backtestConfig.startDate` must be a non-empty string.")
          })(),
      endDate:
        typeof backtestConfig.endDate === "string" && backtestConfig.endDate.trim()
          ? backtestConfig.endDate
          : (() => {
            throw new Error("`backtestConfig.endDate` must be a non-empty string.")
          })(),
      tradingCosts: {
        brokerFee: readNumberField(backtestConfig.tradingCosts.brokerFee, "backtestConfig.tradingCosts.brokerFee"),
        sellFee: readNumberField(backtestConfig.tradingCosts.sellFee, "backtestConfig.tradingCosts.sellFee"),
        minimumFee: readNumberField(backtestConfig.tradingCosts.minimumFee, "backtestConfig.tradingCosts.minimumFee"),
      },
      portfolio: {
        positionSizePercent: readNumberField(
          backtestConfig.portfolio.positionSizePercent,
          "backtestConfig.portfolio.positionSizePercent",
        ),
        minPositionPercent: readNumberField(
          backtestConfig.portfolio.minPositionPercent,
          "backtestConfig.portfolio.minPositionPercent",
        ),
        maxPositions: readNumberField(backtestConfig.portfolio.maxPositions, "backtestConfig.portfolio.maxPositions"),
      },
      riskManagement: {
        stopLossPercent: readNumberField(
          backtestConfig.riskManagement.stopLossPercent,
          "backtestConfig.riskManagement.stopLossPercent",
        ),
        takeProfitPercent: readNumberField(
          backtestConfig.riskManagement.takeProfitPercent,
          "backtestConfig.riskManagement.takeProfitPercent",
        ),
        maxHoldingDays: readNumberField(
          backtestConfig.riskManagement.maxHoldingDays,
          "backtestConfig.riskManagement.maxHoldingDays",
        ),
      },
    },
  }
}

export function BacktestStrategyBuilderContent({ onRunBacktest, backtestResults }: BacktestStrategyBuilderProps) {
  const { isSignedIn, isLoaded } = useUser()
  const { openSignIn } = useClerk()
  const { tier, refreshTier } = useUserTier()
  const searchParams = useSearchParams()
  const strategyId = searchParams.get('strategyId')
  const [loadedStrategyId, setLoadedStrategyId] = useState<string | null>(null)
  const [marketCaps, setMarketCaps] = useState<string[]>(["large", "mid"])
  const [stockType, setStockType] = useState("All Stocks")
  const [minDailyValue, setMinDailyValue] = useState<number>(1000000000)
  const [sectors, setSectors] = useState<string[]>([])
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false)
  const [selectedTickers, setSelectedTickers] = useState<string[]>([])
  const [tickerOptions, setTickerOptions] = useState<{ value: string; label: string; sector?: string; marketCap?: number }[]>([])
  const [tickerDropdownOpen, setTickerDropdownOpen] = useState(false)
  const [tickerSearch, setTickerSearch] = useState("")
  const [isLoadingTickers, setIsLoadingTickers] = useState(false)
  const [tickersLoaded, setTickersLoaded] = useState(false)
  const [fundamentalIndicators, setFundamentalIndicators] = useState<Indicator[]>([])
  const [technicalIndicators, setTechnicalIndicators] = useState<Indicator[]>([
    { id: "1", name: "RSI", type: "technical", params: { period: 14, oversold: 30, overbought: 70 } },
  ])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"fundamental" | "technical">("fundamental")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showJsonConfigModal, setShowJsonConfigModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [runMenuOpen, setRunMenuOpen] = useState(false)
  const [savedStrategyName, setSavedStrategyName] = useState("")
  const [strategyName, setStrategyName] = useState("")
  const [strategyDescription, setStrategyDescription] = useState("")
  const [jsonConfigInput, setJsonConfigInput] = useState("")
  const [jsonConfigError, setJsonConfigError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isRunningJsonConfig, setIsRunningJsonConfig] = useState(false)
  const [pendingRunBacktest, setPendingRunBacktest] = useState(false)
  const [saveWithBacktest, setSaveWithBacktest] = useState(false)
  const [editingIndicators, setEditingIndicators] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    filters: false,
    fundamental: false,
    technical: false,
    risk: false,
    backtest: false,
  })
  const [isTutorialActive, setIsTutorialActive] = useState(false)
  const [hasVisited, setHasVisited] = useState<boolean | null>(null)

  // Backtest config states
  const [stopLoss, setStopLoss] = useState<number | string>(7)
  const [takeProfit, setTakeProfit] = useState<number | string>(15)
  const [maxHoldingPeriod, setMaxHoldingPeriod] = useState<string>("14")
  const [startDate, setStartDate] = useState<string>("2024-06-01")
  const [endDate, setEndDate] = useState<string>("2024-08-31")
  const [initialCapital, setInitialCapital] = useState<number>(100000000)

  // Backtest preset state
  const [backtestPeriod, setBacktestPeriod] = useState<string>("Last 1 year")
  const [backtestPeriodMode, setBacktestPeriodMode] = useState<BacktestPeriodMode>("preset")
  const normalizedUserTier = tier.toLowerCase() as keyof typeof BACKTEST_ACCESS_BY_TIER
  const technicalIndicatorTier = normalizeTechnicalIndicatorTier(tier)
  const tierBacktestAccess = BACKTEST_ACCESS_BY_TIER[normalizedUserTier] ?? BACKTEST_ACCESS_BY_TIER.ritel
  const isBandarUser = normalizedUserTier === "bandar" || normalizedUserTier === "admin"
  const backtestPeriodUpgradeTitle = tierBacktestAccess.upgradeHint === "Suhu" ? "Fitur Suhu" : "Fitur Bandar"
  const backtestPeriodLimitMessage = `Periode backtest di atas ${formatBacktestDurationLabel(tierBacktestAccess.maxMonths)} hanya tersedia untuk tier ${tierBacktestAccess.upgradeHint} ke atas.`

  const getTechnicalIndicatorGateCopy = useCallback((indicatorName: string) => {
    const requiredTier = getTechnicalIndicatorRequiredTier(indicatorName)
    const formattedTier = requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)

    return {
      title: requiredTier === "suhu" ? "Fitur Suhu" : "Fitur Bandar",
      message: `Indikator ${indicatorName} hanya tersedia untuk tier ${formattedTier} ke atas.`,
    }
  }, [])

  const filterTechnicalIndicatorsForTier = useCallback(
    (indicators: Indicator[], options?: { notify?: boolean }) => {
      const allowedIndicators = indicators.filter((indicator) =>
        isTechnicalIndicatorAvailableForTier(indicator.name, technicalIndicatorTier),
      )

      if (options?.notify && allowedIndicators.length !== indicators.length) {
        const removedNames = indicators
          .filter((indicator) => !isTechnicalIndicatorAvailableForTier(indicator.name, technicalIndicatorTier))
          .map((indicator) => indicator.name)

        toast.info("Akses indikator teknikal", {
          description: `Indikator berikut tidak tersedia untuk tier Anda dan dilewati: ${removedNames.join(", ")}.`,
        })
      }

      return allowedIndicators
    },
    [technicalIndicatorTier],
  )

  const clampBacktestRangeForTier = useCallback(
    (nextStartDate: string, nextEndDate: string, options?: { notify?: boolean }) => {
      const parsedStartDate = parseDateInput(nextStartDate)
      const parsedEndDate = parseDateInput(nextEndDate)

      if (!parsedStartDate || !parsedEndDate) {
        return { startDate: nextStartDate, endDate: nextEndDate, adjusted: false }
      }

      const earliestAllowedStart = new Date(parsedEndDate)
      earliestAllowedStart.setMonth(earliestAllowedStart.getMonth() - tierBacktestAccess.maxMonths)

      if (parsedStartDate >= earliestAllowedStart) {
        return { startDate: nextStartDate, endDate: nextEndDate, adjusted: false }
      }

      if (options?.notify) {
        toast.info(backtestPeriodUpgradeTitle, {
          description: backtestPeriodLimitMessage,
        })
      }

      return {
        startDate: formatDateInput(earliestAllowedStart),
        endDate: formatDateInput(parsedEndDate),
        adjusted: true,
      }
    },
    [backtestPeriodLimitMessage, tierBacktestAccess.maxMonths],
  )

  const applyPreset = (period: string) => {
    const selectedOption = backtestPeriodOptions.find((option) => option.label === period)

    if (!selectedOption) {
      return
    }

    if (selectedOption.months > tierBacktestAccess.maxMonths) {
      toast.info(backtestPeriodUpgradeTitle, {
        description: backtestPeriodLimitMessage,
      })
      applyPreset(tierBacktestAccess.maxPresetLabel)
      return
    }

    setBacktestPeriodMode("preset")
    setBacktestPeriod(period)
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - selectedOption.months)

    setEndDate(formatDateInput(end))
    setStartDate(formatDateInput(start))
  }

  // Initialize with default preset
  useEffect(() => {
    applyPreset(tierBacktestAccess.maxPresetLabel)
  }, [tierBacktestAccess.maxPresetLabel])

  useEffect(() => {
    const { startDate: clampedStartDate, adjusted } = clampBacktestRangeForTier(startDate, endDate)

    if (adjusted) {
      setStartDate(clampedStartDate)
    }

    const selectedOption = backtestPeriodOptions.find((option) => option.label === backtestPeriod)
    if (selectedOption && selectedOption.months > tierBacktestAccess.maxMonths) {
      setBacktestPeriod(tierBacktestAccess.maxPresetLabel)
    }
  }, [backtestPeriod, clampBacktestRangeForTier, endDate, startDate, tierBacktestAccess.maxMonths, tierBacktestAccess.maxPresetLabel])

  const marketCapOptions = ["small", "mid", "large"]
  const sectorOptions = [
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
  ]

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectorDropdownRef = useRef<HTMLDivElement>(null)
  const tickerDropdownRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  const prepareBacktestConfigForExecution = useCallback(
    (config: BacktestRequest, options?: { notify?: boolean }) => {
      const allowedRange = clampBacktestRangeForTier(
        config.backtestConfig.startDate,
        config.backtestConfig.endDate,
        { notify: options?.notify },
      )

      return allowedRange.adjusted
        ? {
          ...config,
          backtestConfig: {
            ...config.backtestConfig,
            startDate: allowedRange.startDate,
            endDate: allowedRange.endDate,
          },
        }
        : config
    },
    [clampBacktestRangeForTier],
  )

  const executeBacktestConfig = useCallback(async (
    config: BacktestRequest,
    options?: { skipAuthCheck?: boolean; preparedConfig?: BacktestRequest },
  ) => {
    const skipAuthCheck = options?.skipAuthCheck ?? false

    if (!skipAuthCheck) {
      if (!isLoaded) return false
      if (!isSignedIn) {
        openSignIn()
        return false
      }
    }

    const configToRun = options?.preparedConfig ?? prepareBacktestConfigForExecution(config, { notify: true })

    try {
      await onRunBacktest(configToRun, skipAuthCheck)
      scrollToBottom()
      refreshTier()
      return true
    } catch (error) {
      console.error("Backtest failed:", error)
      const msg = error instanceof Error ? error.message : ""
      const isQuotaError = msg.toLowerCase().includes("limit reached") || msg.toLowerCase().includes("upgrade your plan")
      if (!isQuotaError) {
        toast.error("Backtest Failed", {
          description: msg || "An unknown error occurred",
        })
      }
      return false
    }
  }, [isLoaded, isSignedIn, onRunBacktest, openSignIn, prepareBacktestConfigForExecution, refreshTier])

  const runLoadedStrategyConfig = useCallback(async (config: BacktestRequest) => {
    const configToRun = prepareBacktestConfigForExecution(config, { notify: true })
    await executeBacktestConfig(configToRun, { skipAuthCheck: true, preparedConfig: configToRun })
  }, [executeBacktestConfig, prepareBacktestConfigForExecution])

  // Close sector dropdown when clicking outside
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target as Node)) {
        setSectorDropdownOpen(false)
      }
      if (tickerDropdownRef.current && !tickerDropdownRef.current.contains(event.target as Node)) {
        setTickerDropdownOpen(false)
      }
    }

    if (sectorDropdownOpen || tickerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sectorDropdownOpen, tickerDropdownOpen])

  // Check if user has visited before
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasVisitedBefore = localStorage.getItem("algosaham_has_visited") === "true"
      const isDesktop = window.innerWidth >= 1024

      setHasVisited(hasVisitedBefore)

      // If first time visitor AND on desktop, set tutorial as active
      if (!hasVisitedBefore && isDesktop) {
        setIsTutorialActive(true)
      }
    }
  }, [])

  // Auto-run backtest on page load without using quota
  useEffect(() => {
    // We only want to run initial backtest if we haven't just been forwarded from an edit request
    if (!strategyId) {
      handleRunBacktest(true)
    }
  }, [strategyId])

  // Fetch specific strategy config if passing strategyId
  useEffect(() => {
    async function loadStrategyFromUrl() {
      if (!strategyId || loadedStrategyId === strategyId || !isLoaded || !isSignedIn) return

      try {
        // 1. Try to load from instantaneous sessionStorage prefetch
        const prefetchKey = `strategy_prefetch_${strategyId}`
        const prefetched = sessionStorage.getItem(prefetchKey)

        if (prefetched) {
          const data = JSON.parse(prefetched)
          if (data.config) {
            applyStrategyFromConfig(data.config)
            toast.success(`Loaded strategy: ${data.name}`)
            setStrategyName(data.name)
            setStrategyDescription(data.description || "")
            setIsPrivate(data.isPrivate || false)
            void runLoadedStrategyConfig(data.config)
          }
          sessionStorage.removeItem(prefetchKey)
          setLoadedStrategyId(strategyId)
          return
        }

        // 2. Fall back to network fetch if not found in sessionStorage
        const response = await fetch(`/api/strategies/${strategyId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.strategy?.config) {
            applyStrategyFromConfig(data.strategy.config)
            toast.success(`Loaded strategy: ${data.strategy.name}`)

            // set local strategy metadata so they can save or edit easily
            setStrategyName(data.strategy.name)
            setStrategyDescription(data.strategy.description || "")
            setIsPrivate(data.strategy.isPrivate || false)
            void runLoadedStrategyConfig(data.strategy.config)
          }
        }
      } catch (error) {
        console.error("Failed to load strategy from URL:", error)
      } finally {
        setLoadedStrategyId(strategyId)
      }
    }

    loadStrategyFromUrl()
  }, [strategyId, isLoaded, isSignedIn, loadedStrategyId, runLoadedStrategyConfig])

  const toggleMarketCap = (cap: string) => {
    setMarketCaps((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]))
  }

  const toggleSector = (sector: string) => {
    setSectors((prev) => (prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]))
  }

  const toggleTicker = (ticker: string) => {
    setSelectedTickers((prev) => (prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]))
  }

  // Lazy-load tickers from database when dropdown is opened
  const fetchTickers = async () => {
    if (tickersLoaded || isLoadingTickers) return

    setIsLoadingTickers(true)
    try {
      const response = await fetch("/api/stocks/tickers")
      const data = await response.json()
      if (data.tickers) {
        setTickerOptions(data.tickers)
        setTickersLoaded(true)
      }
    } catch (error) {
      console.error("Failed to fetch tickers:", error)
    } finally {
      setIsLoadingTickers(false)
    }
  }

  const removeIndicator = (id: string, type: "fundamental" | "technical") => {
    if (type === "fundamental") {
      setFundamentalIndicators((prev) => prev.filter((i) => i.id !== id))
    } else {
      setTechnicalIndicators((prev) => prev.filter((i) => i.id !== id))
    }
    setEditingIndicators((prev) => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const addIndicator = (indicator: Omit<Indicator, "id">) => {
    if (indicator.type === "technical" && !isTechnicalIndicatorAvailableForTier(indicator.name, technicalIndicatorTier)) {
      const gateCopy = getTechnicalIndicatorGateCopy(indicator.name)
      toast.info(gateCopy.title, {
        description: gateCopy.message,
      })
      return
    }

    const newIndicator = { ...indicator, id: Date.now().toString() }
    if (indicator.type === "fundamental") {
      setFundamentalIndicators((prev) => [...prev, newIndicator])
    } else {
      setTechnicalIndicators((prev) => [...prev, newIndicator])
    }
  }

  const toggleEditMode = (id: string) => {
    setEditingIndicators((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const updateIndicatorParam = (id: string, type: "fundamental" | "technical", paramKey: string, value: any) => {
    if (type === "fundamental") {
      setFundamentalIndicators((prev) =>
        prev.map((indicator) =>
          indicator.id === id ? { ...indicator, params: { ...indicator.params, [paramKey]: value } } : indicator,
        ),
      )
    } else {
      setTechnicalIndicators((prev) =>
        prev.map((indicator) =>
          indicator.id === id ? { ...indicator, params: { ...indicator.params, [paramKey]: value } } : indicator,
        ),
      )
    }
  }

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSaveStrategy = async (runBacktest = false) => {
    if (!strategyName.trim()) return

    setIsSaving(true)
    setPendingRunBacktest(runBacktest)
    try {
      const config = buildBacktestConfig()
      const response = await fetch("/api/strategies/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: strategyName,
          description: strategyDescription,
          config,
          backtestResults,
          isPrivate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save strategy")
      }

      const result = await response.json()
      if (result.success) {
        setSavedStrategyName(strategyName)
        setShowSaveModal(false)
        setStrategyName("")
        setStrategyDescription("")
        setShowSuccessModal(true)

        if (runBacktest) {
          handleRunBacktest(true)
        }
      } else {
        throw new Error(result.error || "Failed to save strategy")
      }
    } catch (error) {
      console.error("Save strategy error:", error)
      toast.error("Failed to save strategy", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Map indicator names to API types
  const fundamentalTypeMap: Record<string, string> = {
    "PE Ratio": "PE_RATIO",
    "PBV": "PBV",
    "ROE": "ROE",
    "DE Ratio": "DE_RATIO",
    "ROA": "ROA",
    "NPM": "NPM",
    "EPS": "EPS"
  }

  const mapTechnicalIndicator = (ind: Indicator) => {
    const cleanParams: Record<string, number> = {}
    Object.entries(ind.params).forEach(([k, v]) => {
      cleanParams[k] = v === "" ? 0 : Number(v)
    })

    switch (ind.name) {
      case "SMA Crossover":
        return { type: "SMA_CROSSOVER", shortPeriod: cleanParams.shortPeriod, longPeriod: cleanParams.longPeriod }
      case "SMA Trend":
        return { type: "SMA_TREND", shortPeriod: cleanParams.shortPeriod, longPeriod: cleanParams.longPeriod }
      case "RSI":
        return { type: "RSI", period: cleanParams.period, oversold: cleanParams.oversold, overbought: cleanParams.overbought }
      case "MACD":
        return { type: "MACD", fastPeriod: cleanParams.fastPeriod, slowPeriod: cleanParams.slowPeriod, signalPeriod: cleanParams.signalPeriod }
      case "Bollinger Bands":
        return { type: "BOLLINGER_BANDS", period: cleanParams.period, stdDev: cleanParams.stdDev }
      case "ATR":
        return { type: "ATR", period: cleanParams.period }
      case "Volatility Breakout":
        return { type: "VOLATILITY_BREAKOUT", period: cleanParams.period, multiplier: cleanParams.multiplier }
      case "Volume SMA":
        return { type: "VOLUME_SMA", period: cleanParams.period, threshold: cleanParams.threshold }
      case "OBV":
        return { type: "OBV", period: cleanParams.period }
      case "VWAP":
        return { type: "VWAP", period: cleanParams.period }
      case "Volume Price Trend":
        return { type: "VOLUME_PRICE_TREND", period: cleanParams.period }
      default:
        return { type: ind.name.toUpperCase().replace(/\s+/g, "_"), ...cleanParams }
    }
  }

  const buildBacktestConfig = (): BacktestRequest => {
    const allowedRange = clampBacktestRangeForTier(startDate, endDate)
    const allowedTechnicalIndicators = filterTechnicalIndicatorsForTier(technicalIndicators)

    return {
      backtestId: `backtest_${Date.now()}`,
      filters: {
        marketCap: marketCaps.length > 0 ? marketCaps : ["large"],
        syariah: stockType === "Syariah Only",
        minDailyValue: minDailyValue,
        tickers: selectedTickers,
        sectors: sectors.length > 0 ? sectors : undefined,
      },
      fundamentalIndicators: fundamentalIndicators.map((ind) => ({
        type: fundamentalTypeMap[ind.name] || ind.name.toUpperCase().replace(/\s+/g, "_"),
        min: ind.params.min === "" ? undefined : Number(ind.params.min),
        max: ind.params.max === "" ? undefined : Number(ind.params.max),
      })),
      technicalIndicators: allowedTechnicalIndicators.map(mapTechnicalIndicator),
      backtestConfig: {
        initialCapital,
        startDate: allowedRange.startDate,
        endDate: allowedRange.endDate,
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
          stopLossPercent: Number(stopLoss),
          takeProfitPercent: Number(takeProfit),
          maxHoldingDays: maxHoldingPeriod === "no-limit" ? 999999 : Number.parseInt(maxHoldingPeriod),
        },
      },
    }
  }

  // Copy backtest configuration to clipboard
  const handleCopyConfig = async () => {
    const config = buildBacktestConfig()
    const jsonString = JSON.stringify(config, null, 2)

    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Config copied to clipboard!', {
        description: 'You can now paste and analyze the JSON configuration.',
      })
    } catch (err) {
      console.error('Failed to copy config:', err)
      toast.error('Failed to copy config', {
        description: 'Please try again or check your browser permissions.',
      })
    }
  }

  const handleRunBacktest = async (isInitial = false) => {
    // If called from event handler, isInitial will be an event object. Ensure it's explicitly boolean true.
    const skipAuthCheck = typeof isInitial === 'boolean' && isInitial

    const config = buildBacktestConfig()
    await executeBacktestConfig(config, { skipAuthCheck })
  }



  const formatIndicatorParams = (params: Record<string, any>) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")
  }

  // Helper to map API technical indicator type to UI name
  const mapApiTypeToUiName = (type: string): string => {
    const map: Record<string, string> = {
      "SMA_CROSSOVER": "SMA Crossover",
      "SMA_TREND": "SMA Trend",
      "EMA_CROSSOVER": "EMA Crossover",
      "RSI": "RSI",
      "MACD": "MACD",
      "STOCHASTIC": "Stochastic",
      "BOLLINGER_BANDS": "Bollinger Bands",
      "ATR": "ATR",
      "VOLATILITY_BREAKOUT": "Volatility Breakout",
      "VOLUME_SMA": "Volume SMA",
      "OBV": "OBV",
      "VWAP": "VWAP",
      "VOLUME_PRICE_TREND": "Volume Price Trend",
      "ACCUMULATION_BASE": "Accumulation Base",
      "BASE_BREAKOUT": "Base Breakout",
      "VOLUME_DRY_UP": "Volume Dry Up",
      "CLIMAX_VOLUME": "Climax Volume",
      "ACCUMULATION_DISTRIBUTION": "Accumulation Distribution",
      "ADX": "ADX",
      "PARABOLIC_SAR": "Parabolic SAR",
      "SUPERTREND": "Supertrend",
      "PIVOT_POINTS": "Pivot Points",
      "DONCHIAN_CHANNEL": "Donchian Channel",
      "KELTNER_CHANNEL": "Keltner Channel",
      "DOJI": "Doji",
      "HAMMER": "Hammer",
      "INVERTED_HAMMER": "Inverted Hammer",
      "BULLISH_MARUBOZU": "Bullish Marubozu",
      "BULLISH_ENGULFING": "Bullish Engulfing",
      "BULLISH_HARAMI": "Bullish Harami",
      "PIERCING_LINE": "Piercing Line",
      "TWEEZER_BOTTOM": "Tweezer Bottom",
      "MORNING_STAR": "Morning Star",
      "THREE_WHITE_SOLDIERS": "Three White Soldiers",
      "THREE_INSIDE_UP": "Three Inside Up",
      "RISING_THREE_METHODS": "Rising Three Methods",
      "FALLING_WEDGE": "Falling Wedge",
      "DOUBLE_BOTTOM": "Double Bottom",
      "BULL_FLAG": "Bull Flag",
      "ASCENDING_TRIANGLE": "Ascending Triangle",
      "CUP_AND_HANDLE": "Cup and Handle",
      "INVERSE_HEAD_SHOULDERS": "Inverse Head Shoulders",
      "ROUNDING_BOTTOM": "Rounding Bottom",
      "BULL_FLAG_IMMINENT": "Bull Flag Imminent",
      "FALLING_WEDGE_IMMINENT": "Falling Wedge Imminent",
      "DOUBLE_BOTTOM_IMMINENT": "Double Bottom Imminent",
      "ASCENDING_TRIANGLE_IMMINENT": "Ascending Triangle Imminent",
      "FOREIGN_FLOW": "Foreign Flow",
      "FOREIGN_REVERSAL": "Foreign Reversal",
      "ARA_RECOVERY": "ARA Recovery",
      "ARB_RECOVERY": "ARB Recovery",
      "ARA_BREAKOUT": "ARA Breakout",
      "VOLATILITY_REGIME": "Volatility Regime",
      "CALENDAR_EFFECT": "Calendar Effect",
      "SECTOR_RELATIVE_STRENGTH": "Sector Relative Strength",
    }
    return map[type] || type
  }

  // Helper to map API fundamental type to UI name
  const mapApiFundamentalTypeToUiName = (type: string): string => {
    const map: Record<string, string> = {
      "PE_RATIO": "PE Ratio",
      "PBV": "PBV",
      "ROE": "ROE",
      "DE_RATIO": "DE Ratio",
      "ROA": "ROA",
      "NPM": "NPM",
      "EPS": "EPS"
    }
    return map[type] || type
  }

  const applyStrategyFromConfig = (config: BacktestRequest) => {
    if (config.filters) {
      if (config.filters.marketCap) setMarketCaps(config.filters.marketCap)
      if (config.filters.syariah !== undefined) setStockType(config.filters.syariah ? "Syariah Only" : "All Stocks")
      if (config.filters.tickers) setSelectedTickers(config.filters.tickers)
      if (config.filters.minDailyValue) setMinDailyValue(config.filters.minDailyValue)
      if (config.filters.sectors) setSectors(config.filters.sectors)
    }

    if (config.fundamentalIndicators) {
      const newFundamentalIndicators: Indicator[] = config.fundamentalIndicators.map((ind, idx) => ({
        id: `fund_auto_${Date.now()}_${idx}`,
        name: mapApiFundamentalTypeToUiName(ind.type),
        type: "fundamental",
        params: { min: ind.min, max: ind.max }
      }))
      setFundamentalIndicators(newFundamentalIndicators)
    }

    if (config.technicalIndicators) {
      const newTechnicalIndicators: Indicator[] = config.technicalIndicators.map((ind, idx) => {
        const { type, ...params } = ind
        return {
          id: `tech_auto_${Date.now()}_${idx}`,
          name: mapApiTypeToUiName(type),
          type: "technical",
          params: params
        }
      })
      setTechnicalIndicators(filterTechnicalIndicatorsForTier(newTechnicalIndicators, { notify: true }))
    }

    if (config.backtestConfig) {
      const allowedRange = clampBacktestRangeForTier(
        config.backtestConfig.startDate,
        config.backtestConfig.endDate,
      )

      setInitialCapital(config.backtestConfig.initialCapital)
      setStartDate(allowedRange.startDate)
      setEndDate(allowedRange.endDate)
      setBacktestPeriod("")
      setBacktestPeriodMode("custom")
      if (config.backtestConfig.riskManagement) {
        setStopLoss(config.backtestConfig.riskManagement.stopLossPercent)
        setTakeProfit(config.backtestConfig.riskManagement.takeProfitPercent)
        setMaxHoldingPeriod(config.backtestConfig.riskManagement.maxHoldingDays.toString())
      }
    }
    scrollToBottom()
  }

  const handleRunJsonConfig = async () => {
    setJsonConfigError("")
    setIsRunningJsonConfig(true)

    try {
      const parsedConfig = parseBacktestRequestFromJson(jsonConfigInput)
      const configToRun = prepareBacktestConfigForExecution(parsedConfig, { notify: true })

      applyStrategyFromConfig(configToRun)

      const didRun = await executeBacktestConfig(configToRun, { preparedConfig: configToRun })

      if (didRun) {
        setShowJsonConfigModal(false)
        setJsonConfigInput("")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to run the pasted JSON config."
      setJsonConfigError(message)
      toast.error("Invalid JSON config", {
        description: message,
      })
    } finally {
      setIsRunningJsonConfig(false)
    }
  }

  const openDialogFromRunMenu = useCallback((openDialog: () => void) => {
    setRunMenuOpen(false)

    window.setTimeout(() => {
      openDialog()
    }, 0)
  }, [])

  const handleSaveAndRunMenuSelect = useCallback(() => {
    if (isLoaded && !isSignedIn) {
      setSaveWithBacktest(true)
      setRunMenuOpen(false)
      openSignIn()
      return
    }

    setSaveWithBacktest(true)
    openDialogFromRunMenu(() => setShowSaveModal(true))
  }, [isLoaded, isSignedIn, openDialogFromRunMenu, openSignIn])

  const handleJsonConfigMenuSelect = useCallback(() => {
    openDialogFromRunMenu(() => setShowJsonConfigModal(true))
  }, [openDialogFromRunMenu])



  const handleTutorialStart = () => {
    setIsTutorialActive(true)
  }

  const handleTutorialComplete = () => {
    setIsTutorialActive(false)
  }

  useEffect(() => {
    setTechnicalIndicators((prev) => filterTechnicalIndicatorsForTier(prev))
  }, [filterTechnicalIndicatorsForTier])

  return (
    <div className="h-full flex flex-col relative">
      <Tabs defaultValue="strategy" className="flex-1 flex flex-col min-h-0">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between bg-card">
          <TabsList className="h-9">
            <TabsTrigger value="strategy" className="text-xs font-mono font-semibold gap-1.5 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Settings className="h-3.5 w-3.5" />
              Builder
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="text-xs font-mono font-semibold gap-1.5 text-slate-500 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Agent
              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-500">
                Soon
              </span>
            </TabsTrigger>
          </TabsList>
          <OnboardingTutorial onComplete={handleTutorialComplete} onStart={handleTutorialStart} />
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
          <div className="flex-1 p-6">
            <div className="relative mx-auto flex h-full w-full max-w-xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(145deg,#fff9f2_0%,#ffffff_45%,#f5f7fb_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#d07225]/50 to-transparent" />
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d07225]/20 bg-white/80 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#b76421] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                AI Chatbot
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-3xl font-semibold tracking-tight text-slate-900">Coming Soon</h3>
                  <p className="max-w-lg text-sm leading-7 text-slate-600">
                    We&apos;re redesigning the backtest assistant to be faster, simpler, and better connected to the builder.
                    For now, strategy creation stays focused in the manual builder on this page.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                    <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">Temporarily unavailable</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                    <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-slate-500">What to use</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">Builder tab for filters, indicators, and backtests</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200/80 pt-4">
                <div className="flex gap-2">
                  <Input
                    value=""
                    readOnly
                    disabled
                    placeholder="Ask the agent to build a strategy..."
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    disabled
                    className="bg-slate-300 text-slate-500 hover:bg-slate-300"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="strategy" className="flex-1 flex flex-col m-0 overflow-hidden bg-card">
          <SidebarContent ref={scrollContainerRef} className="gap-0">
            {/* Stock Filters */}
            <SidebarGroup className="p-0" data-tutorial="stock-filters">
              <button
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                onClick={() => toggleSection("filters")}
              >
                <div className="flex items-center gap-2.5">
                  <Filter className="h-4 w-4 flex-shrink-0" style={{ color: "#d07225" }} />
                  <span className="text-[13px] font-mono font-semibold text-foreground">Stock Filters</span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${collapsedSections.filters ? "-rotate-90" : ""}`} />
              </button>
              {!collapsedSections.filters && (
                <SidebarGroupContent className="py-4 pl-4 pr-5 space-y-4 border-l border-[#d07225]/50 ml-[27px] my-2 w-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Market Cap</Label>
                      <div className="flex flex-wrap gap-1">
                        {marketCapOptions.map((cap) => (
                          <button
                            key={cap}
                            onClick={() => toggleMarketCap(cap)}
                            className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-all ${marketCaps.includes(cap)
                              ? "bg-[#d07225]/10 border-[#d07225]/40 text-[#d07225]"
                              : "bg-transparent border-slate-200 text-muted-foreground hover:border-slate-300 hover:text-foreground"
                              }`}
                          >
                            {cap.charAt(0).toUpperCase() + cap.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Type</Label>
                      <div className="flex flex-wrap gap-1">
                        {["All Stocks", "Syariah Only"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setStockType(type)}
                            className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-all ${stockType === type
                              ? "bg-[#d07225]/10 border-[#d07225]/40 text-[#d07225]"
                              : "bg-transparent border-slate-200 text-muted-foreground hover:border-slate-300 hover:text-foreground"
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>



                  <div ref={tickerDropdownRef}>
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Kode Saham</Label>
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="w-full justify-between h-9 px-3 font-normal bg-white border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 font-mono"
                        onClick={() => {
                          setTickerDropdownOpen(!tickerDropdownOpen)
                          if (!tickerDropdownOpen) fetchTickers()
                        }}
                      >
                        <span className="text-sm text-foreground truncate">
                          {selectedTickers.length === 0
                            ? "Pilih kode saham..."
                            : selectedTickers.length === 1
                              ? tickerOptions.find((t) => t.value === selectedTickers[0])?.label || selectedTickers[0]
                              : `${selectedTickers.length} tickers selected`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                      </Button>
                      {tickerDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-md max-h-60 overflow-hidden flex flex-col">
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Search tickers..."
                              className="h-8 text-xs font-mono"
                              value={tickerSearch}
                              onChange={(e) => setTickerSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto max-h-[200px]">
                            {isLoadingTickers ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                              </div>
                            ) : tickerOptions.length === 0 ? (
                              <div className="py-2 px-3 text-sm text-muted-foreground">No tickers found</div>
                            ) : (
                              tickerOptions
                                .filter(t => {
                                  // Text search filter
                                  const searchMatch = !tickerSearch ||
                                    t.label.toLowerCase().includes(tickerSearch.toLowerCase()) ||
                                    t.value.toLowerCase().includes(tickerSearch.toLowerCase())

                                  if (!searchMatch) return false

                                  // Sector filter
                                  const sectorMatch = sectors.length === 0 || (t.sector && sectors.includes(t.sector))
                                  if (!sectorMatch) return false

                                  // Market Cap filter
                                  if (marketCaps.length === 0) return true
                                  // If no market cap data, assume it matches if filter is permissive,
                                  // but usually better to hide or show. Let's show if marketCap is missing to avoid blocking everything (or handle specifically).
                                  // Logic:
                                  // Small: < 2T
                                  // Mid: 2T - 10T
                                  // Large: > 10T
                                  // Values in DB are likely in full IDR units

                                  const mc = t.marketCap || 0
                                  if (mc === 0) return true // Allow stocks with unknown market cap to bypass the filter so they are selectable

                                  const isSmall = mc < 2_000_000_000_000
                                  const isMid = mc >= 2_000_000_000_000 && mc < 10_000_000_000_000
                                  const isLarge = mc >= 10_000_000_000_000

                                  return (
                                    (marketCaps.includes("small") && isSmall) ||
                                    (marketCaps.includes("mid") && isMid) ||
                                    (marketCaps.includes("large") && isLarge)
                                  )
                                })
                                .map((ticker, index) => (
                                  <div
                                    key={ticker.value}
                                    className={`flex items-center px-3 py-2.5 mx-2 my-1 rounded-md border cursor-pointer transition-all duration-150 ${selectedTickers.includes(ticker.value)
                                      ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
                                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                                      }`}
                                    onClick={() => toggleTicker(ticker.value)}
                                  >
                                    <div
                                      className={`w-4 h-4 border rounded mr-3 flex items-center justify-center flex-shrink-0 ${selectedTickers.includes(ticker.value) ? "bg-primary border-primary" : "border-slate-300 bg-white"
                                        }`}
                                    >
                                      {selectedTickers.includes(ticker.value) && (
                                        <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
                                      )}
                                    </div>
                                    <span className="text-sm font-mono truncate text-foreground">{ticker.label}</span>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedTickers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedTickers.map((t) => {
                          const label = tickerOptions.find(opt => opt.value === t)?.label.split(" - ")[0] || t;
                          return (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-xs px-2 py-1 cursor-pointer hover:bg-destructive/20 font-mono"
                              onClick={() => toggleTicker(t)}
                            >
                              {label}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div ref={sectorDropdownRef}>
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Sectors</Label>
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="w-full justify-between h-9 px-3 font-normal bg-white border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 font-mono"
                        onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
                      >
                        <span className="text-sm text-foreground">
                          {sectors.length === 0
                            ? "Select sectors..."
                            : sectors.length === 1
                              ? sectors[0]
                              : `${sectors.length} sectors selected`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                      {sectorDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
                          {sectorOptions.map((sector) => (
                            <div
                              key={sector}
                              className={`flex items-center px-3 py-2.5 mx-2 my-1 rounded-md border cursor-pointer transition-all duration-150 ${sectors.includes(sector)
                                ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                                }`}
                              onClick={() => toggleSector(sector)}
                            >
                              <div
                                className={`w-4 h-4 border rounded mr-3 flex items-center justify-center flex-shrink-0 ${sectors.includes(sector) ? "bg-primary border-primary" : "border-slate-300 bg-white"
                                  }`}
                              >
                                {sectors.includes(sector) && (
                                  <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
                                )}
                              </div>
                              <span className="text-sm text-foreground">{sector}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {sectors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sectors.map((sector) => (
                          <Badge
                            key={sector}
                            variant="secondary"
                            className="text-xs px-2 py-1 cursor-pointer hover:bg-destructive/20 font-mono"
                            onClick={() => toggleSector(sector)}
                          >
                            {sector}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <div className="mx-5 border-b border-border" />

            {/* Fundamental Indicators */}
            <SidebarGroup className="p-0" data-tutorial="fundamental-indicators">
              <button
                className={strategyBuilderSectionHeaderClass}
                onClick={() => toggleSection("fundamental")}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="h-4 w-4 flex-shrink-0" style={{ color: "#d07225" }} />
                  <span className="text-[13px] font-mono font-semibold text-foreground">Fundamental</span>
                  {fundamentalIndicators.length > 0 && (
                    <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-[#d07225]/10 text-[#d07225] text-[10px] font-mono font-bold">
                      {fundamentalIndicators.length}
                    </span>
                  )}
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${collapsedSections.fundamental ? "-rotate-90" : ""}`} />
              </button>
              {!collapsedSections.fundamental && (
                <SidebarGroupContent className={strategyBuilderIndicatorSectionContentClass}>
                  {fundamentalIndicators.map((indicator) => (
                    <div key={indicator.id} className={strategyBuilderIndicatorCardClass}>
                      {editingIndicators[indicator.id] ? (
                        <div className={strategyBuilderIndicatorEditClass}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-semibold text-foreground">{indicator.name}</span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-green-100" onClick={() => toggleEditMode(indicator.id)}>
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-red-100" onClick={() => removeIndicator(indicator.id, "fundamental")}>
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Min</Label>
                              <Input type="number" value={indicator.params.min} onChange={(e) => { const val = e.target.value; if (val === "") { updateIndicatorParam(indicator.id, "fundamental", "min", "") } else if (val.length > 1 && val.startsWith("0") && val[1] !== ".") { updateIndicatorParam(indicator.id, "fundamental", "min", Number(val)) } else { updateIndicatorParam(indicator.id, "fundamental", "min", val) } }} className="h-7 font-mono text-xs bg-white" />
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Max</Label>
                              <Input type="number" value={indicator.params.max} onChange={(e) => { const val = e.target.value; if (val === "") { updateIndicatorParam(indicator.id, "fundamental", "max", "") } else if (val.length > 1 && val.startsWith("0") && val[1] !== ".") { updateIndicatorParam(indicator.id, "fundamental", "max", Number(val)) } else { updateIndicatorParam(indicator.id, "fundamental", "max", val) } }} className="h-7 font-mono text-xs bg-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={strategyBuilderIndicatorViewClass}>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#d07225] flex-shrink-0" />
                            <span className="text-xs font-mono font-semibold text-foreground">{indicator.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate">({formatIndicatorParams(indicator.params)})</span>
                          </div>
                          <div className="flex gap-0.5 flex-shrink-0">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-200" onClick={() => toggleEditMode(indicator.id)}>
                              <Edit className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100" onClick={() => removeIndicator(indicator.id, "fundamental")}>
                              <X className="h-3 w-3 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <FundamentalIndicatorDropdown onAddIndicator={addIndicator} />
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <div className="mx-5 border-b border-border" />

            {/* Technical Indicators */}
            <SidebarGroup className="p-0" data-tutorial="technical-indicators">
              <button
                className={strategyBuilderSectionHeaderClass}
                onClick={() => toggleSection("technical")}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="h-4 w-4 flex-shrink-0" style={{ color: "#d07225" }} />
                  <span className="text-[13px] font-mono font-semibold text-foreground">Technical</span>
                  {technicalIndicators.length > 0 && (
                    <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-[#d07225]/10 text-[#d07225] text-[10px] font-mono font-bold">
                      {technicalIndicators.length}
                    </span>
                  )}
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${collapsedSections.technical ? "-rotate-90" : ""}`} />
              </button>
              {!collapsedSections.technical && (
                <SidebarGroupContent className={strategyBuilderIndicatorSectionContentClass}>
                  {technicalIndicators.map((indicator) => (
                    <div key={indicator.id} className={strategyBuilderIndicatorCardClass}>
                      {editingIndicators[indicator.id] ? (
                        <div className={strategyBuilderIndicatorEditClass}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-semibold text-foreground">{indicator.name}</span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-green-100" onClick={() => toggleEditMode(indicator.id)}>
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-red-100" onClick={() => removeIndicator(indicator.id, "technical")}>
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(indicator.params).map(([key, value]) => (
                              <div key={key}>
                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide capitalize">{key}</Label>
                                <Input type="number" value={value} onChange={(e) => { const val = e.target.value; if (val === "") { updateIndicatorParam(indicator.id, "technical", key, "") } else if (val.length > 1 && val.startsWith("0") && val[1] !== ".") { updateIndicatorParam(indicator.id, "technical", key, Number(val)) } else { updateIndicatorParam(indicator.id, "technical", key, val) } }} className="h-7 font-mono text-xs bg-white" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className={strategyBuilderIndicatorViewClass}>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#d07225] flex-shrink-0" />
                            <span className="text-xs font-mono font-semibold text-foreground">{indicator.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate">({formatIndicatorParams(indicator.params)})</span>
                          </div>
                          <div className="flex gap-0.5 flex-shrink-0">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-200" onClick={() => toggleEditMode(indicator.id)}>
                              <Edit className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100" onClick={() => removeIndicator(indicator.id, "technical")}>
                              <X className="h-3 w-3 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className={`${strategyBuilderAddIndicatorButtonClass} flex items-center justify-between`}
                    onClick={() => { setModalType("technical"); setShowModal(true) }}
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Technical Indicator
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <div className="mx-5 border-b border-border" />

            {/* Risk Management */}
            <SidebarGroup className="p-0" data-tutorial="risk-management">
              <button
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                onClick={() => toggleSection("risk")}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 flex-shrink-0" style={{ color: "#d07225" }} />
                  <span className="text-[13px] font-mono font-semibold text-foreground">Risk Management</span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${collapsedSections.risk ? "-rotate-90" : ""}`} />
              </button>
              {!collapsedSections.risk && (
                <SidebarGroupContent className="py-4 pl-4 pr-5 space-y-3 border-l border-[#d07225]/50 ml-[27px] my-2 w-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Stop Loss</Label>
                      <div className="relative">
                        <Input type="number" step="0.1" value={stopLoss} onChange={(e) => { const val = e.target.value; if (val === "") { setStopLoss("") } else if (val.length > 1 && val.startsWith("0") && val[1] !== ".") { setStopLoss(Number(val)) } else { setStopLoss(val) } }} placeholder="0" className="font-mono border-slate-300 bg-white pr-7 h-9 text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Take Profit</Label>
                      <div className="relative">
                        <Input type="number" step="0.1" value={takeProfit} onChange={(e) => { const val = e.target.value; if (val === "") { setTakeProfit("") } else if (val.length > 1 && val.startsWith("0") && val[1] !== ".") { setTakeProfit(Number(val)) } else { setTakeProfit(val) } }} placeholder="0" className="font-mono border-slate-300 bg-white pr-7 h-9 text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Min Daily Value</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">Rp</span>
                      <Input type="text" value={minDailyValue.toLocaleString()} onChange={(e) => { const value = Number(e.target.value.replace(/,/g, "")); if (!isNaN(value)) setMinDailyValue(value) }} className="pl-8 h-9 font-mono text-sm border-slate-300 bg-white" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Max Holding Period</Label>
                    <Select value={maxHoldingPeriod} onValueChange={setMaxHoldingPeriod}>
                      <SelectTrigger className="bg-white border-slate-300 h-9 text-sm font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-limit">No limit</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="21">21 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <div className="mx-5 border-b border-border" />

            {/* Backtest Period */}
            <SidebarGroup className="p-0" data-tutorial="backtest-period">
              <button
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                onClick={() => toggleSection("backtest")}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: "#d07225" }} />
                  <span className="text-[13px] font-mono font-semibold text-foreground">Backtest Period</span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${collapsedSections.backtest ? "-rotate-90" : ""}`} />
              </button>
              {!collapsedSections.backtest && (
                <SidebarGroupContent className="py-4 pl-4 pr-5 space-y-3 border-l border-[#d07225]/50 ml-[27px] my-2 w-auto">
                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Initial Capital</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">Rp</span>
                      <Input type="text" placeholder="100,000,000" className="pl-8 font-mono border-slate-300 bg-white h-9 text-sm" value={initialCapital.toLocaleString()} onChange={(e) => { const value = e.target.value.replace(/,/g, ""); if (!isNaN(Number(value))) { setInitialCapital(Number(value)) } }} />
                    </div>
                  </div>

                  <Tabs
                    value={backtestPeriodMode}
                    onValueChange={(value) => setBacktestPeriodMode(value as BacktestPeriodMode)}
                    className="w-full"
                  >
                    <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                      <TabsTrigger
                        value="preset"
                        className="h-full rounded-[10px] text-xs font-mono data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                      >
                        Preset
                      </TabsTrigger>
                      <TabsTrigger
                        value="custom"
                        className="h-full rounded-[10px] text-xs font-mono data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                      >
                        Custom
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preset" className="mt-2.5">
                      <Select value={backtestPeriod} onValueChange={applyPreset}>
                        <SelectTrigger className="w-full h-9 font-mono text-xs bg-white border-slate-300">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {backtestPeriodOptions.map((option) => {
                            const isLocked = option.months > tierBacktestAccess.maxMonths

                            return (
                            <SelectItem
                              key={option.label}
                              value={option.label}
                              className={`font-mono text-xs ${isLocked ? "text-muted-foreground" : ""}`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{option.label}</span>
                                {isLocked && (
                                  <TooltipProvider delayDuration={150}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center">
                                          <Lock className="h-3 w-3 text-muted-foreground opacity-70" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="max-w-[220px] text-xs">
                                        {backtestPeriodLimitMessage}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </span>
                            </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </TabsContent>

                    <TabsContent value="custom" className="mt-2.5 space-y-2.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Start</Label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                              const allowedRange = clampBacktestRangeForTier(e.target.value, endDate, { notify: true })
                              setStartDate(allowedRange.startDate)
                              setEndDate(allowedRange.endDate)
                              setBacktestPeriodMode("custom")
                              setBacktestPeriod("")
                            }}
                            className="border-slate-300 h-9 bg-white text-xs font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">End</Label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                              const allowedRange = clampBacktestRangeForTier(startDate, e.target.value, { notify: true })
                              setStartDate(allowedRange.startDate)
                              setEndDate(allowedRange.endDate)
                              setBacktestPeriodMode("custom")
                              setBacktestPeriod("")
                            }}
                            className="border-slate-300 h-9 bg-white text-xs font-mono"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t bg-card">
            <div className="flex w-full gap-2">
              <div className="flex flex-1">
                <Button
                  className="flex-1 bg-[#d07225] hover:bg-[#a65b1d] text-white h-10 text-sm font-mono font-semibold rounded-r-none border-r border-white/20"
                  onClick={() => handleRunBacktest(false)}
                  data-tutorial="run-backtest"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Backtest
                </Button>
                <DropdownMenu modal={false} open={runMenuOpen} onOpenChange={setRunMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-[#d07225] hover:bg-[#a65b1d] text-white h-10 px-2.5 rounded-l-none">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52" align="end">
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault()
                        handleSaveAndRunMenuSelect()
                      }}
                      className="font-mono text-xs"
                    >
                      <Play className="h-3.5 w-3.5 mr-2" />
                      Save & Run
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault()
                        handleJsonConfigMenuSelect()
                      }}
                      className="font-mono text-xs"
                    >
                      <Play className="h-3.5 w-3.5 mr-2" />
                      Run JSON Config
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyConfig} className="font-mono text-xs">
                      {copied ? (<><CheckCheck className="h-3.5 w-3.5 mr-2 text-green-600" /><span className="text-green-600">Copied!</span></>) : (<><Copy className="h-3.5 w-3.5 mr-2" />Copy Config JSON</>)}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 border-slate-300 hover:bg-slate-50"
                onClick={() => { if (isLoaded && !isSignedIn) { setSaveWithBacktest(false); openSignIn() } else { setSaveWithBacktest(false); setShowSaveModal(true) } }}
              >
                <Save className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </SidebarFooter>
        </TabsContent>
      </Tabs>

      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">{saveWithBacktest ? "Run & Save Strategy" : "Save Strategy"}</DialogTitle>
            <DialogDescription className="font-mono text-xs text-muted-foreground">
              {saveWithBacktest
                ? "Save your strategy and run the backtest immediately."
                : "Save your strategy settings to access them later."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="strategy-name" className="text-sm font-medium">
                Strategy Name
              </Label>
              <Input
                id="strategy-name"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                placeholder="Enter strategy name..."
                className="mt-1 font-mono"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="strategy-description" className="text-sm font-medium">
                Description
              </Label>
              <textarea
                id="strategy-description"
                value={strategyDescription}
                onChange={(e) => setStrategyDescription(e.target.value)}
                placeholder="Enter strategy description..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 font-mono"
                disabled={isSaving}
              />
            </div>

            {/* Private Strategy Toggle */}
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md bg-muted/30">
              <div className="flex items-center space-x-2 flex-1">
                <Label htmlFor="private-toggle" className="text-sm font-medium cursor-pointer">
                  Strategi Privat
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        <strong>Strategi Publik:</strong> Dapat dilihat dan digunakan oleh semua pengguna di komunitas.
                      </p>
                      <p className="text-xs mt-2">
                        <strong>Strategi Privat:</strong> Hanya Anda yang dapat melihat dan menggunakan strategi ini. Fitur ini eksklusif untuk pengguna tier Bandar.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="private-toggle"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                disabled={!isBandarUser || isSaving}
              />
            </div>
            {!isBandarUser && (
              <p className="text-xs text-muted-foreground">
                💡 Upgrade ke tier <strong>Bandar</strong> untuk membuat strategi privat
              </p>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSaveModal(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSaveStrategy(saveWithBacktest)}
              disabled={!strategyName.trim() || isSaving}
              className="font-mono"
            >
              {isSaving ? "Saving..." : saveWithBacktest ? "Run & Save" : "Save Strategy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showJsonConfigModal}
        onOpenChange={(open) => {
          setShowJsonConfigModal(open)
          if (!open) {
            setJsonConfigError("")
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono">Run Backtest from JSON</DialogTitle>
            <DialogDescription className="font-mono text-xs text-muted-foreground">
              Paste a backtest config JSON here. You can use the payload from &quot;Copy Config JSON&quot; or a wrapped
              object with a top-level <code className="font-mono">config</code> field.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="json-backtest-config" className="text-sm font-medium">
                Backtest Config JSON
              </Label>
              <textarea
                id="json-backtest-config"
                value={jsonConfigInput}
                onChange={(e) => {
                  setJsonConfigInput(e.target.value)
                  if (jsonConfigError) {
                    setJsonConfigError("")
                  }
                }}
                placeholder={`{\n  "backtestId": "backtest_123",\n  "filters": {\n    "marketCap": ["large"]\n  },\n  "fundamentalIndicators": [],\n  "technicalIndicators": [],\n  "backtestConfig": {\n    "initialCapital": 100000000,\n    "startDate": "2025-01-01",\n    "endDate": "2025-12-31",\n    "tradingCosts": {\n      "brokerFee": 0.15,\n      "sellFee": 0.15,\n      "minimumFee": 1000\n    },\n    "portfolio": {\n      "positionSizePercent": 25,\n      "minPositionPercent": 5,\n      "maxPositions": 4\n    },\n    "riskManagement": {\n      "stopLossPercent": 7,\n      "takeProfitPercent": 15,\n      "maxHoldingDays": 14\n    }\n  }\n}`}
                className="mt-1 flex min-h-[360px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                disabled={isRunningJsonConfig}
              />
            </div>
            {jsonConfigError && (
              <p className="text-sm text-destructive font-mono">{jsonConfigError}</p>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowJsonConfigModal(false)} disabled={isRunningJsonConfig}>
              Cancel
            </Button>
            <Button
              onClick={handleRunJsonConfig}
              disabled={!jsonConfigInput.trim() || isRunningJsonConfig}
              className="font-mono"
            >
              {isRunningJsonConfig ? "Running..." : "Run Backtest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="font-mono text-xl">Strategy Saved!</DialogTitle>
            <DialogDescription className="font-mono text-sm text-muted-foreground text-center pt-2">
              Your strategy <span className="font-semibold text-foreground">"{savedStrategyName}"</span> has been saved successfully.
              {pendingRunBacktest && " The backtest is now running."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full font-mono bg-[#d07225] hover:bg-[#a65b1d]"
            >
              Continue
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false)
                window.location.href = "/portfolio"
              }}
              className="w-full font-mono"
            >
              View My Strategies
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddIndicatorModal open={showModal} onOpenChange={setShowModal} type={modalType} onAddIndicator={addIndicator} userTier={tier} />
    </div>
  )
}

export function BacktestStrategyBuilder(props: BacktestStrategyBuilderProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-4" />Loading builder...</div>}>
      <BacktestStrategyBuilderContent {...props} />
    </Suspense>
  )
}
