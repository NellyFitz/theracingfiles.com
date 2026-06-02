-- Part Requests table
create table if not exists part_requests (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  email            text not null,
  vehicle_year     text not null,
  make             text not null,
  model            text not null,
  part_needed      text not null,
  fulfillment_type text not null check (fulfillment_type in ('digital', 'printed', 'finished')),
  notes            text,
  image_urls       text[],
  status           text not null default 'pending'
                     check (status in ('pending', 'reviewing', 'matched', 'fulfilled', 'closed')),
  created_at       timestamptz default now()
);

alter table part_requests enable row level security;

-- Anyone can submit a request (no auth required)
create policy "public can insert part requests"
  on part_requests for insert
  with check (true);

-- Only service role can read (admin panel uses service role key)
create policy "no public read on part requests"
  on part_requests for select
  using (false);

-- Storage bucket for reference photos
insert into storage.buckets (id, name, public)
values ('request-images', 'request-images', true)
on conflict (id) do nothing;

-- Allow anyone to upload images to the bucket
create policy "public upload to request-images"
  on storage.objects for insert
  with check (bucket_id = 'request-images');

-- Allow public reads (images are served publicly)
create policy "public read request-images"
  on storage.objects for select
  using (bucket_id = 'request-images');

-- Allow public (anon) to read approved submissions on the marketplace
CREATE POLICY "public read approved submissions"
  ON part_submissions FOR SELECT
  USING (status = 'approved');
