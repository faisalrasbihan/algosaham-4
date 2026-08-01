"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type TradePlan = {
    entryReference: string
    entryPrice: number
    stopLoss: number
    takeProfit: number
    riskReward: number
    holdingTerm: string
    confidence: string
    summary?: string
    notes: string[]
    currentPrice?: number
    levels?: {
        supports?: ApiPriceLevel[]
        resistances?: ApiPriceLevel[]
    }
}

type TradePlanCardProps = {
    riskPlan: TradePlan
    watchItems: string[]
    currentPrice: number
}

type PriceLevel = {
    kind: "support" | "resistance"
    label: string
    price: number
    basis?: string
    distancePct?: number
    /** 0 = nearest to price, higher = further away */
    rank: number
}

type ApiPriceLevel = {
    rank?: number
    label?: string
    price?: number
    basis?: string
    distancePct?: number
}

type PlacedPriceLevel = {
    level: PriceLevel
    pct: number
    labelLeft: number
    labelLane: number
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

function isFinitePositive(value: number | null | undefined): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0
}

function formatRupiah(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) return "N/A"
    return `Rp ${value.toLocaleString("id-ID")}`
}

function formatSignedPercent(value: number) {
    const prefix = value > 0 ? "+" : ""
    return `${prefix}${value.toFixed(2)}%`
}

function formatPercentValue(value: number | null | undefined, direction: "gain" | "loss") {
    if (value === null || value === undefined || Number.isNaN(value)) return "N/A"
    const prefix = direction === "gain" ? "+" : "-"
    return `${prefix}${Math.abs(value).toFixed(2)}%`
}

function formatEntryReference(value: string | null | undefined) {
    if (!value) return "Referensi entry"

    const normalized = value.toLowerCase().replace(/[\s-]+/g, "_")
    const labels: Record<string, string> = {
        close: "Harga terakhir",
        last_close: "Harga terakhir",
        support: "Area support",
        support_level: "Area support",
        swing_low: "Swing low",
        fibonacci: "Fibonacci",
        atr: "ATR",
        ma20: "MA20",
        ma50: "MA50",
        ma200: "MA200",
    }

    return labels[normalized] || value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatHoldingTerm(value: string | null | undefined) {
    if (!value) return "N/A"

    const labels: Record<string, string> = {
        short: "Pendek",
        short_term: "Pendek",
        medium: "Menengah",
        medium_term: "Menengah",
        long: "Panjang",
        long_term: "Panjang",
    }

    const normalized = value.toLowerCase().replace(/[\s-]+/g, "_")
    return labels[normalized] || value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildFallbackLevels(current: number, riskPlan: TradePlan) {
    const lossGap = isFinitePositive(riskPlan.stopLoss) && riskPlan.stopLoss < current
        ? current - riskPlan.stopLoss
        : current * 0.035
    const gainGap = isFinitePositive(riskPlan.takeProfit) && riskPlan.takeProfit > current
        ? riskPlan.takeProfit - current
        : current * 0.045

    const supports: PriceLevel[] = [1, 1.65, 2.35].map((multiplier, index) => ({
        kind: "support",
        label: `Support ${index + 1}`,
        price: Math.max(1, Math.round(current - lossGap * multiplier)),
        rank: index,
    }))

    const resistances: PriceLevel[] = [1, 1.65, 2.35].map((multiplier, index) => ({
        kind: "resistance",
        label: `Resistance ${index + 1}`,
        price: Math.max(1, Math.round(current + gainGap * multiplier)),
        rank: index,
    }))

    return { supports, resistances }
}

function resolveCurrentPrice(currentPrice: number, riskPlan: TradePlan) {
    if (isFinitePositive(riskPlan.currentPrice)) return riskPlan.currentPrice
    if (isFinitePositive(currentPrice)) return currentPrice
    if (isFinitePositive(riskPlan.entryPrice)) return riskPlan.entryPrice
    return 1
}

function normalizeLevels(kind: PriceLevel["kind"], levels: ApiPriceLevel[] | undefined) {
    return (levels ?? [])
        .map((level, index) => ({
            kind,
            label: level.label || `${kind === "support" ? "Support" : "Resistance"} ${index + 1}`,
            price: level.price ?? Number.NaN,
            basis: level.basis,
            distancePct: level.distancePct,
            rank: clamp((level.rank ?? index + 1) - 1, 0, 2),
        }))
        .filter((level) => Number.isFinite(level.price) && level.price > 0)
        .slice(0, 3)
}

// Opacity per rank: farthest levels are intentionally darkest.
const RANK_OPACITY = [0.42, 0.68, 1]
const LABEL_LANE_TOPS = [58, 82, 106, 130]
const MIN_LABEL_GAP_PCT = 13

function placeLevelLabels(levels: PriceLevel[], toPct: (value: number) => number) {
    const laneLastPct = LABEL_LANE_TOPS.map(() => Number.NEGATIVE_INFINITY)
    const placedByIndex = new Map<number, PlacedPriceLevel>()

    levels
        .map((level, index) => ({ level, index, pct: toPct(level.price) }))
        .sort((a, b) => a.pct - b.pct)
        .forEach((item) => {
            const availableLane = laneLastPct.findIndex((lastPct) => item.pct - lastPct >= MIN_LABEL_GAP_PCT)
            const fallbackLane = laneLastPct.indexOf(Math.min(...laneLastPct))
            const labelLane = availableLane >= 0 ? availableLane : fallbackLane

            laneLastPct[labelLane] = item.pct
            placedByIndex.set(item.index, {
                level: item.level,
                pct: item.pct,
                labelLeft: clamp(item.pct, 8, 92),
                labelLane,
            })
        })

    return levels
        .map((_, index) => placedByIndex.get(index))
        .filter((item): item is PlacedPriceLevel => Boolean(item))
}

export function TradePlanCard({ riskPlan, watchItems, currentPrice }: TradePlanCardProps) {
    // The card-level "complete" tooltip and the per-line tooltips overlap, so we
    // suppress the card one while a support/resistance line is hovered.
    const [planOpen, setPlanOpen] = useState(false)
    const [lineHovered, setLineHovered] = useState(false)

    const { stopLoss, entryPrice, takeProfit } = riskPlan
    const potentialLoss = entryPrice ? ((entryPrice - stopLoss) / entryPrice) * 100 : null
    const potentialGain = entryPrice ? ((takeProfit - entryPrice) / entryPrice) * 100 : null

    const current = resolveCurrentPrice(currentPrice, riskPlan)
    const apiSupports = normalizeLevels("support", riskPlan.levels?.supports)
    const apiResistances = normalizeLevels("resistance", riskPlan.levels?.resistances)
    const fallbackLevels = buildFallbackLevels(current, riskPlan)
    const supports = apiSupports.length ? apiSupports : fallbackLevels.supports
    const resistances = apiResistances.length ? apiResistances : fallbackLevels.resistances

    const levels = [...supports, ...resistances]
    const prices = [current, ...levels.map((l) => l.price)]
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const pad = (max - min) * 0.06 || 1
    const domainMin = min - pad
    const domainMax = max + pad
    const toPct = (value: number) => clamp(((value - domainMin) / (domainMax - domainMin)) * 100, 0, 100)

    const currentPct = toPct(current)
    const markerLeft = clamp(currentPct, 6, 94)
    const hasCurrent = Number.isFinite(currentPrice) && currentPrice > 0
    const placedLevels = placeLevelLabels(levels, toPct)

    return (
        <TooltipProvider delayDuration={80}>
            <Tooltip open={planOpen && !lineHovered} onOpenChange={setPlanOpen}>
                <TooltipTrigger asChild>
                    <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 min-h-[184px] h-full flex flex-col cursor-help">
                        <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trade Plan</div>
                            <span className="text-[10px] font-medium text-muted-foreground">R:R {riskPlan.riskReward.toFixed(1)}x</span>
                        </div>

                        <div className="relative flex flex-1 flex-col justify-center">
                          <div className="relative w-full pt-7 pb-2">
                            {/* current price flag */}
                            <div
                                className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                                style={{ left: `${markerLeft}%` }}
                            >
                                <span className="whitespace-nowrap text-[10px] font-semibold font-ibm-plex-mono leading-none text-foreground">
                                    {formatRupiah(current)}
                                </span>
                                <svg width="9" height="6" viewBox="0 0 9 6" className="mt-1 text-foreground" aria-hidden="true">
                                    <path d="M0 0 L9 0 L4.5 6 Z" fill="currentColor" />
                                </svg>
                            </div>

                            <div className="relative h-[144px]">
                                {/* track with a soft support→resistance wash */}
                                <div className="absolute inset-x-0 top-7 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-border">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500/25 to-transparent"
                                        style={{ width: `${currentPct}%` }}
                                    />
                                    <div
                                        className="absolute inset-y-0 right-0 bg-gradient-to-l from-green-600/25 to-transparent"
                                        style={{ left: `${currentPct}%` }}
                                    />
                                </div>

                                {/* support / resistance lines */}
                                {placedLevels.map(({ level, pct }) => {
                                    const isSupport = level.kind === "support"
                                    const color = isSupport ? "#dc2626" : "#16a34a"
                                    const opacity = RANK_OPACITY[level.rank] ?? 0.3
                                    const distancePct = level.distancePct ?? ((level.price - current) / current) * 100
                                    return (
                                        <Tooltip key={level.label}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="group absolute top-7 flex h-10 -translate-x-1/2 -translate-y-1/2 items-center px-1.5"
                                                    style={{ left: `${pct}%` }}
                                                    onMouseEnter={() => setLineHovered(true)}
                                                    onMouseLeave={() => setLineHovered(false)}
                                                    aria-label={`${level.label}: ${formatRupiah(level.price)}`}
                                                >
                                                    <span
                                                        className="h-5 w-[3px] rounded-[1px] transition-transform group-hover:scale-y-110"
                                                        style={{ backgroundColor: color, opacity }}
                                                    />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="text-xs">
                                                    <div className="flex items-center gap-1.5 font-medium">
                                                        <span
                                                            className="inline-block h-2 w-2 rounded-[1px]"
                                                            style={{ backgroundColor: color, opacity }}
                                                        />
                                                        {level.label}
                                                    </div>
                                                    <div className="mt-0.5 font-ibm-plex-mono font-semibold">{formatRupiah(level.price)}</div>
                                                    {level.basis ? <div className="text-[11px] text-muted-foreground">{level.basis}</div> : null}
                                                    <div className="text-[11px] font-ibm-plex-mono" style={{ color }}>
                                                        {formatSignedPercent(distancePct)} dari harga
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    )
                                })}

                                {/* current price line */}
                                <span
                                    className="absolute top-7 h-6 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-foreground"
                                    style={{ left: `${currentPct}%` }}
                                />

                                {/* placed labels use lanes so nearby levels do not collide */}
                                {placedLevels.map(({ level, labelLeft, labelLane }) => {
                                    const isSupport = level.kind === "support"
                                    const opacity = RANK_OPACITY[level.rank] ?? 0.3
                                    const levelCode = `${isSupport ? "S" : "R"}${level.rank + 1}`
                                    return (
                                        <span
                                            key={`${level.label}-label`}
                                            className={`pointer-events-none absolute flex -translate-x-1/2 flex-col items-center rounded bg-background/90 px-1.5 py-1 font-ibm-plex-mono leading-none tracking-normal ring-1 ring-border/40 ${
                                                isSupport ? "text-red-700" : "text-green-700"
                                            }`}
                                            style={{
                                                left: `${labelLeft}%`,
                                                top: LABEL_LANE_TOPS[labelLane],
                                                opacity: Math.max(opacity, 0.76),
                                            }}
                                        >
                                            <span className="whitespace-nowrap text-[9px] font-semibold">
                                                {formatRupiah(level.price).replace("Rp ", "")}
                                            </span>
                                            <span className="mt-1 text-[8px] font-bold opacity-70">
                                                {levelCode}
                                            </span>
                                        </span>
                                    )
                                })}
                            </div>
                          </div>
                        </div>
                    </div>
                </TooltipTrigger>

                <TooltipContent side="bottom" align="end" className="w-[300px] max-w-[90vw] p-0 text-popover-foreground">
                    <div className="p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold">Trade Plan</div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-lg border border-border/70 bg-background/60 px-2 py-2">
                                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Entry</div>
                                <div className="mt-1 text-xs font-semibold font-ibm-plex-mono">{formatRupiah(entryPrice)}</div>
                                <div className="mt-0.5 text-[9px] text-muted-foreground">{formatEntryReference(riskPlan.entryReference)}</div>
                            </div>
                            <div className="rounded-lg border border-border/70 bg-background/60 px-2 py-2">
                                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Stop</div>
                                <div className="mt-1 text-xs font-semibold font-ibm-plex-mono">{formatRupiah(stopLoss)}</div>
                                <div className="mt-0.5 text-[9px] text-red-700">{formatPercentValue(potentialLoss, "loss")}</div>
                            </div>
                            <div className="rounded-lg border border-border/70 bg-background/60 px-2 py-2">
                                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Target</div>
                                <div className="mt-1 text-xs font-semibold font-ibm-plex-mono">{formatRupiah(takeProfit)}</div>
                                <div className="mt-0.5 text-[9px] text-green-700">{formatPercentValue(potentialGain, "gain")}</div>
                            </div>
                        </div>

                        {hasCurrent ? (
                            <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                <span>Harga sekarang</span>
                                <span className="font-semibold font-ibm-plex-mono text-foreground">{formatRupiah(currentPrice)}</span>
                            </div>
                        ) : null}

                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                            Upside sekitar {riskPlan.riskReward.toFixed(1)}x downside risk · Hold {formatHoldingTerm(riskPlan.holdingTerm)}. {riskPlan.summary || "Gunakan level stop sebagai invalidation utama, bukan sekadar angka administratif."}
                        </p>

                        {watchItems.length > 0 ? (
                            <div className="mt-3">
                                <div className="mb-2 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-[11px] font-semibold text-muted-foreground">Things To Watch</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {watchItems.map((item, i) => (
                                        <span key={`${item}-${i}`} className="rounded-full border border-border/70 bg-background/60 px-2 py-1 text-[10px] leading-snug text-muted-foreground">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
