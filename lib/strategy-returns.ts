function toFinitePercent(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function calculateReturnSinceSubscription(
  currentReturnValue: unknown,
  snapshotReturnValue: unknown,
): number | null {
  const currentReturn = toFinitePercent(currentReturnValue);
  const snapshotReturn = toFinitePercent(snapshotReturnValue);

  if (currentReturn === null || snapshotReturn === null) {
    return null;
  }

  const snapshotGrowth = 1 + snapshotReturn / 100;

  if (snapshotGrowth === 0) {
    return null;
  }

  return Number((((1 + currentReturn / 100) / snapshotGrowth - 1) * 100).toFixed(2));
}
