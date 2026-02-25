"use client"

import { useRef, useEffect, useState } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"

interface CardCarouselProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function CardCarousel({ children, className = "", noPadding = false }: CardCarouselProps) {
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
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background via-background/80 to-transparent pl-12 pr-4 py-6 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-end group z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-[#d07225] animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform" />
        </button>
      )}
      {showLeftIndicator && (
        <button
          onClick={handleScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-background via-background/80 to-transparent pr-12 pl-4 py-6 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-start group z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-[#d07225] animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  )
}
