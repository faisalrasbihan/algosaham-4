import { NextResponse } from "next/server";
import { genkiClient } from "@/db/genki";

export async function GET() {
  try {
    // Query dim_stock table for current stocks only
    const result = await genkiClient`
      SELECT stock_code, stock_name
      FROM dim_stock
      WHERE is_current = true
      ORDER BY stock_code ASC
    `;

    const tickers = result.map((row) => ({
      value: row.stock_code,
      label: `${row.stock_code} - ${row.stock_name}`,
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

