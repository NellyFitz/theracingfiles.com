import { createAdminClient } from '@/lib/supabase/admin';
import DwsNav from '@/components/DwsNav';
import ScansPageClient from './ScansPageClient';
import type { PartSubmission, SubmissionStatus } from '@/lib/supabase/db-types';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'pending' } = await searchParams;
  const supabase = createAdminClient();

  const { data: allSubs } = await supabase
    .from('part_submissions')
    .select('id, status');

  const counts = {
    pending:      allSubs?.filter((s) => s.status === 'pending').length      ?? 0,
    under_review: allSubs?.filter((s) => s.status === 'under_review').length ?? 0,
    approved:     allSubs?.filter((s) => s.status === 'approved').length     ?? 0,
    rejected:     allSubs?.filter((s) => s.status === 'rejected').length     ?? 0,
  };

  let query = supabase
    .from('part_submissions')
    .select('*, user_profiles(name, handle, bio, software, experience_level)')
    .order('created_at', { ascending: true });

  if (status !== 'all') {
    query = query.eq('status', status as SubmissionStatus);
  }

  const { data: submissions } = await query;
  const subs = (submissions ?? []) as (PartSubmission & {
    user_profiles: { name: string; handle: string; bio: string | null; software: string | null; experience_level: string | null } | null;
  })[];

  return (
    <main className="min-h-screen">
      <DwsNav />
      <ScansPageClient initialSubs={subs} counts={counts} status={status} />
    </main>
  );
}
