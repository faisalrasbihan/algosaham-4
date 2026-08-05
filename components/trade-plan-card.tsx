"use client"

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

// Nearest levels carry the most visual weight; more distant levels recede.
const RANK_OPACITY = [1, 0.68, 0.42]
const LABEL_LANE_TOPS = {
    resistance: [4, 28],
    support: [98, 122],
} as const
const MIN_LABEL_GAP_PCT = 15

function placeLevelLabels(levels: PriceLevel[], toPct: (value: number) => number) {
    const laneLastPct: Record<PriceLevel["kind"], number[]> = {
        support: LABEL_LANE_TOPS.support.map(() => Number.NEGATIVE_INFINITY),
        resistance: LABEL_LANE_TOPS.resistance.map(() => Number.NEGATIVE_INFINITY),
    }
    const placedByIndex = new Map<number, PlacedPriceLevel>()

    levels
        .map((level, index) => ({ level, index, pct: toPct(level.price) }))
        .sort((a, b) => a.pct - b.pct)
        .forEach((item) => {
            const lanes = laneLastPct[item.level.kind]
            const availableLane = lanes.findIndex((lastPct) => item.pct - lastPct >= MIN_LABEL_GAP_PCT)
            const fallbackLane = lanes.indexOf(Math.min(...lanes))
            const labelLane = availableLane >= 0 ? availableLane : fallbackLane

            lanes[labelLane] = item.pct
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

function PriceLevelDetails({
    level,
    current,
    color,
    opacity,
}: {
    level: PriceLevel
    current: number
    color: string
    opacity: number
}) {
    const isSupport = level.kind === "support"
    const levelName = `${isSupport ? "Support" : "Resistance"} ${level.rank + 1}`
    const distancePct = level.distancePct ?? ((level.price - current) / current) * 100

    return (
        <div className="text-xs">
            <div className="flex items-center gap-1.5 font-medium">
                <span className="inline-block h-2 w-2 rounded-[1px]" style={{ backgroundColor: color, opacity }} />
                {levelName}
            </div>
            <div className="mt-0.5 font-semibold tabular-nums">{formatRupiah(level.price)}</div>
            {level.basis ? <div className="text-[11px] text-muted-foreground">{level.basis}</div> : null}
            <div className="text-[11px] tabular-nums" style={{ color }}>
                {formatSignedPercent(distancePct)} dari harga
            </div>
        </div>
    )
}

export function TradePlanCard({ riskPlan, watchItems, currentPrice }: TradePlanCardProps) {
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
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/90">
                <div className="grid grid-cols-2 gap-px border-b border-border/70 bg-border/70 sm:grid-cols-5">
                    <div className="bg-card/95 px-4 py-3.5">
                        <div className="text-xs text-muted-foreground">Harga masuk</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums text-foreground">{formatRupiah(entryPrice)}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{formatEntryReference(riskPlan.entryReference)}</div>
                    </div>
                    <div className="bg-card/95 px-4 py-3.5">
                        <div className="text-xs text-muted-foreground">Batas rugi</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums text-foreground">{formatRupiah(stopLoss)}</div>
                        <div className="mt-0.5 text-[11px] tabular-nums text-red-700">{formatPercentValue(potentialLoss, "loss")}</div>
                    </div>
                    <div className="bg-card/95 px-4 py-3.5">
                        <div className="text-xs text-muted-foreground">Target</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums text-foreground">{formatRupiah(takeProfit)}</div>
                        <div className="mt-0.5 text-[11px] tabular-nums text-green-700">{formatPercentValue(potentialGain, "gain")}</div>
                    </div>
                    <div className="bg-card/95 px-4 py-3.5">
                        <div className="text-xs text-muted-foreground">Risiko/imbal hasil</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums text-foreground">1 : {riskPlan.riskReward.toFixed(1)}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">Potensi relatif</div>
                    </div>
                    <div className="col-span-2 bg-card/95 px-4 py-3.5 sm:col-span-1">
                        <div className="text-xs text-muted-foreground">Jangka waktu</div>
                        <div className="mt-1 text-sm font-semibold text-foreground">{formatHoldingTerm(riskPlan.holdingTerm)}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">Perkiraan posisi</div>
                    </div>
                </div>

                <div className="px-4 py-5 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Level harga</h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">Area support dan resistance relatif terhadap harga saat ini.</p>
                        </div>
                        {hasCurrent ? (
                            <div className="text-right text-xs text-muted-foreground">
                                Harga saat ini
                                <span className="ml-2 font-semibold tabular-nums text-foreground">{formatRupiah(currentPrice)}</span>
                            </div>
                        ) : null}
                    </div>

                    <div className="relative mt-6 w-full pt-7" aria-label={`Level harga saat ini ${formatRupiah(current)}`}>
                        <div
                            className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                            style={{ left: `${markerLeft}%` }}
                        >
                            <span className="whitespace-nowrap text-[11px] font-semibold tabular-nums leading-none text-foreground">
                                {formatRupiah(current)}
                            </span>
                            <svg width="9" height="6" viewBox="0 0 9 6" className="mt-1 text-foreground" aria-hidden="true">
                                <path d="M0 0 L9 0 L4.5 6 Z" fill="currentColor" />
                            </svg>
                        </div>

                        <div className="relative h-[144px]">
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

                            {placedLevels.map(({ level, pct }) => {
                                const isSupport = level.kind === "support"
                                const color = isSupport ? "#dc2626" : "#16a34a"
                                const opacity = RANK_OPACITY[level.rank] ?? 0.3
                                const levelName = `${isSupport ? "Support" : "Resistance"} ${level.rank + 1}`
                                return (
                                    <Tooltip key={`${level.kind}-${level.label}`}>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="group absolute top-7 flex h-10 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                style={{ left: `${pct}%` }}
                                                aria-label={`${levelName}: ${formatRupiah(level.price)}`}
                                            >
                                                <span
                                                    className="h-5 w-[3px] rounded-[1px] transition-transform group-hover:scale-y-110 group-focus-visible:scale-y-110"
                                                    style={{ backgroundColor: color, opacity }}
                                                />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <PriceLevelDetails level={level} current={current} color={color} opacity={opacity} />
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}

                            <span
                                className="absolute top-7 h-6 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-foreground"
                                style={{ left: `${currentPct}%` }}
                            />

                            {placedLevels.map(({ level, labelLeft, labelLane }) => {
                                const isSupport = level.kind === "support"
                                const color = isSupport ? "#dc2626" : "#16a34a"
                                const opacity = RANK_OPACITY[level.rank] ?? 0.3
                                const levelName = `${isSupport ? "Support" : "Resistance"} ${level.rank + 1}`
                                return (
                                    <Tooltip key={`${level.kind}-${level.label}-label`}>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className={`absolute flex -translate-x-1/2 flex-col items-center rounded-md px-2 py-1 leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                                    isSupport ? "bg-red-500/[0.06] text-red-700" : "bg-green-600/[0.06] text-green-700"
                                                }`}
                                                style={{
                                                    left: `${labelLeft}%`,
                                                    top: LABEL_LANE_TOPS[labelLane],
                                                    opacity: Math.max(opacity, 0.76),
                                                }}
                                                aria-label={`${levelName}: ${formatRupiah(level.price)}`}
                                            >
                                                <span className="whitespace-nowrap text-[9px] font-semibold tabular-nums">
                                                    {formatRupiah(level.price).replace("Rp ", "")}
                                                </span>
                                                <span className="mt-1 whitespace-nowrap text-[8px] font-medium opacity-70">{levelName}</span>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <PriceLevelDetails level={level} current={current} color={color} opacity={opacity} />
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 border-t border-border/70 px-4 py-5 sm:px-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Ringkasan rencana</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {riskPlan.summary || "Gunakan level stop loss sebagai batas invalidasi utama dan sesuaikan ukuran posisi dengan toleransi risiko Anda."}
                        </p>
                    </div>

                    {watchItems.length > 0 ? (
                        <div className="md:border-l md:border-border/70 md:pl-5">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <h3 className="text-sm font-semibold text-foreground">Hal yang perlu dipantau</h3>
                            </div>
                            <ul className="mt-2 space-y-1.5 text-sm leading-5 text-muted-foreground">
                                {watchItems.map((item, index) => (
                                    <li key={`${item}-${index}`} className="flex gap-2">
                                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" aria-hidden="true" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </div>
        </TooltipProvider>
    )
}
