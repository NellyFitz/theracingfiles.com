'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  slug: string;
  tier: 'file' | 'printed' | 'finished';
  price: number | null;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, tier: string) => void;
  clearCart: () => void;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'rf_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === item.productId && i.tier === item.tier);
      if (exists) return prev;
      const next = [...prev, item];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string, tier: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => !(i.productId === productId && i.tier === tier));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
