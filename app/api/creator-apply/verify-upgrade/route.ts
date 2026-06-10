import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, 'submission');
  if (limited) return limited;

  const { userId, code, storeName, handle, bio, software, experience, specialties, website } = await req.json();
  if (!userId || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const admin = createAdminClient();

  // Verify the code
  const { data: record } = await admin
    .from('creator_verification_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!record) return NextResponse.json({ error: 'Invalid or expired code. Please request a new one.' }, { status: 400 });

  // Mark code as used
  await admin.from('creator_verification_codes').update({ used: true }).eq('id', record.id);

  const resolvedHandle = handle?.toLowerCase().replace(/[^a-z0-9_]/g, '') || userId.slice(0, 8);

  // Upgrade profiles role to creator
  await admin.from('profiles').update({ role: 'creator' }).eq('id', userId);

  // Upsert creator info into user_profiles
  await admin.from('user_profiles').upsert({
    id: userId,
    name: storeName,
    handle: resolvedHandle,
    bio: bio || null,
    software: software || null,
    experience_level: experience || null,
    vehicle_specialties: specialties || null,
    website: website || null,
    role: 'creator',
    verified: false,
    approved: true,
  });

  return NextResponse.json({ ok: true });
}
