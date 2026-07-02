/**
 * @fileoverview useWishlist — manage wishlist items in localStorage
 * with an optional Supabase sync for authenticated users.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "agrinex_wishlist";

export interface WishlistItem {
  id: string;
  title: string;
  pricePerUnit: number;
  unitType: string;
  imageUrl?: string | null;
  qualityGrade?: string;
  farmerName?: string;
  farmerId?: string;
  category?: string;
  addedAt: string;
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const isHydrated = useRef(false);

  // Load/Hydrate from localStorage and Supabase on mount
  useEffect(() => {
    async function hydrate() {
      let localWishlist: WishlistItem[] = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          localWishlist = JSON.parse(stored);
          setWishlist(localWishlist);
        }
      } catch (e) {}

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const dbWishlist = user.user_metadata?.wishlist || [];
          const merged = [...localWishlist];
          for (const item of dbWishlist) {
            if (!merged.some(m => m.id === item.id)) {
              merged.push(item);
            }
          }
          setWishlist(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          if (merged.length !== dbWishlist.length) {
            await supabase.auth.updateUser({
              data: { wishlist: merged }
            });
          }
        }
      } catch (e) {}

      isHydrated.current = true;
    }
    hydrate();
  }, []);

  // Sync to Supabase and localStorage on wishlist change
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {}

    async function syncToDb() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: { wishlist }
          });
        }
      } catch (e) {}
    }
    syncToDb();
  }, [wishlist]);

  const addToWishlist = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setWishlist((prev) => {
      if (prev.some((w) => w.id === item.id)) return prev;
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const isInWishlist = useCallback(
    (id: string) => wishlist.some((w) => w.id === id),
    [wishlist]
  );

  const clearWishlist = useCallback(() => setWishlist([]), []);

  return { wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist };
}
