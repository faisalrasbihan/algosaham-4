import { Star, Users, Building, TrendingUp, Calendar, BarChart3, MessageCircle, Download, Zap, Brain, Code, Bell, Headphones, Settings, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  const plans = [
    {
      name: "Paket Gratis",
      icon: "🟢",
      price: "Rp0",
      period: "",
      description: "Ideal untuk trader pemula yang ingin belajar dan bereksperimen.",
      subtitle: "Mulai perjalanan Anda dengan fitur dasar namun tetap powerful:",
      features: [
        { text: "5 strategi trading siap digunakan", icon: TrendingUp },
        { text: "1 tahun data historis pasar", icon: Calendar },
        { text: "Indikator dasar untuk analisis sederhana", icon: BarChart3 },
        { text: "Akses komunitas trader", icon: MessageCircle },
        { text: "Ekspor hasil performa", icon: Download },
      ],
      target: "Cocok untuk: Pemula dan pengguna yang baru mengenal trading otomatis.",
      cta: "Mulai Sekarang",
      highlighted: false,
      color: "green",
    },
    {
      name: "Paket Pro",
      icon: "🟠",
      price: "Rp429.000",
      period: "/ Bulan",
      description: "Dirancang untuk trader serius yang ingin hasil maksimal.",
      subtitle: "Nikmati akses penuh ke seluruh fitur premium dan insight yang mendalam:",
      features: [
        { text: "Strategi tanpa batas untuk eksperimen lebih bebas", icon: Zap },
        { text: "10 tahun data historis untuk analisis akurat", icon: Calendar },
        { text: "Semua indikator + kustom sesuai gaya trading", icon: Settings },
        { text: "Dukungan prioritas dari tim ahli", icon: Headphones },
        { text: "Analitik lanjutan berbasis AI", icon: Brain },
        { text: "Akses API dan integrasi data", icon: Code },
        { text: "Notifikasi real-time untuk setiap pergerakan penting", icon: Bell },
      ],
      target: "Rekomendasi kami! Paket Pro memberikan keseimbangan terbaik antara harga dan performa.",
      cta: "Mulai Uji Coba Gratis",
      highlighted: true,
      color: "orange",
    },
    {
      name: "Paket Enterprise",
      icon: "🔵",
      price: "Harga Kustom",
      period: "(Hubungi Kami)",
      description: "Solusi profesional untuk tim dan institusi dengan kebutuhan khusus.",
      subtitle: "Dapatkan fleksibilitas penuh dan dukungan eksklusif:",
      features: [
        { text: "Semua fitur Paket Pro", icon: Star },
        { text: "Dukungan khusus (dedicated support)", icon: Users },
        { text: "Integrasi API kustom dan sistem internal", icon: Code },
        { text: "Kolaborasi multi-user dan manajemen tim", icon: Building },
        { text: "Opsi white-label untuk branding Anda sendiri", icon: Shield },
        { text: "Garansi SLA dan jaminan uptime", icon: Clock },
      ],
      target: "Hubungi tim kami untuk mendapatkan proposal dan demo eksklusif sesuai kebutuhan bisnis Anda.",
      cta: "Hubungi Sales",
      highlighted: false,
      color: "blue",
    },
  ];

  return (
    <section id="harga" className="py-24 px-4 bg-gradient-to-br from-background to-french-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Harga Transparan, Fitur Lengkap, dan Fleksibel</h2>
          <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto leading-relaxed">
            Pilih level sesuai gaya trading kamu. Naik level kapan aja!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl border-2 p-8 flex flex-col transition-all duration-300 hover:shadow-xl ${plan.highlighted ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg scale-105 ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/30"
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Rekomendasi
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{plan.icon}</span>
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{plan.description}</p>
                <p className="text-xs text-muted-foreground/80 font-mono">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground font-mono text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => {
                  const IconComponent = feature.icon;

                  return (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className={`w-5 h-5 flex-shrink-0 mt-0.5 rounded-full flex items-center justify-center ${plan.highlighted ? "bg-primary/10 text-primary" : "bg-cambridge-blue-500/10 text-cambridge-blue-500"}`}>
                        <IconComponent className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{feature.text}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mb-6 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.target}</p>
              </div>

              <Button className={`w-full h-12 text-base font-semibold ${plan.highlighted ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"}`}>
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground font-mono flex items-center justify-center gap-2">
            <span className="text-lg">✨</span>
            Semua paket dapat di-upgrade atau dibatalkan kapan saja tanpa biaya tambahan.
            <br />
            Bangun sistem trading Anda dengan harga yang jelas, fleksibel, dan tanpa risiko.
          </p>
        </div>
      </div>
    </section>
  );
}
