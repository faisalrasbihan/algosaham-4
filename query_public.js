const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });
const sql = postgres(process.env.DATABASE_URL_GENKI);
sql`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`.then(res => { console.log(res); process.exit(0); }).catch(console.error);
