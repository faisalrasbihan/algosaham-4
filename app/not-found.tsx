import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { PageHeader, PageSection, SectionHeader, Surface } from "@/components/page-layout"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <PageHeader
          eyebrow="Error 404"
          title="Halaman yang kamu cari tidak ada."
          description="Link mungkin sudah berubah, salah ketik, atau halamannya belum tersedia. Coba kembali ke beranda atau lanjut ke halaman utama produk."
          actions={
            <>
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
            </>
          }
        />

        <PageSection className="pt-0">
          <div className="max-w-2xl">
            <SectionHeader title="coba halaman ini" description="Beberapa pintu masuk utama di algosaham.ai." />
            <Surface className="p-3">
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
                      href="/features"
                      className="group flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3 text-sm hover:border-border hover:bg-muted/40 transition-colors"
                    >
                      <span className="font-medium text-foreground">Pelajari Platform</span>
                      <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                  </div>
            </Surface>
          </div>
        </PageSection>
      </main>

      <Footer />
    </div>
  )
}
