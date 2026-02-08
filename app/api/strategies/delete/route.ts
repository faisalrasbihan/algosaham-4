import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { strategies } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const strategyId = searchParams.get('id')

        if (!strategyId) {
            return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 })
        }

        // Delete the strategy (only if it belongs to the user)
        const result = await db
            .delete(strategies)
            .where(
                and(
                    eq(strategies.id, parseInt(strategyId)),
                    eq(strategies.creatorId, userId)
                )
            )
            .returning()

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Strategy not found or unauthorized' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Strategy deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting strategy:', error)
        return NextResponse.json(
            { error: 'Failed to delete strategy' },
            { status: 500 }
        )
    }
}
