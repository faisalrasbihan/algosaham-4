"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface StockSearchProps {
  onSearch: (ticker: string) => void
  loading: boolean
}

export function StockSearch({ onSearch, loading }: StockSearchProps) {
  const searchParams = useSearchParams()
  const [ticker, setTicker] = useState(() => searchParams?.get("ticker") || "")
  const [elapsedTime, setElapsedTime] = useState("0.0")

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      const startTime = Date.now()
      setElapsedTime("0.0")
      interval = setInterval(() => {
        const ms = Date.now() - startTime
        setElapsedTime((ms / 1000).toFixed(1))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticker.trim()) {
      onSearch(ticker.trim().toUpperCase())
    }
  }

  const currentTickerDisplay = ticker.trim().toUpperCase()

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 md:py-10">
      <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#487b78] via-[#d07225] to-transparent" />
        <div className="p-5 md:p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 font-ibm-plex-mono tracking-tight text-balance">
              Analisis Saham Indonesia
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-mono max-w-2xl mx-auto leading-relaxed">
              Masukkan kode saham untuk melihat analisis teknikal dan fundamental.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full transition-all">
            <div className="flex flex-col md:flex-row gap-3">
              {!loading && (
                <div className="flex-1 relative transition-all duration-500">
                  <Input
                    type="text"
                    placeholder="Masukkan ticker (contoh: BBCA, TLKM, ASII)"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="h-13 md:h-14 text-base pl-4 pr-4 bg-white border-border/80 focus-visible:ring-[#d07225] font-ibm-plex-mono"
                    disabled={loading}
                  />
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={loading || !ticker.trim()}
                className={`h-13 md:h-14 text-base transition-all duration-500 disabled:opacity-100 disabled:cursor-not-allowed ${loading
                  ? "w-full md:w-auto md:min-w-[320px] px-6 bg-secondary text-muted-foreground border border-border"
                  : "px-7 md:px-8 bg-primary hover:bg-primary/90 text-white"
                  }`}
              >
                {loading ? (
                  <>
                    <span className="mr-2 font-mono">Analyzing {currentTickerDisplay} ({elapsedTime}s)</span>
                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Lihat Analisis
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2 justify-center items-center">
            <span className="text-xs md:text-sm text-muted-foreground font-mono">Coba:</span>
            {["BBCA", "TLKM", "ASII", "BMRI", "UNVR"].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setTicker(code)}
                className="px-3 py-1.5 text-sm rounded-md border border-border/80 bg-background hover:bg-muted transition-colors font-ibm-plex-mono"
                disabled={loading}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
