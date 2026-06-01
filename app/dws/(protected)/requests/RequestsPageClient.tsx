'use client';

import { useState, useMemo } from 'react';
import {
  Inbox, Clock, Car, Wrench, Image as ImageIcon,
  Mail, X, Search, CheckSquare, Square, Send,
  ChevronDown, Loader2, CheckCircle,
} from 'lucide-react';

interface PartRequest {
  id: string;
  name: string;
  email: string;
  vehicle_year: string;
  make: string;
  model: string;
  part_needed: string;
  fulfillment_type: string;
  notes?: string;
  image_urls?: string[];
  status: string;
  created_at: string;
}

interface Creator {
  id: string;
  name: string;
  handle: string;
  vehicle_specialties?: string;
  experience_level?: string;
  approved: boolean;
  verified: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reviewing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  matched:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  fulfilled: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed:    'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
};

const FULFILLMENT_LABELS: Record<string, string> = {
  digital:  'Digital File',
  printed:  'Printed Part',
  finished: 'Finished Part',
};

const ALL_STATUSES = ['pending', 'reviewing', 'matched', 'fulfilled', 'closed'] as const;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Review Modal ─────────────────────────────────────────── */

function ReviewModal({
  request,
  creators,
  onClose,
  onSent,
}: {
  request: PartRequest;
  creators: Creator[];
  onClose: () => void;
  onSent: (requestId: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [autoMatch, setAutoMatch] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const filtered = useMemo(() => {
    let list = creators;
    if (autoMatch) {
      const make = request.make.toLowerCase();
      list = list.filter(
        (c) => c.vehicle_specialties?.toLowerCase().includes(make)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q) ||
          c.vehicle_specialties?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [creators, search, autoMatch, request.make]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((c) => c.id)));
  const clearAll  = () => setSelected(new Set());

  const handleSend = async () => {
    if (selected.size === 0) return;
    setSending(true);
    await fetch('/api/dws/update-request-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: request.id, status: 'reviewing' }),
    });
    setSending(false);
    setSent(true);
    setTimeout(() => {
      onSent(request.id);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[#2a2a2a] bg-[#111] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e] shrink-0">
          <div>
            <h2 className="text-base font-black text-white">Review Request</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Select creators to notify about this request</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request summary */}
        <div className="px-6 py-4 bg-[#0d0d0d] border-b border-[#1e1e1e] shrink-0">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Vehicle</p>
              <p className="text-sm text-white font-semibold">
                {request.vehicle_year} {request.make} {request.model}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Part</p>
              <p className="text-sm text-white font-semibold">{request.part_needed}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Fulfillment</p>
              <p className="text-sm text-zinc-300">{FULFILLMENT_LABELS[request.fulfillment_type] ?? request.fulfillment_type}</p>
            </div>
          </div>
          {request.notes && (
            <p className="text-xs text-zinc-500 mt-3 italic">"{request.notes}"</p>
          )}
        </div>

        {/* Creator selection */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-3 border-b border-[#1e1e1e] flex items-center gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search creators…"
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#3b82f6]/50"
              />
            </div>
            <button
              onClick={() => setAutoMatch(!autoMatch)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                autoMatch
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'border-[#2a2a2a] text-zinc-500 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              Match {request.make}
            </button>
            <button onClick={selected.size === filtered.length ? clearAll : selectAll}
              className="text-xs text-zinc-500 hover:text-white transition-colors whitespace-nowrap">
              {selected.size === filtered.length ? 'Clear all' : 'Select all'}
            </button>
          </div>

          {/* Creator list */}
          <div className="overflow-y-auto flex-1 divide-y divide-[#1a1a1a]">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-zinc-600 text-xs">
                {autoMatch
                  ? `No approved creators specialize in ${request.make}. Turn off auto-match to see all.`
                  : 'No creators found.'}
              </div>
            ) : (
              filtered.map((creator) => {
                const isSelected = selected.has(creator.id);
                return (
                  <button
                    key={creator.id}
                    onClick={() => toggle(creator.id)}
                    className={`w-full flex items-center gap-4 px-6 py-3.5 text-left transition-colors ${
                      isSelected ? 'bg-blue-500/5' : 'hover:bg-[#181818]'
                    }`}
                  >
                    {isSelected
                      ? <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                      : <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                    }
                    <div className="w-8 h-8 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-[#E8000D]">{creator.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{creator.name}</p>
                      <p className="text-[10px] text-zinc-600">@{creator.handle}</p>
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      {creator.experience_level && (
                        <p className="text-[10px] text-zinc-500 bg-[#1e1e1e] px-2 py-0.5 rounded">
                          {creator.experience_level.split(' ')[0]}
                        </p>
                      )}
                      {creator.vehicle_specialties && (
                        <p className="text-[10px] text-zinc-600 max-w-[140px] truncate">
                          {creator.vehicle_specialties}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e1e1e] flex items-center justify-between shrink-0 bg-[#0d0d0d]">
          <p className="text-xs text-zinc-500">
            {selected.size > 0
              ? `${selected.size} creator${selected.size > 1 ? 's' : ''} selected`
              : 'No creators selected'}
          </p>
          <button
            onClick={handleSend}
            disabled={selected.size === 0 || sending || sent}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            {sent ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Sent!</>
            ) : sending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Send to {selected.size > 0 ? selected.size : ''} Creator{selected.size !== 1 ? 's' : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function RequestsPageClient({
  initialRequests,
  creators,
  error,
}: {
  initialRequests: PartRequest[];
  creators: Creator[];
  error?: string;
}) {
  const [requests, setRequests] = useState<PartRequest[]>(initialRequests);
  const [reviewTarget, setReviewTarget] = useState<PartRequest | null>(null);
  const [statusChanging, setStatusChanging] = useState<string | null>(null);

  const handleStatusChange = async (requestId: string, status: string) => {
    setStatusChanging(requestId);
    await fetch('/api/dws/update-request-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, status }),
    });
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
    setStatusChanging(null);
  };

  const handleSent = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'reviewing' } : r))
    );
  };

  const pending   = requests.filter((r) => r.status === 'pending').length;
  const reviewing = requests.filter((r) => r.status === 'reviewing').length;
  const fulfilled = requests.filter((r) => r.status === 'fulfilled').length;

  return (
    <main className="min-h-screen bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-[#E8000D]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Requested Parts</h1>
            <p className="text-xs text-zinc-500 mt-0.5">All Request a Part form submissions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Requests', value: requests.length },
            { label: 'Pending',        value: pending },
            { label: 'Reviewing',      value: reviewing },
            { label: 'Fulfilled',      value: fulfilled },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-6">
            <p className="text-sm text-red-400">Error loading requests: {error}</p>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">

                {/* Row header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e] bg-[#111] flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{req.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-zinc-600" />
                        <p className="text-xs text-zinc-500">{req.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status dropdown */}
                    <div className="relative">
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        disabled={statusChanging === req.id}
                        className={`appearance-none text-[10px] font-bold uppercase tracking-widest pl-2.5 pr-6 py-1 rounded-full border cursor-pointer bg-transparent focus:outline-none ${STATUS_STYLES[req.status] ?? STATUS_STYLES.pending}`}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-[#111] text-white normal-case tracking-normal">
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                    </div>

                    <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                      <Clock className="w-3 h-3" /> {timeAgo(req.created_at)}
                    </span>

                    {/* Review Request button — shown for pending/reviewing */}
                    {(req.status === 'pending' || req.status === 'reviewing') && (
                      <button
                        onClick={() => setReviewTarget(req)}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Review Request
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Vehicle</p>
                    <p className="text-sm text-white flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#E8000D] shrink-0" />
                      {req.vehicle_year} {req.make} {req.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Part Needed</p>
                    <p className="text-sm text-white flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-[#E8000D] shrink-0" />
                      {req.part_needed}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Fulfillment</p>
                    <p className="text-sm text-zinc-300">{FULFILLMENT_LABELS[req.fulfillment_type] ?? req.fulfillment_type}</p>
                  </div>
                  {req.notes && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Notes</p>
                      <p className="text-sm text-zinc-400 leading-relaxed">{req.notes}</p>
                    </div>
                  )}
                </div>

                {/* Images */}
                {req.image_urls && req.image_urls.length > 0 && (
                  <div className="px-6 pb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3 flex items-center gap-1.5">
                      <ImageIcon className="w-3 h-3" /> Reference Images
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {req.image_urls.map((url: string, i: number) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-20 h-20 rounded-lg border border-[#2a2a2a] overflow-hidden bg-[#0d0d0d] hover:border-[#E8000D]/40 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal
          request={reviewTarget}
          creators={creators}
          onClose={() => setReviewTarget(null)}
          onSent={handleSent}
        />
      )}
    </main>
  );
}
