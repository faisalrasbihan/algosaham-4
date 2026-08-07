"use client"

import { Suspense, useEffect, useState } from "react"
import { Check, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SignInButton, useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { PaymentMethodDialog } from "@/components/payment-method-dialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AccountManagementPage } from "@/components/account-management-page"
import { SectionHeader } from "@/components/page-layout"
import {
  PRICING_MATRIX_SECTIONS,
  SUBSCRIPTION_PLANS,
  YEARLY_DISCOUNT_PERCENT,
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

const planHighlights: Record<SubscriptionTier, string[]> = {
  ritel: [
    "3 analisis, screening, dan simulasi per hari",
    "Data historis hingga 6 bulan",
    "Akses strategi komunitas",
    "1 strategi per akun",
  ],
  suhu: [
    "20 analisis, screening, dan simulasi per hari",
    "Data historis hingga 2 tahun",
    "Strategi komunitas dan resmi",
    "10 strategi per akun",
  ],
  bandar: [
    "Analisis, screening, dan simulasi tanpa batas",
    "Data historis hingga 4 tahun",
    "Akses seluruh strategi",
    "Strategi publik dan privat",
  ],
}

const categoryLabels: Record<string, string> = {
  Ringkasan: "Ringkasan",
  Kuota: "Batas penggunaan",
  "Indikator / Fleksibilitas": "Analisis dan data",
  Strategy: "Strategi",
  Notifikasi: "Notifikasi",
}

const featureLabels: Record<string, string> = {
  "Target User": "Cocok untuk",
  "Kuota Simulasi / Backtest": "Simulasi / backtest",
  "Kuota Screening Saham": "Screening saham",
  "Kuota Analisis Saham": "Analisis saham",
  "Kuota Subscribe Strategy": "Strategi yang diikuti",
  "Indikator Fundamental": "Indikator fundamental",
  "Indikator Teknikal": "Indikator teknikal",
  "Data Historis": "Data historis",
  "Akses Strategy": "Akses strategi",
  "Monetisasi Strategi Publik": "Monetisasi strategi publik",
  "Privacy Strategy": "Privasi strategi",
}

const valueLabels: Record<string, string> = {
  Unlimited: "Tanpa batas",
  "Coming Soon": "Segera",
  "Common (Ritel)": "Umum",
  Advanced: "Lanjutan",
  Community: "Komunitas",
  "Community + Official": "Komunitas + resmi",
  "All Strategy": "Semua strategi",
  "Publik & Private": "Publik dan privat",
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

function PricingMatrixInner({ showHeader = true }: { showHeader?: boolean }) {
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
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <Check className="h-4 w-4 text-emerald-600" />
          Termasuk
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    }

    if (value === null) {
      return <span className="text-muted-foreground">Segera</span>
    }

    return <span>{valueLabels[value] ?? value}</span>
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

    const fullAmount = isYearly ? plan.yearlyTotalPrice : plan.monthlyPrice
    let amount = fullAmount
    
    if (userTier === "suhu" && planKey === "bandar") {
      const remainingValue = calculateUpgradeProration()
      const proratedAmount = Math.round(Math.max(0, fullAmount - remainingValue))
      amount = proratedAmount >= 1 ? proratedAmount : fullAmount
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
  const billingToggle = !isPaidUser ? (
    <div
      className="inline-flex h-10 items-center justify-center rounded-lg border border-border/80 bg-card p-1 text-muted-foreground shadow-sm"
      aria-label="Periode tagihan"
    >
      <button
        type="button"
        onClick={() => setIsYearly(false)}
        aria-pressed={!isYearly}
        className={`inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md px-4 text-sm font-medium transition-colors ${
          !isYearly ? "bg-muted text-foreground" : "hover:text-foreground"
        }`}
      >
        Bulanan
      </button>
      <button
        type="button"
        onClick={() => setIsYearly(true)}
        aria-pressed={isYearly}
        className={`inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md px-4 text-sm font-medium transition-colors ${
          isYearly ? "bg-muted text-foreground" : "hover:text-foreground"
        }`}
      >
        Tahunan
      </button>
    </div>
  ) : null

  return (
    <TooltipProvider>
      <section className={showHeader ? "px-4 py-16 sm:py-20" : "px-4 pb-16 pt-0 sm:pb-20"}>
        <div className="mx-auto max-w-7xl">
          {showHeader ? (
            <SectionHeader
              title="Pilih paket yang sesuai"
              description="Mulai dari kebutuhan Anda saat ini. Paket dapat diubah kapan saja."
              className="mb-6"
            />
          ) : null}

          {billingToggle ? (
            <div className="mb-8 flex justify-center">{billingToggle}</div>
          ) : null}

          <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const showHighlight = !isPaidUser && plan.highlighted
              const showBadge = showHighlight && plan.badge
              const isCurrentPlan = plan.key === userTier
              const isUpgradeToBandar = userTier === "suhu" && plan.key === "bandar"
              const isPrimaryAction = showHighlight || (isPaidUser && isCurrentPlan) || isUpgradeToBandar

              return (
                <div
                  key={plan.key}
                  className="flex min-h-[420px] flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    {showBadge ? (
                      <span className="shrink-0 rounded-md bg-[#f7eee6] px-2.5 py-1 text-xs font-medium text-[#a95316]">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-7">
                    {isYearly && plan.monthlyPrice > 0 ? (
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/70">
                          {formatPlanPrice(plan.monthlyPrice)}
                        </span>
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          -{YEARLY_DISCOUNT_PERCENT}%
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-semibold tracking-tight text-foreground">
                        {plan.monthlyPrice === 0 ? "Gratis" : formatPlanPrice(getDisplayedPrice(plan))}
                      </span>
                      {plan.monthlyPrice > 0 ? (
                        <span className="text-sm text-muted-foreground">/ bulan</span>
                      ) : null}
                    </div>
                    <p className="mt-2 min-h-5 text-sm text-muted-foreground">
                      {plan.monthlyPrice === 0
                        ? "Tanpa batas waktu"
                        : isYearly
                          ? "Ditagih per tahun"
                          : "Ditagih setiap bulan"}
                    </p>
                    {isUpgradeToBandar ? (
                      <p className="mt-1 text-xs text-muted-foreground">Harga upgrade dihitung prorata.</p>
                    ) : null}
                  </div>

                  <ul className="mt-7 space-y-3 text-sm leading-6 text-foreground">
                    {planHighlights[plan.key].map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#bf641f]" aria-hidden="true" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    {isSignedIn ? (
                      <Button
                        onClick={() => {
                          if (isPaidUser && isCurrentPlan) {
                            setManageSubscriptionsOpen(true)
                          } else {
                            handleSubscribe(plan.key)
                          }
                        }}
                        disabled={loadingPlan !== null || (isPaidUser && !isCurrentPlan && !isUpgradeToBandar)}
                        variant={isPrimaryAction ? "default" : "outline"}
                        className="h-11 w-full"
                      >
                        {loadingPlan === plan.key ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : isCurrentPlan ? (
                          plan.key === "ritel" ? "Paket saat ini" : "Kelola langganan"
                        ) : isUpgradeToBandar ? (
                          "Upgrade paket"
                        ) : (
                          "Pilih paket"
                        )}
                      </Button>
                    ) : (
                      <SignInButton mode="modal">
                        <Button
                          variant={showHighlight ? "default" : "outline"}
                          className="h-11 w-full"
                        >
                          {plan.monthlyPrice === 0 ? "Mulai gratis" : "Pilih paket"}
                        </Button>
                      </SignInButton>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
            <SectionHeader
              title="Bandingkan semua fitur"
              description="Lihat perbedaan setiap paket secara lengkap sebelum memilih."
              align="left"
              className="mb-3 sm:mb-6"
            />

            <p className="mb-4 text-sm text-muted-foreground sm:hidden">
              Geser tabel ke samping untuk melihat setiap paket.
            </p>

            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border/80">
                      <th className="w-[40%] px-6 py-5 text-sm font-medium text-muted-foreground">Fitur</th>
                      {plans.map((plan) => (
                        <th key={plan.key} className="px-5 py-5 font-heading text-base font-semibold text-foreground">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {pricingData.map((category) => (
                    <tbody key={category.category}>
                      <tr className="border-b border-border/70 bg-muted/35">
                        <th colSpan={4} className="px-6 py-3 text-sm font-semibold text-foreground">
                          {categoryLabels[category.category] ?? category.category}
                        </th>
                      </tr>
                      {category.features.map((feature) => (
                        <tr key={feature.name} className="border-b border-border/60 last:border-b-0">
                          <th className="px-6 py-4 text-sm font-normal text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              {featureLabels[feature.name] ?? feature.name}
                              {feature.tooltip ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p>{feature.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : null}
                            </span>
                          </th>
                          {plans.map((plan) => (
                            <td key={plan.key} className="px-5 py-4 text-sm text-foreground">
                              {feature.name === "Harga" && plan.monthlyPrice > 0
                                ? `${formatPlanPrice(getDisplayedPrice(plan))} / bulan`
                                : renderFeatureValue(getFeatureValue(plan.key, feature))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Masih perlu bantuan memilih? Hubungi{" "}
              <a href="mailto:support@algosaham.ai" className="font-medium text-foreground underline-offset-4 hover:underline">
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

export function PricingMatrix({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <Suspense
      fallback={
        <section className={showHeader ? "px-4 py-16 sm:py-20" : "px-4 pb-16 pt-0 sm:pb-20"}>
          <div className="mx-auto max-w-7xl">
            {showHeader ? (
              <div className="mb-12 text-center">
                <div className="mx-auto h-10 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mx-auto mt-4 h-6 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            ) : null}
            <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="min-h-[420px] rounded-2xl border border-border bg-card p-6">
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
      <PricingMatrixInner showHeader={showHeader} />
    </Suspense>
  )
}
