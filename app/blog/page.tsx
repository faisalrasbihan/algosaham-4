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
import { PageHeader, PageSection, SectionHeader, Surface } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "Blog | algosaham.ai",
  description:
    "Wawasan, catatan produk, dan pembelajaran seputar strategi trading berbasis data dari algosaham.ai.",
  alternates: {
    canonical: "/blog",
  },
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
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Editorial hub</span>}
        title="Blog untuk trader yang ingin berpikir lebih rapi."
        description="Bukan feed opini pasar. Fokusnya adalah cara membaca backtest, membangun proses screening, dan mengikuti evolusi produk dengan konteks yang jelas."
        actions={
          <>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Baca artikel unggulan
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/strategies"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-ochre/30 hover:text-ochre"
                >
                  Jelajahi strategi
                </Link>
          </>
        }
        aside={
          <Surface className="p-5">
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
                    className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm leading-6 text-foreground/90"
                  >
                    {point}
                  </div>
                ))}
              </div>
          </Surface>
        }
      />

      <PageSection className="pt-4">
          <SectionHeader
            eyebrow="Latest writing"
            title="Arsip yang siap tumbuh tanpa mengubah pola halaman"
            aside={<div className="hidden rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:block">
              {blogPosts.length} artikel awal
            </div>}
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5">
              {latestPosts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ochre/30"
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
              <Surface className="bg-secondary/30 p-5">
                <p className="mb-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  Fokus editorial
                </p>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.name} className="rounded-lg bg-background/90 p-4">
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
              </Surface>

              <Surface className="border-foreground bg-foreground p-5 text-background">
                <BookOpen className="mb-4 h-6 w-6 text-ochre-700" />
                <h3 className="mb-3 text-xl font-semibold">
                  Dibangun supaya penambahan artikel berikutnya tetap rapi.
                </h3>
                <p className="mb-5 text-sm leading-7 text-background/75">
                  Struktur blog ini sudah dipisah ke data post dan halaman slug,
                  jadi artikel baru bisa ditambahkan tanpa mendesain ulang index.
                </p>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 text-sm font-medium text-ochre-700 transition-colors hover:text-white"
                >
                  Kirim ide topik
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Surface>
            </div>
          </div>
      </PageSection>
    </PageChrome>
  )
}
