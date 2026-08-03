import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BadgeCheck, ChartColumn, ServerCog } from "lucide-react"

import { PageChrome } from "@/components/page-chrome"
import { PageHeader, PageSection, SectionHeader, Surface } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "System Status | algosaham.ai",
  description:
    "Status operasional layanan inti algosaham.ai dan penjelasan area yang dipantau.",
  alternates: {
    canonical: "/status",
  },
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
      <PageHeader
        title="Status operasional seharusnya mudah dibaca, bukan disembunyikan."
        description="Belum ada dashboard incident otomatis, tetapi halaman ini sudah punya bentuk yang tepat untuk komunikasi operasional yang jelas."
        aside={
          <Surface className="border-foreground bg-foreground p-5 text-background">
            <p className="mb-2 text-sm uppercase tracking-[0.22em] text-cambridge-blue-700">
              Current state
            </p>
            <h2 className="mb-2 text-lg font-semibold">All core systems operational</h2>
            <p className="text-sm leading-7 text-background/75">
              Halaman ini masih bersifat editorial, tetapi struktur status
              komponennya sudah siap untuk dikembangkan ke data real-time.
            </p>
          </Surface>
        }
      />

      <PageSection className="pt-4">
          <SectionHeader title="core systems" description="Ringkasan layanan yang paling langsung memengaruhi workflow pengguna." />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {systems.map((system) => (
              <Surface
                key={system.name}
                className="p-5"
              >
                <BadgeCheck className="mb-4 h-6 w-6 text-cambridge-blue" />
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {system.name}
                </h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {system.state}
                </p>
              </Surface>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Surface className="bg-secondary/30 p-5">
              <ServerCog className="mb-4 h-6 w-6 text-ochre" />
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                Apa yang dipantau
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Fokus utamanya adalah login, paket pengguna, data harga, engine
                backtest, dan akses ke library strategi. Gangguan pada area ini
                paling cepat terasa oleh pengguna.
              </p>
            </Surface>

            <Surface className="p-5">
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
            </Surface>
          </div>
      </PageSection>
    </PageChrome>
  )
}
