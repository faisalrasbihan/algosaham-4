"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
} from "lucide-react"
import { AddIndicatorModal } from "@/components/add-indicator-modal"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"
import type { BacktestRequest } from "@/lib/api"

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
}

interface BacktestStrategyBuilderProps {
  onRunBacktest: (config: BacktestRequest) => void
}

export function BacktestStrategyBuilder({ onRunBacktest }: BacktestStrategyBuilderProps) {
  const [marketCaps, setMarketCaps] = useState<string[]>(["large", "mid"])
  const [stockType, setStockType] = useState("All Stocks")
  const [sectors, setSectors] = useState<string[]>([])
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false)
  const [fundamentalIndicators, setFundamentalIndicators] = useState<Indicator[]>([])
  const [technicalIndicators, setTechnicalIndicators] = useState<Indicator[]>([
    { id: "1", name: "RSI", type: "technical", params: { period: 14, oversold: 30, overbought: 70 } },
  ])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"fundamental" | "technical">("fundamental")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [strategyName, setStrategyName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [editingIndicators, setEditingIndicators] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<string>("strategy")
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
  
  // Backtest config states
  const [stopLoss, setStopLoss] = useState<number>(7)
  const [takeProfit, setTakeProfit] = useState<number>(15)
  const [maxHoldingPeriod, setMaxHoldingPeriod] = useState<string>("14")
  const [startDate, setStartDate] = useState<string>("2024-06-01")
  const [endDate, setEndDate] = useState<string>("2024-08-31")
  const [initialCapital, setInitialCapital] = useState<number>(100000000)

  const marketCapOptions = ["small", "mid", "large"]
  const sectorOptions = [
    "Banking",
    "Consumer",
    "Property",
    "Technology",
    "Mining",
    "Energy",
    "Healthcare",
    "Telecommunications",
    "Transportation",
    "Agriculture",
  ]

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Check if user has visited before
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasVisitedBefore = localStorage.getItem("algosaham_has_visited") === "true"
      setHasVisited(hasVisitedBefore)
      // If first time visitor, set tutorial as active
      if (!hasVisitedBefore) {
        setIsTutorialActive(true)
      }
    }
  }, [])

  // Auto-run backtest on page load
  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      handleRunBacktest()
    }, 500)
    
    return () => clearTimeout(timer)
  }, []) // Empty dependency array ensures this only runs once on mount

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const toggleMarketCap = (cap: string) => {
    setMarketCaps((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]))
  }

  const toggleSector = (sector: string) => {
    setSectors((prev) => (prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]))
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
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
    setShowSaveModal(false)
    setStrategyName("")
    if (runBacktest) {
      handleRunBacktest()
    }
  }

  const buildBacktestConfig = (): BacktestRequest => {
    return {
      backtestId: `backtest_${Date.now()}`,
      filters: {
        marketCap: marketCaps.length > 0 ? marketCaps : ["large"],
        syariah: stockType === "Syariah Only",
      },
      fundamentalIndicators: fundamentalIndicators.map((ind) => ({
        type: ind.name.toUpperCase().replace(/\s+/g, "_"),
        min: ind.params.min,
        max: ind.params.max,
      })),
      technicalIndicators: technicalIndicators.map((ind) => ({
        type: ind.name.toUpperCase().replace(/\s+/g, "_"),
        ...ind.params,
      })),
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
          stopLossPercent: stopLoss,
          takeProfitPercent: takeProfit,
          maxHoldingDays: maxHoldingPeriod === "no-limit" ? 999999 : Number.parseInt(maxHoldingPeriod),
        },
      },
    }
  }

  const handleRunBacktest = () => {
    const config = buildBacktestConfig()
    onRunBacktest(config)
    scrollToBottom()
  }

  const formatIndicatorParams = (params: Record<string, any>) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")
  }

  const handleSendMessage = () => {
    if (!chatInput.trim() || isAgentThinking) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    const userInput = chatInput.toLowerCase()
    setChatInput("")
    setIsAgentThinking(true)

    const isStrategyRequest =
      userInput.includes("strategy") ||
      userInput.includes("build") ||
      userInput.includes("create") ||
      userInput.includes("make")

    if (isStrategyRequest) {
      const thinkingMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isThinking: true,
        thinkingSteps: [
          { id: "1", icon: "thinking", text: "Analyzing your request...", status: "pending" },
          { id: "2", icon: "search", text: "Searching market patterns", status: "pending" },
          { id: "3", icon: "file", text: "Building strategy parameters", status: "pending" },
          { id: "4", icon: "check", text: "Validating configuration", status: "pending" },
        ],
        thinkingTime: 0,
      }

      setChatMessages((prev) => [...prev, thinkingMessage])

      let stepIndex = 0
      const stepInterval = setInterval(() => {
        setChatMessages((prev) => {
          const updated = [...prev]
          const thinkingMsg = updated.find((m) => m.isThinking)
          if (thinkingMsg && thinkingMsg.thinkingSteps) {
            if (stepIndex < thinkingMsg.thinkingSteps.length) {
              thinkingMsg.thinkingSteps[stepIndex].status = "done"
              thinkingMsg.thinkingTime = (stepIndex + 1) * 2
              stepIndex++
            }
          }
          return updated
        })

        if (stepIndex >= 4) {
          clearInterval(stepInterval)
          setTimeout(() => {
            setChatMessages((prev) => {
              const updated = prev.filter((m) => !m.isThinking)
              return [
                ...updated,
                {
                  id: (Date.now() + 2).toString(),
                  role: "assistant",
                  content: "I've created a momentum-based strategy for you. Here's what I built:",
                  timestamp: new Date(),
                  strategyCard: {
                    name: "Momentum Breakout Strategy",
                    description: "A trend-following strategy using RSI and SMA crossovers for entry signals",
                    indicators: ["RSI (14) > 50", "SMA (20) crosses above SMA (50)", "Volume > 1.5x average"],
                    version: "v1",
                  },
                  thinkingTime: 8,
                  workTime: 12,
                },
              ]
            })
            setIsAgentThinking(false)
          }, 500)
        }
      }, 800)
    } else {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "I understand. Could you tell me more about what kind of trading strategy you're looking for? For example, are you interested in momentum, mean reversion, or breakout strategies?",
            timestamp: new Date(),
          },
        ])
        setIsAgentThinking(false)
      }, 1000)
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

  const handleApplyStrategy = () => {
    setActiveTab("strategy")
  }

  const handleTutorialStart = () => {
    setIsTutorialActive(true)
  }

  const handleTutorialComplete = () => {
    setIsTutorialActive(false)
  }

  return (
    <div className="h-full flex flex-col bg-background border-r relative">
      {/* Blocking overlay when tutorial is active for first-time visitors */}
      {isTutorialActive && hasVisited === false && (
        <div className="absolute inset-0 bg-black/5 z-40 pointer-events-none" />
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4 py-2 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="strategy" className="text-sm gap-2">
              <Settings className="h-4 w-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-sm gap-2">
              <Sparkles className="h-4 w-4" />
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
                    <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
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
                            onClick={handleApplyStrategy}
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

        <TabsContent value="strategy" className="flex-1 flex flex-col m-0 overflow-hidden">
          <div className="flex-1 p-4 space-y-3 overflow-y-auto" ref={scrollContainerRef}>
            {/* Stock Filters */}
            <Card className="border bg-card rounded-none" data-tutorial="stock-filters">
              <CardHeader className={`flex items-center ${collapsedSections.filters ? "py-2" : "pb-2"}`}>
                <CardTitle
                  className="text-sm font-medium text-foreground flex items-center justify-between cursor-pointer hover:text-slate-600 transition-colors w-full"
                  onClick={() => toggleSection("filters")}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" style={{ color: "#d07225" }} />
                    <span className="font-mono">Stock Filters</span>
                  </div>
                  {collapsedSections.filters ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
              {!collapsedSections.filters && (
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Market Cap</Label>
                      <div className="flex flex-wrap gap-1">
                        {marketCapOptions.map((cap) => (
                          <Badge
                            key={cap}
                            variant={marketCaps.includes(cap) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-accent/20 text-xs font-mono"
                            onClick={() => toggleMarketCap(cap)}
                          >
                            {cap.charAt(0).toUpperCase() + cap.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Type</Label>
                      <div className="flex flex-wrap gap-1">
                        {["All Stocks", "Syariah Only"].map((type) => (
                          <Badge
                            key={type}
                            variant={stockType === type ? "default" : "outline"}
                            className="cursor-pointer hover:bg-accent/20 text-xs font-mono"
                            onClick={() => setStockType(type)}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Sectors</Label>
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="w-full justify-between h-9 px-3 font-normal bg-background border-input hover:bg-slate-50 hover:text-slate-900 font-mono"
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
                              className="flex items-center px-3 py-2 hover:bg-slate-100 hover:text-slate-900 cursor-pointer text-foreground"
                              onClick={() => toggleSector(sector)}
                            >
                              <div
                                className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                                  sectors.includes(sector) ? "bg-primary border-primary" : "border-input"
                                }`}
                              >
                                {sectors.includes(sector) && (
                                  <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
                                )}
                              </div>
                              <span className="text-sm">{sector}</span>
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
                </CardContent>
              )}
            </Card>

            {/* Fundamental Indicators */}
            <Card className="border bg-card rounded-none" data-tutorial="fundamental-indicators">
              <CardHeader className={`flex items-center ${collapsedSections.fundamental ? "py-2" : "pb-2"}`}>
                <CardTitle
                  className="text-sm font-medium text-foreground flex items-center justify-between cursor-pointer hover:text-slate-600 transition-colors w-full"
                  onClick={() => toggleSection("fundamental")}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" style={{ color: "#d07225" }} />
                    <span className="font-mono">Fundamental Indicators</span>
                  </div>
                  {collapsedSections.fundamental ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
              {!collapsedSections.fundamental && (
                <CardContent className="pt-0 space-y-2">
                  {fundamentalIndicators.map((indicator) => (
                    <div key={indicator.id} className="bg-secondary rounded border-l-2 border-chart-2">
                      {editingIndicators[indicator.id] ? (
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{indicator.name}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-green-100"
                                onClick={() => toggleEditMode(indicator.id)}
                              >
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-destructive/20"
                                onClick={() => removeIndicator(indicator.id, "fundamental")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Min</Label>
                              <Input
                                type="number"
                                value={indicator.params.min}
                                onChange={(e) =>
                                  updateIndicatorParam(indicator.id, "fundamental", "min", Number(e.target.value))
                                }
                                className="h-7 font-mono text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Max</Label>
                              <Input
                                type="number"
                                value={indicator.params.max}
                                onChange={(e) =>
                                  updateIndicatorParam(indicator.id, "fundamental", "max", Number(e.target.value))
                                }
                                className="h-7 font-mono text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm font-medium font-mono">{indicator.name}</span>
                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                              ({formatIndicatorParams(indicator.params)})
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-blue-100"
                              onClick={() => toggleEditMode(indicator.id)}
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-destructive/20"
                              onClick={() => removeIndicator(indicator.id, "fundamental")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent font-mono hover:text-foreground"
                    style={
                      {
                        "--hover-bg": "#d072251a",
                        "--hover-text": "#d07225",
                        "--hover-border": "#d07225",
                      } as React.CSSProperties
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#d0722510"
                      e.currentTarget.style.color = "#d07225"
                      e.currentTarget.style.borderColor = "#d07225"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.color = ""
                      e.currentTarget.style.borderColor = ""
                    }}
                    onClick={() => {
                      setModalType("fundamental")
                      setShowModal(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fundamental Indicator
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Technical Indicators */}
            <Card className="border bg-card rounded-none" data-tutorial="technical-indicators">
              <CardHeader className={`flex items-center ${collapsedSections.technical ? "py-2" : "pb-2"}`}>
                <CardTitle
                  className="text-sm font-medium text-foreground flex items-center justify-between cursor-pointer hover:text-slate-600 transition-colors w-full"
                  onClick={() => toggleSection("technical")}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" style={{ color: "#d07225" }} />
                    <span className="font-mono">Technical Indicators</span>
                  </div>
                  {collapsedSections.technical ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
              {!collapsedSections.technical && (
                <CardContent className="pt-0 space-y-2">
                  {technicalIndicators.map((indicator) => (
                    <div key={indicator.id} className="bg-secondary rounded border-l-2 border-chart-3">
                      {editingIndicators[indicator.id] ? (
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{indicator.name}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-green-100"
                                onClick={() => toggleEditMode(indicator.id)}
                              >
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-destructive/20"
                                onClick={() => removeIndicator(indicator.id, "technical")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(indicator.params).map(([key, value]) => (
                              <div key={key}>
                                <Label className="text-xs text-muted-foreground capitalize">{key}</Label>
                                <Input
                                  type="number"
                                  value={value}
                                  onChange={(e) =>
                                    updateIndicatorParam(indicator.id, "technical", key, Number(e.target.value))
                                  }
                                  className="h-7 font-mono text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm font-medium font-mono">{indicator.name}</span>
                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                              ({formatIndicatorParams(indicator.params)})
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-blue-100"
                              onClick={() => toggleEditMode(indicator.id)}
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-destructive/20"
                              onClick={() => removeIndicator(indicator.id, "technical")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent font-mono hover:text-foreground"
                    style={
                      {
                        "--hover-bg": "#d072251a",
                        "--hover-text": "#d07225",
                        "--hover-border": "#d07225",
                      } as React.CSSProperties
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#d0722510"
                      e.currentTarget.style.color = "#d07225"
                      e.currentTarget.style.borderColor = "#d07225"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.color = ""
                      e.currentTarget.style.borderColor = ""
                    }}
                    onClick={() => {
                      setModalType("technical")
                      setShowModal(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Technical Indicator
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Risk Management */}
            <Card className="border bg-card rounded-none" data-tutorial="risk-management">
              <CardHeader className={`flex items-center ${collapsedSections.risk ? "py-2" : "pb-2"}`}>
                <CardTitle
                  className="text-sm font-medium text-foreground flex items-center justify-between cursor-pointer hover:text-slate-600 transition-colors w-full"
                  onClick={() => toggleSection("risk")}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" style={{ color: "#d07225" }} />
                    <span className="font-mono">Risk Management</span>
                  </div>
                  {collapsedSections.risk ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {!collapsedSections.risk && (
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Stop Loss (%)</Label>
                      <Input 
                        type="number" 
                        value={stopLoss}
                        onChange={(e) => setStopLoss(Number(e.target.value))}
                        placeholder="5" 
                        className="font-mono border-slate-200" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Take Profit (%)</Label>
                      <Input 
                        type="number" 
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(Number(e.target.value))}
                        placeholder="15" 
                        className="font-mono border-slate-200" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max Holding Period</Label>
                    <Select value={maxHoldingPeriod} onValueChange={setMaxHoldingPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-limit">No limit</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Backtest Period */}
            <Card className="border bg-card rounded-none" data-tutorial="backtest-period">
              <CardHeader className={`flex items-center ${collapsedSections.backtest ? "py-2" : "pb-2"}`}>
                <CardTitle
                  className="text-sm font-medium text-foreground flex items-center justify-between cursor-pointer hover:text-slate-600 transition-colors w-full"
                  onClick={() => toggleSection("backtest")}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: "#d07225" }} />
                    <span className="font-mono">Backtest Period</span>
                  </div>
                  {collapsedSections.backtest ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
              {!collapsedSections.backtest && (
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border-slate-200" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <Input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border-slate-200" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Initial Capital</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                      <Input
                        type="text"
                        placeholder="100,000,000"
                        className="pl-8 font-mono border-slate-200"
                        value={initialCapital.toLocaleString()}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, "")
                          if (!isNaN(Number(value))) {
                            setInitialCapital(Number(value))
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full">
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium font-mono rounded-r-none border-r border-primary-foreground/20"
                onClick={handleRunBacktest}
                data-tutorial="run-backtest"
              >
                <Play className="h-5 w-5 mr-2" />
                Run Backtest
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-3 rounded-l-none">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem onClick={() => setShowSaveModal(true)} className="font-mono">
                    <Play className="h-4 w-4 mr-2" />
                    Run & Save
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSaveModal(true)} className="font-mono">
                    <Save className="h-4 w-4 mr-2" />
                    Save Strategy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Save Strategy</DialogTitle>
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
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSaveModal(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSaveStrategy(false)}
              disabled={!strategyName.trim() || isSaving}
              className="font-mono"
            >
              {isSaving ? "Saving..." : "Save Strategy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddIndicatorModal open={showModal} onOpenChange={setShowModal} type={modalType} onAddIndicator={addIndicator} />
    </div>
  )
}

