"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
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
    <div className="mx-auto w-full max-w-3xl px-6 py-8 md:py-10">
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-[#487b78] via-[#d07225] to-transparent" />
        <div className="p-5 md:p-6">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="border-[#d07225]/25 bg-[#d07225]/10 font-mono text-[11px] uppercase tracking-[0.14em] text-[#d07225]">
              Analyze
            </Badge>
            <div>
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-balance font-ibm-plex-mono md:text-4xl">
                analisa saham indonesia
              </h1>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground font-mono md:text-base">
                Masukkan kode saham untuk melihat analisis teknikal dan fundamental.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 w-full transition-all">
            <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
              {!loading && (
                <div className="relative flex-1 transition-all duration-500">
                  <Input
                    type="text"
                    placeholder="Masukkan ticker (contoh: BBCA, TLKM, ASII)"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="h-13 rounded-xl border-border/80 bg-background px-4 text-base font-ibm-plex-mono focus-visible:ring-[#d07225] md:h-14"
                    disabled={loading}
                  />
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={loading || !ticker.trim()}
                className={`h-13 text-base transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-100 md:h-14 ${loading
                  ? "w-full rounded-xl border border-border bg-secondary px-6 text-muted-foreground md:w-auto md:min-w-[320px]"
                  : "rounded-xl bg-primary px-7 text-white shadow-sm hover:bg-primary/90 md:min-w-[220px] md:px-8"
                  }`}
              >
                {loading ? (
                  <>
                    <span className="mr-2 font-mono">Analyzing {currentTickerDisplay} ({elapsedTime}s)</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground font-mono md:text-sm">Coba:</span>
            {["BBCA", "TLKM", "ASII", "BMRI", "UNVR"].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setTicker(code)}
                className="rounded-md border border-border/80 bg-background px-3 py-1.5 text-sm font-ibm-plex-mono transition-colors hover:bg-muted"
                disabled={loading}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
