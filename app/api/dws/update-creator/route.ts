import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, 'admin');
  if (limited) return limited;

  const cookieStore = await cookies();
  if (cookieStore.get('dws_session')?.value !== 'dws-active') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { creatorId, action } = await req.json();
  if (!creatorId || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const updates =
    action === 'approve'
      ? { verified: true, approved: true }
      : action === 'reject'
      ? { verified: false, approved: false }
      : null;

  if (!updates) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Update user_profiles verification status
  const { error } = await admin
    .from('user_profiles')
    .update(updates)
    .eq('id', creatorId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync role in both tables so login routing and RLS reflect the change
  const role = action === 'approve' ? 'creator' : 'member';
  await admin.from('profiles').update({ role }).eq('id', creatorId);
  await admin.from('user_profiles').update({ role }).eq('id', creatorId);

  return NextResponse.json({ ok: true });
}
