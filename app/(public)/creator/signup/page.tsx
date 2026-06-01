'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const EXPERIENCE_OPTIONS = [
  'Hobbyist (1–2 years)',
  'Experienced (3–5 years)',
  'Professional (5+ years)',
  'Industry Background (Engineering / Manufacturing)',
];

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<'account' | 'profile' | 'done'>('account');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [software, setSoftware] = useState('');
  const [experience, setExperience] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [website, setWebsite] = useState('');

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

    const { error: profileError } = await supabase.from('creator_profiles').insert({
      id: user.id,
      name,
      handle: handle.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio: bio || null,
      software: software || null,
      experience_level: experience || null,
      vehicle_specialties: specialties || null,
      website: website || null,
      verified: false,
      approved: false,
    });

    if (profileError) {
      // If handle is taken
      if (profileError.code === '23505') {
        setError('That handle is already taken. Choose a different one.');
      } else {
        setError(profileError.message);
      }
      setLoading(false);
      return;
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
            Confirm it to activate your creator account.
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
            <span className="text-xl font-black tracking-tight text-white">
              The Racing <span className="text-[#E8000D]">Files</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">
            {step === 'account' ? 'Create Your Account' : 'Build Your Profile'}
          </h1>
          <p className="text-sm text-zinc-500">
            {step === 'account'
              ? 'Step 1 of 2 — Account credentials'
              : 'Step 2 of 2 — Creator profile'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jake Moreno"
                    className="w-full rounded-lg px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Handle *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                    <input
                      type="text"
                      required
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="jakefab"
                      className="w-full rounded-lg pl-7 pr-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell buyers what you design and what vehicles you specialize in..."
                  className="w-full rounded-lg px-4 py-3 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Design Software *</label>
                <input
                  type="text"
                  required
                  value={software}
                  onChange={(e) => setSoftware(e.target.value)}
                  placeholder="Fusion 360, SolidWorks, FreeCAD..."
                  className="w-full rounded-lg px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Experience Level *</label>
                <select
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm appearance-none"
                >
                  <option value="">Select...</option>
                  {EXPERIENCE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Vehicle Specialties *</label>
                <input
                  type="text"
                  required
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="NA Miata, R32 GTR, Tacoma..."
                  className="w-full rounded-lg px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Portfolio URL (optional)</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://printables.com/..."
                  className="w-full rounded-lg px-4 py-3 text-sm"
                />
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
                Create Creator Profile
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
