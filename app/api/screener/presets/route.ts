import { NextResponse } from "next/server"
import { and, asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { screenerPresetCategories, screenerPresets } from "@/db/schema"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const rows = await db
      .select({
        id: screenerPresets.id,
        presetName: screenerPresets.presetName,
        summary: screenerPresets.summary,
        config: screenerPresets.config,
        tag: screenerPresets.tag,
        categoryName: screenerPresetCategories.name,
        categoryLabel: screenerPresetCategories.label,
        categoryDescription: screenerPresetCategories.description,
      })
      .from(screenerPresets)
      .innerJoin(screenerPresetCategories, eq(screenerPresets.categoryId, screenerPresetCategories.id))
      .where(and(eq(screenerPresets.isActive, true), eq(screenerPresetCategories.isActive, true)))
      .orderBy(
        asc(screenerPresetCategories.sortOrder),
        asc(screenerPresets.sortOrder),
        asc(screenerPresets.presetName),
      )

    return NextResponse.json({
      success: true,
      presets: rows.map((row) => ({
        id: row.id,
        name: row.presetName,
        group: row.categoryName,
        groupLabel: row.categoryLabel,
        groupDescription: row.categoryDescription,
        summary: row.summary ?? "",
        tag: row.tag,
        config: row.config,
      })),
    })
  } catch (error) {
    console.error("Error loading screener presets:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load screener presets",
      },
      { status: 500 },
    )
  }
}
