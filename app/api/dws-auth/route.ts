import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: user, error } = await adminClient
    .from('admin_users')
    .select('password')
    .eq('username', username)
    .single();

  // Log to Vercel function logs so we can see the real error
  if (error) {
    console.error('[DWS auth] DB error:', JSON.stringify(error));
    return NextResponse.json({ error: 'DB error: ' + error.message }, { status: 401 });
  }

  if (!user) {
    console.error('[DWS auth] No user found for username:', username);
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  if (user.password !== password) {
    console.error('[DWS auth] Password mismatch for username:', username);
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set('dws_session', 'dws-active', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}
