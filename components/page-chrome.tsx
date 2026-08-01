import type { ReactNode } from "react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export function PageChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
