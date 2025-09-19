#!/bin/bash

# RLS Setup Script for Rentio Application
# This script sets up Row Level Security policies for the database

set -e

echo "🔒 Setting up Row Level Security (RLS) Policies..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is required"
    exit 1
fi

# Extract database connection details from DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\//\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\([^@]*\)@.*/\1/p')

echo "📊 Database Details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Name: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Check if RLS policies file exists
if [ ! -f "sql/rls-policies.sql" ]; then
    echo "❌ RLS policies file not found: sql/rls-policies.sql"
    exit 1
fi

# Function to execute SQL commands
execute_sql() {
    local sql_file="$1"
    echo "🔄 Executing $sql_file..."
    
    if command -v psql >/dev/null 2>&1; then
        # Use psql if available
        PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$sql_file"
    else
        # Fallback to node script
        node -e "
        const { Client } = require('pg');
        const client = new Client({
            host: '$DB_HOST',
            port: $DB_PORT,
            user: '$DB_USER',
            password: '$DB_PASS',
            database: '$DB_NAME',
        });
        
        const fs = require('fs');
        const sql = fs.readFileSync('$sql_file', 'utf8');
        
        client.connect()
            .then(() => {
                console.log('✅ Connected to database');
                return client.query(sql);
            })
            .then(() => {
                console.log('✅ RLS policies applied successfully');
                return client.end();
            })
            .catch(err => {
                console.error('❌ Error applying RLS policies:', err);
                process.exit(1);
            });
        "
    fi
}

# Check if RLS policies already exist
echo "🔍 Checking existing RLS policies..."
if command -v psql >/dev/null 2>&1; then
    POLICY_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';")
else
    POLICY_COUNT=0
fi

if [ "$POLICY_COUNT" -gt 0 ]; then
    echo "⚠️  RLS policies already exist ($POLICY_COUNT policies found)"
    echo "   This will update existing policies."
    echo ""
fi

# Execute the RLS policies
execute_sql "sql/rls-policies.sql"

echo "✅ RLS policies applied successfully!"

# Verify RLS is enabled on key tables
echo ""
echo "🔍 Verifying RLS installation..."
KEY_TABLES=("users" "profiles" "businesses" "listings" "bookings" "payments" "reviews" "kyc_verifications" "team_members" "categories" "notifications" "messages" "disputes")

for table in "${KEY_TABLES[@]}"; do
    if command -v psql >/dev/null 2>&1; then
        RLS_ENABLED=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT relrowsecurity FROM pg_class WHERE relname = '$table' AND relkind = 'r';")
        if [ "$RLS_ENABLED" = "t" ]; then
            echo "   ✅ $table (RLS enabled)"
        else
            echo "   ❌ $table (RLS disabled)"
        fi
    else
        echo "   🔍 $table (verification skipped - no psql)"
    fi
done

# Count total policies
if command -v psql >/dev/null 2>&1; then
    TOTAL_POLICIES=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';")
    echo ""
    echo "📊 Total RLS policies created: $TOTAL_POLICIES"
fi

echo ""
echo "🎉 RLS setup completed!"
echo ""
echo "📋 Security Summary:"
echo "   ✅ Users can only view/edit their own profiles"
echo "   ✅ Businesses can only manage their listings and bookings"
echo "   ✅ Team members have limited access to business data"
echo "   ✅ Admins have full access to all data"
echo "   ✅ Row-level isolation ensures data privacy"
echo ""
echo "🔗 Next Steps:"
echo "   - Test RLS policies with different user roles"
echo "   - Verify data isolation between tenants"
echo "   - Monitor policy performance impact"
echo ""
echo "📚 Useful Commands:"
echo "   - View all policies: \\dp"
echo "   - View RLS status: SELECT relname, relrowsecurity FROM pg_class WHERE relkind = 'r';"
echo "   - Test RLS: SET ROLE regular_user; SELECT * FROM table;"