import { NextResponse } from "next/server";

import { refreshSubscribedActiveStrategies } from "@/lib/server/strategy-refresh";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      {
        success: false,
        error: "CRON_SECRET is not configured",
      },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const summary = await refreshSubscribedActiveStrategies();

  return NextResponse.json({
    success: summary.failed === 0,
    ...summary,
  });
}
