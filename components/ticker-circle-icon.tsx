"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

type TickerCircleIconProps = {
  ticker: string
  className?: string
}

export function TickerCircleIcon({ ticker, className }: TickerCircleIconProps) {
  const [hasError, setHasError] = useState(false)
  const normalizedTicker = ticker.trim().toUpperCase()

  return (
    <span
      className={cn(
        "relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white",
        className,
      )}
      aria-hidden="true"
    >
      {hasError ? (
        <span className="text-[8px] font-semibold tracking-tight text-muted-foreground">
          {normalizedTicker.slice(0, 2)}
        </span>
      ) : (
        <Image
          src={`/stock_icons/${normalizedTicker}.png`}
          alt=""
          fill
          sizes="24px"
          className="object-contain p-0.5"
          onError={() => setHasError(true)}
        />
      )}
    </span>
  )
}
