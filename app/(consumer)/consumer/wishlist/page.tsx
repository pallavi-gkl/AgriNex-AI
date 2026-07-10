"use client";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation("consumer");
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Enrich wishlist items with latest demo data
  const enriched = wishlist.map((item) => {
    const demo = DEMO_CROPS.find((c) => c.id === item.id);
    return demo ? { ...item, rating: demo.rating, reviewsCount: demo.reviews_count, isOrganic: demo.is_organic } : item;
  });

  const handleAddToCart = (item: typeof wishlist[0]) => {
  const { t } = useTranslation("consumer");
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
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-rose-50 border border-rose-200">
          <Heart className="w-10 h-10 text-rose-300" />
        </div>
        <h2 className="text-slate-800 font-bold text-xl mb-2">{t("emptyWishlist")}</h2>
        <p className="text-slate-500 text-sm mb-6">Save products you love to buy them later</p>
        <Link href="/consumer/marketplace"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 no-underline"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}>
          <Leaf className="w-4 h-4" />
          {t("browseMarketplace")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            {t("wishlistTitle")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
        </div>
        {wishlist.length > 0 && (
          <button onClick={clearWishlist}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 font-semibold transition-all hover:scale-105 bg-rose-50 border border-rose-200 hover:bg-rose-100">
            <Trash2 className="w-3.5 h-3.5" />
            {t("clearAll2")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence>
          {enriched.map((item) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="premium-card rounded-3xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-10 h-10 text-slate-200" />
                  </div>
                )}
                {/* Remove button */}
                <button onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-white border border-rose-200 shadow-sm">
                  <X className="w-4 h-4 text-rose-500" />
                </button>
                {(item as any).isOrganic && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    🌿 Organic
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4">
                <Link href={`/consumer/marketplace/${item.id}`}>
                  <h3 className="text-slate-800 font-bold text-sm leading-tight hover:text-emerald-600 transition-colors line-clamp-2">{item.title}</h3>
                </Link>
                {item.qualityGrade && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    {t("grade")} {item.qualityGrade}
                  </span>
                )}
                {item.farmerName && (
                  <p className="text-slate-500 text-xs mt-1.5 font-semibold">{item.farmerName}</p>
                )}
                {(item as any).rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-500" fill="#f59e0b" />
                    <span className="text-slate-700 text-xs font-semibold">{(item as any).rating}</span>
                    {(item as any).reviewsCount && <span className="text-slate-400 text-xs">({(item as any).reviewsCount})</span>}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-emerald-600 font-extrabold text-base">₹{item.pricePerUnit}</span>
                    <span className="text-slate-400 text-xs ml-1">/{item.unitType}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: addedIds.has(item.id)
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : "#f0fdf4",
                      border: `1px solid ${addedIds.has(item.id) ? "#10b981" : "#bbf7d0"}`,
                      color: addedIds.has(item.id) ? "#ffffff" : "#059669",
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
      <div className="mt-4 text-center">
        <Link href="/consumer/marketplace"
          className="inline-flex items-center gap-2 text-emerald-600 text-sm hover:text-emerald-700 transition-colors font-semibold no-underline">
          <Sparkles className="w-4 h-4" />
          {t("continueShopping")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}