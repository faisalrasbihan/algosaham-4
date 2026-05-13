import "server-only";

const CRON_HOUR_UTC = 11;
const CRON_MINUTE_UTC = 0;
const CHECK_INTERVAL_MS = 60_000;

type StrategyCronGlobal = typeof globalThis & {
  __algosahamStrategyCronStarted?: boolean;
  __algosahamStrategyCronLastRunKey?: string;
};

function isEnabled() {
  return process.env.IN_PROCESS_STRATEGY_CRON_ENABLED === "true";
}

function getEndpointUrl() {
  if (process.env.STRATEGY_REFRESH_CRON_URL) {
    return process.env.STRATEGY_REFRESH_CRON_URL;
  }

  if (process.env.APP_URL) {
    return `${process.env.APP_URL.replace(/\/$/, "")}/api/cron/update-strategy-returns`;
  }

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/cron/update-strategy-returns`;
  }

  return null;
}

function getRunKey(now: Date) {
  return now.toISOString().slice(0, 10);
}

function shouldRun(now: Date) {
  const day = now.getUTCDay();

  return (
    day >= 1 &&
    day <= 5 &&
    now.getUTCHours() === CRON_HOUR_UTC &&
    now.getUTCMinutes() === CRON_MINUTE_UTC
  );
}

async function runStrategyRefresh() {
  const endpointUrl = getEndpointUrl();
  const cronSecret = process.env.CRON_SECRET;

  if (!endpointUrl || !cronSecret) {
    console.error("[strategy-cron] Missing STRATEGY_REFRESH_CRON_URL/APP_URL/RAILWAY_PUBLIC_DOMAIN or CRON_SECRET");
    return;
  }

  const startedAt = new Date().toISOString();

  try {
    const response = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "User-Agent": "algosaham-in-process-strategy-cron",
      },
    });
    const text = await response.text();

    console.log("[strategy-cron] Strategy refresh finished", {
      ok: response.ok,
      status: response.status,
      startedAt,
      finishedAt: new Date().toISOString(),
      response: text.slice(0, 2000),
    });
  } catch (error) {
    console.error("[strategy-cron] Strategy refresh request failed", {
      startedAt,
      finishedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function checkSchedule() {
  const globalState = globalThis as StrategyCronGlobal;
  const now = new Date();

  if (!shouldRun(now)) {
    return;
  }

  const runKey = getRunKey(now);

  if (globalState.__algosahamStrategyCronLastRunKey === runKey) {
    return;
  }

  globalState.__algosahamStrategyCronLastRunKey = runKey;
  void runStrategyRefresh();
}

export function startInProcessStrategyCron() {
  if (!isEnabled()) {
    return;
  }

  const globalState = globalThis as StrategyCronGlobal;

  if (globalState.__algosahamStrategyCronStarted) {
    return;
  }

  globalState.__algosahamStrategyCronStarted = true;

  console.log("[strategy-cron] In-process strategy refresh cron enabled", {
    schedule: "0 11 * * 1-5 UTC",
  });

  checkSchedule();
  const timer = setInterval(checkSchedule, CHECK_INTERVAL_MS);
  timer.unref?.();
}
