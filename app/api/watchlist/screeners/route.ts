import { auth } from "@clerk/nextjs/server"
import { desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { savedScreeners } from "@/db/schema"
import { ensureUserInDatabase } from "@/lib/ensure-user"

export const dynamic = "force-dynamic"

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

function normalizeMatches(value: unknown) {
  if (!Array.isArray(value)) return []

  return value.slice(0, 20).flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const match = item as Record<string, unknown>
    const ticker = cleanText(match.ticker, 12).toUpperCase()
    if (!/^[A-Z0-9]{1,12}$/.test(ticker)) return []

    return [{
      ticker,
      score: typeof match.score === "number" ? match.score : null,
      price: typeof match.price === "number" ? match.price : null,
      change: typeof match.change === "number" ? match.change : null,
      sector: cleanText(match.sector, 100) || null,
    }]
  })
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    await ensureUserInDatabase()
    const screeners = await db
      .select()
      .from(savedScreeners)
      .where(eq(savedScreeners.userId, userId))
      .orderBy(desc(savedScreeners.updatedAt))

    return NextResponse.json({ success: true, screeners })
  } catch (error) {
    console.error("Error loading saved screeners:", error)
    return NextResponse.json({ success: false, error: "Failed to load saved screeners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    await ensureUserInDatabase()
    const body = await request.json()
    const name = cleanText(body.name, 80)
    if (!name) {
      return NextResponse.json({ success: false, error: "Nama screener wajib diisi" }, { status: 400 })
    }
    if (!body.config || typeof body.config !== "object" || Array.isArray(body.config)) {
      return NextResponse.json({ success: false, error: "Konfigurasi screener tidak valid" }, { status: 400 })
    }

    const now = new Date()
    const [screener] = await db
      .insert(savedScreeners)
      .values({
        userId,
        name,
        description: cleanText(body.description, 300) || null,
        category: cleanText(body.category, 40) || null,
        sourcePresetId: cleanText(body.sourcePresetId, 100) || null,
        config: body.config,
        filterLabels: Array.isArray(body.filterLabels)
          ? body.filterLabels.map((label: unknown) => cleanText(label, 60)).filter(Boolean).slice(0, 20)
          : [],
        latestMatches: normalizeMatches(body.latestMatches),
        lastRunAt: body.lastRunAt ? new Date(body.lastRunAt) : null,
        updatedAt: now,
      })
      .returning()

    return NextResponse.json({ success: true, screener })
  } catch (error) {
    console.error("Error saving screener:", error)
    return NextResponse.json({ success: false, error: "Failed to save screener" }, { status: 500 })
  }
}
