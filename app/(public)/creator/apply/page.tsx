'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Loader2, ChevronRight, CheckCircle2, ShieldCheck, Wrench, Mail,
  ArrowRight, RefreshCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const VEHICLE_SPECIALTIES = [
  'JDM', 'Euro', 'American Muscle', 'Truck & Off-Road',
  'Motorcycle', 'Classic / Vintage', 'Track / Race', 'Daily Driver',
];
const SOFTWARE_OPTIONS = ['Fusion 360', 'SolidWorks', 'Blender', 'FreeCAD', 'Tinkercad', 'Other'];
const EXPERIENCE_OPTIONS = [
  'Hobbyist (1–2 years)', 'Experienced (3–5 years)',
  'Professional (5+ years)', 'Industry Background',
];

type Step = 'captcha' | 'info' | 'verify';

function StepBar({ step }: { step: Step }) {
  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'captcha', label: 'Verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'info',    label: 'Creator Info', icon: <Wrench className="w-4 h-4" /> },
    { id: 'verify',  label: 'Email Confirm', icon: <Mail className="w-4 h-4" /> },
  ];
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${done ? 'text-green-400' : active ? 'text-white' : 'text-zinc-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-[11px] font-black transition-colors ${done ? 'bg-green-400/10 border-green-400/40 text-green-400' : active ? 'bg-[#E8000D]/10 border-[#E8000D]/40 text-[#E8000D]' : 'bg-[#1a1a1a] border-[#2a2a2a] text-zinc-600'}`}>
                {done ? '✓' : i + 1}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${i < idx ? 'text-green-400' : 'text-zinc-700'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function generateCaptcha() {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  const ops = [
    { q: `${a} + ${b}`, a: a + b },
    { q: `${a + b} − ${b}`, a: a },
    { q: `${a} × ${b}`, a: a * b },
  ];
  return ops[Math.floor(Math.random() * ops.length)];
}

export default function CreatorApplyPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [memberName, setMemberName] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  // Step state
  const [step, setStep] = useState<Step>('captcha');

  // Captcha
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Creator info
  const [storeName, setStoreName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [software, setSoftware] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [website, setWebsite] = useState('');
  const [infoError, setInfoError] = useState('');

  // Email verify
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/creator/login?next=/creator/apply'); return; }
      setUser(user);

      // Pre-fill store name from profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', user.id)
        .single();

      if (prof?.role === 'creator') { router.push('/creator/dashboard'); return; }

      const name = [prof?.first_name, prof?.last_name].filter(Boolean).join(' ');
      setMemberName(name);
      setStoreName(name);
      setLoadingUser(false);
    });
  }, [router]);

  if (loadingUser) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-600" /></div>;
  }

  /* ── CAPTCHA submit ── */
  function handleCaptcha(e: React.FormEvent) {
    e.preventDefault();
    if (parseInt(captchaInput) !== captcha.a) {
      setCaptchaError('Incorrect answer. Try again.');
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
      return;
    }
    setCaptchaError('');
    setStep('info');
  }

  /* ── Info submit ── */
  function handleInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!storeName.trim()) { setInfoError('Store name is required.'); return; }
    if (!handle.trim()) { setInfoError('Handle is required.'); return; }
    setInfoError('');
    setStep('verify');
    sendCode();
  }

  /* ── Send verification code ── */
  async function sendCode() {
    setSending(true);
    setVerifyError('');
    const res = await fetch('/api/creator-apply/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user!.id, email: user!.email }),
    });
    setSending(false);
    if (!res.ok) { setVerifyError('Failed to send code. Please try again.'); return; }
    setCodeSent(true);
  }

  /* ── Verify & upgrade ── */
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setVerifyError('');
    const res = await fetch('/api/creator-apply/verify-upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user!.id,
        code: code.trim(),
        storeName,
        handle,
        bio,
        software,
        experience,
        specialties: selectedSpecialties.join(', '),
        website,
      }),
    });
    const json = await res.json();
    setVerifying(false);
    if (!res.ok) { setVerifyError(json.error ?? 'Verification failed.'); return; }
    setDone(true);
    // Sign out and redirect so session refreshes with new role
    const supabase = createClient();
    await supabase.auth.signOut();
    setTimeout(() => router.push('/creator/login'), 3000);
  }

  /* ── Done screen ── */
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">You're a Creator!</h1>
          <p className="text-sm text-zinc-500 mb-2">Your account has been upgraded. Signing you in to your Creator Dashboard…</p>
          <Loader2 className="w-5 h-5 animate-spin text-zinc-600 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/rf-logo.png" alt="The Racing Files" width={32} height={32} className="object-contain" />
            <span className="text-lg font-black tracking-tight text-white">The Racing<span className="text-[#E8000D]"> Files</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-1">Creator Application</h1>
          <p className="text-xs text-zinc-500">Upgrade your member account to start selling parts.</p>
        </div>

        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-8">
          <StepBar step={step} />

          {/* ── Step 1: CAPTCHA ── */}
          {step === 'captcha' && (
            <form onSubmit={handleCaptcha} className="space-y-6">
              <div>
                <p className="text-sm font-black text-white mb-1">Human Verification</p>
                <p className="text-xs text-zinc-500 mb-6">Solve the problem below to confirm you're not a bot.</p>

                <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-6 text-center mb-5">
                  <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">What is</p>
                  <p className="text-4xl font-black text-white mb-1">{captcha.q} = ?</p>
                </div>

                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Your Answer</label>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter the answer"
                  className="w-full rounded-lg px-4 py-3 text-sm text-center text-lg font-black"
                  autoFocus
                />
                {captchaError && <p className="text-xs text-[#E8000D] mt-2">{captchaError}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); setCaptchaError(''); }}
                  className="flex items-center gap-1.5 border border-[#2a2a2a] hover:border-zinc-600 text-zinc-500 hover:text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> New
                </button>
                <button
                  type="submit"
                  disabled={!captchaInput}
                  className="flex-1 btn-primary py-3 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: Creator Info ── */}
          {step === 'info' && (
            <form onSubmit={handleInfo} className="space-y-5">
              <div>
                <p className="text-sm font-black text-white mb-1">Creator Profile</p>
                <p className="text-xs text-zinc-500 mb-5">This is what buyers see on the marketplace.</p>
              </div>

              {/* Store / Creator Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Store / Creator Name *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Nelson's Garage or NelsonFitz"
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                />
                <p className="text-[10px] text-zinc-600 mt-1">Pre-filled with your member name — change it to a storefront name if you like.</p>
              </div>

              {/* Handle */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Handle *</label>
                <div className="flex items-center rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] overflow-hidden">
                  <span className="px-3 text-zinc-600 text-sm font-bold">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="yourhandle"
                    className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell buyers about yourself, your build experience, specialties…"
                  rows={3}
                  className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
                />
              </div>

              {/* Vehicle Specialties */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Vehicle Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {VEHICLE_SPECIALTIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSpecialties((prev) =>
                        prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                      )}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                        selectedSpecialties.includes(s)
                          ? 'bg-[#E8000D]/10 border-[#E8000D]/40 text-[#E8000D]'
                          : 'bg-[#1a1a1a] border-[#2a2a2a] text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Software & Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Software</label>
                  <select value={software} onChange={(e) => setSoftware(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm">
                    <option value="">Select…</option>
                    {SOFTWARE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Experience</label>
                  <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm">
                    <option value="">Select…</option>
                    {EXPERIENCE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Portfolio / Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              {infoError && <p className="text-xs text-[#E8000D]">{infoError}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep('captcha')} className="border border-[#2a2a2a] hover:border-zinc-600 text-zinc-400 hover:text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors">
                  ← Back
                </button>
                <button type="submit" className="flex-1 btn-primary py-3 text-sm rounded-xl flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Email Verify ── */}
          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <p className="text-sm font-black text-white mb-1">Email Verification</p>
                <p className="text-xs text-zinc-500 mb-5">
                  A 6-digit code was sent to <span className="text-white font-semibold">{user?.email}</span>. Enter it below to complete your creator upgrade.
                </p>
              </div>

              {sending && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending code…
                </div>
              )}

              {codeSent && !sending && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Code sent — check your inbox.
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full rounded-lg px-4 py-4 text-2xl font-black text-center tracking-[0.4em]"
                />
              </div>

              {verifyError && <p className="text-xs text-[#E8000D]">{verifyError}</p>}

              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="w-full btn-primary py-3.5 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <>Confirm & Become a Creator <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="flex items-center justify-between text-xs text-zinc-600">
                <button type="button" onClick={() => setStep('info')} className="hover:text-zinc-400 transition-colors">← Back</button>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => { setCodeSent(false); sendCode(); }}
                  className="flex items-center gap-1 hover:text-zinc-400 transition-colors disabled:opacity-40"
                >
                  <RefreshCw className="w-3 h-3" /> Resend code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
