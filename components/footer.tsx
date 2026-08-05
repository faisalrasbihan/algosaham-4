import Link from "next/link"

import { PageContainer } from "@/components/page-layout"

const footerColumns = [
  {
    title: "Produk",
    links: [
      { label: "Screener", href: "/screener" },
      { label: "Analisis", href: "/analyze-v2" },
      { label: "Simulasi", href: "/backtest" },
      { label: "Harga", href: "/harga" },
    ],
  },
  {
    title: "Pelajari",
    links: [
      { label: "Fitur", href: "/features" },
      { label: "Strategi", href: "/strategies" },
      { label: "Blog", href: "/blog" },
      { label: "Bantuan", href: "/help" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang kami", href: "/about" },
      { label: "Karier", href: "/careers" },
      { label: "Status sistem", href: "/status" },
      { label: "Hubungi kami", href: "/help" },
    ],
  },
] as const

const legalLinks = [
  { label: "Privasi", href: "/privacy" },
  { label: "Ketentuan", href: "/syarat-ketentuan" },
] as const

export function Footer() {
  return (
    <footer className="site-footer relative z-20 overflow-hidden border-t border-white/10 bg-[#111112] text-white">
      <PageContainer className="relative z-10">
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,2fr)] lg:gap-20">
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex font-ibm-plex-mono text-lg font-semibold tracking-[-0.03em] text-white transition-colors hover:text-white/80"
            >
              algosaham<span className="text-[#d07225]">.ai</span>
            </Link>
            <p className="mt-6 max-w-sm font-heading text-2xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-3xl">
              Riset lebih terstruktur. Keputusan lebih terukur.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">
              Peralatan analisis dan simulasi untuk memahami pasar saham Indonesia dengan lebih jernih.
            </p>
          </div>

          <nav aria-label="Navigasi footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="font-sans text-sm font-semibold text-white">{column.title}</h2>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex text-sm text-white/55 transition-[color,transform] duration-200 hover:translate-x-0.5 hover:text-[#df8d4b]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} algosaham.ai</p>
          <div className="flex items-center gap-5">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/"
          aria-label="Kembali ke beranda Algosaham.ai"
          className="group block overflow-hidden pt-9 sm:pt-12"
        >
          <span className="block whitespace-nowrap font-ibm-plex-mono text-[clamp(3.7rem,12.4vw,10.5rem)] font-semibold leading-[0.72] tracking-[-0.095em] text-white/[0.09] transition-colors duration-300 group-hover:text-white/[0.13]">
            algosaham<span className="text-[#d07225]/80 transition-colors duration-300 group-hover:text-[#df8d4b]">.ai</span>
          </span>
        </Link>
      </PageContainer>
    </footer>
  )
}
