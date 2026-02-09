import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { strategies } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ensureUserInDatabase } from '@/lib/ensure-user'

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Ensure user exists in database (upsert logic)
        await ensureUserInDatabase()

        // Fetch user's strategies
        const userStrategies = await db
            .select()
            .from(strategies)
            .where(eq(strategies.creatorId, userId))
            .orderBy(desc(strategies.createdAt))

        return NextResponse.json({
            success: true,
            strategies: userStrategies,
        })
    } catch (error) {
        console.error('Error fetching strategies:', error)
        return NextResponse.json(
            { error: 'Failed to fetch strategies' },
            { status: 500 }
        )
    }
}
