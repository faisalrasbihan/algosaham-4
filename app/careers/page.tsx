import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BarChart3, Brush, Database, Hammer } from "lucide-react"

import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "Careers | algosaham.ai",
  description:
    "Informasi karier dan area kontribusi yang dibutuhkan untuk mengembangkan algosaham.ai.",
}

const roles = [
  {
    title: "Product engineering",
    description: "Membangun workflow yang terasa cepat, jelas, dan sulit disalahgunakan.",
    icon: Hammer,
  },
  {
    title: "Quant and research",
    description: "Menguji ide pasar dengan disiplin statistik dan skeptisisme yang sehat.",
    icon: BarChart3,
  },
  {
    title: "Data systems",
    description: "Menjaga kualitas pipeline, konsistensi data, dan keandalan operasional.",
    icon: Database,
  },
  {
    title: "Design",
    description: "Menerjemahkan kompleksitas trading menjadi interface yang mudah dipikirkan.",
    icon: Brush,
  },
]

export default function CareersPage() {
  return (
    <PageChrome>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-cambridge-blue/10 to-transparent" />
        <div className="container mx-auto px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="max-w-3xl space-y-6">
              <p className="text-sm uppercase tracking-[0.22em] text-cambridge-blue">
                Careers
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Kami mencari orang yang suka membuat sistem lebih tajam.
              </h1>
              <p className="text-lg leading-8 text-muted-foreground">
                Produk ini hidup di antara trading, data, dan product execution.
                Artinya kami lebih menghargai kualitas keputusan daripada daftar
                tool yang pernah disentuh.
              </p>
            </div>

            <div className="rounded-[2rem] border border-border bg-foreground p-6 text-background">
              <p className="mb-2 text-sm uppercase tracking-[0.22em] text-cambridge-blue-700">
                Cara mendekat
              </p>
              <h2 className="mb-3 text-xl font-semibold">
                Kirim bukti kerja, bukan paragraf generik.
              </h2>
              <p className="mb-5 text-sm leading-7 text-background/75">
                Repo yang rapi, studi kasus, atau tulisan yang menunjukkan cara
                berpikir biasanya jauh lebih berguna daripada CV yang padat jargon.
              </p>
              <Link
                href="mailto:support@algosaham.ai"
                className="inline-flex items-center gap-2 text-sm font-medium text-cambridge-blue-700 transition-colors hover:text-white"
              >
                Kirim perkenalan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-6 py-12">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Area kontribusi
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Peran yang paling dekat dengan kebutuhan produk sekarang.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.title}
                className="rounded-[2rem] border border-border bg-card p-6"
              >
                <role.icon className="mb-4 h-6 w-6 text-cambridge-blue" />
                <h3 className="mb-3 text-2xl font-semibold text-foreground">
                  {role.title}
                </h3>
                <p className="text-base leading-7 text-muted-foreground">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
