-- Run this in Supabase SQL editor

create table if not exists user_purchases (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  submission_id uuid references part_submissions(id) on delete set null,
  product_name text not null,
  tier         text not null check (tier in ('file', 'printed', 'finished')),
  price_paid   numeric(10,2) not null default 0,
  stl_url      text,
  threemf_url  text,
  step_url     text,
  created_at   timestamptz not null default now()
);

-- Users can read their own purchases
alter table user_purchases enable row level security;

create policy "users read own purchases"
  on user_purchases for select
  using (auth.uid() = user_id);

create policy "users insert own purchases"
  on user_purchases for insert
  with check (auth.uid() = user_id);

-- Anon insert allowed for guest purchases (user_id will be null)
create policy "anon insert guest purchases"
  on user_purchases for insert
  with check (user_id is null);
