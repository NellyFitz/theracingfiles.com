-- Run this in Supabase SQL editor

create table if not exists user_purchases (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  submission_id uuid references part_submissions(id) on delete set null,
  product_name  text not null,
  tier          text not null check (tier in ('file', 'printed', 'finished')),
  price_paid    numeric(10,2) not null default 0,
  created_at    timestamptz not null default now()
);

alter table user_purchases enable row level security;

-- Logged-in users can read their own purchases
create policy "users read own purchases"
  on user_purchases for select
  using (auth.uid() = user_id);

-- Logged-in users can insert their own purchases
create policy "users insert own purchases"
  on user_purchases for insert
  with check (auth.uid() = user_id);
