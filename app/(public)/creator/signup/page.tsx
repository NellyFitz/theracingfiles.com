'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, Loader2, CheckCircle,
  Users, Wrench, ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── constants ───────────────────────────────────────────── */

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const EXPERIENCE_OPTIONS = [
  'Hobbyist (1–2 years)',
  'Experienced (3–5 years)',
  'Professional (5+ years)',
  'Industry Background (Engineering / Manufacturing)',
];

function generateHandle(first: string, last: string): string {
  const base = `${first}${last}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ── types ───────────────────────────────────────────────── */

type AccountType = 'member' | 'creator';
type Step = 'choose' | 'account' | 'profile' | 'creator' | 'done';

/* ── step indicator ──────────────────────────────────────── */

function StepDots({ current, type }: { current: Step; type: AccountType | null }) {
  const memberSteps: Step[] = ['account', 'profile'];
  const creatorSteps: Step[] = ['account', 'profile', 'creator'];
  const steps = type === 'creator' ? creatorSteps : memberSteps;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {steps.map((s) => {
        const idx = steps.indexOf(s);
        const curIdx = steps.indexOf(current);
        return (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all ${
              current === s
                ? 'w-8 bg-[#E8000D]'
                : idx < curIdx
                ? 'w-4 bg-[#E8000D]/40'
                : 'w-4 bg-[#2a2a2a]'
            }`}
          />
        );
      })}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────── */

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('choose');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Step 3 (creator only)
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [software, setSoftware] = useState('');
  const [experience, setExperience] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [website, setWebsite] = useState('');

  /* ── handlers ── */

  const handleChoose = (type: AccountType) => {
    setAccountType(type);
    setStep('account');
  };

  const handleAccountStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/creator/dashboard` },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    setStep('profile');
    setLoading(false);
  };

  const handleProfileStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Session expired — please sign in again.'); setLoading(false); return; }

    // Insert universal profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      address_line1: address1,
      address_line2: address2 || null,
      city,
      state,
      zip,
      role: accountType === 'creator' ? 'creator' : 'member',
    });

    if (profileError) { setError(profileError.message); setLoading(false); return; }

    // Members are done; creators continue to the application step
    if (accountType === 'member') {
      setStep('done');
    } else {
      setStep('creator');
    }
    setLoading(false);
  };

  const handleCreatorStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Session expired — please sign in again.'); setLoading(false); return; }

    const resolvedHandle = handle || generateHandle(firstName, lastName);

    const { error: creatorError } = await supabase.from('creator_profiles').insert({
      id: user.id,
      name: `${firstName} ${lastName}`.trim(),
      handle: resolvedHandle.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio: bio || null,
      software: software || null,
      experience_level: experience || null,
      vehicle_specialties: specialties || null,
      website: website || null,
      verified: false,
      approved: false,
    });

    if (creatorError) {
      if (creatorError.code === '23505') {
        setError('That handle is already taken. Choose a different one.');
      } else {
        setError(creatorError.message);
      }
      setLoading(false);
      return;
    }

    setStep('done');
    setLoading(false);
  };

  /* ── done screen ── */

  if (step === 'done') {
    const isCreator = accountType === 'creator';
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#E8000D]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">
            {isCreator ? 'Application Submitted' : 'Check your email'}
          </h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            {isCreator ? (
              <>
                We sent a confirmation to <span className="text-white font-semibold">{email}</span>.
                Once confirmed, your creator application will be reviewed by our team.
                You'll hear back within 48 hours.
              </>
            ) : (
              <>
                We sent a confirmation link to <span className="text-white font-semibold">{email}</span>.
                Confirm it to activate your account.
              </>
            )}
          </p>
          <button
            onClick={() => router.push('/creator/dashboard')}
            className="btn-primary px-8 py-3 text-sm rounded-xl"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ── choose screen ── */

  if (step === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image src="/rf-logo.png" alt="The Racing Files" width={36} height={36} className="object-contain" />
              <span className="text-xl font-black uppercase tracking-tight text-white">
                The Racing <span className="text-[#E8000D]">Files</span>
              </span>
            </Link>
            <h1 className="text-3xl font-black text-white mb-2">Create Your Account</h1>
            <p className="text-sm text-zinc-500">Choose how you want to join The Racing Files</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Member */}
            <button
              onClick={() => handleChoose('member')}
              className="group relative rounded-2xl border border-[#2a2a2a] bg-[#141414] p-7 text-left hover:border-[#E8000D]/40 hover:bg-[#181818] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-[#2a2a2a] flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-zinc-400" />
              </div>
              <h2 className="text-base font-black text-white mb-2">Member</h2>
              <p className="text-xs text-zinc-500 leading-relaxed mb-5">
                Browse parts, place orders, request custom prints, and join the community. Instant access.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
                Get started <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 bg-[#1a1a1a] px-2 py-0.5 rounded">
                  Free
                </span>
              </div>
            </button>

            {/* Creator */}
            <button
              onClick={() => handleChoose('creator')}
              className="group relative rounded-2xl border border-[#2a2a2a] bg-[#141414] p-7 text-left hover:border-[#E8000D]/40 hover:bg-[#181818] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center mb-5">
                <Wrench className="w-5 h-5 text-[#E8000D]" />
              </div>
              <h2 className="text-base font-black text-white mb-2">Creator</h2>
              <p className="text-xs text-zinc-500 leading-relaxed mb-5">
                Sell your designs, earn on every download and print order, and build your brand. Requires approval.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
                Apply now <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8000D] bg-[#E8000D]/10 px-2 py-0.5 rounded">
                  Reviewed
                </span>
              </div>
            </button>
          </div>

          <p className="text-center text-xs text-zinc-600 mt-8">
            Already have an account?{' '}
            <Link href="/creator/login" className="text-[#E8000D] hover:text-white transition-colors font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  /* ── multi-step form ── */

  const stepLabels: Record<Step, string> = {
    choose: '',
    account: 'Step 1 — Account credentials',
    profile: accountType === 'creator' ? 'Step 2 of 3 — Profile info' : 'Step 2 of 2 — Profile info',
    creator: 'Step 3 of 3 — Creator application',
    done: '',
  };

  const headings: Record<Step, string> = {
    choose: '',
    account: 'Create Your Account',
    profile: 'Profile Info',
    creator: 'Creator Application',
    done: '',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/rf-logo.png" alt="The Racing Files" width={36} height={36} className="object-contain" />
            <span className="text-xl font-black uppercase tracking-tight text-white">
              The Racing <span className="text-[#E8000D]">Files</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">{headings[step]}</h1>
          <p className="text-sm text-zinc-500">{stepLabels[step]}</p>
          <StepDots current={step} type={accountType} />
        </div>

        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-8">

          {/* ── Step 1: Account ── */}
          {step === 'account' && (
            <form onSubmit={handleAccountStep} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="w-full rounded-lg px-4 py-3 text-sm" autoComplete="email" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Password *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required minLength={8}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters" className="w-full rounded-lg px-4 py-3 pr-11 text-sm"
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
              <button type="submit" disabled={loading}
                className="w-full btn-primary py-4 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Continue
              </button>
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <button type="button" onClick={() => setStep('choose')} className="hover:text-zinc-300 transition-colors">
                  ← Change account type
                </button>
                <Link href="/creator/login" className="text-[#E8000D] hover:text-white transition-colors font-semibold">
                  Sign in
                </Link>
              </div>
            </form>
          )}

          {/* ── Step 2: Profile Info ── */}
          {step === 'profile' && (
            <form onSubmit={handleProfileStep} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">First Name *</label>
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jake" className="w-full rounded-lg px-4 py-3 text-sm" autoComplete="given-name" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Last Name *</label>
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Moreno" className="w-full rounded-lg px-4 py-3 text-sm" autoComplete="family-name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Mailing Address *</label>
                <input type="text" required value={address1} onChange={(e) => setAddress1(e.target.value)}
                  placeholder="123 Main St" className="w-full rounded-lg px-4 py-3 text-sm" autoComplete="address-line1" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Address Line 2</label>
                <input type="text" value={address2} onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apt, Suite, Unit (optional)" className="w-full rounded-lg px-4 py-3 text-sm" autoComplete="address-line2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">City *</label>
                  <input type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="Los Angeles" className="w-full rounded-lg px-4 py-3 text-sm" autoComplete="address-level2" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">ZIP Code *</label>
                  <input type="text" required value={zip} onChange={(e) => setZip(e.target.value)}
                    placeholder="90001" className="w-full rounded-lg px-4 py-3 text-sm"
                    autoComplete="postal-code" inputMode="numeric" maxLength={10} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">State *</label>
                <select required value={state} onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm appearance-none" autoComplete="address-level1">
                  <option value="">Select state…</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
              <button type="submit" disabled={loading}
                className="w-full btn-primary py-4 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {accountType === 'creator' ? 'Continue' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── Step 3: Creator Application (creator only) ── */}
          {step === 'creator' && (
            <form onSubmit={handleCreatorStep} className="space-y-5">
              <div className="rounded-lg bg-[#E8000D]/5 border border-[#E8000D]/15 px-4 py-3">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your application will be reviewed by our team within <span className="text-white font-semibold">48 hours</span>. You'll receive an email once approved.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Creator Handle *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                  <input type="text" required value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="jakefab" className="w-full rounded-lg pl-7 pr-4 py-3 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Bio</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us what you design and what vehicles you specialize in..."
                  className="w-full rounded-lg px-4 py-3 text-sm resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Design Software *</label>
                <input type="text" required value={software} onChange={(e) => setSoftware(e.target.value)}
                  placeholder="Fusion 360, SolidWorks, FreeCAD…" className="w-full rounded-lg px-4 py-3 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Experience Level *</label>
                <select required value={experience} onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm appearance-none">
                  <option value="">Select…</option>
                  {EXPERIENCE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Vehicle Specialties *</label>
                <input type="text" required value={specialties} onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="NA Miata, R32 GTR, Tacoma…" className="w-full rounded-lg px-4 py-3 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Portfolio URL (optional)</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://printables.com/…" className="w-full rounded-lg px-4 py-3 text-sm" />
              </div>

              {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}

              <button type="submit" disabled={loading}
                className="w-full btn-primary py-4 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Application
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
