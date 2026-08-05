"use client"

import { useId, useMemo } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { StrategyShowcaseIcon } from "./strategy-showcase-icon"
import type { Strategy } from "./types"

interface StrategyShowcaseCardProps {
  strategy: Strategy
  href?: string
  iconVariant?: number
  className?: string
}

interface StrategyShowcaseCardSkeletonProps {
  className?: string
}

function seedFromString(value: string) {
  let seed = 0

  for (let index = 0; index < value.length; index += 1) {
    seed = (seed * 31 + value.charCodeAt(index)) >>> 0
  }

  return seed || 1
}

function createSeededRandom(initialSeed: number) {
  let seed = initialSeed

  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function buildPlaceholderChart(strategyId: string, cumulativeReturn: number) {
  const width = 320
  const height = 120
  const pointCount = 34
  const random = createSeededRandom(seedFromString(strategyId))
  const direction = cumulativeReturn >= 0 ? 1 : -1
  const strength = Math.min(Math.max(Math.abs(cumulativeReturn), 18), 140)

  const values = Array.from({ length: pointCount }, (_, index) => {
    const progress = index / (pointCount - 1)
    const trend = direction * strength * Math.pow(progress, 1.28)
    const wave = Math.sin(progress * Math.PI * 4.5) * strength * 0.045
    const noise = (random() - 0.5) * strength * 0.1 * Math.sin(progress * Math.PI)

    return trend + wave + noise
  })

  values[0] = 0
  values[values.length - 1] = direction * strength

  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = Math.max(maximum - minimum, 1)

  const points = values.map((value, index) => {
    const x = (index / (pointCount - 1)) * width
    const y = height - 10 - ((value - minimum) / range) * (height - 20)
    return { x, y }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(" ")
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`

  return { linePath, areaPath }
}

function formatPercent(value: number, showPositiveSign = false) {
  const sign = showPositiveSign && value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export function StrategyShowcaseCard({
  strategy,
  href = "/strategies",
  iconVariant,
  className,
}: StrategyShowcaseCardProps) {
  const gradientId = `strategy-showcase-${useId().replaceAll(":", "")}`
  const chart = useMemo(
    () => buildPlaceholderChart(strategy.id, strategy.totalReturn),
    [strategy.id, strategy.totalReturn],
  )
  const returnIsPositive = strategy.totalReturn >= 0

  return (
    <Link
      href={href}
      className={cn(
        "group block h-[336px] shrink-0 rounded-xl outline-none transition-transform duration-200 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
        className,
      )}
      aria-label={`Lihat strategi ${strategy.name}`}
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-xl border-border/80 bg-card shadow-sm transition-shadow duration-200 group-hover:shadow-lg">
        <div className="flex min-h-16 items-start gap-3 px-4 pb-3 pt-4">
          <StrategyShowcaseIcon
            strategyId={strategy.id}
            strategyName={strategy.name}
            variant={iconVariant}
          />
          <h3 className="min-w-0 flex-1 line-clamp-2 font-heading text-base font-semibold leading-snug tracking-tight text-foreground">
            {strategy.name}
          </h3>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>

        <div className="h-[108px] w-full overflow-hidden bg-gradient-to-b from-muted/20 via-muted/10 to-card">
          <svg
            viewBox="0 0 320 120"
            preserveAspectRatio="none"
            className="block h-full w-full"
            role="img"
            aria-label={`Ilustrasi sementara cumulative return ${strategy.name}`}
          >
            <title>Ilustrasi sementara cumulative return {strategy.name}</title>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d07225" stopOpacity="0.24" />
                <stop offset="72%" stopColor="#d07225" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#d07225" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={chart.areaPath} fill={`url(#${gradientId})`} />
            <path
              d={chart.linePath}
              fill="none"
              stroke="#d07225"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="flex flex-1 flex-col bg-card">
          <div className="px-4 pb-2.5 pt-2 text-center">
            <div className="text-sm font-semibold text-foreground/75">
              Return
            </div>
            <div
              className={cn(
                "mt-0.5 font-ibm-plex-mono text-[1.75rem] font-semibold leading-tight tabular-nums",
                returnIsPositive ? "text-emerald-700" : "text-rose-600",
              )}
            >
              {formatPercent(strategy.totalReturn, true)}
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="px-3 py-2.5 text-center">
              <div className="text-xs text-muted-foreground">Max DD</div>
              <div className="mt-0.5 font-ibm-plex-mono text-sm font-medium tabular-nums text-rose-600">
                {formatPercent(strategy.maxDrawdown)}
              </div>
            </div>
            <div className="px-3 py-2.5 text-center">
              <div className="text-xs text-muted-foreground">Success rate</div>
              <div className="mt-0.5 font-ibm-plex-mono text-sm font-medium tabular-nums text-foreground">
                {formatPercent(strategy.winRate)}
              </div>
            </div>
          </div>

          <span className="mx-3 mb-3 mt-auto flex h-10 items-center justify-center rounded-lg border border-border/80 bg-muted/25 px-3 text-sm font-medium text-foreground/70 transition-colors hover:border-primary/25 hover:bg-muted/60 hover:text-primary">
            Lihat strategi
          </span>
        </div>
      </Card>
    </Link>
  )
}

export function StrategyShowcaseCardSkeleton({ className }: StrategyShowcaseCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "h-[336px] shrink-0 animate-pulse overflow-hidden rounded-xl border-border/80 bg-card",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex min-h-16 items-center gap-3 px-4">
        <div className="h-9 w-9 shrink-0 rounded-[10px] bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      <div className="h-[108px] bg-gradient-to-b from-muted/50 to-card" />
      <div className="flex flex-col items-center gap-2 px-4 py-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-7 w-28 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2">
        <div className="flex flex-col items-center gap-2 px-3 py-2.5">
          <div className="h-3 w-12 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
        <div className="flex flex-col items-center gap-2 px-3 py-2.5">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-4 w-14 rounded bg-muted" />
        </div>
      </div>
    </Card>
  )
}
