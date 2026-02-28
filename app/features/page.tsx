import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BellRing,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  LineChart,
  Radar,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react"

import { PageChrome } from "@/components/page-chrome"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Features | algosaham.ai",
  description:
    "Lihat fitur utama algosaham.ai untuk backtest, subscribe strategy, analisis saham, screener, dan daily notification.",
}

const featureHighlights = [
  {
    title: "Backtest",
    label: "Simulasi berbasis data historis",
    description:
      "Rancang strategi, atur indikator, tambahkan manajemen risiko, lalu uji performanya untuk melihat return, drawdown, win rate, dan riwayat transaksi sebelum kamu pakai di dunia nyata.",
    icon: LineChart,
    href: "/backtest",
    bullets: [
      "Builder strategi yang fleksibel",
      "Metrik performa dan risiko yang detail",
      "Trade history dan visual evaluasi hasil",
    ],
  },
  {
    title: "Subscribe Strategy",
    label: "Ikuti strategi yang sudah teruji",
    description:
      "Jelajahi strategi dari algosaham dan komunitas, pelajari performanya, lalu subscribe untuk memantau signal dan perkembangan strateginya dari satu tempat.",
    icon: WalletCards,
    href: "/strategies",
    bullets: [
      "Marketplace strategi yang mudah dijelajahi",
      "Preview performa sebelum subscribe",
      "Terhubung ke portfolio subscription kamu",
    ],
  },
  {
    title: "Analyze Stock",
    label: "Baca saham lebih cepat dan lebih tajam",
    description:
      "Analisis saham menggabungkan skor teknikal, fundamental, risk plan, dan ringkasan insight agar kamu bisa memahami konteks pergerakan saham tanpa membuka terlalu banyak layar.",
    icon: BrainCircuit,
    href: "/analyze-v2",
    bullets: [
      "Skor teknikal dan fundamental dalam satu halaman",
      "Ringkasan insight yang mudah dibaca",
      "Risk plan untuk entry, stop loss, dan target",
    ],
  },
  {
    title: "Screener",
    label: "Saring peluang sesuai gaya kamu",
    description:
      "Gunakan filter teknikal dan fundamental untuk menyaring saham Indonesia dengan kriteria yang lebih spesifik, lalu lanjutkan riset dari hasil yang benar-benar relevan.",
    icon: Radar,
    href: "/screener",
    bullets: [
      "Filter multi-parameter",
      "Alur lanjut ke halaman analisis ticker",
      "Cocok untuk discovery ide yang cepat",
    ],
  },
  {
    title: "Daily Notification",
    label: "Tetap update tanpa memantau terus-menerus",
    description:
      "Strategi yang kamu subscribe dipantau terus dan performanya diperbarui otomatis setiap hari. Saat ada signal baru, alurnya sudah disiapkan untuk memberi notifikasi ke portfolio subscription kamu.",
    icon: BellRing,
    href: "/portfolio",
    bullets: [
      "Pantau strategi yang sudah kamu ikuti",
      "Update performa harian otomatis",
      "Siap mendukung alur signal notification",
    ],
  },
]

const workflow = [
  {
    step: "01",
    title: "Temukan peluang",
    body: "Mulai dari Screener untuk mempersempit daftar saham, atau langsung buka Analyze Stock kalau kamu sudah punya ticker incaran.",
  },
  {
    step: "02",
    title: "Validasi ide",
    body: "Uji hipotesis dengan Backtest untuk melihat apakah strategi tetap masuk akal saat dipaksa menghadapi data historis.",
  },
  {
    step: "03",
    title: "Ikuti strategi terbaik",
    body: "Kalau kamu menemukan strategi yang sesuai, subscribe dan kelola semua strategi yang kamu ikuti dari halaman portfolio.",
  },
  {
    step: "04",
    title: "Pantau harian",
    body: "Biarkan performa subscription diperbarui otomatis setiap hari supaya kamu tidak perlu memeriksa semuanya secara manual.",
  },
]

const principles = [
  "Satu ekosistem dari discovery sampai monitoring",
  "Visual dan insight yang cukup detail untuk evaluasi",
  "Didesain untuk pasar saham Indonesia",
]

export default function FeaturesPage() {
  return (
    <PageChrome>
      <section className="relative overflow-hidden border-b border-border bg-secondary/25">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-ochre/10 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-4rem] h-80 w-80 rounded-full bg-cambridge-blue/15 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 py-20 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ochre/20 bg-background/90 px-4 py-2 text-sm text-foreground shadow-sm">
                <Sparkles className="h-4 w-4 text-ochre" />
                Semua fitur inti dalam satu alur kerja
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Satu platform untuk riset, simulasi, dan memantau strategi saham.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Halaman ini merangkum fitur utama di algosaham.ai yang paling
                sering dipakai untuk mencari ide, menguji strategi, mengikuti
                strategi komunitas, dan memantau signal harian dengan lebih
                terstruktur.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/backtest">
                  <Button size="lg" className="bg-ochre text-white hover:bg-ochre/90">
                    Coba Backtest
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/strategies">
                  <Button size="lg" variant="outline" className="border-border bg-background/80">
                    Lihat Strategi
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-[0_24px_80px_-32px_rgba(54,53,55,0.25)]">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Feature stack</p>
                  <p className="font-ibm-plex-mono text-xl font-semibold text-foreground">
                    algosaham.ai
                  </p>
                </div>
                <div className="rounded-full bg-ochre/10 px-3 py-1 text-xs font-semibold text-ochre">
                  5 fitur utama
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {featureHighlights.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 rounded-2xl border border-border/70 bg-secondary/40 p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background">
                      <feature.icon className="h-5 w-5 text-ochre" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground">
                          {feature.title}
                        </h2>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {feature.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="font-ibm-plex-mono text-sm uppercase tracking-[0.2em] text-ochre">
            Main Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Bukan sekadar daftar tools. Ini alur kerja yang saling terhubung.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {featureHighlights.map((feature, index) => (
            <div
              key={feature.title}
              className={`rounded-[2rem] border border-border p-7 shadow-sm transition-colors hover:border-ochre/30 ${
                index === 0 || index === 3 ? "bg-card" : "bg-secondary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ochre/10">
                    <feature.icon className="h-7 w-7 text-ochre" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {feature.label}
                    </p>
                    <h3 className="text-2xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <span className="font-ibm-plex-mono text-sm text-muted-foreground">
                  0{index + 1}
                </span>
              </div>

              <p className="mt-6 text-base leading-8 text-muted-foreground">
                {feature.description}
              </p>

              <div className="mt-6 space-y-3">
                {feature.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cambridge-blue" />
                    <p className="text-sm leading-7 text-foreground/80">{bullet}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ochre transition-opacity hover:opacity-80"
                >
                  Pelajari fitur ini
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/20">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-ibm-plex-mono text-sm uppercase tracking-[0.2em] text-ochre">
                How It Connects
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Dari screening sampai notifikasi harian, semuanya nyambung.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                Tujuan halaman ini bukan membuat setiap fitur terlihat berdiri
                sendiri. Value utamanya justru muncul saat fitur-fitur itu
                dipakai sebagai satu sistem.
              </p>

              <div className="mt-8 rounded-[2rem] border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ochre/10">
                    <Target className="h-5 w-5 text-ochre" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Kenapa alurnya kuat
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Setiap fitur mengurangi friksi di tahap berikutnya.
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {principles.map((principle) => (
                    <div key={principle} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ochre" />
                      <p className="text-sm leading-7 text-foreground/80">{principle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {workflow.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[2rem] border border-border bg-card p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="font-ibm-plex-mono text-sm font-semibold tracking-[0.2em] text-ochre">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="rounded-[2rem] border border-border bg-foreground px-6 py-8 text-background md:px-10 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-ibm-plex-mono text-sm uppercase tracking-[0.2em] text-background/60">
                Start Here
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Pilih pintu masuk yang paling relevan dengan cara kamu bekerja.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-background/75">
                Kalau kamu ingin validasi ide, mulai dari Backtest. Kalau kamu
                ingin cari ide baru, mulai dari Screener. Kalau kamu ingin
                mengikuti strategi yang sudah jalan, langsung buka halaman
                Strategies.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/backtest">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                  Backtest
                </Button>
              </Link>
              <Link href="/screener">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Screener
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
