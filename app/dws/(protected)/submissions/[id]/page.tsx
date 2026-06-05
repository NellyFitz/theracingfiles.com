import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, FileText, ImageIcon, User } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import SubmissionStatusBadge from '@/components/SubmissionStatusBadge';
import DwsNav from '@/components/DwsNav';
import ReviewActions from './ReviewActions';
import type { PartSubmission } from '@/lib/supabase/db-types';
import { use } from 'react';

function InfoRow({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  return (
    <div className="flex justify-between py-2.5 border-b border-[#1e1e1e] last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs text-zinc-200 text-right max-w-[60%]">{display ?? '—'}</span>
    </div>
  );
}

export default async function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Fetch with admin client (bypasses RLS)
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('part_submissions')
    .select('*, user_profiles(name, handle, bio, software)')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const sub = data as PartSubmission & {
    user_profiles: { name: string; handle: string; bio: string | null; software: string | null };
  };

  const creator = sub.user_profiles;

  return (
    <main className="min-h-screen">
      <DwsNav />
      {/* Header */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/dws" className="text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-white truncate">{sub.name}</h1>
              <p className="text-xs text-zinc-500">{sub.make} · {sub.model} · {sub.category}</p>
            </div>
            <SubmissionStatusBadge status={sub.status} size="md" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: submission details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Part Details</h3>
              <InfoRow label="Name" value={sub.name} />
              <InfoRow label="Category" value={sub.category} />
              <InfoRow label="Vehicle Type" value={sub.vehicle_type} />
              <InfoRow label="Make / Model" value={`${sub.make} ${sub.model}`} />
              <InfoRow label="Year Range" value={`${sub.year_start}–${sub.year_end}`} />
              <InfoRow label="Fitment" value={sub.fitment} />
              <InfoRow label="File Price" value={`$${sub.file_price}`} />
              <InfoRow label="Printed Price" value={sub.printed_price ? `$${sub.printed_price}` : 'Digital only'} />
              <InfoRow label="Finished Available" value={sub.finished_available} />
              <InfoRow label="Material" value={sub.material} />
              <InfoRow label="Difficulty" value={sub.difficulty} />
              <InfoRow label="Tags" value={sub.tags} />
            </div>

            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Print Settings</h3>
              <InfoRow label="Layer Height" value={sub.print_layer_height} />
              <InfoRow label="Infill" value={sub.print_infill} />
              <InfoRow label="Supports" value={sub.print_supports} />
              <InfoRow label="Nozzle Temp" value={sub.print_nozzle_temp} />
              <InfoRow label="Bed Temp" value={sub.print_bed_temp} />
            </div>

            {sub.description && (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Description</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{sub.description}</p>
              </div>
            )}

            {sub.fitment_notes && (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Fitment Notes</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{sub.fitment_notes}</p>
              </div>
            )}

            {sub.install_notes && (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Install Notes</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{sub.install_notes}</p>
              </div>
            )}

            {/* Images */}
            {sub.images && sub.images.length > 0 ? (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                  Images ({sub.images.length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {sub.images.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border border-[#2a2a2a]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3">
                <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm text-amber-400 font-semibold">No images uploaded</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Consider requesting photos before approving.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="space-y-5">
            {/* Creator */}
            {creator && (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Creator</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
                    <User className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{creator.name}</p>
                    <p className="text-xs text-zinc-500">@{creator.handle}</p>
                  </div>
                </div>
                {creator.bio && <p className="text-xs text-zinc-500 leading-relaxed mb-2">{creator.bio}</p>}
                {creator.software && <p className="text-xs text-zinc-600">Software: {creator.software}</p>}
              </div>
            )}

            {/* Files */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Download Files</h3>
              <div className="space-y-3">
                {([
                  { label: 'STL', url: sub.stl_url },
                  { label: '3MF', url: sub.threemf_url },
                  { label: 'OBJ', url: sub.obj_url },
                  { label: 'MTL', url: sub.mtl_url },
                  { label: 'STEP', url: sub.step_url },
                ] as { label: string; url: string | null }[]).map(({ label, url }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-600" />
                      <span className="text-xs text-zinc-400">{label}</span>
                    </div>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#39ff14] hover:text-white transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-700">—</span>
                    )}
                  </div>
                ))}
              </div>
              {!sub.stl_url && !sub.threemf_url && (
                <p className="text-xs text-red-400 mt-3 pt-3 border-t border-[#1e1e1e]">
                  ⚠ No print files — do not approve without files.
                </p>
              )}
            </div>

            {/* Review actions — client component */}
            <ReviewActions
              submissionId={sub.id}
              currentStatus={sub.status}
              currentNotes={sub.admin_notes}
              hasFiles={!!(sub.stl_url || sub.threemf_url || sub.obj_url || sub.mtl_url)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
