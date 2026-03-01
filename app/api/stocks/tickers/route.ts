import { NextResponse } from "next/server";
import { genkiClient } from "@/db/genki";

// In-memory cache — persists across requests, refreshes every 10 minutes
let cachedTickers: { value: string; label: string; sector: string; marketCap: number }[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type TickerRow = {
  stock_code: string;
  stock_name: string | null;
};

export async function GET() {
  try {
    const now = Date.now();

    // Serve from cache if fresh
    if (cachedTickers && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json({ tickers: cachedTickers });
    }

    const result = await genkiClient<TickerRow[]>`
      SELECT DISTINCT stock_code, stock_name
      FROM core.screener
      WHERE stock_code IS NOT NULL
      ORDER BY stock_code ASC
    `;

    const tickers = result.map((row) => ({
      value: row.stock_code,
      label: row.stock_name?.trim()
        ? `${row.stock_code} - ${row.stock_name.trim()}`
        : row.stock_code,
      sector: "Unknown",
      marketCap: 0,
    }));

    // Update cache
    cachedTickers = tickers;
    cacheTimestamp = now;

    return NextResponse.json({ tickers });
  } catch (error) {
    console.error("Error fetching tickers:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickers" },
      { status: 500 }
    );
  }
}
