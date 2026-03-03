import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

import { config } from "dotenv";
config({ path: ".env.local" });

if (!process.env.FRONTEND_DB_URL) {
  throw new Error("FRONTEND_DB_URL is not set");
}

// For query purposes - with SSL support for Railway/hosted databases
const queryClient = postgres(process.env.FRONTEND_DB_URL, {
  ssl: 'require', // Railway PostgreSQL requires SSL
  max: 1, // Limit connections for serverless
});
export const db = drizzle(queryClient, { schema });

