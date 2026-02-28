import { db } from "@/db";
import { users } from "@/db/schema";
import type { BacktestResult } from "@/lib/api";
import { eq, sql } from "drizzle-orm";

const TOP_HOLDING_COLORS = [
  "bg-blue-600",
  "bg-orange-500",
  "bg-green-600",
  "bg-purple-600",
  "bg-red-600",
] as const;

type ErrorPayload = {
  status: number;
  body: Record<string, unknown>;
};

type ErrorFactories = {
  config?: () => ErrorPayload;
  userNotFound?: () => ErrorPayload;
  quotaExceeded?: (context: { limit: number; used: number }) => ErrorPayload;
  railway?: (context: { status: number; statusText: string; details: string }) => ErrorPayload;
};

type RunBacktestWithQuotaOptions = {
  config: unknown;
  userId?: string | null;
  consumeQuota?: boolean;
  requireUser?: boolean;
  errors?: ErrorFactories;
};

type BacktestSignalLike = {
  ticker?: unknown;
  date?: unknown;
};

type BacktestSummaryLike = {
  totalReturn?: unknown;
  maxDrawdown?: unknown;
  winRate?: unknown;
  totalTrades?: unknown;
  sharpeRatio?: unknown;
};

type BacktestResultLike = {
  summary?: BacktestSummaryLike;
  signals?: BacktestSignalLike[];
  recentSignals?: {
    signals?: BacktestSignalLike[];
  };
};

export type BacktestMetadata = {
  totalReturn: number | null;
  maxDrawdown: number | null;
  successRate: number | null;
  totalTrades: number;
  totalStocks: number;
  sharpeRatio: number | null;
  qualityScore: string;
  topHoldings: { symbol: string; color?: string }[] | null;
};

export class BacktestExecutionError extends Error {
  readonly status: number;
  readonly body: Record<string, unknown>;

  constructor(payload: ErrorPayload) {
    super(typeof payload.body.error === "string" ? payload.body.error : `Backtest execution failed (${payload.status})`);
    this.name = "BacktestExecutionError";
    this.status = payload.status;
    this.body = payload.body;
  }
}

function fail(payload: ErrorPayload): never {
  throw new BacktestExecutionError(payload);
}

function defaultConfigError(): ErrorPayload {
  return {
    status: 500,
    body: {
      error: "Server configuration error",
      details: "RAILWAY_URL environment variable is not configured. Please set it in your .env file.",
    },
  };
}

function defaultUserNotFoundError(): ErrorPayload {
  return {
    status: 404,
    body: {
      error: "User not found",
    },
  };
}

function defaultQuotaExceededError({ limit, used }: { limit: number; used: number }): ErrorPayload {
  return {
    status: 403,
    body: {
      error: "Daily backtest limit reached",
      message: `You have used ${used}/${limit} backtests for today. Upgrade your plan for more.`,
    },
  };
}

function defaultRailwayError({
  status,
  statusText,
  details,
}: {
  status: number;
  statusText: string;
  details: string;
}): ErrorPayload {
  return {
    status,
    body: {
      error: `Railway error: ${status} ${statusText}`,
      details,
    },
  };
}

function getRailwayUrl(errors?: ErrorFactories): string {
  const rawUrl = process.env.RAILWAY_URL || "";
  if (!rawUrl) {
    fail(errors?.config?.() ?? defaultConfigError());
  }

  return rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
}

function toOptionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toInteger(value: unknown): number {
  const parsed = toOptionalNumber(value);
  return parsed === null ? 0 : Math.trunc(parsed);
}

function toTimestamp(value: unknown): number {
  if (typeof value !== "string") {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getSignalsForTotals(result?: BacktestResultLike | null): BacktestSignalLike[] {
  if (Array.isArray(result?.signals)) {
    return result.signals;
  }

  if (Array.isArray(result?.recentSignals?.signals)) {
    return result.recentSignals.signals;
  }

  return [];
}

function getSignalsForTopHoldings(result?: BacktestResultLike | null): BacktestSignalLike[] {
  if (Array.isArray(result?.recentSignals?.signals)) {
    return result.recentSignals.signals;
  }

  if (Array.isArray(result?.signals)) {
    return result.signals;
  }

  return [];
}

export function calculateQualityScore(sharpeRatio: number | null | undefined): string {
  if (sharpeRatio === null || sharpeRatio === undefined) {
    return "Unknown";
  }

  if (sharpeRatio < 1.0) {
    return "Poor";
  }

  if (sharpeRatio <= 2.0) {
    return "Good";
  }

  return "Excellent";
}

export function summarizeBacktestResult(result?: BacktestResultLike | null): BacktestMetadata {
  const totalReturn = toOptionalNumber(result?.summary?.totalReturn);
  const maxDrawdown = toOptionalNumber(result?.summary?.maxDrawdown);
  const successRate = toOptionalNumber(result?.summary?.winRate);
  const totalTrades = toInteger(result?.summary?.totalTrades);
  const sharpeRatio = toOptionalNumber(result?.summary?.sharpeRatio);

  const signalsForTotals = getSignalsForTotals(result);
  const totalStocks = new Set(
    signalsForTotals
      .map((signal) => (typeof signal.ticker === "string" ? signal.ticker : null))
      .filter((ticker): ticker is string => ticker !== null),
  ).size;

  const topHoldings: { symbol: string; color?: string }[] = [];
  const seenTickers = new Set<string>();
  const sortedSignals = [...getSignalsForTopHoldings(result)].sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));

  for (const signal of sortedSignals) {
    if (topHoldings.length >= 3) {
      break;
    }

    if (typeof signal.ticker !== "string" || seenTickers.has(signal.ticker)) {
      continue;
    }

    seenTickers.add(signal.ticker);
    topHoldings.push({
      symbol: signal.ticker,
      color: TOP_HOLDING_COLORS[topHoldings.length] ?? "bg-gray-600",
    });
  }

  return {
    totalReturn,
    maxDrawdown,
    successRate,
    totalTrades,
    totalStocks,
    sharpeRatio,
    qualityScore: calculateQualityScore(sharpeRatio),
    topHoldings: topHoldings.length > 0 ? topHoldings : null,
  };
}

export async function runBacktestWithQuota({
  config,
  userId,
  consumeQuota = true,
  requireUser = false,
  errors,
}: RunBacktestWithQuotaOptions): Promise<BacktestResult> {
  const railwayUrl = getRailwayUrl(errors);

  let quotaUserExists = false;

  if (userId && consumeQuota) {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      if (requireUser) {
        fail(errors?.userNotFound?.() ?? defaultUserNotFoundError());
      }
    } else {
      quotaUserExists = true;

      const limit = user.backtestLimit;
      const used = user.backtestUsedToday || 0;

      if (limit !== -1 && used >= limit) {
        fail(errors?.quotaExceeded?.({ limit, used }) ?? defaultQuotaExceededError({ limit, used }));
      }
    }
  }

  const response = await fetch(`${railwayUrl}/run_backtest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ config }),
  });

  if (!response.ok) {
    const details = await response.text();
    fail(
      errors?.railway?.({
        status: response.status,
        statusText: response.statusText,
        details,
      }) ?? defaultRailwayError({
        status: response.status,
        statusText: response.statusText,
        details,
      }),
    );
  }

  const result = (await response.json()) as BacktestResult;

  if (userId && consumeQuota && quotaUserExists) {
    try {
      await db
        .update(users)
        .set({ backtestUsedToday: sql`${users.backtestUsedToday} + 1` })
        .where(eq(users.clerkId, userId));
    } catch (error) {
      console.error("[BACKTEST] Failed to increment backtest usage:", error);
    }
  }

  return result;
}
