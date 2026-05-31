import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: user, error } = await adminClient
    .from('admin_users')
    .select('password_hash')
    .eq('username', username)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set('dws_session', process.env.DWS_SESSION_TOKEN ?? 'dws-fallback-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}
