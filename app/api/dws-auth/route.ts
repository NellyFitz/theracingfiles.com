import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const adminClient = createAdminClient();

  const { data: valid, error } = await adminClient.rpc('check_admin_credentials', {
    p_username: username,
    p_password: password,
  });

  if (error || !valid) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set('dws_session', process.env.DWS_SESSION_TOKEN!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}
