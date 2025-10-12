import { TrendingUp, Users, BarChart3, Zap } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Active Traders",
    },
    {
      icon: BarChart3,
      value: "50,000+",
      label: "Strategies Backtested",
    },
    {
      icon: TrendingUp,
      value: "85%",
      label: "Success Rate",
    },
    {
      icon: Zap,
      value: "<1s",
      label: "Backtest Speed",
    },
  ]

  return (
    <section className="py-16 px-4 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-mono">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
