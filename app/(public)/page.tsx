import Link from 'next/link';
import {
  ArrowRight, Download, Printer, Wrench,
  CheckCircle, Settings2, BookOpen, Camera, Users,
  Star, Zap, ChevronRight,
} from 'lucide-react';
import { getFeaturedProducts, categories } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

const howItWorks = [
  {
    step: '01',
    icon: Download,
    title: 'Download the File',
    description: 'Purchase verified STL/3MF files with validated print settings, material specs, and install guides.',
  },
  {
    step: '02',
    icon: Printer,
    title: 'Order It Printed',
    description: 'No printer? Order pre-printed parts shipped to your door — built by vetted makers using the right materials.',
  },
  {
    step: '03',
    icon: Wrench,
    title: 'Get It Finished',
    description: 'Need it sanded, painted, and bolt-on ready? Request a fully finished part from our creator network.',
  },
];

const trustFeatures = [
  { icon: CheckCircle, title: 'Verified Fitment',          desc: 'Parts tested on real vehicles before listing.' },
  { icon: Settings2,  title: 'Print Settings Included',   desc: 'Every file ships with validated slicer settings.' },
  { icon: BookOpen,   title: 'Material Recommendations',  desc: 'Exact filament spec for safety and durability.' },
  { icon: Wrench,     title: 'Install Guides',            desc: 'Step-by-step PDF guides with every file purchase.' },
  { icon: Camera,     title: 'Community Photos',          desc: 'Real builds, real cars — before you buy.' },
  { icon: Users,      title: 'Creator Verified',          desc: 'Every creator vetted by The Racing Files team.' },
];

const stats = [
  { value: '2,400+', label: 'Verified Parts' },
  { value: '180+',   label: 'Creators' },
  { value: '14k+',   label: 'Community Members' },
  { value: '98%',    label: 'Fitment Accuracy' },
];

const testimonials = [
  { quote: "Printed the NA ducktail and it fit perfectly. No gaps, no shimming. Couldn't believe it.", author: 'Mike R.', vehicle: '1994 Mazda Miata' },
  { quote: "Found a MOLLE panel for my Tacoma I couldn't get anywhere else. Printed in PETG-CF — bomber.", author: 'Tyler W.', vehicle: '2019 Tacoma TRD' },
  { quote: "Ordered a printed R6 clip set, showed up in 4 days. OEM would've been $40 and 6 weeks.", author: 'Kenji S.', vehicle: '2008 YZF-R6' },
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <main>

      {/* ── HERO ── */}
      <section className="relative h-[calc(100vh-4rem)] flex items-center overflow-hidden carbon-bg">
        <div className="absolute inset-0 grid-bg opacity-70" />
        <div className="absolute inset-0 speed-lines opacity-60" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 55% at 30% 55%, rgba(232,0,13,0.055) 0%, transparent 65%)'
        }} />

        {/* Vertical accent line */}
        <div className="absolute top-0 right-[20%] w-px h-full opacity-10"
          style={{ background: 'linear-gradient(180deg, transparent, #E8000D 40%, transparent)' }} />

        {/* Corner brackets */}
        <div className="absolute top-20 left-8 w-10 h-10 opacity-25 hidden lg:block">
          <div className="absolute top-0 left-0 w-full h-px bg-[#E8000D]" />
          <div className="absolute top-0 left-0 h-full w-px bg-[#E8000D]" />
        </div>
        <div className="absolute bottom-24 right-8 w-10 h-10 opacity-25 hidden lg:block">
          <div className="absolute bottom-0 right-0 w-full h-px bg-[#E8000D]" />
          <div className="absolute bottom-0 right-0 h-full w-px bg-[#E8000D]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-[#E8000D]" />
              <span className="eyebrow">Now in Beta — Join the Waitlist</span>
            </div>

            <h1 className="font-black text-white mb-6"
              style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)', letterSpacing: '-0.03em', lineHeight: '0.92' }}>
              THE DIGITAL<br />
              <span className="text-[#E8000D]">PARTS BIN</span><br />
              FOR ENTHUSIASTS.
            </h1>

            <p className="text-base text-zinc-400 leading-relaxed mb-10 max-w-lg">
              Verified 3D printable files, pre-printed parts, and fully finished components
              for cars, bikes, and trucks. Built by enthusiasts. For enthusiasts.
            </p>

            <div className="flex flex-wrap gap-3 mb-20">
              <Link href="/browse" className="btn-primary px-8 py-4 text-sm flex items-center gap-2 rounded-none">
                Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/request" className="btn-outline px-8 py-4 text-sm flex items-center gap-2 rounded-none">
                Request a Part <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats — spec sheet */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#1e1e1e]">
              {stats.map((s, i) => (
                <div key={s.label} className={`p-6 ${i < stats.length - 1 ? 'border-r border-[#1e1e1e]' : ''}`}>
                  <p className="font-black text-[#E8000D]"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {s.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagonal bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#080808]"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between mb-16 flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#E8000D]" />
                <span className="eyebrow">How It Works</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white"
                style={{ letterSpacing: '-0.03em' }}>
                THREE WAYS<br />TO GET YOUR PART
              </h2>
            </div>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed self-end">
              Whether you run a 3D printer or not — The Racing Files has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-[#181818]">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative bg-[#080808] p-8 group hover:bg-[#0c0c0c] transition-colors">
                  <div className="absolute top-6 right-6 font-black text-[#111] select-none"
                    style={{ fontSize: '5rem', lineHeight: 1 }}>
                    {item.step}
                  </div>
                  <div className="w-8 h-0.5 bg-[#E8000D] mb-8" />
                  <div className="w-10 h-10 border border-[#222] flex items-center justify-center mb-6 group-hover:border-[#E8000D]/40 transition-colors">
                    <Icon className="w-5 h-5 text-[#E8000D]" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-28 carbon-bg border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#E8000D]" />
                <span className="eyebrow">Browse by Vehicle</span>
              </div>
              <h2 className="text-4xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                FEATURED CATEGORIES
              </h2>
            </div>
            <Link href="/browse" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8000D] hover:text-white transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-[#181818]">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/browse?category=${cat.id}`}
                className="group bg-[#080808] hover:bg-[#0c0c0c] p-5 transition-colors flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-mono text-zinc-700 bg-[#111] px-2 py-0.5">{cat.count}</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-[#E8000D] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-zinc-600 mt-0.5 leading-tight">{cat.description}</p>
                </div>
                <div className="w-4 h-px bg-[#222] group-hover:w-full group-hover:bg-[#E8000D]/30 transition-all duration-300" />
              </Link>
            ))}
            <Link href="/browse"
              className="bg-[#080808] hover:bg-[#0c0c0c] p-5 transition-colors flex flex-col items-center justify-center gap-2 text-center group border border-dashed border-[#1a1a1a]">
              <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-[#E8000D] transition-colors" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-300 transition-colors">
                Browse All
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PARTS ── */}
      <section className="py-28 bg-[#080808] border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#E8000D]" />
                <span className="eyebrow">Featured Parts</span>
              </div>
              <h2 className="text-4xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                TOP RATED THIS WEEK
              </h2>
            </div>
            <Link href="/browse" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8000D] hover:text-white transition-colors">
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#181818]">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-28 carbon-bg border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#E8000D]" />
              <span className="eyebrow">Why The Racing Files</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
              BUILT FOR BUILDERS<br />WHO CARE.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#181818]">
            {trustFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-[#080808] hover:bg-[#0c0c0c] p-7 transition-colors group race-stripe-top">
                  <div className="w-8 h-8 border border-[#222] flex items-center justify-center mb-5 group-hover:border-[#E8000D]/40 transition-colors">
                    <Icon className="w-4 h-4 text-[#E8000D]" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">{f.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CREATOR CTA ── */}
      <section className="py-28 bg-[#080808] border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden carbon-bg border border-[#1e1e1e] p-10 sm:p-16">
            <div className="absolute inset-0 speed-lines opacity-40" />
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 50% 80% at 85% 50%, rgba(232,0,13,0.05) 0%, transparent 70%)'
            }} />
            <div className="absolute top-0 left-0 w-16 h-16 opacity-35">
              <div className="absolute top-0 left-0 w-full h-px bg-[#E8000D]" />
              <div className="absolute top-0 left-0 h-full w-px bg-[#E8000D]" />
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 opacity-35">
              <div className="absolute bottom-0 right-0 w-full h-px bg-[#E8000D]" />
              <div className="absolute bottom-0 right-0 h-full w-px bg-[#E8000D]" />
            </div>

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-8 bg-[#E8000D]" />
                  <span className="eyebrow">For Creators</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4"
                  style={{ letterSpacing: '-0.03em' }}>
                  DESIGN PARTS?<br />
                  <span className="text-[#E8000D]">SELL THROUGH US.</span>
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-8 text-sm max-w-md">
                  Upload your scans, set your price, and let The Racing Files handle fulfillment,
                  payments, and support. Earn royalties on every file and printed order.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/creator" className="btn-primary px-8 py-4 text-sm flex items-center gap-2 rounded-none">
                    Apply as Creator <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/creator" className="btn-outline px-8 py-4 text-sm rounded-none">
                    Learn More
                  </Link>
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-2 gap-px bg-[#181818]">
                {[
                  { value: '70%',    label: 'Revenue on file sales' },
                  { value: '15%',    label: 'Royalty on printed orders' },
                  { value: '$0',     label: 'Listing fee' },
                  { value: '7 days', label: 'Average payout cycle' },
                ].map((item) => (
                  <div key={item.label} className="bg-[#0a0a0a] p-7">
                    <p className="font-black text-[#E8000D] mb-1"
                      style={{ fontSize: '2.25rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {item.value}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-24 carbon-bg border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-px w-8 bg-[#E8000D]" />
            <span className="eyebrow">From the Community</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-px bg-[#181818]">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-[#080808] hover:bg-[#0c0c0c] p-7 transition-colors">
                <div className="flex gap-0.5 mb-5">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-6">"{t.quote}"</p>
                <div className="border-t border-[#151515] pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white">{t.author}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-widest">{t.vehicle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA STRIP ── */}
      <section className="bg-[#E8000D] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Zap className="w-5 h-5 text-[#080808]" fill="currentColor" />
            <p className="text-[#080808] font-black text-sm uppercase tracking-widest">
              The Racing Files — Find Your Part Today
            </p>
          </div>
          <Link href="/browse"
            className="flex items-center gap-2 bg-[#080808] text-[#E8000D] font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#111] transition-colors">
            Browse Parts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </main>
  );
}
