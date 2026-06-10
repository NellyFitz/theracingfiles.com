-- Run in Supabase SQL Editor

create table if not exists creator_verification_codes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  code       text not null,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);

alter table creator_verification_codes enable row level security;

-- Only service role (admin client) touches this table
