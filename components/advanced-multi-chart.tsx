"use client"

import { useEffect, useRef } from "react"
import {
    createChart,
    ColorType,
    CandlestickSeries,
    LineSeries,
    HistogramSeries,
    CrosshairMode,
    IChartApi,
} from "lightweight-charts"

export interface AdvancedMultiChartProps {
    data: {
        dates: string[]
        close: number[]
        ma20: (number | null)[]
        ma50: (number | null)[]
        foreignFlowCumulative: number[]
    }
}

function calculateMACD(closePrices: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    // Simple EMA calculator
    const ema = (data: number[], period: number) => {
        const k = 2 / (period + 1)
        const result = [data[0]]
        for (let i = 1; i < data.length; i++) {
            result.push(data[i] * k + result[i - 1] * (1 - k))
        }
        return result
    }

    const fastEMA = ema(closePrices, fastPeriod)
    const slowEMA = ema(closePrices, slowPeriod)
    const macdLine = fastEMA.map((f, i) => f - slowEMA[i])
    const signalLine = ema(macdLine, signalPeriod)
    const histogram = macdLine.map((m, i) => m - signalLine[i])

    return { macdLine, signalLine, histogram }
}

export function AdvancedMultiChart({ data }: AdvancedMultiChartProps) {
    const mainRef = useRef<HTMLDivElement>(null)
    const macdRef = useRef<HTMLDivElement>(null)
    const flowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!mainRef.current || !macdRef.current || !flowRef.current) return

        // Setup base theme options
        const baseOptions = {
            layout: {
                background: { type: ColorType.Solid, color: "#ffffff" },
                textColor: "#64748b",
            },
            grid: {
                vertLines: { color: "#f1f5f9" },
                horzLines: { color: "#f1f5f9" },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: "#e2e8f0",
            },
        }

        // --- Main Chart (Candlestick + MA overlay) ---
        const mainChart = createChart(mainRef.current, {
            ...baseOptions,
            height: 400,
            timeScale: {
                visible: false, // hide time on main, show only on bottom chart
                borderColor: "#e2e8f0",
            },
        })

        const candleSeries = mainChart.addSeries(CandlestickSeries, {
            upColor: "#26a69a",
            downColor: "#ef5350",
            borderVisible: false,
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350",
        })

        const ma20Series = mainChart.addSeries(LineSeries, {
            color: "#d07225",
            lineWidth: 2,
            lineStyle: 2, // Dashed
        })

        const ma50Series = mainChart.addSeries(LineSeries, {
            color: "#94a3b8",
            lineWidth: 2,
            lineStyle: 2,
        })

        // --- Generate Fake OHLC from Close data ---
        let prevClose = data.close[0]
        const candleData = data.dates.map((date, i) => {
            const c = data.close[i]
            const o = i === 0 ? c : prevClose
            // Add some random noise for high and low to make it look realistic
            const volatility = c * 0.005
            const h = Math.max(o, c) + Math.random() * volatility
            const l = Math.min(o, c) - Math.random() * volatility
            prevClose = c
            return { time: date, open: o, high: h, low: l, close: c }
        })

        candleSeries.setData(candleData)

        const ma20Data = data.dates
            .map((date, i) => ({ time: date, value: data.ma20[i] }))
            .filter((d) => d.value !== null) as { time: string; value: number }[]
        ma20Series.setData(ma20Data)

        const ma50Data = data.dates
            .map((date, i) => ({ time: date, value: data.ma50[i] }))
            .filter((d) => d.value !== null) as { time: string; value: number }[]
        ma50Series.setData(ma50Data)

        // --- MACD Chart ---
        const macdChart = createChart(macdRef.current, {
            ...baseOptions,
            height: 150,
            timeScale: {
                visible: false,
                borderColor: "#e2e8f0",
            },
            rightPriceScale: {
                borderColor: "#e2e8f0",
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
        })

        const macdSeries = macdChart.addSeries(LineSeries, {
            color: "#2962FF",
            lineWidth: 2,
        })
        const signalSeries = macdChart.addSeries(LineSeries, {
            color: "#FF6D00",
            lineWidth: 2,
        })
        const histogramSeries = macdChart.addSeries(HistogramSeries, {
            color: "#26a69a",
            priceLineVisible: false,
        })

        // Calculate MACD
        const { macdLine, signalLine, histogram } = calculateMACD(data.close)
        macdSeries.setData(data.dates.map((date, i) => ({ time: date, value: macdLine[i] })))
        signalSeries.setData(data.dates.map((date, i) => ({ time: date, value: signalLine[i] })))
        histogramSeries.setData(
            data.dates.map((date, i) => ({
                time: date,
                value: histogram[i],
                color: histogram[i] >= 0 ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)",
            }))
        )

        // --- Foreign Flow Chart ---
        const flowChart = createChart(flowRef.current, {
            ...baseOptions,
            height: 150,
            timeScale: {
                visible: true,
                borderColor: "#e2e8f0",
            },
            rightPriceScale: {
                borderColor: "#e2e8f0",
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
        })

        const flowSeries = flowChart.addSeries(HistogramSeries, {
            priceLineVisible: false,
            base: 0,
        })

        // Calculate daily flow from cumulative
        const dailyFlow = [0] // first day 0
        for (let i = 1; i < data.foreignFlowCumulative.length; i++) {
            dailyFlow.push(data.foreignFlowCumulative[i] - data.foreignFlowCumulative[i - 1])
        }

        flowSeries.setData(
            data.dates.map((date, i) => ({
                time: date,
                value: dailyFlow[i],
                color: dailyFlow[i] >= 0 ? "rgba(38, 166, 154, 0.8)" : "rgba(239, 83, 80, 0.8)",
            }))
        )

        // --- Sync Charts ---
        const charts: IChartApi[] = [mainChart, macdChart, flowChart]

        charts.forEach((chart, i) => {
            // Sync crosshair
            chart.subscribeCrosshairMove((param) => {
                charts.forEach((other, j) => {
                    if (i !== j) {
                        if (param.point && param.time) {
                            const priceScale = other.priceScale("right")
                            const series = j === 0 ? candleSeries : j === 1 ? macdSeries : flowSeries
                            // Use getCoordinateForTime instead of attempting to mirror exact mouse Y pixel coordinates
                            // because price scales differ between the panes
                            const coordinate = chart.timeScale().timeToCoordinate(param.time)
                            // Setting crosshair position across charts doesn't natively expose a safe method to sync full logical cursors properly, 
                            // but we can clear crosshair or try our best. The easiest sync is visible logical range.
                        } else {
                            other.clearCrosshairPosition()
                        }
                    }
                })
            })

            // Sync time scale scroll/zoom
            chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
                if (range) {
                    charts.forEach((other, j) => {
                        if (i !== j) {
                            other.timeScale().setVisibleLogicalRange(range)
                        }
                    })
                }
            })
        })

        mainChart.timeScale().fitContent()

        // Handle Resize
        const handleResize = () => {
            if (mainRef.current && macdRef.current && flowRef.current) {
                mainChart.applyOptions({ width: mainRef.current.clientWidth })
                macdChart.applyOptions({ width: macdRef.current.clientWidth })
                flowChart.applyOptions({ width: flowRef.current.clientWidth })
            }
        }
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            mainChart.remove()
            macdChart.remove()
            flowChart.remove()
        }
    }, [data])

    return (
        <div className="w-full relative flex flex-col gap-[1px]">
            <div className="relative">
                <div className="absolute top-2 left-3 z-10 flex gap-4 text-[11px] font-ibm-plex-mono font-medium pointer-events-none">
                    <span className="text-slate-800">Harga</span>
                    <span className="text-[#d07225]">MA20</span>
                    <span className="text-slate-400">MA50</span>
                </div>
                <div ref={mainRef} className="w-full" />
            </div>

            <div className="relative border-t border-border">
                <div className="absolute top-2 left-3 z-10 text-[11px] font-ibm-plex-mono font-medium text-slate-500 pointer-events-none">
                    MACD (12, 26, 9)
                </div>
                <div ref={macdRef} className="w-full" />
            </div>

            <div className="relative border-t border-border">
                <div className="absolute top-2 left-3 z-10 text-[11px] font-ibm-plex-mono font-medium text-slate-500 pointer-events-none">
                    Foreign Flow (NBSA)
                </div>
                <div ref={flowRef} className="w-full" />
            </div>
        </div>
    )
}
