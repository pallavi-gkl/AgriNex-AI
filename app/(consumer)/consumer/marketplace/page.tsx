"use client";

/**
 * @fileoverview Premium AI Marketplace Homepage — Phase 12
 * Full visual redesign with light-background premium UI.
 * ALL business logic, hooks, handlers, state, and routing preserved 100%.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search, ShoppingCart, Star, MapPin, Leaf, Filter, X, Plus, Minus,
  Loader2, CheckCircle, AlertCircle, Truck, Package, Sparkles,
  ChevronDown, Camera, Heart, TrendingUp, Zap, Shield,
  Timer, ArrowRight, ChevronRight, Eye, BarChart2, Globe,
  Sun, Wind, Droplets, Award, Clock, RefreshCw, ArrowUp, ArrowDown,
} from "lucide-react";
import { useMarketplaceProducts } from "@/hooks/useProducts";
import { useCreateOrder } from "@/hooks/useOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase";
import { DEMO_CROPS, DEMO_MARKET_PRICES } from "@/lib/demoData";

// ─── Types ─────────────────────────────────────────────────────────────────────
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

// ─── Constants ─────────────────────────────────────────────────────────────────
const GRADE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  "A+": { color: "#059669", bg: "#ecfdf5",   border: "#a7f3d0" },
  "A":  { color: "#16a34a", bg: "#f0fdf4",   border: "#bbf7d0" },
  "B":  { color: "#d97706", bg: "#fffbeb",   border: "#fde68a" },
  "C":  { color: "#ea580c", bg: "#fff7ed",   border: "#fed7aa" },
  "D":  { color: "#dc2626", bg: "#fef2f2",   border: "#fecaca" },
};

const CATEGORIES = [
  { label: "All",              icon: "🌾",  keywords: [] },
  { label: "Vegetables",       icon: "🥦",  keywords: ["vegetable", "vegetables"] },
  { label: "Fruits",           icon: "🍎",  keywords: ["fruit", "fruits"] },
  { label: "Grains",           icon: "🌾",  keywords: ["grain", "grains", "cereal", "cereals", "rice", "wheat"] },
  { label: "Pulses",           icon: "🫘",  keywords: ["pulse", "pulses", "dal", "lentil", "lentils", "legume"] },
  { label: "Spices",           icon: "🌶️", keywords: ["spice", "spices", "herb", "herbs"] },
  { label: "Leafy Vegetables", icon: "🥬",  keywords: ["leafy", "greens", "spinach", "palak"] },
  { label: "Dairy",            icon: "🥛",  keywords: ["dairy", "milk", "cheese", "paneer"] },
  { label: "Others",           icon: "📦",  keywords: ["other", "others", "misc"] },
];

/** Returns true if a product's category matches the selected filter label */
function matchesCategory(product: any, filterLabel: string): boolean {
  if (filterLabel === "All") return true;
  const title    = (product.title    ?? "").toLowerCase();
  const category = (product.category ?? "").toLowerCase();
  if (title.includes("pomegranate") || category.includes("pomegranate")) return filterLabel === "Fruits";
  if (filterLabel === "Spices") {
    if (title.includes("mango") || category.includes("fruit") || category.includes("vegetable") || category.includes("leafy")) return false;
  }
  if (filterLabel === "Vegetables") {
    if (category.includes("leafy")) return false;
  }
  const cat = CATEGORIES.find((c) => c.label === filterLabel);
  if (!cat) return false;
  const lower = category.toLowerCase();
  if (lower === filterLabel.toLowerCase()) return true;
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
    name: "Priya Sharma", city: "New Delhi",   rating: 5, avatar: "P",
    text: "The freshest produce I've ever received! Ordered basmati rice directly from the farmer — arrived within 24 hours. The AI quality report gave me complete confidence.",
    product: "Premium Basmati Rice", savings: "₹2,400 saved vs supermarket",
  },
  {
    name: "Rahul Mehta",  city: "Mumbai",      rating: 5, avatar: "R",
    text: "Alphonso mangoes were absolutely divine. The traceability feature showed me exactly which farm they came from. This is the future of food shopping!",
    product: "Alphonso Mangoes", savings: "₹1,800 saved",
  },
  {
    name: "Anita Reddy",  city: "Hyderabad",   rating: 5, avatar: "A",
    text: "AgriNex AI's shopping assistant helped me pick the right turmeric variety for my cooking. The nutrition info and recipe suggestions are incredible features!",
    product: "Organic Turmeric", savings: "₹960 saved",
  },
];

/* ─── Shared premium inline styles ──────────────────────────────────────────── */
const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  overflow: "hidden",
};

/* ─── Product Skeleton ───────────────────────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div style={{ ...card, height: "360px" }}>
      <div style={{ height: "160px", background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {[80, 55, 40, 70].map((w, i) => (
          <div key={i} style={{ height: "12px", width: `${w}%`, borderRadius: "6px", background: "#f1f5f9" }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Product Card ───────────────────────────────────────────────────────────── */
function ProductCard({
  product, onAddToCart, isInWishlist, onToggleWishlist, onOrderNow,
}: {
  product: any;
  onAddToCart: (p: any) => void;
  isInWishlist: boolean;
  onToggleWishlist: (p: any) => void;
  onOrderNow: (p: any) => void;
}) {
  const grade    = product.qualityGrade ?? product.quality_grade ?? "N/A";
  const gradeCfg = GRADE_CONFIG[grade] ?? { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
  const isOrganic = product.isOrganic ?? product.is_organic ?? false;
  const rating   = product.rating ?? 0;
  const farmerName = product.farmer?.fullName ?? product.farmerName ?? "Verified Farmer";
  const isVerified = product.farmer?.isVerified ?? product.farmer?.is_verified ?? false;
  const price    = product.pricePerUnit ?? product.price_per_unit ?? 0;
  const unit     = product.unitType ?? product.unit_type ?? "kg";
  const stock    = product.quantityAvailable ?? product.quantity_available ?? 0;
  const category = (product.title?.toLowerCase().includes("pomegranate") || product.category?.toLowerCase().includes("pomegranate"))
    ? "Fruits" : product.category;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
      style={{ ...card, display: "flex", flexDirection: "column", position: "relative" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 32px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
      }}
    >
      {/* ── Image ── */}
      <div style={{ height: "160px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", flexShrink: 0 }}>
        {product.imageUrl || product.image_url ? (
          <img
            src={product.imageUrl || product.image_url}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .45s ease" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            onMouseEnter={(e) => ((e.target as HTMLImageElement).style.transform = "scale(1.06)")}
            onMouseLeave={(e) => ((e.target as HTMLImageElement).style.transform = "scale(1)")}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Leaf style={{ width: "32px", height: "32px", color: "#10b981", opacity: 0.4 }} />
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{category}</span>
          </div>
        )}

        {/* Organic badge */}
        {isOrganic && (
          <div style={{ position: "absolute", top: "8px", left: "8px", padding: "3px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: 800, background: "#059669", color: "#fff", display: "flex", alignItems: "center", gap: "3px" }}>
            🌿 Organic
          </div>
        )}

        {/* Grade badge */}
        {grade !== "N/A" && (
          <div style={{ position: "absolute", top: "8px", right: "8px", padding: "3px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: 800, background: gradeCfg.bg, color: gradeCfg.color, border: `1px solid ${gradeCfg.border}` }}>
            ⭐ {grade}
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          style={{ position: "absolute", bottom: "8px", right: "8px", width: "30px", height: "30px", borderRadius: "50%", border: `1px solid ${isInWishlist ? "#fca5a5" : "#e2e8f0"}`, background: isInWishlist ? "#fef2f2" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,.08)", transition: "all .15s" }}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart style={{ width: "13px", height: "13px", color: isInWishlist ? "#ef4444" : "#94a3b8", fill: isInWishlist ? "#ef4444" : "none" }} />
        </button>

        {/* View Details overlay */}
        <Link href={`/consumer/marketplace/${product.id}`}
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(3px)", opacity: 0, transition: "opacity .25s" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "rgba(255,255,255,.9)", color: "#059669", fontSize: "12px", fontWeight: 700 }}>
            <Eye style={{ width: "13px", height: "13px" }} /> View Details
          </div>
        </Link>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {/* Name */}
        <Link href={`/consumer/marketplace/${product.id}`} style={{ textDecoration: "none" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {product.title}
          </h3>
        </Link>

        {/* Farmer */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#fff", fontWeight: 800, flexShrink: 0 }}>
            {farmerName.charAt(0)}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{farmerName}</span>
          {isVerified && <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 700, flexShrink: 0 }}>✓</span>}
        </div>

        {/* Category + Stock */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8" }}>
          <span>{category}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Package style={{ width: "10px", height: "10px" }} />
            {stock} {unit}
          </span>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {Array.from({ length: 5 }).map((_, j) => (
              <Star key={j} style={{ width: "11px", height: "11px", color: j < Math.round(rating) ? "#f59e0b" : "#e2e8f0", fill: j < Math.round(rating) ? "#f59e0b" : "#e2e8f0" }} />
            ))}
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginLeft: "2px" }}>{rating.toFixed(1)}</span>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
          <div>
            <span style={{ fontSize: "20px", fontWeight: 900, color: "#10b981", lineHeight: 1 }}>₹{price}</span>
            <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "3px" }}>/ {unit}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            id={`add-to-cart-${product.id}`}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #a7f3d0", color: "#059669", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#10b981"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4"; (e.currentTarget as HTMLButtonElement).style.color = "#059669"; }}
          >
            <ShoppingCart style={{ width: "12px", height: "12px" }} /> Add
          </button>
        </div>

        {/* Order Now button */}
        <button
          onClick={(e) => { e.stopPropagation(); onOrderNow(product); }}
          id={`order-now-${product.id}`}
          style={{ width: "100%", padding: "9px 0", borderRadius: "12px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all .15s", boxShadow: "0 3px 10px rgba(16,185,129,.2)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(16,185,129,.3)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 3px 10px rgba(16,185,129,.2)"; }}
        >
          <Package style={{ width: "12px", height: "12px" }} /> Order Now
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────────────── */
function SectionHeader({ icon, title, subtitle, accent = "#10b981", action }: {
  icon: React.ReactNode; title: string; subtitle?: string; accent?: string; action?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}14`, border: `1px solid ${accent}30`, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.3px" }}>{title}</h2>
          {subtitle && <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ─── Cart Sidebar ───────────────────────────────────────────────────────────── */
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
  const total   = cart.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);
  const savings = total * 0.12;

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ position: "fixed", right: 0, top: 0, height: "100%", width: "380px", zIndex: 50, display: "flex", flexDirection: "column", background: "#ffffff", borderLeft: "1px solid #e2e8f0", boxShadow: "-8px 0 32px rgba(0,0,0,.08)" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShoppingCart style={{ width: "16px", height: "16px", color: "#10b981" }} />
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#1e293b" }}>Shopping Cart</h2>
          <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "#f0fdf4", color: "#10b981", border: "1px solid #a7f3d0" }}>
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
        </div>
        <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
          <X style={{ width: "18px", height: "18px" }} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence>
          {cart.map((item) => (
            <motion.div key={item.productId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }}
              style={{ border: "1px solid #e2e8f0", borderRadius: "14px", padding: "12px", background: "#fafafa" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "10px", overflow: "hidden", background: "#f0fdf4", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Leaf style={{ width: "18px", height: "18px", color: "#10b981" }} /></div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{item.farmerName}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                    <button onClick={() => onUpdateQty(item.productId, item.quantity - 1)} style={{ width: "24px", height: "24px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Minus style={{ width: "11px", height: "11px", color: "#374151" }} />
                    </button>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", width: "24px", textAlign: "center" }}>{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.productId, Math.min(item.quantity + 1, item.maxQty))} style={{ width: "24px", height: "24px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Plus style={{ width: "11px", height: "11px", color: "#374151" }} />
                    </button>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.unitType}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#10b981" }}>₹{(item.pricePerUnit * item.quantity).toFixed(0)}</p>
                  <button onClick={() => onRemove(item.productId)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>Remove</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {cart.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 16px", textAlign: "center" }}>
            <ShoppingCart style={{ width: "40px", height: "40px", color: "#cbd5e1", marginBottom: "12px" }} />
            <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>Your cart is empty</p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>Add fresh products from farmers</p>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #a7f3d0" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>You save vs market</span>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#10b981" }}>₹{savings.toFixed(0)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#1e293b" }}>₹{total.toFixed(0)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 12px", borderRadius: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: "12px", color: "#3b82f6" }}>
            <Truck style={{ width: "13px", height: "13px", flexShrink: 0 }} />
            Free delivery on orders above ₹500
          </div>
          <AnimatePresence>
            {checkoutError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 12px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", fontSize: "12px", color: "#ef4444" }}>
                <AlertCircle style={{ width: "13px", height: "13px", flexShrink: 0 }} /> {checkoutError}
              </motion.div>
            )}
            {checkoutSuccess && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 12px", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #a7f3d0", fontSize: "12px", color: "#10b981" }}>
                <CheckCircle style={{ width: "13px", height: "13px", flexShrink: 0 }} /> Order placed! Checking your orders...
              </motion.div>
            )}
          </AnimatePresence>
          <button id="checkout-btn" onClick={onCheckout} disabled={isCheckingOut || checkoutSuccess}
            style={{ width: "100%", padding: "13px 0", borderRadius: "14px", border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontSize: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 16px rgba(16,185,129,.28)", opacity: (isCheckingOut || checkoutSuccess) ? 0.65 : 1, transition: "all .2s" }}>
            {isCheckingOut ? <><Loader2 style={{ width: "15px", height: "15px", animation: "spin 1s linear infinite" }} />Processing...</>
              : checkoutSuccess ? <><CheckCircle style={{ width: "15px", height: "15px" }} />Order Placed!</>
              : <>Place Order · ₹{total.toFixed(0)}<ArrowRight style={{ width: "15px", height: "15px" }} /></>}
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Flash Deal Card ────────────────────────────────────────────────────────── */
function FlashDealCard({ product, onAddToCart, onOrderNow }: {
  product: any; onAddToCart: (p: any) => void; onOrderNow: (p: any) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(3600);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 3600)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(timeLeft / 3600), m = Math.floor((timeLeft % 3600) / 60), s = timeLeft % 60;

  const [discount, setDiscount] = useState(15);
  useEffect(() => { setDiscount(Math.floor(8 + Math.random() * 15)); }, []);

  const discountedPrice = Math.floor((product.pricePerUnit ?? product.price_per_unit) * (1 - discount / 100));

  return (
    <div style={{ width: "200px", flexShrink: 0, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "18px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.04)", transition: "all .2s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,.08)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,.04)"; }}
    >
      <div style={{ height: "120px", position: "relative", background: "linear-gradient(135deg,#fef2f2,#fff7ed)" }}>
        {(product.imageUrl || product.image_url)
          ? <img src={product.imageUrl || product.image_url} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Leaf style={{ width: "28px", height: "28px", color: "#f59e0b", opacity: 0.4 }} /></div>}
        <div style={{ position: "absolute", top: "8px", left: "8px", padding: "3px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: 800, background: "#ef4444", color: "#fff" }}>
          ⚡ {discount}% OFF
        </div>
      </div>
      <div style={{ padding: "12px" }}>
        <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <span style={{ fontSize: "15px", fontWeight: 900, color: "#10b981" }}>₹{discountedPrice}</span>
          <span style={{ fontSize: "11px", color: "#94a3b8", textDecoration: "line-through" }}>₹{product.pricePerUnit ?? product.price_per_unit}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#f59e0b", fontWeight: 700, marginBottom: "10px" }}>
          <Timer style={{ width: "11px", height: "11px" }} />
          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onOrderNow({ ...product, pricePerUnit: discountedPrice, price_per_unit: discountedPrice }); }}
          style={{ width: "100%", padding: "8px 0", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          <Zap style={{ width: "11px", height: "11px" }} /> Grab Deal
        </button>
      </div>
    </div>
  );
}

/* ─── Market Insight Card ────────────────────────────────────────────────────── */
function MarketInsightCard({ item }: { item: any }) {
  const isUp = item.trend === "up";
  const isDown = item.trend === "down";
  return (
    <div style={{ width: "160px", flexShrink: 0, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px", boxShadow: "0 1px 6px rgba(0,0,0,.03)", transition: "all .2s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#10b981"; (e.currentTarget as HTMLDivElement).style.background = "#f0fdf4"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.background = "#ffffff"; }}
    >
      <p style={{ margin: "0 0 3px", fontSize: "12px", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.crop}</p>
      <p style={{ margin: "0 0 6px", fontSize: "10px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.mandi}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "16px", fontWeight: 900, color: "#1e293b" }}>₹{item.price}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "11px", fontWeight: 700, color: isUp ? "#10b981" : isDown ? "#ef4444" : "#94a3b8" }}>
          {isUp ? <ArrowUp style={{ width: "10px", height: "10px" }} /> : isDown ? <ArrowDown style={{ width: "10px", height: "10px" }} /> : null}
          {Math.abs(item.change)}%
        </span>
      </div>
    </div>
  );
}

/* ─── Main Marketplace Page ──────────────────────────────────────────────────── */
export default function MarketplacePage() {
  // ── All original state preserved 100% ──────────────────────────────────────
  const [searchInput,    setSearchInput]    = useState("");
  const [search,         setSearch]         = useState("");
  const [category,       setCategory]       = useState("All");
  const [cartOpen,       setCartOpen]       = useState(false);
  const [checkoutSuccess,setCheckoutSuccess]= useState(false);
  const [checkoutError,  setCheckoutError]  = useState<string | null>(null);
  const [userLocation,   setUserLocation]   = useState<{ lat: number; lng: number } | null>(null);
  const [filterNearby,   setFilterNearby]   = useState(false);
  const [showFilters,    setShowFilters]    = useState(false);
  const [imageSearching, setImageSearching] = useState(false);
  const [imageSearchResult, setImageSearchResult] = useState<string | null>(null);
  const [showSuggestions,setShowSuggestions]= useState(false);
  const [sortBy,         setSortBy]         = useState("relevance");
  const [priceRange,     setPriceRange]     = useState<[number, number]>([0, 10000]);
  const [onlyOrganic,    setOnlyOrganic]    = useState(false);
  const [minGrade,       setMinGrade]       = useState("All");
  const [activeSection,  setActiveSection]  = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef    = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { cart, cartCount, addToCart, updateQty, removeFromCart, clearCart } = useCart();
  const { t } = useTranslation();

  // Navigate to checkout page with the selected product
  const handleOrderNow = (product: any) => {
    router.push(`/consumer/marketplace/checkout?productId=${product.id}`);
  };

  const getCategoryLabel = (label: string) => {
    const mapping: Record<string, string> = {
      "All": "all", "Vegetables": "vegetables", "Fruits": "fruits",
      "Grains": "grains", "Pulses": "pulses", "Spices": "spices",
      "Leafy Greens": "leafyGreens", "Dairy": "dairy", "Others": "others",
    };
    const key = mapping[label];
    return key ? t(key) : label;
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
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
    id: c.id, title: c.title, category: c.category,
    pricePerUnit: c.price_per_unit, unitType: c.unit_type,
    quantityAvailable: c.quantity_available, imageUrl: c.image_url,
    qualityGrade: c.quality_grade, isOrganic: c.is_organic,
    traceabilityCode: c.traceability_code,
    farmer: { id: `farmer-${c.id}`, fullName: getDemoFarmerName(c.id), isVerified: true },
    rating: c.rating, reviewsCount: c.reviews_count,
    harvestDate: c.harvest_date, location: c.location,
    aiRecommendedPrice: c.ai_recommended_price, marketPrice: c.market_price,
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
    if (category !== "All") { if (!matchesCategory(p, category)) return false; }
    if (onlyOrganic && !(p.isOrganic || p.is_organic)) return false;
    const price = p.pricePerUnit ?? p.price_per_unit ?? 0;
    if (price < priceRange[0] || price > priceRange[1]) return false;
    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    if (sortBy === "price_asc")  return (a.pricePerUnit ?? a.price_per_unit) - (b.pricePerUnit ?? b.price_per_unit);
    if (sortBy === "price_desc") return (b.pricePerUnit ?? b.price_per_unit) - (a.pricePerUnit ?? a.price_per_unit);
    if (sortBy === "rating")     return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortBy === "newest")     return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    return 0;
  });

  // ── Cart management ──────────────────────────────────────────────────────
  const handleAddToCart = useCallback((product: any) => {
    addToCart({
      productId: product.id, title: product.title,
      pricePerUnit: product.pricePerUnit ?? product.price_per_unit,
      unitType: product.unitType ?? product.unit_type,
      farmerId: product.farmer?.id ?? "",
      farmerName: product.farmer?.fullName ?? product.farmerName ?? "Verified Farmer",
      imageUrl: product.imageUrl ?? product.image_url,
      maxQty: product.quantityAvailable ?? product.quantity_available ?? 999,
      category: (product.title?.toLowerCase().includes("pomegranate") || product.category?.toLowerCase().includes("pomegranate")) ? "Fruits" : product.category,
    });
    setCartOpen(true);
  }, [addToCart]);

  const handleUpdateQty  = useCallback((productId: string, qty: number) => updateQty(productId, qty), [updateQty]);
  const handleRemove     = useCallback((productId: string) => removeFromCart(productId), [removeFromCart]);

  const handleToggleWishlist = useCallback((product: any) => {
    const id = product.id;
    if (isInWishlist(id)) { removeFromWishlist(id); }
    else {
      addToWishlist({
        id, title: product.title,
        pricePerUnit: product.pricePerUnit ?? product.price_per_unit,
        unitType: product.unitType ?? product.unit_type,
        imageUrl: product.imageUrl ?? product.image_url,
        qualityGrade: product.qualityGrade ?? product.quality_grade,
        farmerName: product.farmer?.fullName ?? product.farmerName,
        farmerId: product.farmer?.id ?? product.farmerId,
        category: (product.title?.toLowerCase().includes("pomegranate") || product.category?.toLowerCase().includes("pomegranate")) ? "Fruits" : product.category,
      });
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // ── Image Search ──────────────────────────────────────────────────────────
  const handleImageSearch = useCallback(async (file: File) => {
    setImageSearching(true); setImageSearchResult(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res  = await fetch("/api/ai/image-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: base64, mimeType: file.type }) });
        const data = await res.json();
        if (data.searchQuery) { setSearchInput(data.searchQuery); setSearch(data.searchQuery); setImageSearchResult(`🔍 Found: ${data.cropName}${data.localName ? ` (${data.localName})` : ""} — ${data.description}`); }
        else if (data.error) { setImageSearchResult("❌ Could not identify a crop in this image. Please try another photo."); }
        setImageSearching(false);
      };
      reader.readAsDataURL(file);
    } catch { setImageSearchResult("❌ Image search failed. Please try again."); setImageSearching(false); }
  }, []);

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    setCheckoutError(null);
    if (cart.length === 0) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCheckoutError("Please sign in to place an order."); return; }
      const farmerId    = cart[0].farmerId;
      const totalAmount = cart.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);
      const { data: profile } = await supabase.from("profiles").select("address, location_lat, location_lng").eq("id", user.id).maybeSingle();
      createOrder({
        farmerId, totalAmount,
        deliveryAddress: (profile as any)?.address ?? "Delhi, India",
        deliveryLat: (profile as any)?.location_lat ?? undefined,
        deliveryLng: (profile as any)?.location_lng ?? undefined,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity, priceAtPurchase: item.pricePerUnit })),
      }, {
        onSuccess: () => { setCheckoutSuccess(true); clearCart(); setTimeout(() => { setCartOpen(false); setCheckoutSuccess(false); }, 2500); },
        onError: (err: any) => setCheckoutError(err.message ?? "Checkout failed. Please try again."),
      });
    } catch (err: any) { setCheckoutError(err.message ?? "Checkout failed."); }
  };

  // Section slices
  const featured  = sortedProducts.slice(0, 3);
  const organic   = sortedProducts.filter((p: any) => p.isOrganic || p.is_organic).slice(0, 3);
  const trending  = [...sortedProducts].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  const fresh     = [...sortedProducts].sort((a: any, b: any) =>
    new Date(b.harvestDate ?? b.harvest_date ?? 0).getTime() - new Date(a.harvestDate ?? a.harvest_date ?? 0).getTime()
  ).slice(0, 3);

  // ── Page styles ───────────────────────────────────────────────────────────
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hide-scrollbar { scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .mkt-chip-active { background: #10b981 !important; color: #fff !important; border-color: #059669 !important; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(135deg,#064e3b 0%,#065f46 40%,#047857 75%,#10b981 100%)",
        padding: "40px 40px 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "30%", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,.03)", pointerEvents: "none" }} />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px", position: "relative" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80" }} />
              <span style={{ color: "#6ee7b7", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Live · Synced from Farmer Inventory
              </span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "32px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" }}>
              AgriNex Marketplace 🌾
            </h1>
            <p style={{ margin: 0, color: "#a7f3d0", fontSize: "14px", fontWeight: 500 }}>
              Buy directly from {liveProducts.length > 0 ? "verified" : "demo"} farmers — no middlemen, maximum freshness
            </p>
          </div>

          {/* Header action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/consumer/wishlist"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "12px", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none", backdropFilter: "blur(8px)", transition: "background .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.12)")}
            >
              <Heart style={{ width: "14px", height: "14px" }} /> Wishlist
            </Link>
            <Link href="/consumer/compare"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "12px", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none", backdropFilter: "blur(8px)", transition: "background .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.12)")}
            >
              <BarChart2 style={{ width: "14px", height: "14px" }} /> Compare
            </Link>
            <button id="open-cart-btn" onClick={() => setCartOpen(true)}
              style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "12px", background: "#ffffff", border: "none", color: "#064e3b", fontSize: "13px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.12)", transition: "transform .15s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "none")}
            >
              <ShoppingCart style={{ width: "14px", height: "14px" }} />
              Cart
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#94a3b8" }} />
            <input
              ref={searchRef}
              id="marketplace-search"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder='Try: "Organic tomatoes under ₹50" or "Fresh mangoes Maharashtra"'
              style={{ width: "100%", paddingLeft: "48px", paddingRight: "160px", paddingTop: "15px", paddingBottom: "15px", borderRadius: "18px", border: "2px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.95)", color: "#1e293b", fontSize: "14px", outline: "none", boxShadow: "0 8px 32px rgba(0,0,0,.15)", boxSizing: "border-box" }}
            />
            <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "6px" }}>
              {searchInput && (
                <button onClick={() => { setSearchInput(""); setSearch(""); }} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                  <X style={{ width: "14px", height: "14px" }} />
                </button>
              )}
              <button id="image-search-btn" onClick={() => fileInputRef.current?.click()}
                style={{ width: "34px", height: "34px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fffbeb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Image Search">
                {imageSearching ? <Loader2 style={{ width: "14px", height: "14px", color: "#f59e0b", animation: "spin 1s linear infinite" }} /> : <Camera style={{ width: "14px", height: "14px", color: "#f59e0b" }} />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { if (e.target.files?.[0]) handleImageSearch(e.target.files[0]); }} />
              <button onClick={() => setSearch(searchInput)}
                style={{ padding: "8px 18px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                Search
              </button>
            </div>

            {/* AI Suggestions */}
            <AnimatePresence>
              {showSuggestions && searchInput === "" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", borderRadius: "16px", overflow: "hidden", zIndex: 30, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 16px 40px rgba(0,0,0,.12)" }}>
                  <div style={{ padding: "12px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Sparkles style={{ width: "11px", height: "11px", color: "#10b981" }} /> AI Suggested Searches
                    </p>
                    {AI_SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => { setSearchInput(s); setSearch(s); setShowSuggestions(false); }}
                        style={{ width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: "10px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", color: "#374151", display: "flex", alignItems: "center", gap: "8px", transition: "background .12s" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
                      >
                        <Search style={{ width: "12px", height: "12px", color: "#10b981", flexShrink: 0 }} /> {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {imageSearchResult && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: "10px", padding: "10px 14px", borderRadius: "12px", background: "rgba(255,255,255,.9)", border: "1px solid rgba(245,158,11,.3)", fontSize: "13px", color: "#92400e" }}>
              {imageSearchResult}
            </motion.div>
          )}
        </div>

        {/* ── Category Chips ── */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginTop: "24px", maxWidth: "680px", marginLeft: "auto", marginRight: "auto" }} className="hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat.label} onClick={() => setCategory(cat.label)}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px",
                fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer",
                border: `1px solid ${category === cat.label ? "transparent" : "rgba(255,255,255,.2)"}`,
                background: category === cat.label ? "#ffffff" : "rgba(255,255,255,.1)",
                color: category === cat.label ? "#064e3b" : "#ffffff",
                backdropFilter: "blur(8px)",
                transition: "all .15s",
                boxShadow: category === cat.label ? "0 2px 8px rgba(0,0,0,.12)" : "none",
              }}
            >
              <span>{cat.icon}</span> {getCategoryLabel(cat.label)}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: "40px" }}>

        {/* ── Filters & Sort bar ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <button id="toggle-filters-btn" onClick={() => setShowFilters(!showFilters)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "12px", border: `1px solid ${showFilters ? "#10b981" : "#e2e8f0"}`, background: showFilters ? "#f0fdf4" : "#ffffff", color: showFilters ? "#10b981" : "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
            <Filter style={{ width: "13px", height: "13px" }} />
            {showFilters ? "Hide Filters" : "Advanced Filters"}
            <ChevronDown style={{ width: "13px", height: "13px", transform: showFilters ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "9px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer", outline: "none" }}>
            <option value="relevance">Sort: Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Best Rated</option>
            <option value="newest">Newest</option>
          </select>

          <button onClick={() => setOnlyOrganic(!onlyOrganic)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "12px", border: `1px solid ${onlyOrganic ? "#a7f3d0" : "#e2e8f0"}`, background: onlyOrganic ? "#f0fdf4" : "#ffffff", color: onlyOrganic ? "#059669" : "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
            🌿 Organic Only
          </button>

          {userLocation && (
            <button id="nearby-filter-btn" onClick={() => setFilterNearby(!filterNearby)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "12px", border: `1px solid ${filterNearby ? "#bfdbfe" : "#e2e8f0"}`, background: filterNearby ? "#eff6ff" : "#ffffff", color: filterNearby ? "#3b82f6" : "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
              <MapPin style={{ width: "13px", height: "13px" }} /> Nearby (50km)
            </button>
          )}

          <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
            {(search || category !== "All") && (
              <button onClick={() => { setSearch(""); setSearchInput(""); setCategory("All"); setOnlyOrganic(false); }}
                style={{ border: "none", background: "none", cursor: "pointer", color: "#10b981", fontSize: "12px", fontWeight: 700, marginLeft: "4px" }}>
                Clear all ×
              </button>
            )}
          </span>
        </div>

        {/* Advanced filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>Price Range</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#1e293b", outline: "none" }} placeholder="Min ₹" />
                  <span style={{ color: "#94a3b8" }}>—</span>
                  <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#1e293b", outline: "none" }} placeholder="Max ₹" />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>Minimum AI Grade</label>
                <select value={minGrade} onChange={(e) => setMinGrade(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#1e293b", outline: "none", cursor: "pointer" }}>
                  <option value="All">All Grades</option>
                  <option value="A+">A+ Only</option>
                  <option value="A">A or Better</option>
                  <option value="B">B or Better</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button onClick={() => { setPriceRange([0, 10000]); setMinGrade("All"); setOnlyOrganic(false); setSortBy("relevance"); }}
                  style={{ width: "100%", padding: "9px 0", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <RefreshCw style={{ width: "13px", height: "13px" }} /> Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Flash Deals ── */}
        {sortedProducts.length > 0 && (
          <section>
            <SectionHeader
              icon={<Zap style={{ width: "18px", height: "18px", color: "#ef4444" }} />}
              title="⚡ Flash Deals"
              subtitle="Limited time offers — hurry before they expire!"
              accent="#ef4444"
            />
            <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "8px" }} className="hide-scrollbar">
              {sortedProducts.slice(0, 6).map((p: any) => (
                <FlashDealCard key={p.id} product={p} onAddToCart={handleAddToCart} onOrderNow={handleOrderNow} />
              ))}
            </div>
          </section>
        )}

        {/* ── Today's Fresh Harvest ── */}
        {fresh.length > 0 && !search && category === "All" && (
          <section>
            <SectionHeader
              icon={<Sun style={{ width: "18px", height: "18px", color: "#f59e0b" }} />}
              title="🌅 Today's Fresh Harvest"
              subtitle="Just picked from the farm — maximum freshness guaranteed"
              accent="#f59e0b"
              action={<Link href="/consumer/marketplace" style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>View All <ChevronRight style={{ width: "13px", height: "13px" }} /></Link>}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "18px" }}>
              {fresh.map((p: any) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist(p.id)} onToggleWishlist={handleToggleWishlist} onOrderNow={handleOrderNow} />
              ))}
            </div>
          </section>
        )}

        {/* ── Organic Collection ── */}
        {organic.length > 0 && !search && category === "All" && (
          <section>
            <SectionHeader
              icon={<Leaf style={{ width: "18px", height: "18px", color: "#059669" }} />}
              title="🌿 Organic Collection"
              subtitle="Certified organic produce — zero pesticides, pure goodness"
              accent="#059669"
              action={<Link href="/consumer/marketplace" style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>View All <ChevronRight style={{ width: "13px", height: "13px" }} /></Link>}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "18px" }}>
              {organic.map((p: any) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist(p.id)} onToggleWishlist={handleToggleWishlist} onOrderNow={handleOrderNow} />
              ))}
            </div>
          </section>
        )}

        {/* ── Best Rated ── */}
        {trending.length > 0 && !search && category === "All" && (
          <section>
            <SectionHeader
              icon={<Star style={{ width: "18px", height: "18px", color: "#f59e0b" }} />}
              title="⭐ Best Rated Products"
              subtitle="Top-rated by verified customers — quality you can trust"
              accent="#f59e0b"
              action={<Link href="/consumer/marketplace" style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>View All <ChevronRight style={{ width: "13px", height: "13px" }} /></Link>}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "18px" }}>
              {trending.map((p: any) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist(p.id)} onToggleWishlist={handleToggleWishlist} onOrderNow={handleOrderNow} />
              ))}
            </div>
          </section>
        )}

        {/* ── Live Market Insights ── */}
        <section>
          <SectionHeader
            icon={<TrendingUp style={{ width: "18px", height: "18px", color: "#38bdf8" }} />}
            title="📊 Live Market Insights"
            subtitle="Real-time APMC mandi prices — updated every 15 minutes"
            accent="#38bdf8"
          />
          <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }} className="hide-scrollbar">
            {DEMO_MARKET_PRICES.map((item) => (
              <MarketInsightCard key={item.crop} item={item} />
            ))}
          </div>
        </section>

        {/* ── All Products / Search Results ── */}
        <section>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
            <SectionHeader
              icon={<Package style={{ width: "18px", height: "18px", color: "#10b981" }} />}
              title={search ? `Results for "${search}"` : "All Products"}
              subtitle={search ? `${sortedProducts.length} products found` : "Complete farmer inventory — real-time sync"}
              accent="#10b981"
            />
            {!isLoading && (
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" }} />
                {liveProducts.length > 0 ? "Live from farmers" : "Demo mode"}
              </span>
            )}
          </div>

          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "18px" }}>
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", textAlign: "center" }}>
              <Sparkles style={{ width: "40px", height: "40px", color: "#e2e8f0", marginBottom: "16px" }} />
              <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#94a3b8" }}>No products found</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1" }}>
                {search ? `No results for "${search}"` : "No products in this category yet."}
              </p>
              <button onClick={() => { setSearch(""); setSearchInput(""); setCategory("All"); }}
                style={{ marginTop: "16px", padding: "10px 22px", borderRadius: "12px", border: "none", background: "#f0fdf4", color: "#10b981", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                Clear & Browse All
              </button>
            </div>
          ) : (
            <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "18px" }}>
              <AnimatePresence>
                {sortedProducts.map((p: any) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart}
                    isInWishlist={isInWishlist(p.id)} onToggleWishlist={handleToggleWishlist} onOrderNow={handleOrderNow} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* ── Testimonials ── */}
        <section>
          <SectionHeader
            icon={<Award style={{ width: "18px", height: "18px", color: "#8b5cf6" }} />}
            title="💬 Customer Stories"
            subtitle="Real experiences from verified buyers across India"
            accent="#8b5cf6"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "18px" }}>
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "22px", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: `linear-gradient(135deg,hsl(${i * 80 + 160},60%,45%),hsl(${i * 80 + 180},70%,35%))`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "15px", fontWeight: 800, flexShrink: 0 }}>
                    {testimonial.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{testimonial.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{testimonial.city}</p>
                  </div>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} style={{ width: "12px", height: "12px", color: "#f59e0b", fill: "#f59e0b" }} />
                    ))}
                  </div>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>{testimonial.text}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>Bought: {testimonial.product}</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#10b981" }}>{testimonial.savings}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Trust Badges ── */}
        <section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "16px" }}>
            {[
              { icon: <Shield style={{ width: "22px", height: "22px", color: "#10b981" }} />, title: "Verified Farmers",   desc: "KYC-approved, trust-scored",    color: "#10b981" },
              { icon: <Truck  style={{ width: "22px", height: "22px", color: "#38bdf8" }} />, title: "Fast Delivery",      desc: "24–48 hour farm-to-door",      color: "#38bdf8" },
              { icon: <Leaf   style={{ width: "22px", height: "22px", color: "#4ade80" }} />, title: "100% Fresh",         desc: "AI quality guaranteed",         color: "#4ade80" },
              { icon: <Globe  style={{ width: "22px", height: "22px", color: "#a78bfa" }} />, title: "Full Traceability",  desc: "Track crop from farm to table", color: "#a78bfa" },
            ].map((b, i) => (
              <div key={i}
                style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px", boxShadow: "0 1px 6px rgba(0,0,0,.03)", transition: "all .2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = b.color; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `${b.color}12`, border: `1px solid ${b.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {b.icon}
                </div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>{b.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Cart Sidebar ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)" }}
              onClick={() => setCartOpen(false)} />
            <CartSidebar cart={cart} onUpdateQty={handleUpdateQty} onRemove={handleRemove}
              onClose={() => setCartOpen(false)} onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut} checkoutSuccess={checkoutSuccess} checkoutError={checkoutError} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
