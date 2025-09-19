#!/bin/bash

# Database Setup Script for Rentio Application
# This script sets up the PostgreSQL database with the complete schema

set -e

echo "🚀 Setting up Rentio Database Schema..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is required"
    exit 1
fi

# Extract database connection details from DATABASE_URL
# Example: postgresql://username:password@localhost:5432/database_name
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\([^@]*\)@.*/\1/p')

echo "📊 Database Details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Name: $DB_NAME"
echo "   User: $DB_USER"
echo ""

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
                console.log('✅ Schema executed successfully');
                return client.end();
            })
            .catch(err => {
                console.error('❌ Error executing schema:', err);
                process.exit(1);
            });
        "
    fi
}

# Function to check if a table exists
table_exists() {
    local table_name="$1"
    
    if command -v psql >/dev/null 2>&1; then
        local count=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table_name';")
        [ "$count" -gt 0 ]
    else
        # For environments without psql, assume table doesn't exist
        false
    fi
}

# Check if database exists and create if it doesn't
echo "🔍 Checking database existence..."
if ! table_exists "users"; then
    echo "📦 Database appears to be empty. Setting up fresh schema..."
    
    # Execute the main schema
    execute_sql "sql/schema.sql"
    
    echo "✅ Database schema created successfully!"
else
    echo "⚠️  Database already contains tables. Schema setup skipped."
    echo "   If you need to reset the database, drop all tables first."
fi

# Verify key tables were created
echo "🔍 Verifying schema installation..."
KEY_TABLES=("users" "user_roles" "profiles" "listings" "bookings" "categories" "businesses" "payments" "reviews")

for table in "${KEY_TABLES[@]}"; do
    if table_exists "$table"; then
        echo "   ✅ $table"
    else
        echo "   ❌ $table (missing)"
    fi
done

echo ""
echo "🎉 Database setup completed!"
echo ""
echo "📋 Next Steps:"
echo "   1. Set up your environment variables in .env.local"
echo "   2. Install dependencies: npm install"
echo "   3. Run the development server: npm run dev"
echo ""
echo "🔗 Useful Commands:"
echo "   - View database: psql \$DATABASE_URL"
echo "   - Run tests: npm test"
echo "   - Build application: npm run build"
echo ""
echo "📚 Documentation:"
echo "   - SQL Migration Guide: SQL_MIGRATION_GUIDE.md"
echo "   - Database Schema: sql/schema.sql"
echo "   - Type Definitions: src/lib/types.ts"