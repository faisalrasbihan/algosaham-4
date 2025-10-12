import { ArrowRight } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Build Your Strategy",
      description:
        "Use our visual strategy builder to create your trading rules with technical indicators and conditions.",
    },
    {
      number: "02",
      title: "Backtest Against History",
      description: "Run your strategy against years of historical data to see how it would have performed.",
    },
    {
      number: "03",
      title: "Analyze Results",
      description: "Review detailed performance metrics, charts, and trade history to optimize your strategy.",
    },
    {
      number: "04",
      title: "Deploy with Confidence",
      description: "Take your validated strategy live knowing it's been thoroughly tested and optimized.",
    },
  ]

  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
            From idea to execution in four simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col">
                <div className="text-6xl font-bold text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground font-mono text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-12 -right-4 w-8 h-8 text-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
