import Link from 'next/link';
import {
  Zap, Target, Heart, Shield, ArrowRight, Wrench,
} from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';

const values = [
  {
    icon: Target,
    title: 'Fitment First',
    desc: 'Every part must be tested on a real vehicle before earning the Verified badge. No guessing.',
  },
  {
    icon: Heart,
    title: 'Built by Enthusiasts',
    desc: 'We are car people and bike people. We build this for ourselves as much as for you.',
  },
  {
    icon: Shield,
    title: 'Creator Protection',
    desc: 'We actively protect our designers. DMCA enforcement, licensing control, and fair revenue sharing.',
  },
  {
    icon: Wrench,
    title: 'Real Manufacturing',
    desc: 'This is not arts and crafts. Our parts are engineered with print-in-mind DFM from day one.',
  },
];

const team = [
  {
    name: 'Alex Reyes',
    role: 'Founder & CEO',
    bio: 'Ex-FSAE engineer. Built 3 turbocharged Miatas. Obsessed with parts that actually fit.',
    initial: 'A',
  },
  {
    name: 'Sam Liu',
    role: 'Head of Engineering',
    bio: 'Mechanical engineer. 10 years in automotive OEM supplier chain. Now making that knowledge open.',
    initial: 'S',
  },
  {
    name: 'Priya Nair',
    role: 'Head of Creator Success',
    bio: 'Ran a Printables top-10 creator account. Knows exactly what designers need to succeed.',
    initial: 'P',
  },
];

const timeline = [
  { year: '2023', event: 'The Racing Files founded in a garage. First 12 parts listed.' },
  { year: 'Q1 2024', event: 'Verified Fitment program launched with 40 beta creators.' },
  { year: 'Q3 2024', event: '1,000+ parts listed. First $100K paid out to creators.' },
  { year: '2025', event: 'Printed fulfillment network launched. Mobile-first redesign.' },
  { year: 'Now', event: '2,400+ parts. 180+ creators. Building toward the digital factory.' },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative border-b border-[#1e1e1e] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#39ff14]/10 border border-[#39ff14]/20 rounded-full px-4 py-1.5 mb-8">
              <Zap className="w-3.5 h-3.5 text-[#39ff14]" fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#39ff14]">About The Racing Files</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
              The aftermarket<br />
              <span className="text-[#39ff14]">finally caught up.</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
              The Racing Files was born because the parts we needed didn't exist — or cost $400 for a plastic clip.
              We decided the answer was a platform that lets designers share what they've built and gets it to builders
              anywhere in the world.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                eyebrow="Our Mission"
                title="Modernize the enthusiast aftermarket."
              />
              <p className="text-zinc-400 leading-relaxed mb-6">
                The automotive aftermarket hasn't fundamentally changed in decades. You find a part, you pay
                too much, it half-fits, and you wait six weeks. For older or niche vehicles, you don't even get that.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-6">
                3D printing changes the equation entirely. A designer in Tokyo can solve a problem that an NA Miata
                owner in Texas has been fighting for years — and ship the solution to them digitally in seconds.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                The Racing Files is the infrastructure that makes that happen at scale, with verified quality, fair creator
                compensation, and on-demand manufacturing for people who don't own printers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Parts Available', value: '2,400+' },
                { label: 'Active Creators', value: '180+' },
                { label: 'Community Members', value: '14k+' },
                { label: 'Paid to Creators', value: '$340K+' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 text-center card-hover"
                >
                  <p className="text-3xl font-black text-[#39ff14] mb-2">{s.value}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-b border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="What We Stand For" title="Our Values" centered />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 card-hover">
                  <div className="w-10 h-10 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#39ff14]" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="The Team" title="People Behind The Racing Files" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 card-hover">
                <div className="w-16 h-16 rounded-2xl bg-[#252525] border border-[#2a2a2a] flex items-center justify-center mb-5">
                  <span className="text-2xl font-black text-[#39ff14]">{member.initial}</span>
                </div>
                <h3 className="text-base font-black text-white mb-0.5">{member.name}</h3>
                <p className="text-xs font-semibold text-[#39ff14] mb-3 uppercase tracking-wide">{member.role}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 border-b border-[#1e1e1e]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Story So Far" title="The Racing Files Timeline" centered />
          <div className="relative pl-8 space-y-0">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-[#2a2a2a]" />
            {timeline.map((item, i) => (
              <div key={i} className="relative pb-10">
                <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-[#39ff14] border-2 border-[#0d0d0d]" />
                <div className="ml-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#39ff14] mb-1">{item.year}</p>
                  <p className="text-sm text-zinc-300">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="relative rounded-2xl border border-[#39ff14]/20 bg-[#0d1a0a] p-8 overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative">
                <h3 className="text-2xl font-black text-white mb-3">Browse the Parts Bin</h3>
                <p className="text-sm text-zinc-400 mb-6">Over 2,400 verified parts across cars and motorcycles.</p>
                <Link href="/browse" className="btn-primary px-6 py-3 text-sm rounded-lg inline-flex items-center gap-2">
                  Parts Marketplace <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="relative rounded-2xl border border-[#2a2a2a] bg-[#141414] p-8 overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative">
                <h3 className="text-2xl font-black text-white mb-3">Join as a Creator</h3>
                <p className="text-sm text-zinc-400 mb-6">Turn your designs into recurring revenue. Apply now.</p>
                <Link href="/creator#apply" className="btn-outline px-6 py-3 text-sm rounded-lg inline-flex items-center gap-2">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
