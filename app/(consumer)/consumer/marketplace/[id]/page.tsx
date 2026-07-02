"use client";

/**
 * @fileoverview Product Detail Page — /consumer/marketplace/[id]
 * Phase 9: Full premium product detail with AI Shopping Assistant,
 * image gallery, farmer profile, traceability timeline, nutrition info,
 * QR code, Digital Crop Passport, and Add to Cart.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Star, MapPin, Leaf, Shield, Package, Truck, Clock,
  Heart, ShoppingCart, Plus, Minus, Sparkles, ChevronLeft,
  ChevronRight, ZoomIn, Award, Thermometer, Droplets, Calendar,
  BarChart2, CheckCircle2, AlertCircle, Loader2, Send, Bot,
  QrCode, Globe, TrendingUp, Scale, Zap, User, Phone,
} from "lucide-react";
import { useMarketplaceProducts } from "@/hooks/useProducts";
import { useCreateOrder } from "@/hooks/useOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/lib/supabase";
import { DEMO_CROPS } from "@/lib/demoData";
import OrderDialog from "@/components/consumer/marketplace/OrderDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage { role: "user" | "ai"; text: string; }

// ─── Grade config ─────────────────────────────────────────────────────────────
const GRADE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  "A+": { color: "#10b981", bg: "rgba(16,185,129,0.15)", label: "Premium" },
  "A":  { color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Excellent" },
  "B":  { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", label: "Good" },
  "C":  { color: "#fb923c", bg: "rgba(251,146,60,0.12)", label: "Average" },
  "D":  { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "Below Avg" },
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS = {
  pending:          { label: "Pending",         color: "#fbbf24" },
  accepted:         { label: "Accepted",         color: "#34d399" },
  quality_verified: { label: "Quality Verified", color: "#c084fc" },
  dispatched:       { label: "In Transit",       color: "#38bdf8" },
  delivered:        { label: "Delivered",        color: "#4ade80" },
  cancelled:        { label: "Cancelled",        color: "#f87171" },
};

// ─── Quick questions for AI assistant ─────────────────────────────────────────
const QUICK_QUESTIONS = [
  "Why should I buy this?",
  "How fresh is this product?",
  "Is the price fair?",
  "What are the health benefits?",
  "Suggest some recipes",
  "How to store this properly?",
  "Is there a better alternative?",
];

// ─── Nutrition data by category ───────────────────────────────────────────────
const NUTRITION_BY_CATEGORY: Record<string, any> = {
  "Grains": { calories: 130, protein: "2.7g", carbs: "28g", fiber: "0.4g", fat: "0.3g", vitamin: "B vitamins", benefit: "Energy, digestive health" },
  "Grains & Cereals": { calories: 130, protein: "2.7g", carbs: "28g", fiber: "0.4g", fat: "0.3g", vitamin: "B vitamins", benefit: "Energy, digestive health" },
  "Fruits": { calories: 60, protein: "0.9g", carbs: "15g", fiber: "2.4g", fat: "0.2g", vitamin: "C, A", benefit: "Immunity, antioxidants" },
  "Vegetables": { calories: 25, protein: "1.8g", carbs: "4.5g", fiber: "2.1g", fat: "0.1g", vitamin: "C, K, A", benefit: "Immunity, bone health" },
  "Leafy Greens": { calories: 20, protein: "2.2g", carbs: "3.1g", fiber: "2.4g", fat: "0.4g", vitamin: "K, A, C, Folate", benefit: "Bone health, iron source" },
  "Leafy Vegetables": { calories: 20, protein: "2.2g", carbs: "3.1g", fiber: "2.4g", fat: "0.4g", vitamin: "K, A, C", benefit: "Bone health, iron" },
  "Spices": { calories: 15, protein: "1.2g", carbs: "2.8g", fiber: "3.5g", fat: "0.4g", vitamin: "Curcumin, antioxidants", benefit: "Anti-inflammatory, antioxidant" },
  "Spices & Herbs": { calories: 15, protein: "1.2g", carbs: "2.8g", fiber: "3.5g", fat: "0.4g", vitamin: "Curcumin, antioxidants", benefit: "Anti-inflammatory" },
  "Pulses": { calories: 116, protein: "9g", carbs: "20g", fiber: "8g", fat: "0.5g", vitamin: "B6, Folate, Iron", benefit: "Protein, digestive health" },
  "Dairy": { calories: 61, protein: "3.2g", carbs: "4.7g", fiber: "0g", fat: "3.3g", vitamin: "D, B12, Calcium", benefit: "Bone health, immunity" },
};

// ─── Traceability Timeline ────────────────────────────────────────────────────
function TraceabilityStep({ step, isLast }: { step: { label: string; date: string; icon: string; done: boolean }; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all ${step.done ? "scale-110" : "opacity-40"}`}
          style={{ background: step.done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${step.done ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}` }}>
          {step.icon}
        </div>
        {!isLast && <div className="w-0.5 flex-1 mt-1" style={{ background: step.done ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)" }} />}
      </div>
      <div className="pb-4 min-w-0">
        <p className={`text-sm font-medium ${step.done ? "text-white" : "text-slate-500"}`}>{step.label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{step.date}</p>
      </div>
    </div>
  );
}

// ─── AI Chat Message ──────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${msg.role === "ai" ? "text-emerald-400" : "text-white"}`}
        style={{ background: msg.role === "ai" ? "rgba(16,185,129,0.2)" : "rgba(139,92,246,0.2)" }}>
        {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-3 h-3" />}
      </div>
      <div className={`max-w-xs px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
        msg.role === "ai" ? "text-slate-200 rounded-tl-none" : "text-white rounded-tr-none"
      }`}
        style={{
          background: msg.role === "ai" ? "rgba(16,185,129,0.08)" : "rgba(139,92,246,0.15)",
          border: `1px solid ${msg.role === "ai" ? "rgba(16,185,129,0.15)" : "rgba(139,92,246,0.2)"}`,
        }}
        dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [cartAdded, setCartAdded] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "ai", text: "👋 Hi! I'm your AI Shopping Assistant. I can help you decide if this product is right for you. Ask me anything!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { mutate: createOrder, isPending: isCheckingOut } = useCreateOrder();
  const [orderOpen, setOrderOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [qrPattern, setQrPattern] = useState<boolean[]>([
    true, false, true, false, true,
    false, true, false, true, false,
    true, true, false, false, true,
    false, false, true, true, false,
    true, false, true, false, true
  ]);

  useEffect(() => {
    setMounted(true);
    setQrPattern(Array.from({ length: 25 }, () => Math.random() > 0.5));
  }, []);

  // Fetch product — try Supabase first, then demo data
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        // Try Supabase
        const { data, error } = (await supabase
          .from("products")
          .select(`*, farmer:profiles!products_farmer_id_fkey(id, full_name, avatar_url, is_verified, trust_score, phone_number, address, location_lat, location_lng)`)
          .eq("id", productId)
          .maybeSingle()) as any;

        if (!error && data) {
          // Normalize to camelCase
          setProduct({
            id: data.id,
            title: data.title,
            description: data.description,
            category: data.category,
            pricePerUnit: data.price_per_unit,
            unitType: data.unit_type,
            quantityAvailable: data.quantity_available,
            imageUrl: data.image_url,
            images: [data.image_url].filter(Boolean),
            qualityGrade: data.quality_grade,
            qualityReport: data.quality_report as any,
            recommendedPrice: data.recommended_price,
            traceabilityCode: data.traceability_code,
            isActive: data.is_active,
            createdAt: data.created_at,
            farmer: data.farmer ? {
              id: (data.farmer as any).id,
              fullName: (data.farmer as any).full_name,
              avatarUrl: (data.farmer as any).avatar_url,
              isVerified: (data.farmer as any).is_verified,
              trustScore: (data.farmer as any).trust_score,
              phone: (data.farmer as any).phone_number,
              address: (data.farmer as any).address,
            } : null,
          });
        } else {
          // Fallback to demo data
          const demo = DEMO_CROPS.find((c) => c.id === productId);
          if (demo) {
            setProduct({
              id: demo.id,
              title: demo.title,
              description: demo.description,
              category: demo.category,
              pricePerUnit: demo.price_per_unit,
              unitType: demo.unit_type,
              quantityAvailable: demo.quantity_available,
              imageUrl: demo.image_url,
              images: demo.images || [demo.image_url],
              qualityGrade: demo.quality_grade,
              isOrganic: demo.is_organic,
              harvestDate: demo.harvest_date,
              shelfLifeDays: demo.shelf_life_days,
              aiConfidenceScore: demo.ai_confidence_score,
              aiFreshnessScore: demo.ai_freshness_score,
              traceabilityCode: demo.traceability_code,
              certificates: demo.certificates,
              location: demo.location,
              marketPrice: demo.market_price,
              aiRecommendedPrice: demo.ai_recommended_price,
              rating: demo.rating,
              reviewsCount: demo.reviews_count,
              storageCondition: demo.storage_condition,
              storageTemp: demo.storage_temp,
              farmer: {
                id: `farmer-${demo.id}`,
                fullName: getDemoFarmerForCrop(demo.id),
                isVerified: true,
                trustScore: 4.9,
                phone: "+91 98765 43210",
                address: demo.location,
              },
            });
          }
        }
      } catch (err) {
        console.error("Product load error:", err);
        // Fallback
        const demo = DEMO_CROPS.find((c) => c.id === productId);
        if (demo) setProduct({ ...demo });
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  function getDemoFarmerForCrop(id: string) {
    const map: Record<string, string> = {
      "crop-001": "Rajesh Kumar (Haryana)",
      "crop-002": "Suresh Patil (Maharashtra)",
      "crop-003": "Muthu Raman (Tamil Nadu)",
      "crop-004": "Pradeep Joshi (Pune)",
      "crop-005": "Abdul Rashid (Kashmir)",
    };
    return map[id] || "Verified Farmer";
  }

  // ── AI Chat ───────────────────────────────────────────────────────────────
  async function sendChat(question: string) {
    if (!question.trim() || chatLoading) return;
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai/shopping-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          product: {
            title: product?.title,
            category: product?.category,
            pricePerUnit: product?.pricePerUnit,
            unitType: product?.unitType,
            qualityGrade: product?.qualityGrade,
            freshnessScore: product?.aiFreshnessScore,
            farmerName: product?.farmer?.fullName,
            location: product?.location || product?.farmer?.address,
            isOrganic: product?.isOrganic,
            quantityAvailable: product?.quantityAvailable,
            harvestDate: product?.harvestDate,
            shelfLifeDays: product?.shelfLifeDays,
            certificates: product?.certificates,
            marketPrice: product?.marketPrice,
            aiRecommendedPrice: product?.aiRecommendedPrice,
          },
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "ai", text: data.answer ?? "Sorry, I couldn't answer that right now." }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "ai", text: "⚠️ AI assistant temporarily unavailable. Please check your internet connection." }]);
    }
    setChatLoading(false);
  }

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleBuyNow = async () => {
    setOrderError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/signin"); return; }
      const { data: profile } = await supabase.from("profiles").select("address").eq("id", user.id).maybeSingle();
      createOrder({
        farmerId: product.farmer?.id ?? "",
        totalAmount: product.pricePerUnit * quantity,
        deliveryAddress: (profile as any)?.address ?? "India",
        items: [{ productId: product.id, quantity, priceAtPurchase: product.pricePerUnit }],
      }, {
        onSuccess: () => { setOrderPlaced(true); setTimeout(() => router.push("/consumer/orders"), 2000); },
        onError: (err: any) => setOrderError(err.message ?? "Order failed."),
      });
    } catch (err: any) {
      setOrderError(err.message ?? "Order failed.");
    }
  };

  // ── Build traceability timeline ────────────────────────────────────────────
  const buildTimeline = () => {
    const p = product;
    const fmt = (d: string | null | undefined) => {
      if (!mounted) return d ? d.substring(0, 10) : "Recent";
      const parsed = d ? new Date(d) : new Date();
      return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };
    return [
      { label: "Seed Sowing", date: fmt(p.productionDate ?? p.production_date ?? null), icon: "🌱", done: true },
      { label: "Cultivation Period", date: "Monitored with AI sensors", icon: "🌾", done: true },
      { label: "AI Quality Inspection", date: `Grade ${p.qualityGrade} — AI Confidence ${p.aiConfidenceScore ?? 95}%`, icon: "🤖", done: true },
      { label: "Harvest", date: fmt(p.harvestDate ?? p.harvest_date ?? null), icon: "✂️", done: true },
      { label: "Farmer Packaging", date: "Hygienic packing with AgriNex certified materials", icon: "📦", done: true },
      { label: "Listed on AgriNex", date: fmt(p.createdAt ?? p.created_at ?? null), icon: "🛒", done: true },
      { label: "Your Delivery", date: "Est. 24–48 hours after order", icon: "🏠", done: false },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
          <p className="text-slate-400">Product not found</p>
          <Link href="/consumer/marketplace" className="mt-4 inline-flex items-center gap-2 text-emerald-400 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const grade = product.qualityGrade ?? product.quality_grade ?? "B";
  const gradeCfg = GRADE_CONFIG[grade] ?? GRADE_CONFIG["B"];
  const nutrition = NUTRITION_BY_CATEGORY[product.category] ?? NUTRITION_BY_CATEGORY["Vegetables"];
  const wishlistActive = isInWishlist(product.id);
  const timeline = buildTimeline();
  const images = product.images?.filter(Boolean) ?? [product.imageUrl].filter(Boolean);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Back button */}
      <Link href="/consumer/marketplace"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* ── Image Gallery ─────────────────────────────────────────────────── */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden group"
            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.05))" }}>
            {images.length > 0 ? (
              <>
                <img src={images[activeImage]} alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                {/* Zoom icon */}
                <div className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf className="w-24 h-24 text-emerald-400/20" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {(product.isOrganic || product.is_organic) && (
                <span className="px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(74,222,128,0.9)", color: "#052e16" }}>🌿 Organic</span>
              )}
              <span className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{ background: gradeCfg.bg, color: gradeCfg.color, border: `1px solid ${gradeCfg.color}40`, backdropFilter: "blur(8px)" }}>
                ⭐ Grade {grade}
              </span>
            </div>
          </div>

          {/* Thumbnail row */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all ${activeImage === i ? "ring-2 ring-emerald-400" : "opacity-50 hover:opacity-80"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ──────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md text-xs text-slate-400"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {product.category}
              </span>
              {product.traceabilityCode && (
                <span className="px-2 py-0.5 rounded-md text-xs text-amber-400 font-mono"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  🔗 {product.traceabilityCode}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">{product.title}</h1>
            {product.description && (
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4"
                    style={{ color: i < Math.round(product.rating) ? "#fbbf24" : "#1e293b" }}
                    fill={i < Math.round(product.rating) ? "#fbbf24" : "none"} />
                ))}
              </div>
              <span className="text-white font-semibold text-sm">{product.rating}</span>
              {product.reviewsCount && (
                <span className="text-slate-500 text-xs">({product.reviewsCount} reviews)</span>
              )}
            </div>
          )}

          {/* AI Quality Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel rounded-xl p-3 text-center">
              <div className="text-lg font-bold" style={{ color: gradeCfg.color }}>Grade {grade}</div>
              <div className="text-slate-500 text-xs mt-0.5">AI Quality</div>
            </div>
            <div className="glass-panel rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-sky-400">{product.aiFreshnessScore ?? 95}%</div>
              <div className="text-slate-500 text-xs mt-0.5">Freshness</div>
            </div>
            <div className="glass-panel rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-purple-400">{product.aiConfidenceScore ?? 94}%</div>
              <div className="text-slate-500 text-xs mt-0.5">AI Confidence</div>
            </div>
          </div>

          {/* Price */}
          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-end gap-3 mb-3">
              <div>
                <span className="text-3xl font-bold text-emerald-400">₹{product.pricePerUnit}</span>
                <span className="text-slate-400 text-sm ml-1">/ {product.unitType}</span>
              </div>
              {product.marketPrice && (
                <div className="text-xs text-slate-500 mb-1">
                  <span className="line-through">Market ₹{product.marketPrice}</span>
                  <span className="ml-2 text-emerald-400">
                    Save ₹{product.marketPrice - product.pricePerUnit}
                  </span>
                </div>
              )}
            </div>
            {product.aiRecommendedPrice && (
              <div className="flex items-center gap-2 text-xs mb-3"
                style={{ color: "#38bdf8" }}>
                <Sparkles className="w-3.5 h-3.5" />
                AI Recommended: ₹{product.aiRecommendedPrice}/{product.unitType}
              </div>
            )}

            {/* Quantity picker */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-slate-400 text-sm">Quantity:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="text-white font-mono w-12 text-center text-sm">{quantity} {product.unitType}</span>
                <button onClick={() => setQuantity((q) => Math.min(q + 1, product.quantityAvailable ?? 999))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
              <span className="text-slate-500 text-xs">
                Total: <span className="text-white font-semibold">₹{(product.pricePerUnit * quantity).toFixed(0)}</span>
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOrderOpen(true)}
                id="buy-now-btn"
                className="flex-1 py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}>
                <ShoppingCart className="w-4 h-4" />Buy Now
              </button>
              <button onClick={() => wishlistActive ? removeFromWishlist(product.id) : addToWishlist({
                  id: product.id, title: product.title, pricePerUnit: product.pricePerUnit,
                  unitType: product.unitType, imageUrl: product.imageUrl, qualityGrade: product.qualityGrade,
                  farmerName: product.farmer?.fullName, farmerId: product.farmer?.id, category: product.category,
                })}
                id="wishlist-btn"
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: wishlistActive ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${wishlistActive ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
                }}>
                <Heart className={`w-5 h-5 ${wishlistActive ? "text-red-400 fill-red-400" : "text-white/60"}`} />
              </button>
            </div>

            {orderError && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{orderError}
              </div>
            )}
          </div>

          {/* Delivery info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel rounded-xl p-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <p className="text-white text-xs font-medium">Free Delivery</p>
                <p className="text-slate-500 text-[11px]">24–48 hrs farm-to-door</p>
              </div>
            </div>
            <div className="glass-panel rounded-xl p-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-white text-xs font-medium">Quality Guarantee</p>
                <p className="text-slate-500 text-[11px]">AI-verified quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom sections grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col: Farmer + Certificates */}
        <div className="space-y-5">
          {/* Farmer Profile */}
          {product.farmer && (
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                Farmer Profile
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  {product.farmer.fullName?.charAt(0) || "F"}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{product.farmer.fullName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {product.farmer.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                {product.farmer.trustScore && (
                  <div className="flex items-center justify-between">
                    <span>Trust Score</span>
                    <span className="text-amber-400 font-semibold">⭐ {product.farmer.trustScore}/5</span>
                  </div>
                )}
                {(product.location || product.farmer.address) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {product.location || product.farmer.address}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certificates */}
          {product.certificates?.length > 0 && (
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Certificates
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.certificates.map((cert: string, i: number) => (
                  <span key={i} className="px-2 py-1 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}>
                    🏅 {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Storage Info */}
          {product.storageCondition && (
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-400" />
                Storage Guide
              </h3>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-start gap-2">
                  <Thermometer className="w-3 h-3 shrink-0 mt-0.5 text-blue-400" />
                  <span>{product.storageTemp}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Droplets className="w-3 h-3 shrink-0 mt-0.5 text-sky-400" />
                  <span>{product.storageCondition}</span>
                </div>
                {product.shelfLifeDays && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-3 h-3 shrink-0 mt-0.5 text-purple-400" />
                    <span>Shelf life: {product.shelfLifeDays} days</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Middle col: Nutrition + Traceability */}
        <div className="space-y-5">
          {/* Nutrition Facts */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-green-400" />
              Nutrition Facts <span className="text-slate-500 text-xs font-normal">(per 100g)</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Calories", value: `${nutrition.calories} kcal`, color: "#f87171" },
                { label: "Protein", value: nutrition.protein, color: "#60a5fa" },
                { label: "Carbs", value: nutrition.carbs, color: "#fbbf24" },
                { label: "Fiber", value: nutrition.fiber, color: "#4ade80" },
                { label: "Fat", value: nutrition.fat, color: "#a78bfa" },
                { label: "Key Vitamins", value: nutrition.vitamin, color: "#34d399" },
              ].map((n) => (
                <div key={n.label} className="rounded-xl p-2.5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs text-slate-500">{n.label}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: n.color }}>{n.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 px-3 py-2 rounded-xl text-xs text-emerald-300"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
              ✅ Health Benefit: {nutrition.benefit}
            </div>
          </div>

          {/* Digital Crop Passport */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-400" />
              Digital Crop Passport
            </h3>
            {/* QR Code visual (simulated) */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-14 h-14">
                  {qrPattern.map((isPurple, i) => (
                    <div key={i} className="rounded-sm"
                      style={{ background: isPurple ? "#8b5cf6" : "transparent", opacity: 0.8 }} />
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Crop ID</span>
                  <span className="text-white font-mono">{product.id?.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Traceability</span>
                  <span className="text-amber-400 font-mono text-[10px]">{product.traceabilityCode || "AGX-2026"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Harvest</span>
                  <span className="text-white">
                    {product.harvestDate
                      ? (mounted
                          ? new Date(product.harvestDate).toLocaleDateString("en-IN")
                          : product.harvestDate.substring(0, 10))
                      : "Recent"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shelf Life</span>
                  <span className="text-white">{product.shelfLifeDays ?? "N/A"} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right col: Traceability Timeline */}
        <div className="space-y-5">
          {/* Full Traceability Timeline */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              Farm-to-Table Journey
            </h3>
            <div>
              {timeline.map((step, i) => (
                <TraceabilityStep key={i} step={step} isLast={i === timeline.length - 1} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI SHOPPING ASSISTANT ─────────────────────────────────────────────── */}
      <div className="mt-6">
        <button id="ai-assistant-toggle"
          onClick={() => setChatOpen(!chatOpen)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all hover:scale-[1.01]"
          style={{
            background: chatOpen ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">AI Shopping Assistant</p>
              <p className="text-slate-400 text-xs">Ask me about freshness, price, recipes, nutrition, alternatives...</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </button>

        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="glass-panel rounded-b-2xl rounded-tl-none rounded-tr-none p-4 border-t-0"
                style={{ borderTop: "none" }}>
                {/* Quick questions */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {QUICK_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => sendChat(q)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
                      {q}
                    </button>
                  ))}
                </div>

                {/* Chat messages */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
                  {chatMessages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                  {chatLoading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)" }}>
                        <Bot className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="px-3 py-2 rounded-2xl text-xs" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChat(chatInput)}
                    placeholder="Ask about freshness, price, recipes..."
                    className="flex-1 glass-input py-2.5 text-sm" />
                  <button onClick={() => sendChat(chatInput)} disabled={chatLoading || !chatInput.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Similar Products ─────────────────────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="text-white font-bold text-lg mb-4">🔗 Compare Similar Products</h2>
        <Link href="/consumer/compare"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(139,92,246,0.1))", border: "1px solid rgba(139,92,246,0.35)" }}>
          <BarChart2 className="w-4 h-4" />
          Compare with Other Farmers
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>
      </div>

      {/* ── Order Dialog ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {orderOpen && (
          <OrderDialog
            product={{
              ...product,
              // Normalize unitType and pricePerUnit values for OrderDialog if needed
              pricePerUnit: product.pricePerUnit ?? product.price_per_unit,
              unitType: product.unitType ?? product.unit_type,
            }}
            onClose={() => setOrderOpen(false)}
            onSuccess={() => {
              setOrderOpen(false);
              router.push("/consumer/orders");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
