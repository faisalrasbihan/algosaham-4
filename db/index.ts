import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// For query purposes - with SSL support for Railway/hosted databases
const queryClient = postgres(process.env.DATABASE_URL, {
  ssl: 'require', // Railway PostgreSQL requires SSL
  max: 1, // Limit connections for serverless
});
export const db = drizzle(queryClient, { schema });

