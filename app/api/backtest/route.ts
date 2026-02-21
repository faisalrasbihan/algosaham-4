import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Environment-based logging - only log in development
const isDev = process.env.NODE_ENV === 'development'
const log = isDev ? console.log.bind(console) : () => { }

// Railway backend URL - configured via environment variable
// Prepend https:// if not already present
const rawUrl = process.env.RAILWAY_URL || ''
const RAILWAY_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

// Zod schema for input validation (matches BACKTESTER_API_SPEC.md)
const backtestConfigSchema = z.object({
  config: z.object({
    backtestId: z.string().min(1),
    filters: z.object({
      tickers: z.array(z.string()).optional(),
      marketCap: z.array(z.string()).optional(),
      minDailyValue: z.number().optional(),
      syariah: z.boolean().optional(),
      sectors: z.array(z.string()).optional(),
    }),
    fundamentalIndicators: z.array(z.object({
      type: z.string(),
      min: z.number().optional(),
      max: z.number().optional(),
    })).optional().default([]),
    technicalIndicators: z.array(z.object({
      type: z.string(),
    }).passthrough()).optional().default([]),
    backtestConfig: z.object({
      initialCapital: z.number().positive(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      tradingCosts: z.object({
        brokerFee: z.number().min(0),
        sellFee: z.number().min(0),
        minimumFee: z.number().min(0),
      }),
      portfolio: z.object({
        positionSizePercent: z.number().min(1).max(100),
        minPositionPercent: z.number().min(0).max(100),
        maxPositions: z.number().int().positive(),
      }),
      riskManagement: z.object({
        stopLossPercent: z.number().min(0),
        takeProfitPercent: z.number().min(0),  // No upper limit per API spec
        maxHoldingDays: z.number().int().positive(),
      }),
    }).refine(d => d.startDate < d.endDate, {
      message: 'startDate must be before endDate',
      path: ['endDate'],
    }),
  }),
  isInitial: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  log('🚀 [API ROUTE] Starting backtest API call...')

  // Check if RAILWAY_URL is set
  if (!rawUrl) {
    console.error('[API ROUTE] RAILWAY_URL environment variable not set')
    return NextResponse.json(
      {
        error: 'Server configuration error',
        details: 'RAILWAY_URL environment variable is not configured. Please set it in your .env file.'
      },
      { status: 500 }
    )
  }

  const { userId } = await auth()
  // Allow guests to run backtest (initial load)
  // if (!userId) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }

  try {
    // Parse the request body
    const body = await request.json()
    const isInitialReq = body.isInitial === true;

    // Check user limits ONLY if logged in and not an initial load request
    if (userId && !isInitialReq) {
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });

      if (user) {
        const limit = user.backtestLimit;
        const used = user.backtestUsedToday || 0;

        if (limit !== -1 && used >= limit) {
          return NextResponse.json(
            {
              error: "Daily backtest limit reached",
              message: `You have used ${used}/${limit} backtests for today. Upgrade your plan for more.`
            },
            { status: 403 }
          );
        }
      }
    }

    log('📦 [API ROUTE] Request received for backtest:', body.config?.backtestId)

    // Validate request with Zod
    const validationResult = backtestConfigSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.flatten()
      log('❌ [API ROUTE] Validation failed:', errors)
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: errors.fieldErrors,
        },
        { status: 400 }
      )
    }

    // Use validated data
    const validatedBody = validationResult.data

    // Prepare the request to FastAPI
    const fastApiRequest = {
      config: validatedBody.config
    }

    log('🔄 [API ROUTE] Calling Railway endpoint...')

    // Call Railway backend
    let response: Response;

    response = await fetch(`${RAILWAY_URL}/run_backtest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fastApiRequest),
    })

    log('📡 [API ROUTE] Railway response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API ROUTE] Railway error:', response.status, errorText.substring(0, 200))
      return NextResponse.json(
        {
          error: `Railway error: ${response.status} ${response.statusText}`,
          details: errorText,
          hint: response.status === 500
            ? 'Check Railway backend logs for detailed error. Common causes: date range has no data, no stocks match filters, or missing stock data.'
            : undefined
        },
        { status: response.status }
      )
    }

    // Parse the response
    const result = await response.json()
    log('✅ [API ROUTE] Backtest completed, trades:', result.trades?.length || 0)

    // Increment backtest usage for logged-in users who actively ran it
    if (userId && !isInitialReq) {
      try {
        await db.update(users)
          .set({ backtestUsedToday: sql`${users.backtestUsedToday} + 1` })
          .where(eq(users.clerkId, userId));
        log('📊 [API ROUTE] Incremented backtest usage for user:', userId)
      } catch (err) {
        console.error('[API ROUTE] Failed to increment backtest usage:', err)
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('[API ROUTE] Unexpected error:', error instanceof Error ? error.message : 'Unknown error')

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}