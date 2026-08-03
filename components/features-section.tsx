import { LineChart, Zap, Shield, Code2, TrendingUp, Users } from "lucide-react";
import { PageSection, SectionHeader } from "@/components/page-layout";

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
    <PageSection className="border-t border-border/60 py-12 sm:py-16">
      <SectionHeader
        title="Semua yang Anda butuhkan untuk bekerja lebih sistematis"
        description="Tools profesional untuk riset, simulasi, evaluasi risiko, dan monitoring strategi."
        className="mb-8"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3f3f3]">
              <feature.icon className="h-5 w-5 text-foreground" strokeWidth={1.8} />
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
