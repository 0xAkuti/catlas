# Supabase Setup

## Prereqs
- Install Supabase CLI: https://supabase.com/docs/guides/cli

## Start local stack
```
supabase start
```

## Apply migrations
```
supabase migration up
```

This repo includes:
- `supabase/migrations/0001_initial.sql` for the `likes` table

Set envs in `.env.local` to point the app at local Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
```
