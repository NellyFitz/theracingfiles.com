import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rateLimit';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, 'submission');
  if (limited) return limited;

  const { userId, email } = await req.json();
  if (!userId || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const admin = createAdminClient();

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  // Invalidate any previous codes for this user
  await admin.from('creator_verification_codes').update({ used: true }).eq('user_id', userId).eq('used', false);

  // Insert new code
  const { error: insertErr } = await admin.from('creator_verification_codes').insert({
    user_id: userId,
    code,
    expires_at: expiresAt,
  });
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  // Send email via Resend
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'The Racing Files <onboarding@resend.dev>',
      to: email,
      subject: 'Your Creator Application Verification Code',
      html: `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;min-height:100vh;">
<tr><td align="center" style="padding:40px 20px;">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
  <tr><td style="padding-bottom:28px;">
    <span style="color:#fff;font-size:20px;font-weight:900;">The Racing <span style="color:#E8000D;">Files</span></span>
  </td></tr>
  <tr><td style="background:#141414;border:1px solid #2a2a2a;border-radius:16px;padding:36px;text-align:center;">
    <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Creator Application</p>
    <h1 style="margin:0 0 24px;color:#fff;font-size:26px;font-weight:900;">Verify Your Email</h1>
    <p style="margin:0 0 28px;color:#9ca3af;font-size:14px;line-height:1.6;">Use the code below to complete your creator application. It expires in 15 minutes.</p>
    <div style="background:#0d0d0d;border:2px solid #E8000D;border-radius:12px;padding:24px;margin-bottom:28px;">
      <span style="color:#E8000D;font-size:40px;font-weight:900;letter-spacing:0.3em;">${code}</span>
    </div>
    <p style="margin:0;color:#4b5563;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>
      `,
    });
  }

  return NextResponse.json({ ok: true });
}
