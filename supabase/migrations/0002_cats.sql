-- Cats index table populated at publish time
create table if not exists public.cats (
  token_id bigint primary key,
  creator text not null,
  name text,
  city text,
  country text,
  latitude double precision,
  longitude double precision,
  cid text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_cats_creator on public.cats (lower(creator));
create index if not exists idx_cats_created_at on public.cats (created_at desc);
create index if not exists idx_cats_city_country on public.cats (city, country);


