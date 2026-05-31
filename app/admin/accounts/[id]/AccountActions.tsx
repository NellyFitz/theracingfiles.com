'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AccountActionsProps {
  creatorId: string;
  isVerified: boolean;
}

export default function AccountActions({ creatorId, isVerified }: AccountActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = async (action: 'approve' | 'reject') => {
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/update-creator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, action }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      setLoading(false);
      return;
    }

    router.push('/admin/accounts');
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Verification</h3>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 mb-4">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => update('approve')}
          disabled={loading || isVerified}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {isVerified ? 'Already Verified' : 'Approve & Verify'}
        </button>

        <button
          onClick={() => update('reject')}
          disabled={loading || !isVerified}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Revoke Verification
        </button>
      </div>

      <p className="text-[10px] text-zinc-700 mt-4 text-center">
        Verified creators can submit scans for review.
      </p>
    </div>
  );
}
