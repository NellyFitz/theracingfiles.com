'use client';

import Link from 'next/link';
import { ShoppingCart, X, Download, Printer, Wrench } from 'lucide-react';
import { useCart } from '@/lib/cart';

const tierIcon = { file: Download, printed: Printer, finished: Wrench };
const tierLabel = { file: 'Digital File', printed: 'Pre-Printed', finished: 'Fully Finished' };

export default function DashboardCart() {
  const { items, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-8 text-center">
        <ShoppingCart className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">Your cart is empty</p>
        <Link href="/browse" className="mt-4 inline-block text-xs text-[#E8000D] hover:underline">
          Browse the marketplace
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + (item.price ?? 0), 0);

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#E8000D]" />
          <span className="text-sm font-bold text-white">Cart ({items.length})</span>
        </div>
        <button onClick={clearCart} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
          Clear all
        </button>
      </div>

      <div className="divide-y divide-[#2a2a2a]">
        {items.map((item) => {
          const Icon = tierIcon[item.tier];
          return (
            <div key={`${item.productId}-${item.tier}`} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#E8000D]" />
                </div>
                <div className="min-w-0">
                  <Link href={`/products/${item.slug}`} className="text-sm font-semibold text-white hover:text-[#E8000D] transition-colors truncate block">
                    {item.productName}
                  </Link>
                  <p className="text-[10px] text-zinc-500">{tierLabel[item.tier]}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="text-sm font-bold text-white">
                  {item.price != null ? `$${item.price}` : 'Quote'}
                </span>
                <button
                  onClick={() => removeItem(item.productId, item.tier)}
                  className="text-zinc-600 hover:text-[#E8000D] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-[#2a2a2a] flex items-center justify-between">
        <div>
          <p className="text-[10px] text-zinc-500">Subtotal</p>
          <p className="text-lg font-black text-white">${total.toFixed(2)}</p>
        </div>
        <button className="btn-primary px-6 py-2.5 text-sm rounded-lg">
          Checkout
        </button>
      </div>
    </div>
  );
}
