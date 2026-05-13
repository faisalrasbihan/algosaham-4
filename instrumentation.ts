export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startInProcessStrategyCron } = await import("./lib/server/in-process-strategy-cron");
    startInProcessStrategyCron();
  }
}
