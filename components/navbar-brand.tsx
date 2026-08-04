import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type NavbarBrandProps = {
  className?: string
  showBeta?: boolean
}

export function NavbarBrand({
  className,
  showBeta = true,
}: NavbarBrandProps) {
  return (
    <Link
      href="/"
      aria-label="Algosaham.ai home"
      className={cn(
        "flex min-w-0 items-center gap-2 font-ibm-plex-mono text-lg font-medium tracking-[-0.02em] text-foreground",
        className,
      )}
    >
      <span className="relative h-7 w-7 shrink-0">
        <Image
          src="/icons/logo.svg"
          alt=""
          fill
          priority
          className="object-contain"
        />
      </span>
      <span className="truncate">algosaham.ai</span>
      {showBeta ? (
        <span className="shrink-0 rounded-[5px] border border-[#d07225]/20 bg-[#d07225]/[0.08] px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-[0.08em] text-[#b85f19]">
          BETA
        </span>
      ) : null}
    </Link>
  )
}
