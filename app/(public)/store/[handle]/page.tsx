'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Wrench, Cpu, Star, CheckCircle, Printer, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { subToProduct } from '@/lib/productHelpers';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

export default function StorefrontPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const [creator, setCreator] = useState<any>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from('user_profiles')
      .select('*')
      .eq('handle', handle)
      .single()
      .then(async ({ data: prof }) => {
        if (!prof) { setLoading(false); return; }
        setCreator(prof);

        const { data: subs } = await supabase
          .from('part_submissions')
          .select('*, user_profiles(name, handle)')
          .eq('creator_id', prof.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        setListings((subs ?? []).map(subToProduct));
        setLoading(false);
      });
  }, [handle]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
      </main>
    );
  }

  if (!creator) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-white font-bold text-lg">Creator not found</p>
        <Link href="/browse" className="text-sm text-[#E8000D] hover:text-white transition-colors">← Back to Marketplace</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          <div className="flex items-start gap-5 flex-wrap">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0">
              <span className="text-3xl font-black text-[#39ff14]">{creator.name?.charAt(0) ?? '?'}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-black text-white">{creator.name}</h1>
                {creator.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#39ff14]/10 text-[#39ff14]">
                    <CheckCircle className="w-3 h-3" /> Verified Creator
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 mb-3">@{creator.handle}</p>

              {creator.bio && (
                <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mb-4">{creator.bio}</p>
              )}

              <div className="flex flex-wrap gap-4">
                {creator.vehicle_specialties && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-xs text-zinc-400">{creator.vehicle_specialties}</span>
                  </div>
                )}
                {creator.software && (
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-xs text-zinc-400">{creator.software}</span>
                  </div>
                )}
                {creator.experience_level && (
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-xs text-zinc-400">{creator.experience_level}</span>
                  </div>
                )}
                {creator.website && (
                  <a href={creator.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#39ff14] transition-colors">
                    <Globe className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-xs text-zinc-400 hover:text-[#39ff14]">{creator.website}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Stat */}
            <div className="shrink-0 text-right">
              <p className="text-2xl font-black text-white">{listings.length}</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Listing{listings.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-lg font-black text-white mb-6">
          Parts by {creator.name}
        </h2>

        {listings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2a2a2a] p-16 text-center">
            <Printer className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-base font-bold text-white mb-1">No listings yet</p>
            <p className="text-sm text-zinc-500">This creator hasn't published any parts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
