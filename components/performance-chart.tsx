"use client"

import { useEffect, useRef } from "react"
import { createChart, IChartApi, ISeriesApi, LineStyle, ColorType, LineSeries } from "lightweight-charts"

interface PerformanceChartProps {
  data?: Array<{
    date: string
    portfolioValue: number
    benchmarkValue: number
    drawdown: number
  }>
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const strategySeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const benchmarkSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)

  console.log('📈 [PERFORMANCE CHART] Received data:', {
    hasData: !!data,
    dataLength: data?.length || 0,
    sampleData: data?.[0] || null
  })

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart with light theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#1e293b',
      },
      grid: {
        vertLines: { color: '#e2e8f0' },
        horzLines: { color: '#e2e8f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      rightPriceScale: {
        borderColor: '#e2e8f0',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    // Add strategy line series
    const strategySeries = chart.addSeries(LineSeries, {
      color: '#d07225',
      lineWidth: 2,
      title: 'Strategy',
      priceFormat: {
        type: 'percent',
        precision: 2,
        minMove: 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: true,
    }) as ISeriesApi<"Line">
    strategySeriesRef.current = strategySeries

    // Add benchmark line series (dashed)
    const benchmarkSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      title: 'LQ45 Benchmark',
      priceFormat: {
        type: 'percent',
        precision: 2,
        minMove: 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: true,
    }) as ISeriesApi<"Line">
    benchmarkSeriesRef.current = benchmarkSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!data || data.length === 0 || !strategySeriesRef.current || !benchmarkSeriesRef.current) {
      return
    }

    // Process API data for TradingView format
    const initialCapital = 1000000000
    const strategyData = data.map((item) => {
      const portfolioPercentage = (item.portfolioValue / initialCapital) * 100
      return {
        time: new Date(item.date).getTime() / 1000 as any, // Convert to Unix timestamp
        value: portfolioPercentage,
      }
    })

    const benchmarkData = data.map((item) => {
      return {
        time: new Date(item.date).getTime() / 1000 as any,
        value: item.benchmarkValue,
      }
    })

    // Set data to series
    strategySeriesRef.current.setData(strategyData)
    benchmarkSeriesRef.current.setData(benchmarkData)

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }, [data])

  // Show error state if no data
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground font-mono text-lg mb-2">No Performance Data</div>
          <p className="text-muted-foreground font-mono text-sm">Run a backtest to see performance chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div ref={chartContainerRef} className="h-[400px] w-full" />
    </div>
  )
}
