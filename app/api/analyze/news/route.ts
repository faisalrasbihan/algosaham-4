import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"

export const dynamic = "force-dynamic"

const TAVILY_SEARCH_URL = "https://api.tavily.com/search"

const newsRequestSchema = z.object({
  ticker: z.string().trim().min(1).max(12),
  companyName: z.string().trim().max(160).optional(),
  sector: z.string().trim().max(120).optional(),
})

type TavilyResult = {
  title?: string
  url?: string
  content?: string
  published_date?: string
  score?: number
  favicon?: string
  images?: Array<string | { url?: string; description?: string }>
}

function getSourceName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return "Sumber berita"
  }
}

function trimSnippet(value: string | undefined) {
  if (!value) return undefined

  const normalized = value.replace(/\s+/g, " ").trim()
  if (normalized.length <= 150) return normalized
  return `${normalized.slice(0, 147).trim()}...`
}

function normalizeStory(result: TavilyResult) {
  const title = result.title?.trim()
  const url = result.url?.trim()

  if (!title || !url) return null

  const image = result.images?.find((item) => {
    if (typeof item === "string") return item.trim().length > 0
    return item.url?.trim()
  })

  return {
    title,
    url,
    source: getSourceName(url),
    publishedAt: result.published_date,
    snippet: trimSnippet(result.content),
    imageUrl: typeof image === "string" ? image : image?.url,
    faviconUrl: result.favicon,
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = newsRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Input berita tidak valid." },
        { status: 400 },
      )
    }

    const apiKey = process.env.TAVILY_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "TAVILY_API_KEY belum dikonfigurasi." },
        { status: 503 },
      )
    }

    const { ticker, companyName } = parsed.data
    const query = `${companyName?.trim() || ticker.toUpperCase()} Indonesia`

    const tavilyResponse = await fetch(TAVILY_SEARCH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        topic: "news",
        search_depth: "basic",
        max_results: 6,
        days: 30,
        include_answer: false,
        include_raw_content: false,
        include_images: true,
        include_favicon: true,
      }),
    })

    if (!tavilyResponse.ok) {
      const errorText = await tavilyResponse.text()
      console.error("Tavily news search failed:", errorText)
      return NextResponse.json(
        { success: false, error: "Gagal memuat berita terkait." },
        { status: 502 },
      )
    }

    const tavilyData = await tavilyResponse.json()
    const seen = new Set<string>()
    const stories = ((tavilyData?.results || []) as TavilyResult[])
      .map(normalizeStory)
      .filter((story): story is NonNullable<ReturnType<typeof normalizeStory>> => {
        if (!story) return false
        const key = story.url.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 5)

    return NextResponse.json({ success: true, stories })
  } catch (error) {
    console.error("Unexpected news search error:", error)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat memuat berita terkait." },
      { status: 500 },
    )
  }
}
