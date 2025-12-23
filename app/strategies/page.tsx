"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { StrategyCards } from "@/components/strategy-cards"

export default function Strategies() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TickerTape />
      <div className="flex-1 overflow-y-auto mt-8 pb-8">
        <StrategyCards />
      </div>
    </div>
  )
}
