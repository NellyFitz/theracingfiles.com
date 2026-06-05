'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Users, Wrench, ArrowRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

type Mode = 'choose' | 'member' | 'creator';

function LoginForm({ mode, onBack }: { mode: 'member' | 'creator'; onBack: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

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
    } else if (mode === 'creator') {
      router.push('/creator/dashboard');
    } else {
      router.push('/account');
    }
    router.refresh();
  };

  const isMember = mode === 'member';

  return (
    <div>
      {/* Back + mode label */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-5 ${
        isMember
          ? 'bg-zinc-800/40 border-zinc-700/40 text-zinc-300'
          : 'bg-[#E8000D]/10 border-[#E8000D]/30 text-[#E8000D]'
      }`}>
        {isMember
          ? <Users className="w-3.5 h-3.5" />
          : <Wrench className="w-3.5 h-3.5" />}
        <span className="text-xs font-bold uppercase tracking-widest">
          {isMember ? 'Member Login' : 'Creator Login'}
        </span>
      </div>

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
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="pt-5 mt-5 border-t border-[#2a2a2a] space-y-3">
        <p className="text-center text-xs text-zinc-500">Don&apos;t have an account?</p>
        <Link
          href={`/creator/signup${mode === 'creator' ? '?type=creator' : '?type=member'}`}
          className="w-full border border-[#2a2a2a] hover:border-[#E8000D]/40 text-zinc-300 hover:text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center transition-colors"
        >
          Create an Account
        </Link>
        {mode === 'member' && (
          <p className="text-center text-[11px] text-zinc-600">
            Want to sell parts?{' '}
            <button
              onClick={onBack}
              className="text-[#E8000D] hover:underline"
            >
              Apply for a Creator account
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

function LoginPageInner() {
  const [mode, setMode] = useState<Mode>('choose');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/rf-logo.png" alt="The Racing Files" width={36} height={36} className="object-contain" />
            <span className="text-xl font-black tracking-tight text-white">
              The Racing<span className="text-[#E8000D]"> Files</span>
            </span>
          </Link>
          {mode === 'choose' && (
            <>
              <h1 className="text-3xl font-black text-white mb-2">Sign In</h1>
              <p className="text-sm text-zinc-500">Choose how you&apos;d like to sign in.</p>
            </>
          )}
          {mode === 'member' && (
            <>
              <h1 className="text-3xl font-black text-white mb-2">Member Sign In</h1>
              <p className="text-sm text-zinc-500">Access your account and purchases.</p>
            </>
          )}
          {mode === 'creator' && (
            <>
              <h1 className="text-3xl font-black text-white mb-2">Creator Sign In</h1>
              <p className="text-sm text-zinc-500">Access your creator dashboard and submissions.</p>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-8">
          {mode === 'choose' ? (
            <div className="space-y-4">
              {/* Member card */}
              <button
                onClick={() => setMode('member')}
                className="w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-zinc-600 hover:bg-[#1f1f1f] p-5 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-700/30 border border-zinc-700/40 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-zinc-300" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">Member</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Browse, buy, and download parts</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
              </button>

              {/* Creator card */}
              <button
                onClick={() => setMode('creator')}
                className="w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#E8000D]/50 hover:bg-[#E8000D]/5 p-5 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5 text-[#E8000D]" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">Creator</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Sell parts — requires creator approval</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#E8000D] transition-colors" />
                </div>
              </button>

              <div className="pt-4 border-t border-[#2a2a2a]">
                <p className="text-center text-xs text-zinc-600">
                  New here?{' '}
                  <Link href="/creator/signup" className="text-[#E8000D] hover:underline">
                    Create a free account
                  </Link>
                  {' '}— start as a Member, apply to become a Creator.
                </p>
              </div>
            </div>
          ) : (
            <Suspense>
              <LoginForm mode={mode} onBack={() => setMode('choose')} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
