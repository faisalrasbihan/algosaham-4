"use client"

import { useEffect, useRef } from "react"

declare global {
    interface Window {
        TradingView?: any
        __tradingViewScriptPromise?: Promise<void>
    }
}

export interface AdvancedMultiChartProps {
    data: {
        dates: string[]
        close: number[]
        ma20: (number | null)[]
        ma50: (number | null)[]
        foreignFlowCumulative: number[]
    }
    symbol?: string
}

function loadTradingViewScript() {
    if (typeof window === "undefined") return Promise.resolve()
    if (window.TradingView) return Promise.resolve()
    if (window.__tradingViewScriptPromise) return window.__tradingViewScriptPromise

    window.__tradingViewScriptPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://s3.tradingview.com/tv.js"
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load TradingView script"))
        document.head.appendChild(script)
    })

    return window.__tradingViewScriptPromise
}

export function AdvancedMultiChart({ data: _data, symbol = "BBCA" }: AdvancedMultiChartProps) {
    const mainRef = useRef<HTMLDivElement>(null)
    const tradingViewContainerId = useRef(`tv-advanced-chart-${Math.random().toString(36).slice(2)}`)
    const tradingViewHeight = 560

    useEffect(() => {
        if (!mainRef.current) return

        let disposed = false
        mainRef.current.innerHTML = ""

        loadTradingViewScript()
            .then(() => {
                if (disposed || !mainRef.current || !window.TradingView) return

                mainRef.current.innerHTML = `<div id="${tradingViewContainerId.current}" style="width:100%;height:${tradingViewHeight}px;"></div>`

                new window.TradingView.widget({
                    autosize: true,
                    symbol: `IDX:${symbol.toUpperCase()}`,
                    interval: "D",
                    timezone: "Asia/Jakarta",
                    theme: "light",
                    style: "1",
                    locale: "id",
                    enable_publishing: false,
                    allow_symbol_change: false,
                    hide_top_toolbar: false,
                    hide_side_toolbar: true,
                    withdateranges: true,
                    container_id: tradingViewContainerId.current,
                    studies: [
                        "MASimple@tv-basicstudies",
                        "MASimple@tv-basicstudies",
                        "RSI@tv-basicstudies",
                        "MACD@tv-basicstudies",
                    ],
                })
            })
            .catch(() => {
                if (!disposed && mainRef.current) {
                    mainRef.current.innerHTML = `
                      <div style="height:${tradingViewHeight}px;display:flex;align-items:center;justify-content:center;border:1px solid #d0d5dc;border-radius:8px;color:#64748b;font-family:var(--font-ibm-plex-mono, monospace);font-size:12px;">
                        TradingView chart gagal dimuat
                      </div>
                    `
                }
            })

        return () => {
            disposed = true
            if (mainRef.current) mainRef.current.innerHTML = ""
        }
    }, [symbol])

    return (
        <div className="w-full relative">
            <div className="relative">
                <div ref={mainRef} className="w-full" />
            </div>
        </div>
    )
}
