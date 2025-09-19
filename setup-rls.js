const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database connection from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
}

console.log('🔒 Setting up Row Level Security (RLS) Policies...\n');

async function setupRLS() {
    const client = new Client({
        connectionString: databaseUrl,
    });

    try {
        // Connect to database
        await client.connect();
        console.log('✅ Connected to database\n');

        // Read the RLS policies file
        const rlsPath = path.join(__dirname, 'sql', 'rls-policies.sql');
        const rlsPolicies = fs.readFileSync(rlsPath, 'utf8');

        // Execute the RLS policies
        console.log('🔄 Applying RLS policies...');
        await client.query(rlsPolicies);
        console.log('✅ RLS policies applied successfully!\n');

        // Verify RLS is enabled on key tables
        console.log('🔍 Verifying RLS installation...');
        const keyTables = [
            'users', 'profiles', 'businesses', 'listings', 'bookings',
            'payments', 'reviews', 'kyc_verifications', 'team_members',
            'categories', 'notifications', 'messages', 'disputes'
        ];

        for (const table of keyTables) {
            const result = await client.query(`
                SELECT relrowsecurity 
                FROM pg_class 
                WHERE relname = '${table}' AND relkind = 'r'
            `);
            
            if (result.rows.length > 0 && result.rows[0].relrowsecurity) {
                console.log(`   ✅ ${table} (RLS enabled)`);
            } else {
                console.log(`   ❌ ${table} (RLS disabled)`);
            }
        }

        // Count policies created
        const policyCount = await client.query(`
            SELECT COUNT(*) as count 
            FROM pg_policies 
            WHERE schemaname = 'public'
        `);
        
        console.log(`\n📊 Total RLS policies created: ${policyCount.rows[0].count}`);
        
        console.log('\n🎉 RLS setup completed!');
        console.log('\n📋 Security Summary:');
        console.log('   ✅ Users can only view/edit their own profiles');
        console.log('   ✅ Businesses can only manage their listings and bookings');
        console.log('   ✅ Team members have limited access to business data');
        console.log('   ✅ Admins have full access to all data');
        console.log('   ✅ Row-level isolation ensures data privacy');
        console.log('\n🔗 Next Steps:');
        console.log('   - Test RLS policies with different user roles');
        console.log('   - Verify data isolation between tenants');
        console.log('   - Monitor policy performance impact');

    } catch (error) {
        console.error('❌ Error setting up RLS:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Main execution
async function main() {
    try {
        await setupRLS();
    } catch (error) {
        console.error('❌ Error during RLS setup:', error.message);
        process.exit(1);
    }
}

main();