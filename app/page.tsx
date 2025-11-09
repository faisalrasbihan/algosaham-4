import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { HeroSection } from "@/components/hero-section"
import { PopularStrategiesShowcase } from "@/components/popular-strategies-showcase"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TickerTape />
      <div className="flex-1">
        <HeroSection />
        <PopularStrategiesShowcase />
        <FeaturesSection />
        {/* <StatsSection /> */}
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </div>
    </div>
  )
}
