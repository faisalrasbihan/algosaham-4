import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/db"
import { savedScreeners } from "@/db/schema"

export const dynamic = "force-dynamic"

function parseId(value: string) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const id = parseId(params.id)
    if (!id) return NextResponse.json({ success: false, error: "Invalid screener id" }, { status: 400 })

    const [screener] = await db
      .select()
      .from(savedScreeners)
      .where(and(eq(savedScreeners.id, id), eq(savedScreeners.userId, userId)))
      .limit(1)

    if (!screener) return NextResponse.json({ success: false, error: "Screener not found" }, { status: 404 })
    return NextResponse.json({ success: true, screener })
  } catch (error) {
    console.error("Error loading saved screener:", error)
    return NextResponse.json({ success: false, error: "Failed to load saved screener" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const id = parseId(params.id)
    if (!id) return NextResponse.json({ success: false, error: "Invalid screener id" }, { status: 400 })

    const removed = await db
      .delete(savedScreeners)
      .where(and(eq(savedScreeners.id, id), eq(savedScreeners.userId, userId)))
      .returning({ id: savedScreeners.id })

    return NextResponse.json({ success: true, removed: removed.length > 0 })
  } catch (error) {
    console.error("Error deleting saved screener:", error)
    return NextResponse.json({ success: false, error: "Failed to delete saved screener" }, { status: 500 })
  }
}
