import type { Metadata } from "next"
import { Mail } from "lucide-react"

import { ContactForm } from "@/components/contact-form"
import { PageChrome } from "@/components/page-chrome"
import { PageHeader, PageSection } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "Contact Us | algosaham.ai",
  description:
    "Hubungi tim algosaham.ai melalui formulir kontak untuk pertanyaan, masukan, dan kebutuhan lainnya.",
  alternates: {
    canonical: "/help",
  },
}

export default function HelpPage() {
  return (
    <PageChrome>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Contact us</span>}
        title="Hubungi kami"
        description="Silakan isi formulir di bawah ini untuk menghubungi tim Algosaham.ai. Pesan yang Anda kirimkan akan kami terima melalui email dan kami akan meresponsnya secepat mungkin."
      />

      <PageSection className="pt-4">
        <ContactForm />
      </PageSection>
    </PageChrome>
  )
}
