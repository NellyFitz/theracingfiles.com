'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, X, Loader2 } from 'lucide-react';
import type { CreatorProfile } from '@/lib/supabase/db-types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function InfoRow({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  return (
    <div className="flex justify-between py-2.5 border-b border-[#1e1e1e] last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs text-zinc-200 text-right max-w-[60%]">{display ?? '—'}</span>
    </div>
  );
}

export default function AccountsClient({ creators }: { creators: CreatorProfile[] }) {
  const [selected, setSelected] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localCreators, setLocalCreators] = useState(creators);

  const update = async (action: 'approve' | 'reject') => {
    if (!selected) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/dws/update-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: selected.id, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        setLoading(false);
        return;
      }

      setLocalCreators((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? { ...c, verified: action === 'approve', approved: action === 'approve' }
            : c
        )
      );
      setSelected(null);
    } catch {
      setError('Network error — please try again');
    }
    setLoading(false);
  };

  return (
    <>
      {localCreators.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] p-12 text-center">
          <CheckCircle className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-base font-bold text-white mb-1">No accounts here</p>
          <p className="text-sm text-zinc-500">No creator accounts with this status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {localCreators.map((creator) => (
            <button
              key={creator.id}
              onClick={() => { setSelected(creator); setError(''); }}
              className="w-full flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#39ff14]/30 transition-colors group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                <span className="text-lg font-black text-[#39ff14]">{creator.name?.charAt(0) ?? '?'}</span>
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-[#39ff14] transition-colors truncate">{creator.name}</p>
                  <p className="text-xs text-zinc-500">@{creator.handle}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-zinc-400 truncate">{creator.vehicle_specialties ?? '—'}</p>
                  <p className="text-xs text-zinc-600">{creator.experience_level ?? '—'}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-zinc-600">Joined {formatDate(creator.created_at)}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                creator.verified && creator.approved
                  ? 'bg-[#39ff14]/10 text-[#39ff14]'
                  : 'bg-amber-500/10 text-amber-400'
              }`}>
                {creator.verified && creator.approved ? 'Verified' : 'Pending'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-[#111] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="flex items-center gap-4 p-5 border-b border-[#1e1e1e]">
              <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                <span className="text-xl font-black text-[#39ff14]">{selected.name?.charAt(0) ?? '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black text-white">{selected.name}</h2>
                <p className="text-xs text-zinc-500">@{selected.handle} · Applied {formatDate(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                <InfoRow label="Store Name" value={selected.name} />
                <InfoRow label="Handle" value={`@${selected.handle}`} />
                <InfoRow label="Experience Level" value={selected.experience_level} />
                <InfoRow label="Vehicle Specialties" value={selected.vehicle_specialties} />
                <InfoRow label="Software Used" value={selected.software} />
                <InfoRow label="Website" value={selected.website} />
              </div>
              {selected.bio && (
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Bio</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{selected.bio}</p>
                </div>
              )}
              <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                selected.verified && selected.approved
                  ? 'bg-[#39ff14]/10 text-[#39ff14]'
                  : 'bg-amber-500/10 text-amber-400'
              }`}>
                {selected.verified && selected.approved ? 'Verified Creator' : 'Pending Review'}
              </span>
            </div>

            <div className="p-5 border-t border-[#1e1e1e] flex gap-3">
              <button
                onClick={() => update('approve')}
                disabled={loading || (selected.verified && selected.approved)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {selected.verified && selected.approved ? 'Already Approved' : 'Approve'}
              </button>
              <button
                onClick={() => update('reject')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
