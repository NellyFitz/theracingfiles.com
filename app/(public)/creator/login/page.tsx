'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (next) {
      router.push(next);
    } else {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user!.id;

      const [{ data: prof }, { data: userProf }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', userId).single(),
        supabase.from('user_profiles').select('role').eq('id', userId).single(),
      ]);

      const isCreator = prof?.role === 'creator' || userProf?.role === 'creator';
      router.push(isCreator ? '/creator/dashboard' : '/account');
    }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email</label>
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
        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg px-4 py-3 pr-11 text-sm"
            autoComplete="current-password"
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
        className="w-full btn-primary py-4 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="pt-2 border-t border-[#2a2a2a]">
        <p className="text-center text-xs text-zinc-500 mb-3">Don&apos;t have an account?</p>
        <Link
          href="/creator/signup"
          className="w-full border border-[#2a2a2a] hover:border-[#E8000D]/40 text-zinc-300 hover:text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center transition-colors"
        >
          Create an Account
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-16">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login-bg.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay so the form stays readable */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Subtle red vignette from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#E8000D]/10 via-transparent to-black/40" />
      </div>

      {/* Form card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/rf-logo.png" alt="The Racing Files" width={36} height={36} className="object-contain" />
            <span className="text-xl font-black tracking-tight text-white">
              The Racing<span className="text-[#E8000D]"> Files</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Sign In</h1>
          <p className="text-sm text-zinc-400">Welcome back — sign in to your account.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
