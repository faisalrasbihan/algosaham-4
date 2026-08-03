import { ArrowRight } from "lucide-react"

import { PageSection, SectionHeader } from "@/components/page-layout"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Bangun Strategi Kamu",
      description:
        "Pakai visual strategy builder yang super mudah. Pilih indikator → susun aturan buy/sell → jadi deh strategi versi kamu. Tanpa coding, tanpa pusing.",
    },
    {
      number: "02",
      title: "Uji Pakai Data Historis",
      description:
        "Simulasikan strategi kamu dengan data harga masa lalu. Lihat apakah strateginya bakal cuan atau jeblok kalau dipakai dulu. Semua serba transparan.",
    },
    {
      number: "03",
      title: "Analisis Lebih Dalam",
      description:
        "Pantau performa lewat grafik, metrik kinerja, dan riwayat transaksi. Temukan kekuatan strategi kamu, dan lihat peluang buat di-improve. Biar trading makin mantap, bukan mengandalkan feeling lagi.",
    },
    {
      number: "04",
      title: "Jalankan Strategi Secara Real",
      description:
        "Saatnya eksekusi! Terapkan strategi terbaik yang sudah teruji dan dioptimalkan. Biar keputusan trading kamu lebih percaya diri, konsisten, dan berbasis data.",
    },
  ]

  return (
    <PageSection className="border-t border-border/60 bg-muted/30 py-12 sm:py-16">
      <SectionHeader
        title="Cara Algosaham.ai bekerja"
        description="Bangun, uji, evaluasi, lalu jalankan strategi dalam satu alur yang mudah dipahami."
        className="mb-8"
      />

      <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            <div className="flex flex-col">
              <div className="mb-3 font-heading text-4xl font-semibold tracking-[-0.05em] text-foreground/15">
                {step.number}
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="absolute -right-4 top-6 hidden h-5 w-5 text-foreground/15 lg:block" />
            )}
          </div>
        ))}
      </div>
    </PageSection>
  )
}
