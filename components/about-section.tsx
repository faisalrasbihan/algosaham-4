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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutSection() {
  const steps = [
    {
      title: "Tentukan saham yang ingin dianalisis",
      description: "Mulai dengan memilih saham berdasarkan kriteria yang kamu mau.",
      detail: "Kamu bisa menyaring saham berdasarkan ukuran perusahaan, jenis saham, dan sektor agar hasilnya lebih relevan dengan gaya investasimu.",
      icon: Search,
    },
    {
      title: "Tambahkan indikator fundamental",
      description: "Selanjutnya, tambahkan indikator fundamental seperti PE Ratio, PBV, atau ROE.",
      detail: "Bagian ini membantu kamu menilai kondisi keuangan perusahaan dan menyaring saham yang secara fundamental masih menarik.",
      icon: TrendingUp,
    },
    {
      title: "Atur indikator teknikal",
      description: "Tambahkan indikator teknikal seperti RSI, SMA, atau MACD untuk membaca pergerakan harga dan tren market.",
      detail: "Indikator ini membantu kamu menentukan timing masuk dan keluar yang lebih tepat.",
      icon: Settings,
    },
    {
      title: "Atur manajemen risiko (opsional)",
      description: "Kamu bisa mengatur batas risiko dengan menentukan stop loss, take profit, dan lama posisi ditahan.",
      detail: "Kalau mau cepat, kamu juga bisa langsung pakai setelan default yang sudah disediakan.",
      icon: Shield,
    },
    {
      title: "Tentukan periode pengujian (opsional)",
      description: "Atur modal awal dan periode waktu untuk menguji strategi kamu.",
      detail: "Pengaturan default sudah tersedia, tapi bisa kamu sesuaikan kalau ingin hasil yang lebih spesifik.",
      icon: Clock,
    },
    {
      title: "Jalankan strategi dan lihat hasilnya",
      description: "Klik tombol Run untuk menjalankan strategi kamu.",
      detail: "Hasil analisis akan langsung muncul, mulai dari performa strategi, riwayat transaksi, sampai grafik yang mudah dipahami.",
      icon: Play,
    },
  ];

  const existingStrategies = [
    {
      title: "Strategi Berbasis AI",
      description: "Strategi yang dibangun dari analisis data historis pasar Indonesia menggunakan machine learning untuk mencari pola dan peluang terbaik.",
      icon: Brain,
    },
    {
      title: "Strategi dari Trader Lain",
      description: "Kumpulan strategi yang dikembangkan dan diuji oleh komunitas trader. Kamu bisa melihat performanya, mempelajari logikanya, lalu subscribe atau modifikasi sesuai kebutuhanmu.",
      icon: Users,
    },
  ];

  const tips = [
    "Mulai dari strategi sederhana dulu",
    "Uji beberapa variasi strategi untuk dibandingkan",
    "Fokus ke konsistensi, bukan hasil instan",
    "Gunakan hasil pengujian sebagai bahan evaluasi, bukan jaminan cuan",
  ];
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
      description: "Bergabung dengan ribuan investor yang telah mempercayai algosaham.ai untuk strategi investasi mereka.",
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
              algosaham.ai
            </span>
            <br />
            <span className="block mt-3 text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-normal">Strategi Investasi Cerdas dengan AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-3xl mx-auto leading-relaxed tracking-wide text-center mb-10">
            Platform berbasis kecerdasan buatan (AI) yang membantu investor merancang, menguji, dan mengoptimalkan strategi saham secara akurat. Melalui analisis data dan backtesting mendalam, algosaham.ai menghadirkan keputusan investasi
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
              Mengapa <span className="text-ochre">algosaham.ai</span> Berbeda?
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
              Bagaimana Cara <span className="text-ochre">algosaham.ai</span> Bekerja?
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
                  title="algosaham.ai Platform Demo"
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

        {/* Cara Menggunakan algosaham.ai - Enhanced Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-mono">
              Cara Menggunakan <span className="text-ochre">algosaham.ai</span>
            </h2>
            <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto">
              Bikin strategi trading jadi lebih rapi dan terukur. Ikuti langkah-langkah berikut untuk mulai menggunakan platform ini.
            </p>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 font-mono text-center">
              Bikin dan Uji Strategi Sendiri
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <Card key={index} className="border-border bg-card hover:border-ochre/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden group h-full">
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-ochre group-hover:opacity-20 transition-opacity">
                    {index + 1}
                  </div>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-ochre/10 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6 text-ochre" />
                    </div>
                    <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground font-medium mb-2">{step.description}</p>
                    <p className="text-muted-foreground text-sm font-mono leading-relaxed">{step.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/backtest">
                <Button size="lg" className="bg-ochre hover:bg-ochre/90 text-white text-lg px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  Mulai Bikin Strategi
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-6 font-mono text-center">
              Langsung Pakai Strategi yang Sudah Ada
            </h3>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-10 font-mono">
              Kalau kamu belum mau bikin strategi sendiri, kamu tetap bisa mulai dengan strategi yang sudah tersedia di algosaham.ai.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {existingStrategies.map((item, index) => (
                <div key={index} className="p-8 rounded-2xl border border-border bg-card hover:border-ochre/50 transition-all duration-300 flex flex-col items-start">
                  <div className="w-14 h-14 rounded-full bg-ochre/10 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-ochre" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground font-mono leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/strategies">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-2">
                  <Search className="w-5 h-5 mr-2" />
                  Cari Strategi
                </Button>
              </Link>
            </div>
          </div>

          {/* Tips Section */}
          <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-3xl border border-border bg-gradient-to-br from-ochre/5 via-primary/5 to-ochre/5">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center font-mono">
              Tips Biar Makin Maksimal
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 bg-card/50 p-4 rounded-xl border border-border/50">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium font-mono">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-mono">
              Keuntungan Investasi dengan <span className="text-ochre">algosaham.ai</span>
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
              Bergabunglah dengan <strong className="text-foreground">10,000+ investor sukses</strong> yang telah mempercayai algosaham.ai untuk strategi investasi mereka. Temukan strategi saham terbaik dengan teknologi AI dan rasakan
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
