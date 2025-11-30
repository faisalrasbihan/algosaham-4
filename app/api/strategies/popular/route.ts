import { NextResponse } from "next/server";
import { db } from "@/db";
import { strategies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Query strategies where creator_id = 0 (system strategies)
    // Order by ytd_return DESC to show best performers first
    const results = await db
      .select({
        id: strategies.id,
        name: strategies.name,
        description: strategies.description,
        totalReturns: strategies.totalReturns,
        ytdReturn: strategies.ytdReturn,
        maxDrawdown: strategies.maxDrawdown,
        sharpeRatio: strategies.sharpeRatio,
        winRate: strategies.winRate,
        totalStocks: strategies.totalStocks,
        alpha: strategies.alpha,
        beta: strategies.beta,
        volatility: strategies.volatility,
        sortinoRatio: strategies.sortinoRatio,
        calmarRatio: strategies.calmarRatio,
        monthlyReturn: strategies.monthlyReturn,
        weeklyReturn: strategies.weeklyReturn,
        dailyReturn: strategies.dailyReturn,
      })
      .from(strategies)
      .where(eq(strategies.creatorId, 0))
      .orderBy(desc(strategies.ytdReturn));

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

