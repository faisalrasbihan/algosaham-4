import type React from "react"
import { Inter, JetBrains_Mono, IBM_Plex_Mono } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600", "700"],
})

export const metadata = {
  metadataBase: new URL("https://algosaham.ai"),
  title: {
    default: "Algosaham - Platform Backtesting Saham Indonesia Berbasis AI",
    template: "%s | algosaham.ai",
  },
  description: "Platform backtesting saham berbasis AI terdepan di Indonesia. Eksplorasi strategi kustom, akses strategi top performer, dan nikmati strategi premium berlangganan untuk memaksimalkan keuntungan investasi Anda.",
  keywords: [
    "backtesting saham",
    "strategi saham AI",
    "trading saham Indonesia",
    "analisis saham otomatis",
    "platform investasi AI",
    "algoritma trading",
    "strategi investasi saham",
    "backtesting Indonesia",
    "AI trading platform",
    "investasi berbasis data",
  ],
  authors: [{ name: "algosaham.ai" }],
  creator: "algosaham.ai",
  publisher: "algosaham.ai",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://algosaham.ai",
    siteName: "algosaham.ai",
    title: "algosaham.ai - Platform Backtesting Saham Indonesia Berbasis AI",
    description: "Platform backtesting saham berbasis AI terdepan di Indonesia. Eksplorasi strategi kustom, akses strategi top performer, dan nikmati strategi premium berlangganan.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "algosaham.ai - Platform Backtesting Saham Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "algosaham.ai - Platform Backtesting Saham Indonesia Berbasis AI",
    description: "Platform backtesting saham berbasis AI terdepan di Indonesia. Eksplorasi strategi kustom dan akses strategi top performer.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://algosaham.ai",
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${ibmPlexMono.variable} antialiased dark`}>
        <body className="min-h-screen bg-background text-foreground">{children}</body>
      </html>
    </ClerkProvider>
  )
}
