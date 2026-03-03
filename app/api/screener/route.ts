import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { genkiClient } from "@/db/genki"

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

function buildWhereClause(config: z.infer<typeof screenerRequestSchema>["config"]) {
  const conditions: string[] = ["date = (SELECT MAX(date) FROM core.mv_stock_daily)"]
  const params: Array<string | number | boolean | string[]> = []

  const pushCondition = (sql: string, value?: string | number | boolean | string[]) => {
    if (value !== undefined) {
      params.push(value)
      conditions.push(sql.replace("?", `$${params.length}`))
    } else {
      conditions.push(sql)
    }
  }

  const tickers = config.filters.tickers?.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean)
  if (tickers?.length) {
    pushCondition("stock_code = ANY(?::text[])", tickers)
  }

  const marketCap = config.filters.marketCap?.map((value) => value.trim().toLowerCase()).filter(Boolean)
  if (marketCap?.length) {
    pushCondition("market_cap_group = ANY(?::text[])", marketCap)
  }

  const sectors = config.filters.sectors?.map((value) => value.trim()).filter(Boolean)
  if (sectors?.length) {
    pushCondition("sector = ANY(?::text[])", sectors)
  }

  if (typeof config.filters.syariah === "boolean") {
    pushCondition("is_syariah = ?", config.filters.syariah ? 1 : 0)
  }

  if (typeof config.filters.minDailyValue === "number") {
    pushCondition("valuasi >= ?", config.filters.minDailyValue)
  }

  const fundamentalColumnMap: Record<string, string> = {
    PE_RATIO: "pe_ratio",
    PBV: "pbv",
    ROE: "roe",
    ROA: "roa",
    DE_RATIO: "der",
    NPM: "npm",
    EPS: "eps",
  }

  for (const indicator of config.fundamentalIndicators) {
    const column = fundamentalColumnMap[indicator.type]
    if (!column) continue

    if (typeof indicator.min === "number") {
      pushCondition(`${column} >= ?`, indicator.min)
    }

    if (typeof indicator.max === "number") {
      pushCondition(`${column} <= ?`, indicator.max)
    }
  }

  return {
    whereClause: conditions.join("\n          AND "),
    params,
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const stocksScanned = toOptionalInteger(latestDateResult[0]?.stocks_scanned) ?? 0

    const { whereClause, params } = buildWhereClause(parsed.data.config)
    const dbRows = await genkiClient.unsafe<ScreenerDbRow[]>(
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
        WHERE ${whereClause}
        ORDER BY stock_code ASC
      `,
      params,
    )

    const rows = dbRows.map(normalizeScreenerRow)

    return NextResponse.json({
      screeningId: parsed.data.config.backtestId,
      latestDate,
      rows,
      summary: {
        totalSignals: rows.length,
        uniqueStocks: rows.length,
        byDay: latestDate ? { [latestDate]: rows.length } : {},
        stocksScanned,
        passedFilters: rows.length,
        passedFundamentals: rows.length,
      },
      dateRange: latestDate ? { from: latestDate, to: latestDate } : null,
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
