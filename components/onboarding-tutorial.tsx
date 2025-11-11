"use client"

import { useEffect, useRef, useState } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { Button } from "@/components/ui/button"
import { Play, HelpCircle } from "lucide-react"

interface OnboardingTutorialProps {
  onComplete?: () => void
}

const VISITED_FLAG_KEY = "algosaham_has_visited"

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const driverObj = useRef<any>(null)
  const [hasVisited, setHasVisited] = useState<boolean | null>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Check if user has visited before
    if (typeof window !== "undefined") {
      const hasVisitedBefore = localStorage.getItem(VISITED_FLAG_KEY) === "true"
      setHasVisited(hasVisitedBefore)
    }
  }, [])

  useEffect(() => {
    // Only initialize driver.js once
    if (hasInitialized.current) return
    
    // Wait until we know if user has visited
    if (hasVisited === null) return

    hasInitialized.current = true

    // Initialize driver.js
    driverObj.current = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: 'Step {{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Previous',
      doneBtnText: 'Finish',
      allowClose: true,
      steps: [
        {
          element: '[data-tutorial="stock-filters"]',
          popover: {
            title: '🎯 Step 1: Choose Stock Filters',
            description: 'Start by selecting your stock filters. Choose market cap (Small, Mid, Large), stock type (All Stocks or Syariah Only), and sectors to narrow down your stock selection. This helps focus on stocks that match your investment criteria.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="fundamental-indicators"]',
          popover: {
            title: '📊 Step 2: Add Fundamental Indicators',
            description: 'Add fundamental indicators like PE Ratio, PBV, and ROE to filter stocks based on financial metrics. These indicators help identify undervalued or fundamentally strong stocks. Click the "+" button to add more indicators.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="technical-indicators"]',
          popover: {
            title: '📈 Step 3: Add Technical Indicators',
            description: 'Add technical indicators like RSI, SMA, or MACD to identify trading signals and market trends. These help determine the best entry and exit points for your trades.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="risk-management"]',
          popover: {
            title: '🛡️ Step 4: Configure Risk Management (Optional)',
            description: 'Set stop loss percentage, take profit percentage, and maximum holding period to manage your risk. You can skip this section if you want to use the default settings (5% stop loss, 10% take profit, 10 days max holding).',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="backtest-period"]',
          popover: {
            title: '📅 Step 5: Set Backtest Period (Optional)',
            description: 'Configure the backtest period, initial capital, and date range. Default settings are already provided (1B initial capital, 3-month period). You can adjust these based on your testing needs.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="run-backtest"]',
          popover: {
            title: '🚀 Step 6: Run Your Backtest',
            description: 'Click the "Run Backtest" button to execute your strategy and see the results in the right panel. The system will analyze your strategy against historical data and show performance metrics, trade history, and charts.',
            side: 'top',
            align: 'center'
          }
        }
      ],
      onDestroyed: () => {
        // Mark user as having visited when tutorial is completed or closed
        if (typeof window !== "undefined") {
          localStorage.setItem(VISITED_FLAG_KEY, "true")
          setHasVisited(true)
        }
        if (onComplete) {
          onComplete()
        }
      },
      onHighlighted: (element) => {
        // Auto-expand collapsed sections when they are highlighted
        if (!element) return
        const section = element.getAttribute('data-tutorial')
        if (section === 'stock-filters' || section === 'fundamental-indicators' || 
            section === 'technical-indicators' || section === 'risk-management' || 
            section === 'backtest-period') {
          const card = element.closest('[data-tutorial]')
          if (card) {
            const header = card.querySelector('[data-tutorial]')
            if (header) {
              (header as HTMLElement).click()
            }
          }
        }
      }
    })

    // Auto-start tutorial for new users
    if (hasVisited === false && driverObj.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        driverObj.current?.drive()
      }, 500)
      return () => {
        clearTimeout(timer)
        if (driverObj.current) {
          driverObj.current.destroy()
        }
      }
    }

    return () => {
      if (driverObj.current) {
        driverObj.current.destroy()
      }
    }
  }, [hasVisited, onComplete])

  // Listen for clicks on the Run Backtest button to complete the tutorial
  useEffect(() => {
    const handleRunBacktestClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if the click is on the Run Backtest button or its children
      const runBacktestButton = target.closest('[data-tutorial="run-backtest"]')
      
      if (runBacktestButton && driverObj.current) {
        // Check if tutorial overlay exists (indicates tutorial is active)
        const tutorialOverlay = document.querySelector('.driver-overlay')
        if (tutorialOverlay) {
          // Stop the tutorial (this will trigger onDestroyed callback)
          driverObj.current.destroy()
        }
      }
    }

    // Add event listener to document to catch clicks
    document.addEventListener('click', handleRunBacktestClick, true)

    return () => {
      document.removeEventListener('click', handleRunBacktestClick, true)
    }
  }, [])

  const startTutorial = () => {
    if (driverObj.current) {
      driverObj.current.drive()
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={startTutorial}
        variant="outline"
        size="sm"
        className="gap-2 font-mono border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        Start Tutorial
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Learn how to use the backtest tool
      </p>
    </div>
  )
}
