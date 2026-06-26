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
    /** 0 = nearest to price (strongest), higher = further away (weaker) */
    rank: number
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
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

// Opacity per rank (nearest level is the most saturated / "strongest").
const RANK_OPACITY = [1, 0.62, 0.34]

export function TradePlanCard({ riskPlan, watchItems, currentPrice }: TradePlanCardProps) {
    // The card-level "complete" tooltip and the per-line tooltips overlap, so we
    // suppress the card one while a support/resistance line is hovered.
    const [planOpen, setPlanOpen] = useState(false)
    const [lineHovered, setLineHovered] = useState(false)

    const { stopLoss, entryPrice, takeProfit } = riskPlan
    const potentialLoss = entryPrice ? ((entryPrice - stopLoss) / entryPrice) * 100 : null
    const potentialGain = entryPrice ? ((takeProfit - entryPrice) / entryPrice) * 100 : null

    // --- DUMMY DATA (replace with real technical levels later) ---
    const current = 4920
    const supports: PriceLevel[] = [
        { kind: "support", label: "Support 1", price: 4780, rank: 0 },
        { kind: "support", label: "Support 2", price: 4600, rank: 1 },
        { kind: "support", label: "Support 3", price: 4350, rank: 2 },
    ]
    const resistances: PriceLevel[] = [
        { kind: "resistance", label: "Resistance 1", price: 5120, rank: 0 },
        { kind: "resistance", label: "Resistance 2", price: 5340, rank: 1 },
        { kind: "resistance", label: "Resistance 3", price: 5700, rank: 2 },
    ]
    // -------------------------------------------------------------

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

    return (
        <TooltipProvider delayDuration={80}>
            <Tooltip open={planOpen && !lineHovered} onOpenChange={setPlanOpen}>
                <TooltipTrigger asChild>
                    <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 min-h-[136px] h-full flex flex-col justify-between cursor-help">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trade Plan</div>
                            <span className="text-[10px] font-medium text-muted-foreground">R:R {riskPlan.riskReward.toFixed(1)}x</span>
                        </div>

                        <div className="relative pt-7 pb-1">
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

                            <div className="relative h-9">
                                {/* track with a soft support→resistance wash */}
                                <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-border">
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
                                {levels.map((level) => {
                                    const isSupport = level.kind === "support"
                                    const color = isSupport ? "#dc2626" : "#16a34a"
                                    const opacity = RANK_OPACITY[level.rank] ?? 0.3
                                    const distancePct = ((level.price - current) / current) * 100
                                    return (
                                        <Tooltip key={level.label}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="group absolute top-1/2 flex h-full -translate-x-1/2 -translate-y-1/2 items-center px-1.5"
                                                    style={{ left: `${toPct(level.price)}%` }}
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
                                    className="absolute top-1/2 h-6 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-foreground"
                                    style={{ left: `${currentPct}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] uppercase tracking-wide">
                            <span className="font-medium text-red-700/80">Support</span>
                            <span className="text-muted-foreground/60">Harga sekarang</span>
                            <span className="font-medium text-green-700/80">Resistance</span>
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
