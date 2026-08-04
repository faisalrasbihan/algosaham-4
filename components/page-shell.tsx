import * as React from "react"

import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"

type PageShellProps = {
  children: React.ReactNode
  className?: string
}

/**
 * App-page wrapper that pairs the floating navbar with a single atmospheric
 * field (see `.page-shell` in globals.css). Because the shell wraps the navbar
 * and its blur bleeds above the viewport, the field runs continuously behind
 * the navbar instead of starting with a hard seam below it.
 */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("page-shell flex min-h-screen flex-col", className)}>
      <Navbar />
      {children}
    </div>
  )
}
