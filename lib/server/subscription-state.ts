import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getTierDbFields, type SubscriptionTier } from "@/lib/subscription-plans";

type UserRecord = typeof users.$inferSelect;
export type DailyQuotaKind = "analyze" | "screening" | "backtest" | "aiChat";

function isNewUtcDay(lastReset: Date | null | undefined, now: Date) {
  if (!lastReset) return true;
  return lastReset.toISOString().slice(0, 10) !== now.toISOString().slice(0, 10);
}

function buildDailyResetPatch(user: UserRecord, now: Date) {
  const patch: Record<string, unknown> = {};

  if (isNewUtcDay(user.analyzeLastReset, now)) {
    patch.analyzeUsedToday = 0;
    patch.analyzeLastReset = now;
  }

  if (isNewUtcDay(user.screeningLastReset, now)) {
    patch.screeningUsedToday = 0;
    patch.screeningLastReset = now;
  }

  if (isNewUtcDay(user.backtestLastReset, now)) {
    patch.backtestUsedToday = 0;
    patch.backtestLastReset = now;
  }

  if (isNewUtcDay(user.aiChatLastReset, now)) {
    patch.aiChatUsedToday = 0;
    patch.aiChatLastReset = now;
  }

  return patch;
}

function buildExpiredSubscriptionPatch(user: UserRecord, now: Date) {
  if (user.subscriptionTier === "ritel") {
    return {};
  }

  if (!user.subscriptionPeriodEnd) {
    return {};
  }

  if (user.subscriptionPeriodEnd.getTime() > now.getTime()) {
    return {};
  }

  return {
    ...getTierDbFields("ritel"),
    subscriptionStatus: "expired",
  };
}

export async function getUserWithSyncedSubscriptionState(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    return null;
  }

  const now = new Date();
  const patch = {
    ...buildExpiredSubscriptionPatch(user, now),
    ...buildDailyResetPatch(user, now),
  };

  if (Object.keys(patch).length === 0) {
    return user;
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      ...patch,
      updatedAt: now,
    })
    .where(eq(users.clerkId, userId))
    .returning();

  return updatedUser ?? user;
}

export async function incrementDailyQuotaUsage(userId: string, quota: DailyQuotaKind) {
  switch (quota) {
    case "analyze":
      await db
        .update(users)
        .set({ analyzeUsedToday: sql`${users.analyzeUsedToday} + 1` })
        .where(eq(users.clerkId, userId));
      return;
    case "screening":
      await db
        .update(users)
        .set({ screeningUsedToday: sql`${users.screeningUsedToday} + 1` })
        .where(eq(users.clerkId, userId));
      return;
    case "backtest":
      await db
        .update(users)
        .set({ backtestUsedToday: sql`${users.backtestUsedToday} + 1` })
        .where(eq(users.clerkId, userId));
      return;
    case "aiChat":
      await db
        .update(users)
        .set({ aiChatUsedToday: sql`${users.aiChatUsedToday} + 1` })
        .where(eq(users.clerkId, userId));
      return;
  }
}

export function getDailyQuotaSnapshot(user: UserRecord, quota: DailyQuotaKind) {
  switch (quota) {
    case "analyze":
      return { limit: user.analyzeLimit, used: user.analyzeUsedToday || 0 };
    case "screening":
      return { limit: user.screeningLimit, used: user.screeningUsedToday || 0 };
    case "backtest":
      return { limit: user.backtestLimit, used: user.backtestUsedToday || 0 };
    case "aiChat":
      return { limit: user.aiChatLimit || 0, used: user.aiChatUsedToday || 0 };
  }
}

export async function setUserTier(userId: string, tier: SubscriptionTier, extras?: Partial<UserRecord>) {
  const now = new Date();
  const [updatedUser] = await db
    .update(users)
    .set({
      ...getTierDbFields(tier),
      ...extras,
      updatedAt: now,
    })
    .where(eq(users.clerkId, userId))
    .returning();

  return updatedUser ?? null;
}
