'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, X, Download, Printer, Wrench,
  ArrowRight, LogIn, User, Trash2, ArrowLeft, Package,
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
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-[#E8000D]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-500">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Sign in to checkout</p>
                      <p className="text-xs text-zinc-500 mb-4">
                        Save your cart and access your order history.
                      </p>
                      <Link
                        href={`/creator/login?next=/cart`}
                        className="w-full btn-primary py-2.5 text-xs rounded-lg flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Sign In
                      </Link>
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
                  disabled={!user && !authLoading}
                  className="w-full btn-primary py-3.5 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {user ? (
                    <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Sign In to Checkout <LogIn className="w-4 h-4" /></>
                  )}
                </button>

                {!user && !authLoading && (
                  <p className="text-[10px] text-zinc-600 text-center mt-3">
                    You must be signed in to complete a purchase.
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
