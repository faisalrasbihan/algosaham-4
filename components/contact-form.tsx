"use client"

import { FormEvent, type ReactNode, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Send,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormState = {
  name: string
  email: string
  message: string
  consent: boolean
  marketingOptIn: boolean
  website: string
}

const initialState: FormState = {
  name: "",
  email: "",
  message: "",
  consent: false,
  marketingOptIn: false,
  website: "",
}

const whatsappHref =
  "https://wa.me/6285157171473?text=Halo%20tim%20Algosaham.ai%2C%20saya%20ingin%20bertanya."

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M20.1 11.85a8.1 8.1 0 0 1-11.98 7.12L4 20l1.08-3.98a8.1 8.1 0 1 1 15.02-4.17Z"
        fill="currentColor"
      />
      <path
        d="M8.18 7.55c.2-.45.42-.46.65-.47h.55c.17 0 .4.06.5.36l.7 1.7c.08.22.04.4-.07.57l-.45.57c-.14.16-.28.31-.11.59.18.28.78 1.25 1.75 2.03 1.2.96 2.15 1.27 2.5 1.42.27.12.47.1.65-.1l.88-1.04c.2-.24.43-.18.68-.09l1.64.78c.28.13.47.2.53.31.07.11.07.63-.15 1.23-.22.6-1.28 1.12-1.77 1.17-.46.05-1.05.07-1.7-.14-.4-.13-.93-.3-1.6-.59-.28-.12-2.45-.9-4.24-2.5-1.5-1.34-2.52-3-2.81-3.56-.3-.56-.03-1.7.19-2.12l.18-.32Z"
        fill="white"
      />
    </svg>
  )
}

export function ContactForm({ intro }: { intro?: ReactNode }) {
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
    <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-14">
      <aside>
        {intro}

        <h2 className="mt-10 font-heading text-2xl font-semibold tracking-[-0.025em] text-foreground sm:mt-12">
          Pilih cara yang paling nyaman
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          WhatsApp cocok untuk pertanyaan singkat. Untuk konteks yang lebih lengkap,
          kirimkan detailnya melalui formulir.
        </p>

        <div className="mt-7 space-y-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-black/[0.08] bg-white/80 p-4 shadow-[0_6px_22px_rgba(34,26,17,0.04)] transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#25d366]/35 hover:bg-white hover:shadow-[0_10px_28px_rgba(34,26,17,0.07)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#25d366]/10 text-[#188b46]">
              <WhatsAppIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">
                WhatsApp <span className="font-normal text-muted-foreground">· Arda</span>
              </span>
              <span className="mt-0.5 block text-sm tabular-nums text-muted-foreground">
                +62 851-5717-1473
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </a>

          <a
            href="mailto:algosaham.ai@gmail.com"
            className="group flex items-center gap-4 rounded-xl border border-black/[0.08] bg-white/80 p-4 shadow-[0_6px_22px_rgba(34,26,17,0.04)] transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#d07225]/30 hover:bg-white hover:shadow-[0_10px_28px_rgba(34,26,17,0.07)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#d07225]/10 text-[#b85f19]">
              <Mail className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">Email</span>
              <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                algosaham.ai@gmail.com
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </a>
        </div>

      </aside>

      <div className="space-y-3">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-black/[0.08] bg-white/[0.88] p-5 shadow-[0_18px_50px_rgba(34,26,17,0.07)] backdrop-blur-sm sm:p-6 lg:p-7"
        >
        <div className="border-b border-black/[0.08] pb-5">
          <h2 className="font-heading text-2xl font-semibold tracking-[-0.025em] text-foreground">
            Kirim pesan
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Isi detail berikut dan pesan Anda akan langsung diteruskan ke tim kami.
          </p>
        </div>

        {isSubmitted ? (
          <div className="mt-6 flex gap-3 rounded-xl border border-[#487b78]/20 bg-[#487b78]/[0.07] p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#487b78]" />
            <div>
              <p className="text-sm font-semibold text-foreground">Pesan sudah terkirim</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Terima kasih. Tim kami akan menindaklanjuti pesan Anda secepatnya.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Nama lengkap">
            <Input
              id="name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Nama Anda"
              className="h-11 rounded-lg border-black/[0.10] bg-white shadow-none focus-visible:ring-[#d07225]/20"
              required
            />
          </Field>

          <Field id="email" label="Email">
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="nama@email.com"
              className="h-11 rounded-lg border-black/[0.10] bg-white shadow-none focus-visible:ring-[#d07225]/20"
              required
            />
          </Field>

          <Field id="message" label="Pesan" className="sm:col-span-2">
            <textarea
              id="message"
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              placeholder="Ceritakan kebutuhan atau kendala Anda..."
              className={cn(
                "min-h-32 w-full resize-y rounded-lg border border-black/[0.10] bg-white px-3 py-3 text-sm text-foreground shadow-none outline-none transition",
                "placeholder:text-muted-foreground focus:border-[#d07225]/50 focus:ring-2 focus:ring-[#d07225]/20",
              )}
              required
            />
          </Field>
        </div>

        <div className="mt-5 space-y-3 border-t border-black/[0.08] pt-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted-foreground">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) =>
                setForm((current) => ({ ...current, consent: event.target.checked }))
              }
              className="mt-1 h-4 w-4 rounded border-black/20 accent-[#d07225]"
              required
            />
            <span>
              Saya menyetujui pemrosesan data sesuai{" "}
              <Link href="/privacy" className="font-medium text-foreground underline decoration-black/20 underline-offset-4 hover:decoration-black/60">
                Kebijakan Privasi
              </Link>
              .
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted-foreground">
            <input
              type="checkbox"
              checked={form.marketingOptIn}
              onChange={(event) =>
                setForm((current) => ({ ...current, marketingOptIn: event.target.checked }))
              }
              className="mt-1 h-4 w-4 rounded border-black/20 accent-[#d07225]"
            />
            <span>Saya bersedia menerima pembaruan produk dari Algosaham.ai (opsional).</span>
          </label>
        </div>

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

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted-foreground">
            Jangan sertakan kata sandi atau data sensitif.
          </p>
          <Button
            type="submit"
            size="lg"
            className="h-11 rounded-lg bg-[#d07225] px-6 text-white shadow-sm hover:bg-[#b85f19]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                Kirim pesan
                <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        </form>

        <div className="flex items-start gap-2 px-1 text-[11px] leading-5 text-muted-foreground sm:text-xs">
          <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#d07225]" />
          <p>
            Kami biasanya merespons pada hari kerja. Sertakan konteks atau tangkapan
            layar agar kami dapat membantu lebih cepat.
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  children,
  className,
}: {
  id: string
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}
