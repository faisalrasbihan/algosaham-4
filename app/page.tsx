import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { StrategyBuilder } from "@/components/strategy-builder"
import { ResultsPanel } from "@/components/results-panel"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TickerTape />
      <div className="flex h-[calc(100vh-104px)]">
        {/* Left Panel - Strategy Builder */}
        <div className="w-[380px] flex-shrink-0 bg-card border-r border-border overflow-y-auto">
          <StrategyBuilder />
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 overflow-y-auto">
          <ResultsPanel />
        </div>
      </div>
    </div>
  )
}
