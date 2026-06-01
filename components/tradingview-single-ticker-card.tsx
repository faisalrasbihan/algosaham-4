"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

type TradingViewSingleTickerCardProps = {
  ticker: string
  price: number
  changePct: number
  volumeLabel: string
  high52w: number
  low52w: number
}

const WIDGET_BASE_URL = "https://www.tradingview-widget.com/embed-widget/single-quote/"

function formatPrice(value: number) {
  return value.toLocaleString("id-ID")
}

function getTradingViewSymbol(ticker: string) {
  const cleanTicker = ticker.trim().toUpperCase().replace(/\.JK$/, "")
  return `IDX:${cleanTicker}`
}

function getTradingViewSymbolPath(symbol: string) {
  return symbol.replace(":", "-")
}

function getTradingViewEmbedUrl(symbol: string) {
  const options = {
    symbol,
    width: "100%",
    colorTheme: "light",
    isTransparent: true,
    height: 126,
    utm_source: "algosaham.ai",
    utm_medium: "widget",
    utm_campaign: "single-quote",
  }

  return `${WIDGET_BASE_URL}?locale=en&symbol=${encodeURIComponent(symbol)}#${encodeURIComponent(JSON.stringify(options))}`
}

export function TradingViewSingleTickerCard({
  ticker,
  price,
  changePct,
  volumeLabel,
  high52w,
  low52w,
}: TradingViewSingleTickerCardProps) {
  const [hasWidgetLoaded, setHasWidgetLoaded] = useState(false)
  const [shouldRenderWidget, setShouldRenderWidget] = useState(false)
  const isPositive = changePct >= 0
  const changeColorClass = isPositive ? "text-green-800" : "text-red-800"

  const symbol = useMemo(() => getTradingViewSymbol(ticker), [ticker])
  const symbolPath = useMemo(() => getTradingViewSymbolPath(symbol), [symbol])
  const widgetUrl = useMemo(() => getTradingViewEmbedUrl(symbol), [symbol])

  useEffect(() => {
    setHasWidgetLoaded(false)
    setShouldRenderWidget(false)

    const renderTimer = window.setTimeout(() => setShouldRenderWidget(true), 0)

    return () => {
      window.clearTimeout(renderTimer)
    }
  }, [widgetUrl])

  return (
    <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 h-full min-h-[136px] overflow-hidden flex flex-col min-w-0">
      <div className="relative min-h-[76px] flex-1">
        <div
          aria-label={`${ticker} TradingView ticker container`}
          className="tradingview-widget-container w-full max-w-full overflow-hidden"
        >
          {shouldRenderWidget ? (
            <iframe
              title={`${ticker} TradingView ticker`}
              src={widgetUrl}
              className="block h-[94px] w-full max-w-full border-0"
              scrolling="no"
              onLoad={() => setHasWidgetLoaded(true)}
              onError={() => setHasWidgetLoaded(false)}
            />
          ) : null}
          <div className="tradingview-widget-copyright truncate text-center text-[10px] leading-4 text-muted-foreground">
            <a
              href={`https://www.tradingview.com/symbols/${symbolPath}/`}
              rel="noopener nofollow"
              target="_blank"
              className="text-muted-foreground hover:text-foreground"
            >
              {ticker.toUpperCase()} quote
            </a>
            <span> by TradingView</span>
          </div>
        </div>

        {!hasWidgetLoaded && (
          <div className="absolute inset-0 flex flex-col justify-center bg-background/95">
            <div className="text-3xl sm:text-4xl font-bold font-ibm-plex-mono">Rp {formatPrice(price)}</div>
            <div className={`text-sm font-semibold flex items-center gap-1 mt-1 ${changeColorClass}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {isPositive ? "+" : ""}
              {changePct.toFixed(2)}%
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-auto pt-2 text-[11px] text-muted-foreground font-ibm-plex-mono whitespace-nowrap overflow-x-auto">
        <span>Vol {volumeLabel}</span>
        <span>52w H {formatPrice(high52w)}</span>
        <span>52w L {formatPrice(low52w)}</span>
      </div>
    </div>
  )
}
