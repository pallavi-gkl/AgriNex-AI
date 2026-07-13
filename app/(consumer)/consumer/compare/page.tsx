"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview AI Crop Comparison Page — /consumer/compare
 * Compares the SAME product sold by different farmers.
 * Never compares unrelated products.
 * Premium UI redesign — all comparison logic 100% preserved.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, MapPin, Trash2,
  Sparkles, Scale, AlertCircle, ShoppingCart, Info,
  Star, CheckCircle, Truck, Award, Zap, Leaf, Clock,
  TrendingDown, Shield, BarChart2,
} from "lucide-react";
import { DEMO_CROPS } from "@/lib/demoData";
import { useCart } from "@/context/CartContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CompareProduct {
  id: string;
  title: string;
  category: string;
  pricePerUnit: number;
  unitType: string;
  quantityAvailable: number;
  imageUrl: string;
  qualityGrade: string;
  isOrganic: boolean;
  harvestDate: string;
  shelfLifeDays: number;
  aiConfidenceScore: number;
  aiFreshnessScore: number;
  location: string;
  rating: number;
  reviewsCount: number;
  farmerPrice: number;
  marketPrice: number;
  aiRecommendedPrice: number;
  farmerName: string;
  certificates: string[];
  deliveryTime: string;
}

// ─── Farmer roster for same-product variants ─────────────────────────────────
const FARMER_VARIANTS: Record<string, { name: string; location: string; priceAdj: number; gradeAdj: number; freshnessAdj: number; deliveryTime: string; certificates: string[] }[]> = {
  "crop-001": [ // Premium Basmati Rice
    { name: "Rajesh Kumar", location: "Karnal, Haryana", priceAdj: 0, gradeAdj: 0, freshnessAdj: 0, deliveryTime: "24–36 hrs", certificates: ["FSSAI Certified", "Organic India", "Export Quality"] },
    { name: "Sukhwinder Singh", location: "Kurukshetra, Haryana", priceAdj: -8, gradeAdj: -1, freshnessAdj: -4, deliveryTime: "36–48 hrs", certificates: ["FSSAI Certified", "Export Quality"] },
    { name: "Harpreet Gill", location: "Ambala, Haryana", priceAdj: +6, gradeAdj: 0, freshnessAdj: +2, deliveryTime: "24 hrs", certificates: ["FSSAI Certified", "Organic India", "ISO 22000"] },
  ],
  "crop-002": [ // Alphonso Mangoes
    { name: "Suresh Patil", location: "Ratnagiri, Maharashtra", priceAdj: 0, gradeAdj: 0, freshnessAdj: 0, deliveryTime: "24–36 hrs", certificates: ["GI Tag – Alphonso Mango", "APEDA Export Certified"] },
    { name: "Datta Sawant", location: "Devgad, Maharashtra", priceAdj: -30, gradeAdj: -1, freshnessAdj: -3, deliveryTime: "48 hrs", certificates: ["GI Tag – Alphonso Mango", "FSSAI Certified"] },
    { name: "Narayan Bhavsar", location: "Vengurla, Maharashtra", priceAdj: +20, gradeAdj: 0, freshnessAdj: +1, deliveryTime: "18–24 hrs", certificates: ["GI Tag – Alphonso Mango", "APEDA Export Certified", "Organic Certified"] },
  ],
  "crop-003": [ // Organic Turmeric
    { name: "Muthu Raman", location: "Erode, Tamil Nadu", priceAdj: 0, gradeAdj: 0, freshnessAdj: 0, deliveryTime: "48 hrs", certificates: ["NPOP Organic Certified", "Spices Board India"] },
    { name: "Velmurugan K", location: "Salem, Tamil Nadu", priceAdj: -15, gradeAdj: -1, freshnessAdj: -5, deliveryTime: "48–72 hrs", certificates: ["FSSAI Certified", "Spices Board India"] },
    { name: "Annamalai S", location: "Dharmapuri, Tamil Nadu", priceAdj: +10, gradeAdj: 0, freshnessAdj: +3, deliveryTime: "36 hrs", certificates: ["NPOP Organic Certified", "Spices Board India", "ISO 22000"] },
  ],
  "crop-004": [ // Baby Spinach
    { name: "Pradeep Joshi", location: "Pune, Maharashtra", priceAdj: 0, gradeAdj: 0, freshnessAdj: 0, deliveryTime: "12–18 hrs", certificates: ["Hydroponic Certified", "FSSAI Grade A"] },
    { name: "Ramesh Naik", location: "Nashik, Maharashtra", priceAdj: -8, gradeAdj: -1, freshnessAdj: -5, deliveryTime: "24–36 hrs", certificates: ["FSSAI Grade A"] },
    { name: "Kavita Sharma", location: "Kolhapur, Maharashtra", priceAdj: +5, gradeAdj: 0, freshnessAdj: +1, deliveryTime: "12 hrs", certificates: ["Hydroponic Certified", "FSSAI Grade A", "GlobalGAP"] },
  ],
  "crop-005": [ // Kesar Saffron
    { name: "Abdul Rashid", location: "Pampore, J&K", priceAdj: 0, gradeAdj: 0, freshnessAdj: 0, deliveryTime: "48–72 hrs", certificates: ["GI Tag – Kashmir Kesar", "ISO 3632 Grade 1", "AGMARK Certified"] },
    { name: "Mohammad Farooq", location: "Pulwama, J&K", priceAdj: -20000, gradeAdj: -1, freshnessAdj: -2, deliveryTime: "72 hrs", certificates: ["ISO 3632 Grade 1", "AGMARK Certified"] },
  ],
  "crop-006": [ // Hybrid Tomatoes
    { name: "Ganesh Wagh", location: "Nashik, Maharashtra", priceAdj: 0, gradeAdj: 0, freshnessAdj: 0, deliveryTime: "24 hrs", certificates: ["FSSAI Certified"] },
    { name: "Santosh Jadhav", location: "Pune, Maharashtra", priceAdj: -5, gradeAdj: -1, freshnessAdj: -4, deliveryTime: "36 hrs", certificates: ["FSSAI Certified"] },
    { name: "Lata More", location: "Ahmednagar, Maharashtra", priceAdj: +4, gradeAdj: 0, freshnessAdj: +3, deliveryTime: "18–24 hrs", certificates: ["FSSAI Certified", "GAP Certified"] },
  ],
};

// Grade array for offset logic
const GRADES = ["D", "C", "B", "A", "A+"];

function getGradeWithOffset(base: string, offset: number): string {
  const idx = GRADES.indexOf(base);
  const newIdx = Math.max(0, Math.min(GRADES.length - 1, idx + offset));
  return GRADES[newIdx];
}

function buildCompareProducts(crop: any): CompareProduct[] {
  const variants = FARMER_VARIANTS[crop.id];
  if (!variants) return [];
  return variants.map((v, i) => ({
    id: `${crop.id}-farmer-${i}`,
    title: crop.title,
    category: crop.category,
    pricePerUnit: crop.price_per_unit + v.priceAdj,
    unitType: crop.unit_type,
    quantityAvailable: Math.max(10, crop.quantity_available - i * 150),
    imageUrl: crop.image_url, // Always the SAME product image
    qualityGrade: getGradeWithOffset(crop.quality_grade, v.gradeAdj),
    isOrganic: crop.is_organic,
    harvestDate: crop.harvest_date,
    shelfLifeDays: crop.shelf_life_days,
    aiConfidenceScore: Math.max(80, (crop.ai_confidence_score ?? 95) + v.gradeAdj * 2),
    aiFreshnessScore: Math.max(70, (crop.ai_freshness_score ?? 90) + v.freshnessAdj),
    location: v.location,
    rating: Math.max(3.8, (crop.rating ?? 4.5) + v.gradeAdj * 0.2),
    reviewsCount: Math.max(5, (crop.reviews_count ?? 20) - i * 15),
    farmerPrice: crop.farmer_price + v.priceAdj,
    marketPrice: crop.market_price,
    aiRecommendedPrice: crop.ai_recommended_price + Math.round(v.priceAdj * 0.5),
    farmerName: v.name,
    certificates: v.certificates,
    deliveryTime: v.deliveryTime,
  }));
}

// ─── AI Recommendation Logic ─────────────────────────────────────────────────
function getAIRecommendation(products: CompareProduct[]) {
  if (products.length < 2) return null;
  let best = products[0];
  let bestScore = 0;
  products.forEach((p) => {
    let score = 0;
    if (p.qualityGrade === "A+") score += 50;
    else if (p.qualityGrade === "A") score += 40;
    else if (p.qualityGrade === "B") score += 30;
    score += Math.max(0, 50 - p.pricePerUnit / 10);
    score += (p.aiFreshnessScore ?? 90) * 0.5;
    if (p.isOrganic) score += 15;
    score += p.rating * 5;
    if (score > bestScore) { bestScore = score; best = p; }
  });
  return {
    product: best,
    reason: `Recommended for the best balance of Grade ${best.qualityGrade} quality, ${best.aiFreshnessScore}% freshness, ₹${best.pricePerUnit}/${best.unitType} pricing, and ${best.deliveryTime} delivery from ${best.location}.`,
  };
}

// ─── Grade color helper ───────────────────────────────────────────────────────
function gradeStyle(grade: string) {
  const isPremium = grade === "A+" || grade === "A";
  return {
    background: isPremium ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
    color: isPremium ? "#059669" : "#d97706",
    border: `1px solid ${isPremium ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
  };
}

// ─── Winner detection helpers ─────────────────────────────────────────────────
function useWinners(products: CompareProduct[]) {
  return useMemo(() => {
    if (products.length < 2) return { price: "", freshness: "", rating: "", delivery: "" };
    const minPrice = Math.min(...products.map(p => p.pricePerUnit));
    const maxFreshness = Math.max(...products.map(p => p.aiFreshnessScore));
    const maxRating = Math.max(...products.map(p => p.rating));
    // delivery: shortest = earliest (simple alphabetical is wrong, use lowest number)
    const deliveryNums = products.map(p => parseFloat(p.deliveryTime.replace(/[^0-9.]/g, "")));
    const minDelivery = Math.min(...deliveryNums);
    return {
      price: products.find(p => p.pricePerUnit === minPrice)?.id ?? "",
      freshness: products.find(p => p.aiFreshnessScore === maxFreshness)?.id ?? "",
      rating: products.find(p => p.rating === maxRating)?.id ?? "",
      delivery: products.find((p, i) => deliveryNums[i] === minDelivery)?.id ?? "",
    };
  }, [products]);
}

// ─── Stat Card (hero row) ─────────────────────────────────────────────────────
function HeroStat({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; bg: string;
}) {
  return (
    <div style={{
      background: "#ffffff", borderRadius: "20px",
      border: "1px solid #e2e8f0", padding: "18px 22px",
      display: "flex", alignItems: "center", gap: "12px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flex: "1 1 150px", minWidth: 0,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "12px",
        background: bg, color, display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
        <p style={{ fontSize: "20px", fontWeight: 900, color: "#1e293b", margin: "2px 0 0", lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Certificate badge ────────────────────────────────────────────────────────
function CertBadge({ text }: { text: string }) {
  const isOrganic = /organic/i.test(text);
  const isISO = /ISO/i.test(text);
  const isGI = /GI Tag/i.test(text);
  const isExport = /export|APEDA/i.test(text);
  const color = isOrganic ? "#059669" : isGI ? "#7c3aed" : isISO ? "#0284c7" : isExport ? "#d97706" : "#475569";
  const bg = isOrganic ? "#f0fdf4" : isGI ? "#f5f3ff" : isISO ? "#f0f9ff" : isExport ? "#fffbeb" : "#f8fafc";
  const border = isOrganic ? "#bbf7d0" : isGI ? "#e9d5ff" : isISO ? "#bae6fd" : isExport ? "#fde68a" : "#e2e8f0";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "3px",
      padding: "3px 9px", borderRadius: "20px",
      fontSize: "10px", fontWeight: 700, color, background: bg, border: `1px solid ${border}`,
      whiteSpace: "nowrap",
    }}>
      {isOrganic ? "🌿" : isGI ? "📍" : isISO ? "🏅" : isExport ? "✈️" : "✓"} {text}
    </span>
  );
}

// ─── Comparison Row ───────────────────────────────────────────────────────────
function CompareRow({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#ffffff", borderRadius: "16px",
      border: "1px solid #f1f5f9",
      padding: "14px 18px", marginBottom: "10px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        marginBottom: "12px",
      }}>
        <span style={{ color: "#10b981" }}>{icon}</span>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ComparePage() {
  const { t } = useTranslation("consumer");
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const { addToCart } = useCart();

  const [comparedProducts, setComparedProducts] = useState<CompareProduct[]>([]);
  const [baseProduct, setBaseProduct] = useState<any>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Find the base product by URL param, or fall back to first DEMO crop
    const targetId = productId ?? DEMO_CROPS[0].id;
    const crop = DEMO_CROPS.find((c) => c.id === targetId) ?? DEMO_CROPS[0];
    setBaseProduct(crop);
    setRemovedIds(new Set());
    setComparedProducts(buildCompareProducts(crop));
  }, [productId]);

  const visibleProducts = comparedProducts.filter((p) => !removedIds.has(p.id));

  const handleRemove = (id: string) => {
    setRemovedIds((prev) => new Set([...prev, id]));
  };

  const aiRec = getAIRecommendation(visibleProducts);
  const winners = useWinners(visibleProducts);

  // Summary stats
  const avgPrice = visibleProducts.length
    ? Math.round(visibleProducts.reduce((s, p) => s + p.pricePerUnit, 0) / visibleProducts.length)
    : 0;
  const bestGrade = visibleProducts.some(p => p.qualityGrade === "A+") ? "A+"
    : visibleProducts.some(p => p.qualityGrade === "A") ? "A" : "B";
  const bestValue = visibleProducts.length
    ? visibleProducts.reduce((best, p) => p.pricePerUnit < best.pricePerUnit ? p : best, visibleProducts[0]).farmerName
    : "—";
  const organicCount = visibleProducts.filter(p => p.isOrganic).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ minHeight: "100vh", background: "#f8fafc", padding: "28px 0 40px" }}
    >
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "28px" }}>
        {/* Back link */}
        <Link
          href={baseProduct ? `/consumer/marketplace/${baseProduct.id}` : "/consumer/marketplace"}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontSize: "12px", fontWeight: 700, color: "#64748b",
            textDecoration: "none", marginBottom: "16px",
            padding: "6px 12px", borderRadius: "10px",
            background: "#f1f5f9", border: "1px solid #e2e8f0",
            transition: "background 0.15s",
          }}
        >
          <ArrowLeft style={{ width: 13, height: 13 }} />
          {baseProduct ? `Back to ${baseProduct.title}` : "Back to Marketplace"}
        </Link>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <h1 style={{
              fontSize: "28px", fontWeight: 900, color: "#1e293b",
              display: "flex", alignItems: "center", gap: "12px", margin: 0,
            }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 44, height: 44, borderRadius: "14px",
                background: "linear-gradient(135deg, #f3e8ff, #ede9fe)",
                border: "1px solid #e9d5ff",
              }}>
                <Scale style={{ width: 22, height: 22, color: "#7c3aed" }} />
              </span>
              {t("aiProductComparison")}
            </h1>
            {baseProduct && (
              <p style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, margin: "8px 0 0" }}>
                Comparing <strong style={{ color: "#7c3aed" }}>{baseProduct.title}</strong> from {visibleProducts.length} verified farmers — choose the best using AI insights
              </p>
            )}
          </div>
        </div>

        {/* Hero stat cards */}
        {visibleProducts.length > 0 && (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <HeroStat icon={<BarChart2 style={{ width: 18, height: 18 }} />} label="Products Compared" value={visibleProducts.length} color="#7c3aed" bg="rgba(124,58,237,0.1)" />
            <HeroStat icon={<TrendingDown style={{ width: 18, height: 18 }} />} label="Avg Price" value={`₹${avgPrice}`} color="#10b981" bg="rgba(16,185,129,0.1)" />
            <HeroStat icon={<Award style={{ width: 18, height: 18 }} />} label="Best AI Score" value={`Grade ${bestGrade}`} color="#0284c7" bg="rgba(2,132,199,0.1)" />
            <HeroStat icon={<Zap style={{ width: 18, height: 18 }} />} label="Best Value" value={bestValue.split(" ")[0]} color="#d97706" bg="rgba(217,119,6,0.1)" />
            <HeroStat icon={<Leaf style={{ width: 18, height: 18 }} />} label="Organic" value={`${organicCount}/${visibleProducts.length}`} color="#059669" bg="rgba(5,150,105,0.1)" />
          </div>
        )}
      </div>

      {/* ── AI Recommendation Banner ─────────────────────────────────────────── */}
      <AnimatePresence>
        {aiRec && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
              border: "1px solid #bbf7d0",
              borderLeft: "5px solid #10b981",
              borderRadius: "20px",
              padding: "20px 24px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              flexWrap: "wrap",
              boxShadow: "0 4px 16px rgba(16,185,129,0.1)",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: "16px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Sparkles style={{ width: 22, height: 22, color: "#fff" }} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: "11px", fontWeight: 800, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>
                🏆 {t("agrinexAiRecommendation")}
              </p>
              <p style={{ fontSize: "16px", fontWeight: 900, color: "#065f46", margin: "0 0 6px" }}>
                {aiRec.product.farmerName}
              </p>
              <p style={{ fontSize: "12px", color: "#047857", margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                {aiRec.reason}
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                {["Highest Freshness", "Best Quality", "Best Rating", "Best Value"].map(tag => (
                  <span key={tag} style={{
                    fontSize: "10px", fontWeight: 700, color: "#059669",
                    background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                    padding: "3px 10px", borderRadius: "20px",
                  }}>✓ {tag}</span>
                ))}
              </div>
            </div>
            <Link
              href={`/consumer/marketplace/${baseProduct?.id}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", borderRadius: "14px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff", fontWeight: 800, fontSize: "13px",
                textDecoration: "none", flexShrink: 0,
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
              }}
            >
              <ShoppingCart style={{ width: 14, height: 14 }} />
              {t("viewProduct")}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── No results state ─────────────────────────────────────────────────── */}
      {visibleProducts.length === 0 && (
        <div style={{
          background: "#ffffff", borderRadius: "24px",
          border: "1px solid #e2e8f0", padding: "64px 24px",
          textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <Info style={{ width: 48, height: 48, color: "#cbd5e1", margin: "0 auto 16px" }} />
          <p style={{ fontSize: "16px", fontWeight: 800, color: "#374151", margin: "0 0 8px" }}>
            {comparedProducts.length === 0
              ? "No farmers found for this product."
              : "All farmers removed from comparison."}
          </p>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 24px", fontWeight: 600 }}>
            {comparedProducts.length <= 1
              ? "Currently, no other farmers are selling this product for comparison."
              : "Add them back or go to marketplace."}
          </p>
          <Link href={baseProduct ? `/consumer/marketplace/${baseProduct.id}` : "/consumer/marketplace"}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "14px",
              background: "#f3e8ff", color: "#7c3aed",
              fontWeight: 800, fontSize: "13px", textDecoration: "none",
            }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Back to Product
          </Link>
        </div>
      )}

      {/* ── Only one farmer ───────────────────────────────────────────────────── */}
      {visibleProducts.length === 1 && comparedProducts.length === 1 && (
        <div style={{
          background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: "20px", padding: "20px 24px", marginBottom: "24px",
          display: "flex", alignItems: "flex-start", gap: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <AlertCircle style={{ width: 20, height: 20, color: "#d97706", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", margin: "0 0 4px" }}>Only one farmer available</p>
            <p style={{ fontSize: "12px", color: "#b45309", fontWeight: 600, margin: 0 }}>
              Currently, no other farmers are selling <strong>{baseProduct?.title}</strong> for comparison.
              Check back later or explore similar products in the marketplace.
            </p>
          </div>
        </div>
      )}

      {/* ── Main Comparison Layout ────────────────────────────────────────────── */}
      {visibleProducts.length >= 1 && (
        <div>
          {/* Product cards row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${visibleProducts.length}, minmax(0, 1fr))`,
            gap: "16px",
            marginBottom: "24px",
          }}>
            {visibleProducts.map((p) => {
              const isWinner = p.id === aiRec?.product.id;
              const isBestPrice = p.id === winners.price;
              const isBestFreshness = p.id === winners.freshness;
              const isBestRating = p.id === winners.rating;
              const isFastestDelivery = p.id === winners.delivery;

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.93 }}
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: isWinner ? "2px solid #10b981" : "1px solid #e2e8f0",
                    boxShadow: isWinner
                      ? "0 8px 32px rgba(16,185,129,0.15)"
                      : "0 2px 8px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    position: "relative",
                    transition: "box-shadow 0.25s, transform 0.25s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = isWinner
                      ? "0 16px 48px rgba(16,185,129,0.2)"
                      : "0 12px 32px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = isWinner
                      ? "0 8px 32px rgba(16,185,129,0.15)"
                      : "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                >
                  {/* Best Choice Ribbon */}
                  {isWinner && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0,
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff", fontSize: "10px", fontWeight: 900,
                      textAlign: "center", padding: "5px",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      🏆 Best Choice — AI Recommended
                    </div>
                  )}

                  <div style={{ padding: isWinner ? "36px 16px 16px" : "16px" }}>
                    {/* Remove button */}
                    {visibleProducts.length > 1 && (
                      <button
                        onClick={() => handleRemove(p.id)}
                        style={{
                          position: "absolute", top: isWinner ? 36 : 12, right: 12,
                          width: 28, height: 28, borderRadius: "50%",
                          background: "#fef2f2", border: "1px solid #fecaca",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "transform 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                        title="Remove from comparison"
                      >
                        <Trash2 style={{ width: 12, height: 12, color: "#ef4444" }} />
                      </button>
                    )}

                    {/* Product image */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                      <div style={{
                        width: 140, height: 140, borderRadius: "18px",
                        overflow: "hidden", background: "#f0fdf4",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        flexShrink: 0,
                        transition: "transform 0.4s",
                      }}
                        className="group"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                      >
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>🌾</div>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center", marginBottom: "10px" }}>
                      {p.isOrganic && (
                        <span style={{ padding: "3px 9px", borderRadius: "20px", fontSize: "10px", fontWeight: 800, background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}>
                          🌿 Organic
                        </span>
                      )}
                      <span style={{
                        padding: "3px 9px", borderRadius: "20px", fontSize: "10px", fontWeight: 800,
                        ...gradeStyle(p.qualityGrade),
                      }}>
                        🤖 Grade {p.qualityGrade}
                      </span>
                    </div>

                    {/* Product name */}
                    <p style={{ fontSize: "14px", fontWeight: 900, color: "#1e293b", textAlign: "center", margin: "0 0 6px", lineHeight: 1.3 }}>{p.title}</p>

                    {/* Farmer */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", justifyContent: "center", marginBottom: "4px" }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", fontWeight: 900, color: "#fff", flexShrink: 0,
                      }}>{p.farmerName[0]}</div>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#475569" }}>👨‍🌾 {p.farmerName}</span>
                      <CheckCircle style={{ width: 12, height: 12, color: "#10b981" }} />
                    </div>

                    {/* Location */}
                    <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", margin: "0 0 12px" }}>
                      <MapPin style={{ width: 10, height: 10 }} />{p.location}
                    </p>

                    {/* Price */}
                    <div style={{
                      textAlign: "center", marginBottom: "12px",
                      background: isBestPrice ? "rgba(16,185,129,0.06)" : "#f8fafc",
                      borderRadius: "12px", padding: "10px 8px",
                      border: isBestPrice ? "1px solid rgba(16,185,129,0.2)" : "1px solid #f1f5f9",
                    }}>
                      <span style={{ fontSize: "22px", fontWeight: 900, color: "#10b981" }}>₹{p.pricePerUnit}</span>
                      <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>/{p.unitType}</span>
                      {isBestPrice && (
                        <p style={{ fontSize: "10px", fontWeight: 800, color: "#059669", margin: "3px 0 0" }}>🏅 Best Price</p>
                      )}
                    </div>

                    {/* Rating */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "10px" }}>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} style={{
                            width: 12, height: 12,
                            color: "#f59e0b",
                            fill: s <= Math.round(p.rating) ? "#f59e0b" : "none",
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#374151" }}>{p.rating.toFixed(1)}</span>
                      <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>({p.reviewsCount})</span>
                      {isBestRating && <span style={{ fontSize: "10px", fontWeight: 800, color: "#f59e0b" }}>⭐ Top</span>}
                    </div>

                    {/* Winner badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center", marginBottom: "14px" }}>
                      {isBestFreshness && (
                        <span style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 800, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                          ✨ Freshest
                        </span>
                      )}
                      {isFastestDelivery && (
                        <span style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 800, background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a" }}>
                          🚀 Fastest
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Link
                        href={`/consumer/marketplace/${baseProduct?.id}`}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                          padding: "10px", borderRadius: "14px",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          color: "#fff", fontWeight: 800, fontSize: "12px",
                          textDecoration: "none",
                          boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                          transition: "transform 0.15s, box-shadow 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                      >
                        <ShoppingCart style={{ width: 13, height: 13 }} />
                        {t("buyNow")}
                      </Link>
                      <Link
                        href={`/consumer/marketplace/${baseProduct?.id}`}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                          padding: "9px", borderRadius: "14px",
                          background: "#f8fafc", border: "1px solid #e2e8f0",
                          color: "#475569", fontWeight: 700, fontSize: "12px",
                          textDecoration: "none", transition: "background 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                      >
                        <Info style={{ width: 12, height: 12 }} />
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Comparison Detail Rows ────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

            {/* Price comparison */}
            <CompareRow label="Farmer Price" icon={<TrendingDown style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <div key={p.id} style={{
                    textAlign: "center", padding: "10px",
                    borderRadius: "12px",
                    background: p.id === winners.price ? "rgba(16,185,129,0.06)" : "#f8fafc",
                    border: p.id === winners.price ? "1px solid rgba(16,185,129,0.2)" : "1px solid #f1f5f9",
                  }}>
                    <p style={{ fontSize: "17px", fontWeight: 900, color: "#10b981", margin: 0 }}>₹{p.pricePerUnit}</p>
                    <p style={{ fontSize: "10px", color: "#94a3b8", margin: "2px 0 0", fontWeight: 600 }}>/{p.unitType}</p>
                    {p.id === winners.price && <p style={{ fontSize: "10px", fontWeight: 800, color: "#059669", margin: "4px 0 0" }}>🏅 Lowest</p>}
                  </div>
                ))}
              </div>
            </CompareRow>

            {/* AI Recommended Price */}
            <CompareRow label={t("aiRecommendedPrice")} icon={<Sparkles style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <p key={p.id} style={{ textAlign: "center", fontSize: "14px", fontWeight: 800, color: "#0284c7", margin: 0 }}>
                    ₹{p.aiRecommendedPrice}/{p.unitType}
                  </p>
                ))}
              </div>
            </CompareRow>

            {/* Market Price */}
            <CompareRow label="Market Price" icon={<BarChart2 style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <p key={p.id} style={{ textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#64748b", margin: 0 }}>
                    ₹{p.marketPrice}/{p.unitType}
                  </p>
                ))}
              </div>
            </CompareRow>

            {/* AI Quality Grade */}
            <CompareRow label={t("aiQualityGrade")} icon={<Award style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <div key={p.id} style={{ textAlign: "center" }}>
                    <span style={{
                      display: "inline-block", padding: "5px 14px", borderRadius: "20px",
                      fontSize: "12px", fontWeight: 800, ...gradeStyle(p.qualityGrade),
                    }}>⭐ Grade {p.qualityGrade}</span>
                  </div>
                ))}
              </div>
            </CompareRow>

            {/* AI Freshness */}
            <CompareRow label="AI Freshness Score" icon={<Zap style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <div key={p.id} style={{ textAlign: "center" }}>
                    <div style={{
                      width: "100%", height: "6px", borderRadius: "6px",
                      background: "#f1f5f9", overflow: "hidden", marginBottom: "5px",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: "6px",
                        width: `${p.aiFreshnessScore}%`,
                        background: p.aiFreshnessScore >= 90 ? "#10b981" : p.aiFreshnessScore >= 80 ? "#f59e0b" : "#ef4444",
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: 900, color: "#0284c7", margin: 0 }}>{p.aiFreshnessScore}%</p>
                    {p.id === winners.freshness && <p style={{ fontSize: "10px", fontWeight: 800, color: "#059669", margin: "2px 0 0" }}>✨ Freshest</p>}
                  </div>
                ))}
              </div>
            </CompareRow>

            {/* Organic */}
            <CompareRow label={t("organic")} icon={<Leaf style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <div key={p.id} style={{ textAlign: "center" }}>
                    {p.isOrganic
                      ? <span style={{ fontSize: "13px", fontWeight: 800, color: "#059669" }}>🌿 Yes</span>
                      : <span style={{ fontSize: "13px", fontWeight: 700, color: "#cbd5e1" }}>{t("no")}</span>}
                  </div>
                ))}
              </div>
            </CompareRow>

            {/* Delivery Time */}
            <CompareRow label="Delivery Time" icon={<Truck style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <div key={p.id} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", margin: 0 }}>🚚 {p.deliveryTime}</p>
                    {p.id === winners.delivery && <p style={{ fontSize: "10px", fontWeight: 800, color: "#d97706", margin: "2px 0 0" }}>🚀 Fastest</p>}
                  </div>
                ))}
              </div>
            </CompareRow>

            {/* Shelf Life */}
            <CompareRow label="Shelf Life" icon={<Clock style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <p key={p.id} style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#374151", margin: 0 }}>
                    {p.shelfLifeDays} {t("days")}
                  </p>
                ))}
              </div>
            </CompareRow>

            {/* Stock */}
            <CompareRow label={t("availableStock")} icon={<Shield style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <p key={p.id} style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#374151", margin: 0 }}>
                    {p.quantityAvailable} {p.unitType}
                  </p>
                ))}
              </div>
            </CompareRow>

            {/* Rating row */}
            <CompareRow label="Rating" icon={<Star style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <div key={p.id} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "#374151", margin: 0 }}>
                      ⭐ {p.rating.toFixed(1)} <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>({p.reviewsCount})</span>
                    </p>
                    {p.id === winners.rating && <p style={{ fontSize: "10px", fontWeight: 800, color: "#f59e0b", margin: "2px 0 0" }}>⭐ Highest</p>}
                  </div>
                ))}
              </div>
            </CompareRow>

            {/* Certifications */}
            <CompareRow label="Certifications" icon={<Shield style={{ width: 14, height: 14 }} />}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleProducts.length}, 1fr)`, gap: "12px" }}>
                {visibleProducts.map(p => (
                  <div key={p.id} style={{ display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center" }}>
                    {p.certificates.map((c, i) => <CertBadge key={i} text={c} />)}
                  </div>
                ))}
              </div>
            </CompareRow>

          </div>
        </div>
      )}
    </motion.div>
  );
}