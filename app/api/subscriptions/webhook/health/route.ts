import { NextRequest, NextResponse } from "next/server";

/**
 * Simple health check endpoint for webhook
 * GET /api/subscriptions/webhook/health
 */
export async function GET(request: NextRequest) {
    return NextResponse.json({
        status: "ok",
        message: "Webhook endpoint is live",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
}
