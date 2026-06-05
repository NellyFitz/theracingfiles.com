import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileBox } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminNav from '@/components/AdminNav';
import AccountActions from './AccountActions';
import SubmissionStatusBadge from '@/components/SubmissionStatusBadge';
import type { CreatorProfile, PartSubmission } from '@/lib/supabase/db-types';
import { use } from 'react';

function InfoRow({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  return (
    <div className="flex justify-between py-2.5 border-b border-[#1e1e1e] last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs text-zinc-200 text-right max-w-[60%]">{display ?? '—'}</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function AdminAccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect('/creator/dashboard');
  }

  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) notFound();
  const creator = profile as CreatorProfile;

  const { data: submissions } = await adminClient
    .from('part_submissions')
    .select('id, name, status, make, model, created_at')
    .eq('creator_id', id)
    .order('created_at', { ascending: false });

  const subs = (submissions ?? []) as Pick<PartSubmission, 'id' | 'name' | 'status' | 'make' | 'model' | 'created_at'>[];

  return (
    <main className="min-h-screen">
      <AdminNav />

      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/admin/accounts" className="text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-white">{creator.name}</h1>
              <p className="text-xs text-zinc-500">@{creator.handle} · Joined {formatDate(creator.created_at)}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              creator.verified && creator.approved
                ? 'bg-[#39ff14]/10 text-[#39ff14]'
                : 'bg-amber-500/10 text-amber-400'
            }`}>
              {creator.verified && creator.approved ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: profile details + submissions */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Profile</h3>
              <InfoRow label="Name" value={creator.name} />
              <InfoRow label="Handle" value={`@${creator.handle}`} />
              <InfoRow label="Experience Level" value={creator.experience_level} />
              <InfoRow label="Vehicle Specialties" value={creator.vehicle_specialties} />
              <InfoRow label="Software Used" value={creator.software} />
              <InfoRow label="Website" value={creator.website} />
              <InfoRow label="Verified" value={creator.verified} />
              <InfoRow label="Approved" value={creator.approved} />
            </div>

            {creator.bio && (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Bio</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{creator.bio}</p>
              </div>
            )}

            {/* Submissions by this creator */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                Scan Submissions ({subs.length})
              </h3>
              {subs.length === 0 ? (
                <div className="flex items-center gap-3 py-4 text-zinc-600">
                  <FileBox className="w-5 h-5" />
                  <p className="text-sm">No scans submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {subs.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/admin/submissions/${sub.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1e1e1e] transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-[#39ff14] transition-colors truncate">
                          {sub.name}
                        </p>
                        <p className="text-xs text-zinc-600">{sub.make} · {sub.model} · {formatDate(sub.created_at)}</p>
                      </div>
                      <SubmissionStatusBadge status={sub.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div>
            <AccountActions creatorId={creator.id} isVerified={creator.verified && creator.approved} />
          </div>
        </div>
      </div>
    </main>
  );
}
