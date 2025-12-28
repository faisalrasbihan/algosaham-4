"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { HelpCircle } from "lucide-react"

interface OnboardingTutorialProps {
  onComplete?: () => void
  onStart?: () => void
}

const VISITED_FLAG_KEY = "algosaham_has_visited"

export function OnboardingTutorial({ onComplete, onStart }: OnboardingTutorialProps) {
  const driverObj = useRef<any>(null)
  const [hasVisited, setHasVisited] = useState<boolean | null>(null)
  const hasInitialized = useRef(false)

  // Store callbacks in refs to avoid re-triggering effects
  const onCompleteRef = useRef(onComplete)
  const onStartRef = useRef(onStart)

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete
    onStartRef.current = onStart
  }, [onComplete, onStart])

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
      progressText: 'Langkah {{current}} dari {{total}}',
      nextBtnText: 'Lanjut →',
      prevBtnText: '← Kembali',
      doneBtnText: 'Selesai',
      allowClose: true,
      steps: [
        {
          element: '[data-tutorial="stock-filters"]',
          popover: {
            title: '🎯 Langkah 1: Pilih Filter Saham',
            description: 'Pertama, atur dulu filter saham yang kamu mau. Pilih ukuran perusahaannya mau Small, Mid, atau Large, tentuin jenis sahamnya mau semua saham atau khusus syariah, lalu pilih sektor yang pengen kamu fokusin. Dengan filter ini, kamu jadi lebih gampang nemuin saham yang sesuai sama kriteria kamu.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="fundamental-indicators"]',
          popover: {
            title: '📊 Langkah 2: Tambahkan Indikator Fundamental',
            description: 'Selanjutnya, tambahkan indikator fundamental buat nyaring saham dari sisi keuangannya. Kamu bisa pakai indikator seperti PE Ratio, PBV, atau ROE buat lihat apakah sahamnya masih murah atau secara fundamental masih kuat. Klik tombol “+” kalau mau nambah indikator lain.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="technical-indicators"]',
          popover: {
            title: '📈 Langkah 3: Tambahkan Indikator Teknikal',
            description: 'Sekarang saatnya nambahin indikator teknikal buat baca pergerakan harga dan tren market. Kamu bisa pakai RSI, SMA, atau MACD buat bantu nentuin timing masuk dan keluar yang lebih pas.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="risk-management"]',
          popover: {
            title: '🛡️ Langkah 4: Atur Manajemen Risiko (Opsional)',
            description: 'Di sini kamu bisa ngatur risiko trading sesuai gaya kamu. Tentukan stop loss, target take profit, dan maksimal lama posisi ditahan. Kalau mau cepat, bagian ini bisa dilewati dan langsung pakai setelan default yaitu stop loss 5 persen, take profit 10 persen, dan maksimal holding 10 hari.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="backtest-period"]',
          popover: {
            title: '📅 Langkah 5: Atur Periode Pengujian (Opsional)',
            description: 'Di tahap ini, kamu bisa ngatur periode pengujian strategi sesuai kebutuhan. Tentukan modal awal dan rentang waktunya. Kalau nggak mau ribet, langsung pakai setelan default yang sudah tersedia yaitu modal awal 1 miliar dan periode 3 bulan.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tutorial="run-backtest"]',
          popover: {
            title: '🚀 Langkah 6: Jalankan Pengujian Strategi',
            description: 'Klik tombol “Run Backtest” buat mulai ngejalanin strategi kamu. Hasilnya bakal langsung muncul di panel kanan, lengkap dengan performa strategi, riwayat transaksi, dan grafik pergerakan.',
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
        if (onCompleteRef.current) {
          onCompleteRef.current()
        }
      },
      onHighlightStarted: () => {
        // Call onStart when tutorial begins
        if (onStartRef.current) {
          onStartRef.current()
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
  }, [hasVisited]) // Only re-run when hasVisited changes, not on callback changes

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
    <button
      onClick={startTutorial}
      className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-sm border border-transparent hover:border-border/50 flex items-center gap-1"
    >
      <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>Start Tutorial</span>
    </button>
  )
}
