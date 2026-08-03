import { Button } from "@/components/ui/button"
import { PageSection } from "@/components/page-layout"
import { ArrowRight } from "lucide-react"
import { SignInButton } from "@clerk/nextjs"
import Link from "next/link"

export function CTASection() {
  return (
    <PageSection className="border-t border-border/60 bg-muted/20 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Siap menguji strategi Anda?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground">
          Gunakan data historis untuk memahami performa dan risiko strategi sebelum mengambil keputusan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignInButton mode="modal">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Daftar Sekarang
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </SignInButton>
          <Button size="lg" variant="outline" asChild>
            <Link href="/backtest">
              Lihat demo
            </Link>
          </Button>
        </div>
      </div>
    </PageSection>
  )
}
