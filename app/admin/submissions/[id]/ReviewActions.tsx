'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import type { SubmissionStatus } from '@/lib/supabase/db-types';

interface ReviewActionsProps {
  submissionId: string;
  currentStatus: SubmissionStatus;
  currentNotes: string | null;
  hasFiles: boolean;
}

export default function ReviewActions({
  submissionId,
  currentStatus,
  currentNotes,
  hasFiles,
}: ReviewActionsProps) {
  const router = useRouter();
  const [adminNotes, setAdminNotes] = useState(currentNotes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = async (status: SubmissionStatus) => {
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/update-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, status, adminNotes }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Review Decision</h3>

      <div className="mb-4">
        <label className="block text-xs text-zinc-500 mb-2">
          Admin Notes <span className="text-zinc-700">(shown to creator on rejection)</span>
        </label>
        <textarea
          rows={4}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Required for rejection. Optional for approval. E.g. 'No fitment photos — please resubmit with install photos.'"
          className="w-full rounded-lg px-3 py-2.5 text-xs resize-none"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 mb-4">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => update('under_review')}
          disabled={loading || currentStatus === 'under_review'}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          Mark Under Review
        </button>

        <button
          onClick={() => update('approved')}
          disabled={loading || !hasFiles}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Approve & Publish
        </button>

        <button
          onClick={() => update('rejected')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Reject
        </button>
      </div>

      <p className="text-[10px] text-zinc-700 mt-4 text-center">
        Approved parts are immediately visible on the browse page.
      </p>
    </div>
  );
}
