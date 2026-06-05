-- Allow anyone (logged in or not) to read approved submissions
-- Run this in Supabase SQL editor

create policy "public read approved submissions"
  on part_submissions
  for select
  using (status = 'approved');
