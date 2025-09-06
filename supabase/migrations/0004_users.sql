-- Users table to store username overrides and cached ENS
create table if not exists public.users (
  address text primary key,
  username text,
  ens text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_address_lower on public.users (lower(address));


