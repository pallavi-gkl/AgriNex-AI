/**
 * @fileoverview CartContext — global shopping cart state
 * Persists to localStorage so cart survives page navigation.
 * Shared between Marketplace, Wishlist, and any other consumer page.
 */
"use client";

import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef,
} from "react";
import { supabase } from "@/lib/supabase";

const CART_STORAGE_KEY = "agrinex_cart";

export interface CartItem {
  productId: string;
  title: string;
  pricePerUnit: number;
  unitType: string;
  quantity: number;
  farmerId: string;
  farmerName: string;
  imageUrl?: string | null;
  maxQty: number;
  category?: string;
}

interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const isHydrated = useRef(false);

  // Hydrate from localStorage and Supabase on mount
  useEffect(() => {
    async function hydrate() {
      let localCart: CartItem[] = [];
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          localCart = JSON.parse(stored);
          setCart(localCart);
        }
      } catch (e) {}

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const dbCart = dbCartFromMetadata(user.user_metadata?.cart);
          const merged = [...localCart];
          for (const item of dbCart) {
            const existing = merged.find(m => m.productId === item.productId);
            if (!existing) {
              merged.push(item);
            } else {
              existing.quantity = Math.max(existing.quantity, item.quantity);
            }
          }
          setCart(merged);
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(merged));
          if (merged.length !== dbCart.length) {
            await supabase.auth.updateUser({
              data: { cart: merged }
            });
          }
        }
      } catch (e) {}

      isHydrated.current = true;
    }
    hydrate();
  }, []);

  // helper function to parse db cart list robustly
  function dbCartFromMetadata(val: any): CartItem[] {
    if (Array.isArray(val)) return val;
    return [];
  }

  // Persist to Supabase and localStorage on change
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}

    async function syncToDb() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: { cart }
          });
        }
      } catch (e) {}
    }
    syncToDb();
  }, [cart]);

  const addToCart = useCallback((product: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, product.maxQty) }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const isInCart = useCallback(
    (productId: string) => cart.some((i) => i.productId === productId),
    [cart]
  );

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, cartTotal, addToCart, updateQty, removeFromCart, clearCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
