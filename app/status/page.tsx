import type { Metadata } from "next"
import Link from "next/link"
import { Activity, ArrowRight, BadgeCheck, ChartColumn, ServerCog } from "lucide-react"

import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "System Status | algosaham.ai",
  description:
    "Status operasional layanan inti algosaham.ai dan penjelasan area yang dipantau.",
}

const systems = [
  { name: "Authentication", state: "Operational" },
  { name: "Market data flow", state: "Operational" },
  { name: "Backtest engine", state: "Operational" },
  { name: "Strategy library", state: "Operational" },
]

export default function StatusPage() {
  return (
    <PageChrome>
      <section className="border-b border-border bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto grid gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cambridge-blue/20 bg-cambridge-blue/10 px-4 py-2 text-sm text-cambridge-blue">
              <Activity className="h-4 w-4" />
              System status
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Status operasional seharusnya mudah dibaca, bukan disembunyikan.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Belum ada dashboard incident otomatis, tetapi halaman ini sudah
              punya bentuk yang tepat untuk komunikasi operasional yang jelas.
            </p>
          </div>

          <div className="rounded-[2rem] border border-border bg-foreground p-6 text-background">
            <p className="mb-2 text-sm uppercase tracking-[0.22em] text-cambridge-blue-700">
              Current state
            </p>
            <h2 className="mb-2 text-2xl font-semibold">All core systems operational</h2>
            <p className="text-sm leading-7 text-background/75">
              Halaman ini masih bersifat editorial, tetapi struktur status
              komponennya sudah siap untuk dikembangkan ke data real-time.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {systems.map((system) => (
              <div
                key={system.name}
                className="rounded-[2rem] border border-border bg-card p-6"
              >
                <BadgeCheck className="mb-4 h-6 w-6 text-cambridge-blue" />
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  {system.name}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {system.state}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-border bg-secondary/30 p-6">
              <ServerCog className="mb-4 h-6 w-6 text-ochre" />
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                Apa yang dipantau
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Fokus utamanya adalah login, paket pengguna, data harga, engine
                backtest, dan akses ke library strategi. Gangguan pada area ini
                paling cepat terasa oleh pengguna.
              </p>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6">
              <ChartColumn className="mb-4 h-6 w-6 text-ochre" />
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                Jika Anda melihat anomali
              </h2>
              <p className="mb-5 text-sm leading-7 text-muted-foreground">
                Sertakan halaman terkait, waktu kejadian, dan dampak yang Anda
                lihat. Incident report yang baik mempercepat validasi.
              </p>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 text-sm font-medium text-ochre transition-colors hover:text-ochre/80"
              >
                Laporkan masalah
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
