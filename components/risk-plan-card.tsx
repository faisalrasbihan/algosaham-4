"use client"

import { Card } from "@/components/ui/card"

interface RiskPlanData {
  entry_reference: string
  entry_price: number
  stop_loss: number
  take_profit: number
  risk_reward: number
  holding_window_days: number
  confidence: string
  notes: string[]
}

interface RiskPlanCardProps {
  data: RiskPlanData
}

export function RiskPlanCard({ data }: RiskPlanCardProps) {
  const potentialLoss = ((data.entry_price - data.stop_loss) / data.entry_price) * 100
  const potentialGain = ((data.take_profit - data.entry_price) / data.entry_price) * 100

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Rencana Risk Management</h3>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
          <div className="text-sm text-muted-foreground mb-1">Entry Price</div>
          <div className="text-2xl font-bold text-blue-700">Rp {data.entry_price.toLocaleString("id-ID")}</div>
          <div className="text-xs text-muted-foreground mt-1 capitalize">{data.entry_reference.replace("_", " ")}</div>
        </div>

        <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
          <div className="text-sm text-muted-foreground mb-1">Stop Loss</div>
          <div className="text-2xl font-bold text-red-700">Rp {data.stop_loss.toLocaleString("id-ID")}</div>
          <div className="text-xs text-red-600 mt-1">-{potentialLoss.toFixed(2)}%</div>
        </div>

        <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
          <div className="text-sm text-muted-foreground mb-1">Take Profit</div>
          <div className="text-2xl font-bold text-green-700">Rp {data.take_profit.toLocaleString("id-ID")}</div>
          <div className="text-xs text-green-600 mt-1">+{potentialGain.toFixed(2)}%</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-slate-50">
          <div className="text-sm text-muted-foreground mb-1">Risk/Reward Ratio</div>
          <div className="text-xl font-semibold">1:{data.risk_reward.toFixed(1)}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50">
          <div className="text-sm text-muted-foreground mb-1">Holding Window</div>
          <div className="text-xl font-semibold">{data.holding_window_days} hari</div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-yellow-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Catatan Penting
        </h4>
        <ul className="space-y-1">
          {data.notes.map((note, index) => (
            <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
