import { auth } from "@clerk/nextjs/server"
import { and, desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { savedStocks } from "@/db/schema"
import { ensureUserInDatabase } from "@/lib/ensure-user"

export const dynamic = "force-dynamic"

function normalizeTicker(value: unknown) {
  if (typeof value !== "string") return null
  const ticker = value.trim().toUpperCase().replace(/\.JK$/, "")
  return /^[A-Z0-9]{1,12}$/.test(ticker) ? ticker : null
}

function normalizeSnapshot(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const snapshot = value as Record<string, unknown>

  return {
    sector: typeof snapshot.sector === "string" ? snapshot.sector.slice(0, 100) : null,
    score: typeof snapshot.score === "number" ? snapshot.score : null,
    price: typeof snapshot.price === "number" ? snapshot.price : null,
    day: typeof snapshot.day === "number" ? snapshot.day : null,
    week: typeof snapshot.week === "number" ? snapshot.week : null,
    month: typeof snapshot.month === "number" ? snapshot.month : null,
    ma20: typeof snapshot.ma20 === "number" ? snapshot.ma20 : null,
    gap52wLow: typeof snapshot.gap52wLow === "number" ? snapshot.gap52wLow : null,
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    await ensureUserInDatabase()
    const stocks = await db
      .select()
      .from(savedStocks)
      .where(eq(savedStocks.userId, userId))
      .orderBy(desc(savedStocks.updatedAt))

    return NextResponse.json({ success: true, stocks })
  } catch (error) {
    console.error("Error loading saved stocks:", error)
    return NextResponse.json({ success: false, error: "Failed to load saved stocks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    await ensureUserInDatabase()
    const body = await request.json()
    const ticker = normalizeTicker(body.ticker)
    if (!ticker) {
      return NextResponse.json({ success: false, error: "Ticker tidak valid" }, { status: 400 })
    }

    const snapshot = normalizeSnapshot(body.snapshot)
    const now = new Date()
    const [stock] = await db
      .insert(savedStocks)
      .values({ userId, ticker, snapshot, updatedAt: now })
      .onConflictDoUpdate({
        target: [savedStocks.userId, savedStocks.ticker],
        set: { snapshot, updatedAt: now },
      })
      .returning()

    return NextResponse.json({ success: true, stock })
  } catch (error) {
    console.error("Error saving stock:", error)
    return NextResponse.json({ success: false, error: "Failed to save stock" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const ticker = normalizeTicker(request.nextUrl.searchParams.get("ticker"))
    if (!ticker) {
      return NextResponse.json({ success: false, error: "Ticker tidak valid" }, { status: 400 })
    }

    const removed = await db
      .delete(savedStocks)
      .where(and(eq(savedStocks.userId, userId), eq(savedStocks.ticker, ticker)))
      .returning({ id: savedStocks.id })

    return NextResponse.json({ success: true, removed: removed.length > 0 })
  } catch (error) {
    console.error("Error removing saved stock:", error)
    return NextResponse.json({ success: false, error: "Failed to remove saved stock" }, { status: 500 })
  }
}
