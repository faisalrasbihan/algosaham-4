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
    title: "Harga & Paket Berlangganan - Algosaham.ai",
    description: "Pilih paket berlangganan yang sesuai untuk kebutuhan trading Anda. Akses strategi premium dan fitur eksklusif.",
    url: "https://algosaham.ai/harga",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harga & Paket Berlangganan - Algosaham.ai",
    description: "Pilih paket berlangganan yang sesuai untuk kebutuhan trading Anda.",
  },
  alternates: {
    canonical: "https://algosaham.ai/harga",
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

export default function HargaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Determine if we're in production or sandbox mode
  // Use MIDTRANS_IS_PRODUCTION flag explicitly
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true' || process.env.NODE_ENV === 'production';
  const snapScriptUrl = isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

  return (
    <>
      {/* Midtrans Snap.js for payment popup */}
      <script
        src={snapScriptUrl}
        data-client-key={clientKey}
        async
      />
      {children}
    </>
  );
}

