"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  technicalIndicatorCategories,
  technicalIndicatorCount,
  getTechnicalIndicatorRequiredTier,
  isTechnicalIndicatorAvailableForTier,
  type TechnicalIndicatorDefinition,
} from "@/lib/technical-indicators"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import {
  Search,
  Plus,
  ChevronRight,
  Zap,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowUpRight,
  Layers,
  LineChart,
  Shield,
  Globe,
  Settings2,
  Lock,
} from "lucide-react"

interface Indicator {
  name: string
  type: "fundamental" | "technical"
  params: Record<string, any>
}

interface AddIndicatorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "fundamental" | "technical"
  onAddIndicator: (indicator: Omit<Indicator, "id">) => void
  userTier?: string
}

// Fundamental indicators matching API spec
const fundamentalIndicators = [
  { name: "PE Ratio", description: "Price to Earnings ratio", params: { min: 0, max: 50 } },
  { name: "PBV", description: "Price to Book Value ratio", params: { min: 0, max: 10 } },
  { name: "ROE", description: "Return on Equity percentage", params: { min: 0, max: 100 } },
  { name: "DE Ratio", description: "Debt to Equity Ratio", params: { min: 0, max: 5 } },
  { name: "ROA", description: "Return on Assets percentage", params: { min: 0, max: 50 } },
  { name: "NPM", description: "Net Profit Margin percentage", params: { min: 0, max: 100 } },
  { name: "EPS", description: "Earnings Per Share", params: { min: 0, max: 1000 } },
]

interface IndicatorDef {
  name: string
  description: string
  params: Record<string, any>
}

interface IndicatorCategory {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string, style?: React.CSSProperties }>
  indicators: IndicatorDef[]
}

const categoryIcons: Record<string, IndicatorCategory["icon"]> = {
  momentum: Zap,
  "moving-averages": TrendingUp,
  volatility: Activity,
  volume: BarChart3,
  trend: ArrowUpRight,
  candlestick: Layers,
  "chart-patterns": LineChart,
  "support-resistance": Shield,
  flow: Globe,
  regime: Settings2,
}

const technicalCategories: IndicatorCategory[] = technicalIndicatorCategories.map((category) => ({
  ...category,
  icon: categoryIcons[category.id] ?? Settings2,
  indicators: category.indicators as TechnicalIndicatorDefinition[],
}))

function getTierGateCopy(requiredTier: string) {
  const normalizedTier = requiredTier.toLowerCase()
  return {
    title: normalizedTier === "suhu" ? "Fitur Suhu" : "Fitur Bandar",
    message: `Indikator ini hanya tersedia untuk tier ${requiredTier} ke atas.`,
  }
}

export function AddIndicatorModal({ open, onOpenChange, type, onAddIndicator, userTier }: AddIndicatorModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["momentum"]))

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("")
      setExpandedCategories(new Set(["momentum"]))
    }
  }, [open])

  const handleAddIndicator = (indicator: IndicatorDef, indicatorType: "fundamental" | "technical") => {
    if (indicatorType === "technical") {
      const requiredTier = getTechnicalIndicatorRequiredTier(indicator.name)
      if (!isTechnicalIndicatorAvailableForTier(indicator.name, userTier)) {
        const gateCopy = getTierGateCopy(requiredTier)
        toast.info(gateCopy.title, {
          description: gateCopy.message,
        })
        return
      }
    }

    onAddIndicator({
      name: indicator.name,
      type: indicatorType,
      params: { ...indicator.params },
    })
    onOpenChange(false)
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return technicalCategories

    const query = searchQuery.toLowerCase()
    return technicalCategories
      .map((category) => ({
        ...category,
        indicators: category.indicators.filter(
          (ind) =>
            ind.name.toLowerCase().includes(query) ||
            ind.description.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.indicators.length > 0)
  }, [searchQuery])

  // When searching, expand all matching categories
  const effectiveExpanded = searchQuery.trim()
    ? new Set(filteredCategories.map((c) => c.id))
    : expandedCategories

  // Fundamental indicators — keep original flat layout
  if (type === "fundamental") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-slate-800">
              Add Fundamental Indicator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {fundamentalIndicators.map((indicator, index) => (
              <div key={index} className="p-3 bg-secondary rounded border-l-2 border-chart-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{indicator.name}</h3>
                    <p className="text-xs text-muted-foreground">{indicator.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddIndicator(indicator, "fundamental")}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 px-3 text-xs"
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Technical indicators — grouped categorized layout
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-3">
          <DialogHeader>
            <DialogTitle className="font-mono text-foreground text-base">
              Add Technical Indicator
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {technicalIndicatorCount} indicators across {technicalCategories.length} categories
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search indicators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm font-mono bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-[#d07225]/40"
            />
          </div>
        </div>

        {/* Category list */}
        <div className="max-h-[420px] overflow-y-auto px-4 pb-5">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No indicators match your search
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredCategories.map((category) => {
                const Icon = category.icon
                const isExpanded = effectiveExpanded.has(category.id)

                return (
                  <div key={category.id}>
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: "#d07225" }} />
                      <span className="text-sm font-medium text-foreground font-mono flex-1 text-left">
                        {category.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums mr-1">
                        {category.indicators.length}
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>

                    {/* Expanded indicator list */}
                    {isExpanded && (
                      <div className="ml-3 mb-1.5 border-l-[1.5px] pl-5" style={{ borderColor: "rgba(208, 114, 37, 0.15)" }}>
                        {category.indicators.map((indicator, index) => {
                          const requiredTier = getTechnicalIndicatorRequiredTier(indicator.name)
                          const isLocked = !isTechnicalIndicatorAvailableForTier(indicator.name, userTier)
                          const gateCopy = getTierGateCopy(requiredTier)

                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleAddIndicator(indicator, "technical")}
                              className={`w-full flex items-center justify-between py-2 px-2.5 -ml-1 rounded transition-colors group text-left ${
                                isLocked ? "bg-slate-50/80 hover:bg-slate-100/90" : "hover:bg-secondary/60"
                              }`}
                              title={isLocked ? gateCopy.message : `Add ${indicator.name}`}
                            >
                              <div className="min-w-0 flex-1 mr-3">
                                <div className={`text-[13px] font-mono leading-tight ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                                  {indicator.name}
                                </div>
                                <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                                  {indicator.description}
                                </div>
                              </div>
                              {isLocked ? (
                                <TooltipProvider delayDuration={150}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span
                                        aria-hidden="true"
                                        className="flex-shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-muted-foreground"
                                      >
                                        <Lock className="h-3.5 w-3.5" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[220px] text-xs">
                                      {gateCopy.message}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span
                                  aria-hidden="true"
                                  className="flex-shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-md border border-transparent text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:border-[#d07225]/30 group-hover:bg-[#d07225]/5 group-hover:text-[#d07225] group-focus-visible:border-[#d07225]/30 group-focus-visible:bg-[#d07225]/5 group-focus-visible:text-[#d07225] transition-all"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
