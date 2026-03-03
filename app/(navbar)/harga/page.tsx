import { Footer } from "@/components/footer"
import { PricingMatrix } from "@/components/pricing-matrix"
import { FAQSection } from "@/components/faq-section"

export default function HargaPage() {
  return (
    <>
      <div className="flex-1">
        <PricingMatrix />
        <FAQSection />
      </div>
      <Footer />
    </>
  )
}
