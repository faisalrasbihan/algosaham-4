import postgres from "postgres";

if (!process.env.GENKI_DB_URL) {
  throw new Error("GENKI_DB_URL is not set");
}

// Separate connection for GENKI database
export const genkiClient = postgres(process.env.GENKI_DB_URL, {
  ssl: 'require',
  max: 1,
});

