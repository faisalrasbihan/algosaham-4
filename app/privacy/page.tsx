import type { Metadata } from "next"
import Link from "next/link"
import { Database, Eye, LockKeyhole, Orbit, UserRoundCheck } from "lucide-react"

import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "Privacy Policy | algosaham.ai",
  description:
    "Ringkasan kebijakan privasi dan prinsip pengelolaan data pengguna di algosaham.ai.",
}

const principles = [
  {
    title: "Data seperlunya",
    body: "Kami hanya perlu data yang relevan untuk autentikasi, pengelolaan akses, dan operasional layanan.",
    icon: Database,
  },
  {
    title: "Visibilitas yang jelas",
    body: "Pengguna berhak memahami mengapa data dipakai dan bagaimana kaitannya dengan fungsi produk.",
    icon: Eye,
  },
  {
    title: "Keamanan operasional",
    body: "Pengelolaan data harus mendukung keamanan akun, investigasi error, dan pencegahan penyalahgunaan.",
    icon: LockKeyhole,
  },
  {
    title: "Hak untuk bertanya",
    body: "Jika ada area yang belum jelas, jalur kontak harus tersedia dan tidak disembunyikan di balik copy legal yang kabur.",
    icon: UserRoundCheck,
  },
]

export default function PrivacyPage() {
  return (
    <PageChrome>
      <section className="border-b border-border bg-gradient-to-br from-background via-cambridge-blue/5 to-background">
        <div className="container mx-auto grid gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.22em] text-cambridge-blue">
              Privacy
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Privasi perlu dijelaskan dengan bahasa yang bisa dipahami manusia.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Halaman ini adalah ringkasan prinsip, bukan dokumen legal yang
              sengaja dibuat sulit dibaca. Tujuannya memberi kejelasan lebih dulu.
            </p>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6">
            <Orbit className="mb-4 h-7 w-7 text-cambridge-blue" />
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Prinsip dasarnya sederhana.
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Data dipakai untuk menjalankan produk, menjaga akses, dan memahami
              area yang perlu diperbaiki. Jika melampaui itu, harus ada alasan yang jelas.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-6 md:grid-cols-2">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="rounded-[2rem] border border-border bg-card p-6"
              >
                <principle.icon className="mb-4 h-6 w-6 text-cambridge-blue" />
                <h2 className="mb-3 text-2xl font-semibold text-foreground">
                  {principle.title}
                </h2>
                <p className="text-base leading-7 text-muted-foreground">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-border bg-secondary/30 p-6">
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Butuh konteks legal yang lebih lengkap?
            </h2>
            <p className="mb-5 max-w-2xl text-sm leading-7 text-muted-foreground">
              Halaman syarat dan ketentuan tetap menjadi referensi formal yang
              paling dekat saat ini. Jika ada pertanyaan spesifik tentang data,
              hubungi tim agar penjelasannya tidak berhenti di asumsi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/syarat-ketentuan"
                className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Lihat syarat
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-cambridge-blue/30 hover:text-cambridge-blue"
              >
                Tanyakan ke tim
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
