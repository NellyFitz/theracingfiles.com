-- ============================================================
-- The Racing Files Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Creator Profiles ────────────────────────────────────────
-- Extends auth.users — one row per creator account
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  handle text unique not null,
  bio text,
  website text,
  software text,
  experience_level text,
  vehicle_specialties text,
  verified boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Part Submissions ─────────────────────────────────────────
create table if not exists public.part_submissions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.user_profiles on delete cascade not null,

  -- Part identity
  name text not null,
  category text not null,
  vehicle_type text not null,
  make text not null,
  model text not null,
  year_start int not null,
  year_end int not null,
  fitment text not null,
  tags text,

  -- Pricing
  file_price numeric(10,2) not null,
  printed_price numeric(10,2),
  finished_available boolean not null default false,

  -- Specs
  material text not null,
  difficulty text not null,

  -- Descriptions
  description text,
  fitment_notes text,
  install_notes text,

  -- Print settings
  print_layer_height text,
  print_infill text,
  print_supports boolean not null default false,
  print_nozzle_temp text,
  print_bed_temp text,

  -- Scan files (Supabase Storage public URLs)
  stl_url text,
  threemf_url text,
  obj_url text,
  mtl_url text,
  step_url text,

  -- Images (array of Supabase Storage public URLs)
  images text[] not null default '{}',

  -- Review state
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_part_submissions_updated_at
  before update on public.part_submissions
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.user_profiles enable row level security;
alter table public.part_submissions enable row level security;

-- Creator profiles: anyone can read, only owner can write
create policy "Public profiles are viewable by all"
  on public.user_profiles for select using (true);

create policy "Creators can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Creators can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- Part submissions: creators see only their own; admins see all
-- (Admin bypass is handled at application level via NEXT_PUBLIC_ADMIN_EMAIL)
create policy "Creators can view their own submissions"
  on public.part_submissions for select
  using (auth.uid() = creator_id);

create policy "Creators can insert submissions"
  on public.part_submissions for insert
  with check (auth.uid() = creator_id);

create policy "Creators can update their own pending submissions"
  on public.part_submissions for update
  using (auth.uid() = creator_id and status = 'pending');

-- Admin service-role key bypasses RLS automatically in server contexts.
-- For admin reads/writes from the browser, use the service role key
-- in a server action or API route (never expose it client-side).


-- ============================================================
-- Storage Buckets
-- Run these in: Supabase Dashboard → Storage → Create Bucket
-- OR uncomment and run here (requires storage extension)
-- ============================================================

-- insert into storage.buckets (id, name, public)
-- values ('part-files', 'part-files', false);   -- private: presigned URLs only

-- insert into storage.buckets (id, name, public)
-- values ('part-images', 'part-images', true);  -- public: direct URL access

-- Storage policies for part-files (private)
-- create policy "Authenticated users can upload part files"
--   on storage.objects for insert
--   with check (bucket_id = 'part-files' and auth.role() = 'authenticated');

-- create policy "Users can read their own part files"
--   on storage.objects for select
--   using (bucket_id = 'part-files' and auth.uid()::text = (storage.foldername(name))[2]);

-- Storage policies for part-images (public)
-- create policy "Anyone can view part images"
--   on storage.objects for select
--   using (bucket_id = 'part-images');

-- create policy "Authenticated users can upload part images"
--   on storage.objects for insert
--   with check (bucket_id = 'part-images' and auth.role() = 'authenticated');
