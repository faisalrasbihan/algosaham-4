export type SubscriptionTier = "ritel" | "suhu" | "bandar";
export type PaidSubscriptionTier = Exclude<SubscriptionTier, "ritel">;
export type BillingInterval = "monthly" | "yearly";

export const UNLIMITED = -1;

export type PricingMatrixValue = string | boolean | null;

type TierQuotaConfig = {
  analyze: number;
  screening: number;
  backtest: number;
  subscriptions: number;
  savedStrategies: number;
  aiChat: number;
};

type TierVisualConfig = {
  badgeLabel?: string;
  badgeTone?: "primary" | "accent";
  featured?: boolean;
};

export type SubscriptionPlanConfig = {
  key: SubscriptionTier;
  name: string;
  subtitle: string;
  targetUser: string;
  monthlyPrice: number;
  yearlyPrice: number;
  quotas: TierQuotaConfig;
  visuals?: TierVisualConfig;
};

export type PricingMatrixRow = {
  feature: string;
  note?: string | null;
  values: Record<SubscriptionTier, PricingMatrixValue>;
};

export type PricingMatrixSection = {
  title?: string;
  rows: PricingMatrixRow[];
};

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlanConfig> = {
  ritel: {
    key: "ritel",
    name: "Free",
    subtitle: "Untuk Pemula",
    targetUser: "Pemula / Ritel",
    monthlyPrice: 0,
    yearlyPrice: 0,
    quotas: {
      analyze: 3,
      screening: 3,
      backtest: 3,
      subscriptions: 1,
      savedStrategies: 1,
      aiChat: 5,
    },
  },
  suhu: {
    key: "suhu",
    name: "Suhu",
    subtitle: "Trader Aktif",
    targetUser: "Trader aktif",
    monthlyPrice: 139000,
    yearlyPrice: 139000 * 12,
    quotas: {
      analyze: 20,
      screening: 20,
      backtest: 20,
      subscriptions: 10,
      savedStrategies: 20,
      aiChat: UNLIMITED,
    },
    visuals: {
      badgeLabel: "Most Popular",
      badgeTone: "primary",
      featured: true,
    },
  },
  bandar: {
    key: "bandar",
    name: "Bandar",
    subtitle: "Trader Profesional",
    targetUser: "Trader profesional",
    monthlyPrice: 169000,
    yearlyPrice: 169000 * 12,
    quotas: {
      analyze: UNLIMITED,
      screening: UNLIMITED,
      backtest: UNLIMITED,
      subscriptions: UNLIMITED,
      savedStrategies: 50,
      aiChat: UNLIMITED,
    },
    visuals: {
      badgeLabel: "Best Value",
      badgeTone: "accent",
    },
  },
};

export const PLAN_ORDER: SubscriptionTier[] = ["ritel", "suhu", "bandar"];

export const PRICING_MATRIX_SECTIONS: PricingMatrixSection[] = [
  {
    rows: [
      {
        feature: "Harga",
        values: {
          ritel: "Gratis selamanya",
          suhu: "Rp 139.000 / bulan",
          bandar: "Rp 169.000 / bulan",
        },
      },
      {
        feature: "Target User",
        values: {
          ritel: "Pemula / Ritel",
          suhu: "Trader aktif",
          bandar: "Trader profesional",
        },
      },
    ],
  },
  {
    title: "Kuota",
    rows: [
      {
        feature: "Kuota Simulasi / Backtest",
        values: {
          ritel: "3x / hari",
          suhu: "20x / hari",
          bandar: "Unlimited",
        },
      },
      {
        feature: "Kuota Screening Saham",
        values: {
          ritel: "3x / hari",
          suhu: "20x / hari",
          bandar: "Unlimited",
        },
      },
      {
        feature: "Kuota Analisis Saham",
        values: {
          ritel: "3x / hari",
          suhu: "20x / hari",
          bandar: "Unlimited",
        },
      },
      {
        feature: "Kuota Subscribe Strategy",
        values: {
          ritel: "1/akun",
          suhu: "10/akun",
          bandar: "Unlimited",
        },
      },
    ],
  },
  {
    title: "Indikator / Fleksibilitas",
    rows: [
      {
        feature: "Indikator Fundamental",
        values: {
          ritel: "Lengkap",
          suhu: "Lengkap",
          bandar: "Lengkap",
        },
      },
      {
        feature: "Indikator Teknikal",
        values: {
          ritel: "Common (Ritel)",
          suhu: "Advanced",
          bandar: "Advanced",
        },
      },
      {
        feature: "Data Historis",
        values: {
          ritel: "6 bulan",
          suhu: "2 tahun",
          bandar: "4 tahun",
        },
      },
    ],
  },
  {
    title: "Strategy",
    rows: [
      {
        feature: "Akses Strategy",
        values: {
          ritel: "Community",
          suhu: "Community + Official",
          bandar: "All Strategy",
        },
      },
      {
        feature: "Monetisasi Strategi Publik",
        values: {
          ritel: "Coming Soon",
          suhu: "Coming Soon",
          bandar: "Coming Soon",
        },
      },
      {
        feature: "Privacy Strategy",
        values: {
          ritel: "Publik",
          suhu: "Publik",
          bandar: "Publik & Private",
        },
      },
    ],
  },
  {
    title: "Notifikasi",
    rows: [
      {
        feature: "Email",
        values: {
          ritel: false,
          suhu: true,
          bandar: true,
        },
      },
      {
        feature: "Telegram",
        values: {
          ritel: false,
          suhu: false,
          bandar: true,
        },
      },
      {
        feature: "WhatsApp",
        values: {
          ritel: false,
          suhu: false,
          bandar: true,
        },
      },
    ],
  },
];

export function getPlanConfig(tier: SubscriptionTier) {
  return SUBSCRIPTION_PLANS[tier];
}

export function getPlanPrice(tier: PaidSubscriptionTier, billingInterval: BillingInterval) {
  return SUBSCRIPTION_PLANS[tier][billingInterval === "yearly" ? "yearlyPrice" : "monthlyPrice"];
}

export function getTierDisplayName(tier: string | null | undefined) {
  if (!tier) return SUBSCRIPTION_PLANS.ritel.name;
  return tier in SUBSCRIPTION_PLANS
    ? SUBSCRIPTION_PLANS[tier as SubscriptionTier].name
    : tier;
}

export function getTierQuotaConfig(tier: SubscriptionTier) {
  return SUBSCRIPTION_PLANS[tier].quotas;
}

export function getTierDbFields(tier: SubscriptionTier) {
  const quotas = getTierQuotaConfig(tier);

  return {
    subscriptionTier: tier,
    analyzeLimit: quotas.analyze,
    screeningLimit: quotas.screening,
    backtestLimit: quotas.backtest,
    savedStrategiesLimit: quotas.savedStrategies,
    subscriptionsLimit: quotas.subscriptions,
    aiChatLimit: quotas.aiChat,
  };
}

export function isUnlimited(value: number) {
  return value === UNLIMITED;
}

export function formatPlanPrice(price: number) {
  if (price === 0) return "Gratis";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
