import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, CheckCircle, Clock, XCircle, ArrowRight, Printer, DollarSign } from 'lucide-react';
import DashboardCart from '@/components/DashboardCart';
import { createClient } from '@/lib/supabase/server';
import SubmissionStatusBadge from '@/components/SubmissionStatusBadge';
import type { PartSubmission } from '@/lib/supabase/db-types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function CreatorDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/creator/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/account');

  const { data: submissions } = await supabase
    .from('part_submissions')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  const allSubs = (submissions ?? []) as PartSubmission[];
  const pending = allSubs.filter((s) => s.status === 'pending' || s.status === 'under_review');
  const approved = allSubs.filter((s) => s.status === 'approved');
  const rejected = allSubs.filter((s) => s.status === 'rejected');

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#39ff14] mb-1">Creator Dashboard</p>
              <h1 className="text-3xl font-black text-white">
                Hey, {profile.name.split(' ')[0]} 👋
              </h1>
              <p className="text-zinc-500 text-sm mt-1">@{profile.handle}</p>
            </div>
            <Link href="/creator/submit" className="btn-primary px-6 py-3 text-sm rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Submit New Part
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Submitted', value: allSubs.length, icon: FileText, color: 'text-zinc-400' },
            { label: 'Pending Review', value: pending.length, icon: Clock, color: 'text-amber-400' },
            { label: 'Approved', value: approved.length, icon: CheckCircle, color: 'text-[#39ff14]' },
            { label: 'Rejected', value: rejected.length, icon: XCircle, color: 'text-red-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Profile status */}
        {!profile.verified && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 mb-8 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-400 mb-1">Profile Under Review</p>
              <p className="text-xs text-zinc-400">
                Our team is reviewing your creator application. You can submit parts now — they'll be reviewed once your profile is verified.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submissions list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white">Your Scans</h2>
              <Link href="/creator/submit" className="btn-primary px-4 py-2 text-xs rounded-lg inline-flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> New
              </Link>
            </div>

            {allSubs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#2a2a2a] p-12 text-center">
                <Printer className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white mb-2">No submissions yet</h3>
                <p className="text-sm text-zinc-500 mb-6">Upload your first part to get started.</p>
                <Link href="/creator/submit" className="btn-primary px-6 py-3 text-sm rounded-lg inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Submit a Scan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {allSubs.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/creator/submissions/${sub.id}`}
                    className="flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#39ff14]/30 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                      <Printer className="w-6 h-6 text-zinc-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-[#39ff14] transition-colors truncate">
                        {sub.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {sub.make} · {sub.model} · {sub.category}
                      </p>
                      <p className="text-[10px] text-zinc-700 mt-0.5">{formatDate(sub.created_at)}</p>
                    </div>
                    <div className="shrink-0">
                      <SubmissionStatusBadge status={sub.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Cart */}
            <DashboardCart />

            {/* Profile card */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Your Profile</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#252525] border border-[#2a2a2a] flex items-center justify-center">
                  <span className="text-lg font-black text-[#39ff14]">{profile.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{profile.name}</p>
                  <p className="text-xs text-zinc-500">@{profile.handle}</p>
                </div>
              </div>
              {profile.vehicle_specialties && (
                <p className="text-xs text-zinc-400 mb-3">{profile.vehicle_specialties}</p>
              )}
              <div className="pt-3 border-t border-[#1e1e1e]">
                <p className="text-[10px] text-zinc-600">Status: {profile.verified ? '✅ Verified Creator' : '⏳ Pending Verification'}</p>
              </div>
            </div>

            {/* Earnings placeholder */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Earnings</h3>
              <DollarSign className="w-6 h-6 text-zinc-700 mb-2" />
              <p className="text-sm text-zinc-500">
                Earnings dashboard coming soon. You'll see downloads, printed order royalties, and payout history here.
              </p>
            </div>

            {/* Quick guide */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Submission Tips</h3>
              <ul className="space-y-3">
                {[
                  'Include both STL and 3MF formats',
                  'Validated print settings = faster approval',
                  'Fitment photos speed up verification',
                  'Clear install notes = better reviews',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="text-[#39ff14] mt-0.5 shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
