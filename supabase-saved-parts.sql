-- Run in Supabase SQL Editor

create table if not exists user_saved_parts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  submission_id uuid references part_submissions(id) on delete cascade not null,
  created_at    timestamptz not null default now(),
  unique(user_id, submission_id)
);

alter table user_saved_parts enable row level security;

create policy "users read own saved parts"
  on user_saved_parts for select
  using (auth.uid() = user_id);

create policy "users insert own saved parts"
  on user_saved_parts for insert
  with check (auth.uid() = user_id);

create policy "users delete own saved parts"
  on user_saved_parts for delete
  using (auth.uid() = user_id);
