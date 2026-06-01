import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_STATUSES = ['pending', 'reviewing', 'matched', 'fulfilled', 'closed'];

export async function POST(req: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('dws_session')?.value !== 'dws-active') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { requestId, status } = await req.json();

  if (!requestId || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('part_requests')
    .update({ status })
    .eq('id', requestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
