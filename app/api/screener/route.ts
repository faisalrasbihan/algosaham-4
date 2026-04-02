import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import type postgres from "postgres"

import { genkiClient } from "@/db/genki"
import { ensureUserInDatabase } from "@/lib/ensure-user"
import {
  getDailyQuotaSnapshot,
  getUserWithSyncedSubscriptionState,
  incrementDailyQuotaUsage,
} from "@/lib/server/subscription-state"

const screenerRequestSchema = z.object({
  config: z.object({
    backtestId: z.string().min(1),
    filters: z.object({
      tickers: z.array(z.string()).optional(),
      marketCap: z.array(z.string()).optional(),
      minDailyValue: z.number().optional(),
      syariah: z.boolean().optional(),
      sectors: z.array(z.string()).optional(),
    }).default({}),
    fundamentalIndicators: z.array(z.object({
      type: z.string(),
      min: z.number().optional(),
      max: z.number().optional(),
    }).passthrough()).optional().default([]),
    technicalIndicators: z.array(z.object({
      type: z.string(),
    }).passthrough()).optional().default([]),
    backtestConfig: z.object({
      initialCapital: z.number().positive(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
        takeProfitPercent: z.number().min(0),
        maxHoldingDays: z.number().int().positive(),
      }),
    }),
    riskManagement: z.record(z.any()).optional(),
  }),
})

type ScreenerDbRow = {
  stock_code: string
  open: string | number | null
  high: string | number | null
  low: string | number | null
  close: string | number | null
  volume: string | number | null
  freq: string | number | null
  valuasi: string | number | null
  nbsa: string | number | null
  prev_close: string | number | null
  gap_pct: string | number | null
  prev_daily_value: string | number | null
  is_valid_ohlcv: boolean | null
  is_zero_ohlc: boolean | null
  month: number | null
  sector: string | null
  assets: string | number | null
  liabilities: string | number | null
  equity: string | number | null
  sales: string | number | null
  ebt: string | number | null
  profit: string | number | null
  profit_attributable: string | number | null
  book_value: string | number | null
  eps: string | number | null
  pe_ratio: string | number | null
  pbv: string | number | null
  der: string | number | null
  roa: string | number | null
  roe: string | number | null
  npm: string | number | null
  financial_date: string | null
  market_cap: string | number | null
  market_cap_group: string | null
  is_syariah: number | boolean | null
  sma_20: string | number | null
  sma_50: string | number | null
  volume_sma_20: string | number | null
  value_sma_20: string | number | null
  nbsa_5d: string | number | null
  value_5d: string | number | null
  nbsa_ratio_5d: string | number | null
  change_d1_pct: string | number | null
  change_5d_pct: string | number | null
  change_1m_pct: string | number | null
  change_1y_pct: string | number | null
}

function toOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function toOptionalInteger(value: unknown) {
  const parsed = toOptionalNumber(value)
  return parsed === null ? null : Math.trunc(parsed)
}

function normalizeScreenerRow(row: ScreenerDbRow) {
  return {
    stockCode: row.stock_code,
    open: toOptionalNumber(row.open),
    high: toOptionalNumber(row.high),
    low: toOptionalNumber(row.low),
    close: toOptionalNumber(row.close),
    volume: toOptionalNumber(row.volume),
    freq: toOptionalNumber(row.freq),
    valuasi: toOptionalNumber(row.valuasi),
    nbsa: toOptionalNumber(row.nbsa),
    prevClose: toOptionalNumber(row.prev_close),
    gapPct: toOptionalNumber(row.gap_pct),
    prevDailyValue: toOptionalNumber(row.prev_daily_value),
    isValidOhlcv: Boolean(row.is_valid_ohlcv),
    isZeroOhlc: Boolean(row.is_zero_ohlc),
    month: toOptionalInteger(row.month),
    sector: row.sector,
    assets: toOptionalNumber(row.assets),
    liabilities: toOptionalNumber(row.liabilities),
    equity: toOptionalNumber(row.equity),
    sales: toOptionalNumber(row.sales),
    ebt: toOptionalNumber(row.ebt),
    profit: toOptionalNumber(row.profit),
    profitAttributable: toOptionalNumber(row.profit_attributable),
    bookValue: toOptionalNumber(row.book_value),
    eps: toOptionalNumber(row.eps),
    peRatio: toOptionalNumber(row.pe_ratio),
    pbv: toOptionalNumber(row.pbv),
    der: toOptionalNumber(row.der),
    roa: toOptionalNumber(row.roa),
    roe: toOptionalNumber(row.roe),
    npm: toOptionalNumber(row.npm),
    financialDate: row.financial_date,
    marketCap: toOptionalNumber(row.market_cap),
    marketCapGroup: row.market_cap_group,
    isSyariah: row.is_syariah === true || row.is_syariah === 1,
    sma20: toOptionalNumber(row.sma_20),
    sma50: toOptionalNumber(row.sma_50),
    volumeSma20: toOptionalNumber(row.volume_sma_20),
    valueSma20: toOptionalNumber(row.value_sma_20),
    nbsa5d: toOptionalNumber(row.nbsa_5d),
    value5d: toOptionalNumber(row.value_5d),
    nbsaRatio5d: toOptionalNumber(row.nbsa_ratio_5d),
    changeD1Pct: toOptionalNumber(row.change_d1_pct),
    change5DPct: toOptionalNumber(row.change_5d_pct),
    change1MPct: toOptionalNumber(row.change_1m_pct),
    change1YPct: toOptionalNumber(row.change_1y_pct),
  }
}

type ScreenerFilters = {
  tickers?: string[]
  marketCap?: string[]
  minDailyValue?: number
  syariah?: boolean
  sectors?: string[]
}

async function queryLatestSnapshotRows(filters: ScreenerFilters) {
  const params: postgres.ParameterOrJSON<never>[] = []
  const whereClauses = ["date = (SELECT MAX(date) FROM core.mv_stock_daily)"]

  if (filters.tickers && filters.tickers.length > 0) {
    params.push(filters.tickers)
    whereClauses.push(`stock_code = ANY($${params.length}::text[])`)
  }

  if (filters.marketCap && filters.marketCap.length > 0) {
    params.push(filters.marketCap.map((value) => value.toLowerCase()))
    whereClauses.push(`LOWER(market_cap_group) = ANY($${params.length}::text[])`)
  }

  if (filters.sectors && filters.sectors.length > 0) {
    params.push(filters.sectors)
    whereClauses.push(`sector = ANY($${params.length}::text[])`)
  }

  if (filters.syariah !== undefined) {
    params.push(filters.syariah)
    whereClauses.push(`(CASE WHEN is_syariah = true OR is_syariah = 1 THEN true ELSE false END) = $${params.length}`)
  }

  if (filters.minDailyValue !== undefined) {
    params.push(filters.minDailyValue)
    whereClauses.push(`COALESCE(prev_daily_value, close * volume, 0) >= $${params.length}`)
  }

  return genkiClient.unsafe<ScreenerDbRow[]>(
    `
      WITH latest_view AS (
        SELECT
          mv.*,
          CASE
            WHEN mv.prev_close IS NOT NULL AND mv.prev_close <> 0
              THEN ((mv.close / mv.prev_close) - 1) * 100
            ELSE NULL
          END AS change_d1_pct,
          CASE
            WHEN LAG(mv.close, 5) OVER (PARTITION BY mv.stock_code ORDER BY mv.date) IS NOT NULL
              AND LAG(mv.close, 5) OVER (PARTITION BY mv.stock_code ORDER BY mv.date) <> 0
              THEN ((mv.close / LAG(mv.close, 5) OVER (PARTITION BY mv.stock_code ORDER BY mv.date)) - 1) * 100
            ELSE NULL
          END AS change_5d_pct,
          CASE
            WHEN LAG(mv.close, 21) OVER (PARTITION BY mv.stock_code ORDER BY mv.date) IS NOT NULL
              AND LAG(mv.close, 21) OVER (PARTITION BY mv.stock_code ORDER BY mv.date) <> 0
              THEN ((mv.close / LAG(mv.close, 21) OVER (PARTITION BY mv.stock_code ORDER BY mv.date)) - 1) * 100
            ELSE NULL
          END AS change_1m_pct,
          CASE
            WHEN LAG(mv.close, 252) OVER (PARTITION BY mv.stock_code ORDER BY mv.date) IS NOT NULL
              AND LAG(mv.close, 252) OVER (PARTITION BY mv.stock_code ORDER BY mv.date) <> 0
              THEN ((mv.close / LAG(mv.close, 252) OVER (PARTITION BY mv.stock_code ORDER BY mv.date)) - 1) * 100
            ELSE NULL
          END AS change_1y_pct
        FROM core.mv_stock_daily mv
      )
      SELECT
        stock_code,
        open,
        high,
        low,
        close,
        volume,
        freq,
        valuasi,
        nbsa,
        prev_close,
        gap_pct,
        prev_daily_value,
        is_valid_ohlcv,
        is_zero_ohlc,
        month,
        sector,
        assets,
        liabilities,
        equity,
        sales,
        ebt,
        profit,
        profit_attributable,
        book_value,
        eps,
        pe_ratio,
        pbv,
        der,
        roa,
        roe,
        npm,
        financial_date::text,
        market_cap,
        market_cap_group,
        is_syariah,
        sma_20,
        sma_50,
        volume_sma_20,
        value_sma_20,
        nbsa_5d,
        value_5d,
        nbsa_ratio_5d,
        change_d1_pct,
        change_5d_pct,
        change_1m_pct,
        change_1y_pct
      FROM latest_view
      WHERE ${whereClauses.join("\n        AND ")}
      ORDER BY stock_code ASC
    `,
    params,
  )
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          details: "Silakan login terlebih dahulu untuk menjalankan screener.",
        },
        { status: 401 },
      )
    }

    await ensureUserInDatabase()

    const user = await getUserWithSyncedSubscriptionState(userId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      )
    }

    const { limit, used } = getDailyQuotaSnapshot(user, "screening")
    if (limit !== -1 && used >= limit) {
      return NextResponse.json(
        {
          error: "Daily screening limit reached",
          details: `Anda telah menggunakan ${used}/${limit} screening untuk hari ini. Upgrade paket Anda untuk lebih banyak.`,
        },
        { status: 403 },
      )
    }

    const body = await request.json()
    const parsed = screenerRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const latestDateResult = await genkiClient<{ latest_date: string | null; stocks_scanned: string | number }[]>`
      SELECT
        MAX(date)::text AS latest_date,
        COUNT(*) FILTER (WHERE date = (SELECT MAX(date) FROM core.mv_stock_daily)) AS stocks_scanned
      FROM core.mv_stock_daily
    `
    const latestDate = latestDateResult[0]?.latest_date ?? null
    const technicalIndicators = parsed.data.config.technicalIndicators ?? []
    const runsInUniverseMode = technicalIndicators.length === 0

    let screeningId = parsed.data.config.backtestId
    let summary: Record<string, unknown> = {}
    let dateRange: { from?: string; to?: string } | null = null
    let dbRows: ScreenerDbRow[] = [];

    if (runsInUniverseMode) {
      dbRows = await queryLatestSnapshotRows(parsed.data.config.filters ?? {})
      summary = {
        totalSignals: dbRows.length,
        uniqueStocks: dbRows.length,
        byDay: latestDate ? { [latestDate]: dbRows.length } : {},
        stocksScanned: Number(latestDateResult[0]?.stocks_scanned ?? 0),
        passedFilters: dbRows.length,
        passedFundamentals: dbRows.length,
      }
      dateRange = latestDate ? { from: latestDate, to: latestDate } : null
    } else {
      const railwayUrl = process.env.RAILWAY_URL || ""
      if (!railwayUrl) {
        return NextResponse.json(
          {
            error: "Server configuration error",
            details: "RAILWAY_URL environment variable is not configured.",
          },
          { status: 500 },
        )
      }
      const baseUrl = railwayUrl.startsWith("http") ? railwayUrl : `https://${railwayUrl}`

      const response = await fetch(`${baseUrl}/screen_stocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const details = await response.text();
        return NextResponse.json(
          {
            error: `API Error: ${response.status} ${response.statusText}`,
            details,
          },
          { status: response.status },
        )
      }

      const result = await response.json();
      const signals = result.signals || [];
      summary = result.summary || {};
      dateRange = result.dateRange || null;
      screeningId = result.screeningId || parsed.data.config.backtestId;

      const tickers = Array.from(new Set(signals.map((s: { ticker: string }) => s.ticker))) as string[];
      if (tickers.length > 0) {
        dbRows = await queryLatestSnapshotRows({ tickers })
      }
    }

    const rows = dbRows.map(normalizeScreenerRow)

    if (userId) {
      await incrementDailyQuotaUsage(userId, "screening")
    }

    return NextResponse.json({
      screeningId,
      latestDate,
      rows,
      summary,
      dateRange,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
