"use client";

/**
 * @fileoverview Wishlist Page — /consumer/wishlist
 * Shows saved products with add-to-cart and quick-navigate to product detail.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Heart, ShoppingCart, Trash2, Package, Leaf, ArrowRight, Star,
  TrendingUp, X, Sparkles,
} from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { DEMO_CROPS } from "@/lib/demoData";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Enrich wishlist items with latest demo data
  const enriched = wishlist.map((item) => {
    const demo = DEMO_CROPS.find((c) => c.id === item.id);
    return demo ? { ...item, rating: demo.rating, reviewsCount: demo.reviews_count, isOrganic: demo.is_organic } : item;
  });

  const handleAddToCart = (item: typeof wishlist[0]) => {
    // Mark as "added" temporarily
    setAddedIds((prev) => new Set([...prev, item.id]));
    setTimeout(() => setAddedIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; }), 2000);
    
    // Add to global cart
    addToCart({
      productId: item.id,
      title: item.title,
      pricePerUnit: item.pricePerUnit,
      unitType: item.unitType,
      farmerId: item.farmerId ?? "",
      farmerName: item.farmerName ?? "Verified Farmer",
      imageUrl: item.imageUrl,
      maxQty: 999,
      category: item.category,
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <Heart className="w-10 h-10 text-red-400/40" />
        </div>
        <h2 className="text-white font-bold text-xl mb-2">Your Wishlist is Empty</h2>
        <p className="text-slate-400 text-sm mb-6">Save products you love to buy them later</p>
        <Link href="/consumer/marketplace"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}>
          <Leaf className="w-4 h-4" />
          Browse Marketplace
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400" />
            My Wishlist
          </h1>
          <p className="text-slate-400 text-sm mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
        </div>
        {wishlist.length > 0 && (
          <button onClick={clearWishlist}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 transition-all hover:scale-105"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence>
          {enriched.map((item) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel rounded-2xl overflow-hidden group">
              {/* Image */}
              <div className="relative h-44 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(16,185,129,0.04))" }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-10 h-10 text-red-400/20" />
                  </div>
                )}
                {/* Remove button */}
                <button onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(239,68,68,0.3)", backdropFilter: "blur(8px)", border: "1px solid rgba(239,68,68,0.4)" }}>
                  <X className="w-4 h-4 text-red-300" />
                </button>
                {(item as any).isOrganic && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: "rgba(74,222,128,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
                    🌿 Organic
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4">
                <Link href={`/consumer/marketplace/${item.id}`}>
                  <h3 className="text-white font-semibold text-sm leading-tight hover:text-emerald-400 transition-colors line-clamp-2">{item.title}</h3>
                </Link>
                {item.qualityGrade && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-400"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    Grade {item.qualityGrade}
                  </span>
                )}
                {item.farmerName && (
                  <p className="text-slate-500 text-xs mt-1.5">{item.farmerName}</p>
                )}
                {(item as any).rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400" fill="#fbbf24" />
                    <span className="text-white text-xs font-medium">{(item as any).rating}</span>
                    {(item as any).reviewsCount && <span className="text-slate-500 text-xs">({(item as any).reviewsCount})</span>}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-emerald-400 font-bold text-base">₹{item.pricePerUnit}</span>
                    <span className="text-slate-500 text-xs ml-1">/{item.unitType}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: addedIds.has(item.id)
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.1))",
                      border: "1px solid rgba(16,185,129,0.35)",
                      color: addedIds.has(item.id) ? "#ffffff" : "#34d399",
                    }}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    {addedIds.has(item.id) ? "Added!" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link href="/consumer/marketplace"
          className="inline-flex items-center gap-2 text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
          <Sparkles className="w-4 h-4" />
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
