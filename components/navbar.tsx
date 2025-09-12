import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="h-16 bg-card/50 backdrop-blur-sm border-b border-border px-6 flex items-center justify-between">
      <div className="text-xl font-medium" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
        <span className="text-orange-500">{">"}</span>
        <span className="text-black">algosaham.ai</span>
      </div>

      <div className="hidden md:flex items-center space-x-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">
          Backtest
        </a>
        <a href="#" className="hover:text-foreground transition-colors">
          Strategies
        </a>
        <a href="#" className="hover:text-foreground transition-colors">
          Portfolio
        </a>
        <a href="#" className="hover:text-foreground transition-colors">
          Pricing
        </a>
        <a href="#" className="hover:text-foreground transition-colors">
          About
        </a>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
        <Button size="sm" style={{ backgroundColor: "#305250", color: "white" }} className="hover:opacity-90">
          Sign Up
        </Button>
      </div>
    </nav>
  )
}
