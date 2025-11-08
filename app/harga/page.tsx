import { Navbar } from "@/components/navbar"
import { PricingSection } from "@/components/pricing-section"

export default function HargaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PricingSection />
      </main>
    </div>
  )
}

