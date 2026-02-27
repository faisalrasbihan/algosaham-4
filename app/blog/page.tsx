import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Library,
  PanelTop,
  Sparkles,
  SquarePen,
} from "lucide-react"

import { blogPosts } from "@/app/blog/blog-data"
import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "Blog | algosaham.ai",
  description:
    "Wawasan, catatan produk, dan pembelajaran seputar strategi trading berbasis data dari algosaham.ai.",
}

export default function BlogPage() {
  const featuredPost = blogPosts.find((post) => post.featured) ?? blogPosts[0]
  const latestPosts = blogPosts.filter((post) => post.slug !== featuredPost.slug)

  const categories = [
    {
      name: "Backtesting",
      description: "Cara membaca hasil, menguji asumsi, dan menilai robustness strategi.",
      icon: PanelTop,
    },
    {
      name: "Screening",
      description: "Metode menyusutkan universe saham sebelum analisis lebih dalam.",
      icon: Library,
    },
    {
      name: "Product Notes",
      description: "Perubahan fitur dan konteks di balik keputusan produk.",
      icon: SquarePen,
    },
  ]

  return (
    <PageChrome>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="absolute inset-0 dotted-background opacity-40" />
        <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-ochre/10 blur-3xl" />
        <div className="absolute bottom-0 right-12 h-72 w-72 rounded-full bg-cambridge-blue/10 blur-3xl" />
        <div className="container relative mx-auto px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-ochre/20 bg-ochre/10 px-4 py-2 text-sm text-ochre">
                <Sparkles className="h-4 w-4" />
                Editorial hub
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                  Blog yang dibangun untuk trader yang ingin berpikir lebih rapi.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Bukan feed opini pasar. Fokusnya adalah cara membaca backtest,
                  membangun proses screening, dan mengikuti evolusi produk dengan
                  konteks yang jelas.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Baca artikel unggulan
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/strategies"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-ochre/30 hover:text-ochre"
                >
                  Jelajahi strategi
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm">
              <p className="mb-3 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Artikel unggulan
              </p>
              <h2 className="mb-3 text-2xl font-semibold text-foreground">
                {featuredPost.title}
              </h2>
              <p className="mb-5 text-sm leading-7 text-muted-foreground">
                {featuredPost.excerpt}
              </p>
              <div className="mb-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>{featuredPost.category}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-4 w-4" />
                  {featuredPost.readTime}
                </span>
              </div>
              <div className="space-y-3">
                {featuredPost.summaryPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm leading-6 text-foreground/90"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-6 py-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Latest writing
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Arsip yang siap tumbuh tanpa mengubah pola halaman
              </h2>
            </div>
            <div className="hidden rounded-full border border-border px-4 py-2 text-sm text-muted-foreground md:block">
              {blogPosts.length} artikel awal
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5">
              {latestPosts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-[2rem] border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-ochre/30 hover:shadow-sm"
                >
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="rounded-full bg-secondary px-3 py-1 text-foreground">
                      {String(index + 2).padStart(2, "0")}
                    </span>
                    <span>{post.category}</span>
                    <span>{post.readTime}</span>
                    <span>
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(post.publishedAt))}
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold text-foreground transition-colors group-hover:text-ochre">
                    {post.title}
                  </h3>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-border bg-secondary/30 p-6">
                <p className="mb-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  Fokus editorial
                </p>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.name} className="rounded-2xl bg-background/90 p-4">
                      <category.icon className="mb-3 h-5 w-5 text-ochre" />
                      <h3 className="mb-2 text-base font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-foreground p-6 text-background">
                <BookOpen className="mb-4 h-6 w-6 text-ochre-700" />
                <h3 className="mb-3 text-xl font-semibold">
                  Dibangun supaya penambahan artikel berikutnya tetap rapi.
                </h3>
                <p className="mb-5 text-sm leading-7 text-background/75">
                  Struktur blog ini sudah dipisah ke data post dan halaman slug,
                  jadi artikel baru bisa ditambahkan tanpa mendesain ulang index.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-ochre-700 transition-colors hover:text-white"
                >
                  Kirim ide topik
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
