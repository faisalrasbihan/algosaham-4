import { Footer } from "@/components/footer"
import { PageShell } from "@/components/page-shell"
import { PricingMatrix } from "@/components/pricing-matrix"
import { FAQSection } from "@/components/faq-section"
import { PageHeader } from "@/components/page-layout"

export default function HargaPage() {
  return (
    <PageShell>
      <div className="flex-1">
        <PageHeader
          compact
          className="border-b-0 bg-transparent"
          title="Harga transparan, fitur lengkap, dan fleksibel"
          description="Pilih level sesuai gaya trading kamu. Mulai gratis dan naik level kapan saja."
        />
        <PricingMatrix showHeader={false} />
        <FAQSection />
      </div>
      <Footer />
    </PageShell>
  )
}
