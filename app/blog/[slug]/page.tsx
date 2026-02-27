import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock3, CornerDownRight } from "lucide-react"

import { PageChrome } from "@/components/page-chrome"
import { blogPosts, getBlogPost } from "@/app/blog/blog-data"

const accentMap = {
  ochre: {
    bg: "bg-ochre/10",
    text: "text-ochre",
    border: "border-ochre/20",
  },
  cambridge: {
    bg: "bg-cambridge-blue/10",
    text: "text-cambridge-blue",
    border: "border-cambridge-blue/20",
  },
  pomp: {
    bg: "bg-pomp-and-power/10",
    text: "text-pomp-and-power",
    border: "border-pomp-and-power/20",
  },
} as const

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const post = getBlogPost(params.slug)

  if (!post) {
    return {
      title: "Artikel tidak ditemukan",
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const accent = accentMap[post.accent]
  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3)

  return (
    <PageChrome>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-ochre/8 to-transparent" />
        <div className="container mx-auto px-6 py-14">
          <div className="max-w-4xl space-y-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-ochre"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke blog
            </Link>

            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`rounded-full px-3 py-1 font-medium ${accent.bg} ${accent.text}`}>
                  {post.category}
                </span>
                <span className="text-muted-foreground">{post.author}</span>
                <span className="text-muted-foreground">
                  {new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(post.publishedAt))}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                {post.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {post.excerpt}
              </p>
            </div>

            <div className={`grid gap-4 rounded-[2rem] border bg-card/70 p-6 md:grid-cols-3 ${accent.border}`}>
              {post.summaryPoints.map((point) => (
                <div key={point} className="rounded-2xl bg-background/80 p-4">
                  <CornerDownRight className={`mb-3 h-5 w-5 ${accent.text}`} />
                  <p className="text-sm leading-6 text-foreground/90">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto grid gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="space-y-10">
            {post.sections.map((section) => (
              <section key={section.heading} className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {section.heading}
                </h2>
                <div className="space-y-4 text-base leading-8 text-muted-foreground">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-secondary/30 p-6">
              <p className="mb-2 text-sm uppercase tracking-[0.22em] text-ochre">
                Editorial intent
              </p>
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                Konten blog diarahkan untuk keputusan yang lebih jernih.
              </h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Fokus utamanya adalah cara berpikir, evaluasi strategi, dan catatan
                produk yang bisa langsung dipakai pengguna aktif algosaham.ai.
              </p>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6">
              <p className="mb-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Artikel lain
              </p>
              <div className="space-y-4">
                {relatedPosts.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="block rounded-2xl border border-border p-4 transition-colors hover:border-ochre/30 hover:bg-secondary/40"
                  >
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {item.category}
                    </p>
                    <h4 className="mb-2 text-base font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/strategies"
              className="inline-flex items-center gap-2 text-sm font-medium text-ochre transition-colors hover:text-ochre/80"
            >
              Jelajahi strategi di platform
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>
    </PageChrome>
  )
}
