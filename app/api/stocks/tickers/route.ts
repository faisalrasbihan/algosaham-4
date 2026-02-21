import { NextResponse } from "next/server";
import { genkiClient } from "@/db/genki";

export async function GET() {
  try {
    const result = await genkiClient`
      SELECT 
        s.stock_code, 
        s.stock_name,
        dfr.sector
      FROM dim_stock s
      LEFT JOIN dim_financial_ratio dfr 
        ON s.stock_code = dfr.stock_code AND dfr.is_current = true
      WHERE s.is_current = true
      ORDER BY s.stock_code ASC
    `;

    const tickers = result.map((row) => ({
      value: row.stock_code,
      label: `${row.stock_code} - ${row.stock_name}`,
      sector: row.sector || 'Unknown',
      marketCap: 0,
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

