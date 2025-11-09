import { Navbar } from "@/components/navbar"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"

export default function HargaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PricingSection />
        <FAQSection />
      </main>
    </div>
  )
}

