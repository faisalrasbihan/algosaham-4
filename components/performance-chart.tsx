"use client"

import { useEffect, useRef } from "react"
// LineStyle is used for benchmark dashed line - uncomment when benchmark is enabled
import { createChart, IChartApi, ISeriesApi, /* LineStyle, */ ColorType, BaselineSeries } from "lightweight-charts"

interface PerformanceChartProps {
  data?: Array<{
    date: string
    portfolioValue: number
    benchmarkValue: number
    drawdown: number
  }>
}

// Format number as Indonesian Rupiah
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format date for display
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const strategySeriesRef = useRef<ISeriesApi<"Baseline"> | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  // TODO: Uncomment when LQ45 benchmark data is properly returned from API
  // const benchmarkSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)

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

    // Add strategy baseline series with 100% as the baseline
    // Above 100% = profit (green), Below 100% = loss (red)
    const strategySeries = chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: 100 },
      topLineColor: 'rgba(38, 166, 154, 1)',      // Green line for profit
      topFillColor1: 'rgba(38, 166, 154, 0.28)',  // Green fill top
      topFillColor2: 'rgba(38, 166, 154, 0.05)', // Green fill bottom (fade)
      bottomLineColor: 'rgba(239, 83, 80, 1)',    // Red line for loss
      bottomFillColor1: 'rgba(239, 83, 80, 0.05)', // Red fill top (fade)
      bottomFillColor2: 'rgba(239, 83, 80, 0.28)', // Red fill bottom
      lineWidth: 2,
      title: 'Strategy',
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `${price.toFixed(2)}%`,
      },
      lastValueVisible: true,
      priceLineVisible: true,
    }) as ISeriesApi<"Baseline">
    strategySeriesRef.current = strategySeries

    // TODO: Uncomment when LQ45 benchmark data is properly returned from API
    // Add benchmark line series (dashed)
    // const benchmarkSeries = chart.addSeries(LineSeries, {
    //   color: '#3b82f6',
    //   lineWidth: 2,
    //   lineStyle: LineStyle.Dashed,
    //   title: 'LQ45 Benchmark',
    //   priceFormat: {
    //     type: 'percent',
    //     precision: 2,
    //     minMove: 0.01,
    //   },
    //   lastValueVisible: true,
    //   priceLineVisible: true,
    // }) as ISeriesApi<"Line">
    // benchmarkSeriesRef.current = benchmarkSeries

    // Create tooltip element
    const toolTip = document.createElement('div')
    toolTip.style.position = 'absolute'
    toolTip.style.display = 'none'
    toolTip.style.padding = '12px'
    toolTip.style.boxSizing = 'border-box'
    toolTip.style.fontSize = '12px'
    toolTip.style.textAlign = 'left'
    toolTip.style.zIndex = '1000'
    toolTip.style.pointerEvents = 'none'
    toolTip.style.borderRadius = '8px'
    toolTip.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    toolTip.style.background = 'rgba(255, 255, 255, 0.95)'
    toolTip.style.color = '#1e293b'
    toolTip.style.border = '1px solid #e2e8f0'
    toolTip.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    toolTip.style.minWidth = '180px'
    chartContainerRef.current.appendChild(toolTip)
    tooltipRef.current = toolTip

    // Subscribe to crosshair move for tooltip
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        toolTip.style.display = 'none'
      } else {
        toolTip.style.display = 'block'
        const seriesData = param.seriesData.get(strategySeries)
        if (seriesData) {
          const value = (seriesData as { value: number }).value
          const initialCapital = 100000000
          const portfolioValue = (value / 100) * initialCapital
          const returnPercent = value - 100
          const isProfit = returnPercent >= 0

          const dateStr = formatDate(param.time as number)
          
          toolTip.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px; color: #64748b; font-size: 11px;">${dateStr}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">Portfolio:</span>
              <span style="font-weight: 600;">${formatRupiah(portfolioValue)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">Value:</span>
              <span style="font-weight: 600;">${value.toFixed(2)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Return:</span>
              <span style="font-weight: 600; color: ${isProfit ? 'rgba(38, 166, 154, 1)' : 'rgba(239, 83, 80, 1)'};">
                ${isProfit ? '+' : ''}${returnPercent.toFixed(2)}%
              </span>
            </div>
          `

          // Position tooltip
          const toolTipWidth = 180
          const toolTipHeight = 100
          let left = param.point.x + 15
          let top = param.point.y - toolTipHeight / 2

          // Keep tooltip within bounds
          if (left + toolTipWidth > chartContainerRef.current!.clientWidth) {
            left = param.point.x - toolTipWidth - 15
          }
          if (top < 0) {
            top = 0
          }
          if (top + toolTipHeight > chartContainerRef.current!.clientHeight) {
            top = chartContainerRef.current!.clientHeight - toolTipHeight
          }

          toolTip.style.left = left + 'px'
          toolTip.style.top = top + 'px'
        }
      }
    })

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (tooltipRef.current && chartContainerRef.current) {
        chartContainerRef.current.removeChild(tooltipRef.current)
      }
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!data || data.length === 0 || !strategySeriesRef.current) {
      return
    }

    // Process API data for TradingView format
    const initialCapital = 100000000
    const strategyData = data.map((item) => {
      const portfolioPercentage = (item.portfolioValue / initialCapital) * 100
      return {
        time: new Date(item.date).getTime() / 1000 as any, // Convert to Unix timestamp
        value: portfolioPercentage,
      }
    })

    // TODO: Uncomment when LQ45 benchmark data is properly returned from API
    // const benchmarkData = data.map((item) => {
    //   return {
    //     time: new Date(item.date).getTime() / 1000 as any,
    //     value: item.benchmarkValue,
    //   }
    // })

    // Set data to series
    strategySeriesRef.current.setData(strategyData)
    // benchmarkSeriesRef.current.setData(benchmarkData)

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
      <div ref={chartContainerRef} className="h-[400px] w-full relative" />
    </div>
  )
}
