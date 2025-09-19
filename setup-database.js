const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database connection from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
}

console.log('🚀 Setting up Rentio Database Schema...\n');

async function setupDatabase() {
    const client = new Client({
        connectionString: databaseUrl,
    });

    try {
        // Connect to database
        await client.connect();
        console.log('✅ Connected to database\n');

        // Read the schema file
        const schemaPath = path.join(__dirname, 'sql', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute the schema
        console.log('🔄 Creating database tables...');
        await client.query(schema);
        console.log('✅ Database schema created successfully!\n');

        // Verify key tables were created
        console.log('🔍 Verifying schema installation...');
        const keyTables = [
            'users', 'user_roles', 'profiles', 'listings', 'bookings',
            'categories', 'businesses', 'payments', 'reviews'
        ];

        for (const table of keyTables) {
            const result = await client.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = '${table}'
            `);
            
            if (result.rows[0].count > 0) {
                console.log(`   ✅ ${table}`);
            } else {
                console.log(`   ❌ ${table} (missing)`);
            }
        }

        console.log('\n🎉 Database setup completed!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Set up your environment variables in .env.local');
        console.log('   2. Install dependencies: npm install');
        console.log('   3. Run the development server: npm run dev');
        console.log('\n🔗 Useful Commands:');
        console.log('   - View database: psql $DATABASE_URL');
        console.log('   - Run tests: npm test');
        console.log('   - Build application: npm run build');
        console.log('\n📚 Documentation:');
        console.log('   - SQL Migration Guide: SQL_MIGRATION_GUIDE.md');
        console.log('   - Database Schema: sql/schema.sql');
        console.log('   - Type Definitions: src/lib/types.ts');

    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Check if tables already exist
async function checkExistingTables() {
    const client = new Client({
        connectionString: databaseUrl,
    });

    try {
        await client.connect();
        
        const result = await client.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        `);
        
        return result.rows[0].count > 0;
    } finally {
        await client.end();
    }
}

// Main execution
async function main() {
    try {
        const tablesExist = await checkExistingTables();
        
        if (tablesExist) {
            console.log('⚠️  Database already contains tables. Schema setup skipped.');
            console.log('   If you need to reset the database, drop all tables first.\n');
        } else {
            console.log('📦 Database appears to be empty. Setting up fresh schema...\n');
            await setupDatabase();
        }
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        process.exit(1);
    }
}

main();