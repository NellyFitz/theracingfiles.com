'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle, Loader2,
  Car, Printer, Settings2, FileText, Upload, Eye, Box,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import FileUpload from '@/components/FileUpload';
import ImageUpload from '@/components/ImageUpload';

const STEPS = [
  { id: 'vehicle', label: 'Vehicle & Part', icon: Car },
  { id: 'scans', label: 'Upload Files', icon: Box },
  { id: 'pricing', label: 'Pricing & Specs', icon: Printer },
  { id: 'print', label: 'Print Settings', icon: Settings2 },
  { id: 'details', label: 'Descriptions', icon: FileText },
  { id: 'images', label: 'Images', icon: Upload },
  { id: 'review', label: 'Review', icon: Eye },
] as const;

type StepId = typeof STEPS[number]['id'];

const VEHICLE_TYPES = ['Car', 'Motorcycle', 'Truck', 'Tool'];
const CATEGORIES = ['Aero & Body', 'Interior', 'Exterior', 'Truck & Off-Road', 'Motorcycle', 'Garage & Tools', 'Electrical', 'Other'];
const MAKES = ['Mazda', 'Nissan', 'Toyota', 'Honda', 'Subaru', 'Mitsubishi', 'Ford', 'Chevrolet', 'Jeep', 'BMW', 'Yamaha', 'Kawasaki', 'Ducati', 'Suzuki', 'Honda (Moto)', 'Other'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const YEARS = Array.from({ length: 56 }, (_, i) => String(2025 - i));

interface FormData {
  // Step 1
  name: string;
  category: string;
  vehicleType: string;
  make: string;
  model: string;
  yearStart: string;
  yearEnd: string;
  fitment: string;
  tags: string;
  // Step 2 — Scan Files
  stlUrl: string | null;
  threemfUrl: string | null;
  objUrl: string | null;
  mtlUrl: string | null;
  // Step 3
  filePrice: string;
  printedPrice: string;
  finishedAvailable: boolean;
  material: string;
  difficulty: string;
  // Step 4
  layerHeight: string;
  infill: string;
  supports: boolean;
  nozzleTemp: string;
  bedTemp: string;
  // Step 5
  description: string;
  fitmentNotes: string;
  installNotes: string;
  // Step 6
  images: string[];
}

const defaultForm: FormData = {
  name: '', category: '', vehicleType: 'Car', make: '', model: '',
  yearStart: '', yearEnd: '', fitment: '', tags: '',
  stlUrl: null, threemfUrl: null, objUrl: null, mtlUrl: null,
  filePrice: '', printedPrice: '', finishedAvailable: false,
  material: '', difficulty: 'Intermediate',
  layerHeight: '0.2mm', infill: '25%', supports: false, nozzleTemp: '', bedTemp: '',
  description: '', fitmentNotes: '', installNotes: '',
  images: [],
};

function StepIndicator({ current }: { current: StepId }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              active ? 'bg-[#39ff14]/10 text-[#39ff14]' :
              done ? 'text-zinc-400' : 'text-zinc-700'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                done ? 'bg-[#39ff14]/20 text-[#39ff14]' :
                active ? 'bg-[#39ff14] text-[#0d0d0d]' : 'bg-[#2a2a2a] text-zinc-600'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className="hidden sm:block">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-px mx-1 ${i < idx ? 'bg-[#39ff14]/30' : 'bg-[#2a2a2a]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
        {label} {required && <span className="text-[#39ff14]">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function SubmitPartPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>('vehicle');
  const [form, setForm] = useState<FormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const stepIdx = STEPS.findIndex((s) => s.id === step);
  const isFirst = stepIdx === 0;
  const isLast = step === 'review';

  const prev = () => setStep(STEPS[stepIdx - 1].id);
  const next = () => setStep(STEPS[stepIdx + 1].id);

  const hasNoScanFile = !form.stlUrl && !form.threemfUrl && !form.objUrl && !form.mtlUrl;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Session expired. Please sign in again.'); setSubmitting(false); return; }

    const { data: inserted, error: insertError } = await supabase.from('part_submissions').insert({
      creator_id: user.id,
      name: form.name,
      category: form.category,
      vehicle_type: form.vehicleType,
      make: form.make,
      model: form.model,
      year_start: parseInt(form.yearStart),
      year_end: parseInt(form.yearEnd),
      fitment: form.fitment,
      file_price: parseFloat(form.filePrice),
      printed_price: form.printedPrice ? parseFloat(form.printedPrice) : null,
      finished_available: form.finishedAvailable,
      material: form.material,
      difficulty: form.difficulty,
      description: form.description,
      fitment_notes: form.fitmentNotes,
      install_notes: form.installNotes,
      print_layer_height: form.layerHeight,
      print_infill: form.infill,
      print_supports: form.supports,
      print_nozzle_temp: form.nozzleTemp,
      print_bed_temp: form.bedTemp,
      stl_url: form.stlUrl,
      threemf_url: form.threemfUrl,
      obj_url: form.objUrl,
      mtl_url: form.mtlUrl,
      images: form.images,
      tags: form.tags,
      status: 'pending',
    }).select('id').single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('name, handle')
      .eq('id', user.id)
      .single();

    fetch('/api/notify-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId: inserted?.id,
        partName: form.name,
        creatorName: profile?.name ?? 'Unknown',
        creatorHandle: profile?.handle ?? '—',
        make: form.make,
        model: form.model,
        yearStart: form.yearStart,
        yearEnd: form.yearEnd,
        category: form.category,
        filePrice: form.filePrice,
        printedPrice: form.printedPrice || null,
        hasStl: !!form.stlUrl,
        hasThreedmf: !!form.threemfUrl,
        imageCount: form.images.length,
      }),
    }).catch(() => { /* non-critical */ });

    router.push('/creator/dashboard');
    router.refresh();
  };

  const inputClass = 'w-full rounded-lg px-4 py-3 text-sm';
  const textareaClass = 'w-full rounded-lg px-4 py-3 text-sm resize-none';

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a] sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/creator/dashboard" className="text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-black text-white">Submit a Scan</h1>
            <div className="ml-auto overflow-x-auto">
              <StepIndicator current={step} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 sm:p-8">

          {/* ── STEP 1: Vehicle & Part ── */}
          {step === 'vehicle' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-white mb-6">Vehicle & Part Info</h2>

              <Field label="Part Name" required>
                <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)}
                  placeholder="NA Miata Ducktail Spoiler" className={inputClass} />
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Vehicle Type" required>
                  <select value={form.vehicleType} onChange={(e) => update('vehicleType', e.target.value)} className={`${inputClass} appearance-none`}>
                    {VEHICLE_TYPES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Category" required>
                  <select value={form.category} onChange={(e) => update('category', e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="">Select category...</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Make" required>
                  <select value={form.make} onChange={(e) => update('make', e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="">Select make...</option>
                    {MAKES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Model" required>
                  <input type="text" value={form.model} onChange={(e) => update('model', e.target.value)}
                    placeholder="Miata NA, R32 GTR..." className={inputClass} />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Year Start" required>
                  <select value={form.yearStart} onChange={(e) => update('yearStart', e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="">Year...</option>
                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </Field>
                <Field label="Year End" required>
                  <select value={form.yearEnd} onChange={(e) => update('yearEnd', e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="">Year...</option>
                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Fitment Description" required>
                <input type="text" value={form.fitment} onChange={(e) => update('fitment', e.target.value)}
                  placeholder="1990–1997 Mazda Miata NA" className={inputClass} />
                <p className="text-[10px] text-zinc-600 mt-1">This is shown on product cards and in search.</p>
              </Field>

              <Field label="Tags (comma separated)">
                <input type="text" value={form.tags} onChange={(e) => update('tags', e.target.value)}
                  placeholder="miata, na, aero, spoiler, ducktail" className={inputClass} />
              </Field>
            </div>
          )}

          {/* ── STEP 2: Scan Files ── */}
          {step === 'scans' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Upload Files</h2>
                <p className="text-sm text-zinc-500">
                  Upload your 3D scan or model files. At least one file is required.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FileUpload
                  bucket="part-files"
                  folder="stl"
                  accept=".stl"
                  label="STL File"
                  hint=".stl · Max 50MB"
                  value={form.stlUrl}
                  onChange={(url) => update('stlUrl', url)}
                />
                <FileUpload
                  bucket="part-files"
                  folder="3mf"
                  accept=".3mf"
                  label="3MF File"
                  hint=".3mf · Max 50MB"
                  value={form.threemfUrl}
                  onChange={(url) => update('threemfUrl', url)}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FileUpload
                  bucket="part-files"
                  folder="obj"
                  accept=".obj"
                  label="OBJ File"
                  hint=".obj · Max 50MB"
                  value={form.objUrl}
                  onChange={(url) => update('objUrl', url)}
                />
                <FileUpload
                  bucket="part-files"
                  folder="mtl"
                  accept=".mtl"
                  label="MTL File"
                  hint=".mtl · material library · Max 50MB"
                  value={form.mtlUrl}
                  onChange={(url) => update('mtlUrl', url)}
                />
              </div>

              <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  <span className="text-white font-semibold">Tip:</span> Upload the formats that best represent your scan.
                  3MF is preferred as it preserves print settings. OBJ + MTL pairs work well for textured models.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 3: Pricing & Specs ── */}
          {step === 'pricing' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-white mb-6">Pricing & Specifications</h2>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Digital File Price (USD)" required>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                    <input type="number" min="1" step="0.01" value={form.filePrice}
                      onChange={(e) => update('filePrice', e.target.value)}
                      placeholder="24.00" className={`${inputClass} pl-8`} />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1">You keep 70% of every file sale.</p>
                </Field>
                <Field label="Printed Price (USD) — leave blank if digital only">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                    <input type="number" min="1" step="0.01" value={form.printedPrice}
                      onChange={(e) => update('printedPrice', e.target.value)}
                      placeholder="119.00" className={`${inputClass} pl-8`} />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1">The Racing Files fulfills. You earn 15% royalty.</p>
                </Field>
              </div>

              <Field label="">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => update('finishedAvailable', !form.finishedAvailable)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      form.finishedAvailable ? 'bg-[#39ff14] border-[#39ff14]' : 'border-[#3a3a3a]'
                    }`}
                  >
                    {form.finishedAvailable && <span className="text-[#0d0d0d] text-xs font-black">✓</span>}
                  </div>
                  <div>
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors font-semibold">
                      Offer finished/painted version (custom quote)
                    </span>
                    <p className="text-xs text-zinc-600">Customers can request a painted, sanded, bolt-on version.</p>
                  </div>
                </label>
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Recommended Material" required>
                  <input type="text" value={form.material} onChange={(e) => update('material', e.target.value)}
                    placeholder="ASA or PETG-CF" className={inputClass} />
                </Field>
                <Field label="Print Difficulty" required>
                  <select value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)} className={`${inputClass} appearance-none`}>
                    {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
              </div>

              <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  <span className="text-white font-semibold">Pricing guide:</span> Beginner clips/mounts: $4–12.
                  Intermediate brackets/trim: $12–25. Complex aero/structural: $20–60.
                  Don't underprice — quality parts command fair prices.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 4: Print Settings ── */}
          {step === 'print' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-white mb-2">Print Settings</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Validated settings are required for approval. These ship with every file purchase.
              </p>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Layer Height" required>
                  <input type="text" value={form.layerHeight} onChange={(e) => update('layerHeight', e.target.value)}
                    placeholder="0.2mm" className={inputClass} />
                </Field>
                <Field label="Infill" required>
                  <input type="text" value={form.infill} onChange={(e) => update('infill', e.target.value)}
                    placeholder="25%" className={inputClass} />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Nozzle Temp" required>
                  <input type="text" value={form.nozzleTemp} onChange={(e) => update('nozzleTemp', e.target.value)}
                    placeholder="240°C (ASA)" className={inputClass} />
                </Field>
                <Field label="Bed Temp" required>
                  <input type="text" value={form.bedTemp} onChange={(e) => update('bedTemp', e.target.value)}
                    placeholder="90°C (ASA)" className={inputClass} />
                </Field>
              </div>

              <Field label="">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => update('supports', !form.supports)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      form.supports ? 'bg-[#39ff14] border-[#39ff14]' : 'border-[#3a3a3a]'
                    }`}
                  >
                    {form.supports && <span className="text-[#0d0d0d] text-xs font-black">✓</span>}
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    Supports required
                  </span>
                </label>
              </Field>
            </div>
          )}

          {/* ── STEP 5: Descriptions ── */}
          {step === 'details' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-white mb-6">Descriptions & Notes</h2>

              <Field label="Part Description" required>
                <textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe what this part is, what it does, why you made it, and what makes it worth buying..."
                  className={textareaClass} />
              </Field>

              <Field label="Fitment Notes" required>
                <textarea rows={3} value={form.fitmentNotes} onChange={(e) => update('fitmentNotes', e.target.value)}
                  placeholder="Which exact vehicles fit. What to check before ordering. Any variants that don't fit..."
                  className={textareaClass} />
              </Field>

              <Field label="Install Notes">
                <textarea rows={4} value={form.installNotes} onChange={(e) => update('installNotes', e.target.value)}
                  placeholder="Step-by-step installation guidance. Tools required. Torque specs if relevant..."
                  className={textareaClass} />
              </Field>
            </div>
          )}

          {/* ── STEP 6: Images ── */}
          {step === 'images' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Photos</h2>
                <p className="text-sm text-zinc-500">
                  Images are required for approval. Include fitment shots, close-ups, and installed photos.
                </p>
              </div>
              <ImageUpload
                value={form.images}
                onChange={(urls) => update('images', urls)}
              />
            </div>
          )}

          {/* ── STEP 7: Review ── */}
          {step === 'review' && (
            <div>
              <h2 className="text-xl font-black text-white mb-6">Review Your Submission</h2>

              <div className="space-y-4 mb-8">
                {[
                  { label: 'Part Name', value: form.name },
                  { label: 'Vehicle', value: `${form.yearStart}–${form.yearEnd} ${form.make} ${form.model}` },
                  { label: 'Category', value: form.category },
                  { label: 'File Price', value: `$${form.filePrice}` },
                  { label: 'Printed Price', value: form.printedPrice ? `$${form.printedPrice}` : 'Digital only' },
                  { label: 'Material', value: form.material },
                  { label: 'Difficulty', value: form.difficulty },
                  {
                    label: 'Scan Files',
                    value: [
                      form.stlUrl && 'STL',
                      form.threemfUrl && '3MF',
                      form.objUrl && 'OBJ',
                      form.mtlUrl && 'MTL',
                    ].filter(Boolean).join(', ') || 'None uploaded',
                  },
                  { label: 'Images', value: `${form.images.length} uploaded` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 py-3 border-b border-[#1e1e1e]">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 w-32 shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-zinc-200 flex-1">{value || <span className="text-zinc-600 italic">Not provided</span>}</span>
                  </div>
                ))}
              </div>

              {hasNoScanFile && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-5">
                  <p className="text-sm text-amber-400 font-semibold mb-1">No scan file uploaded</p>
                  <p className="text-xs text-zinc-400">You need at least one scan file (STL, 3MF, OBJ, or MTL). Go back to Scan Files to upload.</p>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 mb-6">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  By submitting, you confirm this is your original design, you have the right to sell it,
                  and agree to The Racing Files's creator terms. Our team will review and respond within 48 hours.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2a2a2a]">
            <button
              onClick={prev}
              disabled={isFirst}
              className="flex items-center gap-2 px-5 py-3 text-sm rounded-lg border border-[#2a2a2a] text-zinc-400 hover:text-white hover:border-[#3a3a3a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || hasNoScanFile}
                className="flex items-center gap-2 btn-primary px-8 py-3 text-sm rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <CheckCircle className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            ) : (
              <button
                onClick={next}
                className="flex items-center gap-2 btn-primary px-8 py-3 text-sm rounded-xl"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
