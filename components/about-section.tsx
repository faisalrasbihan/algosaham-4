"use client";

import { Target, Users, Lightbulb, Award, TrendingUp, Globe, Brain, BarChart3, Zap, Shield, ArrowRight, Play, Search, CheckCircle, Star, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AboutSection() {
  const platformFeatures = [
    {
      icon: Brain,
      title: "Strategi Berbasis AI",
      description: "Algoritma cerdas yang menganalisis ribuan data pasar untuk menghasilkan strategi investasi yang optimal dan dipersonalisasi.",
    },
    {
      icon: BarChart3,
      title: "Backtesting Ketat",
      description: "Pengujian strategi yang ketat menggunakan data historis untuk memastikan akurasi dan keandalan sebelum implementasi.",
    },
    {
      icon: Zap,
      title: "Analisis Otomatis",
      description: "Proses analisis saham yang sepenuhnya otomatis, menghemat waktu dan menghilangkan bias emosional dalam investasi.",
    },
    {
      icon: Shield,
      title: "Manajemen Risiko",
      description: "Sistem manajemen risiko yang canggih untuk melindungi portofolio dan memaksimalkan potensi keuntungan.",
    },
  ];

  const keyBenefits = [
    {
      icon: TrendingUp,
      title: "Maksimalkan Keuntungan",
      description: "Dapatkan strategi investasi yang terbukti menghasilkan return optimal berdasarkan analisis data historis dan prediksi AI.",
    },
    {
      icon: Globe,
      title: "Data Pasar Real-time",
      description: "Akses data pasar Indonesia terkini dengan update real-time untuk keputusan investasi yang tepat waktu.",
    },
    {
      icon: Users,
      title: "Komunitas Trader",
      description: "Bergabung dengan ribuan investor yang telah mempercayai AlgoSaham.ai untuk strategi investasi mereka.",
    },
    {
      icon: Award,
      title: "Hasil Terbukti",
      description: "Platform dengan track record 50K+ strategi yang telah diuji dan 10K+ pengguna aktif di Indonesia.",
    },
  ];

  return (
    <section className="relative py-24 px-4 bg-secondary/30 overflow-hidden">
      {/* Background decoration - konsisten dengan hero section */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-ochre/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cambridge-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-ochre/10 text-ochre px-4 py-2 rounded-full text-sm font-mono mb-6">
            <Star className="w-4 h-4" />
            Platform #1 untuk Strategi Saham Berbasis AI di Indonesia
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-snug text-center">
            Temukan strategi investasi <br /> terbaik Anda di{" "}
            <span className="text-ochre font-mono" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
              AlgoSaham.ai
            </span>
            <br />
            <span className="block mt-3 text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-normal">Strategi Investasi Cerdas dengan AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-3xl mx-auto leading-relaxed tracking-wide text-center mb-10">
            Platform berbasis kecerdasan buatan (AI) yang membantu investor merancang, menguji, dan mengoptimalkan strategi saham secara akurat. Melalui analisis data dan backtesting mendalam, AlgoSaham.ai menghadirkan keputusan investasi
            yang lebih cerdas, efisien, dan berbasis data untuk hasil optimal di pasar saham Indonesia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/strategies">
              <Button size="lg" className="bg-ochre hover:bg-ochre/90 text-white text-lg px-8 h-14">
                <Search className="w-5 h-5 mr-2" />
                Jelajahi Strategi Terbaik
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/backtest">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent border-2">
                <Play className="w-5 h-5 mr-2" />
                Simulasi Sekarang
              </Button>
            </Link>
          </div>
        </div>

        {/* Platform Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-mono">
              Mengapa <span className="text-ochre">AlgoSaham.ai</span> Berbeda?
            </h2>
            <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto">
              Platform backtesting saham Indonesia pertama yang menggunakan teknologi AI untuk menganalisis ribuan data pasar dan menghasilkan strategi investasi yang terbukti menguntungkan.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="p-6 rounded-lg border border-border bg-card hover:border-ochre/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-ochre/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-ochre" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h4>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-mono">
              Keuntungan Investasi dengan <span className="text-ochre">AlgoSaham.ai</span>
            </h2>
            <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto">Bergabunglah dengan komunitas investor sukses yang telah merasakan manfaat dari strategi saham berbasis AI dan backtesting otomatis.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="p-6 rounded-lg border border-border bg-card hover:border-ochre/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-ochre/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-ochre" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-3">{benefit.title}</h4>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-mono">
              Pencapaian <span className="text-ochre">AlgoSaham.ai</span> di Indonesia
            </h2>
            <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto">
              Platform backtesting saham terpercaya yang telah membantu ribuan investor Indonesia mencapai kesuksesan finansial melalui strategi investasi berbasis AI.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-ochre/10 to-primary/10 rounded-2xl blur-3xl" />
            <div className="relative p-8 rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-ochre" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">2024</div>
                  <div className="text-sm text-muted-foreground font-mono">Tahun Didirikan</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-ochre" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">10K+</div>
                  <div className="text-sm text-muted-foreground font-mono">Investor Aktif</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-ochre" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground font-mono">Strategi Diuji</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-ochre" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground font-mono">Uptime Platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-mono">
              Teknologi <span className="text-ochre">AI Terdepan</span> untuk Investasi
            </h2>
            <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto">
              Platform backtesting saham Indonesia yang didukung oleh teknologi kecerdasan buatan dan machine learning terdepan untuk analisis pasar yang akurat dan prediksi yang tepat.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-ochre" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">AI/ML</div>
                <div className="text-sm text-muted-foreground font-mono">Pembelajaran Mesin</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-ochre" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">Big Data</div>
                <div className="text-sm text-muted-foreground font-mono">Analisis Data Besar</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-ochre" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">Cloud</div>
                <div className="text-sm text-muted-foreground font-mono">Komputasi Awan</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-ochre" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">Real-time</div>
                <div className="text-sm text-muted-foreground font-mono">Data Pasar Langsung</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="p-12 rounded-2xl border border-border bg-gradient-to-br from-ochre/5 via-primary/5 to-ochre/5">
            <div className="inline-flex items-center gap-2 bg-ochre/10 text-ochre px-4 py-2 rounded-full text-sm font-mono mb-6">
              <DollarSign className="w-4 h-4" />
              Mulai Investasi Cerdas Hari Ini
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-mono">
              Siap Meningkatkan <span className="text-ochre">Keuntungan Investasi</span> Anda?
            </h2>
            <p className="text-lg text-muted-foreground font-mono mb-8 max-w-3xl mx-auto leading-relaxed">
              Bergabunglah dengan <strong className="text-foreground">10,000+ investor sukses</strong> yang telah mempercayai AlgoSaham.ai untuk strategi investasi mereka. Temukan strategi saham terbaik dengan teknologi AI dan rasakan
              perbedaan investasi berbasis data yang akurat.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/strategies">
                <Button size="lg" className="bg-ochre hover:bg-ochre/90 text-white text-lg px-10 h-14">
                  <Search className="w-5 h-5 mr-2" />
                  Jelajahi Strategi Terbaik
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/backtest">
                <Button size="lg" variant="outline" className="text-lg px-10 h-14 bg-transparent border-2 hover:bg-ochre/5">
                  <Play className="w-5 h-5 mr-2" />
                  Simulasi Sekarang
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Gratis untuk Daftar
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Tanpa Biaya Tersembunyi
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Data Real-time
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
