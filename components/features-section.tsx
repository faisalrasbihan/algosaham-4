import { LineChart, Zap, Shield, Code2, TrendingUp, Users } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      number: "01",
      icon: LineChart,
      title: "Backtesting Lanjutan",
      description: "Uji strategi Anda terhadap data historis dengan presisi dan akurasi tinggi.",
    },
    {
      number: "02",
      icon: Zap,
      title: "Kecepatan Tinggi",
      description: "Dapatkan hasil dalam waktu kurang dari satu detik dengan mesin backtesting yang dioptimalkan.",
    },
    {
      number: "03",
      icon: Shield,
      title: "Manajemen Risiko",
      description: "Metrik risiko bawaan dan penentuan ukuran posisi untuk melindungi modal Anda.",
    },
    {
      number: "04",
      icon: Code2,
      title: "Indikator Kustom",
      description: "Buat dan uji indikator teknis kustom dengan visual builder kami.",
    },
    {
      number: "05",
      icon: TrendingUp,
      title: "Analitik Performa",
      description: "Metrik detail termasuk Sharpe ratio, drawdown, dan win rate.",
    },
    {
      number: "06",
      icon: Users,
      title: "Strategi Komunitas",
      description: "Belajar dari trader terbaik dan bagikan strategi sukses Anda.",
    },
  ];

  return (
    <section className="py-24 px-4 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Semua yang Anda Butuhkan untuk Raih Cuan Maksimal</h2>
          <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto mb-3">
            Bangun strategi trading yang cuan dengan data pasar Indonesia yang real.
          </p>
          <p className="text-base text-muted-foreground font-mono max-w-3xl mx-auto">
            Nikmati fitur dan tools profesional untuk menguji dan mengoptimalkan keputusan trading Anda dengan percaya diri.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative p-6 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/8 to-primary/10 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
            >
              {/* Number */}
              <div className="absolute top-4 right-4">
                <div className="text-4xl font-extrabold text-primary/20 leading-none">{feature.number}</div>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>

              {/* Description */}
              <p className="text-foreground font-mono text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
