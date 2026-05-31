import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Sign in via Supabase Auth
  const authClient = await createClient();
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Check the user exists in admin_users table
  const adminClient = createAdminClient();
  const { data: adminRow } = await adminClient
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .single();

  if (!adminRow) {
    // Valid Supabase user but not an admin — sign them out and reject
    await authClient.auth.signOut();
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Set an httpOnly session cookie so the layout gate can verify without a Supabase round-trip
  const cookieStore = await cookies();
  cookieStore.set('dws_session', process.env.DWS_SESSION_TOKEN!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return NextResponse.json({ ok: true });
}
