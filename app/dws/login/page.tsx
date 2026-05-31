'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, Lock, Mail } from 'lucide-react';

export default function DwsLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/dws-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/dws');
      router.refresh();
    } else {
      setError(data.error ?? 'Access denied');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#E8000D]/10 border border-[#E8000D]/30 flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-[#E8000D]" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Admin Access</h1>
          <p className="text-sm text-zinc-500 mt-1">Sign in with your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoFocus
              required
              className="w-full rounded-lg pl-11 pr-4 py-3 text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-lg pl-11 pr-4 py-3 text-sm"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center pt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full btn-primary py-3 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
