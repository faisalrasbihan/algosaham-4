"use client"

import { useRef, useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"

interface CardCarouselProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function CardCarousel({ children, className = "", noPadding = false }: CardCarouselProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const hasOverflow = scrollRef.current.scrollWidth > scrollRef.current.clientWidth
        setShowScrollIndicator(hasOverflow)
      }
    }

    checkOverflow()

    const handleResize = () => {
      checkOverflow()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
      {showScrollIndicator && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background via-background/80 to-transparent pl-8 pr-2 py-2">
          <ChevronRight className="w-5 h-5 text-ochre animate-pulse" />
        </div>
      )}
    </div>
  )
}
