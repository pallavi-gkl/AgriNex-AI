"use client";

/**
 * @fileoverview Premium AI Marketplace Homepage — Phase 9
 * Full redesign with Hero, AI Search, Voice Search, Image Search,
 * Featured Sections, AI Recommendations, Flash Deals, Market Insights,
 * Testimonials, and real-time farmer inventory sync.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search, ShoppingCart, Star, MapPin, Leaf, Filter, X, Plus, Minus,
  Loader2, CheckCircle, AlertCircle, Truck, Package, Sparkles,
  ChevronDown, Mic, Camera, Heart, TrendingUp, Zap, Shield,
  Timer, ArrowRight, ChevronRight, Eye, BarChart2, Globe,
  Sun, Wind, Droplets, Award, Clock, RefreshCw, Volume2, VolumeX,
} from "lucide-react";
import { useMarketplaceProducts } from "@/hooks/useProducts";
import { useCreateOrder } from "@/hooks/useOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase";
import { DEMO_CROPS, DEMO_MARKET_PRICES } from "@/lib/demoData";
import OrderDialog from "@/components/consumer/marketplace/OrderDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartItem {
  productId: string;
  title: string;
  pricePerUnit: number;
  unitType: string;
  quantity: number;
  farmerId: string;
  farmerName: string;
  imageUrl?: string | null;
  maxQty: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GRADE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  "A+": { color: "#10b981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.35)" },
  "A":  { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },
  "B":  { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)" },
  "C":  { color: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.3)" },
  "D":  { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
};

const CATEGORIES = [
  { label: "All",          icon: "🌾",  keywords: [] },
  { label: "Vegetables",   icon: "🥦",  keywords: ["vegetable", "vegetables"] },
  { label: "Fruits",       icon: "🍎",  keywords: ["fruit", "fruits"] },
  { label: "Grains",       icon: "🌾",  keywords: ["grain", "grains", "cereal", "cereals", "rice", "wheat"] },
  { label: "Pulses",       icon: "🫘",  keywords: ["pulse", "pulses", "dal", "lentil", "lentils", "legume"] },
  { label: "Spices",       icon: "🌶️", keywords: ["spice", "spices", "herb", "herbs"] },
  { label: "Leafy Greens", icon: "🥬",  keywords: ["leafy", "greens", "spinach", "palak"] },
  { label: "Dairy",        icon: "🥛",  keywords: ["dairy", "milk", "cheese", "paneer"] },
  { label: "Others",       icon: "📦",  keywords: ["other", "others", "misc"] },
];

/** Returns true if a product's category matches the selected filter label */
function matchesCategory(productCategory: string, filterLabel: string): boolean {
  if (filterLabel === "All") return true;
  const cat = CATEGORIES.find((c) => c.label === filterLabel);
  if (!cat) return false;
  const lower = (productCategory ?? "").toLowerCase();
  // Exact match first
  if (lower === filterLabel.toLowerCase()) return true;
  // Check if any keyword appears in the product category
  return cat.keywords.some((kw) => lower.includes(kw));
}

const AI_SUGGESTIONS = [
  "Organic tomatoes under ₹50 near me",
  "Fresh alphonso mangoes from Maharashtra",
  "High protein pulses for diet",
  "Best quality basmati rice",
  "Leafy greens harvested today",
  "Organic turmeric A+ grade",
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "New Delhi",
    rating: 5,
    text: "The freshest produce I've ever received! Ordered basmati rice directly from the farmer — arrived within 24 hours. The AI quality report gave me complete confidence.",
    avatar: "P",
    product: "Premium Basmati Rice",
    savings: "₹2,400 saved vs supermarket",
  },
  {
    name: "Rahul Mehta",
    city: "Mumbai",
    rating: 5,
    text: "Alphonso mangoes were absolutely divine. The traceability feature showed me exactly which farm they came from. This is the future of food shopping!",
    avatar: "R",
    product: "Alphonso Mangoes",
    savings: "₹1,800 saved",
  },
  {
    name: "Anita Reddy",
    city: "Hyderabad",
    rating: 5,
    text: "AgriNex AI's shopping assistant helped me pick the right turmeric variety for my cooking. The nutrition info and recipe suggestions are incredible features!",
    avatar: "A",
    product: "Organic Turmeric",
    savings: "₹960 saved",
  },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 anim-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded anim-shimmer" />
        <div className="h-3 w-1/2 rounded anim-shimmer" />
        <div className="flex justify-between items-center mt-3">
          <div className="h-6 w-20 rounded anim-shimmer" />
          <div className="h-8 w-24 rounded-xl anim-shimmer" />
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  onAddToCart,
  isInWishlist,
  onToggleWishlist,
  onOrderNow,
}: {
  product: any;
  onAddToCart: (p: any) => void;
  isInWishlist: boolean;
  onToggleWishlist: (p: any) => void;
  onOrderNow: (p: any) => void;
}) {
  const grade = product.qualityGrade ?? product.quality_grade ?? "N/A";
  const gradeCfg = GRADE_CONFIG[grade] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" };
  const isOrganic = product.isOrganic ?? product.is_organic ?? false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group"
    >
      {/* Image */}
      <div className="h-44 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.05))",
      }}>
        {product.imageUrl || product.image_url ? (
          <img
            src={product.imageUrl || product.image_url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Leaf className="w-10 h-10 text-emerald-400/40" />
            <span className="text-slate-600 text-xs">{product.category}</span>
          </div>
        )}

        {/* Grade badge */}
        {grade !== "N/A" && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm"
            style={{ color: gradeCfg.color, background: gradeCfg.bg, border: `1px solid ${gradeCfg.border}` }}>
            ⭐ {grade}
          </div>
        )}

        {/* Organic badge */}
        {isOrganic && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm"
            style={{ color: "#4ade80", background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}>
            🌿 Organic
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110"
          style={{
            background: isInWishlist ? "rgba(239,68,68,0.2)" : "rgba(0,0,0,0.4)",
            border: `1px solid ${isInWishlist ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
          }}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? "text-red-400 fill-red-400" : "text-white/70"}`} />
        </button>

        {/* View detail overlay */}
        <Link href={`/consumer/marketplace/${product.id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "rgba(16,185,129,0.3)", border: "1px solid rgba(16,185,129,0.5)" }}>
            <Eye className="w-4 h-4" />
            View Details
          </div>
        </Link>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/consumer/marketplace/${product.id}`}>
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 hover:text-emerald-400 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Farmer info */}
        {(product.farmer || product.farmerName) && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              {(product.farmer?.fullName || product.farmerName || "F").charAt(0)}
            </div>
            <span className="text-slate-400 text-xs truncate">
              {product.farmer?.fullName || product.farmerName || "Verified Farmer"}
            </span>
            {(product.farmer?.isVerified || product.farmer?.is_verified) && (
              <span className="text-emerald-400 text-[10px]">✓</span>
            )}
          </div>
        )}

        <span className="text-slate-500 text-xs">{product.category}</span>

        {/* Stock */}
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Package className="w-3 h-3" />
          {product.quantityAvailable ?? product.quantity_available} {product.unitType ?? product.unit_type} available
        </div>

        <div className="flex-1" />

        {/* Price + Buttons */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-emerald-400 font-bold text-lg leading-none">
              ₹{product.pricePerUnit ?? product.price_per_unit}
            </span>
            <span className="text-slate-500 text-xs ml-1">/ {product.unitType ?? product.unit_type}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            id={`add-to-cart-${product.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.1))",
              border: "1px solid rgba(16,185,129,0.35)",
              color: "#34d399",
              boxShadow: "0 0 12px rgba(16,185,129,0.1)",
            }}
          >
            <ShoppingCart className="w-3 h-3" />
            Add
          </button>
        </div>

        {/* Order Now button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOrderNow(product);
          }}
          id={`order-now-${product.id}`}
          className="w-full mt-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))",
            border: "1px solid rgba(245,158,11,0.4)",
            color: "#fbbf24",
          }}
        >
          <Package className="w-3 h-3" />
          Order Now
        </button>
      </div>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, accent = "#10b981" }: {
  icon: React.ReactNode; title: string; subtitle?: string; accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}>
        {icon}
      </div>
      <div>
        <h2 className="text-white font-bold text-lg leading-none">{title}</h2>
        {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSidebar({
  cart, onUpdateQty, onRemove, onClose, onCheckout, isCheckingOut, checkoutSuccess, checkoutError,
}: {
  cart: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
  checkoutSuccess: boolean;
  checkoutError: string | null;
}) {
  const total = cart.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);
  const savings = total * 0.12;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-96 z-50 flex flex-col"
      style={{ background: "rgba(5,8,20,0.95)", backdropFilter: "blur(24px)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-emerald-400" />
          <h2 className="text-white font-bold text-sm">Shopping Cart</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(16,185,129,0.2)", color: "#34d399" }}>
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {cart.map((item) => (
            <motion.div key={item.productId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }}
              className="glass-panel rounded-xl p-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "rgba(16,185,129,0.1)" }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Leaf className="w-5 h-5 text-emerald-400" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold leading-tight truncate">{item.title}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{item.farmerName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                      <Minus className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-white text-xs font-mono w-8 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.productId, Math.min(item.quantity + 1, item.maxQty))}
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-slate-500 text-[11px] ml-1">{item.unitType}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-bold text-sm">₹{(item.pricePerUnit * item.quantity).toFixed(0)}</p>
                  <button onClick={() => onRemove(item.productId)} className="text-red-400/60 hover:text-red-400 text-[10px] mt-1 transition-colors">Remove</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">Your cart is empty</p>
            <p className="text-slate-600 text-xs mt-1">Add fresh products from farmers</p>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Savings badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <span className="text-slate-400">You save vs market</span>
            <span className="text-emerald-400 font-bold">₹{savings.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total</span>
            <span className="text-white font-bold text-lg">₹{total.toFixed(0)}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-sky-400"
            style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)" }}>
            <Truck className="w-3.5 h-3.5 shrink-0" />
            Free delivery on orders above ₹500
          </div>

          <AnimatePresence>
            {checkoutError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {checkoutError}
              </motion.div>
            )}
            {checkoutSuccess && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-emerald-400"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Order placed! Checking your orders...
              </motion.div>
            )}
          </AnimatePresence>

          <button id="checkout-btn" onClick={onCheckout} disabled={isCheckingOut || checkoutSuccess}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 24px rgba(16,185,129,0.3)" }}>
            {isCheckingOut ? (<><Loader2 className="w-4 h-4 animate-spin" />Processing...</>) :
              checkoutSuccess ? (<><CheckCircle className="w-4 h-4" />Order Placed!</>) :
              (<>Place Order · ₹{total.toFixed(0)}<ArrowRight className="w-4 h-4" /></>)}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Flash Deal Card ───────────────────────────────────────────────────────────
function FlashDealCard({
  product,
  onAddToCart,
  onOrderNow,
}: {
  product: any;
  onAddToCart: (p: any) => void;
  onOrderNow: (p: any) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(3600);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 3600)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(timeLeft / 3600), m = Math.floor((timeLeft % 3600) / 60), s = timeLeft % 60;

  const [discount, setDiscount] = useState(15);
  useEffect(() => {
    setDiscount(Math.floor(8 + Math.random() * 15));
  }, []);

  const discountedPrice = Math.floor((product.pricePerUnit ?? product.price_per_unit) * (1 - discount / 100));

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex-shrink-0 w-64">
      <div className="relative h-36 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.1))" }}>
        {(product.imageUrl || product.image_url) ? (
          <img src={product.imageUrl || product.image_url} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Leaf className="w-10 h-10 text-amber-400/30" /></div>
        )}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold"
          style={{ background: "rgba(239,68,68,0.9)", color: "#fff" }}>
          ⚡ {discount}% OFF
        </div>
      </div>
      <div className="p-3">
        <p className="text-white text-xs font-semibold truncate">{product.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-emerald-400 font-bold">₹{discountedPrice}</span>
          <span className="text-slate-500 text-xs line-through">₹{product.pricePerUnit ?? product.price_per_unit}</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-400">
          <Timer className="w-3 h-3" />
          Ends in {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOrderNow({
              ...product,
              pricePerUnit: discountedPrice,
              price_per_unit: discountedPrice,
            });
          }}
          className="w-full mt-2 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1 transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
          <Zap className="w-3 h-3" />Grab Deal
        </button>
      </div>
    </div>
  );
}

// ─── Market Insight Card ──────────────────────────────────────────────────────
function MarketInsightCard({ item }: { item: any }) {
  const isUp = item.trend === "up";
  return (
    <div className="glass-panel rounded-xl p-3 flex items-center gap-3 flex-shrink-0 w-52">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: isUp ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.1)" }}>
        <TrendingUp className={`w-5 h-5 ${isUp ? "text-emerald-400" : "text-red-400 rotate-180"}`} />
      </div>
      <div className="min-w-0">
        <p className="text-white text-xs font-semibold truncate">{item.crop}</p>
        <p className="text-slate-500 text-[10px] truncate">{item.mandi}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-white text-sm font-bold">₹{item.price}</span>
          <span className={`text-[10px] font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {isUp ? "▲" : "▼"} {Math.abs(item.change)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Marketplace Page ────────────────────────────────────────────────────
export default function MarketplacePage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filterNearby, setFilterNearby] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [imageSearching, setImageSearching] = useState(false);
  const [imageSearchResult, setImageSearchResult] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [minGrade, setMinGrade] = useState("All");
  const [activeSection, setActiveSection] = useState("all");
  const [orderProduct, setOrderProduct] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { cart, cartCount, addToCart, updateQty, removeFromCart, clearCart } = useCart();
  const { t } = useTranslation();

  const getCategoryLabel = (label: string) => {
    const mapping: Record<string, string> = {
      "All": "all",
      "Vegetables": "vegetables",
      "Fruits": "fruits",
      "Grains": "grains",
      "Pulses": "pulses",
      "Spices": "spices",
      "Leafy Greens": "leafyGreens",
      "Dairy": "dairy",
      "Others": "others"
    };
    const key = mapping[label];
    return key ? t(key) : label;
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Geolocation
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const filters = {
    search,
    category: category !== "All" ? category : undefined,
    ...(filterNearby && userLocation ? { lat: userLocation.lat, lng: userLocation.lng, maxDistance: 50 } : {}),
  };

  const { data: liveProducts = [], isLoading, isError } = useMarketplaceProducts(filters);
  const { mutate: createOrder, isPending: isCheckingOut } = useCreateOrder();

  // Use demo data as fallback + enrich with demo extras
  const demoAsProducts = DEMO_CROPS.filter((c) => c.is_active && c.quantity_available > 0).map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    pricePerUnit: c.price_per_unit,
    unitType: c.unit_type,
    quantityAvailable: c.quantity_available,
    imageUrl: c.image_url,
    qualityGrade: c.quality_grade,
    isOrganic: c.is_organic,
    traceabilityCode: c.traceability_code,
    farmer: { id: `farmer-${c.id}`, fullName: getDemoFarmerName(c.id), isVerified: true },
    rating: c.rating,
    reviewsCount: c.reviews_count,
    harvestDate: c.harvest_date,
    location: c.location,
    aiRecommendedPrice: c.ai_recommended_price,
    marketPrice: c.market_price,
  }));

  function getDemoFarmerName(cropId: string): string {
    const names: Record<string, string> = {
      "crop-001": "Rajesh Kumar", "crop-002": "Suresh Patil", "crop-003": "Muthu Raman",
      "crop-004": "Pradeep Joshi", "crop-005": "Abdul Rashid",
    };
    return names[cropId] || "Verified Farmer";
  }

  const products = liveProducts.length > 0 ? liveProducts : demoAsProducts;

  // Client-side filter for category, organic, price, and grade
  const filteredProducts = products.filter((p: any) => {
    // Category filter (applied on demo data; API already filters live data)
    if (category !== "All" && liveProducts.length === 0) {
      if (!matchesCategory(p.category ?? "", category)) return false;
    }
    if (onlyOrganic && !(p.isOrganic || p.is_organic)) return false;
    const price = p.pricePerUnit ?? p.price_per_unit ?? 0;
    if (price < priceRange[0] || price > priceRange[1]) return false;
    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    if (sortBy === "price_asc") return (a.pricePerUnit ?? a.price_per_unit) - (b.pricePerUnit ?? b.price_per_unit);
    if (sortBy === "price_desc") return (b.pricePerUnit ?? b.price_per_unit) - (a.pricePerUnit ?? a.price_per_unit);
    if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortBy === "newest") return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    return 0;
  });

  // ── Cart management ──────────────────────────────────────────────────────
  const handleAddToCart = useCallback((product: any) => {
    addToCart({
      productId: product.id,
      title: product.title,
      pricePerUnit: product.pricePerUnit ?? product.price_per_unit,
      unitType: product.unitType ?? product.unit_type,
      farmerId: product.farmer?.id ?? "",
      farmerName: product.farmer?.fullName ?? product.farmerName ?? "Verified Farmer",
      imageUrl: product.imageUrl ?? product.image_url,
      maxQty: product.quantityAvailable ?? product.quantity_available ?? 999,
      category: product.category,
    });
    setCartOpen(true);
  }, [addToCart]);

  const handleUpdateQty = useCallback((productId: string, qty: number) => {
    updateQty(productId, qty);
  }, [updateQty]);

  const handleRemove = useCallback((productId: string) => {
    removeFromCart(productId);
  }, [removeFromCart]);

  const handleToggleWishlist = useCallback((product: any) => {
    const id = product.id;
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id,
        title: product.title,
        pricePerUnit: product.pricePerUnit ?? product.price_per_unit,
        unitType: product.unitType ?? product.unit_type,
        imageUrl: product.imageUrl ?? product.image_url,
        qualityGrade: product.qualityGrade ?? product.quality_grade,
        farmerName: product.farmer?.fullName ?? product.farmerName,
        farmerId: product.farmer?.id ?? product.farmerId,
        category: product.category,
      });
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // ── Voice Search ──────────────────────────────────────────────────────────
  const handleVoiceSearch = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search not supported in this browser. Please try Chrome.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchInput(transcript);
      setSearch(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  }, []);

  // ── Image Search ──────────────────────────────────────────────────────────
  const handleImageSearch = useCallback(async (file: File) => {
    setImageSearching(true);
    setImageSearchResult(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/ai/image-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await res.json();
        if (data.searchQuery) {
          setSearchInput(data.searchQuery);
          setSearch(data.searchQuery);
          setImageSearchResult(`🔍 Found: ${data.cropName}${data.localName ? ` (${data.localName})` : ""} — ${data.description}`);
        } else if (data.error) {
          setImageSearchResult("❌ Could not identify a crop in this image. Please try another photo.");
        }
        setImageSearching(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setImageSearchResult("❌ Image search failed. Please try again.");
      setImageSearching(false);
    }
  }, []);

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    setCheckoutError(null);
    if (cart.length === 0) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCheckoutError("Please sign in to place an order."); return; }
      const farmerId = cart[0].farmerId;
      const totalAmount = cart.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);
      const { data: profile } = await supabase.from("profiles").select("address, location_lat, location_lng").eq("id", user.id).maybeSingle();
      createOrder({
        farmerId,
        totalAmount,
        deliveryAddress: (profile as any)?.address ?? "Delhi, India",
        deliveryLat: (profile as any)?.location_lat ?? undefined,
        deliveryLng: (profile as any)?.location_lng ?? undefined,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity, priceAtPurchase: item.pricePerUnit })),
      }, {
        onSuccess: () => {
          setCheckoutSuccess(true);
          clearCart();
          setTimeout(() => { setCartOpen(false); setCheckoutSuccess(false); }, 2500);
        },
        onError: (err: any) => setCheckoutError(err.message ?? "Checkout failed. Please try again."),
      });
    } catch (err: any) {
      setCheckoutError(err.message ?? "Checkout failed.");
    }
  };

  // Section slices
  const featured = sortedProducts.slice(0, 4);
  const organic = sortedProducts.filter((p: any) => p.isOrganic || p.is_organic).slice(0, 4);
  const trending = [...sortedProducts].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
  const fresh = [...sortedProducts].sort((a: any, b: any) =>
    new Date(b.harvestDate ?? b.harvest_date ?? 0).getTime() - new Date(a.harvestDate ?? a.harvest_date ?? 0).getTime()
  ).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-6 pt-8 pb-12"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(14,165,233,0.04) 50%, rgba(245,158,11,0.06) 100%)" }}>

        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)" }} />

        {/* Header row */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">Live · Synced from Farmer Inventory</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              <span className="gradient-text-green">AgriNex</span> Marketplace
            </h1>
            <p className="text-slate-400 text-sm mt-1">Buy directly from {liveProducts.length > 0 ? "verified" : "demo"} farmers — no middlemen</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/consumer/wishlist"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">{t("wishlist")}</span>
            </Link>
            <Link href="/consumer/compare"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#c084fc" }}>
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t("compare")}</span>
            </Link>
            <button id="open-cart-btn" onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-105"
              style={{
                background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399",
                boxShadow: cartCount > 0 ? "0 0 16px rgba(16,185,129,0.25)" : "none",
              }}>
              <ShoppingCart className="w-4 h-4" />
              {t("shoppingCart")}
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "#10b981" }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── AI SEARCH BAR ──────────────────────────────────────────────────── */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={searchRef}
              id="marketplace-search"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder='Try: "Organic tomatoes under ₹50 near me" or "Fresh mangoes Maharashtra"'
              className="w-full pl-12 pr-40 py-4 rounded-2xl text-white text-sm"
              style={{
                background: "rgba(13,20,38,0.8)", backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            />
            {/* Action buttons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchInput && (
                <button onClick={() => { setSearchInput(""); setSearch(""); }}
                  className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Voice search */}
              <button id="voice-search-btn" onClick={handleVoiceSearch}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${isListening ? "animate-pulse" : ""}`}
                style={{
                  background: isListening ? "rgba(239,68,68,0.3)" : "rgba(139,92,246,0.2)",
                  border: `1px solid ${isListening ? "rgba(239,68,68,0.5)" : "rgba(139,92,246,0.3)"}`,
                }}
                title="Voice Search">
                <Mic className={`w-4 h-4 ${isListening ? "text-red-400" : "text-purple-400"}`} />
              </button>
              {/* Image search */}
              <button id="image-search-btn" onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)" }}
                title="Image Search">
                {imageSearching ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin" /> : <Camera className="w-4 h-4 text-amber-400" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleImageSearch(e.target.files[0]); }} />
              {/* Search button */}
              <button onClick={() => setSearch(searchInput)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                {t("search")}
              </button>
            </div>

            {/* AI Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && searchInput === "" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-30"
                  style={{ background: "rgba(5,8,20,0.97)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                  <div className="p-3">
                    <p className="text-slate-500 text-xs px-2 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      AI Suggested Searches
                    </p>
                    {AI_SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => { setSearchInput(s); setSearch(s); setShowSuggestions(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                        <Search className="w-3 h-3 text-emerald-400 shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Image search result */}
          {imageSearchResult && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-4 py-2 rounded-xl text-sm text-amber-300"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              {imageSearchResult}
            </motion.div>
          )}

          {/* Voice listening indicator */}
          {isListening && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-3 px-4 py-2 rounded-xl text-sm text-purple-300 flex items-center gap-2"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Listening... speak your search
            </motion.div>
          )}
        </div>

        {/* ── Category Chips ──────────────────────────────────────────────────── */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 hide-scrollbar relative z-10 max-w-3xl mx-auto">
          {CATEGORIES.map((cat) => (
            <button key={cat.label} onClick={() => setCategory(cat.label)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 shrink-0"
              style={{
                background: category === cat.label ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${category === cat.label ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: category === cat.label ? "#34d399" : "#64748b",
              }}>
              <span>{cat.icon}</span>
              {getCategoryLabel(cat.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-12">

        {/* ── Advanced Filters ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 items-center">
          <button id="toggle-filters-btn" onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              background: showFilters ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showFilters ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.08)"}`,
              color: showFilters ? "#34d399" : "#64748b",
            }}>
            <Filter className="w-3.5 h-3.5" />
            {showFilters ? t("close") : t("advancedFilters")}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm text-slate-300 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <option value="relevance">{t("sortBy")}: {t("relevance")}</option>
            <option value="price_asc">{t("priceLowHigh")}</option>
            <option value="price_desc">{t("priceHighLow")}</option>
            <option value="rating">{t("bestRatedProducts")}</option>
            <option value="newest">{t("newest")}</option>
          </select>

          {/* Organic toggle */}
          <button onClick={() => setOnlyOrganic(!onlyOrganic)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              background: onlyOrganic ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${onlyOrganic ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: onlyOrganic ? "#4ade80" : "#64748b",
            }}>
            🌿 {t("organicOnly")}
          </button>

          {/* Nearby filter */}
          {userLocation && (
            <button id="nearby-filter-btn" onClick={() => setFilterNearby(!filterNearby)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all"
              style={{
                background: filterNearby ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${filterNearby ? "rgba(14,165,233,0.35)" : "rgba(255,255,255,0.08)"}`,
                color: filterNearby ? "#38bdf8" : "#64748b",
              }}>
              <MapPin className="w-3.5 h-3.5" />
              Nearby (50km)
            </button>
          )}

          <span className="text-slate-600 text-xs ml-auto">
            {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
            {(search || category !== "All") && (
              <button onClick={() => { setSearch(""); setSearchInput(""); setCategory("All"); setOnlyOrganic(false); }}
                className="ml-2 text-emerald-400/70 hover:text-emerald-400 transition-colors">
                Clear all
              </button>
            )}
          </span>
        </div>

        {/* Advanced filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="glass-panel rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-slate-400 text-xs mb-2 block">Price Range</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    className="glass-input py-1.5 text-sm w-full" placeholder="Min ₹" />
                  <span className="text-slate-500">—</span>
                  <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    className="glass-input py-1.5 text-sm w-full" placeholder="Max ₹" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-2 block">Minimum AI Grade</label>
                <select value={minGrade} onChange={(e) => setMinGrade(e.target.value)}
                  className="glass-input py-1.5 text-sm cursor-pointer">
                  <option value="All">All Grades</option>
                  <option value="A+">A+ Only</option>
                  <option value="A">A or Better</option>
                  <option value="B">B or Better</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={() => { setPriceRange([0, 10000]); setMinGrade("All"); setOnlyOrganic(false); setSortBy("relevance"); }}
                  className="w-full py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FLASH DEALS ──────────────────────────────────────────────────────── */}
        {sortedProducts.length > 0 && (
          <section>
            <SectionHeader
              icon={<Zap className="w-5 h-5" style={{ color: "#ef4444" }} />}
              title="⚡ Flash Deals"
              subtitle="Limited time offers — hurry before they expire!"
              accent="#ef4444"
            />
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {sortedProducts.slice(0, 6).map((p: any) => (
                <FlashDealCard key={p.id} product={p} onAddToCart={handleAddToCart} onOrderNow={setOrderProduct} />
              ))}
            </div>
          </section>
        )}

        {/* ── TODAY'S FRESH HARVEST ─────────────────────────────────────────────── */}
        {fresh.length > 0 && !search && category === "All" && (
          <section>
            <SectionHeader
              icon={<Sun className="w-5 h-5" style={{ color: "#f59e0b" }} />}
              title="🌅 Today's Fresh Harvest"
              subtitle="Just picked from the farm — maximum freshness guaranteed"
              accent="#f59e0b"
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {fresh.map((p: any) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist(p.id)} onToggleWishlist={handleToggleWishlist}
                  onOrderNow={setOrderProduct} />
              ))}
            </div>
          </section>
        )}

        {/* ── ORGANIC COLLECTION ────────────────────────────────────────────────── */}
        {organic.length > 0 && !search && category === "All" && (
          <section>
            <SectionHeader
              icon={<Leaf className="w-5 h-5" style={{ color: "#4ade80" }} />}
              title="🌿 Organic Collection"
              subtitle="Certified organic produce — zero pesticides, pure goodness"
              accent="#4ade80"
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {organic.map((p: any) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist(p.id)} onToggleWishlist={handleToggleWishlist}
                  onOrderNow={setOrderProduct} />
              ))}
            </div>
          </section>
        )}

        {/* ── BEST RATED ───────────────────────────────────────────────────────── */}
        {trending.length > 0 && !search && category === "All" && (
          <section>
            <SectionHeader
              icon={<Star className="w-5 h-5" style={{ color: "#fbbf24" }} />}
              title="⭐ Best Rated Products"
              subtitle="Top-rated by verified customers — quality you can trust"
              accent="#fbbf24"
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trending.map((p: any) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist(p.id)} onToggleWishlist={handleToggleWishlist}
                  onOrderNow={setOrderProduct} />
              ))}
            </div>
          </section>
        )}

        {/* ── LIVE MARKET INSIGHTS ─────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<TrendingUp className="w-5 h-5" style={{ color: "#38bdf8" }} />}
            title="📊 Live Market Insights"
            subtitle="Real-time APMC mandi prices — updated every 15 minutes"
            accent="#38bdf8"
          />
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {DEMO_MARKET_PRICES.map((item) => (
              <MarketInsightCard key={item.crop} item={item} />
            ))}
          </div>
        </section>

        {/* ── ALL PRODUCTS / SEARCH RESULTS ────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <SectionHeader
              icon={<Package className="w-5 h-5" style={{ color: "#10b981" }} />}
              title={search ? `Results for "${search}"` : "All Products"}
              subtitle={search ? `${sortedProducts.length} products found` : "Complete farmer inventory — real-time sync"}
              accent="#10b981"
            />
            {!isLoading && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {liveProducts.length > 0 ? "Live from farmers" : "Demo mode"}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Sparkles className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm">No products found</p>
              <p className="text-slate-600 text-xs mt-1">
                {search ? `No results for "${search}"` : "No products in this category yet."}
              </p>
              <button onClick={() => { setSearch(""); setSearchInput(""); setCategory("All"); }}
                className="mt-4 px-4 py-2 rounded-xl text-sm text-emerald-400"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                Clear & Browse All
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {sortedProducts.map((p: any) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart}
                    isInWishlist={isInWishlist(p.id)} onToggleWishlist={handleToggleWishlist}
                    onOrderNow={setOrderProduct} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Award className="w-5 h-5" style={{ color: "#8b5cf6" }} />}
            title="💬 Customer Stories"
            subtitle="Real experiences from verified buyers across India"
            accent="#8b5cf6"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, hsl(${i * 80 + 160},60%,45%), hsl(${i * 80 + 180},70%,35%))` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.city}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3 h-3" style={{ color: "#fbbf24" }} fill="#fbbf24" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{t.text}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Bought: {t.product}</span>
                  <span className="text-emerald-400 text-xs font-semibold">{t.savings}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── TRUST BADGES ─────────────────────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: "Verified Farmers", desc: "KYC-approved, trust-scored" },
              { icon: <Truck className="w-6 h-6 text-sky-400" />, title: "Fast Delivery", desc: "24–48 hour farm-to-door" },
              { icon: <Leaf className="w-6 h-6 text-green-400" />, title: "100% Fresh", desc: "AI quality guaranteed" },
              { icon: <Globe className="w-6 h-6 text-purple-400" />, title: "Full Traceability", desc: "Track crop from farm to table" },
            ].map((b, i) => (
              <div key={i} className="glass-panel rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {b.icon}
                </div>
                <p className="text-white text-sm font-semibold">{b.title}</p>
                <p className="text-slate-500 text-xs">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>{/* end main content */}

      {/* ── Cart Sidebar ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setCartOpen(false)} />
            <CartSidebar cart={cart} onUpdateQty={handleUpdateQty} onRemove={handleRemove}
              onClose={() => setCartOpen(false)} onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut} checkoutSuccess={checkoutSuccess} checkoutError={checkoutError} />
          </>
        )}
      </AnimatePresence>

      {/* ── Order Dialog ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {orderProduct && (
          <OrderDialog
            product={orderProduct}
            onClose={() => setOrderProduct(null)}
            onSuccess={() => setOrderProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
