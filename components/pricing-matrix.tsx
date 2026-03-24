"use client"

import { Suspense, useEffect, useState } from "react"
import { Check, Info, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SignInButton, useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { PaymentMethodDialog } from "@/components/payment-method-dialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AccountManagementPage } from "@/components/account-management-page"
import {
  PRICING_MATRIX_SECTIONS,
  SUBSCRIPTION_PLANS,
  formatPlanPrice,
  type PaidSubscriptionTier,
  type SubscriptionTier,
} from "@/lib/subscription-plans"

type FeatureValue = string | boolean | null

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

const pricingData: FeatureCategory[] = PRICING_MATRIX_SECTIONS.map((section, index) => ({
  category: section.title ?? (index === 0 ? "Ringkasan" : `Section ${index + 1}`),
  features: section.rows.map((row) => ({
    name: row.feature,
    ritel: row.values.ritel,
    suhu: row.values.suhu,
    bandar: row.values.bandar,
    tooltip: row.note ?? undefined,
  })),
}))

type PaidPlanType = PaidSubscriptionTier

function PricingMatrixInner() {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan] = useState<string | null>(null)
  const { isSignedIn } = useUser()
  const [userTier, setUserTier] = useState<SubscriptionTier>("ritel")
  const [userSubscriptionInfo, setUserSubscriptionInfo] = useState<{
    tier: SubscriptionTier,
    subscriptionPeriodStart?: string,
    subscriptionPeriodEnd?: string
  } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchUserTier = async () => {
      if (!isSignedIn) return

      try {
        const response = await fetch("/api/user/tier")
        if (response.ok) {
          const data = await response.json()
          const tier = (data.tier || "ritel") as SubscriptionTier
          setUserTier(tier)
          setUserSubscriptionInfo(data)
        }
      } catch (error) {
        console.error("Failed to fetch user tier:", error)
      }
    }

    void fetchUserTier()
  }, [isSignedIn])

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [manageSubscriptionsOpen, setManageSubscriptionsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    type: PaidPlanType
    name: string
    amount: number
  } | null>(null)

  useEffect(() => {
    const gopayStatus = searchParams.get("gopay")
    const paymentStatus = searchParams.get("status")

    if (gopayStatus === "success") {
      toast.success("Akun GoPay berhasil dihubungkan!")
      window.history.replaceState({}, "", "/harga")
    } else if (gopayStatus === "error") {
      toast.error("Gagal menghubungkan akun GoPay. Silakan coba lagi.")
      window.history.replaceState({}, "", "/harga")
    } else if (gopayStatus === "pending") {
      toast.info("Proses penghubungan GoPay masih pending.")
      window.history.replaceState({}, "", "/harga")
    }

    if (paymentStatus === "success") {
      toast.success("Pembayaran berhasil! Terima kasih.")
      window.history.replaceState({}, "", "/harga")
    } else if (paymentStatus === "error") {
      toast.error("Pembayaran gagal. Silakan coba lagi.")
      window.history.replaceState({}, "", "/harga")
    } else if (paymentStatus === "pending") {
      toast.info("Pembayaran sedang diproses.")
      window.history.replaceState({}, "", "/harga")
    }
  }, [searchParams])

  const plans = [
    {
      name: SUBSCRIPTION_PLANS.ritel.name,
      subtitle: "Ritel",
      monthlyPrice: SUBSCRIPTION_PLANS.ritel.monthlyPrice,
      yearlyTotalPrice: SUBSCRIPTION_PLANS.ritel.yearlyPrice,
      description: "Untuk pemula",
      highlighted: false,
      badge: null,
      key: "ritel" as const,
    },
    {
      name: SUBSCRIPTION_PLANS.suhu.name,
      subtitle: "Suhu",
      monthlyPrice: SUBSCRIPTION_PLANS.suhu.monthlyPrice,
      yearlyTotalPrice: SUBSCRIPTION_PLANS.suhu.yearlyPrice,
      description: SUBSCRIPTION_PLANS.suhu.targetUser,
      highlighted: true,
      badge: SUBSCRIPTION_PLANS.suhu.visuals?.badgeLabel ?? "Most Popular",
      key: "suhu" as const,
    },
    {
      name: SUBSCRIPTION_PLANS.bandar.name,
      subtitle: "Bandar",
      monthlyPrice: SUBSCRIPTION_PLANS.bandar.monthlyPrice,
      yearlyTotalPrice: SUBSCRIPTION_PLANS.bandar.yearlyPrice,
      description: SUBSCRIPTION_PLANS.bandar.targetUser,
      highlighted: false,
      badge: SUBSCRIPTION_PLANS.bandar.visuals?.badgeLabel ?? "Best Value",
      key: "bandar" as const,
    },
  ]

  const calculateUpgradeProration = () => {
    if (!userSubscriptionInfo?.subscriptionPeriodStart || !userSubscriptionInfo?.subscriptionPeriodEnd) return 0
    if (userTier !== "suhu") return 0
    
    const start = new Date(userSubscriptionInfo.subscriptionPeriodStart).getTime()
    const end = new Date(userSubscriptionInfo.subscriptionPeriodEnd).getTime()
    const now = new Date().getTime()
    
    if (end <= now || start >= end) return 0
    
    const remainingMs = end - now
    const totalMs = end - start
    
    const isUserYearly = (totalMs / (1000 * 60 * 60 * 24)) > 300
    const currentPrice = isUserYearly ? SUBSCRIPTION_PLANS.suhu.yearlyPrice : SUBSCRIPTION_PLANS.suhu.monthlyPrice
    
    const remainingValue = (remainingMs / totalMs) * currentPrice
    
    return remainingValue > 0 ? remainingValue : 0
  }

  const getDisplayedPrice = (plan: (typeof plans)[number]) => {
    let price = isYearly ? plan.yearlyTotalPrice : plan.monthlyPrice
    if (userTier === "suhu" && plan.key === "bandar") {
      const remainingValue = calculateUpgradeProration()
      price = Math.max(0, price - remainingValue)
    }

    if (!isYearly) return price
    if (price === 0) return 0
    return Math.round(price / 12)
  }

  const renderFeatureValue = (value: FeatureValue) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="inline-block h-4 w-4 text-green-600" />
      ) : (
        <X className="inline-block h-4 w-4 text-red-400" />
      )
    }

    if (value === null) {
      return <span className="text-muted-foreground">COMING SOON</span>
    }

    return <span>{value}</span>
  }

  const getFeatureValue = (planKey: SubscriptionTier, feature: Feature): FeatureValue => {
    return feature[planKey]
  }

  const handleSubscribe = (planKey: SubscriptionTier) => {
    if (planKey === "ritel") {
      toast.success("Anda sudah menggunakan paket Free gratis!")
      return
    }

    if (!isSignedIn) {
      toast.error("Silakan login terlebih dahulu untuk berlangganan")
      return
    }

    const plan = plans.find((entry) => entry.key === planKey)
    if (!plan) return

    let amount = isYearly ? plan.yearlyTotalPrice : plan.monthlyPrice
    
    if (userTier === "suhu" && planKey === "bandar") {
      const remainingValue = calculateUpgradeProration()
      amount = Math.max(0, amount - remainingValue)
    }

    setSelectedPlan({
      type: planKey as PaidPlanType,
      name: userTier === "suhu" && planKey === "bandar" ? `${plan.name} (Upgrade)` : plan.name,
      amount: amount,
    })
    setPaymentDialogOpen(true)
  }

  const handlePaymentSuccess = () => {
    window.location.reload()
  }

  const isPaidUser = isSignedIn && (userTier === "suhu" || userTier === "bandar")

  return (
    <TooltipProvider>
      <section className="dotted-background px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Harga Transparan, Fitur Lengkap, dan Fleksibel
            </h1>
            <p className="mx-auto mb-8 max-w-2xl font-mono text-lg text-muted-foreground">
              Pilih level sesuai gaya trading kamu. Naik level kapan aja!
            </p>
            {!isPaidUser && (
              <div className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200/60 bg-slate-100 p-1 text-muted-foreground">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-xs font-mono font-semibold transition-all ${
                    !isYearly ? "bg-slate-600 text-white shadow-sm" : "hover:text-foreground"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-xs font-mono font-semibold transition-all ${
                    isYearly ? "bg-slate-600 text-white shadow-sm" : "hover:text-foreground"
                  }`}
                >
                  Tahunan
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => {
              const showHighlight = !isPaidUser && plan.highlighted
              const showBadge = !isPaidUser && plan.badge

              return (
                <div
                  key={index}
                  className={`relative flex flex-col rounded-xl border transition-all duration-300 ${
                    showHighlight ? "z-10 scale-[1.02] border-primary bg-card shadow-xl" : "border-border bg-card"
                  }`}
                >
                  {showBadge && (
                    <div className="absolute -top-3 left-1/2 z-20 w-max -translate-x-1/2">
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="border-b border-border p-6">
                    <div className="mb-4 text-center">
                      <h3 className="mb-1 text-xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{plan.description}</p>
                    </div>

                    <div className="mb-4 text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-foreground">
                          {plan.monthlyPrice === 0 ? "Gratis" : formatPlanPrice(getDisplayedPrice(plan))}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {plan.monthlyPrice === 0
                            ? "selamanya"
                            : isYearly
                              ? "per bulan (ditagih tahunan)"
                              : "per bulan"}
                        {userTier === "suhu" && plan.key === "bandar" && " (prorata upgrade)"}
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
                        disabled={loadingPlan !== null || (isPaidUser && plan.key !== userTier && !(userTier === "suhu" && plan.key === "bandar"))}
                        className={`w-full ${
                          userTier === "suhu" && plan.key === "bandar"
                            ? "bg-[#d4af37] text-white transition-colors hover:bg-[#c5a030]"
                            : isPaidUser && plan.key === userTier
                              ? "bg-[#d07225] text-white transition-colors hover:bg-[#b56320]"
                              : showHighlight
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-secondary text-foreground transition-colors hover:bg-[#d07225] hover:text-white"
                        }`}
                      >
                        {loadingPlan === plan.key ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : plan.key === userTier ? (
                          plan.key === "ritel" ? "Paket Saat Ini" : "Manage Subscriptions"
                        ) : userTier === "suhu" && plan.key === "bandar" ? (
                          "Upgrade Plan"
                        ) : (
                          "Pilih Paket"
                        )}
                      </Button>
                    ) : (
                      <SignInButton mode="modal">
                        <Button
                          className={`w-full ${
                            showHighlight
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "bg-secondary text-foreground transition-colors hover:bg-[#d07225] hover:text-white"
                          }`}
                        >
                          {plan.monthlyPrice === 0 ? "Mulai Gratis" : "Pilih Paket"}
                        </Button>
                      </SignInButton>
                    )}
                  </div>

                  <div className="flex-1 overflow-auto p-4">
                    {pricingData.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="mb-4 last:mb-0">
                        <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {category.category}
                        </h4>
                        <div className="space-y-1 pl-1">
                          {category.features.map((feature, featureIndex) => {
                            const value = getFeatureValue(plan.key, feature)
                            return (
                              <div
                                key={featureIndex}
                                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-muted/50"
                              >
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {feature.name}

                                  {feature.tooltip && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs">
                                        <p>{feature.tooltip}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </span>
                                <span className="text-right text-sm font-medium text-foreground font-mono">
                                  {renderFeatureValue(value)}
                                </span>
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

          <div className="mt-16 text-center">
            <p className="text-sm font-mono text-muted-foreground">
              Punya pertanyaan? Hubungi kami di{" "}
              <a href="mailto:support@algosaham.ai" className="text-primary hover:underline">
                support@algosaham.ai
              </a>
            </p>
          </div>
        </div>
      </section>

      {selectedPlan && (
        <PaymentMethodDialog
          isOpen={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false)
            setSelectedPlan(null)
          }}
          planType={selectedPlan.type}
          planName={selectedPlan.name}
          billingInterval={isYearly ? "yearly" : "monthly"}
          amount={selectedPlan.amount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <Dialog open={manageSubscriptionsOpen} onOpenChange={setManageSubscriptionsOpen}>
        <DialogContent className="flex h-[85vh] max-w-3xl flex-col overflow-hidden p-0 sm:h-[80vh]">
          <AccountManagementPage />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export function PricingMatrix() {
  return (
    <Suspense
      fallback={
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <div className="mx-auto h-10 w-3/4 rounded bg-muted animate-pulse" />
              <div className="mx-auto mt-4 h-6 w-1/2 rounded bg-muted animate-pulse" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 h-8 w-1/2 rounded bg-muted animate-pulse" />
                  <div className="mb-4 h-12 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-10 w-full rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>
      }
    >
      <PricingMatrixInner />
    </Suspense>
  )
}
