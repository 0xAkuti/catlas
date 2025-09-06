-- Enable required extensions
create extension if not exists pgcrypto;

-- Likes table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  token_id bigint not null,
  user_address text not null,
  created_at timestamptz not null default now()
);

-- Uniqueness per user/token pair
create unique index if not exists uniq_likes_user_token
  on public.likes (user_address, token_id);

-- Optional: basic read index for token likes count
create index if not exists idx_likes_token on public.likes (token_id);

-- Note: RLS is intentionally left disabled for local testing.
-- If you enable RLS, add explicit policies for select/insert/delete.


