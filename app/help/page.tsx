import type { Metadata } from "next"
import { Mail } from "lucide-react"

import { ContactForm } from "@/components/contact-form"
import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "Contact Us | algosaham.ai",
  description:
    "Hubungi tim algosaham.ai melalui formulir kontak untuk pertanyaan, masukan, dan kebutuhan lainnya.",
}

export default function HelpPage() {
  return (
    <PageChrome>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(72,123,120,0.14),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(208,114,37,0.14),_transparent_30%)]" />
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-sm text-foreground shadow-sm">
              <Mail className="h-4 w-4 text-ochre" />
              Contact Us
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Hubungi Kami
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Silakan isi formulir di bawah ini untuk menghubungi tim
                Algosaham.ai. Pesan yang Anda kirimkan akan kami terima melalui
                email dan kami akan meresponsnya secepat mungkin.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-6 py-12">
          <ContactForm />
        </div>
      </section>
    </PageChrome>
  )
}
