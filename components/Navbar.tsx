'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, LayoutDashboard, LogOut } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const navLinks = [
  { href: '/browse', label: 'Marketplace' },
  { href: '/creator', label: 'Sell Parts' },
  { href: '/about', label: 'About' },
  { href: '/request', label: 'Request a Part' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll); };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-[#080808]/98 border-b border-[#1a1a1a]' : 'bg-[#080808]/80 border-b border-transparent'
    } backdrop-blur-md`}>
      {/* Racing accent line — top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#E8000D] via-[#E8000D]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image src="/rf-logo.png" alt="The Racing Files" width={36} height={36} className="object-contain" />
            <span className="font-black tracking-tight text-white text-base uppercase" style={{ letterSpacing: '-0.01em' }}>
              The Racing <span className="text-[#E8000D]">Files</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-[#E8000D] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/browse" className="text-zinc-500 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/creator/dashboard"
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border border-[#222] px-3 py-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button onClick={handleSignOut}
                  className="text-zinc-600 hover:text-red-400 transition-colors" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/creator/login"
                  className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/request" className="btn-primary px-4 py-2 text-xs rounded-none">
                  Request a Part
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1a1a1a] bg-[#080808]">
          <div className="px-4 py-5 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#E8000D] transition-colors"
                onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#1a1a1a] flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/creator/dashboard"
                    className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <button onClick={handleSignOut}
                    className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-red-400 text-left flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/creator/login"
                    className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white"
                    onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/request"
                    className="btn-primary px-4 py-2.5 text-xs rounded-none text-center"
                    onClick={() => setMobileOpen(false)}>
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
