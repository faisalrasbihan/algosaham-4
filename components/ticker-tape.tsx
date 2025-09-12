"use client"

import { useEffect, useState } from "react"

interface TickerItem {
  name: string
  change: number
  percentage: number
}

const mockStrategies: TickerItem[] = [
  { name: "BBCA Momentum", change: 2.5, percentage: 3.2 },
  { name: "TLKM Breakout", change: -1.8, percentage: -2.1 },
  { name: "ASII RSI", change: 4.2, percentage: 5.7 },
  { name: "BMRI MA Cross", change: -0.9, percentage: -1.3 },
  { name: "UNVR Bollinger", change: 3.1, percentage: 4.8 },
  { name: "BBRI Support", change: 1.7, percentage: 2.4 },
  { name: "GGRM Resistance", change: -2.3, percentage: -3.6 },
  { name: "ICBP Trend", change: 2.9, percentage: 3.9 },
  { name: "KLBF MACD", change: -1.2, percentage: -1.8 },
  { name: "INDF Stochastic", change: 3.8, percentage: 4.5 },
  { name: "ADRO Fibonacci", change: 1.4, percentage: 2.1 },
  { name: "PTBA Williams", change: -3.1, percentage: -4.2 },
  { name: "ITMG Pivot", change: 2.8, percentage: 3.5 },
  { name: "ANTM Channel", change: -0.7, percentage: -1.1 },
  { name: "TINS Divergence", change: 4.6, percentage: 6.2 },
  { name: "INCO Squeeze", change: 1.9, percentage: 2.7 },
  { name: "VALE Hammer", change: -2.6, percentage: -3.8 },
  { name: "MDKA Doji", change: 0.8, percentage: 1.2 },
  { name: "SMGR Engulfing", change: 3.4, percentage: 4.1 },
  { name: "WIKA Harami", change: -1.5, percentage: -2.3 },
]

export function TickerTape() {
  const [items, setItems] = useState<TickerItem[]>(mockStrategies)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          change: item.change + (Math.random() - 0.5) * 0.2,
          percentage: item.percentage + (Math.random() - 0.5) * 0.3,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-50 border-b border-border overflow-hidden h-10 flex items-center">
      <div className="animate-scroll flex items-center space-x-8 whitespace-nowrap min-w-full">
        {/* Triple the items for seamless infinite loop */}
        {[...items, ...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 font-mono text-sm flex-shrink-0 cursor-pointer hover:shadow-lg hover:bg-white hover:px-2 hover:py-1 hover:rounded-md transition-all duration-200 hover:z-10 relative"
            onClick={() => {
              console.log(`Navigating to ${item.name} strategy page`)
              // Here you would implement actual navigation logic
            }}
          >
            <span className="text-slate-700 font-medium">{item.name}</span>
            <span className={`flex items-center space-x-1 ${item.change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {item.change >= 0 ? (
                <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12">
                  <path d="M6 2l4 8H2z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12">
                  <path d="M6 10L2 2h8z" />
                </svg>
              )}
              <span>{Math.abs(item.change).toFixed(2)}</span>
              <span>
                ({item.percentage >= 0 ? "+" : ""}
                {item.percentage.toFixed(1)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
