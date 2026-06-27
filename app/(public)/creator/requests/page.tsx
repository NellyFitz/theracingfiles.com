'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Inbox, Car, Wrench, Clock, Search, X, Loader2,
  Download, Printer, ChevronRight, Image as ImageIcon,
  ArrowLeft, Zap, Filter,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PartRequest {
  id: string;
  name: string;
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

const FULFILLMENT_LABELS: Record<string, { label: string; color: string }> = {
  digital:  { label: 'Digital File', color: 'text-[#E8000D] bg-[#E8000D]/10 border-[#E8000D]/20' },
  printed:  { label: 'Printed Part', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  finished: { label: 'Fully Finished', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
};

const FULFILLMENT_ICONS: Record<string, React.ElementType> = {
  digital:  Download,
  printed:  Printer,
  finished: Wrench,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CreatorRequestPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [search, setSearch] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/creator/login'); return; }

      // Verify this is an approved creator
      const { data: prof } = await supabase
        .from('user_profiles')
        .select('id, approved')
        .eq('id', user.id)
        .single();

      if (!prof || !prof.approved) {
        router.push('/creator/dashboard');
        return;
      }

      // Fetch open requests (pending + reviewing)
      const { data } = await supabase
        .from('part_requests')
        .select('id, name, vehicle_year, make, model, part_needed, fulfillment_type, notes, image_urls, status, created_at')
        .in('status', ['pending', 'reviewing'])
        .order('created_at', { ascending: false });

      setRequests((data ?? []) as PartRequest[]);
      setLoading(false);
    });
  }, [router]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (fulfillmentFilter !== 'all' && r.fulfillment_type !== fulfillmentFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.make.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.part_needed.toLowerCase().includes(q) ||
          r.vehicle_year.includes(q)
        );
      }
      return true;
    });
  }, [requests, search, fulfillmentFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/creator/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-[#E8000D]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#E8000D] mb-1">Creator Only</p>
              <h1 className="text-3xl font-black text-white">Request Portal</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Real buyers are waiting on these parts. Fulfill a request to earn — no bidding, just build it.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[#1e1e1e]">
            <div>
              <span className="text-2xl font-black text-white">{requests.length}</span>
              <span className="text-xs text-zinc-600 ml-1.5">open requests</span>
            </div>
            <div className="w-px h-5 bg-[#2a2a2a]" />
            <div>
              <span className="text-2xl font-black text-white">
                {requests.filter((r) => r.fulfillment_type === 'digital').length}
              </span>
              <span className="text-xs text-zinc-600 ml-1.5">file only</span>
            </div>
            <div className="w-px h-5 bg-[#2a2a2a]" />
            <div>
              <span className="text-2xl font-black text-white">
                {requests.filter((r) => r.fulfillment_type !== 'digital').length}
              </span>
              <span className="text-xs text-zinc-600 ml-1.5">printed / finished</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by make, model, part…"
              className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-600" />
            {['all', 'digital', 'printed', 'finished'].map((f) => (
              <button
                key={f}
                onClick={() => setFulfillmentFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
                  fulfillmentFilter === f
                    ? 'bg-[#E8000D]/10 border-[#E8000D]/30 text-[#E8000D]'
                    : 'border-[#2a2a2a] text-zinc-500 hover:text-white hover:border-zinc-600'
                }`}
              >
                {f === 'all' ? 'All' : FULFILLMENT_LABELS[f]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-zinc-600 mb-4">
          Showing <span className="text-white font-bold">{filtered.length}</span> request{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Request cards */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2a2a2a] p-16 text-center">
            <Inbox className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-base font-bold text-white mb-1">No matching requests</p>
            <p className="text-sm text-zinc-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => {
              const FulfillIcon = FULFILLMENT_ICONS[req.fulfillment_type] ?? Wrench;
              const fulfillStyle = FULFILLMENT_LABELS[req.fulfillment_type] ?? { label: req.fulfillment_type, color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' };
              const isExpanded = expandedId === req.id;

              return (
                <div
                  key={req.id}
                  className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden hover:border-[#3a3a3a] transition-colors"
                >
                  {/* Main row */}
                  <div className="p-5">
                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                        <FulfillIcon className="w-5 h-5 text-[#E8000D]" />
                      </div>

                      {/* Core info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base font-black text-white">{req.part_needed}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fulfillStyle.color}`}>
                            {fulfillStyle.label}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          {req.vehicle_year} {req.make} {req.model}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(req.created_at)}
                          {req.name && <span className="ml-2">· from {req.name.split(' ')[0]}</span>}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {(req.notes || (req.image_urls && req.image_urls.length > 0)) && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : req.id)}
                            className="text-xs text-zinc-500 hover:text-white transition-colors border border-[#2a2a2a] hover:border-zinc-600 px-3 py-2 rounded-lg"
                          >
                            {isExpanded ? 'Less' : 'Details'}
                          </button>
                        )}
                        <Link
                          href={`/creator/submit?request_id=${req.id}&make=${encodeURIComponent(req.make)}&model=${encodeURIComponent(req.model)}&year=${encodeURIComponent(req.vehicle_year)}&part=${encodeURIComponent(req.part_needed)}`}
                          className="inline-flex items-center gap-1.5 bg-[#E8000D] hover:bg-[#c0000a] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                        >
                          Fulfill This
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#1e1e1e] space-y-3">
                        {req.notes && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">Notes from requester</p>
                            <p className="text-sm text-zinc-400 leading-relaxed bg-[#0d0d0d] rounded-lg px-4 py-3 italic">
                              "{req.notes}"
                            </p>
                          </div>
                        )}
                        {req.image_urls && req.image_urls.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5">
                              <ImageIcon className="w-3 h-3" /> Reference Images
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {req.image_urls.map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-20 h-20 rounded-lg border border-[#2a2a2a] overflow-hidden bg-[#0d0d0d] hover:border-[#E8000D]/40 transition-colors"
                                >
                                  <img src={url} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {filtered.length > 0 && (
          <div className="mt-10 rounded-xl border border-[#39ff14]/10 bg-[#39ff14]/5 p-6 text-center">
            <p className="text-sm font-bold text-[#39ff14] mb-1">Ready to build?</p>
            <p className="text-xs text-zinc-500 mb-4">Hit "Fulfill This" on any request to open the submission form pre-filled with that vehicle's details.</p>
            <Link href="/creator/submit" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors border border-[#2a2a2a] px-4 py-2 rounded-lg">
              Or start a blank listing
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
