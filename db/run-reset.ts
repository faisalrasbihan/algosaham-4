import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
});

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

async function resetDatabase() {
    console.log('🔄 Starting database reset...\n');

    const sql = postgres(process.env.DATABASE_URL!, {
        ssl: 'require',
        max: 1,
    });

    try {
        // Read the SQL file
        const sqlFilePath = path.join(__dirname, 'reset-database.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

        console.log('📝 Executing database reset SQL...\n');

        // Execute the entire SQL file
        await sql.unsafe(sqlContent);

        console.log('\n🎉 Database reset complete!');
        console.log('✅ All old tables dropped (indicators, notifications, trades, etc.)');
        console.log('✅ New clean schema created:');
        console.log('   - users table');
        console.log('   - strategies table (configHash required & unique)');
        console.log('   - subscriptions table');
        console.log('   - payments table');
        console.log('   - All indexes created\n');

    } catch (error) {
        console.error('❌ Error resetting database:', error);
        throw error;
    } finally {
        await sql.end();
    }
}

resetDatabase();
