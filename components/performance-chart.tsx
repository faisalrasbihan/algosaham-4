"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { date: "2022-01", strategy: 100, benchmark: 100 },
  { date: "2022-03", strategy: 108, benchmark: 103 },
  { date: "2022-06", strategy: 115, benchmark: 98 },
  { date: "2022-09", strategy: 122, benchmark: 95 },
  { date: "2022-12", strategy: 118, benchmark: 92 },
  { date: "2023-03", strategy: 125, benchmark: 98 },
  { date: "2023-06", strategy: 132, benchmark: 105 },
  { date: "2023-09", strategy: 138, benchmark: 108 },
  { date: "2023-12", strategy: 145, benchmark: 112 },
  { date: "2024-01", strategy: 145.2, benchmark: 115 },
]

export function PerformanceChart() {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} fontFamily="var(--font-mono)" />
          <YAxis stroke="#64748b" fontSize={12} fontFamily="var(--font-mono)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#1e293b",
            }}
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
