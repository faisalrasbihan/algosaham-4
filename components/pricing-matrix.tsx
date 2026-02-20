"use client"

import { useState, useEffect, Suspense } from "react"
import { Check, X, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUser, SignInButton } from "@clerk/nextjs"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { PaymentMethodDialog } from "@/components/payment-method-dialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AccountManagementPage } from "@/components/account-management-page"

type FeatureValue = string | boolean | number

interface Feature {
  name: string
  ritel: FeatureValue // Free
  suhu: FeatureValue // Mid tier
  bandar: FeatureValue // Top tier
  tooltip?: string
}

interface FeatureCategory {
  category: string
  features: Feature[]
}

const pricingData: FeatureCategory[] = [
  {
    category: "Analysis",
    features: [
      {
        name: "Quota",
        ritel: "5x / day",
        suhu: "Unlimited",
        bandar: "Unlimited",
        tooltip: "Jumlah analisis saham yang dapat dilakukan per hari.",
      },
    ],
  },
  {
    category: "Backtesting",
    features: [
      {
        name: "Quota",
        ritel: "1x / month",
        suhu: "25x / month",
        bandar: "Unlimited"
      },
      {
        name: "Strategy to test",
        ritel: "8 indikator (terbatas)",
        suhu: "20 indikator",
        bandar: "Semua Indikator",
        tooltip:
          "Jenis strategi yang dapat Anda backtest. Ritel: strategi terbatas. Suhu: lebih banyak indikator. Bandar: akses semua indikator.",
      },
      {
        name: "Periode Backtest",
        ritel: "1 tahun",
        suhu: "2 tahun",
        bandar: "4 tahun"
      },
      {
        name: "Saved Strategies",
        ritel: 1,
        suhu: 10,
        bandar: 50,
        tooltip: "Jumlah strategi yang dapat disimpan di akun Anda.",
      },
      {
        name: "AI Chat",
        ritel: false,
        suhu: false,
        bandar: "Coming Soon",
        tooltip:
          "Akses ke AI assistant untuk membantu analisis strategi trading Anda.",
      },
      {
        name: "Privacy",
        ritel: "Public only",
        suhu: "Public only",
        bandar: "Private & Public",
        tooltip:
          "Pengaturan privasi hasil backtest. Bandar dapat menyembunyikan strategi.",
      },
    ],
  },
  {
    category: "Strategies",
    features: [
      {
        name: "The Master Vault",
        ritel: "Locked",
        suhu: "Locked",
        bandar: "Full Access",
        tooltip: "Akses eksklusif ke strategi pilihan The Master Vault.",
      },
      { name: "Subscribe", ritel: 1, suhu: "up to 5", bandar: "up to 20" },
      {
        name: "Notification",
        ritel: "None",
        suhu: "Email",
        bandar: "Email, WA & Telegram"
      },
    ],
  },
  {
    category: "Monetization",
    features: [{ name: "Incentive for Published Strategy", ritel: false, suhu: false, bandar: true }],
  },
]

// Plan types for payment dialog
type PaidPlanType = 'suhu' | 'bandar'

function PricingMatrixInner() {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const { isSignedIn, user } = useUser()
  const [userTier, setUserTier] = useState<string>("ritel")
  const searchParams = useSearchParams()

  // Fetch user's subscription tier
  useEffect(() => {
    const fetchUserTier = async () => {
      if (!isSignedIn) return

      try {
        const response = await fetch('/api/user/tier')
        if (response.ok) {
          const data = await response.json()
          // map 'free' to 'ritel' if necessary, otherwise use data.tier
          const tier = data.tier === 'free' ? 'ritel' : (data.tier || 'ritel')
          setUserTier(tier)
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error)
      }
    }

    fetchUserTier()
  }, [isSignedIn])

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [manageSubscriptionsOpen, setManageSubscriptionsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    type: PaidPlanType
    name: string
    amount: number
  } | null>(null)

  // Handle URL params for GoPay callback
  useEffect(() => {
    const gopayStatus = searchParams.get('gopay')
    const paymentStatus = searchParams.get('status')

    if (gopayStatus === 'success') {
      toast.success('Akun GoPay berhasil dihubungkan!')
      // Clear URL params
      window.history.replaceState({}, '', '/harga')
    } else if (gopayStatus === 'error') {
      toast.error('Gagal menghubungkan akun GoPay. Silakan coba lagi.')
      window.history.replaceState({}, '', '/harga')
    } else if (gopayStatus === 'pending') {
      toast.info('Proses penghubungan GoPay masih pending.')
      window.history.replaceState({}, '', '/harga')
    }

    if (paymentStatus === 'success') {
      toast.success('Pembayaran berhasil! Terima kasih.')
      window.history.replaceState({}, '', '/harga')
    } else if (paymentStatus === 'error') {
      toast.error('Pembayaran gagal. Silakan coba lagi.')
      window.history.replaceState({}, '', '/harga')
    } else if (paymentStatus === 'pending') {
      toast.info('Pembayaran sedang diproses.')
      window.history.replaceState({}, '', '/harga')
    }
  }, [searchParams])

  const plans = [
    {
      name: "Free",
      subtitle: "Ritel",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Untuk pemula",
      highlighted: false,
      badge: null,
      key: "ritel" as const,
    },
    {
      name: "Suhu",
      subtitle: "Suhu",
      monthlyPrice: 89500,
      yearlyPrice: 44750, // 50% discount
      description: "Trader aktif",
      highlighted: true,
      badge: "Most Popular",
      key: "suhu" as const,
    },
    {
      name: "Bandar",
      subtitle: "Bandar",
      monthlyPrice: 189000,
      yearlyPrice: 94500, // 50% discount
      description: "Trader profesional",
      highlighted: false,
      badge: "Best Value",
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

  const getFeatureValue = (planKey: string, feature: Feature): FeatureValue => {
    // @ts-ignore
    return feature[planKey]
  }

  const handleSubscribe = (planKey: string) => {
    // Free plan - no payment needed
    if (planKey === "ritel") {
      toast.success("Anda sudah menggunakan paket Free gratis!")
      return
    }

    // Check if user is signed in
    if (!isSignedIn) {
      toast.error("Silakan login terlebih dahulu untuk berlangganan")
      return
    }

    // Find the plan
    const plan = plans.find(p => p.key === planKey)
    if (!plan) return

    // Open payment method dialog
    setSelectedPlan({
      type: planKey as PaidPlanType,
      name: plan.name,
      amount: isYearly ? plan.yearlyPrice * 12 : plan.monthlyPrice,
    })
    setPaymentDialogOpen(true)
  }

  const handlePaymentSuccess = () => {
    // Refresh the page to show updated subscription status
    window.location.reload()
  }

  const isPaidUser = isSignedIn && (userTier === "suhu" || userTier === "bandar")

  return (
    <TooltipProvider>
      <section className="py-16 px-4 dotted-background">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Harga Transparan, Fitur Lengkap, dan Fleksibel</h1>
            <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto mb-8">
              Pilih level sesuai gaya trading kamu. Naik level kapan aja!
            </p>
            <div className={`inline-flex items-center gap-1 p-1 rounded-full border transition-all ${isYearly ? "bg-slate-200 border-slate-300" : "bg-slate-200 border-slate-300"
              }`}>
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!isYearly
                  ? "bg-slate-500 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isYearly
                  ? "bg-[#d07225] text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Tahunan
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isYearly ? "bg-white/20 text-white" : "bg-[#d07225] text-white"
                  }`}>
                  -50%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const showHighlight = !isPaidUser && plan.highlighted
              const showBadge = !isPaidUser && plan.badge

              return (
                <div
                  key={index}
                  className={`relative rounded-xl border flex flex-col transition-all duration-300 ${showHighlight
                    ? "border-primary bg-card shadow-xl scale-[1.02] z-10"
                    : "border-border bg-card"
                    }`}
                >
                  {showBadge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-max">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Card Header with Price */}
                  <div className="p-6 border-b border-border">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{plan.description}</p>
                    </div>

                    <div className="text-center mb-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-foreground">
                          {formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {plan.monthlyPrice === 0 ? "selamanya" : isYearly ? "per bulan (ditagih tahunan)" : "per bulan"}
                      </span>
                    </div>

                    {isSignedIn ? (
                      <Button
                        onClick={() => {
                          if (isPaidUser && plan.key === userTier) {
                            setManageSubscriptionsOpen(true)
                          } else {
                            handleSubscribe(plan.key)
                          }
                        }}
                        disabled={loadingPlan !== null || (isPaidUser ? plan.key !== userTier : plan.key === userTier)}
                        className={`w-full ${isPaidUser && plan.key === userTier
                          ? "bg-[#d07225] hover:bg-[#b56320] text-white transition-colors"
                          : showHighlight
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                            : "bg-secondary hover:bg-[#d07225] hover:text-white text-foreground transition-colors"
                          }`}
                      >
                        {loadingPlan === plan.key ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : plan.key === userTier ? (
                          plan.key === "ritel" ? "Paket Saat Ini" : "Manage Subscriptions"
                        ) : (
                          "Pilih Paket"
                        )}
                      </Button>
                    ) : (
                      <SignInButton mode="modal">
                        <Button
                          className={`w-full ${showHighlight
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                            : "bg-secondary hover:bg-[#d07225] hover:text-white text-foreground transition-colors"
                            }`}
                        >
                          {plan.monthlyPrice === 0 ? "Mulai Gratis" : "Pilih Paket"}
                        </Button>
                      </SignInButton>
                    )}
                  </div>

                  {/* Features List inside card */}
                  <div className="p-4 flex-1 overflow-auto">
                    {pricingData.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="mb-4 last:mb-0">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                          {category.category}
                        </h4>
                        <div className="space-y-1 pl-1">
                          {category.features.map((feature, featureIndex) => {
                            const value = getFeatureValue(plan.key, feature)
                            return (
                              <div
                                key={featureIndex}
                                className="flex items-center justify-between py-2 px-2 rounded-md text-sm hover:bg-muted/50"
                              >
                                <span className="text-muted-foreground text-xs flex items-center gap-1">
                                  {feature.name}

                                  {feature.tooltip && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs">
                                        <p>{feature.tooltip}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </span>
                                <span className="font-mono text-foreground font-medium text-sm text-right">{renderFeatureValue(value)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
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

      {/* Payment Method Dialog */}
      {selectedPlan && (
        <PaymentMethodDialog
          isOpen={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false)
            setSelectedPlan(null)
          }}
          planType={selectedPlan.type}
          planName={selectedPlan.name}
          billingInterval={isYearly ? 'yearly' : 'monthly'}
          amount={selectedPlan.amount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Manage Subscriptions Dialog */}
      <Dialog open={manageSubscriptionsOpen} onOpenChange={setManageSubscriptionsOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 h-[85vh] sm:h-[80vh] flex flex-col">
          <AccountManagementPage />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

// Wrapper component with Suspense boundary for useSearchParams
export function PricingMatrix() {
  return (
    <Suspense fallback={
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 w-3/4 mx-auto bg-muted animate-pulse rounded" />
            <div className="h-6 w-1/2 mx-auto bg-muted animate-pulse rounded mt-4" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6">
                <div className="h-8 w-1/2 bg-muted animate-pulse rounded mb-4" />
                <div className="h-12 w-3/4 bg-muted animate-pulse rounded mb-4" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    }>
      <PricingMatrixInner />
    </Suspense>
  )
}
