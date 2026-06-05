import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, 'submission');
  if (limited) return limited;

  const { userId, firstName, lastName, address1, address2, city, state, zip, role } = await req.json();

  if (!userId || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin.from('profiles').update({
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    address_line1: address1 ?? null,
    address_line2: address2 ?? null,
    city: city ?? null,
    state: state ?? null,
    zip: zip ?? null,
    role,
  }).eq('id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
