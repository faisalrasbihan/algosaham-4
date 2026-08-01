import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BarChart3, Brush, Database, Hammer } from "lucide-react"

import { PageChrome } from "@/components/page-chrome"
import { PageHeader, PageSection, SectionHeader, Surface } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "Careers | algosaham.ai",
  description:
    "Informasi karier dan area kontribusi yang dibutuhkan untuk mengembangkan algosaham.ai.",
  alternates: {
    canonical: "/careers",
  },
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
      <PageHeader
        eyebrow="Careers"
        title="Saat ini kami belum membuka lowongan."
        description="Kami belum sedang merekrut untuk posisi baru. Namun, halaman ini akan diperbarui secara berkala, jadi silakan cek lagi secara rutin untuk melihat peluang terbaru."
        aside={
          <Surface className="border-foreground bg-foreground p-5 text-background">
              <p className="mb-2 text-sm uppercase tracking-[0.22em] text-cambridge-blue-700">
                Tetap terhubung
              </p>
              <h2 className="mb-3 text-xl font-semibold">
                Belum ada posisi terbuka untuk saat ini.
              </h2>
              <p className="mb-5 text-sm leading-7 text-background/75">
                Jika Anda tertarik dengan algosaham.ai, pantau halaman ini secara
                berkala. Saat ada kebutuhan baru, informasinya akan kami tampilkan
                di sini.
              </p>
              <Link
                href="mailto:support@algosaham.ai"
                className="inline-flex items-center gap-2 text-sm font-medium text-cambridge-blue-700 transition-colors hover:text-white"
              >
                Hubungi kami
                <ArrowRight className="h-4 w-4" />
              </Link>
          </Surface>
        }
      />

      <PageSection className="pt-4">
          <SectionHeader
            eyebrow="Area kontribusi"
            title="Fokus area yang biasanya relevan saat kami membuka peran baru"
          />

          <div className="grid gap-6 md:grid-cols-2">
            {roles.map((role) => (
              <Surface
                key={role.title}
                className="p-5"
              >
                <role.icon className="mb-4 h-6 w-6 text-cambridge-blue" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {role.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {role.description}
                </p>
              </Surface>
            ))}
          </div>
      </PageSection>
    </PageChrome>
  )
}
