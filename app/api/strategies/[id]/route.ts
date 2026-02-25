import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { strategies } from '@/db/schema'
import { eq, and, or } from 'drizzle-orm'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const strategyId = parseInt(params.id)

        // Fetch the strategy (if it belongs to the user OR is a public strategy)
        const [strategy] = await db
            .select()
            .from(strategies)
            .where(
                and(
                    eq(strategies.id, strategyId),
                    or(
                        eq(strategies.creatorId, userId),
                        eq(strategies.isPublic, true)
                    )
                )
            )
            .limit(1)

        if (!strategy) {
            return NextResponse.json(
                { error: 'Strategy not found or unauthorized' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            strategy,
        })
    } catch (error) {
        console.error('Error fetching strategy:', error)
        return NextResponse.json(
            { error: 'Failed to fetch strategy' },
            { status: 500 }
        )
    }
}
