import { ArrowRight } from "lucide-react"

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
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Cara Algosaham.ai Bekerja</h2>
          <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
            Semua yang Kamu Butuh untuk Bangun Strategi Trading Ada di Sini
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col">
                <div className="text-6xl font-bold text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground font-mono text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-12 -right-4 w-8 h-8 text-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
