import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  const bucket = form.get('bucket') as string | null;
  const field = form.get('field') as string | null;

  if (!file || !bucket || !field) {
    return NextResponse.json({ error: 'Missing file, bucket, or field' }, { status: 400 });
  }

  if (!['creator-avatars', 'creator-banners'].includes(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Ensure bucket exists
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((b) => b.id === bucket);
  if (!exists) {
    const { error: createErr } = await admin.storage.createBucket(bucket, { public: true, fileSizeLimit: 10485760 });
    if (createErr && !createErr.message.includes('already exists')) {
      return NextResponse.json({ error: `Could not create bucket: ${createErr.message}` }, { status: 500 });
    }
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/${field}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await admin.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(path);

  // Update user_profiles
  const { error: dbErr } = await admin
    .from('user_profiles')
    .update({ [field]: publicUrl })
    .eq('id', user.id);

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ publicUrl });
}
