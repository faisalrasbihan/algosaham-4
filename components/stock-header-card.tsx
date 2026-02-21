"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Image from "next/image"

interface TickerSummaryData {
  ticker: string
  company_name: string
  as_of: string
  last_updated: string
  data_mode: string
  price: number
  change_pct: number
  market_cap_group: string
  sector: string
  syariah: boolean
}

interface OverallScoreData {
  overall_score: number
  confidence: string
}

interface OHLCVData {
  dates: string[]
  close: number[]
}

interface StockHeaderCardProps {
  tickerData: TickerSummaryData
  scoreData: OverallScoreData
  ohlcvData: OHLCVData
}

export function StockHeaderCard({ tickerData, scoreData, ohlcvData }: StockHeaderCardProps) {
  const isPositive = tickerData.change_pct >= 0

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (confidence: string) => {
    const colors: Record<string, string> = {
      high: "border-green-600 text-green-700 bg-green-50",
      neutral: "border-yellow-600 text-yellow-700 bg-yellow-50",
      low: "border-red-600 text-red-700 bg-red-50",
    }
    return colors[confidence] || colors.neutral
  }

  // Prepare chart data
  const chartData = ohlcvData.dates.map((date, index) => ({
    date,
    close: ohlcvData.close[index],
  }))

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-border flex-shrink-0 relative overflow-hidden">
              <Image
                src={`/stock_icons/${tickerData.ticker}.png`}
                alt={`${tickerData.ticker} logo`}
                fill
                sizes="40px"
                className="object-contain p-1"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.classList.add('bg-muted');
                  const span = document.createElement('span');
                  span.className = 'font-bold text-lg font-ibm-plex-mono text-muted-foreground absolute inset-0 flex items-center justify-center';
                  span.textContent = tickerData.ticker.charAt(0);
                  (e.target as HTMLImageElement).parentElement!.appendChild(span);
                }}
              />
            </div>
            <h2 className="text-3xl font-bold font-ibm-plex-mono">
              {tickerData.ticker}
            </h2>
            {tickerData.syariah && (
              <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50">
                Syariah
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {tickerData.data_mode}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground mb-3">{tickerData.company_name}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{tickerData.sector}</span>
            <span>•</span>
            <span className="capitalize">{tickerData.market_cap_group} Cap</span>
            <span>•</span>
            <span>Per {tickerData.as_of}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl font-bold mb-2">Rp {tickerData.price.toLocaleString("id-ID")}</div>
          <div
            className={`text-lg font-semibold flex items-center justify-end gap-1 mb-4 ${isPositive ? "text-green-600" : "text-red-600"
              }`}
          >
            {isPositive ? (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 12 12">
                <path d="M6 2l4 8H2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 12 12">
                <path d="M6 10L2 2h8z" />
              </svg>
            )}
            <span>
              {isPositive ? "+" : ""}
              {tickerData.change_pct.toFixed(2)}%
            </span>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-muted-foreground">Skor Keseluruhan</div>
            <div className={`text-5xl font-bold ${getScoreColor(scoreData.overall_score)}`}>
              {scoreData.overall_score}
            </div>
            <Badge variant="outline" className={`${getConfidenceBadge(scoreData.confidence)}`}>
              {scoreData.confidence.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.slice(5)}
              stroke="#6b7280"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Close"]}
            />
            <Line type="monotone" dataKey="close" stroke="#305250" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card >
  )
}
