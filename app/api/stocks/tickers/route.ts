import { NextResponse } from "next/server";
import { genkiClient } from "@/db/genki";

export async function GET() {
  try {
    // Query dim_stock table for current stocks and market cap
    const result = await genkiClient`
      SELECT 
        s.stock_code, 
        s.stock_name,
        fr.sector,
        (
          SELECT d.close * d.listed_shares 
          FROM fact_stock_daily d 
          WHERE d.stock_code = s.stock_code 
          ORDER BY d.date DESC 
          LIMIT 1
        ) as market_cap
      FROM dim_stock s
      LEFT JOIN dim_financial_ratio fr ON s.stock_code = fr.stock_code AND fr.is_current = true
      WHERE s.is_current = true
      ORDER BY s.stock_code ASC
    `;

    const tickers = result.map((row) => ({
      value: row.stock_code,
      label: `${row.stock_code} - ${row.stock_name}`,
      sector: row.sector,
      marketCap: row.market_cap ? Number(row.market_cap) : 0,
    }));

    return NextResponse.json({ tickers });
  } catch (error) {
    console.error("Error fetching tickers:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickers" },
      { status: 500 }
    );
  }
}

