'use client';

import { useState } from 'react';
import {
  Upload, CheckCircle, Download, Printer, Wrench,
  ChevronRight, Zap,
} from 'lucide-react';
import type { RequestFormData, FulfillmentType } from '@/lib/types';

const MAKES = [
  'Mazda', 'Nissan', 'Toyota', 'Honda', 'Subaru', 'Mitsubishi',
  'Yamaha', 'Honda (Moto)', 'Kawasaki', 'Ducati', 'BMW', 'Ford',
  'Chevrolet', 'Jeep', 'Other',
];

const YEARS = Array.from({ length: 56 }, (_, i) => String(2025 - i));

const fulfillmentOptions: { type: FulfillmentType; label: string; desc: string; icon: React.ElementType; accent: string }[] = [
  { type: 'digital', label: 'File Only (STL/3MF)', desc: "I have a printer — just send me the file.", icon: Download, accent: '#39ff14' },
  { type: 'printed', label: 'Pre-Printed', desc: "Print it for me and ship it ready to install.", icon: Printer, accent: '#00d4ff' },
  { type: 'finished', label: 'Fully Finished', desc: "Sanded, primed, painted, or wrapped. Bolt-on ready.", icon: Wrench, accent: '#ffa500' },
];

const defaultForm: RequestFormData = {
  name: '',
  email: '',
  vehicleYear: '',
  make: '',
  model: '',
  partNeeded: '',
  fulfillmentType: 'digital',
  notes: '',
};

export default function RequestPage() {
  const [form, setForm] = useState<RequestFormData>(defaultForm);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof RequestFormData>(key: K, value: RequestFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to Supabase part_requests table
    // TODO: Notify creator network via email/webhook
    // TODO: Trigger matching algorithm against existing library
    setSubmitted(true);
  };

  return (
    <main>
      {/* Header */}
      <section className="relative border-b border-[#1e1e1e] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#39ff14]/10 border border-[#39ff14]/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-[#39ff14]" fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#39ff14]">Custom Requests</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Can't find your part?<br />
              <span className="text-[#39ff14]">Request it.</span>
            </h1>
            <p className="text-zinc-400 leading-relaxed">
              Submit a request and we'll either match you with an existing part, route it to our creator network,
              or quote you for a custom design.
            </p>
          </div>
        </div>
      </section>

      {/* How requests work */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { step: '1', text: 'Submit your request below' },
              { step: '2', text: 'We search existing library first' },
              { step: '3', text: 'Matched to a creator or queued for design' },
              { step: '4', text: 'You get a notification with options & pricing' },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#39ff14]/10 border border-[#39ff14]/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-[#39ff14]">{s.step}</span>
                </div>
                <span className="text-xs text-zinc-400">{s.text}</span>
                {parseInt(s.step) < 4 && <ChevronRight className="w-4 h-4 text-zinc-700" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="rounded-2xl border border-[#39ff14]/30 bg-[#39ff14]/5 p-16 text-center">
                <CheckCircle className="w-16 h-16 text-[#39ff14] mx-auto mb-6" />
                <h2 className="text-2xl font-black text-white mb-3">Request Submitted</h2>
                <p className="text-zinc-400 text-sm mb-2">
                  We'll search the library and reach out to {form.email || 'you'} within 24 hours.
                </p>
                <p className="text-zinc-600 text-xs">
                  Vehicle: {form.vehicleYear} {form.make} {form.model} · Part: {form.partNeeded}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact info */}
                <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6">
                  <h2 className="text-sm font-black text-white uppercase tracking-wider mb-5">Contact Info</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="Alex Reyes"
                        className="w-full rounded-lg px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="you@email.com"
                        className="w-full rounded-lg px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle info */}
                <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6">
                  <h2 className="text-sm font-black text-white uppercase tracking-wider mb-5">Vehicle Info</h2>
                  <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Year *
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={form.vehicleYear}
                          onChange={(e) => update('vehicleYear', e.target.value)}
                          className="w-full rounded-lg px-4 py-3 text-sm appearance-none"
                        >
                          <option value="">Year</option>
                          {YEARS.map((y) => <option key={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Make *
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={form.make}
                          onChange={(e) => update('make', e.target.value)}
                          className="w-full rounded-lg px-4 py-3 text-sm appearance-none"
                        >
                          <option value="">Make</option>
                          {MAKES.map((m) => <option key={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.model}
                        onChange={(e) => update('model', e.target.value)}
                        placeholder="Miata NA, R32, etc."
                        className="w-full rounded-lg px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Part info */}
                <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6">
                  <h2 className="text-sm font-black text-white uppercase tracking-wider mb-5">Part Details</h2>
                  <div className="mb-5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Part Needed *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.partNeeded}
                      onChange={(e) => update('partNeeded', e.target.value)}
                      placeholder="e.g. Passenger side mirror base, Headlight trim ring..."
                      className="w-full rounded-lg px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Fulfillment type */}
                  <div className="mb-5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      What do you need? *
                    </label>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {fulfillmentOptions.map((opt) => {
                        const Icon = opt.icon;
                        const active = form.fulfillmentType === opt.type;
                        return (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => update('fulfillmentType', opt.type)}
                            className={`rounded-xl border p-4 text-left transition-all ${
                              active
                                ? `border-opacity-50 bg-opacity-5`
                                : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                            }`}
                            style={{
                              borderColor: active ? `${opt.accent}60` : undefined,
                              backgroundColor: active ? `${opt.accent}08` : undefined,
                            }}
                          >
                            <Icon className="w-5 h-5 mb-2" style={{ color: opt.accent }} />
                            <p className="text-xs font-bold text-white mb-1">{opt.label}</p>
                            <p className="text-[10px] text-zinc-500 leading-tight">{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(e) => update('notes', e.target.value)}
                      placeholder="Describe the part in as much detail as possible. Include dimensions if known, OEM part numbers, or links to reference images..."
                      className="w-full rounded-lg px-4 py-3 text-sm resize-none"
                    />
                  </div>

                  {/* Photo upload placeholder */}
                  {/* TODO: Implement Cloudinary upload widget */}
                  <div className="mt-4 rounded-xl border border-dashed border-[#2a2a2a] p-5 text-center cursor-pointer hover:border-[#39ff14]/30 transition-colors group">
                    <Upload className="w-6 h-6 text-zinc-600 group-hover:text-[#39ff14] transition-colors mx-auto mb-2" />
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      Upload reference photos (optional) — drag & drop or click
                    </p>
                    <p className="text-[10px] text-zinc-700 mt-1">JPG, PNG, PDF up to 10MB</p>
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary py-4 text-sm rounded-xl flex items-center justify-center gap-2">
                  Submit Part Request
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-zinc-600">
                  Free to submit. No commitment. We'll reach out with options and pricing.
                </p>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6">
              <h3 className="text-sm font-bold text-white mb-4">What happens next?</h3>
              <ul className="space-y-4">
                {[
                  { icon: CheckCircle, text: 'We check if the part already exists in our library', color: '#39ff14' },
                  { icon: Download, text: 'If it exists, you get a link to download or order immediately', color: '#39ff14' },
                  { icon: Printer, text: "If not, we route it to our creator network for quoting", color: '#00d4ff' },
                  { icon: Wrench, text: 'Complex parts may be quoted for custom design work', color: '#ffa500' },
                ].map(({ icon: Icon, text, color }, i) => (
                  <li key={i} className="flex gap-3 text-xs text-zinc-400">
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6">
              <h3 className="text-sm font-bold text-white mb-3">Response Time</h3>
              <div className="space-y-3">
                {[
                  { label: 'Library match', time: '< 1 hour' },
                  { label: 'Creator quote', time: '24–48 hours' },
                  { label: 'Custom design', time: '3–5 business days' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{r.label}</span>
                    <span className="text-xs font-bold text-[#39ff14]">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6">
              <h3 className="text-sm font-bold text-white mb-3">Popular Requests</h3>
              <ul className="space-y-2">
                {[
                  'NA/NB Miata hardtop latches',
                  'JDM interior clips (discontinued)',
                  'R32–R34 interior trim',
                  'Ducati panel fasteners',
                  'Tacoma bed organizers',
                ].map((item) => (
                  <li key={item} className="text-xs text-zinc-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
