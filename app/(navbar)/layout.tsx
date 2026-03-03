import type { ReactNode } from "react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"

export default function NavbarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <TickerTape />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  )
}
