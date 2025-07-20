# Supabase Migration Guide

## Migration Status: Phase 1 Complete ✅

### What's Been Done

1. **✅ Supabase Client Setup**

   - Created `src/lib/supabase.ts` with Supabase client configuration
   - Added TypeScript types for database schema

2. **✅ Database Functions Migration**

   - Updated `src/lib/database/lots.ts` to use Supabase queries
   - Updated `src/lib/database/contributions.ts` to use Supabase queries
   - Updated `src/lib/database/expenses.ts` to use Supabase queries

3. **✅ Schema Simplification**

   - Removed `month` and `year` fields from contributions
   - Updated TypeScript types in `src/types/contributions.types.ts`
   - Updated `ContributionModal.tsx` to remove month/year fields

4. **✅ Configuration Updates**
   - Updated `.env.example` with Supabase environment variables
   - Cleaned up `package.json` (removed Prisma scripts)

### Required Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Database Schema (Already Created in Supabase)

```sql
-- Tables created with simplified schema
CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number TEXT UNIQUE NOT NULL,
  owner TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contributions (
  id SERIAL PRIMARY KEY,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Next Steps (Optional - Phase 2)

1. **Remove Prisma Dependencies** (when ready):

   ```bash
   npm uninstall @prisma/client @prisma/extension-accelerate prisma
   ```

2. **Clean up Prisma files** (when ready):

   - Delete `prisma/` directory
   - Delete `src/lib/prisma.ts`

3. **Enhanced Supabase Features** (future exploration):
   - Real-time subscriptions for live updates
   - Row Level Security (RLS) policies for data protection
   - Supabase Auth for user authentication
   - Supabase Storage for file uploads

### Testing the Migration

1. Make sure your Supabase project is set up with the correct environment variables
2. Run the development server: `npm run dev`
3. Test all CRUD operations:
   - Create/edit/delete lots
   - Create/edit/delete contributions
   - Create/edit/delete expenses

### Key Changes Made

- **Database queries**: Converted from Prisma syntax to Supabase syntax
- **Data mapping**: Added proper field mapping between database and TypeScript types
- **Error handling**: Maintained existing error handling patterns
- **Type safety**: Preserved TypeScript type safety throughout

### Benefits Achieved

- ✅ **Hosted database**: No need to manage PostgreSQL server
- ✅ **Simplified schema**: Removed redundant month/year fields
- ✅ **Better date handling**: Using proper DATE type instead of TEXT
- ✅ **Ready for real-time**: Supabase client supports real-time subscriptions
- ✅ **Scalable**: Supabase handles scaling automatically

The migration is complete and the application should work with Supabase! 🎉
