import { NextResponse } from "next/server";
import { db } from "@/db";
import { strategies, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
    try {
        const results = await db
            .select({
                id: strategies.id,
                name: strategies.name,
                description: strategies.description,
                creator: users.name, // Get creator name
                totalReturn: strategies.totalReturn,
                maxDrawdown: strategies.maxDrawdown,
                successRate: strategies.successRate,
                sharpeRatio: strategies.sharpeRatio,
                totalTrades: strategies.totalTrades,
                totalStocks: strategies.totalStocks,
                subscribers: strategies.subscribers,
                createdAt: strategies.createdAt,
            })
            .from(strategies)
            .leftJoin(users, eq(strategies.creatorId, users.clerkId))
            .where(
                and(
                    eq(strategies.isActive, true),
                    // Add isPublic check if schema has it, otherwise rely on isActive
                    // eq(strategies.isPublic, true) 
                )
            )
            .orderBy(desc(strategies.subscribers)); // Order by popularity

        return NextResponse.json({
            success: true,
            data: results,
            count: results.length,
        });

    } catch (error) {
        console.error("Error fetching public strategies:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch strategies" },
            { status: 500 }
        );
    }
}
