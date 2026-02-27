import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CircleHelp, FileSearch, LifeBuoy, TriangleAlert } from "lucide-react"

import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "Help Center | algosaham.ai",
  description:
    "Pusat bantuan algosaham.ai untuk pertanyaan umum, troubleshooting, dan panduan penggunaan.",
}

const topics = [
  {
    title: "Backtest terasa tidak masuk akal",
    body: "Periksa parameter, periode pengujian, dan asumsi biaya transaksi sebelum menyimpulkan ada bug.",
    icon: FileSearch,
  },
  {
    title: "Akses akun atau paket bermasalah",
    body: "Siapkan email akun dan konteks pembayaran agar tim bisa mengecek status dengan cepat.",
    icon: LifeBuoy,
  },
  {
    title: "Data terlihat tidak sesuai",
    body: "Pahami dulu ritme pembaruan harga, teknikal, dan fundamental. Tidak semua data bergerak dalam jadwal yang sama.",
    icon: TriangleAlert,
  },
]

export default function HelpPage() {
  return (
    <PageChrome>
      <section className="border-b border-border bg-secondary/20">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground">
              <CircleHelp className="h-4 w-4 text-ochre" />
              Help Center
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Tempat untuk mengurai masalah sebelum semuanya terasa seperti bug.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Banyak pertanyaan sebenarnya selesai lebih cepat kalau konteksnya
              dibereskan lebih dulu. Halaman ini dibuat untuk itu.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic.title}
                className="rounded-[2rem] border border-border bg-card p-6"
              >
                <topic.icon className="mb-4 h-6 w-6 text-ochre" />
                <h2 className="mb-3 text-xl font-semibold text-foreground">
                  {topic.title}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {topic.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-border bg-foreground p-6 text-background">
            <h2 className="mb-3 text-2xl font-semibold">
              Jika perlu eskalasi, kirim pesan yang bisa ditindaklanjuti.
            </h2>
            <p className="mb-5 max-w-2xl text-sm leading-7 text-background/75">
              Dukungan yang baik dimulai dari informasi yang cukup. Sertakan
              halaman terkait, langkah reproduksi, waktu kejadian, dan dampaknya.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
              >
                Buka dokumentasi
              </Link>
              <Link
                href="mailto:support@algosaham.ai"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/35"
              >
                Hubungi support
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
