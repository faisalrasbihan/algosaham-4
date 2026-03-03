import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from './db/schema'; // Ensure you have this file!

config({ path: '.env.local' });
config();

const performMigration = async () => {
  const url = process.env.GENKI_DB_URL;
  if (!url) throw new Error("GENKI_DB_URL missing");

  console.log("Connecting using unproxied client...");

  // Use connection pooling specifically tailored for Railway
  const client = postgres(url, {
      ssl: 'require',
      max: 1 // Crucial for connection pooling through Railway proxies.
  });

  const db = drizzle(client, { schema });
  
  try {
     const schemaDiff = await client`SELECT 1`;
     console.log("Ping successful. To run schema push, use 'npm run db:push' modified for genki, or npx drizzle-kit migrate --config=drizzle.genki.config.ts if you have a drizzle/ folder");
     await client.end();
  } catch (err) {
      console.log('Error initializing connection', err);
  }
};

performMigration();
