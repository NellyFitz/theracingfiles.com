'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Clock, Eye, CheckCircle, XCircle, Printer, ArrowRight,
  X, Download, FileText, ImageIcon, User, Loader2,
  ChevronDown, ExternalLink,
} from 'lucide-react';
import SubmissionStatusBadge from '@/components/SubmissionStatusBadge';
import type { PartSubmission, SubmissionStatus } from '@/lib/supabase/db-types';

type Sub = PartSubmission & {
  user_profiles: { name: string; handle: string; bio: string | null; software: string | null; experience_level: string | null } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function InfoRow({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value ?? '—');
  return (
    <div className="flex justify-between py-2 border-b border-[#1a1a1a] last:border-0">
      <span className="text-[11px] text-zinc-500 shrink-0 w-32">{label}</span>
      <span className="text-[11px] text-zinc-200 text-right">{display}</span>
    </div>
  );
}

/* ── Review Modal ─────────────────────────────────────────── */

function ReviewModal({ sub, onClose, onUpdated }: {
  sub: Sub;
  onClose: () => void;
  onUpdated: (id: string, status: SubmissionStatus, notes: string) => void;
}) {
  const [adminNotes, setAdminNotes] = useState(sub.admin_notes ?? '');
  const [rejecting, setRejecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasFiles = !!(sub.stl_url || sub.threemf_url || sub.obj_url || sub.mtl_url);

  const update = async (status: SubmissionStatus) => {
    if (status === 'rejected' && !adminNotes.trim()) {
      setError('Please provide a rejection reason for the creator.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await fetch('/api/dws/update-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId: sub.id, status, adminNotes }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Something went wrong'); setLoading(false); return; }
    onUpdated(sub.id, status, adminNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-[#2a2a2a] bg-[#111] shadow-2xl overflow-hidden">

        {/* Modal header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#1e1e1e] shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-black text-white truncate">{sub.name}</h2>
              <SubmissionStatusBadge status={sub.status} />
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {sub.make} · {sub.model} · {sub.year_start}–{sub.year_end} · {sub.category}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Images */}
          {sub.images && sub.images.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">
                Photos ({sub.images.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sub.images.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="group relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-[#2a2a2a]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-400 font-semibold">No images uploaded</p>
            </div>
          )}

          {/* Two-col layout */}
          <div className="grid sm:grid-cols-2 gap-5">

            {/* Part details */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Part Details</p>
              <InfoRow label="File Price" value={`$${sub.file_price}`} />
              <InfoRow label="Printed Price" value={sub.printed_price ? `$${sub.printed_price}` : 'Digital only'} />
              <InfoRow label="Finished Available" value={sub.finished_available} />
              <InfoRow label="Material" value={sub.material} />
              <InfoRow label="Difficulty" value={sub.difficulty} />
              <InfoRow label="Fitment" value={sub.fitment} />
              <InfoRow label="Tags" value={sub.tags} />
              <InfoRow label="Submitted" value={formatDate(sub.created_at)} />
            </div>

            {/* Print settings + Creator + Files */}
            <div className="space-y-4">
              <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Print Settings</p>
                <InfoRow label="Layer Height" value={sub.print_layer_height} />
                <InfoRow label="Infill" value={sub.print_infill} />
                <InfoRow label="Supports" value={sub.print_supports} />
                <InfoRow label="Nozzle Temp" value={sub.print_nozzle_temp} />
                <InfoRow label="Bed Temp" value={sub.print_bed_temp} />
              </div>

              {sub.user_profiles && (
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Creator</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#1e1e1e] flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{sub.user_profiles.name}</p>
                      <p className="text-[10px] text-zinc-500">@{sub.user_profiles.handle}</p>
                    </div>
                  </div>
                  {sub.user_profiles.experience_level && (
                    <p className="text-[10px] text-zinc-600">{sub.user_profiles.experience_level}</p>
                  )}
                  {sub.user_profiles.software && (
                    <p className="text-[10px] text-zinc-600 mt-0.5">Software: {sub.user_profiles.software}</p>
                  )}
                </div>
              )}

              {/* Files */}
              <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Files</p>
                <div className="space-y-2">
                  {([
                    { label: 'STL', url: sub.stl_url },
                    { label: '3MF', url: sub.threemf_url },
                    { label: 'OBJ', url: sub.obj_url },
                    { label: 'MTL', url: sub.mtl_url },
                    { label: 'STEP', url: sub.step_url },
                  ] as { label: string; url: string | null }[]).map(({ label, url }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-zinc-700" />
                        <span className="text-[11px] text-zinc-500">{label}</span>
                      </div>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-[#E8000D] hover:text-white transition-colors">
                          <Download className="w-3 h-3" /> Download
                        </a>
                      ) : (
                        <span className="text-[11px] text-zinc-700">—</span>
                      )}
                    </div>
                  ))}
                </div>
                {!hasFiles && (
                  <p className="text-[10px] text-red-400 mt-2 pt-2 border-t border-[#1e1e1e]">
                    ⚠ No print files — do not approve.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description / notes */}
          {(sub.description || sub.fitment_notes || sub.install_notes) && (
            <div className="space-y-3">
              {sub.description && (
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Description</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{sub.description}</p>
                </div>
              )}
              {sub.fitment_notes && (
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Fitment Notes</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{sub.fitment_notes}</p>
                </div>
              )}
              {sub.install_notes && (
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Install Notes</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{sub.install_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Rejection reason — expands when rejecting */}
          <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
            <button
              onClick={() => setRejecting(!rejecting)}
              className="w-full flex items-center justify-between text-left"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Rejection Reason <span className="text-zinc-700 normal-case tracking-normal font-normal">(required if rejecting)</span>
              </p>
              <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${rejecting ? 'rotate-180' : ''}`} />
            </button>
            {rejecting && (
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="E.g. 'No fitment photos — please resubmit with install shots. Files look good.'"
                className="w-full mt-3 rounded-lg px-3 py-2.5 text-xs resize-none bg-[#141414] border border-[#2a2a2a] text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8000D]/40"
              />
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#1e1e1e] bg-[#0d0d0d] flex items-center gap-3 shrink-0">
          <button
            onClick={() => update('approved')}
            disabled={loading || !hasFiles}
            title={!hasFiles ? 'Cannot approve without files' : undefined}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg bg-[#E8000D] hover:bg-[#c0000b] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Approve & Publish
          </button>

          <button
            onClick={() => { setRejecting(true); if (adminNotes.trim()) update('rejected'); else setError('Please provide a rejection reason for the creator.'); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Reject
          </button>

          <button onClick={onClose} className="ml-auto text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page Client ──────────────────────────────────────────── */

export default function ScansPageClient({
  initialSubs,
  counts,
  status,
}: {
  initialSubs: Sub[];
  counts: { pending: number; under_review: number; approved: number; rejected: number };
  status: string;
}) {
  const [subs, setSubs] = useState<Sub[]>(initialSubs);
  const [activeSub, setActiveSub] = useState<Sub | null>(null);

  const handleUpdated = (id: string, newStatus: SubmissionStatus, notes: string) => {
    setSubs((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: newStatus, admin_notes: notes } : s
      ).filter((s) => status === 'all' || s.status === status)
    );
  };

  const tabs = [
    { key: 'pending',      label: 'Pending',      icon: Clock,        color: 'text-amber-400',  count: counts.pending },
    { key: 'under_review', label: 'Under Review',  icon: Eye,          color: 'text-blue-400',   count: counts.under_review },
    { key: 'approved',     label: 'Approved',      icon: CheckCircle,  color: 'text-[#39ff14]',  count: counts.approved },
    { key: 'rejected',     label: 'Rejected',      icon: XCircle,      color: 'text-red-400',    count: counts.rejected },
    { key: 'all',          label: 'All',           icon: Printer,      color: 'text-zinc-400',   count: counts.pending + counts.under_review + counts.approved + counts.rejected },
  ];

  return (
    <>
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-black text-white">Scan Review Queue</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {([
            { label: 'Needs Review', value: counts.pending,      icon: Clock,       color: 'text-amber-400' },
            { label: 'Under Review', value: counts.under_review, icon: Eye,         color: 'text-blue-400' },
            { label: 'Approved',     value: counts.approved,     icon: CheckCircle, color: 'text-[#39ff14]' },
            { label: 'Rejected',     value: counts.rejected,     icon: XCircle,     color: 'text-red-400' },
          ] as const).map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#1e1e1e] overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon, color, count }) => (
            <Link key={key} href={`/dws?status=${key}`}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                status === key ? 'border-[#E8000D] text-[#E8000D]' : 'border-transparent text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${status === key ? 'text-[#E8000D]' : color}`} />
              {label}
              <span className="bg-[#2a2a2a] text-zinc-400 text-[10px] px-1.5 py-0.5 rounded font-mono">{count}</span>
            </Link>
          ))}
        </div>

        {/* List */}
        {subs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2a2a2a] p-12 text-center">
            <CheckCircle className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-base font-bold text-white mb-1">Queue is clear</p>
            <p className="text-sm text-zinc-500">No submissions with this status.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subs.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSub(sub)}
                className="w-full flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#E8000D]/30 transition-colors group text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                  <Printer className="w-6 h-6 text-zinc-600" />
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-[#E8000D] transition-colors truncate">
                      {sub.name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {sub.make} · {sub.model} · {sub.category}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-zinc-400">@{sub.user_profiles?.handle ?? '—'}</p>
                    <p className="text-xs text-zinc-600">{formatDate(sub.created_at)}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <span className="text-sm font-bold text-white">${sub.file_price}</span>
                    {sub.printed_price && (
                      <span className="text-xs text-zinc-500">/ ${sub.printed_price} printed</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <SubmissionStatusBadge status={sub.status} />
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#E8000D] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeSub && (
        <ReviewModal
          sub={activeSub}
          onClose={() => setActiveSub(null)}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}
