-- Admin users table
-- Links to Supabase auth.users so password management is handled by Supabase Auth
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Only admins can read this table; no public access
alter table admin_users enable row level security;

create policy "admins only" on admin_users
  for select using (auth.uid() = id);

-- To add an admin, first create a Supabase Auth user via the dashboard
-- (Authentication → Users → Invite / Add user), then run:
--
--   insert into admin_users (id, name)
--   values ('<paste auth user UUID here>', 'Your Name');
--
-- To remove an admin:
--   delete from admin_users where id = '<uuid>';
