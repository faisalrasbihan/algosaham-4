"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Filter,
  TrendingUp,
  BarChart3,
  Shield,
  Calendar,
  Play,
  Save,
  Edit,
  Check,
} from "lucide-react"
import { AddIndicatorModal } from "@/components/add-indicator-modal"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"
import { BacktestRequest } from "@/lib/api"
import { useEffect } from "react"
import { useUser, SignInButton } from "@clerk/nextjs"

interface Indicator {
  id: string
  name: string
  type: "fundamental" | "technical"
  params: Record<string, any>
}

interface StrategyBuilderProps {
  onRunBacktest?: (config: BacktestRequest) => void
}

export function StrategyBuilder({ onRunBacktest }: StrategyBuilderProps) {
  const { isSignedIn, isLoaded } = useUser()
  const [marketCaps, setMarketCaps] = useState<string[]>(["mid"])
  const [stockType, setStockType] = useState("All Stocks")
  const [sectors, setSectors] = useState<string[]>(["Banking"])
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false)
  const [fundamentalIndicators, setFundamentalIndicators] = useState<Indicator[]>([
    { id: "1", name: "PE Ratio", type: "fundamental", params: { min: 0, max: 20 } },
    { id: "2", name: "PBV", type: "fundamental", params: { min: 0, max: 3 } },
    { id: "3", name: "ROE %", type: "fundamental", params: { min: 15, max: 50 } },
  ])
  const [technicalIndicators, setTechnicalIndicators] = useState<Indicator[]>([
    { id: "5", name: "RSI", type: "technical", params: { period: 14, oversold: 30, overbought: 70 } },
  ])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"fundamental" | "technical">("fundamental")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [strategyName, setStrategyName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [editingIndicators, setEditingIndicators] = useState<Record<string, boolean>>({})
  
  // Backtest configuration state
  const [initialCapital, setInitialCapital] = useState(1000000000)
  const [startDate, setStartDate] = useState("2025-02-22")
  const [endDate, setEndDate] = useState("2025-05-22")
  const [stopLoss, setStopLoss] = useState(5)
  const [takeProfit, setTakeProfit] = useState(10)
  const [maxHoldingDays, setMaxHoldingDays] = useState(10)

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    filters: false,
    fundamental: false,
    technical: false,
    risk: false,
    backtest: false,
  })

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

  // Auto-run backtest on component mount (only once)
  useEffect(() => {
    console.log('🚀 [STRATEGY BUILDER] Component mounted, running initial backtest...')
    
    if (onRunBacktest) {
      // Create the exact config as specified
      const initialConfig: BacktestRequest = {
        backtestId: "test1",
        filters: {
          marketCap: ["mid"],
          syariah: false
        },
        fundamentalIndicators: [
          { type: "PE_RATIO", min: 0, max: 20 },
          { type: "PBV", min: 0, max: 3 },
          { type: "ROE", min: 15 }
        ],
        technicalIndicators: [
          { type: "RSI", period: 14, oversold: 30, overbought: 70 }
        ],
        backtestConfig: {
          initialCapital: 1000000000,
          startDate: "2025-02-22",
          endDate: "2025-05-22",
          tradingCosts: {
            brokerFee: 0.15,
            sellFee: 0.15,
            minimumFee: 1000
          },
          portfolio: {
            positionSizePercent: 20,
            minPositionPercent: 2,
            maxPositions: 5
          },
          riskManagement: {
            stopLossPercent: 5,
            takeProfitPercent: 10,
            maxHoldingDays: 10
          }
        }
      }

      console.log('📋 [STRATEGY BUILDER] Initial backtest config:')
      console.log(JSON.stringify(initialConfig, null, 2))
      
      console.log('🔄 [STRATEGY BUILDER] Calling onRunBacktest with initial config...')
      onRunBacktest(initialConfig)
    } else {
      console.warn('⚠️ [STRATEGY BUILDER] No onRunBacktest function provided, skipping initial backtest')
    }
  }, []) // Empty dependency array - only run once on mount

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
    // Simulate saving process
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
    setShowSaveModal(false)
    setStrategyName("")

    if (runBacktest) {
      // Simulate running backtest after saving
      console.log("Running backtest with saved strategy:", strategyName)
    }
  }

  const handleRunBacktest = () => {
    console.log('🎮 [STRATEGY BUILDER] Run backtest button clicked!')
    console.log('🎮 [STRATEGY BUILDER] onRunBacktest function available:', !!onRunBacktest)
    
    if (!onRunBacktest) {
      console.warn('⚠️ [STRATEGY BUILDER] No onRunBacktest function provided')
      return
    }
    
    console.log('🎮 [STRATEGY BUILDER] Current form state:', {
      marketCaps,
      stockType,
      sectors,
      fundamentalIndicators: fundamentalIndicators.length,
      technicalIndicators: technicalIndicators.length,
      initialCapital,
      startDate,
      endDate,
      stopLoss,
      takeProfit,
      maxHoldingDays
    })
    
    // Convert indicators to API format
    console.log('🔄 [STRATEGY BUILDER] Converting fundamental indicators...')
    const apiFundamentalIndicators = fundamentalIndicators.map(indicator => {
      const type = indicator.name === "PE Ratio" ? "PE_RATIO" : 
                   indicator.name === "PBV" ? "PBV" :
                   indicator.name === "ROE %" ? "ROE" : 
                   indicator.name.toUpperCase().replace(/\s+/g, '_')
      
      const converted = {
        type,
        min: indicator.params.min,
        max: indicator.params.max
      }
      console.log('🔄 [STRATEGY BUILDER] Converted fundamental indicator:', converted)
      return converted
    })

    console.log('🔄 [STRATEGY BUILDER] Converting technical indicators...')
    const apiTechnicalIndicators = technicalIndicators.map(indicator => {
      let converted
      if (indicator.name === "RSI") {
        converted = {
          type: "RSI",
          period: indicator.params.period,
          oversold: indicator.params.oversold,
          overbought: indicator.params.overbought
        }
      } else if (indicator.name === "SMA Crossover") {
        converted = {
          type: "SMA_CROSSOVER",
          shortPeriod: indicator.params.shortPeriod,
          longPeriod: indicator.params.longPeriod
        }
      } else if (indicator.name === "MACD") {
        converted = {
          type: "MACD",
          fastPeriod: indicator.params.fastPeriod,
          slowPeriod: indicator.params.slowPeriod,
          signalPeriod: indicator.params.signalPeriod
        }
      } else if (indicator.name === "Bollinger Bands") {
        converted = {
          type: "BOLLINGER_BANDS",
          period: indicator.params.period,
          stdDev: indicator.params.stdDev
        }
      } else {
        converted = {
          type: indicator.name.toUpperCase().replace(/\s+/g, '_'),
          ...indicator.params
        }
      }
      console.log('🔄 [STRATEGY BUILDER] Converted technical indicator:', converted)
      return converted
    })

    const backtestConfig: BacktestRequest = {
      backtestId: `strategy_${Date.now()}`,
      filters: {
        marketCap: marketCaps.length > 0 ? marketCaps : ["large"],
        syariah: stockType === "Syariah Only"
      },
      fundamentalIndicators: apiFundamentalIndicators,
      technicalIndicators: apiTechnicalIndicators,
      backtestConfig: {
        initialCapital,
        startDate,
        endDate,
        tradingCosts: {
          brokerFee: 0.15,
          sellFee: 0.15,
          minimumFee: 1000
        },
        portfolio: {
          positionSizePercent: 20,
          minPositionPercent: 2,
          maxPositions: 5
        },
        riskManagement: {
          stopLossPercent: stopLoss,
          takeProfitPercent: takeProfit,
          maxHoldingDays
        }
      }
    }

    console.log('📤 [STRATEGY BUILDER] Final backtest config:')
    console.log(JSON.stringify(backtestConfig, null, 2))
    console.log('📤 [STRATEGY BUILDER] Calling onRunBacktest with config...')
    
    onRunBacktest(backtestConfig)
    console.log('📤 [STRATEGY BUILDER] onRunBacktest called, scrolling to bottom...')
    scrollToBottom()
  }

  const formatIndicatorParams = (params: Record<string, any>) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 pb-24 space-y-3 overflow-y-auto" ref={scrollContainerRef}>
        {/* Tutorial Button */}
        <OnboardingTutorial />
        
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
              {collapsedSections.filters ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                    ))}                  </div>
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
                            {sectors.includes(sector) && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
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
                    // Edit mode - expanded view
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
                    // Display mode - one-liner
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
              {collapsedSections.technical ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          {!collapsedSections.technical && (
            <CardContent className="pt-0 space-y-2">
              {technicalIndicators.map((indicator) => (
                <div key={indicator.id} className="bg-secondary rounded border-l-2 border-chart-3">
                  {editingIndicators[indicator.id] ? (
                    // Edit mode - expanded view
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
                    // Display mode - one-liner
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
                    className="font-mono border-slate-200" 
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Take Profit (%)</Label>
                  <Input 
                    type="number" 
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(Number(e.target.value))}
                    className="font-mono border-slate-200" 
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max Holding Period</Label>
                <Select value={maxHoldingDays.toString()} onValueChange={(value) => setMaxHoldingDays(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="120">120 days</SelectItem>
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
              {collapsedSections.backtest ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                    value={initialCapital.toLocaleString()}
                    className="pl-8 font-mono border-slate-200"
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

      <div className="sticky bottom-0 p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex w-full">
          {isLoaded && !isSignedIn ? (
            <SignInButton mode="modal">
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium font-mono"
                data-tutorial="run-backtest"
              >
                <Play className="h-5 w-5 mr-2" />
                Run Backtest
              </Button>
            </SignInButton>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

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
