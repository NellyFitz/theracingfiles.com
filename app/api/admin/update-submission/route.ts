import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  // Verify the caller is the admin
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { submissionId, status, adminNotes } = await request.json();

  if (!submissionId || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    status,
    admin_notes: adminNotes || null,
    reviewed_at: new Date().toISOString(),
  };

  if (status === 'approved') {
    updates.published_at = new Date().toISOString();
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('part_submissions')
    .update(updates)
    .eq('id', submissionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
