'use client';

import { useState } from 'react';
import {
  Upload, DollarSign, Printer, Star, ArrowRight,
  CheckCircle, Users, Shield, Zap, ChevronDown, ChevronUp,
} from 'lucide-react';
import { creators } from '@/lib/data';
import SectionHeader from '@/components/SectionHeader';
import type { CreatorApplication } from '@/lib/types';

const perks = [
  {
    icon: DollarSign,
    title: '70% Revenue Share',
    desc: 'Keep 70% of every digital file sale. No surprise fees or hidden charges.',
    accent: '#39ff14',
  },
  {
    icon: Printer,
    title: 'The Racing Files Fulfills',
    desc: 'We handle printing, shipping, and support for physical orders. You earn 15% royalty.',
    accent: '#00d4ff',
  },
  {
    icon: Shield,
    title: 'DMCA Protection',
    desc: 'We actively monitor and takedown unauthorized copies of your designs.',
    accent: '#ffa500',
  },
  {
    icon: Star,
    title: 'Creator Reputation',
    desc: 'Build a verified profile with ratings, sales count, and specialization badges.',
    accent: '#a78bfa',
  },
  {
    icon: Users,
    title: 'Community Feedback',
    desc: 'Get real fitment data and user photos directly from the builder community.',
    accent: '#39ff14',
  },
  {
    icon: Zap,
    title: 'Fast Payouts',
    desc: '7-day rolling payouts via Stripe. No minimum threshold.',
    accent: '#00d4ff',
  },
];

const steps = [
  { num: '01', title: 'Apply & Get Approved', desc: 'Submit your application and portfolio. We review within 48 hours.' },
  { num: '02', title: 'Upload Your Designs', desc: 'Submit your STL/3MF files, print settings, and fitment documentation.' },
  { num: '03', title: 'We Review & List', desc: 'Our team verifies fitment and quality before listing. Keeps the standard high.' },
  { num: '04', title: 'Earn & Grow', desc: 'Collect revenue on downloads, earn royalties on printed orders, build your following.' },
];

const faqs = [
  {
    q: 'What file formats are supported?',
    a: 'STL, 3MF, and STEP files. We recommend including all three. 3MF with pre-configured print profiles is strongly preferred.',
  },
  {
    q: 'How does fitment verification work?',
    a: 'You submit the part with fitment documentation (photos, measurements). Our team or community validators test on real vehicles. Parts that pass get the Verified Fitment badge.',
  },
  {
    q: 'Can I sell the same part on other platforms?',
    a: 'Yes. We are non-exclusive. However, exclusives get promotional placement on the homepage and in category features.',
  },
  {
    q: 'Do I need to own the original vehicle to design for it?',
    a: 'No. You need accurate dimensions and fitment data. Many creators use public CAD data, OEM measurements, or collaborate with owners.',
  },
  {
    q: 'How do printed order fulfillment royalties work?',
    a: 'When a customer orders a printed part, The Racing Files handles printing, shipping, and support. You earn 15% of the printed sale price automatically.',
  },
];

const defaultForm: CreatorApplication = {
  name: '',
  email: '',
  portfolio: '',
  experience: '',
  software: '',
  motivation: '',
};

export default function CreatorPage() {
  const [form, setForm] = useState<CreatorApplication>(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to Supabase creator_applications table
    // TODO: Send confirmation email via Resend
    setSubmitted(true);
  };

  const update = (k: keyof CreatorApplication, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <main>
      {/* Hero */}
      <section className="relative border-b border-[#1e1e1e] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(57,255,20,0.06) 0%, transparent 70%)'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-[#39ff14]/10 border border-[#39ff14]/20 rounded-full px-4 py-1.5 mb-8">
            <Upload className="w-3.5 h-3.5 text-[#39ff14]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#39ff14]">Creator Program</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
            Design Parts.<br />
            <span className="text-[#39ff14]">Get Paid.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Upload your designs once. Earn royalties every time someone downloads a file or orders a printed part.
            The Racing Files handles everything else.
          </p>
          <a href="#apply" className="btn-primary px-10 py-4 text-sm rounded-xl inline-flex items-center gap-2">
            Apply as Creator <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { value: '180+', label: 'Active Creators' },
              { value: '$340K', label: 'Paid Out to Creators' },
              { value: '2,400+', label: 'Parts Listed' },
              { value: '70%', label: 'Revenue Share' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-[#39ff14]">{s.value}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Perks */}
      <section className="py-24 border-b border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why Sell on The Racing Files"
            title="Built for Designers Who Build Real"
            centered
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 card-hover">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: `${p.accent}15`, border: `1px solid ${p.accent}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: p.accent }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="The Process" title="How Creator Onboarding Works" centered />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-[#2a2a2a] z-0" style={{ width: 'calc(100% - 2rem)', left: '100%' }} />
                )}
                <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 relative">
                  <span className="text-4xl font-black text-[#1e1e1e] font-mono block mb-4">{s.num}</span>
                  <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured creators */}
      <section className="py-24 border-b border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Community" title="Meet Our Top Creators" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {creators.map((creator) => (
              <div key={creator.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 card-hover">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-[#39ff14]">{creator.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{creator.name}</h3>
                    <p className="text-xs text-zinc-500">@{creator.handle}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-zinc-400 font-mono">{creator.rating}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">{creator.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {creator.badges.map((b) => (
                    <span key={b} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#2a2a2a] text-zinc-500">
                      {b}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 pt-4 border-t border-[#1e1e1e]">
                  <div>
                    <p className="text-sm font-black text-white">{creator.partCount}</p>
                    <p className="text-[10px] text-zinc-600">Parts</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{creator.sales.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-600">Sales</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="FAQ" title="Creator Questions" centered />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-[#39ff14] shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Apply Now" title="Creator Application" centered />

          {submitted ? (
            <div className="rounded-2xl border border-[#39ff14]/30 bg-[#39ff14]/5 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-[#39ff14] mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Application Received</h3>
              <p className="text-zinc-400 text-sm">
                We'll review your application within 48 hours and reach out at {form.email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Jake Moreno"
                    className="w-full rounded-lg px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  Portfolio / Existing Work (URL or description)
                </label>
                <input
                  type="text"
                  value={form.portfolio}
                  onChange={(e) => update('portfolio', e.target.value)}
                  placeholder="Printables profile, GitHub, YouTube, etc."
                  className="w-full rounded-lg px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  CAD / Design Software *
                </label>
                <input
                  type="text"
                  required
                  value={form.software}
                  onChange={(e) => update('software', e.target.value)}
                  placeholder="Fusion 360, SolidWorks, FreeCAD, etc."
                  className="w-full rounded-lg px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  Experience Level
                </label>
                <select
                  value={form.experience}
                  onChange={(e) => update('experience', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm"
                >
                  <option value="">Select...</option>
                  <option>Hobbyist (1–2 years)</option>
                  <option>Experienced (3–5 years)</option>
                  <option>Professional (5+ years)</option>
                  <option>Industry Background (Engineering / Manufacturing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  What vehicles / parts do you design for? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.motivation}
                  onChange={(e) => update('motivation', e.target.value)}
                  placeholder="E.g. NA/NB Miata aero parts, JDM interior trim, Ducati bodywork..."
                  className="w-full rounded-lg px-4 py-3 text-sm resize-none"
                />
              </div>

              {/* TODO: Cloudinary file upload for portfolio samples */}
              <div className="rounded-xl border border-dashed border-[#2a2a2a] p-5 text-center">
                <Upload className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Portfolio samples (optional) — coming soon</p>
              </div>

              <button type="submit" className="w-full btn-primary py-4 text-sm rounded-xl">
                Submit Application
              </button>
              <p className="text-[10px] text-zinc-600 text-center">
                We review all applications within 48 hours. You'll receive a decision by email.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
