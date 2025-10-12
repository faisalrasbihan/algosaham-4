import { LineChart, Zap, Shield, Code2, TrendingUp, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: LineChart,
      title: "Advanced Backtesting",
      description: "Test your strategies against historical data with precision and accuracy.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get results in under a second with our optimized backtesting engine.",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Built-in risk metrics and position sizing to protect your capital.",
    },
    {
      icon: Code2,
      title: "Custom Indicators",
      description: "Create and test custom technical indicators with our visual builder.",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Detailed metrics including Sharpe ratio, drawdown, and win rate.",
    },
    {
      icon: Users,
      title: "Community Strategies",
      description: "Learn from top traders and share your successful strategies.",
    },
  ]

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need to succeed</h2>
          <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
            Professional-grade tools designed for traders who take their craft seriously.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground font-mono text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
