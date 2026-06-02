import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('dws_session')?.value !== 'dws-active') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { submissionId, status, adminNotes } = await req.json();
  if (!submissionId || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('part_submissions')
    .update({
      status,
      admin_notes: adminNotes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
