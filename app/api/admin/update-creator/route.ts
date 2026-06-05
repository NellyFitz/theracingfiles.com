import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { creatorId, action } = await request.json();

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

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('user_profiles')
    .update(updates)
    .eq('id', creatorId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
