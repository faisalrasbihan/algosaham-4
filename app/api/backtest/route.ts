import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from "@clerk/nextjs/server";
import { BacktestExecutionError, runBacktestWithQuota } from "@/lib/server/backtest";

// Environment-based logging - only log in development
const isDev = process.env.NODE_ENV === 'development'
const log = isDev ? console.log.bind(console) : () => { }

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

  const { userId } = await auth()
  // Allow guests to run backtest (initial load)
  // if (!userId) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }

  try {
    // Parse the request body
    const body = await request.json()
    const isInitialReq = body.isInitial === true;

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

    log('🔄 [API ROUTE] Calling Railway endpoint...')
    const result = await runBacktestWithQuota({
      config: validatedBody.config,
      userId,
      consumeQuota: Boolean(userId) && !isInitialReq,
      errors: {
        config: () => ({
          status: 500,
          body: {
            error: 'Server configuration error',
            details: 'RAILWAY_URL environment variable is not configured. Please set it in your .env file.',
          },
        }),
        quotaExceeded: ({ used, limit }) => ({
          status: 403,
          body: {
            error: "Daily backtest limit reached",
            message: `You have used ${used}/${limit} backtests for today. Upgrade your plan for more.`,
          },
        }),
        railway: ({ status, statusText, details }) => ({
          status,
          body: {
            error: `Railway error: ${status} ${statusText}`,
            details,
            hint: status === 500
              ? 'Check Railway backend logs for detailed error. Common causes: date range has no data, no stocks match filters, or missing stock data.'
              : undefined,
          },
        }),
      },
    })

    log('✅ [API ROUTE] Backtest completed, trades:', result.trades?.length || 0)

    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof BacktestExecutionError) {
      return NextResponse.json(error.body, { status: error.status })
    }

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
