import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Backtesting Saham v2 - Algosaham.ai",
  description:
    "Workspace backtesting saham desktop-first untuk pengguna prosumer dengan builder strategi padat, chart performa, dan analisis hasil terintegrasi.",
  openGraph: {
    title: "Backtesting Saham v2 - Algosaham.ai",
    description:
      "Workspace backtesting saham desktop-first untuk pengguna prosumer dengan builder strategi padat dan analisis hasil terintegrasi.",
    url: "https://algosaham.ai/backtest-v2",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backtesting Saham v2 - Algosaham.ai",
    description:
      "Workspace backtesting saham desktop-first untuk pengguna prosumer dengan builder strategi padat.",
  },
  alternates: {
    canonical: "https://algosaham.ai/backtest-v2",
  },
}

export default function BacktestV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
