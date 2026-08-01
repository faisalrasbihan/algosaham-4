import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PricingMatrix } from "@/components/pricing-matrix"
import { FAQSection } from "@/components/faq-section"
import { PageHeader } from "@/components/page-layout"

export default function HargaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHeader
          compact
          eyebrow="Harga"
          title="Pilih paket yang sesuai dengan workflow trading kamu"
          description="Mulai gratis, lalu tingkatkan akses ketika kamu membutuhkan lebih banyak backtest, strategi, dan fitur monitoring."
        />
        <PricingMatrix />
        <FAQSection />
      </div>
      <Footer />
    </div>
  )
}
