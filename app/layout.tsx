import type React from "react"
import { Inter, JetBrains_Mono, IBM_Plex_Mono } from "next/font/google"
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
  title: "AlgoSaham.ai - Indonesian Stock Backtesting Platform",
  description: "Professional stock backtesting platform for Indonesian markets",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${ibmPlexMono.variable} antialiased dark`}>
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  )
}
