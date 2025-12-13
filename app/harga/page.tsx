import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { PricingMatrix } from "@/components/pricing-matrix"
import { FAQSection } from "@/components/faq-section"

export default function HargaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TickerTape />
      <div className="flex-1">
        <PricingMatrix />
        <FAQSection />
      </div>
    </div>
  )
}

