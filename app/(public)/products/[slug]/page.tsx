'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import {
  Download, Printer, Wrench, Star, CheckCircle,
  ChevronRight, ArrowLeft, Settings2, BookOpen, Users,
  FlaskConical, Layers, Thermometer, Package, ShoppingCart, Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { subToProduct } from '@/lib/productHelpers';
import Badge from '@/components/Badge';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';
import { use } from 'react';

const TABS = ['Description', 'Fitment', 'Print Settings', 'Install Guide', 'Reviews'] as const;
type Tab = typeof TABS[number];

const mockReviews = [
  {
    id: 'r1',
    author: 'Carlos M.',
    rating: 5,
    date: 'March 2025',
    body: 'Fit like a glove. Printed in ASA on a Bambu X1C. Zero gap at the trunk lid interface. This thing looks factory.',
    vehicle: '1994 Mazda Miata NA',
    verified: true,
  },
  {
    id: 'r2',
    author: 'Jess T.',
    rating: 5,
    date: 'February 2025',
    body: "Print settings are spot on. Took about 11 hours total split across two parts. The template made drilling easy.",
    vehicle: '1991 Mazda Miata NA',
    verified: true,
  },
  {
    id: 'r3',
    author: 'Andre K.',
    rating: 4,
    date: 'January 2025',
    body: 'Solid design. I used PETG-CF instead of ASA and it held up fine. Minor warping at the edges on my first attempt but the second print was clean.',
    vehicle: '1996 Mazda Miata NA',
    verified: false,
  },
];

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Description');
  const [selectedTier, setSelectedTier] = useState<'file' | 'printed' | 'finished'>('file');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('part_submissions')
      .select('*, creator_profiles(name, handle)')
      .eq('id', slug)
      .eq('status', 'approved')
      .single()
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        const mapped = subToProduct(data);
        setProduct(mapped);
        // Fetch related (same make)
        supabase
          .from('part_submissions')
          .select('*, creator_profiles(name, handle)')
          .eq('status', 'approved')
          .eq('make', data.make)
          .neq('id', data.id)
          .limit(3)
          .then(({ data: rel }) => setRelated((rel ?? []).map(subToProduct)));
        setLoading(false);
      });
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      tier: selectedTier,
      price: selectedTier === 'file'
        ? product.filePrice
        : selectedTier === 'printed'
        ? product.printedPrice ?? null
        : null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#E8000D] animate-spin" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-white font-bold text-lg">Part not found</p>
        <Link href="/browse" className="text-sm text-[#E8000D] hover:text-white transition-colors">← Back to Marketplace</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/browse" className="hover:text-white transition-colors">Marketplace</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#39ff14] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>

        {/* Product header grid */}
        <div className="grid lg:grid-cols-5 gap-10 mb-16">
          {/* Left: image */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] aspect-[4/3] grid-bg flex items-center justify-center relative overflow-hidden">
              {/* Wireframe visual */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <div className="absolute inset-0 border-2 border-[#39ff14]/30 rounded-2xl rotate-12 animate-float" />
                  <div className="absolute inset-4 border-2 border-[#39ff14]/20 rounded-xl -rotate-6 animate-float" style={{ animationDelay: '1s' }} />
                  <div className="absolute inset-8 border-2 border-[#39ff14]/40 rounded-lg rotate-3 animate-float" style={{ animationDelay: '0.5s' }} />
                  <Printer className="absolute inset-0 m-auto w-12 h-12 text-[#39ff14] opacity-40" />
                </div>
                <p className="text-xs text-zinc-600 uppercase tracking-widest">{product.name}</p>
                <p className="text-[10px] text-zinc-700 mt-1">Render / Photos Coming Soon</p>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.badges.map((b) => (
                  <Badge key={b.type} type={b.type} size="md" />
                ))}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-3 mt-4">
              {['Front', 'Side', 'Install', 'Printed'].map((v) => (
                <div
                  key={v}
                  className="w-20 h-16 rounded-lg border border-[#2a2a2a] bg-[#141414] grid-bg flex items-center justify-center cursor-pointer hover:border-[#39ff14]/40 transition-colors"
                >
                  <p className="text-[9px] text-zinc-600 uppercase tracking-wider">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: info + purchase */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#39ff14] mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl font-black text-white leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{product.rating}</span>
              <span className="text-xs text-zinc-500">({product.reviewCount} reviews)</span>
            </div>

            {/* Fitment pill */}
            <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-3 py-1.5 mb-6">
              <CheckCircle className="w-3.5 h-3.5 text-[#39ff14]" />
              <span className="text-xs text-zinc-300">Fits: {product.fitment}</span>
            </div>

            {/* Tier selector */}
            <div className="space-y-3 mb-6">
              {/* File tier */}
              <button
                onClick={() => setSelectedTier('file')}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedTier === 'file'
                    ? 'border-[#39ff14]/50 bg-[#39ff14]/5'
                    : 'border-[#2a2a2a] bg-[#141414] hover:border-[#39ff14]/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedTier === 'file' ? 'border-[#39ff14]' : 'border-[#3a3a3a]'
                    }`}>
                      {selectedTier === 'file' && <div className="w-2 h-2 rounded-full bg-[#39ff14]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-[#39ff14]" />
                        <span className="text-sm font-bold text-white">Digital File</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">STL + 3MF + print settings + install notes</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-white">${product.filePrice}</span>
                </div>
              </button>

              {/* Printed tier */}
              {product.printedPrice && (
                <button
                  onClick={() => setSelectedTier('printed')}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedTier === 'printed'
                      ? 'border-[#00d4ff]/50 bg-[#00d4ff]/5'
                      : 'border-[#2a2a2a] bg-[#141414] hover:border-[#00d4ff]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedTier === 'printed' ? 'border-[#00d4ff]' : 'border-[#3a3a3a]'
                      }`}>
                        {selectedTier === 'printed' && <div className="w-2 h-2 rounded-full bg-[#00d4ff]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Printer className="w-4 h-4 text-[#00d4ff]" />
                          <span className="text-sm font-bold text-white">Pre-Printed</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">Printed in {product.material} · Ships in 5–7 days</p>
                      </div>
                    </div>
                    <span className="text-xl font-black text-white">${product.printedPrice}</span>
                  </div>
                </button>
              )}

              {/* Finished tier */}
              {product.finishedAvailable && (
                <button
                  onClick={() => setSelectedTier('finished')}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedTier === 'finished'
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : 'border-[#2a2a2a] bg-[#141414] hover:border-amber-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedTier === 'finished' ? 'border-amber-400' : 'border-[#3a3a3a]'
                      }`}>
                        {selectedTier === 'finished' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-bold text-white">Fully Finished</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">Sanded, primed, color-matched · Custom quote</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-amber-400">Quote</span>
                  </div>
                </button>
              )}
            </div>

            {/* CTA button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 text-sm rounded-xl mb-3 flex items-center justify-center gap-2 transition-all ${
                added
                  ? 'bg-green-600 text-white'
                  : 'btn-primary'
              }`}
            >
              {added ? (
                <><CheckCircle className="w-4 h-4" /> Added to Cart</>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {selectedTier === 'file' && <>Add to Cart — ${product.filePrice}</>}
                  {selectedTier === 'printed' && <>Add to Cart — ${product.printedPrice}</>}
                  {selectedTier === 'finished' && <>Add to Cart — Request Quote</>}
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-zinc-600">
              {selectedTier === 'file' ? 'Instant download after purchase. No DRM.' : 'Secure checkout powered by Stripe.'}
            </p>

            {/* Specs grid */}
            <div className="mt-6 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Material', value: product.material, icon: Layers },
                { label: 'Difficulty', value: product.difficulty, icon: Settings2 },
                { label: 'File Types', value: product.fileTypes.join(', '), icon: Package },
                { label: 'Fitment', value: product.badges.some(b => b.type === 'verified') ? 'Verified' : 'Community', icon: CheckCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest">
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                  <p className="text-xs font-semibold text-zinc-200">{value}</p>
                </div>
              ))}
            </div>

            {/* Creator card */}
            {creator && (
              <Link
                href="/creator"
                className="mt-4 flex items-center gap-3 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#39ff14]/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#39ff14]">
                    {creator.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500">Designer</p>
                  <p className="text-sm font-bold text-white group-hover:text-[#39ff14] transition-colors truncate">
                    {creator.name}
                  </p>
                  <p className="text-[10px] text-zinc-600">@{creator.handle} · ⭐ {creator.rating}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#39ff14] transition-colors shrink-0" />
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#1e1e1e] mb-8">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-[#39ff14] text-[#39ff14]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-3xl mb-16">
          {activeTab === 'Description' && (
            <div>
              <p className="text-zinc-300 leading-relaxed mb-6">{product.description}</p>
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-widest text-xs text-zinc-400">
                What&apos;s Included
              </h3>
              <ul className="space-y-2">
                {['STL file (split for 250×250mm bed)', '3MF file with pre-configured print settings', 'Drilling template PDF', 'Install guide PDF', 'Material recommendations sheet'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-[#39ff14] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'Fitment' && (
            <div>
              <div className="rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/5 p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#39ff14] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white mb-1">Verified Fitment</p>
                  <p className="text-xs text-zinc-400">This part has been physically tested and confirmed by the creator.</p>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-3">Fitment Details</h3>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">{product.fitmentNotes}</p>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                <p className="text-xs text-zinc-500 font-mono">Verified fit: {product.fitment}</p>
              </div>
            </div>
          )}

          {activeTab === 'Print Settings' && (
            <div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Layer Height', value: product.printSettings.layerHeight, icon: Layers },
                  { label: 'Infill', value: product.printSettings.infill, icon: Settings2 },
                  { label: 'Supports Required', value: product.printSettings.supports ? 'Yes' : 'No', icon: Package },
                  { label: 'Nozzle Temp', value: product.printSettings.nozzleTemp, icon: Thermometer },
                  { label: 'Bed Temp', value: product.printSettings.bedTemp, icon: Thermometer },
                  { label: 'Material', value: product.material, icon: Layers },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-[#39ff14]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
                    </div>
                    <p className="text-sm font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{product.printSettings.material}</p>
            </div>
          )}

          {activeTab === 'Install Guide' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-5 h-5 text-[#39ff14]" />
                <h3 className="text-sm font-bold text-white">Installation Notes</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-6">{product.installNotes}</p>
              <div className="rounded-xl border border-dashed border-[#2a2a2a] p-6 text-center">
                <Package className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">Full install guide PDF included with purchase</p>
                {/* TODO: Implement Cloudinary-backed document storage */}
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="text-center">
                  <p className="text-5xl font-black text-white">{product.rating}</p>
                  <div className="flex gap-0.5 justify-center my-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">{product.reviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5 ml-6">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : 2;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 w-2">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-1.5 bg-[#252525] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-zinc-600 w-6">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#252525] border border-[#2a2a2a] flex items-center justify-center">
                          <span className="text-xs font-bold text-[#39ff14]">{review.author.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white">{review.author}</p>
                            {review.verified && (
                              <span className="badge-verified text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-600">{review.vehicle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{review.body}</p>
                    <p className="text-[10px] text-zinc-600 mt-3">{review.date}</p>
                  </div>
                ))}
              </div>
              {/* TODO: Implement authenticated review submission with Supabase */}
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">More from {product.make}</h2>
              <Link href="/browse" className="text-sm text-[#39ff14] hover:text-white transition-colors">
                View all
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
