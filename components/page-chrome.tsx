import type { ReactNode } from "react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export function PageChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
