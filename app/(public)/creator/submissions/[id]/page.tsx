import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, FileText, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import SubmissionStatusBadge from '@/components/SubmissionStatusBadge';
import type { PartSubmission } from '@/lib/supabase/db-types';
import { use } from 'react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/creator/login');

  const { data } = await supabase
    .from('part_submissions')
    .select('*')
    .eq('id', id)
    .eq('creator_id', user.id)
    .single();

  if (!data) notFound();
  const sub = data as PartSubmission;

  return (
    <main className="min-h-screen">
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/creator/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-white">{sub.name}</h1>
              <p className="text-sm text-zinc-500 mt-1">{sub.make} · {sub.model} · {sub.category}</p>
            </div>
            <SubmissionStatusBadge status={sub.status} size="md" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Status message */}
        {sub.status === 'pending' && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 mb-8">
            <p className="text-sm font-bold text-amber-400 mb-1">In the review queue</p>
            <p className="text-xs text-zinc-400">
              Submitted {formatDate(sub.created_at)}. Our team typically reviews within 48 hours.
            </p>
          </div>
        )}
        {sub.status === 'under_review' && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 mb-8">
            <p className="text-sm font-bold text-blue-400 mb-1">Currently being reviewed</p>
            <p className="text-xs text-zinc-400">A team member is actively looking at your submission. Hang tight.</p>
          </div>
        )}
        {sub.status === 'approved' && (
          <div className="rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/5 p-5 mb-8">
            <p className="text-sm font-bold text-[#39ff14] mb-1">Approved & Published</p>
            <p className="text-xs text-zinc-400">
              Your part is live on The Racing Files. Published {sub.published_at ? formatDate(sub.published_at) : ''}.
            </p>
          </div>
        )}
        {sub.status === 'rejected' && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 mb-8">
            <p className="text-sm font-bold text-red-400 mb-1">Submission Rejected</p>
            {sub.admin_notes && <p className="text-sm text-zinc-400 mt-2">{sub.admin_notes}</p>}
            <p className="text-xs text-zinc-500 mt-2">
              Address the feedback above and submit a new version.
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-8">
          {/* Left: details */}
          <div className="space-y-5">
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Part Details</h3>
              {[
                ['Name', sub.name],
                ['Category', sub.category],
                ['Vehicle Type', sub.vehicle_type],
                ['Fitment', sub.fitment],
                ['File Price', `$${sub.file_price}`],
                ['Printed Price', sub.printed_price ? `$${sub.printed_price}` : 'Digital only'],
                ['Material', sub.material],
                ['Difficulty', sub.difficulty],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                  <span className="text-xs text-zinc-500">{k}</span>
                  <span className="text-xs text-zinc-200 text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Print Settings</h3>
              {[
                ['Layer Height', sub.print_layer_height],
                ['Infill', sub.print_infill],
                ['Supports', sub.print_supports ? 'Yes' : 'No'],
                ['Nozzle Temp', sub.print_nozzle_temp],
                ['Bed Temp', sub.print_bed_temp],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                  <span className="text-xs text-zinc-500">{k}</span>
                  <span className="text-xs text-zinc-200">{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: files & images */}
          <div className="space-y-5">
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Uploaded Files</h3>
              <div className="space-y-3">
                {[
                  { label: 'STL', url: sub.stl_url },
                  { label: '3MF', url: sub.threemf_url },
                  { label: 'STEP', url: sub.step_url },
                ].map(({ label, url }) => (
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
                      <span className="text-xs text-zinc-700">Not uploaded</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {sub.images && sub.images.length > 0 && (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Images ({sub.images.length})</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sub.images.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-lg overflow-hidden border border-[#2a2a2a]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {(!sub.images || sub.images.length === 0) && (
              <div className="rounded-xl border border-dashed border-[#2a2a2a] p-6 text-center">
                <ImageIcon className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-600">No images uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {sub.description && (
          <div className="mt-6 rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Description</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{sub.description}</p>
          </div>
        )}
      </div>
    </main>
  );
}
