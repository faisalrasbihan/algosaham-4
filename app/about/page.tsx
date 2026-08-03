import type { Metadata } from "next"

import { PageChrome } from "@/components/page-chrome"
import { PageHeader, PageSection, SectionHeader, Surface } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "About Us | algosaham.ai",
  description:
    "Mengenal misi, pendekatan, dan prinsip produk algosaham.ai untuk trader dan investor Indonesia.",
  alternates: {
    canonical: "/about",
  },
}

const principles = [
  {
    title: "Jelas",
    description:
      "Kami merancang produk agar logika strategi, data, dan risiko bisa dipahami tanpa jargon yang tidak perlu.",
  },
  {
    title: "Terukur",
    description:
      "Setiap fitur harus membantu pengguna menguji ide pasar dengan data, aturan, dan evaluasi yang bisa dipertanggungjawabkan.",
  },
  {
    title: "Praktis",
    description:
      "Kami fokus pada workflow yang benar-benar membantu proses analisis harian, bukan sekadar menambah indikator.",
  },
]

export default function AboutPage() {
  return (
    <PageChrome>
      <PageHeader
        title="algosaham.ai dibangun untuk membuat analisis trading lebih disiplin."
        description="Kami membantu trader dan investor di Indonesia menyusun, menguji, dan menjalankan strategi dengan proses yang lebih sistematis. Fokus kami bukan memberi janji hasil, tetapi memberi alat yang membuat pengambilan keputusan lebih jelas."
      />

      <PageSection className="pt-4">
          <SectionHeader
            title="Tiga hal yang kami jaga saat membangun produk"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {principles.map((principle) => (
              <Surface
                key={principle.title}
                className="p-5"
              >
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {principle.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {principle.description}
                </p>
              </Surface>
            ))}
          </div>
      </PageSection>
    </PageChrome>
  )
}
