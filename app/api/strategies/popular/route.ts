import { NextResponse } from "next/server";
import { db } from "@/db";
import { strategies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Query strategies where creator_id = 0 (system strategies)
    // Order by totalReturn DESC to show best performers first
    const results = await db
      .select({
        id: strategies.id,
        name: strategies.name,
        description: strategies.description,
        totalReturn: strategies.totalReturn,
        maxDrawdown: strategies.maxDrawdown,
        successRate: strategies.successRate,
        totalStocks: strategies.totalStocks,
        totalTrades: strategies.totalTrades,
        qualityScore: strategies.qualityScore,
        isPublic: strategies.isPublic,
        createdAt: strategies.createdAt,
      })
      .from(strategies)
      .where(eq(strategies.creatorId, "0"))
      .orderBy(desc(strategies.totalReturn));

    // Return the strategies as JSON
    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error fetching popular strategies:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch popular strategies",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
