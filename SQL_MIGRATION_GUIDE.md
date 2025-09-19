# SQL Migration Guide

This guide provides instructions for converting Prisma-based code to SQL-based queries in the Rentio application.

## Quick Conversion Patterns

### 1. Import Changes
**Before:**
```typescript
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
```

**After:**
```typescript
import { query, findOne, insert, update, remove, count } from '@/lib/db'
import { Role } from '@/lib/types'
```

### 2. Basic Queries
**Before:**
```typescript
const user = await prisma.user.findUnique({
  where: { email: session.user.email }
})
```

**After:**
```typescript
const user = await findOne('users', { email: session.user.email })
```

### 3. Find Many with Filtering
**Before:**
```typescript
const listings = await prisma.listing.findMany({
  where: { status: 'ACTIVE' },
  orderBy: { created_at: 'desc' },
  take: 10
})
```

**After:**
```typescript
const listings = await query(`
  SELECT * FROM listings 
  WHERE status = 'ACTIVE' 
  ORDER BY created_at DESC 
  LIMIT 10
`)
```

### 4. Create Records
**Before:**
```typescript
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'Test User'
  }
})
```

**After:**
```typescript
const user = await insert('users', {
  email: 'test@example.com',
  name: 'Test User'
})
```

### 5. Update Records
**Before:**
```typescript
const user = await prisma.user.update({
  where: { id: userId },
  data: { name: 'New Name' }
})
```

**After:**
```typescript
const user = await update('users', userId, { name: 'New Name' })
```

### 6. Include Relations
**Before:**
```typescript
const booking = await prisma.booking.findUnique({
  where: { id: bookingId },
  include: {
    listing: true,
    renter: true,
    payments: true
  }
})
```

**After:**
```typescript
const booking = await queryOne(`
  SELECT 
    b.*,
    l.* as listing,
    r.* as renter,
    p.* as payments
  FROM bookings b
  LEFT JOIN listings l ON b.listing_id = l.id
  LEFT JOIN users r ON b.renter_id = r.id
  LEFT JOIN payments p ON b.id = p.booking_id
  WHERE b.id = $1
`, [bookingId])
```

### 7. Count Records
**Before:**
```typescript
const count = await prisma.booking.count({
  where: { status: 'ACTIVE' }
})
```

**After:**
```typescript
const count = await count('bookings', { status: 'ACTIVE' })
```

### 8. Aggregations
**Before:**
```typescript
const stats = await prisma.booking.groupBy({
  by: ['status'],
  _count: { status: true },
  _sum: { total_amount: true }
})
```

**After:**
```typescript
const stats = await query(`
  SELECT 
    status,
    COUNT(*) as count,
    SUM(total_amount) as total_amount
  FROM bookings
  GROUP BY status
`)
```

## Database Helper Functions

### Available Functions
- `query<T>(queryText: string, params?: any[])` - Execute any SQL query
- `queryOne<T>(queryText: string, params?: any[])` - Get single row
- `insert(table: string, data: any)` - Insert record
- `update(table: string, id: string, data: any)` - Update record
- `remove(table: string, id: string)` - Delete record
- `find(table: string, where?: any, options?: FindOptions)` - Find records
- `findOne(table: string, where: any)` - Find single record
- `count(table: string, where?: any)` - Count records

## SQL Schema

The database schema has been converted to native SQL and is available in:
- `sql/schema.sql` - Complete SQL schema with all tables and indexes
- `src/lib/schema.ts` - Drizzle ORM schema definitions

## Type Safety

All Prisma types have been replaced with TypeScript interfaces in `src/lib/types.ts`. Enum values are available as TypeScript enums.

## Security

All queries use parameterized inputs to prevent SQL injection. Never use string interpolation for user inputs.

## Migration Steps

1. Replace Prisma imports with SQL utility imports
2. Convert Prisma query syntax to SQL queries
3. Update type references from Prisma to custom types
4. Test each endpoint thoroughly
5. Remove `@prisma/client` and `prisma` from package.json

## File Conversion Priority

1. **High Priority**: Auth-related files (`src/lib/auth.ts`, middleware)
2. **Medium Priority**: Core API routes (bookings, listings, users)
3. **Low Priority**: Secondary features (notifications, reviews, kyc)

Use the patterns above to systematically convert remaining files.