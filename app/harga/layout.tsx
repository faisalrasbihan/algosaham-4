import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harga & Paket Berlangganan - algosaham.ai",
  description: "Pilih paket berlangganan yang sesuai untuk kebutuhan trading Anda. Akses strategi premium, backtesting lanjutan, dan fitur eksklusif lainnya.",
  keywords: [
    "harga algosaham",
    "paket berlangganan trading",
    "premium trading platform",
    "harga platform backtesting",
    "subscription trading saham",
  ],
  openGraph: {
    title: "Harga & Paket Berlangganan - algosaham.ai",
    description: "Pilih paket berlangganan yang sesuai untuk kebutuhan trading Anda. Akses strategi premium dan fitur eksklusif.",
    url: "https://algosaham.ai/harga",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harga & Paket Berlangganan - algosaham.ai",
    description: "Pilih paket berlangganan yang sesuai untuk kebutuhan trading Anda.",
  },
  alternates: {
    canonical: "https://algosaham.ai/harga",
  },
};

export default function HargaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

