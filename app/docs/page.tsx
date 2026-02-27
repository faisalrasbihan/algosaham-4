import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookMarked, ChartCandlestick, ScanSearch, ShieldCheck } from "lucide-react"

import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "Documentation | algosaham.ai",
  description:
    "Panduan penggunaan algosaham.ai untuk backtesting, screening, analisis, dan pengelolaan strategi.",
}

const quickstartSteps = [
  {
    title: "Temukan setup yang layak diuji",
    body: "Mulai dari ide sederhana. Pilih saham, indikator, dan horizon yang memang sesuai dengan cara Anda mengambil keputusan.",
  },
  {
    title: "Uji dengan parameter yang bisa dipertanggungjawabkan",
    body: "Jangan mengoptimalkan terlalu cepat. Jalankan backtest dengan asumsi biaya, periode, dan aturan entry-exit yang masuk akal.",
  },
  {
    title: "Baca hasil dengan fokus pada risiko",
    body: "Kinerja tidak berdiri sendiri. Drawdown, frekuensi transaksi, dan konsistensi lintas periode harus dibaca bersamaan.",
  },
]

const modules = [
  {
    title: "Backtest",
    description: "Untuk menguji strategi dengan aturan yang eksplisit sebelum dipakai di market nyata.",
    href: "/backtest",
    icon: ChartCandlestick,
  },
  {
    title: "Screener",
    description: "Untuk mempersempit universe saham sebelum analisis detail dilakukan.",
    href: "/screener",
    icon: ScanSearch,
  },
  {
    title: "Analisis",
    description: "Untuk membaca indikator, konteks tren, dan visualisasi yang lebih dalam pada satu ticker.",
    href: "/analyze-v2",
    icon: BookMarked,
  },
  {
    title: "Strategi",
    description: "Untuk menjelajahi strategi yang sudah ada, mempelajari logikanya, dan menentukan apa yang layak diuji.",
    href: "/strategies",
    icon: ShieldCheck,
  },
]

export default function DocsPage() {
  return (
    <PageChrome>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 dotted-background opacity-35" />
        <div className="container relative mx-auto px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="max-w-3xl space-y-6">
              <p className="text-sm uppercase tracking-[0.22em] text-ochre">
                Documentation
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Manual kerja untuk memakai produk tanpa banyak asumsi.
              </h1>
              <p className="text-lg leading-8 text-muted-foreground">
                Halaman ini dirancang seperti quickstart desk, bukan brosur.
                Fokusnya adalah alur berpikir: dari ide, ke pengujian, ke evaluasi.
              </p>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6">
              <p className="mb-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Quickstart
              </p>
              <div className="space-y-4">
                {quickstartSteps.map((step, index) => (
                  <div key={step.title} className="rounded-2xl bg-secondary/40 p-4">
                    <p className="mb-2 font-mono text-xs text-ochre">
                      Step {index + 1}
                    </p>
                    <h2 className="mb-2 text-base font-semibold text-foreground">
                      {step.title}
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-6 py-12">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Core modules
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Setiap halaman punya fungsi yang berbeda, dan itu memang disengaja.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {modules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group rounded-[2rem] border border-border bg-card p-6 transition-all hover:border-ochre/30 hover:shadow-sm"
              >
                <module.icon className="mb-4 h-7 w-7 text-ochre" />
                <h3 className="mb-3 text-2xl font-semibold text-foreground transition-colors group-hover:text-ochre">
                  {module.title}
                </h3>
                <p className="mb-5 text-base leading-7 text-muted-foreground">
                  {module.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  Buka modul
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
