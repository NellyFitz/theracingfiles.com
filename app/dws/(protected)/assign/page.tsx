'use client';

import { useState } from 'react';
import {
  Database, TrendingUp, DollarSign, BarChart2,
  ChevronDown, ChevronUp, Save, RotateCcw,
  Users, Package, Star, Clock,
} from 'lucide-react';
import DwsNav from '@/components/DwsNav';

/* ── helpers ─────────────────────────────────────────── */

function Section({
  title, icon: Icon, children, defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] hover:bg-[#181818] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-[#E8000D]" />
          </div>
          <span className="text-sm font-black text-white uppercase tracking-wider">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', prefix, suffix, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-zinc-500 font-bold">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8000D]/50 ${prefix ? 'pl-7 pr-4' : suffix ? 'pl-4 pr-10' : 'px-4'}`}
        />
        {suffix && (
          <span className="absolute right-3 text-xs text-zinc-500">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-[10px] text-zinc-600 mt-1">{hint}</p>}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */

export default function AssignDataPage() {
  // KPIs
  const [totalParts, setTotalParts] = useState('2400');
  const [activeCreators, setActiveCreators] = useState('180');
  const [totalPaidOut, setTotalPaidOut] = useState('340000');
  const [avgReviewTime, setAvgReviewTime] = useState('48');
  const [totalMembers, setTotalMembers] = useState('12400');
  const [avgRating, setAvgRating] = useState('4.8');

  // Financial
  const [creatorRevShare, setCreatorRevShare] = useState('70');
  const [printedRoyalty, setPrintedRoyalty] = useState('15');
  const [platformFee, setPlatformFee] = useState('30');
  const [minPayout, setMinPayout] = useState('25');
  const [payoutCycle, setPayoutCycle] = useState('7');
  const [stripeFee, setStripeFee] = useState('2.9');
  const [digitalBasePrice, setDigitalBasePrice] = useState('4.99');
  const [printedMarkup, setPrintedMarkup] = useState('40');

  // Platform Limits
  const [maxImagesPerSubmission, setMaxImagesPerSubmission] = useState('3');
  const [maxFileSizeMb, setMaxFileSizeMb] = useState('250');
  const [maxPartsPerCreator, setMaxPartsPerCreator] = useState('500');
  const [reviewSlaHours, setReviewSlaHours] = useState('48');

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <DwsNav />
      <main className="min-h-screen bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-[#E8000D]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Assign Data</h1>
                <p className="text-xs text-zinc-500 mt-0.5">Manage KPIs, financials, and platform configuration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSaved(false)}
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white border border-[#2a2a2a] px-4 py-2.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#E8000D] hover:bg-[#c0000b] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saved ? 'Saved!' : 'Save All'}
              </button>
            </div>
          </div>

          <div className="space-y-5">

            {/* ── KPIs ── */}
            <Section title="Calculated KPIs" icon={TrendingUp}>
              <p className="text-xs text-zinc-500 mb-6">
                These values power the stats shown sitewide — homepage, about page, creator page, and marketing copy.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <Field
                  label="Total Parts Listed"
                  value={totalParts}
                  onChange={setTotalParts}
                  type="number"
                  hint="Shown as '2,400+' on homepage"
                />
                <Field
                  label="Active Creators"
                  value={activeCreators}
                  onChange={setActiveCreators}
                  type="number"
                  hint="Shown as '180+' on creator page"
                />
                <Field
                  label="Total Paid Out to Creators ($)"
                  value={totalPaidOut}
                  onChange={setTotalPaidOut}
                  type="number"
                  prefix="$"
                  hint="Shown as '$340K' on creator page"
                />
                <Field
                  label="Avg Review Time (hours)"
                  value={avgReviewTime}
                  onChange={setAvgReviewTime}
                  type="number"
                  suffix="hrs"
                  hint="Shown as '48h' on about page"
                />
                <Field
                  label="Total Registered Members"
                  value={totalMembers}
                  onChange={setTotalMembers}
                  type="number"
                  hint="Community size stat"
                />
                <Field
                  label="Average Part Rating"
                  value={avgRating}
                  onChange={setAvgRating}
                  type="number"
                  suffix="/ 5"
                  hint="Platform-wide average rating"
                />
              </div>

              {/* Live preview */}
              <div className="mt-6 pt-5 border-t border-[#1e1e1e]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Live Preview</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Package, value: `${Number(totalParts).toLocaleString()}+`, label: 'Parts Listed' },
                    { icon: Users, value: `${activeCreators}+`, label: 'Creators' },
                    { icon: DollarSign, value: `$${Math.round(Number(totalPaidOut) / 1000)}K`, label: 'Paid Out' },
                    { icon: Clock, value: `${avgReviewTime}h`, label: 'Avg Review' },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="rounded-lg bg-[#0d0d0d] border border-[#1e1e1e] p-3 text-center">
                      <Icon className="w-4 h-4 text-[#E8000D] mx-auto mb-1.5" />
                      <p className="text-lg font-black text-white">{value}</p>
                      <p className="text-[10px] text-zinc-600">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ── Financial ── */}
            <Section title="Financial" icon={DollarSign}>
              <p className="text-xs text-zinc-500 mb-6">
                Revenue splits, royalties, fees, and payout configuration across the platform.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <Field
                  label="Creator Revenue Share"
                  value={creatorRevShare}
                  onChange={setCreatorRevShare}
                  type="number"
                  suffix="%"
                  hint="% of digital sale kept by creator"
                />
                <Field
                  label="Platform Fee"
                  value={platformFee}
                  onChange={setPlatformFee}
                  type="number"
                  suffix="%"
                  hint="% retained by The Racing Files"
                />
                <Field
                  label="Printed Order Royalty"
                  value={printedRoyalty}
                  onChange={setPrintedRoyalty}
                  type="number"
                  suffix="%"
                  hint="Creator royalty on fulfilled print orders"
                />
                <Field
                  label="Minimum Payout Threshold"
                  value={minPayout}
                  onChange={setMinPayout}
                  type="number"
                  prefix="$"
                  hint="Min balance before payout is triggered"
                />
                <Field
                  label="Payout Rolling Cycle"
                  value={payoutCycle}
                  onChange={setPayoutCycle}
                  type="number"
                  suffix="days"
                  hint="Rolling window for Stripe payouts"
                />
                <Field
                  label="Stripe Processing Fee"
                  value={stripeFee}
                  onChange={setStripeFee}
                  type="number"
                  suffix="%"
                  hint="Passed through from Stripe (+ $0.30 fixed)"
                />
                <Field
                  label="Digital File Base Price"
                  value={digitalBasePrice}
                  onChange={setDigitalBasePrice}
                  type="number"
                  prefix="$"
                  hint="Minimum allowed listing price for files"
                />
                <Field
                  label="Printed Order Markup"
                  value={printedMarkup}
                  onChange={setPrintedMarkup}
                  type="number"
                  suffix="%"
                  hint="Markup applied over material + print cost"
                />
              </div>

              {/* Split visualiser */}
              <div className="mt-6 pt-5 border-t border-[#1e1e1e]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Revenue Split Preview</p>
                <div className="flex h-6 rounded-full overflow-hidden text-[10px] font-bold">
                  <div
                    className="flex items-center justify-center bg-[#E8000D] text-white transition-all"
                    style={{ width: `${creatorRevShare}%` }}
                  >
                    {Number(creatorRevShare) > 10 ? `Creator ${creatorRevShare}%` : ''}
                  </div>
                  <div
                    className="flex items-center justify-center bg-zinc-600 text-white transition-all"
                    style={{ width: `${platformFee}%` }}
                  >
                    {Number(platformFee) > 10 ? `Platform ${platformFee}%` : ''}
                  </div>
                </div>
              </div>
            </Section>

            {/* ── Platform Limits ── */}
            <Section title="Platform Limits" icon={BarChart2}>
              <p className="text-xs text-zinc-500 mb-6">
                Caps and SLA targets that govern upload, submission, and review behaviour.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Field
                  label="Max Images per Submission"
                  value={maxImagesPerSubmission}
                  onChange={setMaxImagesPerSubmission}
                  type="number"
                  hint="Reference photos on request form"
                />
                <Field
                  label="Max File Size"
                  value={maxFileSizeMb}
                  onChange={setMaxFileSizeMb}
                  type="number"
                  suffix="MB"
                  hint="Per STL / 3MF upload"
                />
                <Field
                  label="Max Parts per Creator"
                  value={maxPartsPerCreator}
                  onChange={setMaxPartsPerCreator}
                  type="number"
                  hint="Active listings limit per account"
                />
                <Field
                  label="Review SLA"
                  value={reviewSlaHours}
                  onChange={setReviewSlaHours}
                  type="number"
                  suffix="hrs"
                  hint="Target turnaround for submissions"
                />
              </div>
            </Section>

          </div>
        </div>
      </main>
    </>
  );
}
