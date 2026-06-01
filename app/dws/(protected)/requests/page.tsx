import DwsNav from '@/components/DwsNav';
import { createAdminClient } from '@/lib/supabase/admin';
import RequestsPageClient from './RequestsPageClient';

export default async function RequestsPage() {
  const admin = createAdminClient();

  const [requestsRes, creatorsRes] = await Promise.all([
    admin.from('part_requests').select('*').order('created_at', { ascending: false }),
    admin.from('creator_profiles').select('id, name, handle, vehicle_specialties, experience_level, approved, verified').eq('approved', true),
  ]);

  return (
    <>
      <DwsNav />
      <RequestsPageClient
        initialRequests={requestsRes.data ?? []}
        creators={creatorsRes.data ?? []}
        error={requestsRes.error?.message}
      />
    </>
  );
}
