"use client"

import { useState } from "react"
import { Check, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type FeatureValue = string | boolean | number

interface Feature {
  name: string
  ritel: FeatureValue
  suhu: FeatureValue
  bandar: FeatureValue
  tooltip?: string
}

interface FeatureCategory {
  category: string
  features: Feature[]
}

const pricingData: FeatureCategory[] = [
  {
    category: "Backtesting",
    features: [
      { name: "Quota / Day", ritel: 5, suhu: 20, bandar: "100 / unlimited" },
      {
        name: "Strategy to test",
        ritel: "8 indikator (terbatas)",
        suhu: "20",
        bandar: "Semua Indikator",
        tooltip:
          "Jenis strategi yang dapat Anda backtest. Ritel: strategi apapun. Suhu: gunakan indikator hobi. Bandar: akses ke indikator suhu premium.",
      },
      { name: "Periode Backtest", ritel: "1 tahun", suhu: "3 tahun", bandar: "5 tahun" },
      {
        name: "AI Chat",
        ritel: false,
        suhu: "1 session",
        bandar: "10 sessions",
        tooltip:
          "Akses ke AI assistant untuk membantu analisis strategi trading Anda. Satu session berlaku untuk satu sesi percakapan.",
      },
      {
        name: "Privacy",
        ritel: "Auto publish",
        suhu: "Auto publish",
        bandar: "Boleh private",
        tooltip:
          "Pengaturan privasi hasil backtest. Auto publish: hasil otomatis dipublikasikan ke komunitas. Boleh private: Anda bisa memilih untuk menyembunyikan strategi Anda.",
      },
    ],
  },
  {
    category: "Strategies",
    features: [
      {
        name: "Visibility",
        ritel: "Sedikit",
        suhu: "Semua crowdsource",
        bandar: "Akses ke strategi sekuritas",
        tooltip:
          "Akses ke strategi dari pengguna lain. Ritel: akses terbatas. Suhu: lihat semua strategi crowdsource. Bandar: akses eksklusif ke strategi profesional.",
      },
      { name: "Subscribe", ritel: 1, suhu: "up to 5", bandar: "up to 20" },
      { name: "Notification", ritel: "Email", suhu: "Email, Telegram", bandar: "Email, Telegram, Whatsapp" },
    ],
  },
  {
    category: "Screener",
    features: [
      {
        name: "Quota / Day",
        ritel: 1,
        suhu: 5,
        bandar: 20,
        tooltip: "Jumlah screening saham yang dapat Anda lakukan per hari untuk menemukan peluang trading.",
      },
    ],
  },
  {
    category: "Monetization",
    features: [{ name: "Incentive for Published Strategy", ritel: false, suhu: false, bandar: true }],
  },
]

export function PricingMatrix() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: "Ritel",
      subtitle: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Untuk investor pemula",
      highlighted: false,
      badge: null,
      key: "ritel" as const,
    },
    {
      name: "Suhu",
      subtitle: "Popular",
      monthlyPrice: 99000,
      yearlyPrice: 49500,
      description: "Untuk trader aktif",
      highlighted: true,
      badge: "Most Popular",
      key: "suhu" as const,
    },
    {
      name: "Bandar",
      subtitle: "Pro",
      monthlyPrice: 189000,
      yearlyPrice: 94500,
      description: "Untuk trader profesional",
      highlighted: false,
      badge: null,
      key: "bandar" as const,
    },
  ]

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const renderFeatureValue = (value: FeatureValue) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-4 h-4 text-green-600 inline-block" />
      ) : (
        <X className="w-4 h-4 text-red-400 inline-block" />
      )
    }
    return <span>{value}</span>
  }

  const getFeatureValue = (planKey: "ritel" | "suhu" | "bandar", feature: Feature): FeatureValue => {
    return feature[planKey]
  }

  return (
    <TooltipProvider>
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Pilih Paket yang Sesuai</h1>
            <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto mb-8">
              Mulai gratis dan upgrade sesuai kebutuhan trading Anda
            </p>
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted border border-border">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  !isYearly ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isYearly ? "bg-emerald-600 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tahunan
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isYearly ? "bg-emerald-700 text-white" : "bg-primary text-primary-foreground"
                }`}>
                  -50%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-xl border flex flex-col transition-all duration-300 ${
                  plan.highlighted 
                    ? "border-primary bg-primary/5 shadow-xl scale-[1.02]" 
                    : "border-border bg-card hover:border-primary/50 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Card Header with Price */}
                <div className="p-6 border-b border-border">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{plan.description}</p>
                  </div>

                  <div className="text-center mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">
                      {plan.monthlyPrice === 0 ? "selamanya" : isYearly ? "/bulan (billed yearly)" : "/bulan"}
                    </span>
                  </div>

                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    }`}
                  >
                    {plan.monthlyPrice === 0 ? "Mulai Gratis" : "Pilih Paket"}
                  </Button>
                </div>

                {/* Features List inside card */}
                <div className="p-4 flex-1 overflow-auto">
                  {pricingData.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-4 last:mb-0">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        {category.category}
                      </h4>
                      <div className="space-y-1">
                        {category.features.map((feature, featureIndex) => {
                          const value = getFeatureValue(plan.key, feature)
                          return (
                            <div
                              key={featureIndex}
                              className="flex items-center justify-between py-2 px-2 rounded-md text-sm hover:bg-muted/50"
                            >
                              <span className="text-muted-foreground flex items-center gap-1">
                                {feature.name}
                                {feature.tooltip && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      <p>{feature.tooltip}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </span>
                              <span className="font-mono text-foreground font-medium">{renderFeatureValue(value)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground font-mono text-sm">
              Punya pertanyaan? Hubungi kami di{" "}
              <a href="mailto:support@algosaham.ai" className="text-primary hover:underline">
                support@algosaham.ai
              </a>
            </p>
          </div>
        </div>
      </section>
    </TooltipProvider>
  )
}

