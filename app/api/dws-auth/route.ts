import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: user } = await adminClient
    .from('admin_users')
    .select('password')
    .eq('username', username)
    .single();

  if (!user || user.password !== password) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
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
