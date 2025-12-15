import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Siap untuk backtest strategi Anda?</h2>
        <p className="text-lg text-muted-foreground font-mono mb-8 max-w-2xl mx-auto">
          Bergabunglah dengan ribuan trader yang mempercayai algosaham.ai untuk memvalidasi strategi trading mereka sebelum mempertaruhkan modal sesungguhnya.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Start Free Trial
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-border hover:bg-[#487b78] hover:text-white bg-transparent">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
