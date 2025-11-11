import { ArrowRight, Wrench, TestTube, BarChart3, Rocket } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Bangun Strategi Anda",
      description: "Gunakan visual strategy builder kami untuk membuat aturan trading sesuai dengan indikator-indikator pilihan Anda.",
      icon: Wrench,
    },
    {
      number: "02",
      title: "Uji dengan Data Historis",
      description: "Lakukan backtest menggunakan data historis untuk melihat bagaimana performa strategi Anda jika diterapkan di masa lalu.",
      icon: TestTube,
    },
    {
      number: "03",
      title: "Analisis Hasil Secara Mendalam",
      description: "Tinjau metrik performa, grafik, dan riwayat transaksi untuk memahami kekuatan dan peluang perbaikan strategi Anda.",
      icon: BarChart3,
    },
    {
      number: "04",
      title: "Terapkan Strategi Anda dengan Keyakinan Penuh",
      description: "Aktifkan strategi yang telah teruji dan dioptimalkan, sehingga Anda dapat melangkah ke pasar dengan keputusan yang lebih percaya diri dan berbasis data.",
      icon: Rocket,
    },
  ];

  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Bagaimana{" "}
            <span className="text-ochre font-mono" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
              Algosaham.ai
            </span>{" "}
            Bekerja?
          </h2>
          <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">Dari ide hingga eksekusi dalam empat langkah sederhana.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative">
                <div className="p-6 rounded-xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col">
                    <div className="text-6xl font-bold text-primary/20 mb-4">{step.number}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground font-mono text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 text-primary/30 -translate-y-1/2" />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
