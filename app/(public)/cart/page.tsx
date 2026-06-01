'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, X, Download, Printer, Wrench,
  ArrowRight, LogIn, User, Trash2, ArrowLeft, Package, UserCheck,
} from 'lucide-react';
import { useCart } from '@/lib/cart';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const tierIcon = { file: Download, printed: Printer, finished: Wrench };
const tierLabel = { file: 'Digital File', printed: 'Pre-Printed', finished: 'Fully Finished' };
const tierColor = { file: '#E8000D', printed: '#00d4ff', finished: '#ffa500' };

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestAddress2, setGuestAddress2] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestState, setGuestState] = useState('');
  const [guestZip, setGuestZip] = useState('');
  const [guestReady, setGuestReady] = useState(false);

  const guestValid =
    guestFirstName.trim() !== '' &&
    guestLastName.trim() !== '' &&
    guestEmail.includes('@') &&
    guestAddress.trim() !== '' &&
    guestCity.trim() !== '' &&
    guestZip.trim() !== '';

  const resetGuest = () => {
    setGuestFirstName(''); setGuestLastName(''); setGuestEmail('');
    setGuestAddress(''); setGuestAddress2(''); setGuestCity(''); setGuestState(''); setGuestZip('');
    setGuestReady(false);
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const hasQuote = items.some((item) => item.price === null);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/browse" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-[#E8000D]" />
            <h1 className="text-3xl font-black text-white">Your Cart</h1>
            {items.length > 0 && (
              <span className="text-sm text-zinc-500">({items.length} item{items.length !== 1 ? 's' : ''})</span>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length === 0 ? (
          /* Empty state */
          <div className="max-w-md mx-auto text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-zinc-700" />
            </div>
            <h2 className="text-xl font-black text-white mb-3">Cart is empty</h2>
            <p className="text-zinc-500 text-sm mb-8">
              Browse the marketplace and add parts to get started.
            </p>
            <Link href="/browse" className="btn-primary px-8 py-3 text-sm rounded-xl inline-flex items-center gap-2">
              Browse Parts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Items</h2>
                <button
                  onClick={clearCart}
                  className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-[#E8000D] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear cart
                </button>
              </div>

              {items.map((item) => {
                const Icon = tierIcon[item.tier];
                const color = tierColor[item.tier];
                return (
                  <div
                    key={`${item.productId}-${item.tier}`}
                    className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 flex items-center gap-4"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}12`, border: `1px solid ${color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-sm font-bold text-white hover:text-[#E8000D] transition-colors truncate block"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">{tierLabel[item.tier]}</p>
                    </div>

                    <div className="flex items-center gap-5 shrink-0">
                      <span className="text-base font-black text-white">
                        {item.price != null ? `$${item.price}` : 'Quote'}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId, item.tier)}
                        className="w-7 h-7 rounded-lg bg-[#1e1e1e] hover:bg-[#E8000D]/10 hover:text-[#E8000D] text-zinc-600 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary + auth */}
            <div className="space-y-5">

              {/* Auth state */}
              {!authLoading && (
                <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                  {user ? (
                    /* Logged in */
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-[#E8000D]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-500">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user.email}</p>
                      </div>
                    </div>
                  ) : guestMode ? (
                    /* Guest checkout form */
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <UserCheck className="w-4 h-4 text-[#E8000D]" />
                        <p className="text-sm font-bold text-white">Guest Checkout</p>
                      </div>
                      <div className="space-y-3">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">First Name *</label>
                            <input
                              type="text"
                              value={guestFirstName}
                              onChange={(e) => { setGuestFirstName(e.target.value); setGuestReady(false); }}
                              placeholder="Alex"
                              className="w-full rounded-lg px-3 py-2.5 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Last Name *</label>
                            <input
                              type="text"
                              value={guestLastName}
                              onChange={(e) => { setGuestLastName(e.target.value); setGuestReady(false); }}
                              placeholder="Reyes"
                              className="w-full rounded-lg px-3 py-2.5 text-sm"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Email *</label>
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => { setGuestEmail(e.target.value); setGuestReady(false); }}
                            placeholder="you@email.com"
                            className="w-full rounded-lg px-3 py-2.5 text-sm"
                          />
                        </div>

                        {/* Street address */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Street Address *</label>
                          <input
                            type="text"
                            value={guestAddress}
                            onChange={(e) => { setGuestAddress(e.target.value); setGuestReady(false); }}
                            placeholder="123 Main St"
                            className="w-full rounded-lg px-3 py-2.5 text-sm mb-2"
                          />
                          <input
                            type="text"
                            value={guestAddress2}
                            onChange={(e) => setGuestAddress2(e.target.value)}
                            placeholder="Apt, Suite, Unit (optional)"
                            className="w-full rounded-lg px-3 py-2.5 text-sm"
                          />
                        </div>

                        {/* City / State / ZIP */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">City *</label>
                            <input
                              type="text"
                              value={guestCity}
                              onChange={(e) => { setGuestCity(e.target.value); setGuestReady(false); }}
                              placeholder="Austin"
                              className="w-full rounded-lg px-3 py-2.5 text-sm"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">State</label>
                            <input
                              type="text"
                              value={guestState}
                              onChange={(e) => setGuestState(e.target.value)}
                              placeholder="TX"
                              maxLength={2}
                              className="w-full rounded-lg px-3 py-2.5 text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">ZIP *</label>
                            <input
                              type="text"
                              value={guestZip}
                              onChange={(e) => { setGuestZip(e.target.value); setGuestReady(false); }}
                              placeholder="78701"
                              className="w-full rounded-lg px-3 py-2.5 text-sm"
                            />
                          </div>
                        </div>

                        {!guestReady ? (
                          <button
                            onClick={() => { if (guestValid) setGuestReady(true); }}
                            disabled={!guestValid}
                            className="w-full bg-[#E8000D] hover:bg-[#c0000b] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                          >
                            Continue as Guest
                          </button>
                        ) : (
                          <div className="flex items-center justify-between gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-3.5 h-3.5 shrink-0" />
                              {guestFirstName} {guestLastName} — {guestEmail}
                            </div>
                            <button onClick={() => setGuestReady(false)} className="text-zinc-500 hover:text-white transition-colors shrink-0">Edit</button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { setGuestMode(false); resetGuest(); }}
                        className="mt-3 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        ← Back to sign in options
                      </button>
                    </div>
                  ) : (
                    /* Not logged in — choose */
                    <div>
                      <p className="text-sm font-bold text-white mb-1">How would you like to checkout?</p>
                      <p className="text-xs text-zinc-500 mb-4">Sign in to save your order history, or continue as a guest.</p>
                      <Link
                        href={`/creator/login?next=/cart`}
                        className="w-full btn-primary py-2.5 text-xs rounded-lg flex items-center justify-center gap-2 mb-2"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Sign In
                      </Link>
                      <button
                        onClick={() => setGuestMode(true)}
                        className="w-full border border-[#2a2a2a] hover:border-[#E8000D]/40 text-zinc-400 hover:text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Continue as Guest
                      </button>
                      <p className="text-[10px] text-zinc-600 text-center mt-3">
                        No account?{' '}
                        <Link href="/creator/signup" className="text-[#E8000D] hover:underline">
                          Create one free
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Order summary */}
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.tier}`} className="flex items-center justify-between">
                      <p className="text-xs text-zinc-400 truncate max-w-[65%]">{item.productName}</p>
                      <p className="text-xs font-semibold text-white shrink-0">
                        {item.price != null ? `$${item.price}` : 'Quote'}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#2a2a2a] pt-4 flex items-center justify-between mb-5">
                  <p className="text-sm text-zinc-400">Subtotal</p>
                  <div className="text-right">
                    <p className="text-xl font-black text-white">${subtotal.toFixed(2)}</p>
                    {hasQuote && (
                      <p className="text-[10px] text-zinc-600">+ quote items</p>
                    )}
                  </div>
                </div>

                <button
                  disabled={authLoading || (!user && !(guestMode && guestReady))}
                  className="w-full btn-primary py-3.5 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                {!user && !(guestMode && guestReady) && !authLoading && (
                  <p className="text-[10px] text-zinc-600 text-center mt-3">
                    Sign in or continue as guest to checkout.
                  </p>
                )}
              </div>

              {/* Trust badges */}
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 space-y-3">
                {[
                  { label: 'Instant download', sub: 'Digital files delivered immediately after payment' },
                  { label: 'Secure checkout', sub: 'Powered by Stripe — we never store card details' },
                  { label: 'No DRM', sub: 'Your files, yours to keep and print as needed' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E8000D] shrink-0 mt-1.5" />
                    <div>
                      <p className="text-xs font-semibold text-white">{item.label}</p>
                      <p className="text-[10px] text-zinc-600 leading-relaxed">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
