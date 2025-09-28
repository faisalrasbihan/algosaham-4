"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"


interface PerformanceChartProps {
  data?: Array<{
    date: string
    portfolioValue: number
    benchmarkValue: number
    drawdown: number
  }>
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  console.log('📈 [PERFORMANCE CHART] Received data:', {
    hasData: !!data,
    dataLength: data?.length || 0,
    sampleData: data?.[0] || null
  })
  
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
  
  // Process API data
  const chartData = data.map((item) => {
    // Convert date to readable format
    const date = new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    
    // Convert portfolio value to percentage (assuming initial capital is 1B)
    const initialCapital = 1000000000
    const portfolioPercentage = (item.portfolioValue / initialCapital) * 100
    
    return {
      date: date,
      strategy: portfolioPercentage,
      benchmark: item.benchmarkValue
    }
  })
  
  // Calculate dynamic y-axis domain based on data range
  const allValues = chartData.flatMap(item => [item.strategy, item.benchmark])
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  
  // Add 5% padding to the range for better visualization
  const range = maxValue - minValue
  const padding = range * 0.05
  const yAxisDomain = [minValue - padding, maxValue + padding]
  
  console.log('📈 [PERFORMANCE CHART] Final chart data:', {
    dataLength: chartData.length,
    sampleData: chartData[0] || null,
    lastData: chartData[chartData.length - 1] || null,
    yAxisDomain: yAxisDomain
  })
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} fontFamily="var(--font-mono)" />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            fontFamily="var(--font-mono)" 
            domain={yAxisDomain}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#1e293b",
            }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)}%`, 
              name === 'strategy' ? 'Strategy' : 'LQ45 Benchmark'
            ]}
          />
          <Legend />
          <Line type="monotone" dataKey="strategy" stroke="#d07225" strokeWidth={2} name="Strategy" dot={false} />
          <Line
            type="monotone"
            dataKey="benchmark"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="LQ45 Benchmark"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
