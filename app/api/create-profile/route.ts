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
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;

  // Update profiles table
  const { error: profilesError } = await admin.from('profiles').update({
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    address_line1: address1 ?? null,
    address_line2: address2 ?? null,
    city: city ?? null,
    state: state ?? null,
    zip: zip ?? null,
    role,
  }).eq('id', userId);

  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 });

  // Update user_profiles table (shared by members and creators)
  const { error: upError } = await admin.from('user_profiles').update({
    name: fullName,
    role,
  }).eq('id', userId);

  // user_profiles row may not exist yet if trigger hasn't fired — upsert as fallback
  if (upError) {
    await admin.from('user_profiles').upsert({
      id: userId,
      name: fullName,
      handle: userId,
      role,
      verified: false,
      approved: false,
    });
  }

  return NextResponse.json({ ok: true });
}
