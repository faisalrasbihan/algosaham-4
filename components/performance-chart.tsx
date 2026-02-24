"use client"

import { useEffect, useRef } from "react"
import { createChart, IChartApi, ISeriesApi, LineStyle, ColorType, BaselineSeries, LineSeries } from "lightweight-charts"

export type BenchmarkType = "ihsg" | "lq45"

interface PerformanceChartProps {
  data?: Array<{
    date: string
    portfolioValue: number
    portfolioNormalized: number
    ihsgValue: number
    lq45Value: number
    drawdown: number
  }>
  selectedBenchmark?: BenchmarkType
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

export function PerformanceChart({ data, selectedBenchmark = "ihsg" }: PerformanceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const strategySeriesRef = useRef<ISeriesApi<"Baseline"> | null>(null)
  const benchmarkSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const benchmarkLabelRef = useRef<string>("IHSG")

  // Check if benchmark data is available
  const hasIhsgData = data?.some(item =>
    item.ihsgValue !== undefined &&
    item.ihsgValue !== null &&
    !isNaN(item.ihsgValue) &&
    item.ihsgValue > 0
  ) || false

  const hasLq45Data = data?.some(item =>
    item.lq45Value !== undefined &&
    item.lq45Value !== null &&
    !isNaN(item.lq45Value) &&
    item.lq45Value > 0
  ) || false

  const hasBenchmarkData = selectedBenchmark === "ihsg" ? hasIhsgData : hasLq45Data
  const benchmarkLabel = selectedBenchmark === "ihsg" ? "IHSG" : "LQ45"

  // Keep ref in sync with state for tooltip access
  benchmarkLabelRef.current = benchmarkLabel

  console.log('📈 [PERFORMANCE CHART] Received data:', {
    hasData: !!data,
    dataLength: data?.length || 0,
    sampleData: data?.[0] || null,
    hasIhsgData,
    hasLq45Data,
    selectedBenchmark,
    sampleIhsg: data?.[0]?.ihsgValue,
    sampleLq45: data?.[0]?.lq45Value
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
      // Use the container's actual height (controlled by CSS h-full in parent)
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
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
      handleScroll: false,
      handleScale: false,
      kineticScroll: {
        touch: false,
        mouse: false,
      },
    })

    chartRef.current = chart

    // Add strategy baseline series with 0% as the baseline
    // Above 0% = profit (green), Below 0% = loss (red)
    const strategySeries = chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: 0 },
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
      // Hide legend in series if needed, but we removed the custom one
    }) as ISeriesApi<"Baseline">
    strategySeriesRef.current = strategySeries

    // Add benchmark line series (dashed) for IHSG/Index comparison
    const benchmarkSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      title: 'IHSG Index',
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `${price.toFixed(2)}%`,
      },
      lastValueVisible: true,
      priceLineVisible: true,
    }) as ISeriesApi<"Line">
    benchmarkSeriesRef.current = benchmarkSeries

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
    toolTip.style.minWidth = '200px'
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
        const benchmarkData = param.seriesData.get(benchmarkSeries)

        if (seriesData) {
          const value = (seriesData as { value: number }).value
          const initialCapital = 100000000
          // Value is already percentage return, so calculate portfolio value from that
          // portfolio = initial * (1 + return/100)
          const portfolioValue = initialCapital * (1 + value / 100)
          const returnPercent = value
          const isProfit = returnPercent >= 0

          // Get benchmark value if available
          const benchmarkValue = benchmarkData ? (benchmarkData as { value: number }).value : null
          const benchmarkReturn = benchmarkValue // Value is already percentage return
          const isBenchmarkProfit = benchmarkReturn !== null && benchmarkReturn >= 0

          // Calculate alpha (strategy outperformance vs benchmark)
          const alpha = benchmarkReturn !== null ? returnPercent - benchmarkReturn : null
          const isAlphaPositive = alpha !== null && alpha >= 0

          const dateStr = formatDate(param.time as number)

          toolTip.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px; color: #64748b; font-size: 11px;">${dateStr}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">Portfolio:</span>
              <span style="font-weight: 600;">${formatRupiah(portfolioValue)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: rgba(38, 166, 154, 1);">Strategy:</span>
              <span style="font-weight: 600; color: ${isProfit ? 'rgba(38, 166, 154, 1)' : 'rgba(239, 83, 80, 1)'};">
                ${isProfit ? '+' : ''}${returnPercent.toFixed(2)}%
              </span>
            </div>
            ${benchmarkReturn !== null ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #3b82f6;">${benchmarkLabelRef.current}:</span>
              <span style="font-weight: 600; color: ${isBenchmarkProfit ? 'rgba(38, 166, 154, 1)' : 'rgba(239, 83, 80, 1)'};">
                ${isBenchmarkProfit ? '+' : ''}${benchmarkReturn.toFixed(2)}%
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">
              <span style="color: #64748b;">Alpha:</span>
              <span style="font-weight: 600; color: ${isAlphaPositive ? 'rgba(38, 166, 154, 1)' : 'rgba(239, 83, 80, 1)'};">
                ${isAlphaPositive ? '+' : ''}${alpha?.toFixed(2)}%
              </span>
            </div>
            ` : ''}
          `

          // Position tooltip
          const toolTipWidth = 200
          const toolTipHeight = benchmarkReturn !== null ? 150 : 100
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

    // Use ResizeObserver for more reliable resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0] && chartRef.current) {
        const { width, height } = entries[0].contentRect
        chartRef.current.applyOptions({ width, height })
        chartRef.current.timeScale().fitContent()
      }
    })

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
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

    // 🔍 LOG: Print raw data received from API
    console.log('📊 [PERFORMANCE CHART] ===== RAW CHART DATA =====')
    console.log('📊 [PERFORMANCE CHART] Total data points:', data.length)
    console.log('📊 [PERFORMANCE CHART] Full raw data:', JSON.stringify(data, null, 2))

    // Process API data for TradingView format
    // Use portfolioNormalized from API if available (already normalized to 100 baseline)
    const strategyData = data.map((item) => {
      // Prefer portfolioNormalized from API, fallback to manual calculation
      // Subtract 100 to make it 0-based percentage return
      const normalizedValue = item.portfolioNormalized !== undefined
        ? item.portfolioNormalized - 100
        : (item.portfolioValue / 100000000) * 100 - 100
      return {
        time: new Date(item.date).getTime() / 1000 as any, // Convert to Unix timestamp
        value: normalizedValue,
      }
    })

    // 🔍 LOG: Print processed strategy data
    console.log('📈 [PERFORMANCE CHART] ===== PROCESSED STRATEGY DATA =====')
    console.log('📈 [PERFORMANCE CHART] Using portfolioNormalized from API:', data[0]?.portfolioNormalized !== undefined)
    console.log('📈 [PERFORMANCE CHART] Strategy data points:', strategyData.length)
    console.log('📈 [PERFORMANCE CHART] Full strategy data:', JSON.stringify(strategyData, null, 2))
    console.log('📈 [PERFORMANCE CHART] First point:', strategyData[0])
    console.log('📈 [PERFORMANCE CHART] Last point:', strategyData[strategyData.length - 1])

    // Process benchmark data - API already returns normalized values (100 = baseline)
    // 🔍 LOG: Print benchmark availability
    console.log('📉 [PERFORMANCE CHART] ===== BENCHMARK DATA =====')
    console.log('📉 [PERFORMANCE CHART] Selected benchmark:', selectedBenchmark)
    console.log('📉 [PERFORMANCE CHART] Has IHSG data:', hasIhsgData)
    console.log('📉 [PERFORMANCE CHART] Has LQ45 data:', hasLq45Data)
    console.log('📉 [PERFORMANCE CHART] Sample values:', data.slice(0, 5).map(d => ({
      date: d.date,
      portfolioNormalized: d.portfolioNormalized,
      ihsgValue: d.ihsgValue,
      lq45Value: d.lq45Value
    })))

    // Set data to series
    strategySeriesRef.current.setData(strategyData)

    // Use selected benchmark (IHSG or LQ45)
    if (benchmarkSeriesRef.current && hasBenchmarkData) {
      // Update the series title to match selected benchmark
      benchmarkSeriesRef.current.applyOptions({
        title: `${benchmarkLabel} Index`,
      })

      const benchmarkData = data
        .filter(item => {
          const value = selectedBenchmark === "ihsg" ? item.ihsgValue : item.lq45Value
          return value !== undefined && value !== null && !isNaN(value)
        })
        .map((item) => {
          const value = selectedBenchmark === "ihsg" ? item.ihsgValue : item.lq45Value
          return {
            time: new Date(item.date).getTime() / 1000 as any,
            // Subtract 100 to make it 0-based percentage return
            value: value - 100,
          }
        })

      // 🔍 LOG: Print processed benchmark data
      console.log(`📉 [PERFORMANCE CHART] ${benchmarkLabel} data points:`, benchmarkData.length)
      console.log(`📉 [PERFORMANCE CHART] Processed ${benchmarkLabel} data:`, JSON.stringify(benchmarkData.slice(0, 5), null, 2))

      if (benchmarkData.length > 0) {
        benchmarkSeriesRef.current.setData(benchmarkData)
      }
    }

    // Fit content and trigger resize
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
      // Trigger resize to ensure proper rendering
      if (chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    console.log('✅ [PERFORMANCE CHART] ===== CHART DATA LOAD COMPLETE =====')
  }, [data, selectedBenchmark, hasBenchmarkData, benchmarkLabel, hasIhsgData, hasLq45Data])

  // Show error state if no data
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-muted-foreground font-mono text-lg mb-2">No Performance Data</div>
          <p className="text-muted-foreground font-mono text-sm">Run a backtest to see performance chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div ref={chartContainerRef} className="h-full w-full relative" />
      {/* Chart Legend */}
      {/* Chart Legend removed as per user request */}
    </div>
  )
}
