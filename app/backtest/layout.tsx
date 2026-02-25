import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backtesting Saham - Algosaham.ai",
  description: "Uji strategi trading saham Anda dengan platform backtesting berbasis AI. Analisis performa historis, optimasi parameter, dan validasi strategi sebelum trading real.",
  keywords: [
    "backtesting saham",
    "uji strategi trading",
    "analisis performa historis",
    "optimasi strategi saham",
    "validasi strategi trading",
    "backtesting Indonesia",
  ],
  openGraph: {
    title: "Backtesting Saham - Algosaham.ai",
    description: "Uji strategi trading saham Anda dengan platform backtesting berbasis AI. Analisis performa historis dan optimasi parameter.",
    url: "https://algosaham.ai/backtest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backtesting Saham - Algosaham.ai",
    description: "Uji strategi trading saham Anda dengan platform backtesting berbasis AI.",
  },
  alternates: {
    canonical: "https://algosaham.ai/backtest",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function BacktestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

