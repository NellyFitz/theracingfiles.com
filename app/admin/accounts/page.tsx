import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminNav from '@/components/AdminNav';
import AccountsClient from './AccountsClient';
import type { CreatorProfile } from '@/lib/supabase/db-types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect('/creator/dashboard');
  }

  const { filter = 'pending' } = await searchParams;
  const adminClient = createAdminClient();

  const { data: allProfiles } = await adminClient
    .from('user_profiles')
    .select('id, verified, approved');

  const counts = {
    pending: allProfiles?.filter((p) => !p.verified && !p.approved).length ?? 0,
    approved: allProfiles?.filter((p) => p.verified && p.approved).length ?? 0,
    rejected: allProfiles?.filter((p) => !p.verified && p.approved === false).length ?? 0,
  };

  let query = adminClient
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (filter === 'pending') {
    query = query.eq('verified', false).eq('approved', false);
  } else if (filter === 'approved') {
    query = query.eq('verified', true).eq('approved', true);
  }

  const { data: profiles } = await query;
  const creators = (profiles ?? []) as CreatorProfile[];

  const tabs = [
    { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-400', count: counts.pending },
    { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-[#39ff14]', count: counts.approved },
    { key: 'all', label: 'All', icon: User, color: 'text-zinc-400', count: (allProfiles?.length ?? 0) },
  ];

  return (
    <main className="min-h-screen">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Creator Accounts</h1>
          <p className="text-zinc-500 text-sm mt-1">Review and verify creator applications.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {([
            { label: 'Awaiting Verification', value: counts.pending, icon: Clock, color: 'text-amber-400' },
            { label: 'Approved', value: counts.approved, icon: CheckCircle, color: 'text-[#39ff14]' },
            { label: 'Total Creators', value: allProfiles?.length ?? 0, icon: User, color: 'text-zinc-400' },
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
            <Link
              key={key}
              href={`/admin/accounts?filter=${key}`}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                filter === key
                  ? 'border-[#39ff14] text-[#39ff14]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${filter === key ? 'text-[#39ff14]' : color}`} />
              {label}
              <span className="bg-[#2a2a2a] text-zinc-400 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {count}
              </span>
            </Link>
          ))}
        </div>

        {/* List with modal */}
        <AccountsClient creators={creators} />
      </div>
    </main>
  );
}
