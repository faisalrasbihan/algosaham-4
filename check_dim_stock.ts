import { genkiClient } from "@/db/genki";

async function query() {
    const result = await genkiClient`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE column_name LIKE '%market%cap%' OR column_name LIKE '%sector%'
  `;
    console.log(result);
    process.exit(0);
}

query();
