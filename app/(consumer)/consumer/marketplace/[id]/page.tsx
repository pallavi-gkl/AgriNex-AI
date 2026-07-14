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
  CheckCircle, BadgeCheck, Flame, Dumbbell, Wheat, Apple,
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
  "A+": { color: "#16A34A", bg: "rgba(22,163,74,0.12)", label: "Premium" },
  "A":  { color: "#22C55E", bg: "rgba(34,197,94,0.10)", label: "Excellent" },
  "B":  { color: "#F59E0B", bg: "rgba(245,158,11,0.10)", label: "Good" },
  "C":  { color: "#FB923C", bg: "rgba(251,146,60,0.10)", label: "Average" },
  "D":  { color: "#EF4444", bg: "rgba(239,68,68,0.10)", label: "Below Avg" },
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

// ─── AI Chat Message ──────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isAi = msg.role === "ai";
  return (
    <div style={{ display: "flex", gap: "10px", flexDirection: isAi ? "row" : "row-reverse" }}>
      <div style={{
        width: "30px", height: "30px", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        background: isAi ? "#DCFCE7" : "#EDE9FE",
        border: `1px solid ${isAi ? "#86EFAC" : "#C4B5FD"}`,
      }}>
        {isAi ? <Bot style={{ width: "15px", height: "15px", color: "#16A34A" }} /> : <User style={{ width: "13px", height: "13px", color: "#7C3AED" }} />}
      </div>
      <div style={{
        maxWidth: "72%", padding: "10px 14px", borderRadius: "16px",
        fontSize: "13px", lineHeight: 1.6, fontWeight: 500,
        background: isAi ? "#F0FDF4" : "#F5F3FF",
        border: `1px solid ${isAi ? "#BBF7D0" : "#DDD6FE"}`,
        color: "#1E293B",
        borderTopLeftRadius: isAi ? "4px" : "16px",
        borderTopRightRadius: isAi ? "16px" : "4px",
      }}
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
        const { data, error } = (await supabase
          .from("products")
          .select(`*, farmer:profiles!products_farmer_id_fkey(id, full_name, avatar_url, is_verified, trust_score, phone_number, address, location_lat, location_lng)`)
          .eq("id", productId)
          .maybeSingle()) as any;

        if (!error && data) {
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

  // ── Buy Now ───────────────────────────────────────────────────────────────
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

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #F8FFF8, #EAF7EC)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", border: "3px solid #DCFCE7", borderTopColor: "#16A34A", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748B", fontWeight: 600, fontSize: "15px" }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #F8FFF8, #EAF7EC)" }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle style={{ width: "52px", height: "52px", color: "#EF444460", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748B", fontWeight: 600 }}>Product not found</p>
          <Link href="/consumer/marketplace" style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px", color: "#16A34A", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> {t("backToMarketplace")}
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
  const totalPrice = (product.pricePerUnit * quantity).toFixed(0);
  const savings = product.marketPrice ? product.marketPrice - product.pricePerUnit : null;

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1.5px solid #DCFCE7",
    borderRadius: "22px",
    boxShadow: "0 4px 24px rgba(22,163,74,0.04)",
    overflow: "hidden",
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #F8FFF8 0%, #EAF7EC 60%, #F3FAF0 100%)", minHeight: "100vh", padding: "28px 20px", fontFamily: "Inter, sans-serif" }}>
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pd-card-hover { transition: all 0.25s ease; }
        .pd-card-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(22,163,74,0.08) !important; }
        .pd-btn-primary { transition: all 0.2s ease; }
        .pd-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(22,163,74,0.35) !important; }
        .pd-btn-primary:active { transform: translateY(0); }
        .pd-img-hover img { transition: transform 0.6s ease; }
        .pd-img-hover:hover img { transform: scale(1.05); }
        .pd-thumb { transition: all 0.2s ease; }
        .pd-thumb:hover { transform: scale(1.06); }
      `}</style>

      {/* Max width wrapper */}
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Back button */}
        <Link href="/consumer/marketplace" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#64748B", fontWeight: 700, fontSize: "14px", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#16A34A")}
          onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}>
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
          {t("backToMarketplace")}
        </Link>

        {/* ── TOP: Two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "32px", alignItems: "start" }}>

          {/* LEFT: Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            {/* Main image */}
            <div className="pd-img-hover" style={{ ...cardStyle, aspectRatio: "1/1", position: "relative", cursor: "zoom-in", border: "1.5px solid #BBF7D0" }}>
              {images.length > 0 ? (
                <>
                  <img src={images[activeImage]} alt={product.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />

                  {/* Zoom icon */}
                  <div style={{ position: "absolute", top: "14px", right: "14px", width: "36px", height: "36px", borderRadius: "10px", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ZoomIn style={{ width: "16px", height: "16px", color: "#fff" }} />
                  </div>

                  {/* Nav arrows */}
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                        style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <ChevronLeft style={{ width: "18px", height: "18px", color: "#0F172A" }} />
                      </button>
                      <button onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                        style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <ChevronRight style={{ width: "18px", height: "18px", color: "#0F172A" }} />
                      </button>
                    </>
                  )}

                  {/* Badges */}
                  <div style={{ position: "absolute", top: "14px", left: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(product.isOrganic || product.is_organic) && (
                      <span style={{ padding: "5px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: 800, background: "#DCFCE7", color: "#16A34A", border: "1px solid #86EFAC" }}>🌿 Organic</span>
                    )}
                    <span style={{ padding: "5px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: 800, background: "rgba(255,255,255,0.92)", color: gradeCfg.color, border: `1.5px solid ${gradeCfg.color}40`, backdropFilter: "blur(8px)" }}>
                      ⭐ Grade {grade}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0FDF4" }}>
                  <Leaf style={{ width: "80px", height: "80px", color: "#BBF7D0" }} />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                {images.map((img: string, i: number) => (
                  <button key={i} className="pd-thumb" onClick={() => setActiveImage(i)}
                    style={{ width: "72px", height: "72px", borderRadius: "14px", overflow: "hidden", flexShrink: 0, border: activeImage === i ? "2.5px solid #16A34A" : "1.5px solid #DCFCE7", cursor: "pointer", padding: 0, background: "none", opacity: activeImage === i ? 1 : 0.6 }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}

            {/* Delivery assurance cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
              {[
                { icon: <Truck style={{ width: "18px", height: "18px", color: "#0369A1" }} />, title: t("freeDelivery"), sub: t("str_2448HrsFarmToDoor"), bg: "#EFF6FF", border: "#BFDBFE" },
                { icon: <Shield style={{ width: "18px", height: "18px", color: "#16A34A" }} />, title: "Quality Guarantee", sub: t("aiVerifiedQuality"), bg: "#F0FDF4", border: "#BBF7D0" },
                { icon: <Zap style={{ width: "18px", height: "18px", color: "#D97706" }} />, title: "AI Verified", sub: "Freshness certified", bg: "#FFFBEB", border: "#FDE68A" },
                { icon: <CheckCircle style={{ width: "18px", height: "18px", color: "#7C3AED" }} />, title: "Secure Purchase", sub: "100% money back", bg: "#F5F3FF", border: "#DDD6FE" },
              ].map((item, i) => (
                <div key={i} className="pd-card-hover" style={{ background: item.bg, border: `1.5px solid ${item.border}`, borderRadius: "16px", padding: "14px", display: "flex", alignItems: "flex-start", gap: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{item.title}</p>
                    <p style={{ fontSize: "11px", color: "#64748B", fontWeight: 500, margin: "2px 0 0" }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Title & badges row */}
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                <span style={{ padding: "4px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 800, background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {productCategoryNormalized}
                </span>
                {product.traceabilityCode && (
                  <span style={{ padding: "4px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A", fontFamily: "monospace" }}>
                    🔗 {product.traceabilityCode}
                  </span>
                )}
                <span style={{ padding: "4px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 800, background: gradeCfg.bg, color: gradeCfg.color, border: `1px solid ${gradeCfg.color}30` }}>
                  Grade {grade} · {gradeCfg.label}
                </span>
              </div>

              <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.6px", lineHeight: 1.15, margin: "0 0 10px" }}>{product.title}</h1>

              {product.description && (
                <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.65, fontWeight: 500, margin: 0 }}>{product.description}</p>
              )}
            </div>

            {/* Rating row */}
            {product.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "14px" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} style={{ width: "18px", height: "18px", color: i < Math.round(product.rating) ? "#F59E0B" : "#E2E8F0", fill: i < Math.round(product.rating) ? "#F59E0B" : "none" }} />
                  ))}
                </div>
                <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "15px" }}>{product.rating}</span>
                {product.reviewsCount && (
                  <span style={{ color: "#94A3B8", fontSize: "13px", fontWeight: 600 }}>({product.reviewsCount} reviews)</span>
                )}
                {product.farmer?.isVerified && (
                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 700, color: "#16A34A" }}>
                    <BadgeCheck style={{ width: "15px", height: "15px" }} /> Verified Farmer
                  </span>
                )}
              </div>
            )}

            {/* AI Quality metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { label: t("aiQuality"), value: `${grade}`, sub: gradeCfg.label, color: gradeCfg.color, bg: gradeCfg.bg },
                { label: t("freshness"), value: `${product.aiFreshnessScore ?? 95}%`, sub: "AI Score", color: "#0369A1", bg: "#EFF6FF" },
                { label: t("aiConfidence"), value: `${product.aiConfidenceScore ?? 94}%`, sub: "Confidence", color: "#7C3AED", bg: "#F5F3FF" },
              ].map((m) => (
                <div key={m.label} className="pd-card-hover" style={{ background: m.bg, border: `1.5px solid ${m.color}25`, borderRadius: "16px", padding: "14px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* ── PRICE CARD ── */}
            <div style={{ ...cardStyle, padding: "24px", background: "linear-gradient(135deg, #F0FDF4 0%, #ffffff 100%)" }}>
              {/* Price row */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1.5px solid #F1F5F9" }}>
                <div>
                  <span style={{ fontSize: "42px", fontWeight: 900, color: "#16A34A", letterSpacing: "-1px" }}>₹{product.pricePerUnit}</span>
                  <span style={{ fontSize: "15px", color: "#94A3B8", fontWeight: 600, marginLeft: "4px" }}>/ {product.unitType}</span>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  {product.marketPrice && (
                    <div>
                      <span style={{ fontSize: "14px", color: "#94A3B8", textDecoration: "line-through", fontWeight: 600 }}>Retail ₹{product.marketPrice}</span>
                      {savings && savings > 0 && (
                        <span style={{ marginLeft: "10px", fontSize: "13px", fontWeight: 800, color: "#EF4444", background: "#FEF2F2", padding: "3px 10px", borderRadius: "99px", border: "1px solid #FECACA" }}>
                          Save ₹{savings}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Recommended price */}
              {product.aiRecommendedPrice && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "linear-gradient(135deg, #F5F3FF, #EDE9FE)", border: "1px solid #DDD6FE", borderRadius: "12px", marginBottom: "16px" }}>
                  <Sparkles style={{ width: "16px", height: "16px", color: "#7C3AED", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#7C3AED" }}>
                    AI Recommended: ₹{product.aiRecommendedPrice}/{product.unitType}
                  </span>
                </div>
              )}

              {/* Quantity picker */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Quantity:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0", background: "#F1F5F9", borderRadius: "14px", overflow: "hidden", border: "1.5px solid #E2E8F0" }}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ width: "44px", height: "44px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#DCFCE7")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Minus style={{ width: "16px", height: "16px", color: "#0F172A" }} />
                  </button>
                  <span style={{ width: "80px", textAlign: "center", fontSize: "15px", fontWeight: 800, color: "#0F172A", fontFamily: "monospace" }}>{quantity} {product.unitType}</span>
                  <button onClick={() => setQuantity((q) => Math.min(q + 1, product.quantityAvailable ?? 999))}
                    style={{ width: "44px", height: "44px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#DCFCE7")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Plus style={{ width: "16px", height: "16px", color: "#0F172A" }} />
                  </button>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, margin: "0 0 2px" }}>Total</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: 0 }}>₹{totalPrice}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <button
                  id="buy-now-btn"
                  className="pd-btn-primary"
                  onClick={() => router.push(`/consumer/marketplace/checkout?productId=${product.id}&quantity=${quantity}`)}
                  style={{ flex: 1, height: "52px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", color: "#ffffff", fontWeight: 800, fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", boxShadow: "0 6px 20px rgba(22,163,74,0.28)" }}>
                  <ShoppingCart style={{ width: "18px", height: "18px" }} />
                  {t("buyNow")}
                </button>
                <button
                  id="wishlist-btn"
                  onClick={() => wishlistActive ? removeFromWishlist(product.id) : addToWishlist({
                    id: product.id, title: product.title, pricePerUnit: product.pricePerUnit,
                    unitType: product.unitType, imageUrl: product.imageUrl, qualityGrade: product.qualityGrade,
                    farmerName: product.farmer?.fullName, farmerId: product.farmer?.id, category: productCategoryNormalized,
                  })}
                  style={{ width: "52px", height: "52px", borderRadius: "14px", border: `1.5px solid ${wishlistActive ? "#FECACA" : "#E2E8F0"}`, background: wishlistActive ? "#FEF2F2" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
                  <Heart style={{ width: "20px", height: "20px", color: wishlistActive ? "#EF4444" : "#94A3B8", fill: wishlistActive ? "#EF4444" : "none" }} />
                </button>
              </div>

              {/* Compare link */}
              <Link href={`/consumer/compare?id=${productId}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "44px", borderRadius: "12px", border: "1.5px solid #DDD6FE", background: "transparent", color: "#7C3AED", fontWeight: 700, fontSize: "14px", textDecoration: "none", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F5F3FF"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <BarChart2 style={{ width: "16px", height: "16px" }} />
                {t("compareWithOtherFarmers")}
              </Link>

              {orderError && (
                <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "12px", background: "#FEF2F2", border: "1px solid #FECACA", fontSize: "13px", color: "#DC2626", fontWeight: 600 }}>
                  <AlertCircle style={{ width: "15px", height: "15px", flexShrink: 0 }} />{orderError}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── BOTTOM SECTIONS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "32px" }}>

          {/* LEFT COL: Farmer + Storage + Certificates */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Farmer Profile Card */}
            {product.farmer && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="pd-card-hover" style={{ ...cardStyle, padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1.5px solid #F1F5F9" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User style={{ width: "18px", height: "18px", color: "#16A34A" }} />
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{t("farmerProfile")}</h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                  {product.farmer.avatarUrl ? (
                    <img src={product.farmer.avatarUrl} alt={product.farmer.fullName} style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "2.5px solid #BBF7D0" }} />
                  ) : (
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #16A34A, #22C55E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "22px", flexShrink: 0, border: "2.5px solid #BBF7D0" }}>
                      {product.farmer.fullName?.charAt(0) || "F"}
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{product.farmer.fullName}</p>
                    {product.farmer.isVerified && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                        <BadgeCheck style={{ width: "14px", height: "14px", color: "#16A34A" }} />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#16A34A" }}>{t("verified")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  {product.farmer.trustScore && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                      <span style={{ color: "#64748B", fontWeight: 600 }}>{t("trustScore")}</span>
                      <span style={{ fontWeight: 800, color: "#D97706" }}>⭐ {product.farmer.trustScore}/5</span>
                    </div>
                  )}
                  {(product.location || product.farmer.address) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748B", fontWeight: 500 }}>
                      <MapPin style={{ width: "14px", height: "14px", color: "#94A3B8", flexShrink: 0 }} />
                      {product.location || product.farmer.address}
                    </div>
                  )}
                  {product.isOrganic && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "99px", background: "#DCFCE7", border: "1px solid #86EFAC", fontSize: "12px", fontWeight: 700, color: "#16A34A", width: "fit-content" }}>
                      <Leaf style={{ width: "13px", height: "13px" }} /> Organic Certified
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Link href={`/consumer/marketplace`} style={{ flex: 1, height: "38px", borderRadius: "10px", border: "1.5px solid #BBF7D0", background: "transparent", color: "#16A34A", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#F0FDF4"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    View Farmer
                  </Link>
                  {product.farmer.phone && (
                    <a href={`tel:${product.farmer.phone}`} style={{ flex: 1, height: "38px", borderRadius: "10px", border: "1.5px solid #E2E8F0", background: "transparent", color: "#64748B", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "5px", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      <Phone style={{ width: "13px", height: "13px" }} /> Contact
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Certificates */}
            {product.certificates?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="pd-card-hover" style={{ ...cardStyle, padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <Award style={{ width: "18px", height: "18px", color: "#D97706" }} />
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{t("certificates")}</h3>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.certificates.map((cert: string, i: number) => (
                    <span key={i} style={{ padding: "5px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#D97706" }}>
                      🏅 {cert}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Storage Guide */}
            {product.storageCondition && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="pd-card-hover" style={{ ...cardStyle, padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <Thermometer style={{ width: "18px", height: "18px", color: "#0369A1" }} />
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Storage Guide</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { icon: <Thermometer style={{ width: "15px", height: "15px", color: "#0369A1" }} />, text: product.storageTemp, label: "Temperature" },
                    { icon: <Droplets style={{ width: "15px", height: "15px", color: "#0EA5E9" }} />, text: product.storageCondition, label: "Conditions" },
                    ...(product.shelfLifeDays ? [{ icon: <Clock style={{ width: "15px", height: "15px", color: "#7C3AED" }} />, text: `${product.shelfLifeDays} ${t("days")}`, label: "Shelf Life" }] : []),
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: "12px" }}>
                      {item.icon}
                      <div>
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#334155", margin: "2px 0 0" }}>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* MIDDLE COL: Nutrition + Crop Passport */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Nutrition Facts */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="pd-card-hover" style={{ ...cardStyle, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1.5px solid #F1F5F9" }}>
                <Scale style={{ width: "18px", height: "18px", color: "#16A34A" }} />
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Nutrition Facts <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500 }}>{t("per100g")}</span>
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Calories", value: `${nutrition.calories} kcal`, color: "#EF4444", bg: "#FEF2F2", icon: <Flame style={{ width: "14px", height: "14px", color: "#EF4444" }} /> },
                  { label: "Protein", value: nutrition.protein, color: "#3B82F6", bg: "#EFF6FF", icon: <Dumbbell style={{ width: "14px", height: "14px", color: "#3B82F6" }} /> },
                  { label: "Carbs", value: nutrition.carbs, color: "#D97706", bg: "#FFFBEB", icon: <Wheat style={{ width: "14px", height: "14px", color: "#D97706" }} /> },
                  { label: "Fiber", value: nutrition.fiber, color: "#16A34A", bg: "#F0FDF4", icon: <Leaf style={{ width: "14px", height: "14px", color: "#16A34A" }} /> },
                  { label: "Fat", value: nutrition.fat, color: "#7C3AED", bg: "#F5F3FF", icon: <Droplets style={{ width: "14px", height: "14px", color: "#7C3AED" }} /> },
                  { label: "Vitamins", value: nutrition.vitamin, color: "#0D9488", bg: "#F0FDFA", icon: <Apple style={{ width: "14px", height: "14px", color: "#0D9488" }} /> },
                ].map((n) => (
                  <div key={n.label} className="pd-card-hover" style={{ background: n.bg, border: `1px solid ${n.color}20`, borderRadius: "14px", padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      {n.icon}
                      <p style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8", margin: 0 }}>{n.label}</p>
                    </div>
                    <p style={{ fontSize: "16px", fontWeight: 900, color: n.color, margin: 0 }}>{n.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "12px", background: "#F0FDF4", border: "1px solid #BBF7D0", fontSize: "13px", color: "#16A34A", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                {nutrition.benefit}
              </div>
            </motion.div>

            {/* Digital Crop Passport */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="pd-card-hover" style={{ ...cardStyle, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1.5px solid #F1F5F9" }}>
                <QrCode style={{ width: "18px", height: "18px", color: "#7C3AED" }} />
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{t("digitalCropPassport")}</h3>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                {/* QR Code Visual */}
                <div style={{ width: "88px", height: "88px", borderRadius: "16px", background: "#F5F3FF", border: "1.5px solid #DDD6FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "2px", width: "60px", height: "60px" }}>
                    {qrPattern.map((isPurple, i) => (
                      <div key={i} style={{ borderRadius: "2px", background: isPurple ? "#7C3AED" : "transparent", opacity: 0.85 }} />
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: t("cropId"), value: product.id?.substring(0, 8).toUpperCase(), mono: true },
                    { label: "Traceability", value: product.traceabilityCode || "AGX-2026", mono: true, accent: "#D97706" },
                    { label: t("harvest"), value: product.harvestDate ? (mounted ? new Date(product.harvestDate).toLocaleDateString("en-IN") : product.harvestDate.substring(0, 10)) : "Recent", mono: false },
                    { label: "Shelf Life", value: `${product.shelfLifeDays ?? "N/A"} ${t("days")}`, mono: false },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                      <span style={{ color: "#94A3B8", fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontWeight: 800, color: item.accent || "#0F172A", fontFamily: item.mono ? "monospace" : "inherit", fontSize: item.mono ? "11px" : "12px" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "12px", background: "#F5F3FF", border: "1px solid #DDD6FE", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles style={{ width: "14px", height: "14px", color: "#7C3AED", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#7C3AED" }}>AI Verified — BlockChain Traced</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COL: Farm-to-Table Timeline */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="pd-card-hover" style={{ ...cardStyle, padding: "24px", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px", paddingBottom: "14px", borderBottom: "1.5px solid #F1F5F9" }}>
                <Globe style={{ width: "18px", height: "18px", color: "#0369A1" }} />
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{t("farmToTableJourney")}</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {timeline.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "14px" }}>
                    {/* Left: dot + line */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "36px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "16px", flexShrink: 0,
                        background: step.done ? "linear-gradient(135deg, #F0FDF4, #DCFCE7)" : "#F8FAFC",
                        border: `2px solid ${step.done ? "#16A34A" : "#E2E8F0"}`,
                        boxShadow: step.done ? "0 0 0 4px rgba(22,163,74,0.08)" : "none",
                        opacity: step.done ? 1 : 0.5,
                        transition: "all 0.3s",
                      }}>
                        {step.icon}
                      </div>
                      {i < timeline.length - 1 && (
                        <div style={{ width: "2px", flex: 1, minHeight: "20px", margin: "4px 0", background: step.done ? "linear-gradient(to bottom, #16A34A, #BBF7D0)" : "#E2E8F0" }} />
                      )}
                    </div>

                    {/* Right: content */}
                    <div style={{ paddingBottom: i < timeline.length - 1 ? "16px" : "0", flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 800, color: step.done ? "#0F172A" : "#94A3B8", margin: 0 }}>{step.label}</p>
                      <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 500, marginTop: "3px" }}>{step.date}</p>
                      {step.done && (
                        <div style={{ marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 700, color: "#16A34A" }}>
                          <CheckCircle style={{ width: "11px", height: "11px" }} /> Complete
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── AI SHOPPING ASSISTANT ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginBottom: "32px" }}>
          {/* Toggle header */}
          <button
            id="ai-assistant-toggle"
            onClick={() => setChatOpen(!chatOpen)}
            style={{
              width: "100%", padding: "18px 24px", borderRadius: chatOpen ? "22px 22px 0 0" : "22px",
              background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
              border: "1.5px solid #BBF7D0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", transition: "all 0.2s",
              borderBottomColor: chatOpen ? "transparent" : "#BBF7D0",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "linear-gradient(135deg, #16A34A, #22C55E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(22,163,74,0.28)" }}>
                <Bot style={{ width: "22px", height: "22px", color: "#ffffff" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{t("aiAssistant")}</p>
                <p style={{ fontSize: "13px", color: "#64748B", fontWeight: 500, margin: "2px 0 0" }}>{t("askMeAboutFreshnessPriceRecipe")}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#16A34A", background: "#DCFCE7", padding: "4px 10px", borderRadius: "99px", border: "1px solid #86EFAC" }}>Powered by Gemini AI</span>
              <Sparkles style={{ width: "20px", height: "20px", color: "#16A34A" }} />
            </div>
          </button>

          <AnimatePresence>
            {chatOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div style={{ background: "#ffffff", border: "1.5px solid #BBF7D0", borderTop: "none", borderRadius: "0 0 22px 22px", padding: "20px 24px 24px" }}>
                  {/* Quick questions */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
                    {QUICK_QUESTIONS.map((q) => (
                      <button key={q} onClick={() => sendChat(q)}
                        style={{ padding: "7px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#16A34A", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#DCFCE7"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#F0FDF4"; }}>
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Chat messages */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "280px", overflowY: "auto", marginBottom: "16px", paddingRight: "4px" }}>
                    {chatMessages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                    {chatLoading && (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#DCFCE7", border: "1px solid #86EFAC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Bot style={{ width: "15px", height: "15px", color: "#16A34A" }} />
                        </div>
                        <div style={{ padding: "10px 14px", borderRadius: "16px", borderTopLeftRadius: "4px", background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", gap: "5px", alignItems: "center" }}>
                          {[0, 1, 2].map((i) => (
                            <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#16A34A", animation: "bounce 1s infinite", animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChat(chatInput)}
                      placeholder="Ask about freshness, price, recipes..."
                      style={{ flex: 1, height: "48px", padding: "0 16px", borderRadius: "14px", border: "1.5px solid #BBF7D0", background: "#F8FAFC", fontSize: "14px", color: "#0F172A", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                      onFocus={e => { e.target.style.borderColor = "#16A34A"; e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "#BBF7D0"; e.target.style.boxShadow = "none"; }}
                    />
                    <button
                      onClick={() => sendChat(chatInput)}
                      disabled={chatLoading || !chatInput.trim()}
                      style={{ width: "48px", height: "48px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #16A34A, #22C55E)", display: "flex", alignItems: "center", justifyContent: "center", cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer", opacity: chatLoading || !chatInput.trim() ? 0.5 : 1, transition: "all 0.2s", boxShadow: "0 4px 14px rgba(22,163,74,0.28)" }}>
                      <Send style={{ width: "18px", height: "18px", color: "#ffffff" }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}