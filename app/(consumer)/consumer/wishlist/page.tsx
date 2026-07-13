"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview Wishlist Page — /consumer/wishlist
 * Premium redesign: 160×160 product images, stat cards, price-drop highlights,
 * AI recommendation section. All business logic preserved.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, ShoppingCart, Trash2, Package, Leaf, ArrowRight, Star,
  TrendingUp, X, Sparkles, Share2, GitCompare, Eye, ShoppingBag,
  CheckCircle, AlertTriangle, Tag, Zap, BarChart2, Clock,
  MapPin, Award, TrendingDown,
} from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/context/CartContext";
import { DEMO_CROPS } from "@/lib/demoData";

// ─── Enriched item type ───────────────────────────────────────────────────────
interface EnrichedItem {
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
  rating?: number;
  reviewsCount?: number;
  isOrganic: boolean;
  aiGrade?: string;
  aiConfidence?: number;
  freshness?: number;
  harvestDate?: string;
  location?: string;
  originalPrice?: number;
  marketTrend?: string;
  stock?: number;
  certificates?: string[];
  isVerified?: boolean;
}

// ─── Enrich wishlist item with demo crop data ─────────────────────────────────
function enrich(item: ReturnType<typeof useWishlist>["wishlist"][0]): EnrichedItem {
  const demo = DEMO_CROPS.find((c) => c.id === item.id);
  if (!demo) return { ...item, rating: 4.5, reviewsCount: 0, isOrganic: false, aiGrade: item.qualityGrade ?? "B" };
  return {
    ...item,
    rating: demo.rating,
    reviewsCount: demo.reviews_count,
    isOrganic: demo.is_organic,
    aiGrade: demo.ai_quality_grade ?? item.qualityGrade,
    aiConfidence: demo.ai_confidence_score,
    freshness: demo.ai_freshness_score,
    harvestDate: demo.harvest_date,
    location: demo.location,
    originalPrice: demo.market_price,
    marketTrend: demo.market_trend,
    stock: demo.quantity_available,
    certificates: demo.certificates ?? [],
    isVerified: demo.is_verified,
  };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; bg: string;
}) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "20px",
      border: "1px solid #e2e8f0",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      flex: "1 1 160px",
      minWidth: 0,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "14px", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
        <p style={{ fontSize: "22px", fontWeight: 900, color: "#1e293b", margin: "2px 0 0", lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

// ─── AI Recommendation Card (compact) ────────────────────────────────────────
function RecoCard({ crop }: { crop: typeof DEMO_CROPS[0] }) {
  const { addToCart } = useCart();
  return (
    <Link href={`/consumer/marketplace/${crop.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0",
        overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s, transform 0.2s", cursor: "pointer",
      }}
        className="group"
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; }}>
        <div style={{ width: "100%", height: "120px", overflow: "hidden", background: "#f8fafc" }}>
          {crop.image_url ? (
            <img src={crop.image_url} alt={crop.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
              className="group-hover:scale-105" />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf style={{ width: 32, height: 32, color: "#cbd5e1" }} />
            </div>
          )}
        </div>
        <div style={{ padding: "12px 14px" }}>
          <p style={{ fontSize: "12px", fontWeight: 800, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{crop.title}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: 900, color: "#10b981" }}>₹{crop.price_per_unit}<span style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8" }}>/{crop.unit_type}</span></span>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Star style={{ width: 10, height: 10, color: "#f59e0b", fill: "#f59e0b" }} />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#374151" }}>{crop.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Wishlist Card ───────────────────────────────────────────────────────
function WishlistCard({ item, onRemove }: {
  item: EnrichedItem;
  onRemove: () => void;
}) {
  const { t } = useTranslation("consumer");
  const router = useRouter();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
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
    router.push("/consumer/marketplace/checkout");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({ title: item.title, url: `${window.location.origin}/consumer/marketplace/${item.id}` });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/consumer/marketplace/${item.id}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const hasPriceDrop = item.originalPrice && item.originalPrice > item.pricePerUnit;
  const savings = hasPriceDrop ? (item.originalPrice! - item.pricePerUnit) : 0;
  const discountPct = hasPriceDrop ? Math.round((savings / item.originalPrice!) * 100) : 0;
  const isLowStock = (item.stock ?? 999) < 50;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93 }}
      style={{
        background: "#ffffff",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.25s, transform 0.25s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      className="group"
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
    >
      {/* ── Image Section ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative", width: "100%", padding: "16px 16px 0", flexShrink: 0 }}>
        <div style={{
          width: "100%",
          height: "160px",
          borderRadius: "18px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          position: "relative",
        }}>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
              className="group-hover:[transform:scale(1.07)]"
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf style={{ width: 40, height: 40, color: "#cbd5e1" }} />
            </div>
          )}

          {/* Overlay badges top-left */}
          <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
            {item.isOrganic && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "3px",
                padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 800,
                background: "rgba(5,150,105,0.9)", color: "#ffffff",
                backdropFilter: "blur(4px)",
              }}>
                🌿 Organic
              </span>
            )}
            {item.aiGrade && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "3px",
                padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 800,
                background: item.aiGrade === "A+" ? "rgba(139,92,246,0.9)" : "rgba(16,185,129,0.9)",
                color: "#ffffff",
                backdropFilter: "blur(4px)",
              }}>
                🤖 Grade {item.aiGrade}
              </span>
            )}
            {hasPriceDrop && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "3px",
                padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 800,
                background: "rgba(239,68,68,0.9)", color: "#ffffff",
                backdropFilter: "blur(4px)",
              }}>
                🔻 -{discountPct}%
              </span>
            )}
          </div>

          {/* Remove button top-right */}
          <button
            onClick={(e) => { e.preventDefault(); onRemove(); }}
            style={{
              position: "absolute", top: "10px", right: "10px",
              width: "30px", height: "30px", borderRadius: "50%",
              background: "rgba(255,255,255,0.95)", border: "1px solid #fecaca",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "transform 0.15s, background 0.15s",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; (e.currentTarget as HTMLElement).style.transform = "scale(1.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.95)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            title="Remove from wishlist"
          >
            <X style={{ width: 13, height: 13, color: "#ef4444" }} />
          </button>

          {/* Stock alert bottom */}
          {isLowStock && (
            <div style={{
              position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
              background: "rgba(239,68,68,0.9)", color: "#fff",
              fontSize: "9px", fontWeight: 800, padding: "2px 10px", borderRadius: "20px",
              backdropFilter: "blur(4px)", whiteSpace: "nowrap",
            }}>
              ⚡ Only {item.stock} left!
            </div>
          )}
        </div>
      </div>

      {/* ── Body Section ──────────────────────────────────────────────────── */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {/* Product name */}
        <Link href={`/consumer/marketplace/${item.id}`} style={{ textDecoration: "none" }}>
          <h3 style={{
            fontSize: "14px", fontWeight: 800, color: "#1e293b",
            margin: 0, lineHeight: "1.35", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#059669")}
            onMouseLeave={e => (e.currentTarget.style.color = "#1e293b")}
          >{item.title}</h3>
        </Link>

        {/* Farmer row */}
        {item.farmerName && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "9px", fontWeight: 900, color: "#fff",
            }}>{(item.farmerName[0] ?? "F").toUpperCase()}</div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>{item.farmerName}</span>
            {item.isVerified && (
              <CheckCircle style={{ width: 11, height: 11, color: "#10b981", flexShrink: 0 }} />
            )}
          </div>
        )}

        {/* Rating row */}
        {item.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} style={{
                width: 11, height: 11,
                color: "#f59e0b",
                fill: s <= Math.round(item.rating!) ? "#f59e0b" : "none",
              }} />
            ))}
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#374151" }}>{item.rating?.toFixed(1)}</span>
            {item.reviewsCount ? <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>({item.reviewsCount})</span> : null}
          </div>
        )}

        {/* Meta: location + harvest */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {item.location && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "3px",
              fontSize: "10px", fontWeight: 700, color: "#64748b",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              padding: "2px 8px", borderRadius: "20px",
            }}>
              <MapPin style={{ width: 9, height: 9 }} />{item.location}
            </span>
          )}
          {item.harvestDate && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "3px",
              fontSize: "10px", fontWeight: 700, color: "#64748b",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              padding: "2px 8px", borderRadius: "20px",
            }}>
              <Clock style={{ width: 9, height: 9 }} />Harvested: {new Date(item.harvestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
          {item.freshness && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "3px",
              fontSize: "10px", fontWeight: 700,
              color: item.freshness >= 90 ? "#059669" : "#d97706",
              background: item.freshness >= 90 ? "#f0fdf4" : "#fffbeb",
              border: `1px solid ${item.freshness >= 90 ? "#bbf7d0" : "#fde68a"}`,
              padding: "2px 8px", borderRadius: "20px",
            }}>
              ✨ Freshness {item.freshness}%
            </span>
          )}
        </div>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#10b981" }}>₹{item.pricePerUnit}</span>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>/{item.unitType}</span>
          {hasPriceDrop && (
            <>
              <span style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "line-through", fontWeight: 600 }}>₹{item.originalPrice}</span>
              <span style={{
                fontSize: "10px", fontWeight: 800, padding: "1px 6px", borderRadius: "10px",
                background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
              }}>Save ₹{savings}</span>
            </>
          )}
        </div>

        {/* Trend badge */}
        {item.marketTrend === "up" && (
          <span style={{
            fontSize: "10px", fontWeight: 700, color: "#dc2626",
            display: "inline-flex", alignItems: "center", gap: "3px",
          }}>
            <TrendingUp style={{ width: 10, height: 10 }} />Price Rising — Buy Now
          </span>
        )}
        {item.marketTrend === "down" && (
          <span style={{
            fontSize: "10px", fontWeight: 700, color: "#059669",
            display: "inline-flex", alignItems: "center", gap: "3px",
          }}>
            <TrendingDown style={{ width: 10, height: 10 }} />Price Dropping
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* ── Action Buttons ──────────────────────────────────────────────── */}
        {/* Row 1: Add to Cart + Buy Now */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleAddToCart}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: "14px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: "none",
              transition: "transform 0.15s, box-shadow 0.15s",
              background: added
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #ecfdf5, #d1fae5)",
              color: added ? "#ffffff" : "#059669",
              boxShadow: added ? "0 4px 12px rgba(16,185,129,0.35)" : "none",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            <ShoppingCart style={{ width: 13, height: 13 }} />
            {added ? "Added! ✓" : "Add to Cart"}
          </button>

          <button
            onClick={handleBuyNow}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: "14px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: "none",
              transition: "transform 0.15s, box-shadow 0.15s",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(16,185,129,0.45)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(16,185,129,0.3)"; }}
          >
            <Zap style={{ width: 13, height: 13 }} />
            Buy Now
          </button>
        </div>

        {/* Row 2: View Details + Compare + Share + Remove */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <Link
            href={`/consumer/marketplace/${item.id}`}
            style={{
              flex: "1 1 auto",
              padding: "7px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#475569",
              textDecoration: "none",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
          >
            <Eye style={{ width: 11, height: 11 }} />
            View
          </Link>

          <Link
            href={`/consumer/compare?id=${item.id}`}
            style={{
              flex: "1 1 auto",
              padding: "7px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              border: "1px solid #e0e7ff",
              background: "#eef2ff",
              color: "#4f46e5",
              textDecoration: "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e0e7ff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#eef2ff"; }}
          >
            <BarChart2 style={{ width: 11, height: 11 }} />
            Compare
          </Link>

          <button
            onClick={handleShare}
            style={{
              flex: "0 0 auto",
              padding: "7px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              border: "1px solid #e0f2fe",
              background: "#f0f9ff",
              color: "#0284c7",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e0f2fe"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f0f9ff"; }}
          >
            <Share2 style={{ width: 11, height: 11 }} />
            {shared ? "Copied!" : "Share"}
          </button>

          <button
            onClick={(e) => { e.preventDefault(); onRemove(); }}
            style={{
              flex: "0 0 auto",
              padding: "7px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              border: "1px solid #fee2e2",
              background: "#fef2f2",
              color: "#dc2626",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fee2e2"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
          >
            <Trash2 style={{ width: 11, height: 11 }} />
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { t } = useTranslation("consumer");
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  const enriched = useMemo(() => wishlist.map(enrich), [wishlist]);

  // Stats
  const estimatedValue = enriched.reduce((s, i) => s + i.pricePerUnit, 0);
  const organicCount = enriched.filter(i => i.isOrganic).length;
  const priceDrops = enriched.filter(i => i.originalPrice && i.originalPrice > i.pricePerUnit).length;
  const lowStockCount = enriched.filter(i => (i.stock ?? 999) < 50).length;

  // AI Recommendations: pick DEMO_CROPS not already in wishlist
  const wishlistIds = new Set(wishlist.map(w => w.id));
  const recoItems = DEMO_CROPS.filter(c => c.is_active && !wishlistIds.has(c.id)).slice(0, 4);

  // ── Empty State ──────────────────────────────────────────────────────────
  if (wishlist.length === 0) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        background: "#f8fafc",
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
            border: "2px solid #fecaca",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24, boxShadow: "0 8px 24px rgba(239,68,68,0.12)",
          }}>
          <Heart style={{ width: 44, height: 44, color: "#fb7185" }} />
        </motion.div>
        <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#1e293b", margin: "0 0 8px" }}>
          {t("emptyWishlist")}
        </h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px", fontWeight: 500 }}>
          Save products you love and buy them when you're ready
        </p>
        <Link href="/consumer/marketplace"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "14px 28px", borderRadius: "16px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff", fontWeight: 800, fontSize: "14px",
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(16,185,129,0.35)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
        >
          <Leaf style={{ width: 16, height: 16 }} />
          {t("browseMarketplace")}
          <ArrowRight style={{ width: 16, height: 16 }} />
        </Link>

        {/* Reco section even on empty state */}
        {recoItems.length > 0 && (
          <div style={{ marginTop: "56px", width: "100%", maxWidth: "900px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#1e293b", marginBottom: "16px" }}>
              ✨ Trending on AgriNex
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
              {recoItems.map(c => <RecoCard key={c.id} crop={c} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "28px 0", minHeight: "100vh", background: "#f8fafc" }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{
              fontSize: "28px", fontWeight: 900, color: "#1e293b",
              display: "flex", alignItems: "center", gap: "10px", margin: 0,
            }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 40, height: 40, borderRadius: "14px",
                background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
                border: "1px solid #fecaca",
              }}>
                <Heart style={{ width: 20, height: 20, color: "#f43f5e" }} />
              </span>
              {t("wishlistTitle")}
            </h1>
            <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 600, marginTop: "6px" }}>
              {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""} · Ready to order from verified farmers
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/consumer/marketplace"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", borderRadius: "12px",
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                color: "#059669", fontWeight: 700, fontSize: "12px",
                textDecoration: "none", transition: "background 0.15s",
              }}>
              <Sparkles style={{ width: 13, height: 13 }} />
              {t("continueShopping")}
            </Link>
            <button
              onClick={clearWishlist}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", borderRadius: "12px",
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "#dc2626", fontWeight: 700, fontSize: "12px",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fee2e2"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
            >
              <Trash2 style={{ width: 13, height: 13 }} />
              {t("clearAll2")}
            </button>
          </div>
        </div>

        {/* ── Stat Cards Row ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <StatCard
            icon={<ShoppingBag style={{ width: 20, height: 20 }} />}
            label="Saved Products"
            value={wishlist.length}
            color="#10b981"
            bg="rgba(16,185,129,0.1)"
          />
          <StatCard
            icon={<Tag style={{ width: 20, height: 20 }} />}
            label="Est. Value"
            value={`₹${estimatedValue.toLocaleString()}`}
            color="#8b5cf6"
            bg="rgba(139,92,246,0.1)"
          />
          <StatCard
            icon={<Leaf style={{ width: 20, height: 20 }} />}
            label="Organic Items"
            value={organicCount}
            color="#059669"
            bg="rgba(5,150,105,0.1)"
          />
          <StatCard
            icon={<TrendingDown style={{ width: 20, height: 20 }} />}
            label="Price Drops"
            value={priceDrops}
            color="#dc2626"
            bg="rgba(220,38,38,0.1)"
          />
          <StatCard
            icon={<AlertTriangle style={{ width: 20, height: 20 }} />}
            label="Stock Alerts"
            value={lowStockCount}
            color="#d97706"
            bg="rgba(217,119,6,0.1)"
          />
        </div>
      </div>

      {/* ── Price Drop Highlight Banner ──────────────────────────────────────── */}
      {priceDrops > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: "24px",
            background: "linear-gradient(135deg, #fef2f2, #fff5f5)",
            border: "1px solid #fecaca",
            borderRadius: "20px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
          <div style={{
            width: 36, height: 36, borderRadius: "12px",
            background: "rgba(239,68,68,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <TrendingDown style={{ width: 18, height: 18, color: "#dc2626" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: 800, color: "#991b1b", margin: 0 }}>
              🔻 Price Drop Alert — {priceDrops} item{priceDrops > 1 ? "s" : ""} in your wishlist {priceDrops > 1 ? "are" : "is"} cheaper now!
            </p>
            <p style={{ fontSize: "11px", color: "#b91c1c", margin: "2px 0 0", fontWeight: 600 }}>
              Act fast before prices rise again. Scroll down to see items marked with the red badge.
            </p>
          </div>
          <TrendingDown style={{ width: 20, height: 20, color: "#dc2626", flexShrink: 0 }} />
        </motion.div>
      )}

      {/* ── Wishlist Grid ────────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "20px",
        marginBottom: "40px",
      }}>
        <AnimatePresence>
          {enriched.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={() => removeFromWishlist(item.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ── AI Recommendations Section ───────────────────────────────────────── */}
      {recoItems.length > 0 && (
        <div style={{
          background: "#ffffff",
          borderRadius: "28px",
          border: "1px solid #e2e8f0",
          padding: "28px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          marginBottom: "32px",
        }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "12px",
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles style={{ width: 18, height: 18, color: "#fff" }} />
              </div>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#1e293b", margin: 0 }}>
                  Recommended Based On Your Wishlist
                </h2>
                <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, margin: "2px 0 0" }}>
                  Similar products · Nearby farmers · Higher-rated alternatives · Seasonal picks
                </p>
              </div>
            </div>
            <Link href="/consumer/marketplace"
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                fontSize: "12px", fontWeight: 700, color: "#8b5cf6",
                textDecoration: "none",
              }}>
              View All <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>

          {/* Reco category chips */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {["Similar Products", "Nearby Farmers", "Higher Rated", "Seasonal", "Organic Alternatives"].map(tag => (
              <span key={tag} style={{
                padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                background: "#f3e8ff", color: "#7c3aed", border: "1px solid #e9d5ff",
              }}>{tag}</span>
            ))}
          </div>

          {/* Reco grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "14px",
          }}>
            {recoItems.map(c => <RecoCard key={c.id} crop={c} />)}
          </div>
        </div>
      )}

      {/* ── Bottom CTA ────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", paddingBottom: "16px" }}>
        <Link href="/consumer/marketplace"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            color: "#10b981", fontSize: "13px", fontWeight: 700, textDecoration: "none",
            transition: "gap 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = "12px"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = "8px"; }}
        >
          <Sparkles style={{ width: 15, height: 15 }} />
          {t("continueShopping")}
          <ArrowRight style={{ width: 15, height: 15 }} />
        </Link>
      </div>
    </motion.div>
  );
}