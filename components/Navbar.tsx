'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Zap, LayoutDashboard, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const navLinks = [
  { href: '/browse', label: 'Parts Marketplace' },
  { href: '/creator', label: 'Sell Parts' },
  { href: '/about', label: 'About' },
  { href: '/request', label: 'Request a Part' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e1e] bg-[#0d0d0d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#39ff14] rounded flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#0d0d0d]" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Print<span className="text-[#39ff14]">Shift</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-[#39ff14] transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/browse"
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <Search className="w-4 h-4" />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/creator/dashboard"
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors border border-[#2a2a2a] rounded-lg px-3 py-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/creator/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/request" className="btn-primary px-4 py-2 text-xs rounded">
                  Request a Part
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1e1e1e] bg-[#0d0d0d]">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-300 hover:text-[#39ff14] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-[#1e1e1e] flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    href="/creator/dashboard"
                    className="text-sm text-zinc-300 hover:text-white flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="text-sm text-zinc-500 hover:text-red-400 text-left flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/creator/login" className="text-sm text-zinc-300 hover:text-white" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                  <Link
                    href="/request"
                    className="btn-primary px-4 py-2 text-xs rounded text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    Request a Part
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
