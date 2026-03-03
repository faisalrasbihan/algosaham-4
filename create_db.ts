import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  const genkiUrl = process.env.GENKI_DB_URL!;
  
  // Connect to the default "railway" db to issue the CREATE DATABASE command
  const sql = postgres(genkiUrl, {
    ssl: 'require',
    max: 1
  });

  try {
    console.log("Creating new database 'frontend' on Genki instance...");
    await sql.unsafe('CREATE DATABASE frontend;');
    console.log("Database 'frontend' created successfully!");
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log("Database 'frontend' already exists.");
    } else {
      console.error("Failed to create database:", error);
    }
  } finally {
    await sql.end();
  }
}
run();
