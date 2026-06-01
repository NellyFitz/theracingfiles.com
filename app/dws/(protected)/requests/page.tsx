import { Inbox, Clock, Car, Wrench, Image as ImageIcon, Mail } from 'lucide-react';
import DwsNav from '@/components/DwsNav';
import { createAdminClient } from '@/lib/supabase/admin';

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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function RequestsPage() {
  const admin = createAdminClient();
  const { data: requests, error } = await admin
    .from('part_requests')
    .select('*')
    .order('created_at', { ascending: false });

  const rows = requests ?? [];

  const pending   = rows.filter((r) => r.status === 'pending').length;
  const reviewing = rows.filter((r) => r.status === 'reviewing').length;
  const fulfilled = rows.filter((r) => r.status === 'fulfilled').length;

  return (
    <>
      <DwsNav />
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
              { label: 'Total Requests', value: rows.length },
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
              <p className="text-sm text-red-400">Error loading requests: {error.message}</p>
            </div>
          )}

          {rows.length === 0 ? (
            <div className="text-center py-24 text-zinc-600">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((req) => (
                <div key={req.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">

                  {/* Row header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e] bg-[#111]">
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
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${STATUS_STYLES[req.status] ?? STATUS_STYLES.pending}`}>
                        {req.status}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                        <Clock className="w-3 h-3" /> {timeAgo(req.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Details grid */}
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
                      <p className="text-sm text-zinc-300">
                        {FULFILLMENT_LABELS[req.fulfillment_type] ?? req.fulfillment_type}
                      </p>
                    </div>

                    {req.notes && (
                      <div className="sm:col-span-2 lg:col-span-1">
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
      </main>
    </>
  );
}
