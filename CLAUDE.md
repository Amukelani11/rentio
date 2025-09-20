# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rentio is a peer-to-peer and business rental marketplace for South Africa built with Next.js 14. The platform allows users to rent items from neighbors and local businesses, featuring secure payments, KYC verification, and role-based access control.

## Development Commands

### Core Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Database Operations
- Use direct SQL queries with Supabase JS client (createClient from '@supabase/supabase-js')
- Database schema migrations should be managed via SQL migration files in `/sql` directory
- Database connection uses Supabase JS client instead of Drizzle (Drizzle has been removed)
- Database utilities are located in `src/lib/db.ts` (shim that throws errors for Drizzle usage)
- **Note**: The SQL_MIGRATION_GUIDE.md references Drizzle helper functions that have been removed. Use direct Supabase JS client calls instead.

### Database Setup
- Use `node setup-database.js` to initialize database schema
- Use `node setup-rls.js` to configure Row Level Security policies
- Schema is defined in `sql/schema.sql`
- RLS policies are defined in `sql/rls-policies.sql`
- Database utilities throw errors to prevent Drizzle usage (see `src/lib/db.ts`)

## Technology Stack

### Core Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with direct SQL queries
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS

### Key Libraries
- **UI Components**: Radix UI + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Maps**: Leaflet + React Leaflet
- **Payments**: Stripe integration
- **Email**: Nodemailer
- **SMS**: Twilio
- **Image Processing**: Sharp
- **Charts**: Recharts

## Architecture

### User Roles & Permissions
The system uses role-based access control with four main roles:
- `CUSTOMER` - Can rent items
- `INDIVIDUAL_LISTER` - Can list personal items for rent
- `BUSINESS_LISTER` - Can manage business listings and inventory
- `ADMIN` - Full system access

Role management is handled through middleware and auth utilities in `src/lib/auth.ts`.

### Database Schema
The database schema (defined in `sql/schema.sql`) includes tables for:
- **User Management**: Users, User Roles, Profiles, Addresses, KYC Verifications
- **Business**: Businesses, Team Members, Packages, Package Items
- **Listings**: Listings, Categories, Inventory Items
- **Transactions**: Bookings, Booking Extensions, Payments, Payouts
- **Communication**: Conversations, Messages, Reviews, Disputes
- **Content**: Notifications, Saved Searches

Database queries use direct SQL with Supabase JS client for security. The schema includes PostgreSQL enums for type safety and comprehensive indexes for performance. Key features include:
- Role-based access control with 4 user roles
- Booking workflow with status tracking
- Payment processing with escrow and deposits
- KYC verification system
- Geographic search capabilities
- Business team management

### File Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication pages (signin, signup)
│   ├── dashboard/      # User dashboard pages by role
│   ├── admin/          # Admin management pages
│   ├── api/           # API routes
│   └── onboarding/    # User onboarding flow
├── components/         # React components
│   ├── ui/            # shadcn/ui base components
│   ├── layout/        # Layout components
│   └── forms/         # Form components
└── lib/               # Utility libraries
    ├── auth.ts        # Authentication utilities
    ├── db.ts          # Database shim (Drizzle removed)
    └── types.ts       # TypeScript type definitions
```

### Authentication Flow
1. User authenticates via Supabase Auth
2. Route protection is handled by middleware.ts with role-based access control
3. Server components get auth user via `getAuthUser()` in `src/lib/auth.ts`
4. User onboarding is enforced before accessing protected routes via middleware
5. Client components use auth context for user state
6. **Important**: The middleware.ts file checks `onboarding_progress` table and redirects users to complete onboarding if not finished

### Auth System Details
- User creation syncs Supabase auth with local database
- Role management via user metadata in Supabase auth
- Permission checking utilities in `src/lib/auth.ts`
- Support for multi-role users
- Admin status via `profiles.is_admin` field

### UI Component System
- Built on Radix UI primitives
- Styled with Tailwind CSS and CVA (Class Variance Authority)
- Components in `src/components/ui/` follow shadcn/ui patterns
- Theme includes custom color scheme with coral primary color

### Payment Processing
- Multiple payment providers (Stripe, Yoco, PayFast, PayStack)
- Escrow system for security
- Deposit handling for rentals
- Payout system for listers

### Geographic Features
- Location-based search and filtering
- Leaflet maps for item locations
- Delivery radius settings for businesses
- South African address format support

## Key Business Logic

### Booking Flow
1. User searches and finds items
2. Booking request with dates and quantity
3. Payment processing with deposit hold
4. Confirmation and communication
5. Check-in/out process
6. Review and dispute resolution

### Business Features
- Multi-user team management
- Inventory tracking
- Package deals for multiple items
- Business hours and delivery settings
- Staff permissions and roles

### KYC Verification
- Identity verification for users
- Document upload and review
- Admin approval workflow
- Status tracking in user profiles

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token

## Development Notes

- Uses Next.js App Router with server components
- TypeScript strict mode enabled
- Database operations use Supabase JS client (Drizzle has been removed)
- SQL schema files in `/sql` are the source of truth for database structure
- All API routes follow REST conventions in `src/app/api/`
- Component styling uses Tailwind utility classes
- Authentication is handled server-side where possible
- Role-based route protection is handled by middleware.ts with onboarding enforcement
- Onboarding flow is enforced for new users
- PostgreSQL triggers handle updated_at timestamps automatically
- Booking numbers are auto-generated with format 'RNTO-YYYYMMDD-XXXX'

## Important Architecture Decisions

- **Database**: Moved from Drizzle ORM to direct Supabase JS client for simplicity
- **Authentication**: Supabase Auth with custom user/role management via metadata
- **Authorization**: Role-based route protection via middleware.ts with onboarding enforcement
- **State Management**: Server components where possible, client context where needed
- **Forms**: React Hook Form + Zod validation with consistent error handling
- **UI**: Radix UI primitives with Tailwind CSS and custom coral theme
- **Payments**: Multiple payment providers (Stripe, Yoco, PayFast, PayStack) with escrow system
- **Database Migration**: Conversion from Prisma to raw SQL (see SQL_MIGRATION_GUIDE.md)
- **Middleware**: Comprehensive route protection with onboarding flow enforcement
- **Onboarding**: Mandatory onboarding flow with three paths (Renter, Individual Lister, Business Lister) tracked in `onboarding_progress` table