'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

function generateHandle(first: string, last: string): string {
  const base = `${first}${last}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<'account' | 'profile' | 'done'>('account');
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

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setStep('profile');
    setLoading(false);
  };

  const handleProfileStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Session expired — please sign in again.');
      setLoading(false);
      return;
    }

    const handle = generateHandle(firstName, lastName);

    const { error: profileError } = await supabase.from('creator_profiles').insert({
      id: user.id,
      name: `${firstName} ${lastName}`.trim(),
      handle,
      address_line1: address1,
      address_line2: address2 || null,
      city,
      state,
      zip,
      verified: false,
      approved: false,
    });

    if (profileError) {
      if (profileError.code === '23505') {
        // Rare handle collision — retry with a fresh handle
        const retryHandle = generateHandle(firstName, lastName);
        const { error: retryError } = await supabase.from('creator_profiles').insert({
          id: user.id,
          name: `${firstName} ${lastName}`.trim(),
          handle: retryHandle,
          address_line1: address1,
          address_line2: address2 || null,
          city,
          state,
          zip,
          verified: false,
          approved: false,
        });
        if (retryError) {
          setError(retryError.message);
          setLoading(false);
          return;
        }
      } else {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    setStep('done');
    setLoading(false);
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#E8000D]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Check your email</h2>
          <p className="text-zinc-400 text-sm mb-6">
            We sent a confirmation link to <span className="text-white font-semibold">{email}</span>.
            Confirm it to activate your account.
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
          <h1 className="text-3xl font-black text-white mb-2">
            {step === 'account' ? 'Create Your Account' : 'Profile Info'}
          </h1>
          <p className="text-sm text-zinc-500">
            {step === 'account'
              ? 'Step 1 of 2 — Account credentials'
              : 'Step 2 of 2 — Your details'}
          </p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {(['account', 'profile'] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s
                    ? 'w-8 bg-[#E8000D]'
                    : step === 'profile' && i === 0
                    ? 'w-4 bg-[#E8000D]/40'
                    : 'w-4 bg-[#2a2a2a]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-8">
          {step === 'account' ? (
            <form onSubmit={handleAccountStep} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg px-4 py-3 text-sm"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-lg px-4 py-3 pr-11 text-sm"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue
              </button>

              <p className="text-center text-xs text-zinc-500">
                Already have an account?{' '}
                <Link href="/creator/login" className="text-[#E8000D] hover:text-white transition-colors font-semibold">
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleProfileStep} className="space-y-5">

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jake"
                    className="w-full rounded-lg px-4 py-3 text-sm"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Moreno"
                    className="w-full rounded-lg px-4 py-3 text-sm"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Mailing Address *</label>
                <input
                  type="text"
                  required
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full rounded-lg px-4 py-3 text-sm"
                  autoComplete="address-line1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apt, Suite, Unit (optional)"
                  className="w-full rounded-lg px-4 py-3 text-sm"
                  autoComplete="address-line2"
                />
              </div>

              {/* City / State / ZIP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Los Angeles"
                    className="w-full rounded-lg px-4 py-3 text-sm"
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="90001"
                    className="w-full rounded-lg px-4 py-3 text-sm"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">State *</label>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm appearance-none"
                  autoComplete="address-level1"
                >
                  <option value="">Select state…</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
