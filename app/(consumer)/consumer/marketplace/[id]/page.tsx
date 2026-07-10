"use client";
import { useTranslation } from "@/hooks/useTranslation";

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
import { useLocationWeather } from "@/context/LocationWeatherContext";


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
          style={{ background: step.done ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.03)", border: `1px solid ${step.done ? "rgba(16,185,129,0.25)" : "rgba(0,0,0,0.06)"}` }}>
          {step.icon}
        </div>
        {!isLast && <div className="w-0.5 flex-1 mt-1" style={{ background: step.done ? "#10b981" : "rgba(0,0,0,0.06)" }} />}
      </div>
      <div className="pb-4 min-w-0">
        <p className={`text-sm font-bold ${step.done ? "text-slate-805 text-slate-800" : "text-slate-400 font-medium"}`}>{step.label}</p>
        <p className="text-slate-450 text-slate-400 text-xs font-semibold mt-0.5">{step.date}</p>
      </div>
    </div>
  );
}

// ─── AI Chat Message ──────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isAi = msg.role === "ai";
  return (
    <div className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isAi ? "text-emerald-700 bg-emerald-50 border border-emerald-150" : "text-purple-700 bg-purple-50 border border-purple-150"}`}>
        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-3.5 h-3.5" />}
      </div>
      <div className={`max-w-xs px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap font-medium ${
        isAi ? "text-slate-700 rounded-tl-none bg-emerald-50/40 border border-emerald-100/50" : "text-slate-750 text-slate-700 rounded-tr-none bg-purple-50/40 border border-purple-100/50"
      }`}
        dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { t } = useTranslation("consumer");
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
  const { location: userLocation, weather: userWeather } = useLocationWeather();
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
            description: product?.description,
            category: product?.category,
            variety: product?.variety ?? product?.cropType,
            pricePerUnit: product?.pricePerUnit,
            unitType: product?.unitType,
            qualityGrade: product?.qualityGrade,
            freshnessScore: product?.aiFreshnessScore,
            aiConfidenceScore: product?.aiConfidenceScore,
            diseaseStatus: product?.diseaseStatus,
            pestStatus: product?.pestStatus,
            farmerName: product?.farmer?.fullName,
            farmerRating: product?.farmer?.trustScore,
            farmerVerified: product?.farmer?.isVerified,
            farmer: product?.farmer,
            location: product?.location || product?.farmer?.address,
            isOrganic: product?.isOrganic,
            quantityAvailable: product?.quantityAvailable,
            harvestDate: product?.harvestDate,
            shelfLifeDays: product?.shelfLifeDays,
            storageCondition: product?.storageCondition,
            storageTemp: product?.storageTemp,
            certificates: product?.certificates,
            marketPrice: product?.marketPrice,
            aiRecommendedPrice: product?.aiRecommendedPrice,
            rating: product?.rating,
            reviewsCount: product?.reviewsCount,
            cookingUses: product?.cookingUses,
            healthBenefits: product?.healthBenefits,
            nutrition: product?.nutrition,
            deliveryTime: product?.deliveryTime,
            traceabilityCode: product?.traceabilityCode,
          },
          location: userLocation,
          weather: userWeather,
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
            <ArrowLeft className="w-4 h-4" /> {t("backToMarketplace")}
          </Link>
        </div>
      </div>
    );
  }

  const grade = product.qualityGrade ?? product.quality_grade ?? "B";
  const gradeCfg = GRADE_CONFIG[grade] ?? GRADE_CONFIG["B"];
  const productCategoryNormalized = (product.title?.toLowerCase().includes("pomegranate") || product.category?.toLowerCase().includes("pomegranate"))
    ? "Fruits"
    : product.category;
  const nutrition = NUTRITION_BY_CATEGORY[productCategoryNormalized] ?? NUTRITION_BY_CATEGORY["Vegetables"];
  const wishlistActive = isInWishlist(product.id);
  const timeline = buildTimeline();
  const images = product.images?.filter(Boolean) ?? [product.imageUrl].filter(Boolean);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Back button */}
      <Link href="/consumer/marketplace"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition-colors mb-6 text-sm font-bold no-underline">
        <ArrowLeft className="w-4 h-4" />
        {t("backToMarketplace")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* ── Image Gallery ─────────────────────────────────────────────────── */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden group premium-card">
            {images.length > 0 ? (
              <>
                <img src={images[activeImage]} alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                {/* Zoom icon */}
                <div className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/60 backdrop-blur-sm shadow-sm">
                  <ZoomIn className="w-4.5 h-4.5 text-white" />
                </div>
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center bg-slate-905 bg-white/90 border-slate-250/20 text-slate-800 shadow-md hover:scale-105 active:scale-95 cursor-pointer">
                      <ChevronLeft className="w-5 h-5 text-slate-800" />
                    </button>
                    <button onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center bg-slate-905 bg-white/90 border-slate-250/20 text-slate-800 shadow-md hover:scale-105 active:scale-95 cursor-pointer">
                      <ChevronRight className="w-5 h-5 text-slate-800" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-50/10">
                <Leaf className="w-24 h-24 text-emerald-600/20" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {(product.isOrganic || product.is_organic) && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border-emerald-250 shadow-sm">🌿 Organic</span>
              )}
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-sm bg-white/90 backdrop-blur-sm"
                style={{ color: gradeCfg.color, border: `1.5px solid ${gradeCfg.color}35` }}>
                ⭐ Grade {grade}
              </span>
            </div>
          </div>

          {/* Thumbnail row */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all border cursor-pointer ${activeImage === i ? "ring-2 ring-emerald-500 border-transparent scale-[1.02]" : "border-slate-205 border-slate-200 opacity-60 hover:opacity-90"}`}>
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
              <span className="px-2.5 py-0.5 rounded-md text-xs text-slate-500 font-bold bg-slate-100 border border-slate-200 uppercase tracking-wider">
                {productCategoryNormalized}
              </span>
              {product.traceabilityCode && (
                <span className="px-2.5 py-0.5 rounded-md text-xs text-amber-700 bg-amber-50 border-amber-200 font-mono font-bold">
                  🔗 {product.traceabilityCode}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">{product.title}</h1>
            {product.description && (
              <p className="text-slate-650 text-slate-600 text-sm mt-2 leading-relaxed font-medium">{product.description}</p>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4"
                    style={{ color: i < Math.round(product.rating) ? "#fbbf24" : "#e2e8f0" }}
                    fill={i < Math.round(product.rating) ? "#fbbf24" : "none"} />
                ))}
              </div>
              <span className="text-slate-800 font-bold text-sm">{product.rating}</span>
              {product.reviewsCount && (
                <span className="text-slate-450 font-semibold text-slate-400 text-xs">({product.reviewsCount} reviews)</span>
              )}
            </div>
          )}

          {/* AI Quality Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="premium-card rounded-3xl shadow-sm p-3 text-center">
              <div className="text-lg font-extrabold" style={{ color: gradeCfg.color }}>{t("grade")} {grade}</div>
              <div className="text-slate-450 font-bold uppercase tracking-wider text-[10px] text-slate-400 mt-1">{t("aiQuality")}</div>
            </div>
            <div className="premium-card rounded-3xl shadow-sm p-3 text-center">
              <div className="text-lg font-extrabold text-sky-750 text-sky-600">{product.aiFreshnessScore ?? 95}%</div>
              <div className="text-slate-450 font-bold uppercase tracking-wider text-[10px] text-slate-400 mt-1">{t("freshness")}</div>
            </div>
            <div className="premium-card rounded-3xl shadow-sm p-3 text-center">
              <div className="text-lg font-extrabold text-purple-755 text-purple-650">{product.aiConfidenceScore ?? 94}%</div>
              <div className="text-slate-450 font-bold uppercase tracking-wider text-[10px] text-slate-400 mt-1">{t("aiConfidence")}</div>
            </div>
          </div>

          {/* Price */}
          <div className="premium-card rounded-3xl shadow-sm p-4">
            <div className="flex items-end gap-3 mb-3 pb-3 border-b border-slate-50">
              <div>
                <span className="text-3xl font-extrabold text-emerald-600">₹{product.pricePerUnit}</span>
                <span className="text-slate-450 text-slate-400 text-sm ml-0.5">/ {product.unitType}</span>
              </div>
              {product.marketPrice && (
                <div className="text-xs text-slate-500 mb-1.5 font-medium">
                  <span className="line-through">Retail ₹{product.marketPrice}</span>
                  <span className="ml-2 text-emerald-600 font-extrabold">
                    Save ₹{product.marketPrice - product.pricePerUnit}
                  </span>
                </div>
              )}
            </div>
            {product.aiRecommendedPrice && (
              <div className="flex items-center gap-2 text-xs mb-3 text-sky-700 bg-sky-50/50 border-sky-100/50 px-2.5 py-1.5 rounded-xl font-bold">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                AI Recommended: ₹{product.aiRecommendedPrice}/{product.unitType}
              </div>
            )}

            {/* Quantity picker */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors border-0 cursor-pointer">
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-slate-800 font-bold font-mono w-12 text-center text-sm">{quantity} {product.unitType}</span>
                <button onClick={() => setQuantity((q) => Math.min(q + 1, product.quantityAvailable ?? 999))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors border-0 cursor-pointer">
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <span className="text-slate-400 text-xs font-medium ml-auto">
                Total: <span className="text-slate-800 font-extrabold text-sm ml-0.5">₹{(product.pricePerUnit * quantity).toFixed(0)}</span>
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => router.push(`/consumer/marketplace/checkout?productId=${product.id}&quantity=${quantity}`)}
                id="buy-now-btn"
                className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 cursor-pointer border-0"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
                <ShoppingCart className="w-4 h-4" />{t("buyNow")}
              </button>
              <button onClick={() => wishlistActive ? removeFromWishlist(product.id) : addToWishlist({
                  id: product.id, title: product.title, pricePerUnit: product.pricePerUnit,
                  unitType: product.unitType, imageUrl: product.imageUrl, qualityGrade: product.qualityGrade,
                  farmerName: product.farmer?.fullName, farmerId: product.farmer?.id, category: productCategoryNormalized,
                })}
                id="wishlist-btn"
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: wishlistActive ? "rgba(239,68,68,0.12)" : "rgba(0,0,0,0.03)",
                  border: `1px solid ${wishlistActive ? "rgba(239,68,68,0.25)" : "rgba(0,0,0,0.06)"}`,
                }}>
                <Heart className={`w-5 h-5 ${wishlistActive ? "text-red-500 fill-red-500" : "text-slate-500"}`} />
              </button>
            </div>

            {orderError && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-650 bg-rose-50 border-rose-100 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />{orderError}
              </div>
            )}
          </div>

          {/* Delivery info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="premium-card rounded-3xl shadow-sm p-3 flex items-center gap-2.5">
              <Truck className="w-4.5 h-4.5 text-sky-650 text-sky-600 shrink-0" />
              <div>
                <p className="text-slate-805 text-slate-800 text-xs font-bold">{t("freeDelivery")}</p>
                <p className="text-slate-450 text-slate-400 text-[11px] font-semibold">{t("str_2448HrsFarmToDoor")}</p>
              </div>
            </div>
            <div className="premium-card rounded-3xl shadow-sm p-3 flex items-center gap-2.5">
              <Shield className="w-4.5 h-4.5 text-emerald-655 text-emerald-600 shrink-0" />
              <div>
                <p className="text-slate-805 text-slate-800 text-xs font-bold">Quality Guarantee</p>
                <p className="text-slate-450 text-slate-400 text-[11px] font-semibold">{t("aiVerifiedQuality")}</p>
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
            <div className="premium-card rounded-3xl shadow-sm p-5">
              <h3 className="text-slate-800 font-extrabold text-sm mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                {t("farmerProfile")}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  {product.farmer.fullName?.charAt(0) || "F"}
                </div>
                <div>
                  <p className="text-slate-850 text-slate-800 font-bold text-sm">{product.farmer.fullName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {product.farmer.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{t("verified")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-500 font-medium">
                {product.farmer.trustScore && (
                  <div className="flex items-center justify-between">
                    <span>{t("trustScore")}</span>
                    <span className="text-amber-700 font-bold">⭐ {product.farmer.trustScore}/5</span>
                  </div>
                )}
                {(product.location || product.farmer.address) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {product.location || product.farmer.address}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certificates */}
          {product.certificates?.length > 0 && (
            <div className="premium-card rounded-3xl shadow-sm p-5">
              <h3 className="text-slate-800 font-extrabold text-sm mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                {t("certificates")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.certificates.map((cert: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 border-amber-200 text-amber-700">
                    🏅 {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Storage Info */}
          {product.storageCondition && (
            <div className="premium-card rounded-3xl shadow-sm p-5">
              <h3 className="text-slate-800 font-extrabold text-sm mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-600" />
                Storage Guide
              </h3>
              <div className="space-y-2 text-xs text-slate-500 font-semibold">
                <div className="flex items-start gap-2">
                  <Thermometer className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
                  <span>{product.storageTemp}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Droplets className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-505 text-sky-500" />
                  <span>{product.storageCondition}</span>
                </div>
                {product.shelfLifeDays && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-500" />
                    <span>Shelf life: {product.shelfLifeDays} {t("days")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Middle col: Nutrition + Traceability */}
        <div className="space-y-5">
          {/* Nutrition Facts */}
          <div className="premium-card rounded-3xl shadow-sm p-5">
            <h3 className="text-slate-800 font-extrabold text-sm mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              Nutrition Facts <span className="text-slate-400 text-xs font-normal capitalize tracking-normal font-sans">{t("per100g")}</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Calories", value: `${nutrition.calories} kcal`, color: "#ef4444" },
                { label: "Protein", value: nutrition.protein, color: "#3b82f6" },
                { label: "Carbs", value: nutrition.carbs, color: "#d97706" },
                { label: "Fiber", value: nutrition.fiber, color: "#10b981" },
                { label: "Fat", value: nutrition.fat, color: "#8b5cf6" },
                { label: "Key Vitamins", value: nutrition.vitamin, color: "#0d9488" },
              ].map((n) => (
                <div key={n.label} className="rounded-xl p-2.5 bg-slate-50 border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 text-slate-400">{n.label}</p>
                  <p className="text-sm font-extrabold mt-0.5" style={{ color: n.color }}>{n.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 px-3 py-2 rounded-xl text-xs text-emerald-700 bg-emerald-50 border-emerald-100 font-semibold">
              ✅ Health Benefit: {nutrition.benefit}
            </div>
          </div>

          {/* Digital Crop Passport */}
          <div className="premium-card rounded-3xl shadow-sm p-5">
            <h3 className="text-slate-800 font-extrabold text-sm mb-4 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-650 text-purple-600" />
              {t("digitalCropPassport")}
            </h3>
            {/* QR Code visual (simulated) */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 border-slate-150">
                <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-14 h-14">
                  {qrPattern.map((isPurple, i) => (
                    <div key={i} className="rounded-sm"
                      style={{ background: isPurple ? "#8b5cf6" : "transparent", opacity: 0.8 }} />
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-1.5 text-xs text-slate-500 font-medium">
                <div className="flex justify-between">
                  <span>{t("cropId")}</span>
                  <span className="text-slate-800 font-bold font-mono">{product.id?.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Traceability</span>
                  <span className="text-amber-705 text-amber-700 font-mono font-bold text-[10px]">{product.traceabilityCode || "AGX-2026"}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("harvest")}</span>
                  <span className="text-slate-855 text-slate-800 font-bold">
                    {product.harvestDate
                      ? (mounted
                          ? new Date(product.harvestDate).toLocaleDateString("en-IN")
                          : product.harvestDate.substring(0, 10))
                      : "Recent"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shelf Life</span>
                  <span className="text-slate-855 text-slate-800 font-bold">{product.shelfLifeDays ?? "N/A"} {t("days")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right col: Traceability Timeline */}
        <div className="space-y-5">
          {/* Full Traceability Timeline */}
          <div className="premium-card rounded-3xl shadow-sm p-5">
            <h3 className="text-slate-800 font-extrabold text-sm mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-655 text-sky-600" />
              {t("farmToTableJourney")}
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
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all hover:scale-[1.005] bg-emerald-50 border-emerald-150 border-emerald-100 text-emerald-705 text-emerald-700 cursor-pointer"
          style={{
            boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
          }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100/70 border-emerald-200">
              <Bot className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="text-slate-800 font-bold text-sm">{t("aiAssistant")}</p>
              <p className="text-slate-500 text-xs font-medium">{t("askMeAboutFreshnessPriceRecipe")}</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
        </button>

        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="premium-card rounded-b-3xl rounded-tl-none rounded-tr-none p-4 border-t-0 shadow-md">
                {/* Quick questions */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {QUICK_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => sendChat(q)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-[1.03] bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-700 cursor-pointer">
                      {q}
                    </button>
                  ))}
                </div>

                {/* Chat messages */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
                  {chatMessages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                  {chatLoading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 border-emerald-100">
                        <Bot className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="px-3 py-2 rounded-2xl text-xs bg-emerald-50/20 border-emerald-100/50">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-550 bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
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
                    className="flex-1 py-2.5 px-4 rounded-xl text-sm bg-slate-50 border-slate-205 text-slate-800 focus:outline-none focus:border-emerald-305 focus:border-emerald-300" />
                  <button onClick={() => sendChat(chatInput)} disabled={chatLoading || !chatInput.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 border-0 cursor-pointer"
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
        <h2 className="text-slate-800 font-extrabold text-lg mb-4">🔗 Compare Similar Products</h2>
        <Link href={`/consumer/compare?id=${productId}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-purple-700 bg-purple-50 border-purple-105 border-purple-200 hover:bg-purple-100 transition-all hover:scale-[1.02] no-underline">
          <BarChart2 className="w-4 h-4" />
          {t("compareWithOtherFarmers")}
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>
      </div>


    </div>
  );
}