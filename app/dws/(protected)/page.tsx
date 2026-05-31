import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, Eye, CheckCircle, XCircle, ArrowRight, Printer } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import SubmissionStatusBadge from '@/components/SubmissionStatusBadge';
import DwsNav from '@/components/DwsNav';
import type { PartSubmission, SubmissionStatus } from '@/lib/supabase/db-types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Auth check uses the regular client (session-aware)
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect('/creator/dashboard');
  }

  const { status = 'pending' } = await searchParams;

  // All data queries use the admin client (bypasses RLS)
  const supabase = createAdminClient();

  const { data: allSubs } = await supabase
    .from('part_submissions')
    .select('id, status');

  const counts = {
    pending: allSubs?.filter((s) => s.status === 'pending').length ?? 0,
    under_review: allSubs?.filter((s) => s.status === 'under_review').length ?? 0,
    approved: allSubs?.filter((s) => s.status === 'approved').length ?? 0,
    rejected: allSubs?.filter((s) => s.status === 'rejected').length ?? 0,
  };

  // Fetch filtered submissions with creator info
  let query = supabase
    .from('part_submissions')
    .select('*, creator_profiles(name, handle)')
    .order('created_at', { ascending: true });

  if (status !== 'all') {
    query = query.eq('status', status as SubmissionStatus);
  }

  const { data: submissions } = await query;
  const subs = (submissions ?? []) as (PartSubmission & { creator_profiles: { name: string; handle: string } })[];

  const tabs: { key: string; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-400' },
    { key: 'under_review', label: 'Under Review', icon: Eye, color: 'text-blue-400' },
    { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-[#39ff14]' },
    { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-400' },
    { key: 'all', label: 'All', icon: Printer, color: 'text-zinc-400' },
  ];

  return (
    <main className="min-h-screen">
      <DwsNav />
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-black text-white">Scan Review Queue</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {([
            { label: 'Needs Review', value: counts.pending, icon: Clock, color: 'text-amber-400' },
            { label: 'Under Review', value: counts.under_review, icon: Eye, color: 'text-blue-400' },
            { label: 'Approved', value: counts.approved, icon: CheckCircle, color: 'text-[#39ff14]' },
            { label: 'Rejected', value: counts.rejected, icon: XCircle, color: 'text-red-400' },
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
          {tabs.map(({ key, label, icon: Icon, color }) => (
            <Link
              key={key}
              href={`/dws?status=${key}`}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                status === key
                  ? 'border-[#39ff14] text-[#39ff14]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${status === key ? 'text-[#39ff14]' : color}`} />
              {label}
              <span className="bg-[#2a2a2a] text-zinc-400 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {key === 'pending' ? counts.pending :
                 key === 'under_review' ? counts.under_review :
                 key === 'approved' ? counts.approved :
                 key === 'rejected' ? counts.rejected :
                 (counts.pending + counts.under_review + counts.approved + counts.rejected)}
              </span>
            </Link>
          ))}
        </div>

        {/* Submissions table */}
        {subs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2a2a2a] p-12 text-center">
            <CheckCircle className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-base font-bold text-white mb-1">Queue is clear</p>
            <p className="text-sm text-zinc-500">No submissions with this status.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subs.map((sub) => (
              <Link
                key={sub.id}
                href={`/dws/submissions/${sub.id}`}
                className="flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#39ff14]/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                  <Printer className="w-6 h-6 text-zinc-600" />
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-[#39ff14] transition-colors truncate">
                      {sub.name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {sub.make} · {sub.model} · {sub.category}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-zinc-400">
                      @{sub.creator_profiles?.handle ?? '—'}
                    </p>
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
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#39ff14] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
