import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PricingMatrix } from "@/components/pricing-matrix"
import { FAQSection } from "@/components/faq-section"

export default function HargaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PricingMatrix />
        <FAQSection />
      </div>
      <Footer />
    </div>
  )
}
