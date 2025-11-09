import { ArrowRight, Wrench, TestTube, BarChart3, Rocket } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Bangun Strategi Anda",
      description: "Gunakan visual strategy builder kami untuk membuat aturan trading sesuai dengan indikator-indikator pilihan Anda.",
      icon: Wrench,
      backgroundImage: "/images/Step-01-Strategy.png",
    },
    {
      number: "02",
      title: "Uji dengan Data Historis",
      description: "Lakukan simulasi menggunakan data historis untuk melihat bagaimana performa strategi Anda jika diterapkan di masa lalu.",
      icon: TestTube,
      backgroundImage: "/images/Step-02-History.png",
    },
    {
      number: "03",
      title: "Analisis Hasil Secara Mendalam",
      description: "Tinjau metrik performa, grafik, dan riwayat transaksi untuk memahami kekuatan dan peluang perbaikan strategi Anda.",
      icon: BarChart3,
      backgroundImage: "/images/Step-03-Analysis.png",
    },
    {
      number: "04",
      title: "Terapkan Strategi Anda",
      description: "Implementasikan strategi yang telah teruji dan dioptimalkan, sehingga menghasilkan keputusan yang lebih percaya diri dan berbasis data.",
      icon: Rocket,
      backgroundImage: "/images/Step-04-Execute.png",
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
              <div key={index} className="relative group">
                {/* Step card with background image */}
                <div
                  className="relative flex flex-col p-8 rounded-2xl overflow-hidden shadow-xl border-2 border-ochre h-[360px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:border-ochre/80"
                  style={{
                    backgroundImage: step.backgroundImage ? `url(${step.backgroundImage})` : "linear-gradient(135deg, rgba(208, 114, 37, 0.1) 0%, rgba(208, 114, 37, 0.2) 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* Overlay for text readability - darker at bottom for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/85"></div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-5">
                      {/* Number */}
                      <div className="text-7xl font-extrabold text-foreground drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] leading-none">{step.number}</div>
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl bg-ochre/20 backdrop-blur-md border-2 border-ochre/40 flex items-center justify-center shadow-lg mt-1">
                        <IconComponent className="w-7 h-7 text-ochre drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-foreground mb-4 drop-shadow-[0_1px_3px_rgba(255,255,255,0.6)] leading-tight">{step.title}</h3>

                    {/* Description with pale yellow background box (like Paket Pro) for better readability */}
                    <div className="flex-1 flex items-end mt-auto">
                      <div className="bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm rounded-lg p-5 border-2 border-primary/20 shadow-xl w-full">
                        <p className="text-foreground font-mono text-sm leading-relaxed font-medium">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow between steps - inside yellow circle */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-5 w-12 h-12 bg-ochre rounded-full items-center justify-center shadow-lg z-20 -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
