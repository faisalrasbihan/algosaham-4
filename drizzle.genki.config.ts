import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

let url = (process.env.DB_GENKI_URL ?? process.env.GENKI_DB_URL ?? process.env.DB_GENKI ?? process.env.DATABASE_URL_GENKI);
if (url && url.includes("/railway")) {
  url = url.replace("/railway", "/frontend");
}
if (url && !url.includes("sslmode=require") && !url.includes("?ssl=true")) {
  url += url.includes("?") ? "&sslmode=require" : "?sslmode=require";
}

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: url!,
  },
} satisfies Config;
