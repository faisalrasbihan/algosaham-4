import type { Metadata } from "next"

import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "About Us | algosaham.ai",
  description:
    "Mengenal misi, pendekatan, dan prinsip produk algosaham.ai untuk trader dan investor Indonesia.",
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
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-cambridge-blue/10 to-transparent" />
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.22em] text-cambridge-blue">
              About Us
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              algosaham.ai dibangun untuk membuat analisis trading lebih disiplin.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Kami membantu trader dan investor di Indonesia menyusun, menguji,
              dan menjalankan strategi dengan proses yang lebih sistematis.
              Fokus kami bukan memberi janji hasil, tetapi memberi alat yang
              membuat pengambilan keputusan lebih jelas.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-6 py-12">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Prinsip kami
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Tiga hal yang kami jaga saat membangun produk.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="rounded-[2rem] border border-border bg-card p-6"
              >
                <h3 className="mb-3 text-2xl font-semibold text-foreground">
                  {principle.title}
                </h3>
                <p className="text-base leading-7 text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
