"use client"

import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Activity, Brain, Building2, Search } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/page-layout"
import { TickerCircleIcon } from "@/components/ticker-circle-icon"
import { cn } from "@/lib/utils"

interface StockSearchProps {
  onSearch: (ticker: string) => void
  loading: boolean
}

export function StockSearch({ onSearch, loading }: StockSearchProps) {
  const searchParams = useSearchParams()
  const [ticker, setTicker] = useState(() => searchParams?.get("ticker") || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticker.trim() && !validationMessage) {
      onSearch(ticker.trim().toUpperCase())
    }
  }

  const validationMessage = ticker.trim() && !/^[A-Za-z0-9.-]{2,12}$/.test(ticker.trim())
    ? "Gunakan kode ticker yang valid, misalnya BBCA."
    : ""

  const exampleTickerRows = [
    [
      { code: "BBCA", hot: true },
      { code: "TLKM" },
      { code: "ASII" },
      { code: "BMRI" },
      { code: "UNVR" },
      { code: "BBRI" },
      { code: "DCII", hot: true },
    ],
    [
      { code: "BBNI" },
      { code: "ANTM" },
      { code: "ADRO" },
      { code: "ICBP" },
      { code: "KLBF" },
    ],
  ]
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
    <div className="w-full">
      <PageHeader
        compact
        className="border-b-0 bg-transparent pt-6 sm:pt-10"
        title="Analisis saham Indonesia"
        description="Masukkan kode saham untuk melihat gambaran teknikal, fundamental, risiko, dan pandangan AI."
      />
      <PageContainer className="pb-14 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <section className="mx-auto max-w-3xl rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <form onSubmit={handleSubmit} className="w-full" aria-busy={loading}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <Input
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    aria-label="Kode ticker saham"
                    aria-invalid={Boolean(validationMessage)}
                    placeholder="Cari kode saham, misalnya BBCA"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="h-12 rounded-xl border-border/80 bg-background px-4 text-base focus-visible:ring-primary"
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
                      <span
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground"
                        aria-hidden="true"
                      />
                      Menganalisis…
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Analisis
                    </>
                  )}
                </Button>
              </div>

            </form>

            <div className="relative mt-4 border-t border-border/70 pt-4">
              {loading ? (
                <div
                  className="absolute inset-x-0 -top-px h-px overflow-hidden bg-border"
                  role="progressbar"
                  aria-label={`Menganalisis ${ticker.trim().toUpperCase()}`}
                >
                  <div className="analysis-progress-indicator h-full w-1/4 bg-primary" />
                </div>
              ) : null}

              <div className="flex w-full flex-col items-center gap-2" role="group" aria-label="Pilihan saham populer">
                {exampleTickerRows.map((row) => (
                  <div
                    key={row.map((item) => item.code).join("-")}
                    className="flex flex-wrap items-center justify-center gap-1.5"
                  >
                    {row.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleQuickTicker(item.code)}
                        disabled={loading}
                        className={cn(
                          "inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-2.5 pr-3 text-sm font-medium transition-colors disabled:cursor-default disabled:opacity-60",
                          item.hot
                            ? "border-[#d07225]/25 bg-[#d07225]/[0.06] hover:border-[#d07225]/35 hover:bg-[#d07225]/10"
                            : "border-border/80 bg-background hover:border-foreground/20 hover:bg-muted",
                        )}
                      >
                        <TickerCircleIcon ticker={item.code} />
                        {item.code}
                        {item.hot ? (
                          <span className="-ml-0.5 text-xs leading-none" role="img" aria-label="Sedang populer">
                            🔥
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </section>

          <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] leading-5 text-muted-foreground">
            Analisis bersifat informatif dan bukan rekomendasi investasi.
          </p>

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
