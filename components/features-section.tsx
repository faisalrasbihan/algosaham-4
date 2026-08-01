import { LineChart, Zap, Shield, Code2, TrendingUp, Users } from "lucide-react";
import { SectionHeader } from "@/components/page-layout";

export function FeaturesSection() {
  const features = [
    {
      icon: LineChart,
      title: "Backtesting Lanjutan",
      description: "Uji strategi Anda terhadap data historis dengan presisi dan akurasi tinggi.",
    },
    {
      icon: Zap,
      title: "Kecepatan Tinggi",
      description: "Dapatkan hasil dalam waktu kurang dari satu detik dengan mesin backtesting yang dioptimalkan.",
    },
    {
      icon: Shield,
      title: "Manajemen Risiko",
      description: "Metrik risiko bawaan dan penentuan ukuran posisi untuk melindungi modal Anda.",
    },
    {
      icon: Code2,
      title: "Indikator Kustom",
      description: "Buat dan uji indikator teknis kustom dengan visual builder kami.",
    },
    {
      icon: TrendingUp,
      title: "Analitik Performa",
      description: "Metrik detail termasuk Sharpe ratio, drawdown, dan win rate.",
    },
    {
      icon: Users,
      title: "Strategi Komunitas",
      description: "Belajar dari trader terbaik dan bagikan strategi sukses Anda.",
    },
  ];

  return (
    <section className="py-24 px-4 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Platform"
          title="Semua yang Anda butuhkan untuk bekerja lebih sistematis"
          description="Tools profesional untuk riset, simulasi, evaluasi risiko, dan monitoring strategi."
          className="mb-10"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
