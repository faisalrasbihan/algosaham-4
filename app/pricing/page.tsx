import { Navbar } from "@/components/navbar";
import { PricingSection } from "@/components/pricing-section";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <PricingSection />
      </main>
    </div>
  );
}
