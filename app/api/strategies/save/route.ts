import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { strategies, indicators } from "@/db/schema";
import { BacktestRequest } from "@/lib/api";

type NewIndicator = typeof indicators.$inferInsert;

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, description, config } = body as {
            name: string;
            description: string;
            config: BacktestRequest;
        };

        if (!name) {
            return NextResponse.json(
                { success: false, error: "Name is required" },
                { status: 400 }
            );
        }

        // Start a transaction to save strategy and its indicators
        const result = await db.transaction(async (tx) => {
            // 1. Insert Strategy
            const [newStrategy] = await tx.insert(strategies).values({
                name,
                description,
                configuration: config,
                creatorId: userId,
                createdAt: new Date(),
            }).returning();

            // 2. Insert Indicators
            const indicatorValues: NewIndicator[] = [];

            if (config.fundamentalIndicators && config.fundamentalIndicators.length > 0) {
                config.fundamentalIndicators.forEach((ind: any) => {
                    indicatorValues.push({
                        strategyId: newStrategy.id,
                        name: ind.type,
                        parameters: { min: ind.min, max: ind.max },
                    });
                });
            }

            if (config.technicalIndicators && config.technicalIndicators.length > 0) {
                config.technicalIndicators.forEach((ind: any) => {
                    const { type, ...params } = ind;
                    indicatorValues.push({
                        strategyId: newStrategy.id,
                        name: type,
                        parameters: params,
                    });
                });
            }

            if (indicatorValues.length > 0) {
                await tx.insert(indicators).values(indicatorValues);
            }

            return newStrategy;
        });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Error saving strategy:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to save strategy",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
