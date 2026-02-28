import { z } from "zod"
import { NextResponse } from "next/server"

const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Nama lengkap wajib diisi."),
  email: z.string().trim().email("Alamat email tidak valid."),
  subject: z.string().trim().min(3, "Subjek pesan wajib diisi."),
  message: z.string().trim().min(10, "Pesan terlalu singkat."),
  consent: z.boolean().refine((value) => value, {
    message: "Persetujuan wajib diberikan.",
  }),
  marketingOptIn: z.boolean(),
  website: z.string().optional(),
})

const RESEND_API_URL = "https://api.resend.com/emails"
const CONTACT_FORM_TO = process.env.CONTACT_FORM_TO || "algosaham.ai@gmail.com"
const CONTACT_FORM_FROM =
  process.env.CONTACT_FORM_FROM || "Algosaham.ai <onboarding@resend.dev>"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = contactFormSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Input formulir tidak valid."
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, email, subject, message, consent, marketingOptIn, website } = parsed.data

    if (website && website.trim().length > 0) {
      return NextResponse.json({ success: true })
    }

    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Form kontak belum dikonfigurasi di server. Tambahkan RESEND_API_KEY dan CONTACT_FORM_FROM untuk mengaktifkan pengiriman email.",
        },
        { status: 503 }
      )
    }

    const html = `
      <h2>Pesan Baru dari Form Contact Us</h2>
      <p><strong>Nama Lengkap:</strong> ${escapeHtml(name)}</p>
      <p><strong>Alamat Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subjek Pesan:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Persetujuan Kebijakan Privasi:</strong> ${consent ? "Ya" : "Tidak"}</p>
      <p><strong>Opt-in informasi dan pembaruan:</strong> ${marketingOptIn ? "Ya" : "Tidak"}</p>
      <hr />
      <p><strong>Pesan:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
    `

    const resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONTACT_FORM_FROM,
        to: [CONTACT_FORM_TO],
        reply_to: email,
        subject: `[Contact Us] ${subject}`,
        html,
      }),
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error("Contact form send failed:", errorText)
      return NextResponse.json(
        { error: "Pesan gagal dikirim. Silakan coba beberapa saat lagi." },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected contact form error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pesan Anda." },
      { status: 500 }
    )
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
