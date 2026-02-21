const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });
const sql = postgres(process.env.DATABASE_URL_GENKI);
sql`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE column_name LIKE '%market%cap%' OR column_name LIKE '%sector%'`.then(res => { console.log(res); process.exit(0); }).catch(console.error);
