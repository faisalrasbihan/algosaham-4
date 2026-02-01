import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { strategies, indicators } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch user's strategies
        const userStrategies = await db
            .select()
            .from(strategies)
            .where(eq(strategies.creatorId, userId))
            .orderBy(desc(strategies.createdAt))

        // Fetch indicators for each strategy
        const strategiesWithIndicators = await Promise.all(
            userStrategies.map(async (strategy) => {
                const strategyIndicators = await db
                    .select()
                    .from(indicators)
                    .where(eq(indicators.strategyId, strategy.id))

                return {
                    ...strategy,
                    indicators: strategyIndicators,
                }
            })
        )

        return NextResponse.json({
            success: true,
            strategies: strategiesWithIndicators,
        })
    } catch (error) {
        console.error('Error fetching strategies:', error)
        return NextResponse.json(
            { error: 'Failed to fetch strategies' },
            { status: 500 }
        )
    }
}
