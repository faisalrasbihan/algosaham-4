import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strategi Trading Saham - algosaham.ai",
  description: "Jelajahi strategi trading saham terbaik dari komunitas. Akses strategi top performer, strategi premium berlangganan, dan buat strategi kustom Anda sendiri.",
  keywords: [
    "strategi trading saham",
    "strategi investasi saham",
    "strategi saham terbaik",
    "strategi top performer",
    "strategi premium saham",
    "komunitas trading saham",
  ],
  openGraph: {
    title: "Strategi Trading Saham - algosaham.ai",
    description: "Jelajahi strategi trading saham terbaik dari komunitas. Akses strategi top performer dan strategi premium berlangganan.",
    url: "https://algosaham.ai/strategies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strategi Trading Saham - algosaham.ai",
    description: "Jelajahi strategi trading saham terbaik dari komunitas.",
  },
  alternates: {
    canonical: "https://algosaham.ai/strategies",
  },
};

export default function StrategiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

