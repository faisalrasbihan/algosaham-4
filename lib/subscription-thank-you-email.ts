import {
  formatPlanPrice,
  getPlanConfig,
  getPlanPrice,
  type BillingInterval,
  type PaidSubscriptionTier,
} from "@/lib/subscription-plans";

const RESEND_API_URL = "https://api.resend.com/emails";
const SUBSCRIPTION_EMAIL_FROM =
  process.env.SUBSCRIPTION_EMAIL_FROM ||
  process.env.CONTACT_FORM_FROM ||
  "Arda <arda@algosaham.ai>";

type SendSubscriptionThankYouEmailParams = {
  to: string;
  name?: string | null;
  planType: PaidSubscriptionTier;
  billingInterval: BillingInterval;
  amount: string;
  periodEnd: Date;
};

export async function sendSubscriptionThankYouEmail({
  to,
  name,
  planType,
  billingInterval,
  amount,
  periodEnd,
}: SendSubscriptionThankYouEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("Skipping subscription thank-you email: RESEND_API_KEY is not set");
    return { skipped: true as const };
  }

  const plan = getPlanConfig(planType);
  const planName = plan.name;
  const billingLabel = billingInterval === "yearly" ? "tahunan" : "bulanan";
  const parsedAmount = Number.parseInt(amount, 10);
  const price = formatPlanPrice(
    Number.isFinite(parsedAmount) ? parsedAmount : getPlanPrice(planType, billingInterval)
  );
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/portfolio`;
  const greetingName = name?.trim() || "Trader";
  const formattedPeriodEnd = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(periodEnd);

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f7faf9; padding: 32px 16px; color: #12201b;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #dfe8e4; border-radius: 12px; padding: 28px;">
        <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">Halo ${escapeHtml(greetingName)},</p>
        <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">
          Saya Arda dari algosaham.ai. Saya cuma mau menyapa sebentar karena saya melihat paket ${escapeHtml(planName)} kamu sudah aktif.
        </p>
        <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">
          Terima kasih ya sudah berlangganan dan mempercayai algosaham.ai sebagai teman analisis trading kamu. Saya harap fitur-fitur di dalamnya bisa membantu kamu mengambil keputusan dengan lebih rapi, disiplin, dan berbasis data.
        </p>
        <div style="margin: 22px 0; padding: 16px; border-radius: 10px; background: #eef7f3;">
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Paket:</strong> ${escapeHtml(planName)}</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Periode:</strong> ${escapeHtml(billingLabel)}</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Biaya:</strong> ${escapeHtml(price)}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Aktif sampai:</strong> ${escapeHtml(formattedPeriodEnd)}</p>
        </div>
        <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">
          Kalau kamu mau langsung mulai, kamu bisa buka portfolio dan cek kuota akunmu dari sana.
        </p>
        <p style="margin: 0 0 22px;">
          <a href="${escapeHtml(dashboardUrl)}" style="display: inline-block; padding: 12px 18px; border-radius: 8px; background: #0f7b55; color: #ffffff; text-decoration: none; font-weight: 700;">
            Buka Portfolio
          </a>
        </p>
        <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">
          Kalau ada pertanyaan, bingung mulai dari mana, atau ada masukan untuk produk ini, boleh langsung balas email ini.
        </p>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">
          Salam,<br />
          Arda<br />
          algosaham.ai
        </p>
      </div>
    </div>
  `;

  const text = [
    `Halo ${greetingName},`,
    "",
    `Saya Arda dari algosaham.ai. Saya cuma mau menyapa sebentar karena saya melihat paket ${planName} kamu sudah aktif.`,
    "",
    "Terima kasih ya sudah berlangganan dan mempercayai algosaham.ai sebagai teman analisis trading kamu. Saya harap fitur-fitur di dalamnya bisa membantu kamu mengambil keputusan dengan lebih rapi, disiplin, dan berbasis data.",
    "",
    `Detail paket: ${planName}`,
    `Periode: ${billingLabel}`,
    `Biaya: ${price}`,
    `Aktif sampai: ${formattedPeriodEnd}`,
    "",
    "Kalau kamu mau langsung mulai, kamu bisa buka portfolio dan cek kuota akunmu dari sana:",
    dashboardUrl,
    "",
    "Kalau ada pertanyaan, bingung mulai dari mana, atau ada masukan untuk produk ini, boleh langsung balas email ini.",
    "",
    "Salam,",
    "Arda",
    "algosaham.ai",
  ].join("\n");

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: SUBSCRIPTION_EMAIL_FROM,
      to: [to],
      subject: `${greetingName}, paket ${planName} kamu sudah aktif`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Subscription thank-you email failed: ${errorText}`);
  }

  return { skipped: false as const };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
