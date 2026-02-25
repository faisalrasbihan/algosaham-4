"use client"

import type React from "react"
import { useState, useRef, useEffect, Suspense } from "react"
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
  Search,
  FileCode,
  CheckCircle,
  Clock,
  Copy,
  CheckCheck,
  Info,
} from "lucide-react"
import { AddIndicatorModal } from "@/components/add-indicator-modal"
import { FundamentalIndicatorDropdown } from "@/components/fundamental-indicator-dropdown"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"
import { SignInButton, useUser, useClerk } from "@clerk/nextjs" // Added useClerk
import { LogIn } from "lucide-react"
import { toast } from "sonner"
import type { BacktestRequest } from "@/lib/api"
import { useUserTier } from "@/context/user-tier-context"; // Added import

interface Indicator {
  id: string
  name: string
  type: "fundamental" | "technical"
  params: Record<string, any>
}

interface ThinkingStep {
  id: string
  icon: "thinking" | "search" | "file" | "check" | "clock"
  text: string
  status: "pending" | "done"
}

interface StrategyCard {
  name: string
  description: string
  indicators: string[]
  version: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isThinking?: boolean
  thinkingSteps?: ThinkingStep[]
  strategyCard?: StrategyCard
  thinkingTime?: number
  workTime?: number
  backtestConfig?: BacktestRequest
}

interface BacktestStrategyBuilderProps {
  onRunBacktest: (config: BacktestRequest, isInitial?: boolean) => Promise<void>
  backtestResults?: any | null
}

export function BacktestStrategyBuilderContent({ onRunBacktest, backtestResults }: BacktestStrategyBuilderProps) {
  const { isSignedIn, isLoaded } = useUser()
  const { refreshTier } = useUserTier(); // Added hook usage
  const searchParams = useSearchParams()
  const strategyId = searchParams.get('strategyId')
  const [hasLoadedStrategyParam, setHasLoadedStrategyParam] = useState(false)
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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [savedStrategyName, setSavedStrategyName] = useState("")
  const [strategyName, setStrategyName] = useState("")
  const [strategyDescription, setStrategyDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [pendingRunBacktest, setPendingRunBacktest] = useState(false)
  const [saveWithBacktest, setSaveWithBacktest] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [editingIndicators, setEditingIndicators] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("strategy")
  const [isPrivate, setIsPrivate] = useState(false)
  const [userTier, setUserTier] = useState<string>("free")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI strategy assistant. I can help you build, analyze, and optimize trading strategies. What would you like to create today?",
      timestamp: new Date(),
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [isAgentThinking, setIsAgentThinking] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    filters: false,
    fundamental: false,
    technical: false,
    risk: false,
    backtest: false,
  })
  const [isTutorialActive, setIsTutorialActive] = useState(false)
  const [hasVisited, setHasVisited] = useState<boolean | null>(null)

  // Session ID state
  const [sessionId, setSessionId] = useState<string>("")

  // Initialize session ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("backtester_session_id")
      if (!id) {
        id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("backtester_session_id", id)
      }
      setSessionId(id)
    }
  }, [])

  // Backtest config states
  const [stopLoss, setStopLoss] = useState<number | string>(7)
  const [takeProfit, setTakeProfit] = useState<number | string>(15)
  const [maxHoldingPeriod, setMaxHoldingPeriod] = useState<string>("14")
  const [startDate, setStartDate] = useState<string>("2024-06-01")
  const [endDate, setEndDate] = useState<string>("2024-08-31")
  const [initialCapital, setInitialCapital] = useState<number>(100000000)

  // Backtest preset state
  const [backtestPeriod, setBacktestPeriod] = useState<string>("Last 1 year")

  const backtestPeriodOptions = [
    "Last 1 month",
    "Last 3 months",
    "Last 6 months",
    "Last 1 year",
    "Last 2 years",
    "Last 3 years",
    "Last 5 years",
  ]

  const applyPreset = (period: string) => {
    setBacktestPeriod(period)
    const end = new Date()
    const start = new Date()

    switch (period) {
      case "Last 1 month":
        start.setMonth(end.getMonth() - 1)
        break
      case "Last 3 months":
        start.setMonth(end.getMonth() - 3)
        break
      case "Last 6 months":
        start.setMonth(end.getMonth() - 6)
        break
      case "Last 1 year":
        start.setFullYear(end.getFullYear() - 1)
        break
      case "Last 2 years":
        start.setFullYear(end.getFullYear() - 2)
        break
      case "Last 3 years":
        start.setFullYear(end.getFullYear() - 3)
        break
      case "Last 5 years":
        start.setFullYear(end.getFullYear() - 5)
        break
    }

    setEndDate(end.toISOString().split("T")[0])
    setStartDate(start.toISOString().split("T")[0])
  }

  // Initialize with default preset
  useEffect(() => {
    applyPreset("Last 1 year")
  }, [])

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
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const sectorDropdownRef = useRef<HTMLDivElement>(null)
  const tickerDropdownRef = useRef<HTMLDivElement>(null)

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
      if (!strategyId || hasLoadedStrategyParam || !isLoaded || !isSignedIn) return

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
          }
          sessionStorage.removeItem(prefetchKey)
          setHasLoadedStrategyParam(true)

          // trigger backtest run since it loaded instantly
          setTimeout(() => handleRunBacktest(true), 500)
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

            // trigger backtest run after loading config
            setTimeout(() => handleRunBacktest(true), 500)
          }
        }
      } catch (error) {
        console.error("Failed to load strategy from URL:", error)
      } finally {
        setHasLoadedStrategyParam(true)
      }
    }

    loadStrategyFromUrl()
  }, [strategyId, isLoaded, isSignedIn, hasLoadedStrategyParam])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Fetch user's subscription tier
  useEffect(() => {
    const fetchUserTier = async () => {
      if (!isSignedIn) return

      try {
        const response = await fetch('/api/user/tier')
        if (response.ok) {
          const data = await response.json()
          setUserTier(data.tier || 'free')
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error)
        setUserTier('free')
      }
    }

    fetchUserTier()
  }, [isSignedIn])


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

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
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
      technicalIndicators: technicalIndicators.map(mapTechnicalIndicator),
      backtestConfig: {
        initialCapital,
        startDate,
        endDate,
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

    if (!skipAuthCheck) {
      if (!isLoaded) return
      if (!isSignedIn) {
        setShowLoginPrompt(true)
        return
      }
    }

    const config = buildBacktestConfig()
    try {
      await onRunBacktest(config, skipAuthCheck)
      scrollToBottom()
      // Refresh user tier limits after running backtest
      refreshTier();
    } catch (error) {
      console.error("Backtest failed:", error)
      const msg = error instanceof Error ? error.message : ""
      const isQuotaError = msg.toLowerCase().includes('limit reached') || msg.toLowerCase().includes('upgrade your plan')
      if (!isQuotaError) {
        toast.error("Backtest Failed", {
          description: msg || "An unknown error occurred",
        })
      }
    }
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
      setTechnicalIndicators(newTechnicalIndicators)
    }

    if (config.backtestConfig) {
      setInitialCapital(config.backtestConfig.initialCapital)
      setStartDate(config.backtestConfig.startDate)
      setEndDate(config.backtestConfig.endDate)
      if (config.backtestConfig.riskManagement) {
        setStopLoss(config.backtestConfig.riskManagement.stopLossPercent)
        setTakeProfit(config.backtestConfig.riskManagement.takeProfitPercent)
        setMaxHoldingPeriod(config.backtestConfig.riskManagement.maxHoldingDays.toString())
      }
    }

    setActiveTab("strategy")
    scrollToBottom()
  }

  const handleApplyStrategy = (config: BacktestRequest) => {
    applyStrategyFromConfig(config)
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAgentThinking) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    const currentInput = chatInput
    setChatInput("")
    setIsAgentThinking(true)

    // Add immediate thinking feedback
    const thinkingMessageId = (Date.now() + 1).toString()
    const thinkingMessage: ChatMessage = {
      id: thinkingMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isThinking: true,
      thinkingSteps: [
        { id: "1", icon: "thinking", text: "Analyzing your request...", status: "pending" },
      ],
      thinkingTime: 0,
    }
    setChatMessages((prev) => [...prev, thinkingMessage])

    try {
      const startTime = Date.now()

      // Update thinking steps while waiting
      const stepInterval = setInterval(() => {
        setChatMessages((prev) => {
          return prev.map(msg => {
            if (msg.id === thinkingMessageId && msg.isThinking) {
              const time = Math.floor((Date.now() - startTime) / 1000)
              return { ...msg, thinkingTime: time }
            }
            return msg
          })
        })
      }, 1000)

      let currentSessionId = sessionId;
      if (!currentSessionId && typeof window !== 'undefined') {
        currentSessionId = localStorage.getItem("backtester_session_id") || "default_session"
      }

      const response = await fetch("/agent/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_text: currentInput,
          session_id: currentSessionId,
        }),
      })

      clearInterval(stepInterval)

      if (!response.ok) {
        throw new Error("Failed to get response from agent")
      }

      const data = await response.json()
      const endTime = Date.now()
      const totalTime = (endTime - startTime) / 1000

      // Remove thinking message and add actual response
      setChatMessages((prev) => {
        const withoutThinking = prev.filter((m) => m.id !== thinkingMessageId)

        let strategyCard: StrategyCard | undefined

        if (data.config_ready && data.backtest_config) {
          // Construct strategy card from config
          const config = data.backtest_config as BacktestRequest

          // Generate indicator descriptions
          const indicatorDescriptions = [
            ...config.fundamentalIndicators.map((i: any) => `${mapApiFundamentalTypeToUiName(i.type)} (${i.min ?? ''} - ${i.max ?? ''})`),
            ...config.technicalIndicators.map((i: any) => {
              const { type, ...params } = i
              const paramStr = Object.entries(params)
                .map(([k, v]) => `${k}:${v}`)
                .join(', ')
              return `${mapApiTypeToUiName(type)} ${paramStr ? `(${paramStr})` : ''}`
            })
          ]

          strategyCard = {
            name: "Agent Generated Strategy",
            description: "Strategy configuration generated based on your requirements.",
            indicators: indicatorDescriptions.slice(0, 3),
            version: "v1",
          }
        }

        const newMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          thinkingTime: totalTime,
          strategyCard: strategyCard,
          backtestConfig: data.backtest_config
        }

        return [...withoutThinking, newMessage]
      })

    } catch (error) {
      console.error("Agent error:", error)
      setChatMessages((prev) => {
        const withoutThinking = prev.filter((m) => m.id !== thinkingMessageId)
        return [
          ...withoutThinking,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "I apologize, but I encountered an error processing your request. Please try again.",
            timestamp: new Date(),
          },
        ]
      })
    } finally {
      setIsAgentThinking(false)
    }
  }


  const renderThinkingIcon = (icon: string, status: string) => {
    if (status === "pending") {
      return <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
    }
    switch (icon) {
      case "thinking":
        return <Sparkles className="h-3.5 w-3.5 text-[#d07225]" />
      case "search":
        return <Search className="h-3.5 w-3.5 text-[#8cbcb9]" />
      case "file":
        return <FileCode className="h-3.5 w-3.5 text-[#8d6a9f]" />
      case "check":
        return <CheckCircle className="h-3.5 w-3.5 text-green-600" />
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  // Helper to render bold text from **text** pattern
  const renderMessageContent = (content: string) => {
    if (!content) return null

    // Split by ** pattern
    const parts = content.split(/(\*\*.*?\*\*)/g)

    return (
      <span className="whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            )
          }
          // Handle newlines as breaks or simple text
          return part
        })}
      </span>
    )
  }



  const handleTutorialStart = () => {
    setIsTutorialActive(true)
  }

  const handleTutorialComplete = () => {
    setIsTutorialActive(false)
  }

  return (
    <div className="h-full flex flex-col relative">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between bg-card">
          <TabsList className="h-9">
            <TabsTrigger value="strategy" className="text-xs font-mono font-semibold gap-1.5 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Settings className="h-3.5 w-3.5" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs font-mono font-semibold gap-1.5 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Agent
            </TabsTrigger>
          </TabsList>
          <OnboardingTutorial onComplete={handleTutorialComplete} onStart={handleTutorialStart} />
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "user" ? (
                  <div className="max-w-[85%] rounded-lg px-4 py-2.5 bg-slate-200 text-foreground">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <span className="text-xs mt-1.5 block text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ) : message.isThinking ? (
                  <div className="max-w-[90%] space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Thinking for {message.thinkingTime}s</span>
                    </div>
                    <div className="space-y-1.5">
                      {message.thinkingSteps?.map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          {renderThinkingIcon(step.icon, step.status)}
                          <span className={step.status === "done" ? "text-foreground" : "text-muted-foreground"}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[90%] space-y-3">
                    {message.thinkingTime && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3" />
                          Thought for {message.thinkingTime}s
                        </span>
                        {message.workTime && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            Worked for {message.workTime}s
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-sm leading-relaxed text-foreground">
                      {renderMessageContent(message.content)}
                    </div>
                    {message.strategyCard && (
                      <div className="border rounded-lg overflow-hidden bg-slate-50">
                        <div className="px-3 py-2 border-b bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded bg-[#d07225]/10 flex items-center justify-center">
                              <Zap className="h-3 w-3 text-[#d07225]" />
                            </div>
                            <span className="text-sm font-medium">{message.strategyCard.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
                            {message.strategyCard.version}
                          </span>
                        </div>
                        <div className="px-3 py-2 space-y-2">
                          <p className="text-xs text-muted-foreground">{message.strategyCard.description}</p>
                          <div className="space-y-1">
                            {message.strategyCard.indicators.map((indicator, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-foreground">{indicator}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="px-3 py-2 border-t bg-white">
                          <Button
                            size="sm"
                            className="w-full h-7 text-xs bg-[#d07225] hover:bg-[#a65b1d] text-white"
                            // @ts-ignore - backtestConfig is dynamically added
                            onClick={() => message.backtestConfig && handleApplyStrategy(message.backtestConfig)}
                          >
                            Apply to Strategy Builder
                          </Button>
                        </div>
                      </div>
                    )}
                    {!message.thinkingTime && (
                      <span className="text-xs block text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 bg-transparent"
                onClick={() => setChatInput("Build me a momentum strategy")}
                disabled={isAgentThinking}
              >
                <Zap className="h-3 w-3 mr-1" />
                Momentum Strategy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 bg-transparent"
                onClick={() => setChatInput("Create a value investing strategy")}
                disabled={isAgentThinking}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Value Strategy
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask the agent to build a strategy..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="text-sm"
                disabled={isAgentThinking}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                className="bg-[#d07225] hover:bg-[#a65b1d]"
                disabled={isAgentThinking}
              >
                {isAgentThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
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
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
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
                <SidebarGroupContent className="py-4 pl-4 pr-5 space-y-2 border-l border-[#d07225]/50 ml-[27px] my-2 w-auto">
                  {fundamentalIndicators.map((indicator) => (
                    <div key={indicator.id} className="rounded-md border border-slate-200 bg-slate-50/80">
                      {editingIndicators[indicator.id] ? (
                        <div className="p-2.5">
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
                        <div className="px-3 py-2 flex items-center justify-between">
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
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
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
                <SidebarGroupContent className="py-4 pl-4 pr-5 space-y-2 border-l border-[#d07225]/50 ml-[27px] my-2 w-auto">
                  {technicalIndicators.map((indicator) => (
                    <div key={indicator.id} className="rounded-md border border-slate-200 bg-slate-50/80">
                      {editingIndicators[indicator.id] ? (
                        <div className="p-2.5">
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
                        <div className="px-3 py-2 flex items-center justify-between">
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
                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-md border border-dashed border-slate-300 text-xs font-mono text-muted-foreground hover:border-[#d07225] hover:text-[#d07225] hover:bg-[#d07225]/5 transition-all"
                    onClick={() => { setModalType("technical"); setShowModal(true) }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Indicator
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

                  <Tabs defaultValue="preset" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-8">
                      <TabsTrigger value="preset" className="text-xs font-mono">Preset</TabsTrigger>
                      <TabsTrigger value="custom" className="text-xs font-mono">Custom</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preset" className="mt-2.5">
                      <Select value={backtestPeriod} onValueChange={applyPreset}>
                        <SelectTrigger className="w-full h-9 font-mono text-xs bg-white border-slate-300">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {backtestPeriodOptions.map((period) => (
                            <SelectItem key={period} value={period} className="font-mono text-xs">{period}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TabsContent>

                    <TabsContent value="custom" className="mt-2.5 space-y-2.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Start</Label>
                          <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setBacktestPeriod("") }} className="border-slate-300 h-9 bg-white text-xs font-mono" />
                        </div>
                        <div>
                          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">End</Label>
                          <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setBacktestPeriod("") }} className="border-slate-300 h-9 bg-white text-xs font-mono" />
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-[#d07225] hover:bg-[#a65b1d] text-white h-10 px-2.5 rounded-l-none">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52" align="end">
                    <DropdownMenuItem onClick={() => { if (isLoaded && !isSignedIn) { setSaveWithBacktest(true); setShowLoginPrompt(true) } else { setSaveWithBacktest(true); setShowSaveModal(true) } }} className="font-mono text-xs">
                      <Play className="h-3.5 w-3.5 mr-2" />
                      Save & Run
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
                onClick={() => { if (isLoaded && !isSignedIn) { setSaveWithBacktest(false); setShowLoginPrompt(true) } else { setSaveWithBacktest(false); setShowSaveModal(true) } }}
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
                disabled={userTier !== "bandar" || isSaving}
              />
            </div>
            {userTier !== "bandar" && (
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

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#d07225]/10">
              <LogIn className="h-8 w-8 text-[#d07225]" />
            </div>
            <DialogTitle className="font-mono text-xl">Sign In Required</DialogTitle>
            <DialogDescription className="font-mono text-sm text-muted-foreground text-center pt-2">
              You need to sign in to use this feature. Would you like to sign in now?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <SignInButton mode="modal">
              <Button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full font-mono bg-[#d07225] hover:bg-[#a65b1d]"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </SignInButton>
            <Button
              variant="outline"
              onClick={() => setShowLoginPrompt(false)}
              className="w-full font-mono"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddIndicatorModal open={showModal} onOpenChange={setShowModal} type={modalType} onAddIndicator={addIndicator} />
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

