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
        "flex min-w-0 items-center gap-2.5 font-heading text-[17px] font-medium tracking-[-0.035em] text-foreground",
        className,
      )}
    >
      <span className="relative h-[22px] w-[22px] shrink-0">
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
