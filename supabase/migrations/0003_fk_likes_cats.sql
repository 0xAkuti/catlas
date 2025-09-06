-- Add foreign key from likes.token_id -> cats.token_id
alter table public.likes
  add constraint fk_likes_token
  foreign key (token_id)
  references public.cats(token_id)
  on delete cascade;


