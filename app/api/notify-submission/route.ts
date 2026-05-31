import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const body = await request.json();
  const {
    submissionId,
    partName,
    creatorName,
    creatorHandle,
    make,
    model,
    yearStart,
    yearEnd,
    category,
    filePrice,
    printedPrice,
    hasStl,
    hasThreedmf,
    imageCount,
  } = body;

  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/admin/submissions/${submissionId}`;

  const { error } = await resend.emails.send({
    from: 'PrintShift <onboarding@resend.dev>',
    to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
    subject: `New Part Submission: ${partName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#39ff14;width:32px;height:32px;border-radius:6px;text-align:center;vertical-align:middle;">
                    <span style="color:#0d0d0d;font-size:18px;font-weight:900;line-height:32px;">⚡</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">
                      Print<span style="color:#39ff14;">Shift</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#39ff14;border-radius:12px 12px 0 0;padding:20px 28px;">
              <p style="margin:0;color:#0d0d0d;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
                New Part Submission
              </p>
              <h1 style="margin:6px 0 0;color:#0d0d0d;font-size:24px;font-weight:900;line-height:1.2;">
                ${partName}
              </h1>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:#141414;border-radius:0 0 12px 12px;padding:28px;border:1px solid #2a2a2a;border-top:none;">

              <!-- Creator -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#252525;border-radius:8px;padding:16px;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Creator</p>
                    <p style="margin:0;color:#fff;font-size:15px;font-weight:700;">${creatorName}</p>
                    <p style="margin:2px 0 0;color:#39ff14;font-size:13px;">@${creatorHandle}</p>
                  </td>
                </tr>
              </table>

              <!-- Part details grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;width:40%;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Vehicle</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;">
                    <p style="margin:0;color:#e5e7eb;font-size:13px;">${yearStart}–${yearEnd} ${make} ${model}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Category</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;">
                    <p style="margin:0;color:#e5e7eb;font-size:13px;">${category}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">File Price</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;">
                    <p style="margin:0;color:#39ff14;font-size:13px;font-weight:700;">$${filePrice}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Printed Price</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;">
                    <p style="margin:0;color:#e5e7eb;font-size:13px;">${printedPrice ? `$${printedPrice}` : 'Digital only'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Files</p>
                  </td>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;color:#e5e7eb;font-size:13px;">
                      ${[hasStl && 'STL', hasThreedmf && '3MF'].filter(Boolean).join(', ') || 'None'}
                      &nbsp;·&nbsp; ${imageCount} image${imageCount !== 1 ? 's' : ''}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}"
                       style="display:inline-block;background:#39ff14;color:#0d0d0d;font-size:14px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:8px;">
                      Review Submission →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <p style="margin:24px 0 0;color:#4b5563;font-size:12px;text-align:center;line-height:1.6;">
                This submission is pending review at <strong style="color:#6b7280;">/admin/submissions/${submissionId}</strong><br/>
                Approve or reject it from your admin dashboard.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;color:#374151;font-size:11px;">
                PrintShift Admin Notifications · <a href="${adminUrl}" style="color:#39ff14;text-decoration:none;">View in Dashboard</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  if (error) {
    console.error('[notify-submission] Resend error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
