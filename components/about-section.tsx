"use client";

import {
  Target,
  Users,
  Lightbulb,
  Award,
  TrendingUp,
  Globe,
  Brain,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  Play,
  Search,
  CheckCircle,
  Star,
  Clock,
  DollarSign,
  Compass,
  Settings,
  Eye,
  Rocket,
  Wrench,
  TestTube,
  FolderOpen,
  TrendingUp as TrendingUpIcon,
  Monitor,
} from "lucide-react";
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

        {/* Video Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-mono">
              Bagaimana Cara <span className="text-ochre">AlgoSaham.ai</span> Bekerja?
            </h2>
            <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto">Lihat bagaimana platform kami membantu Anda menemukan, mengelola, dan memantau strategi trading terbaik.</p>
          </div>
          <div className="grid lg:grid-cols-4 gap-8 items-stretch">
            {/* Video - 3/4 width */}
            <div className="lg:col-span-3">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-2xl"
                  src="https://www.youtube.com/embed/F0Q0RFDiecU"
                  title="AlgoSaham.ai Platform Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Explanation - 1/4 width */}
            <div className="lg:col-span-1 flex flex-col h-full">
              {/* Feature 1 */}
              <div className="p-4 rounded-lg border border-border bg-card hover:border-ochre/50 transition-all duration-300 flex-grow">
                <div className="flex items-start gap-3 h-full">
                  <div className="w-10 h-10 rounded-lg bg-ochre/10 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-5 h-5 text-ochre" />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="text-base font-semibold text-foreground mb-2">Temukan Strategi Anda</h4>
                    <p className="text-muted-foreground font-mono text-xs leading-relaxed">Lihat semua strategi trading yang telah Anda buat dan optimalkan hasilnya.</p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-lg border border-border bg-card hover:border-ochre/50 transition-all duration-300 flex-grow">
                <div className="flex items-start gap-3 h-full">
                  <div className="w-10 h-10 rounded-lg bg-ochre/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUpIcon className="w-5 h-5 text-ochre" />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="text-base font-semibold text-foreground mb-2">Eksplor Strategi Populer</h4>
                    <p className="text-muted-foreground font-mono text-xs leading-relaxed">Jelajahi strategi trading populer yang telah teruji dan berlangganan untuk mengikutinya.</p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-lg border border-border bg-card hover:border-ochre/50 transition-all duration-300 flex-grow">
                <div className="flex items-start gap-3 h-full">
                  <div className="w-10 h-10 rounded-lg bg-ochre/10 flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-5 h-5 text-ochre" />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="text-base font-semibold text-foreground mb-2">Cek Strategi yang Diikuti</h4>
                    <p className="text-muted-foreground font-mono text-xs leading-relaxed">Pantau performa strategi yang Anda subscribe dan lihat hasil terbarunya.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Platform */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-mono">Pilih Cara yang Paling Cocok untuk Kamu</h2>
            <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto">Mulai dari strategi siap pakai hingga membuat strategi sendiri — semuanya bisa kamu lakukan dengan mudah.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:items-stretch">
            {/* Metode 1: Eksplor Strategi yang Telah Diuji */}
            <div className="p-8 rounded-2xl border border-border bg-card hover:border-ochre/50 transition-all duration-300 flex flex-col">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-ochre" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 font-mono">Metode 1: Eksplor Strategi yang Telah Diuji</h3>
                <p className="text-muted-foreground font-mono">Langsung gunakan strategi yang sudah melewati proses simulasi dan pengujian data historis.</p>
              </div>

              <div className="space-y-6 flex-grow">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-ochre/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-ochre">01</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Eksplor Strategi Siap Pakai</h4>
                    <p className="text-muted-foreground font-mono text-sm">Temukan berbagai strategi yang telah diuji dan dikembangkan menggunakan data historis.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-ochre/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-ochre">02</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Lihat & Pelajari Hasilnya</h4>
                    <p className="text-muted-foreground font-mono text-sm">Analisis grafik performa, tingkat keberhasilan, dan riwayat transaksi dari setiap strategi yang tersedia.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-ochre/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-ochre">03</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Jalankan dengan Keyakinan</h4>
                    <p className="text-muted-foreground font-mono text-sm">Gunakan strategi yang paling sesuai dengan tujuanmu dan nikmati hasil yang sudah terbukti efektif.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/strategies">
                  <Button size="lg" className="bg-ochre hover:bg-ochre/90 text-white text-lg px-8 h-12 w-full font-mono">
                    <Search className="w-5 h-5 mr-2" />
                    Jelajahi Strategi Terbaik
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Metode 2: Simulasikan Strategimu Sendiri */}
            <div className="p-8 rounded-2xl border border-border bg-card hover:border-ochre/50 transition-all duration-300 flex flex-col">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-ochre/10 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-ochre" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 font-mono">Metode 2: Simulasikan Strategimu Sendiri</h3>
                <p className="text-muted-foreground font-mono">Ingin hasil yang lebih personal? Buat dan uji strategimu sesuai gaya trading dan target pribadimu.</p>
              </div>

              <div className="space-y-6 flex-grow">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-ochre/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-ochre">01</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Buat Strategimu Sendiri</h4>
                    <p className="text-muted-foreground font-mono text-sm">Rancang aturan tradingmu dengan mudah melalui visual strategy builder yang interaktif.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-ochre/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-ochre">02</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Uji dengan Data Nyata</h4>
                    <p className="text-muted-foreground font-mono text-sm">Cek performa strategimu menggunakan data historis untuk memastikan efektivitasnya.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-ochre/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-ochre">03</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Lihat & Pelajari Hasilnya</h4>
                    <p className="text-muted-foreground font-mono text-sm">Analisis hasil uji melalui grafik, metrik performa, dan riwayat transaksi untuk menyempurnakan strategimu.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-ochre/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-ochre">04</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Jalankan dengan Keyakinan</h4>
                    <p className="text-muted-foreground font-mono text-sm">Gunakan strategi yang sudah teruji dan siap membawa hasil nyata di pasar sesungguhnya.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/backtest">
                  <Button size="lg" className="bg-ochre hover:bg-ochre/90 text-white text-lg px-8 h-12 w-full font-mono">
                    <Play className="w-5 h-5 mr-2" />
                    Simulasi Sekarang
                  </Button>
                </Link>
              </div>
            </div>
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
