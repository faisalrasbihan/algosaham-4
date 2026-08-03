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
        <div className="analyze-landing-stage">
          <PageHeader
            compact
            className="border-b-0 bg-transparent pt-6 sm:pt-10"
            title="Harga transparan, fitur lengkap, dan fleksibel"
            description="Pilih level sesuai gaya trading kamu. Mulai gratis dan naik level kapan saja."
          />
          <PricingMatrix showHeader={false} />
        </div>
        <FAQSection />
      </div>
      <Footer />
    </div>
  )
}
