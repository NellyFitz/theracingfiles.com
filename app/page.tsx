import Link from 'next/link';
import {
  ArrowRight, Download, Printer, Wrench,
  CheckCircle, Settings2, BookOpen, Camera, Users,
  Star, Zap, ChevronRight,
} from 'lucide-react';
import { getFeaturedProducts, categories } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';

const howItWorks = [
  {
    step: '01',
    icon: Download,
    title: 'Download the File',
    description: 'Purchase verified STL/3MF files with print settings, material recommendations, and install guides included.',
    accent: '#39ff14',
  },
  {
    step: '02',
    icon: Printer,
    title: 'Order it Printed',
    description: 'No printer? Order a pre-printed part shipped to your door. Printed by vetted makers using the right materials.',
    accent: '#00d4ff',
  },
  {
    step: '03',
    icon: Wrench,
    title: 'Get it Finished',
    description: 'Need it sanded, painted, and ready to bolt on? Request a fully finished part from our creator network.',
    accent: '#ffa500',
  },
];

const trustFeatures = [
  { icon: CheckCircle, title: 'Verified Fitment', desc: 'Parts tested and confirmed on real vehicles before listing.' },
  { icon: Settings2, title: 'Print Settings Included', desc: 'Every file ships with validated slicer settings.' },
  { icon: BookOpen, title: 'Material Recommendations', desc: 'Know exactly what filament to use for safety and durability.' },
  { icon: Wrench, title: 'Install Guides', desc: 'Step-by-step PDF guides included with every file.' },
  { icon: Camera, title: 'Community Photos', desc: 'See real builds from real cars before you buy.' },
  { icon: Users, title: 'Creator Verified', desc: 'Every creator is vetted by the The Racing Files team.' },
];

const stats = [
  { value: '2,400+', label: 'Verified Parts' },
  { value: '180+', label: 'Creators' },
  { value: '14k+', label: 'Community Members' },
  { value: '98%', label: 'Fitment Accuracy' },
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <main>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-60" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-radial-gradient" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(57,255,20,0.07) 0%, transparent 70%)'
        }} />

        {/* Floating wireframe shapes */}
        <div className="absolute top-20 right-10 w-64 h-64 opacity-10 animate-float" style={{ animationDelay: '0s' }}>
          <div className="w-full h-full border border-[#39ff14] rounded-2xl rotate-12" />
          <div className="absolute inset-6 border border-[#39ff14] rounded-xl -rotate-6" />
          <div className="absolute inset-12 border border-[#39ff14] rounded-lg rotate-3" />
        </div>
        <div className="absolute bottom-20 left-10 w-40 h-40 opacity-8 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-full h-full border border-[#00d4ff] rounded-full" />
          <div className="absolute inset-4 border border-[#00d4ff] rounded-full" />
        </div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 opacity-10 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-full h-full border border-[#39ff14] rotate-45" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-[#39ff14]/10 border border-[#39ff14]/20 rounded-full px-4 py-1.5 mb-8">
              <Zap className="w-3.5 h-3.5 text-[#39ff14]" fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#39ff14]">
                Now in Beta — Join the Waitlist
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-white mb-6">
              The Digital<br />
              <span className="text-[#39ff14]">Parts Bin</span><br />
              for Enthusiast<br />Vehicles.
            </h1>

            <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl">
              Buy verified 3D printable files, order pre-printed parts, or request
              fully finished components for cars and bikes.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/browse" className="btn-primary px-8 py-4 text-sm rounded-lg flex items-center gap-2">
                Parts Marketplace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/request" className="btn-outline px-8 py-4 text-sm rounded-lg flex items-center gap-2">
                Request a Part
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-[#1e1e1e]">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 border-t border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="How The Racing Files Works"
            title="Three Ways to Get Your Part"
            subtitle="Whether you have a 3D printer or not, The Racing Files has you covered."
            centered
          />
          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative rounded-xl border border-[#2a2a2a] bg-[#141414] p-8 card-hover group"
                >
                  <div className="absolute top-6 right-6 text-5xl font-black text-[#1e1e1e] group-hover:text-[#252525] transition-colors font-mono">
                    {item.step}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: `${item.accent}15`, border: `1px solid ${item.accent}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.accent }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-24 border-t border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader
              eyebrow="Browse by Vehicle"
              title="Featured Categories"
            />
            <Link
              href="/browse"
              className="hidden sm:flex items-center gap-1.5 text-sm text-[#39ff14] hover:text-white transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.id}`}
                className="group rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 card-hover flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-[10px] font-mono text-zinc-600 bg-[#1e1e1e] px-2 py-0.5 rounded">
                    {cat.count}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#39ff14] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-zinc-600 mt-0.5 leading-tight">{cat.description}</p>
                </div>
              </Link>
            ))}
            {/* Browse all tile */}
            <Link
              href="/browse"
              className="rounded-xl border border-dashed border-[#2a2a2a] bg-transparent p-5 card-hover flex flex-col items-center justify-center gap-2 text-center group"
            >
              <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-[#39ff14] transition-colors" />
              <p className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                Browse All Parts
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-24 border-t border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why The Racing Files"
            title="Built for Builders Who Care"
            subtitle="Every part on The Racing Files meets our quality and fitment standards before it's listed."
            centered
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trustFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 card-hover group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#39ff14]" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{f.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-24 border-t border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader
              eyebrow="Featured Parts"
              title="Top Rated This Week"
            />
            <Link
              href="/browse"
              className="hidden sm:flex items-center gap-1.5 text-sm text-[#39ff14] hover:text-white transition-colors"
            >
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CREATOR CTA ── */}
      <section className="py-24 border-t border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl border border-[#39ff14]/20 bg-[#0d1a0a] overflow-hidden p-10 sm:p-16">
            {/* Background pattern */}
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(57,255,20,0.06) 0%, transparent 70%)'
            }} />

            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#39ff14] mb-4">For Creators</p>
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                  Design parts?<br />
                  <span className="text-[#39ff14]">Sell through The Racing Files.</span>
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-8">
                  Upload your designs, set your price, and let The Racing Files handle fulfillment, payments, and support.
                  Earn royalties on every file download and printed order.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/creator" className="btn-primary px-8 py-4 text-sm rounded-lg flex items-center gap-2">
                    Apply as Creator
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/creator" className="btn-outline px-8 py-4 text-sm rounded-lg">
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-4">
                {[
                  { value: '70%', label: 'Revenue share on file sales' },
                  { value: '15%', label: 'Royalty on printed orders' },
                  { value: '$0', label: 'Listing fee' },
                  { value: '7 days', label: 'Average payout cycle' },
                ].map((item) => (
                  <div key={item.label} className="bg-[#0d0d0d]/60 border border-[#2a2a2a] rounded-xl p-5">
                    <p className="text-2xl font-black text-[#39ff14] mb-1">{item.value}</p>
                    <p className="text-xs text-zinc-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-16 border-t border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                quote: "Printed the NA ducktail and it fit perfectly. No gaps, no shimming. Couldn't believe it.",
                author: 'Mike R.',
                vehicle: '1994 Miata',
              },
              {
                quote: "Found a MOLLE panel for my Tacoma I couldn't get anywhere else. Printed in PETG-CF and it's bomber.",
                author: 'Tyler W.',
                vehicle: '2019 Tacoma TRD',
              },
              {
                quote: "Ordered a printed R6 clip set and it showed up in 4 days. OEM would have been $40 and 6 weeks.",
                author: 'Kenji S.',
                vehicle: '2008 YZF-R6',
              },
            ].map((t) => (
              <div
                key={t.author}
                className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 card-hover"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">"{t.quote}"</p>
                <div className="border-t border-[#1e1e1e] pt-4">
                  <p className="text-sm font-bold text-white">{t.author}</p>
                  <p className="text-xs text-zinc-600">{t.vehicle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
