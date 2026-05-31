import { createClient } from '@supabase/supabase-js';

// Uses the service role key — bypasses RLS. Server-only. Never import in client components.
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
