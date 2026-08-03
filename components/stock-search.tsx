"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Activity, Brain, Building2, Search } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/page-layout"
import { TickerCircleIcon } from "@/components/ticker-circle-icon"

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
    if (ticker.trim() && !validationMessage) {
      onSearch(ticker.trim().toUpperCase())
    }
  }

  const currentTickerDisplay = ticker.trim().toUpperCase()
  const validationMessage = ticker.trim() && !/^[A-Za-z0-9.-]{2,12}$/.test(ticker.trim())
    ? "Gunakan kode ticker yang valid, misalnya BBCA."
    : ""

  const exampleTickers = ["BBCA", "TLKM", "ASII", "BMRI", "UNVR"]
  const analysisPreviews = [
    {
      icon: Activity,
      title: "Analisis teknikal",
      description: "Baca tren, momentum, support, resistance, dan indikator utama dalam satu ringkasan.",
    },
    {
      icon: Building2,
      title: "Analisis fundamental",
      description: "Bandingkan valuasi, profitabilitas, pertumbuhan, dan posisi perusahaan terhadap sektornya.",
    },
    {
      icon: Brain,
      title: "Risiko dan pandangan AI",
      description: "Pahami bull case, bear case, area risiko, dan hal penting yang perlu dipantau.",
    },
  ]

  const handleQuickTicker = (code: string) => {
    setTicker(code)
    onSearch(code)
  }

  return (
    <div className="analyze-landing-stage w-full">
      <PageHeader
        compact
        className="border-b-0 bg-transparent pt-6 sm:pt-10"
        title="Analisis saham Indonesia"
        description="Masukkan kode saham untuk melihat gambaran teknikal, fundamental, risiko, dan pandangan AI."
      />
      <PageContainer className="pb-14 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <section className="mx-auto max-w-3xl rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <form onSubmit={handleSubmit} className="w-full">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <Input
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    aria-label="Kode ticker saham"
                    aria-invalid={Boolean(validationMessage)}
                    placeholder="Masukkan ticker, misalnya BBCA"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="h-12 rounded-xl border-border/80 bg-background px-4 text-base uppercase focus-visible:ring-primary"
                    disabled={loading}
                  />
                  {validationMessage ? (
                    <p className="mt-2 text-xs text-destructive">{validationMessage}</p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || !ticker.trim() || Boolean(validationMessage)}
                  className="h-12 rounded-xl px-6 text-sm sm:min-w-40"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                      Menganalisis
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Analisis
                    </>
                  )}
                </Button>
              </div>

              {loading ? (
                <p className="mt-3 text-center text-xs text-muted-foreground" aria-live="polite">
                  Menyiapkan analisis {currentTickerDisplay} · {elapsedTime} detik
                </p>
              ) : null}
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-border/70 pt-4">
              <span className="mr-1 text-xs text-muted-foreground">Coba langsung:</span>
              {exampleTickers.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleQuickTicker(code)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/80 bg-background px-2.5 pr-3 text-sm font-medium transition-colors hover:border-foreground/20 hover:bg-muted"
                  disabled={loading}
                >
                  <TickerCircleIcon ticker={code} />
                  {code}
                </button>
              ))}
            </div>

            <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
              Analisis bersifat informatif dan bukan rekomendasi investasi.
            </p>
          </section>

          <section className="mt-12 sm:mt-14" aria-labelledby="analysis-preview-title">
            <div className="mx-auto mb-6 max-w-2xl text-center">
              <h2 id="analysis-preview-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
                Satu ticker, gambaran yang lebih lengkap
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Hasil dirangkum agar Anda bisa memahami peluang dan risiko tanpa berpindah-pindah alat.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {analysisPreviews.map((item) => (
                <div key={item.title} className="rounded-xl border border-border/80 bg-card/85 p-5 shadow-sm backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3f3f3]">
                    <item.icon className="h-5 w-5 text-foreground" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

          </section>
        </div>
      </PageContainer>
    </div>
  )
}
