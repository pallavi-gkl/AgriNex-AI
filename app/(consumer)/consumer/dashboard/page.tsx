"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview Consumer Dashboard — /consumer/dashboard
 * Phase 11 — Premium enterprise-grade redesign.
 * Preserves all existing hooks, data sources, and routing.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, Heart, Truck, Star, TrendingUp, Zap, Award,
  Bell, ArrowRight, Package, MapPin, Leaf, Sparkles, BarChart2,
  CheckCircle2, Clock, Gift, Users, ChevronRight, Calendar,
  RefreshCw, Bot, ArrowUp, ArrowDown, ShieldCheck, Flame,
  Sun, CloudRain, ThumbsUp, Eye, Repeat, ChevronLeft, ChevronDown,
  CreditCard, Headphones, MessageCircle, ExternalLink, Circle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useConsumerOrders } from "@/hooks/useConsumerOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { supabase } from "@/lib/supabase";
import { DEMO_ORDERS, DEMO_CROPS, DEMO_MARKET_PRICES } from "@/lib/demoData";

/* ─── Demo Data ──────────────────────────────────────────────────────────── */
const DEMO_SPENDING = [
  { month: "Jan", spent: 2400, saved: 420 },
  { month: "Feb", spent: 4200, saved: 680 },
  { month: "Mar", spent: 3800, saved: 590 },
  { month: "Apr", spent: 5600, saved: 870 },
  { month: "May", spent: 4900, saved: 740 },
  { month: "Jun", spent: 6200, saved: 960 },
];

const DEMO_CATEGORY_SPEND = [
  { name: "Grains",     value: 38, color: "#10b981" },
  { name: "Fruits",     value: 28, color: "#f59e0b" },
  { name: "Vegetables", value: 22, color: "#34d399" },
  { name: "Spices",     value: 12, color: "#8b5cf6" },
];

const AI_INSIGHTS = [
  { icon: "💰", text: "You saved ₹4,260 compared to supermarket prices this month!", badge: "Savings", color: "#10b981" },
  { icon: "🌿", text: "78% of your purchases are organic — great for your health!", badge: "Organic", color: "#34d399" },
  { icon: "📈", text: "Alphonso Mango prices will rise 15% next week. Buy now!", badge: "Price Alert", color: "#f59e0b" },
  { icon: "🌾", text: "Fresh Basmati Rice from Rajesh Kumar arrives in 2 days!", badge: "Fresh Stock", color: "#38bdf8" },
  { icon: "⭐", text: "3 delivered orders pending reviews. Share your experience!", badge: "Review", color: "#a78bfa" },
];

const DEMO_FARMERS = [
  { id: "f1", name: "Rajesh Kumar", location: "Karnal, Haryana", rating: 4.9, specialty: "Basmati Rice", reviews: 124, avatar: "R", color: "#10b981" },
  { id: "f2", name: "Priya Naidu",  location: "Ratnagiri, MH",   rating: 4.8, specialty: "Alphonso Mango", reviews: 98, avatar: "P", color: "#f59e0b" },
  { id: "f3", name: "Anand Reddy",  location: "Erode, TN",        rating: 4.7, specialty: "Turmeric", reviews: 76, avatar: "A", color: "#8b5cf6" },
];

const DEMO_RECOMMENDATIONS = [
  { id: "rec1", name: "Organic Basmati Rice", price: 88, unit: "kg", rating: 4.9, farmer: "Rajesh Kumar", reason: "Based on purchase history", emoji: "🌾", badge: "Top Pick", color: "#10b981" },
  { id: "rec2", name: "Alphonso Mangoes",     price: 350, unit: "kg", rating: 4.8, farmer: "Priya Naidu",  reason: "In season near you",      emoji: "🥭", badge: "Seasonal",  color: "#f59e0b" },
  { id: "rec3", name: "Organic Turmeric",     price: 152, unit: "kg", rating: 4.7, farmer: "Anand Reddy",  reason: "Trending in your area",    emoji: "🌿", badge: "Trending",  color: "#8b5cf6" },
  { id: "rec4", name: "Fresh Tomatoes",       price: 28,  unit: "kg", rating: 4.6, farmer: "Suresh Singh", reason: "Price drop alert",          emoji: "🍅", badge: "Deal",      color: "#ef4444" },
];

const RECENT_ACTIVITY = [
  { icon: "🛒", text: "Purchased 5 kg Basmati Rice",   time: "2 hours ago",    color: "#10b981" },
  { icon: "⭐", text: "Reviewed Alphonso Mangoes",      time: "Yesterday",      color: "#f59e0b" },
  { icon: "❤️", text: "Added Turmeric to Wishlist",    time: "2 days ago",     color: "#ef4444" },
  { icon: "🎁", text: "Earned 88 reward points",        time: "3 days ago",     color: "#8b5cf6" },
  { icon: "📦", text: "Order #A3F21 delivered",         time: "4 days ago",     color: "#38bdf8" },
];

const STATUS_COLOR: Record<string, string> = {
  pending:          "#fbbf24",
  accepted:         "#34d399",
  quality_verified: "#c084fc",
  dispatched:       "#38bdf8",
  delivered:        "#4ade80",
  cancelled:        "#f87171",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Placed", accepted: "Accepted", quality_verified: "Verified",
  dispatched: "In Transit", delivered: "Delivered", cancelled: "Cancelled",
};

/* ─── Micro Components ───────────────────────────────────────────────────── */

function SectionTitle({ children, sub, action }: { children: React.ReactNode; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-0.3px" }}>{children}</h2>
        {sub && <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function ViewAllLink({ href, label = "View All" }: { href: string; label?: string }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#10b981", textDecoration: "none" }}>
      {label} <ChevronRight style={{ width: "13px", height: "13px" }} />
    </Link>
  );
}

function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */
export default function ConsumerDashboardPage() {
  const { t }                  = useTranslation("consumer");
  const router                 = useRouter();
  const { location, weather }  = useLocationWeather();
  const { data: liveOrders = [], isLoading } = useConsumerOrders();
  const { wishlist }           = useWishlist();

  const [profile, setProfile]     = useState<any>(null);
  const [insightIdx, setInsightIdx] = useState(0);
  // greeting is client-only to prevent hydration mismatch
  const [greeting, setGreeting]   = useState("");
  const [mounted, setMounted]     = useState(false);
  const [priceIdx, setPriceIdx]   = useState(0);
  const tickerRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const hr = new Date().getHours();
    setGreeting(hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setInsightIdx((i) => (i + 1) % AI_INSIGHTS.length), 4500);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll price ticker
  useEffect(() => {
    tickerRef.current = setInterval(() => setPriceIdx((i) => (i + 1) % DEMO_MARKET_PRICES.length), 2500);
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        (supabase as any).from("profiles").select("*").eq("id", user.id).maybeSingle()
          .then(({ data }: any) => setProfile(data));
      }
    });
  }, []);

  // Guard all array operations
  const safeOrders  = Array.isArray(liveOrders) ? liveOrders : [];
  const orders      = safeOrders;
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  const totalSpent  = orders.reduce((s: number, o: any) => s + (Number(o?.total_amount) || 0), 0);
  const totalSaved  = isFinite(totalSpent) ? Math.floor(totalSpent * 0.12) : 0;
  const deliveredCount = orders.filter((o: any) => o?.status === "delivered").length;
  const activeCount = orders.filter((o: any) => ["pending", "accepted", "quality_verified", "dispatched"].includes(o?.status ?? "")).length;
  const rewardPoints = isFinite(totalSpent) ? Math.floor(totalSpent / 100) * 10 : 0;

  const spendingData = liveOrders.length > 0
    ? (() => {
        const monthly: Record<string, number> = {};
        liveOrders.forEach((o: any) => {
          const m = new Date(o.created_at).toLocaleString("en-US", { month: "short" });
          monthly[m] = (monthly[m] ?? 0) + (o.total_amount ?? 0);
        });
        return Object.entries(monthly).map(([month, spent]) => ({ month, spent, saved: Math.floor(spent * 0.12) }));
      })()
    : DEMO_SPENDING;

  const firstName = profile?.full_name?.split(" ")[0] ?? "Shopper";

  /* ── Styles ─────────────────────────────────────────────────────────────── */
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "28px 32px 48px",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .stat-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.07) !important;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06) !important;
        }
        .quick-action:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.08) !important;
        }
        .btn-primary {
          background: linear-gradient(135deg,#10b981,#059669);
          color:#fff; border:none; cursor:pointer;
          transition: transform .15s, box-shadow .15s;
        }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(16,185,129,.35); }
        .btn-outline {
          background:#fff; border:1px solid #e2e8f0; color:#374151; cursor:pointer;
          transition: border-color .15s, background .15s;
        }
        .btn-outline:hover { border-color:#10b981; background:#f0fdf4; color:#10b981; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          borderRadius: "24px",
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #10b981 100%)",
          padding: "40px 44px",
          marginBottom: "28px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(5,150,105,.18)",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"260px", height:"260px", borderRadius:"50%", background:"rgba(255,255,255,.04)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-60px", left:"40%", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(255,255,255,.03)", pointerEvents:"none" }} />

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"20px", position:"relative" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
              <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#4ade80", display:"inline-block", boxShadow:"0 0 8px #4ade80" }} />
              <span style={{ color:"#6ee7b7", fontSize:"12px", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                Consumer Dashboard · Live
              </span>
            </div>
            <h1 style={{ fontSize:"30px", fontWeight:900, color:"#ffffff", margin:"0 0 8px", letterSpacing:"-0.5px" }}>
              {mounted ? greeting : "Welcome back"}, {firstName}! 👋
            </h1>
            <p style={{ color:"#a7f3d0", fontSize:"14px", margin:"0 0 28px", fontWeight:500, maxWidth:"480px" }}>
              Fresh produce from trusted farmers is waiting for you today. Discover today's best deals below.
            </p>
            <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
              <Link
                href="/consumer/marketplace"
                style={{ display:"flex", alignItems:"center", gap:"8px", padding:"11px 22px", borderRadius:"14px", background:"#ffffff", color:"#064e3b", fontSize:"13px", fontWeight:800, textDecoration:"none", boxShadow:"0 4px 14px rgba(0,0,0,.12)", transition:"transform .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                <ShoppingBag style={{ width:"15px", height:"15px" }} /> Browse Marketplace
              </Link>
              <button
                onClick={() => router.push("/consumer/ai-assistant")}
                style={{ display:"flex", alignItems:"center", gap:"8px", padding:"11px 22px", borderRadius:"14px", background:"rgba(255,255,255,.12)", color:"#ffffff", fontSize:"13px", fontWeight:700, border:"1px solid rgba(255,255,255,.25)", cursor:"pointer", backdropFilter:"blur(8px)", transition:"background .15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.2)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.12)")}
              >
                <Sparkles style={{ width:"15px", height:"15px" }} /> AI Shopping Assistant
              </button>
            </div>
          </div>

          {/* Stats mini-panel */}
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
{(() => {
              const heroStats = [
                { value: orders.length ?? 0,                                label: "Orders",  icon: "📦" },
                { value: `₹${(isFinite(totalSaved) ? totalSaved : 0).toLocaleString()}`, label: "Saved",   icon: "💰" },
                { value: safeWishlist.length ?? 0,                          label: "Wishlist", icon: "❤️" },
                { value: isFinite(rewardPoints) ? rewardPoints : 0,         label: "Points",  icon: "🎁" },
              ];
              const safeHeroStats = Array.isArray(heroStats) ? heroStats : [];
              return safeHeroStats.map((stat) => (
                <div key={stat?.label ?? "stat"} style={{ background:"rgba(255,255,255,.1)", backdropFilter:"blur(12px)", borderRadius:"16px", padding:"16px 20px", border:"1px solid rgba(255,255,255,.15)", textAlign:"center", minWidth:"80px" }}>
                  <div style={{ fontSize:"18px", marginBottom:"4px" }}>{stat?.icon ?? "📊"}</div>
                  <div style={{ fontSize:"18px", fontWeight:900, color:"#ffffff", lineHeight:1 }}>{String(stat?.value ?? "0")}</div>
                  <div style={{ fontSize:"11px", color:"#a7f3d0", marginTop:"2px", fontWeight:600 }}>{stat?.label ?? ""}</div>
                </div>
              ));
            })()}
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — AI INSIGHT CAROUSEL
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "20px 24px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 1px 8px rgba(0,0,0,.03)",
        }}
      >
        <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Sparkles style={{ width:"18px", height:"18px", color:"#fff" }} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:"10px", fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"4px" }}>
            AI Insight for You
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={insightIdx}
              initial={{ opacity:0, y:6 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-6 }}
              transition={{ duration:0.25 }}
              style={{ margin:0, fontSize:"14px", fontWeight:600, color:"#1e293b" }}
            >
              <span style={{ marginRight:"8px" }}>{AI_INSIGHTS[insightIdx].icon}</span>
              {AI_INSIGHTS[insightIdx].text}
            </motion.p>
          </AnimatePresence>
        </div>
        <span style={{ padding:"4px 10px", borderRadius:"8px", fontSize:"10px", fontWeight:700, background:`${AI_INSIGHTS[insightIdx].color}15`, color:AI_INSIGHTS[insightIdx].color, border:`1px solid ${AI_INSIGHTS[insightIdx].color}30`, flexShrink:0 }}>
          {AI_INSIGHTS[insightIdx].badge}
        </span>
        <div style={{ display:"flex", gap:"5px", flexShrink:0 }}>
          {AI_INSIGHTS.map((_, i) => (
            <button key={i} onClick={() => setInsightIdx(i)} style={{ width:"6px", height:"6px", borderRadius:"50%", border:"none", cursor:"pointer", background: i === insightIdx ? "#10b981" : "#e2e8f0", padding:0, transition:"background .2s" }} />
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — STAT CARDS (6 cards)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"16px", marginBottom:"28px" }}>
        {[
          { icon: ShoppingBag, value: String(orders.length ?? 0),                              label:"Total Orders",     sub:`${activeCount ?? 0} active`,                                        color:"#10b981", href:"/consumer/orders" },
          { icon: TrendingUp,  value: `₹${(isFinite(totalSpent) ? totalSpent : 0).toLocaleString()}`, label:"Total Spending",   sub:`₹${(isFinite(totalSaved) ? totalSaved : 0).toLocaleString()} saved`,  color:"#f59e0b", href:null },
          { icon: Heart,       value: String(safeWishlist.length ?? 0),                        label:"Wishlist",          sub:"Saved for later",                                                    color:"#ef4444", href:"/consumer/wishlist" },
          { icon: Award,       value: (isFinite(rewardPoints) ? rewardPoints : 0).toLocaleString(), label:"Reward Points", sub:`≈ ₹${isFinite(rewardPoints) ? Math.floor(rewardPoints / 10) : 0} cashback`, color:"#8b5cf6", href:null },
          { icon: Truck,       value: String(activeCount ?? 0),                                label:"Active Deliveries", sub:"In transit",                                                         color:"#38bdf8", href:"/consumer/orders" },
          { icon: Users,       value: "12",                                                    label:"Fav. Farmers",      sub:"Following",                                                          color:"#ec4899", href:null },
        ].map((stat, i) => {
          if (!stat || !stat.icon || !stat.label) return null;
          const Icon = stat.icon;
          const safeValue = String(stat?.value ?? "0");
          const safeSub   = stat?.sub ?? "";
          const safeColor = stat?.color ?? "#10b981";
          const inner = (
            <motion.div
              initial={{ opacity:0, y:16 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.06 }}
              className="stat-hover"
              style={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:"20px", padding:"20px", display:"flex", alignItems:"center", gap:"14px", boxShadow:"0 1px 6px rgba(0,0,0,.03)", transition:"all .2s ease", cursor: stat.href ? "pointer" : "default" }}
            >
              <div style={{ width:"46px", height:"46px", borderRadius:"14px", background:`${safeColor}12`, border:`1px solid ${safeColor}25`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon style={{ width:"20px", height:"20px", color:safeColor }} />
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:"22px", fontWeight:900, color:"#1e293b", lineHeight:1.1 }}>{safeValue}</div>
                <div style={{ fontSize:"12px", color:"#64748b", fontWeight:600, marginTop:"2px" }}>{stat.label ?? ""}</div>
                {safeSub ? <div style={{ fontSize:"11px", color:safeColor, fontWeight:700, marginTop:"2px" }}>{safeSub}</div> : null}
              </div>
              {stat.href ? <ChevronRight style={{ width:"14px", height:"14px", color:"#cbd5e1", marginLeft:"auto", flexShrink:0 }} /> : null}
            </motion.div>
          );
          return stat.href
            ? <Link key={stat.label} href={stat.href} style={{ textDecoration:"none" }}>{inner}</Link>
            : <div key={stat.label}>{inner}</div>;
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — ANALYTICS CHARTS
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px", marginBottom:"28px" }}>
        {/* Spending area chart — 2/3 width */}
        <Card style={{ gridColumn:"span 2", padding:"24px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
            <div>
              <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#1e293b" }}>Monthly Spending & Savings</h3>
              <p style={{ margin:"3px 0 0", fontSize:"12px", color:"#94a3b8" }}>Compared to supermarket prices</p>
            </div>
            <div style={{ display:"flex", gap:"14px", fontSize:"12px", color:"#64748b" }}>
              <span style={{ display:"flex", alignItems:"center", gap:"5px" }}><span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#10b981", display:"inline-block" }} /> Spent</span>
              <span style={{ display:"flex", alignItems:"center", gap:"5px" }}><span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#f59e0b", display:"inline-block" }} /> Saved</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendingData}>
              <defs>
                <linearGradient id="cSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#94a3b8", fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:"12px", boxShadow:"0 4px 16px rgba(0,0,0,.08)", fontSize:"12px" }}
                formatter={(v: any) => [`₹${v.toLocaleString()}`, ""]}
              />
              <Area type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={2.5} fill="url(#cSpent)" />
              <Area type="monotone" dataKey="saved" stroke="#f59e0b" strokeWidth={2}   fill="url(#cSaved)" strokeDasharray="4 3" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category pie chart — 1/3 width */}
        <Card style={{ padding:"24px" }}>
          <h3 style={{ margin:"0 0 20px", fontSize:"15px", fontWeight:800, color:"#1e293b" }}>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={DEMO_CATEGORY_SPEND} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {DEMO_CATEGORY_SPEND.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, ""]} contentStyle={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:"10px", fontSize:"12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
            {DEMO_CATEGORY_SPEND.map((c) => (
              <div key={c.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:"12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                  <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:c.color, display:"inline-block" }} />
                  <span style={{ color:"#64748b", fontWeight:500 }}>{c.name}</span>
                </div>
                <span style={{ fontWeight:700, color:"#1e293b" }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — AI RECOMMENDATIONS
      ══════════════════════════════════════════════════════════════════════ */}
      <Card style={{ marginBottom:"28px" }}>
        <SectionTitle sub="Personalised based on your purchase history & location" action={<ViewAllLink href="/consumer/marketplace" label="Shop All" />}>
          🤖 AI Recommendations
        </SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"14px" }}>
          {DEMO_RECOMMENDATIONS.map((rec) => (
            <motion.div
              key={rec.id}
              whileHover={{ y:-4 }}
              className="card-hover"
              style={{ border:"1px solid #e2e8f0", borderRadius:"16px", overflow:"hidden", background:"#fafafa", transition:"all .2s ease" }}
            >
              <div style={{ height:"90px", background:`linear-gradient(135deg,${rec.color}18,${rec.color}08)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"38px", position:"relative" }}>
                {rec.emoji}
                <span style={{ position:"absolute", top:"8px", right:"8px", fontSize:"10px", fontWeight:800, padding:"3px 8px", borderRadius:"6px", background:rec.color, color:"#fff" }}>{rec.badge}</span>
              </div>
              <div style={{ padding:"12px" }}>
                <div style={{ fontSize:"13px", fontWeight:700, color:"#1e293b", marginBottom:"3px" }}>{rec.name}</div>
                <div style={{ fontSize:"12px", color:"#64748b", marginBottom:"6px" }}>{rec.farmer}</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
                  <span style={{ fontWeight:800, color:"#10b981", fontSize:"14px" }}>₹{rec.price}/{rec.unit}</span>
                  <span style={{ fontSize:"11px", color:"#f59e0b", fontWeight:700, display:"flex", alignItems:"center", gap:"2px" }}>★ {rec.rating}</span>
                </div>
                <div style={{ fontSize:"10px", color:"#94a3b8", marginBottom:"10px", fontStyle:"italic" }}>{rec.reason}</div>
                <div style={{ display:"flex", gap:"6px" }}>
                  <Link href="/consumer/marketplace" style={{ flex:1, textAlign:"center", padding:"6px", borderRadius:"8px", background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontSize:"11px", fontWeight:700, textDecoration:"none" }}>
                    Buy Now
                  </Link>
                  <button style={{ padding:"6px 8px", border:"1px solid #e2e8f0", borderRadius:"8px", background:"#fff", cursor:"pointer", color:"#ef4444" }}>
                    <Heart style={{ width:"12px", height:"12px" }} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6 — RECENT ORDERS + WISHLIST PREVIEW
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:"20px", marginBottom:"28px" }}>
        {/* Recent Orders */}
        <Card>
          <SectionTitle sub="Latest transactions" action={<ViewAllLink href="/consumer/orders" />}>
            📦 Recent Orders
          </SectionTitle>
          {isLoading ? (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {[1,2,3].map(i => <div key={i} style={{ height:"60px", borderRadius:"12px", background:"#f1f5f9", animation:"pulse 1.5s infinite" }} />)}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
              {orders.slice(0, 5).map((order: any) => {
                const firstItem = order.order_items?.[0];
                const color = STATUS_COLOR[order.status] ?? "#94a3b8";
                const STEPS = ["pending","accepted","quality_verified","dispatched","delivered"];
                const stepIdx = STEPS.indexOf(order.status);
                const progress = order.status === "cancelled" ? 0 : Math.round(((stepIdx + 1) / STEPS.length) * 100);
                return (
                  <Link key={order.id} href="/consumer/orders" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"12px", padding:"12px", borderRadius:"14px", border:"1px solid transparent", transition:"all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                  >
                    <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:`${color}12`, border:`1px solid ${color}25`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                      {firstItem?.product?.image_url
                        ? <img src={firstItem.product.image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        : <Leaf style={{ width:"16px", height:"16px", color }} />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2px" }}>
                        <span style={{ fontSize:"13px", fontWeight:700, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"160px" }}>
                          {firstItem?.product?.title ?? "Order"}
                        </span>
                        <span style={{ fontSize:"13px", fontWeight:800, color:"#10b981" }}>₹{(order.total_amount ?? 0).toLocaleString()}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
                        <span style={{ fontSize:"11px", color:"#94a3b8" }}>#{order.id.substring(0, 6).toUpperCase()}</span>
                        <span style={{ fontSize:"11px", fontWeight:700, padding:"2px 7px", borderRadius:"6px", background:`${color}15`, color }}>{STATUS_LABEL[order.status] ?? order.status}</span>
                      </div>
                      {order.status !== "cancelled" && (
                        <div style={{ height:"3px", background:"#f1f5f9", borderRadius:"99px", overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${color},${color}bb)`, borderRadius:"99px", transition:"width .5s ease" }} />
                        </div>
                      )}
                    </div>
                    <ChevronRight style={{ width:"14px", height:"14px", color:"#cbd5e1", flexShrink:0 }} />
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* Wishlist Preview */}
        <Card>
          <SectionTitle sub="Items saved for later" action={<ViewAllLink href="/consumer/wishlist" />}>
            ❤️ Wishlist
          </SectionTitle>
          {safeWishlist.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px 16px", color:"#94a3b8" }}>
              <Heart style={{ width:"32px", height:"32px", margin:"0 auto 10px", opacity:.3 }} />
              <p style={{ margin:0, fontSize:"13px" }}>No items saved yet</p>
              <Link href="/consumer/marketplace" style={{ display:"inline-block", marginTop:"12px", padding:"8px 16px", borderRadius:"10px", background:"#f0fdf4", color:"#10b981", fontSize:"12px", fontWeight:700, textDecoration:"none" }}>
                Browse Market
              </Link>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {safeWishlist.slice(0, 5).map((item: any) => (
                <Link key={item.id} href={`/consumer/marketplace/${item.id}`}
                  style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px", borderRadius:"12px", border:"1px solid transparent", textDecoration:"none", transition:"all .15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                >
                  <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"#fef2f2", border:"1px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <Leaf style={{ width:"14px", height:"14px", color:"#ef4444" }} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"13px", fontWeight:700, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</div>
                    <div style={{ fontSize:"12px", color:"#10b981", fontWeight:700, marginTop:"1px" }}>₹{item.pricePerUnit}/{item.unitType}</div>
                  </div>
                  <button style={{ padding:"5px 10px", borderRadius:"8px", border:"1px solid #e2e8f0", background:"#fff", fontSize:"11px", fontWeight:700, color:"#374151", cursor:"pointer" }}>Add</button>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 7 — LIVE MARKET PRICES TICKER
      ══════════════════════════════════════════════════════════════════════ */}
      <Card style={{ marginBottom:"28px", padding:"20px 24px" }}>
        <SectionTitle sub="Real-time mandi prices from across India" action={<ViewAllLink href="/consumer/marketplace" label="Full Market" />}>
          📊 Live Market Prices
        </SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"12px" }}>
          {DEMO_MARKET_PRICES.slice(0, 8).map((p) => (
            <div key={p.crop} style={{ border:"1px solid #e2e8f0", borderRadius:"14px", padding:"14px", background:"#fafafa", transition:"all .2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.background = "#f0fdf4"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fafafa"; }}
            >
              <div style={{ fontSize:"12px", fontWeight:700, color:"#1e293b", marginBottom:"4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.crop}</div>
              <div style={{ fontSize:"16px", fontWeight:900, color:"#1e293b", marginBottom:"2px" }}>₹{p.price}<span style={{ fontSize:"11px", fontWeight:500, color:"#94a3b8" }}>/{p.unit}</span></div>
              <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                {p.trend === "up"
                  ? <ArrowUp style={{ width:"11px", height:"11px", color:"#10b981" }} />
                  : p.trend === "down"
                  ? <ArrowDown style={{ width:"11px", height:"11px", color:"#ef4444" }} />
                  : <span style={{ fontSize:"10px", color:"#94a3b8" }}>—</span>}
                <span style={{ fontSize:"11px", fontWeight:700, color: p.trend === "up" ? "#10b981" : p.trend === "down" ? "#ef4444" : "#94a3b8" }}>
                  {Math.abs(p.change)}%
                </span>
                <span style={{ fontSize:"10px", color:"#94a3b8", marginLeft:"2px" }}>{p.mandi.split(" ")[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 8 — FAVOURITE FARMERS + WEATHER ADVISORY
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"20px", marginBottom:"28px" }}>
        {/* Favourite Farmers */}
        <Card>
          <SectionTitle sub="Farmers you follow and trust">👨‍🌾 Favourite Farmers</SectionTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {DEMO_FARMERS.map((farmer) => (
              <div key={farmer.id} style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px", borderRadius:"14px", border:"1px solid #e2e8f0", background:"#fafafa", transition:"all .15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#a7f3d0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                <div style={{ width:"44px", height:"44px", borderRadius:"14px", background:`${farmer.color}18`, border:`1px solid ${farmer.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", fontWeight:900, color:farmer.color, flexShrink:0 }}>
                  {farmer.avatar}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"14px", fontWeight:700, color:"#1e293b" }}>{farmer.name}</div>
                  <div style={{ fontSize:"12px", color:"#64748b", marginTop:"1px" }}>{farmer.specialty} · {farmer.location}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"3px" }}>
                    <Star style={{ width:"11px", height:"11px", color:"#f59e0b", fill:"#f59e0b" }} />
                    <span style={{ fontSize:"12px", fontWeight:700, color:"#1e293b" }}>{farmer.rating}</span>
                    <span style={{ fontSize:"11px", color:"#94a3b8" }}>· {farmer.reviews} reviews</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"6px", flexShrink:0 }}>
                  <button style={{ padding:"6px 12px", borderRadius:"8px", border:`1px solid ${farmer.color}`, background:"transparent", color:farmer.color, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>Following</button>
                  <Link href="/consumer/marketplace" style={{ padding:"6px 12px", borderRadius:"8px", background:farmer.color, color:"#fff", fontSize:"11px", fontWeight:700, textDecoration:"none" }}>Visit Farm</Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weather Advisory + Savings */}
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {/* Weather Advisory */}
          <Card style={{ flex:1, padding:"20px" }}>
            <h3 style={{ margin:"0 0 14px", fontSize:"14px", fontWeight:800, color:"#1e293b" }}>🌤 Weather Shopping Advisory</h3>
            <div style={{ padding:"12px", borderRadius:"12px", background:"linear-gradient(135deg,#eff6ff,#dbeafe)", border:"1px solid #bfdbfe", marginBottom:"12px" }}>
              <div style={{ fontSize:"13px", fontWeight:700, color:"#1e293b", marginBottom:"4px" }}>
                {weather?.condition_icon || "⛅"} {weather?.temperature ? `${weather.temperature}°C` : "32°C"} · {weather?.condition || "Partly Cloudy"}
              </div>
              <div style={{ fontSize:"12px", color:"#3b82f6" }}>{location?.city || "Karnal"}, {location?.state || "Haryana"}</div>
            </div>
            <div style={{ fontSize:"12px", fontWeight:700, color:"#1e293b", marginBottom:"8px" }}>🛒 Today's Recommendations</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {["Buy leafy vegetables today (rain tomorrow)", "Alphonso Mango — peak season, buy now", "Protect fresh produce — humidity high"].map((tip, i) => (
                <div key={i} style={{ display:"flex", gap:"8px", fontSize:"12px", color:"#475569", alignItems:"flex-start" }}>
                  <span style={{ color:"#10b981", flexShrink:0, marginTop:"1px" }}>•</span> {tip}
                </div>
              ))}
            </div>
          </Card>

          {/* Savings Summary */}
          <Card style={{ padding:"20px" }}>
            <h3 style={{ margin:"0 0 14px", fontSize:"14px", fontWeight:800, color:"#1e293b" }}>💰 Your Savings</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {[
                { label:"You Paid",         value:`₹${totalSpent.toLocaleString()}`,  color:"#10b981" },
                { label:"Market Average",   value:`₹${(totalSpent * 1.14).toFixed(0)}`, color:"#94a3b8" },
                { label:"You Saved",        value:`₹${totalSaved.toLocaleString()}`,  color:"#f59e0b" },
              ].map((row) => (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between", fontSize:"13px" }}>
                  <span style={{ color:"#64748b", fontWeight:500 }}>{row.label}</span>
                  <span style={{ fontWeight:800, color:row.color }}>{row.value}</span>
                </div>
              ))}
              <div style={{ height:"1px", background:"#f1f5f9", margin:"4px 0" }} />
              <div style={{ padding:"10px", borderRadius:"10px", background:"#f0fdf4", border:"1px solid #bbf7d0", textAlign:"center" }}>
                <div style={{ fontSize:"20px", fontWeight:900, color:"#10b981" }}>₹{(totalSaved * 12).toLocaleString()}</div>
                <div style={{ fontSize:"11px", color:"#64748b", fontWeight:600, marginTop:"2px" }}>Projected Annual Savings</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 9 — REWARD CENTER + RECENT ACTIVITY
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"28px" }}>
        {/* Reward Center */}
        <Card>
          <SectionTitle sub="Your loyalty rewards and cashback">🎁 Reward Center</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"14px" }}>
            {[
              { icon:"🪙", label:"Reward Coins",   value:rewardPoints,                 color:"#f59e0b" },
              { icon:"💵", label:"Cashback",        value:`₹${Math.floor(rewardPoints/10)}`, color:"#10b981" },
              { icon:"🎟️", label:"Active Coupons", value:"3",                          color:"#8b5cf6" },
              { icon:"👥", label:"Referral Bonus",  value:"₹50",                       color:"#38bdf8" },
            ].map((r) => (
              <div key={r.label} style={{ padding:"14px", borderRadius:"14px", border:"1px solid #e2e8f0", background:`${r.color}08`, textAlign:"center" }}>
                <div style={{ fontSize:"22px", marginBottom:"4px" }}>{r.icon}</div>
                <div style={{ fontSize:"16px", fontWeight:900, color:r.color }}>{r.value}</div>
                <div style={{ fontSize:"11px", color:"#64748b", fontWeight:600, marginTop:"1px" }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding:"12px", borderRadius:"12px", background:"linear-gradient(135deg,#f0fdf4,#dcfce7)", border:"1px solid #bbf7d0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"13px", fontWeight:700, color:"#1e293b" }}>Gold Member</div>
              <div style={{ fontSize:"11px", color:"#64748b" }}>{rewardPoints} / 1000 pts to Platinum</div>
            </div>
            <div style={{ fontSize:"11px", fontWeight:700, color:"#10b981" }}>★ Gold</div>
          </div>
        </Card>

        {/* Recent Activity Timeline */}
        <Card>
          <SectionTitle sub="Your recent marketplace activity">🕐 Recent Activity</SectionTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
            {RECENT_ACTIVITY.map((act, i) => (
              <div key={i} style={{ display:"flex", gap:"14px", alignItems:"flex-start", paddingBottom: i < RECENT_ACTIVITY.length - 1 ? "14px" : 0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"10px", background:`${act.color}15`, border:`1px solid ${act.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>
                    {act.icon}
                  </div>
                  {i < RECENT_ACTIVITY.length - 1 && <div style={{ width:"1px", flex:1, background:"#e2e8f0", marginTop:"4px", minHeight:"14px" }} />}
                </div>
                <div style={{ paddingTop:"4px" }}>
                  <div style={{ fontSize:"13px", fontWeight:600, color:"#1e293b" }}>{act.text}</div>
                  <div style={{ fontSize:"11px", color:"#94a3b8", marginTop:"1px" }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 10 — QUICK ACTIONS
      ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionTitle sub="Jump to your most-used features">⚡ Quick Actions</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:"12px" }}>
          {[
            { href:"/consumer/marketplace",  icon:ShoppingBag, label:"Browse Market",  color:"#10b981" },
            { href:"/consumer/orders",        icon:Package,     label:"My Orders",      color:"#38bdf8" },
            { href:"/consumer/wishlist",      icon:Heart,       label:"Wishlist",       color:"#ef4444" },
            { href:"/consumer/orders",        icon:Truck,       label:"Track Orders",   color:"#f59e0b" },
            { href:"/consumer/reviews",       icon:Star,        label:"Write Review",   color:"#a78bfa" },
            { href:"/consumer/ai-assistant",  icon:Sparkles,    label:"AI Assistant",   color:"#06b6d4" },
            { href:"/consumer/settings",      icon:Gift,        label:"Rewards",        color:"#ec4899" },
            { href:"/consumer/notifications", icon:Bell,        label:"Notifications",  color:"#f97316" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href + action.label} href={action.href}
                className="quick-action"
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"10px", padding:"18px 10px", borderRadius:"16px", border:"1px solid #e2e8f0", background:"#fafafa", textDecoration:"none", transition:"all .2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = `${action.color}08`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fafafa"; }}
              >
                <div style={{ width:"44px", height:"44px", borderRadius:"14px", background:`${action.color}14`, border:`1px solid ${action.color}25`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon style={{ width:"20px", height:"20px", color:action.color }} />
                </div>
                <span style={{ fontSize:"12px", fontWeight:700, color:"#374151", textAlign:"center" }}>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}