"use client";

/**
 * @fileoverview AI Crop Comparison Page — /consumer/compare
 * Allows side-by-side comparison of up to 3 crops or farmers,
 * evaluating grade, price, freshness, shelf life, and AI recommendations.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Star, MapPin, Leaf, Shield, Package, Trash2,
  Sparkles, Plus, Scale, Award, Clock, AlertCircle, ShoppingCart, Check,
} from "lucide-react";
import { DEMO_CROPS } from "@/lib/demoData";
import { useWishlist } from "@/hooks/useWishlist";

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { wishlist } = useWishlist();

  // Load initial selections from wishlist or first 2 demo crops if empty
  useEffect(() => {
    if (wishlist.length >= 2) {
      setSelectedIds(wishlist.slice(0, 3).map((item) => item.id));
    } else {
      setSelectedIds(DEMO_CROPS.slice(0, 2).map((c) => c.id));
    }
  }, [wishlist]);

  const handleRemoveSelection = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleAddSelection = (id: string) => {
    if (selectedIds.length >= 3) return;
    if (selectedIds.includes(id)) return;
    setSelectedIds((prev) => [...prev, id]);
  };

  // Get selected product details
  const comparedProducts = selectedIds.map((id) => {
    const crop = DEMO_CROPS.find((c) => c.id === id);
    if (!crop) return null;
    return {
      id: crop.id,
      title: crop.title,
      category: crop.category,
      pricePerUnit: crop.price_per_unit,
      unitType: crop.unit_type,
      quantityAvailable: crop.quantity_available,
      imageUrl: crop.image_url,
      qualityGrade: crop.quality_grade,
      isOrganic: crop.is_organic,
      harvestDate: crop.harvest_date,
      shelfLifeDays: crop.shelf_life_days,
      aiConfidenceScore: crop.ai_confidence_score,
      aiFreshnessScore: crop.ai_freshness_score,
      location: crop.location,
      rating: crop.rating,
      reviewsCount: crop.reviews_count,
      farmerPrice: crop.farmer_price,
      marketPrice: crop.market_price,
      aiRecommendedPrice: crop.ai_recommended_price,
      farmerName: id === "crop-001" ? "Rajesh Kumar" : id === "crop-002" ? "Suresh Patil" : id === "crop-003" ? "Muthu Raman" : id === "crop-004" ? "Pradeep Joshi" : "Abdul Rashid",
    };
  }).filter(Boolean) as any[];

  // AI Recommendation Logic for the best option
  const getAIRecommendation = () => {
    if (comparedProducts.length < 2) return null;
    // Simple heuristic: lowest price with highest grade
    let bestProduct = comparedProducts[0];
    let bestScore = 0;

    comparedProducts.forEach((p) => {
      let score = 0;
      if (p.qualityGrade === "A+") score += 50;
      else if (p.qualityGrade === "A") score += 40;
      else if (p.qualityGrade === "B") score += 30;

      // Price factor (lower is better, scaled relative to 500)
      score += Math.max(0, 50 - (p.pricePerUnit / 10));

      // Freshness factor
      score += (p.aiFreshnessScore ?? 90) * 0.5;

      // Organic bonus
      if (p.isOrganic) score += 15;

      if (score > bestScore) {
        bestScore = score;
        bestProduct = p;
      }
    });

    return {
      product: bestProduct,
      reason: `Recommended for best balance of high AI grade (${bestProduct.qualityGrade}), premium freshness (${bestProduct.aiFreshnessScore}%), and competitive direct farm pricing at ₹${bestProduct.pricePerUnit}/${bestProduct.unitType}.`,
    };
  };

  const aiRec = getAIRecommendation();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/consumer/marketplace" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2 text-xs">
            <ArrowLeft className="w-3 h-3" /> Back to Marketplace
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-purple-400" />
            AI Product Comparison
          </h1>
          <p className="text-slate-400 text-sm mt-1">Compare up to 3 farmers to find the best quality and value</p>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {aiRec && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-emerald-500/30"
          style={{ background: "rgba(16,185,129,0.06)", borderLeft: "4px solid #10b981" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">AgriNex AI Recommendation</h3>
              <p className="text-emerald-400 text-xs font-semibold mt-0.5">Best Option: {aiRec.product.title}</p>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">{aiRec.reason}</p>
            </div>
          </div>
          <Link href={`/consumer/marketplace/${aiRec.product.id}`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            View Best Choice
          </Link>
        </motion.div>
      )}

      {/* Select more dropdown/triggers if space available */}
      {comparedProducts.length < 3 && (
        <div className="glass-panel rounded-2xl p-4 mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-slate-400 text-xs mr-2 font-medium">Add to comparison:</span>
          {DEMO_CROPS.filter((c) => !selectedIds.includes(c.id)).slice(0, 5).map((c) => (
            <button key={c.id} onClick={() => handleAddSelection(c.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 border border-white/5">
              <Plus className="w-3 h-3 text-emerald-400" />
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Side-by-side Table Layout */}
      {comparedProducts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Please select products to compare</p>
          <Link href="/consumer/marketplace" className="mt-4 inline-block text-emerald-400 text-sm hover:underline">
            Go to Marketplace
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-left text-xs font-semibold text-slate-500 w-48">Feature</th>
                {comparedProducts.map((p) => (
                  <th key={p.id} className="p-4 text-left min-w-[200px] relative">
                    <button onClick={() => handleRemoveSelection(p.id)}
                      className="absolute top-2 right-2 p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-12 h-12 rounded-xl overflow-hidden mb-3" style={{ background: "rgba(16,185,129,0.08)" }}>
                      {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <p className="text-white text-sm font-bold leading-tight line-clamp-1">{p.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">by {p.farmerName}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price row */}
              <tr className="border-b border-white/5">
                <td className="p-4 text-xs font-semibold text-slate-400">Price</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-sm font-bold text-emerald-400">
                    ₹{p.pricePerUnit} <span className="text-slate-500 text-xs font-normal">/ {p.unitType}</span>
                  </td>
                ))}
              </tr>
              {/* Quality Grade */}
              <tr className="border-b border-white/5">
                <td className="p-4 text-xs font-semibold text-slate-400">AI Quality Grade</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                      style={{
                        background: p.qualityGrade === "A+" || p.qualityGrade === "A" ? "rgba(16,185,129,0.15)" : "rgba(251,191,36,0.15)",
                        color: p.qualityGrade === "A+" || p.qualityGrade === "A" ? "#34d399" : "#fbbf24",
                        border: `1px solid ${p.qualityGrade === "A+" || p.qualityGrade === "A" ? "rgba(16,185,129,0.3)" : "rgba(251,191,36,0.3)"}`
                      }}>
                      ⭐ Grade {p.qualityGrade}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Freshness score */}
              <tr className="border-b border-white/5">
                <td className="p-4 text-xs font-semibold text-slate-400">Freshness Score</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-sm font-semibold text-sky-400">
                    {p.aiFreshnessScore ?? 95}%
                  </td>
                ))}
              </tr>
              {/* Organic */}
              <tr className="border-b border-white/5">
                <td className="p-4 text-xs font-semibold text-slate-400">Organic</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-sm">
                    {p.isOrganic ? <span className="text-emerald-400">Yes ✓</span> : <span className="text-slate-500">No</span>}
                  </td>
                ))}
              </tr>
              {/* Shelf life */}
              <tr className="border-b border-white/5">
                <td className="p-4 text-xs font-semibold text-slate-400">Shelf Life</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-white">
                    {p.shelfLifeDays ?? 14} Days
                  </td>
                ))}
              </tr>
              {/* Location */}
              <tr className="border-b border-white/5">
                <td className="p-4 text-xs font-semibold text-slate-400">Location</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-slate-300">
                    <MapPin className="w-3 h-3 text-slate-500 inline mr-1" />
                    {p.location}
                  </td>
                ))}
              </tr>
              {/* Rating */}
              <tr className="border-b border-white/5">
                <td className="p-4 text-xs font-semibold text-slate-400">Rating</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-white">
                    ⭐ {p.rating ?? 4.8} <span className="text-slate-500">({p.reviewsCount ?? 20} reviews)</span>
                  </td>
                ))}
              </tr>
              {/* Recommended Price comparison */}
              <tr className="border-b border-white/5">
                <td className="p-4 text-xs font-semibold text-slate-400">AI Recommended Price</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-sky-400">
                    ₹{p.aiRecommendedPrice ?? p.pricePerUnit}/{p.unitType}
                  </td>
                ))}
              </tr>
              {/* Action row */}
              <tr>
                <td className="p-4"></td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4">
                    <Link href={`/consumer/marketplace/${p.id}`}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.1))", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399" }}>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Buy Now
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
