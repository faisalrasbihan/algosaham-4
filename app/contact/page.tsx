import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Bug, CreditCard, Handshake, Mail } from "lucide-react"

import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "Contact | algosaham.ai",
  description:
    "Hubungi tim algosaham.ai untuk pertanyaan produk, kerja sama, atau kebutuhan support.",
}

const routes = [
  {
    title: "Product support",
    description: "Gunakan untuk bug, error alur produk, atau perilaku sistem yang tidak sesuai.",
    icon: Bug,
  },
  {
    title: "Billing and account",
    description: "Gunakan untuk langganan, akses akun, verifikasi pembayaran, dan upgrade paket.",
    icon: CreditCard,
  },
  {
    title: "Partnership",
    description: "Gunakan untuk integrasi data, kerja sama bisnis, dan kebutuhan B2B.",
    icon: Handshake,
  },
]

export default function ContactPage() {
  return (
    <PageChrome>
      <section className="border-b border-border bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto grid gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.22em] text-ochre">Contact</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Kontak harus mengarahkan masalah ke tempat yang tepat.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Karena itu halaman ini tidak dibuat seperti kartu nama. Tujuannya
              adalah membantu Anda mengirim konteks yang cukup sejak pesan pertama.
            </p>
            <Link
              href="mailto:support@algosaham.ai"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              support@algosaham.ai
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6">
            <Mail className="mb-4 h-7 w-7 text-ochre" />
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Sertakan tiga hal ini.
            </h2>
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>Masalah apa yang Anda alami.</p>
              <p>Halaman atau fitur tempat masalah muncul.</p>
              <p>Waktu kejadian dan langkah reproduksi jika ada.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {routes.map((route) => (
              <div
                key={route.title}
                className="rounded-[2rem] border border-border bg-card p-6"
              >
                <route.icon className="mb-4 h-6 w-6 text-ochre" />
                <h2 className="mb-3 text-xl font-semibold text-foreground">
                  {route.title}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {route.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
