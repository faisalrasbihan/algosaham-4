import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type NavbarBrandProps = {
  className?: string
}

export function NavbarBrand({ className }: NavbarBrandProps) {
  return (
    <Link
      href="/"
      aria-label="Algosaham.ai home"
      className={cn(
        "flex min-w-0 items-center gap-2 font-ibm-plex-mono text-[18px] font-medium tracking-[-0.02em] text-foreground",
        className,
      )}
    >
      <span className="relative h-6 w-6 shrink-0">
        <Image
          src="/icons/logo.svg"
          alt=""
          fill
          priority
          className="object-contain"
        />
      </span>
      <span className="truncate">algosaham.ai</span>
    </Link>
  )
}
