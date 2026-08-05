import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { Footer } from "@/components/footer"
import { PageContainer } from "@/components/page-layout"
import { PageShell } from "@/components/page-shell"

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description:
    "Hubungi tim algosaham.ai melalui WhatsApp atau formulir kontak untuk pertanyaan, masukan, dan kebutuhan lainnya.",
  alternates: {
    canonical: "/help",
  },
}

export default function HelpPage() {
  return (
    <PageShell>
      <main className="min-h-[calc(100svh-3rem)] flex-1">
        <PageContainer className="py-10 sm:py-12 lg:py-12">
          <ContactForm
            intro={
              <header>
                <h1 className="font-heading text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl">
                  Hubungi kami
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  Ada pertanyaan tentang produk, akun, atau paket Algosaham.ai? Hubungi
                  kami melalui WhatsApp atau kirim pesan lewat formulir berikut.
                </p>
              </header>
            }
          />
        </PageContainer>
      </main>
      <Footer />
    </PageShell>
  )
}
