import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Backtesting Saham v3 - Algosaham.ai",
  description:
    "Workspace backtesting saham v3 dengan UI prosumer desktop-first, builder padat bergaya mono, dan grid analitik hasil simulasi.",
  openGraph: {
    title: "Backtesting Saham v3 - Algosaham.ai",
    description:
      "Workspace backtesting saham v3 dengan UI prosumer desktop-first, builder padat, dan grid analitik hasil simulasi.",
    url: "https://algosaham.ai/backtest-v3",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backtesting Saham v3 - Algosaham.ai",
    description:
      "Workspace backtesting saham v3 dengan UI prosumer desktop-first dan builder strategi padat.",
  },
  alternates: {
    canonical: "https://algosaham.ai/backtest-v3",
  },
}

export default function BacktestV3Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
