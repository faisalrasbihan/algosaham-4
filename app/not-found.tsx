import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="relative flex-1 overflow-hidden dotted-background">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-16 left-8 h-64 w-64 rounded-full bg-ochre/8 blur-3xl" />
          <div className="absolute right-10 top-24 h-72 w-72 rounded-full bg-cambridge-blue/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-pomp-and-power/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="border-b border-border/70 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <span
                  className="inline-flex items-center rounded-md border border-[#d07225]/30 bg-[#d07225]/10 px-2.5 py-1 text-xs font-semibold tracking-[0.16em] text-[#d07225]"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                >
                  ERROR 404
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  halaman tidak ditemukan
                </span>
              </div>

              <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-12">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-mono text-muted-foreground mb-3">
                      /route-missing
                    </p>
                    <h1 className="text-3xl font-bold leading-tight text-foreground md:text-5xl text-balance">
                      Halaman yang kamu cari tidak ada.
                    </h1>
                  </div>

                  <p className="text-base leading-relaxed text-muted-foreground font-mono max-w-xl">
                    Link mungkin sudah berubah, salah ketik, atau halamannya belum tersedia.
                    Coba kembali ke beranda atau lanjut ke halaman utama produk.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button asChild size="lg" className="grainy-gradient-button text-white border-0">
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        Kembali ke Home
                      </Link>
                    </Button>

                    <Button asChild size="lg" variant="outline" className="bg-background/70">
                      <Link href="/strategies">
                        <Search className="h-4 w-4" />
                        Lihat Strategi
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/70 p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-wide text-foreground">
                      Coba halaman ini
                    </h2>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      quick links
                    </span>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href="/backtest"
                      className="group flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3 text-sm hover:border-[#487b78]/40 hover:bg-[#487b78]/5 transition-colors"
                    >
                      <span className="font-medium text-foreground">Simulasi / Backtest</span>
                      <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground group-hover:text-[#487b78]" />
                    </Link>

                    <Link
                      href="/analyze-v2"
                      className="group flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3 text-sm hover:border-[#d07225]/40 hover:bg-[#d07225]/5 transition-colors"
                    >
                      <span className="font-medium text-foreground">Analisis Saham</span>
                      <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground group-hover:text-[#d07225]" />
                    </Link>

                    <Link
                      href="/harga"
                      className="group flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3 text-sm hover:border-[#8d6a9f]/40 hover:bg-[#8d6a9f]/5 transition-colors"
                    >
                      <span className="font-medium text-foreground">Harga & Paket</span>
                      <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground group-hover:text-[#8d6a9f]" />
                    </Link>

                    <Link
                      href="/about"
                      className="group flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3 text-sm hover:border-border hover:bg-muted/40 transition-colors"
                    >
                      <span className="font-medium text-foreground">Pelajari Platform</span>
                      <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
