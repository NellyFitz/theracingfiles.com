'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Download, ShoppingBag, Wrench, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/creator/login'); return; }
      setUser(user);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-700/30 border border-zinc-700/40 flex items-center justify-center">
              <User className="w-7 h-7 text-zinc-300" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Member Account</p>
              <h1 className="text-2xl font-black text-white">{user?.email}</h1>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-2 gap-5">

        <Link href="/account/orders" className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 hover:border-zinc-600 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-[#E8000D]" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
          </div>
          <p className="text-sm font-black text-white">My Downloads</p>
          <p className="text-xs text-zinc-500 mt-1">Access all purchased digital files</p>
        </Link>

        <Link href="/account/orders" className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 hover:border-zinc-600 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
          </div>
          <p className="text-sm font-black text-white">Order History</p>
          <p className="text-xs text-zinc-500 mt-1">View all past purchases</p>
        </Link>

        <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#0d0d0d] p-6 sm:col-span-2">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-[#E8000D]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white mb-1">Want to sell parts?</p>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                Apply for a Creator account to upload and sell 3D printable parts on the marketplace. Applications are reviewed within 48 hours.
              </p>
              <Link
                href="/creator/signup?type=creator"
                className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 text-xs rounded-xl"
              >
                Apply to Become a Creator <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
