"use client"

import { useRef, useEffect, useState } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"

interface CardCarouselProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
  indicatorStyle?: "gradient" | "floating"
}

export function CardCarousel({
  children,
  className = "",
  noPadding = false,
  indicatorStyle = "gradient",
}: CardCarouselProps) {
  const [showRightIndicator, setShowRightIndicator] = useState(false)
  const [showLeftIndicator, setShowLeftIndicator] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const { scrollWidth, scrollLeft, clientWidth } = scrollRef.current
        const hasMoreToScroll = scrollWidth - scrollLeft - clientWidth > 10
        setShowRightIndicator(hasMoreToScroll)
        setShowLeftIndicator(scrollLeft > 10)
      }
    }

    checkOverflow()
    const timerId = setTimeout(checkOverflow, 100)

    const handleResize = () => checkOverflow()

    const el = scrollRef.current
    if (el) {
      el.addEventListener("scroll", checkOverflow, { passive: true })
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (el) el.removeEventListener("scroll", checkOverflow)
      clearTimeout(timerId)
    }
  }, [children])

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: "smooth" })
    }
  }

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: "smooth" })
    }
  }

  const paddingClasses = noPadding ? "" : "pl-6 pr-6"

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto pb-4 py-1 scrollbar-hide ${paddingClasses} ${className}`}
      >
        {children}
        <div className="w-6 flex-shrink-0" />
      </div>
      {showRightIndicator && (
        <button
          onClick={handleScrollRight}
          className={
            indicatorStyle === "floating"
              ? "group absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-background/90 shadow-md backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-background hover:shadow-lg"
              : "group absolute -right-6 top-1/2 z-10 flex -translate-y-1/2 cursor-pointer items-center justify-end bg-gradient-to-l from-background via-background/80 to-transparent py-6 pl-12 pr-4 transition-opacity hover:opacity-80"
          }
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
      {showLeftIndicator && (
        <button
          onClick={handleScrollLeft}
          className={
            indicatorStyle === "floating"
              ? "group absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-background/90 shadow-md backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-background hover:shadow-lg"
              : "group absolute -left-6 top-1/2 z-10 flex -translate-y-1/2 cursor-pointer items-center justify-start bg-gradient-to-r from-background via-background/80 to-transparent py-6 pl-4 pr-12 transition-opacity hover:opacity-80"
          }
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-primary transition-transform group-hover:-translate-x-0.5" />
        </button>
      )}
    </div>
  )
}
