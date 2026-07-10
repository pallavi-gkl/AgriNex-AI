"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview AI Crop Comparison Page — /consumer/compare
 * Compares the SAME product sold by different farmers.
 * Never compares unrelated products.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, MapPin, Trash2,
  Sparkles, Scale, AlertCircle, ShoppingCart, Info,
} from "lucide-react";
import { DEMO_CROPS } from "@/lib/demoData";

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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ComparePage() {
  const { t } = useTranslation("consumer");
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

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
  const { t } = useTranslation("consumer");
    setRemovedIds((prev) => new Set([...prev, id]));
  };

  const aiRec = getAIRecommendation(visibleProducts);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <Link
            href={baseProduct ? `/consumer/marketplace/${baseProduct.id}` : "/consumer/marketplace"}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-2 text-xs font-bold no-underline"
          >
            <ArrowLeft className="w-3 h-3" />
            {baseProduct ? `Back to ${baseProduct.title}` : "Back to Marketplace"}
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Scale className="w-6 h-6 text-purple-600" />
            {t("aiProductComparison")}
          </h1>
          {baseProduct && (
            <p className="text-slate-500 text-sm mt-1 font-semibold">
              Comparing <span className="text-purple-600 font-bold">{baseProduct.title}</span> from different farmers
            </p>
          )}
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {aiRec && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-emerald-200 bg-emerald-50/40 text-left shadow-sm"
          style={{ borderLeft: "4px solid #10b981" }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-slate-800 font-bold text-sm">{t("agrinexAiRecommendation")}</h3>
              <p className="text-emerald-700 text-xs font-bold mt-0.5">Best Farmer: {aiRec.product.farmerName}</p>
              <p className="text-slate-600 text-xs mt-1.5 leading-relaxed font-semibold">{aiRec.reason}</p>
            </div>
          </div>
          <Link
            href={`/consumer/marketplace/${baseProduct?.id}`}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shrink-0 border-0 no-underline"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}
          >
            {t("viewProduct")}
          </Link>
        </motion.div>
      )}

      {/* No results state */}
      {visibleProducts.length === 0 && (
        <div className="rounded-2xl p-12 text-center border border-slate-200 premium-card shadow-sm">
          <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 text-base font-bold mb-1">
            {comparedProducts.length === 0
              ? "No farmers found for this product."
              : "All farmers removed from comparison."}
          </p>
          <p className="text-slate-400 text-sm font-semibold mb-4">
            {comparedProducts.length <= 1
              ? "Currently, no other farmers are selling this product for comparison."
              : "Add them back or go to marketplace."}
          </p>
          <Link href={baseProduct ? `/consumer/marketplace/${baseProduct.id}` : "/consumer/marketplace"}
            className="mt-2 inline-block text-purple-600 text-sm hover:underline font-bold">
            ← Back to Product
          </Link>
        </div>
      )}

      {/* Only one farmer — not enough to compare */}
      {visibleProducts.length === 1 && comparedProducts.length === 1 && (
        <div className="rounded-2xl p-8 mb-6 border border-amber-200 bg-amber-50/40 text-left shadow-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-bold">Only one farmer available</p>
            <p className="text-amber-700 text-xs mt-1 font-semibold">
              Currently, no other farmers are selling <strong>{baseProduct?.title}</strong> for comparison.
              Check back later or explore similar products in the marketplace.
            </p>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {visibleProducts.length >= 1 && (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl premium-card shadow-sm p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-48">{t("feature")}</th>
                {visibleProducts.map((p) => (
                  <th key={p.id} className="p-4 text-center min-w-[200px] relative align-top">
                    {visibleProducts.length > 1 && (
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-rose-50 transition-colors border-0 cursor-pointer"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Product image — always the same product */}
                    <div className="w-full flex justify-center mb-3">
                      <div style={{
                        width: "100%", maxWidth: "160px", height: "160px",
                        borderRadius: "16px", overflow: "hidden",
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.title} style={{
                            width: "100%", height: "100%",
                            objectFit: "cover", objectPosition: "center", display: "block",
                          }} />
                        ) : (
                          <span style={{ fontSize: "40px" }}>🌾</span>
                        )}
                      </div>
                    </div>
                    {/* Same product name, different farmer */}
                    <p className="text-slate-800 text-sm font-extrabold leading-tight text-center">{p.title}</p>
                    <p className="text-purple-600 text-xs mt-0.5 font-bold text-center">👨‍🌾 {p.farmerName}</p>
                    <p className="text-slate-400 text-xs mt-0.5 font-semibold text-center">
                      <MapPin className="w-3 h-3 inline mr-0.5" />{p.location}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>

              {/* Price */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Farmer Price</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-sm font-extrabold text-emerald-600 text-center">
                    ₹{p.pricePerUnit} <span className="text-slate-400 text-xs font-normal">/ {p.unitType}</span>
                  </td>
                ))}
              </tr>

              {/* AI Recommended Price */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("aiRecommendedPrice")}</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-sky-700 font-bold font-mono text-center">
                    ₹{p.aiRecommendedPrice}/{p.unitType}
                  </td>
                ))}
              </tr>

              {/* Market Price */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Market Price</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-slate-600 font-bold text-center">
                    ₹{p.marketPrice}/{p.unitType}
                  </td>
                ))}
              </tr>

              {/* AI Quality Grade */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("aiQualityGrade")}</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={gradeStyle(p.qualityGrade)}>
                      ⭐ Grade {p.qualityGrade}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Freshness */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Freshness Score</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-sm font-extrabold text-sky-700 text-center">
                    {p.aiFreshnessScore}%
                  </td>
                ))}
              </tr>

              {/* Organic */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("organic")}</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-sm font-bold text-center">
                    {p.isOrganic
                      ? <span className="text-emerald-600 font-extrabold">Yes ✓</span>
                      : <span className="text-slate-400">{t("no")}</span>}
                  </td>
                ))}
              </tr>

              {/* Certifications */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Certifications</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      {p.certificates.map((c, i) => (
                        <span key={i} className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">{c}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Shelf Life */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Shelf Life</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-slate-700 font-bold text-center">
                    {p.shelfLifeDays} {t("days")}
                  </td>
                ))}
              </tr>

              {/* Available Quantity */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("availableStock")}</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-slate-700 font-bold text-center">
                    {p.quantityAvailable} {p.unitType}
                  </td>
                ))}
              </tr>

              {/* Delivery Time */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Time</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-slate-700 font-bold text-center">
                    🚚 {p.deliveryTime}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</td>
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-slate-700 font-bold text-center">
                    ⭐ {p.rating.toFixed(1)} <span className="text-slate-400 font-semibold">({p.reviewsCount} reviews)</span>
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr>
                <td className="p-4" />
                {visibleProducts.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <Link
                      href={`/consumer/marketplace/${baseProduct?.id}`}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 no-underline cursor-pointer border-0"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-white" />
                      {t("buyNow")}
                    </Link>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      )}

    </motion.div>
  );
}