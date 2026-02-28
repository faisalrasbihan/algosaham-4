"use client"

import { FormEvent, type ReactNode, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormState = {
  name: string
  email: string
  subject: string
  message: string
  consent: boolean
  marketingOptIn: boolean
  website: string
}

const initialState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  consent: false,
  marketingOptIn: false,
  website: "",
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.consent) {
      toast.error("Persetujuan wajib dicentang sebelum mengirim formulir.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || "Pesan gagal dikirim.")
      }

      setForm(initialState)
      setIsSubmitted(true)
      toast.success("Pesan Anda berhasil dikirim.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim pesan."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-border bg-card p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] md:p-8"
      >
        <div className="mb-8 grid gap-6 rounded-[1.5rem] border border-cambridge-blue/20 bg-[linear-gradient(135deg,rgba(72,123,120,0.08),rgba(208,114,37,0.04))] p-6">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.22em] text-cambridge-blue">
              Form kontak
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Ceritakan kebutuhan Anda dengan jelas.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Tim kami menerima pesan ini melalui email internal, sehingga Anda
            tidak perlu keluar dari situs untuk menghubungi Algosaham.ai.
          </p>
        </div>

        <div className="space-y-8">
          <section className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Informasi Pengirim
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                id="name"
                label="Nama Lengkap"
                description="Masukkan nama lengkap Anda agar kami dapat menghubungi Anda dengan lebih personal."
              >
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Nama lengkap Anda"
                  className="h-12 rounded-xl border-border/80 bg-background"
                  required
                />
              </Field>

              <Field
                id="email"
                label="Alamat Email"
                description="Masukkan alamat email aktif yang dapat kami hubungi untuk menindaklanjuti pesan Anda."
              >
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="nama@email.com"
                  className="h-12 rounded-xl border-border/80 bg-background"
                  required
                />
              </Field>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Detail Pesan
              </p>
            </div>

            <div className="grid gap-5">
              <Field
                id="subject"
                label="Subjek Pesan"
                description="Tuliskan ringkasan singkat mengenai topik atau keperluan Anda."
              >
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, subject: event.target.value }))
                  }
                  placeholder="Contoh: Pertanyaan tentang langganan"
                  className="h-12 rounded-xl border-border/80 bg-background"
                  required
                />
              </Field>

              <Field
                id="message"
                label="Pesan"
                description="Tuliskan pertanyaan, masukan, atau kebutuhan Anda secara jelas dan detail agar kami dapat memberikan respons yang tepat."
              >
                <textarea
                  id="message"
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="Tulis pesan Anda di sini..."
                  className={cn(
                    "min-h-40 w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-cambridge-blue/50 focus:ring-2 focus:ring-cambridge-blue/15",
                    "placeholder:text-muted-foreground"
                  )}
                  required
                />
              </Field>
            </div>
          </section>

          <section className="space-y-5 rounded-[1.5rem] border border-border/80 bg-background/70 p-5">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Pernyataan Persetujuan
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                Dengan mengirimkan formulir ini, Anda menyatakan telah membaca
                dan menyetujui{" "}
                <Link href="/privacy" className="font-medium text-cambridge-blue hover:underline">
                  Kebijakan Privasi
                </Link>{" "}
                yang berlaku di situs web kami.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) =>
                  setForm((current) => ({ ...current, consent: event.target.checked }))
                }
                className="mt-1 h-4 w-4 rounded border-border text-cambridge-blue focus:ring-cambridge-blue"
                required
              />
              <span className="text-sm leading-7 text-foreground">
                Saya menyetujui pemrosesan data saya sesuai Kebijakan Privasi yang berlaku.
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
              <input
                type="checkbox"
                checked={form.marketingOptIn}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    marketingOptIn: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-border text-cambridge-blue focus:ring-cambridge-blue"
              />
              <span className="text-sm leading-7 text-foreground">
                Saya setuju untuk menerima informasi, pembaruan, dan komunikasi lainnya dari Algosaham.ai.*
              </span>
            </label>
          </section>

          <div className="hidden">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(event) =>
                setForm((current) => ({ ...current, website: event.target.value }))
              }
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-7 text-muted-foreground">
              Kami akan mengirim pesan ini ke <span className="font-medium text-foreground">algosaham.ai@gmail.com</span>.
            </p>
            <Button
              type="submit"
              size="lg"
              className="h-12 rounded-full px-7"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  Kirim
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      <aside className="space-y-5">
        <div className="rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <Mail className="mb-4 h-6 w-6 text-ochre-700" />
          <h2 className="mb-3 text-2xl font-semibold">Pesan Anda akan masuk ke tim kami.</h2>
          <p className="text-sm leading-7 text-background/75">
            Formulir ini dirancang agar pengguna bisa menghubungi kami langsung dari
            website, tanpa berpindah ke aplikasi email eksternal.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-secondary/30 p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Yang membantu kami merespons lebih cepat</h3>
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cambridge-blue" />
              Jelaskan fitur, halaman, atau konteks yang sedang Anda gunakan.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cambridge-blue" />
              Sertakan kronologi singkat jika masalah terjadi pada waktu tertentu.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cambridge-blue" />
              Tuliskan hasil yang Anda harapkan agar solusi kami lebih tepat sasaran.
            </li>
          </ul>
        </div>

        {isSubmitted ? (
          <div className="rounded-[2rem] border border-cambridge-blue/30 bg-cambridge-blue/10 p-6">
            <h3 className="mb-2 text-lg font-semibold text-foreground">Pesan terkirim</h3>
            <p className="text-sm leading-7 text-muted-foreground">
              Terima kasih. Tim Algosaham.ai sudah menerima pesan Anda dan akan menindaklanjutinya secepat mungkin.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

function Field({
  id,
  label,
  description,
  children,
}: {
  id: string
  label: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={id} className="text-base font-semibold text-foreground">
          {label}
        </Label>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}
