import type { BillingInterval, PaidSubscriptionTier } from "@/lib/subscription-plans";

type SubscriptionOrderDetails = {
  planType: PaidSubscriptionTier;
  billingInterval: BillingInterval;
  userId: string;
};

export type ParsedSubscriptionOrder = {
  planType: PaidSubscriptionTier;
  billingInterval?: BillingInterval;
  userId: string;
};

function getPlanCode(planType: PaidSubscriptionTier) {
  return planType === "suhu" ? "S" : "B";
}

function getBillingCode(billingInterval: BillingInterval) {
  return billingInterval === "yearly" ? "Y" : "M";
}

function getShortUserId(userId: string) {
  return userId.replace(/^user_/, "").slice(0, 8);
}

export function createSubscriptionOrderId(
  details: SubscriptionOrderDetails,
  timestamp = Date.now(),
) {
  return [
    "AS",
    getPlanCode(details.planType),
    getBillingCode(details.billingInterval),
    getShortUserId(details.userId),
    timestamp,
  ].join("-");
}

export function createMidtransSubscriptionName(details: SubscriptionOrderDetails) {
  return [
    "AS",
    getPlanCode(details.planType),
    getBillingCode(details.billingInterval),
    getShortUserId(details.userId),
  ].join("-");
}

export function parseSubscriptionOrderId(orderId: string): ParsedSubscriptionOrder | null {
  const parts = orderId.split("-");
  if (parts.length < 4 || parts[0] !== "AS") return null;

  const planType = parts[1] === "S" ? "suhu" : parts[1] === "B" ? "bandar" : null;
  if (!planType) return null;

  const billingCode = parts[2];
  if (billingCode === "M" || billingCode === "Y") {
    const userId = parts[3];
    if (!userId) return null;

    return {
      planType,
      billingInterval: billingCode === "Y" ? "yearly" : "monthly",
      userId,
    };
  }

  // Legacy order IDs used AS-{PLAN}-{USER}-{TIMESTAMP}. Keep parsing them so
  // pending payments created before this change can still settle correctly.
  return {
    planType,
    userId: parts[2],
  };
}
