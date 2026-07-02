"use client";

/**
 * @fileoverview Customer Dashboard — /consumer/dashboard
 * Premium dashboard with analytics, AI insights, recent orders,
 * wishlist preview, savings analysis, reward points, and more.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag, Heart, Truck, Star, TrendingUp, Zap, Award,
  Bell, ArrowRight, Package, MapPin, Leaf, Sparkles, BarChart2,
  CheckCircle2, Clock, Gift, Users, ChevronRight, Calendar,
  RefreshCw, Bot,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useConsumerOrders } from "@/hooks/useConsumerOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/lib/supabase";
import { DEMO_ORDERS, DEMO_CROPS, DEMO_MARKET_PRICES } from "@/lib/demoData";

// ─── Demo spending data ────────────────────────────────────────────────────────
const DEMO_SPENDING = [
  { month: "Jan", spent: 2400, saved: 420 },
  { month: "Feb", spent: 4200, saved: 680 },
  { month: "Mar", spent: 3800, saved: 590 },
  { month: "Apr", spent: 5600, saved: 870 },
  { month: "May", spent: 4900, saved: 740 },
  { month: "Jun", spent: 6200, saved: 960 },
];

const DEMO_CATEGORY_SPEND = [
  { name: "Grains", value: 38, color: "#10b981" },
  { name: "Fruits", value: 28, color: "#f59e0b" },
  { name: "Vegetables", value: 22, color: "#34d399" },
  { name: "Spices", value: 12, color: "#8b5cf6" },
];

const AI_INSIGHTS = [
  { icon: "💰", text: "You saved ₹4,260 compared to supermarket prices this month!", type: "saving" },
  { icon: "🌿", text: "78% of your purchases are organic — great for your health!", type: "organic" },
  { icon: "📈", text: "Alphonso Mango prices will rise 15% next week. Buy now!", type: "price" },
  { icon: "🌾", text: "Fresh Basmati Rice from Rajesh Kumar arrives in 2 days — place your order!", type: "fresh" },
  { icon: "⭐", text: "You have 3 delivered orders pending reviews. Share your experience!", type: "review" },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, sub, color, href }: {
  icon: React.ReactNode; value: string | number; label: string; sub?: string;
  color: string; href?: string;
}) {
  const content = (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex items-center gap-4 h-full">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-sm">{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color }}>{sub}</p>}
      </div>
      {href && <ChevronRight className="w-4 h-4 text-slate-600 ml-auto shrink-0" />}
    </div>
  );

  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}

// ─── AI Insight Banner ────────────────────────────────────────────────────────
function AIInsightBanner({ insight }: { insight: typeof AI_INSIGHTS[0] }) {
  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl"
      style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
      <span className="text-xl leading-none mt-0.5">{insight.icon}</span>
      <p className="text-slate-300 text-sm">{insight.text}</p>
    </motion.div>
  );
}

// ─── Recent Order Row ─────────────────────────────────────────────────────────
function RecentOrderRow({ order }: { order: any }) {
  const STATUS_COLOR: Record<string, string> = {
    pending: "#fbbf24", accepted: "#34d399", quality_verified: "#c084fc",
    dispatched: "#38bdf8", delivered: "#4ade80", cancelled: "#f87171",
  };
  const STATUS_LABEL: Record<string, string> = {
    pending: "Placed", accepted: "Accepted", quality_verified: "Verified",
    dispatched: "In Transit", delivered: "Delivered", cancelled: "Cancelled",
  };
  const color = STATUS_COLOR[order.status] ?? "#94a3b8";
  const firstItem = order.order_items?.[0];

  return (
    <Link href="/consumer/orders"
      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 group">
      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0" style={{ background: "rgba(16,185,129,0.08)" }}>
        {firstItem?.product?.image_url ? (
          <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />
        ) : <div className="w-full h-full flex items-center justify-center"><Leaf className="w-4 h-4 text-emerald-400/40" /></div>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white text-xs font-medium truncate">{firstItem?.product?.title ?? "Order"}</p>
        <p className="text-slate-500 text-[11px]">#{order.id.substring(0, 6).toUpperCase()}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-emerald-400 text-xs font-semibold">₹{(order.total_amount ?? 0).toLocaleString()}</p>
        <span className="text-[10px] font-medium" style={{ color }}>{STATUS_LABEL[order.status] ?? order.status}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
    </Link>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ConsumerDashboardPage() {
  const { data: liveOrders = [], isLoading } = useConsumerOrders();
  const { wishlist } = useWishlist();
  const [profile, setProfile] = useState<any>(null);
  const [insightIdx, setInsightIdx] = useState(0);
  const [greeting, setGreeting] = useState("Good Day");

  useEffect(() => {
    const hr = new Date().getHours();
    setGreeting(hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  const orders = liveOrders.length > 0 ? liveOrders : DEMO_ORDERS;

  // Rotate AI insights
  useEffect(() => {
    const t = setInterval(() => setInsightIdx((i) => (i + 1) % AI_INSIGHTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Fetch profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
          .then(({ data }) => setProfile(data));
      }
    });
  }, []);

  // Compute stats
  const totalSpent = orders.reduce((s: number, o: any) => s + (o.total_amount ?? 0), 0);
  const totalSaved = Math.floor(totalSpent * 0.12);
  const deliveredCount = orders.filter((o: any) => o.status === "delivered").length;
  const activeCount = orders.filter((o: any) => ["pending", "accepted", "quality_verified", "dispatched"].includes(o.status)).length;
  const rewardPoints = Math.floor(totalSpent / 100) * 10;

  // Spending data — build from real orders or use demo
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6">
      {/* ── Welcome Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs">Dashboard · Live</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {greeting},
            {" "}<span className="gradient-text-green">{profile?.full_name?.split(" ")[0] ?? "Shopper"}</span>! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's your farm-fresh shopping summary</p>
        </div>
        <Link href="/consumer/marketplace"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
          <Leaf className="w-4 h-4" />
          Shop Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── AI Insight Banner ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4 text-emerald-400" />
          <h2 className="text-slate-400 text-sm">AI Insights for You</h2>
        </div>
        <AIInsightBanner insight={AI_INSIGHTS[insightIdx]} />
        <div className="flex gap-1.5 mt-2">
          {AI_INSIGHTS.map((_, i) => (
            <button key={i} onClick={() => setInsightIdx(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: i === insightIdx ? "#10b981" : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<ShoppingBag className="w-6 h-6" />} value={orders.length} label="Total Orders"
          sub={`${activeCount} active`} color="#10b981" href="/consumer/orders" />
        <StatCard icon={<TrendingUp className="w-6 h-6" />} value={`₹${totalSpent.toLocaleString()}`} label="Total Spent"
          sub={`₹${totalSaved.toLocaleString()} saved!`} color="#f59e0b" />
        <StatCard icon={<Heart className="w-6 h-6" />} value={wishlist.length} label="Wishlist Items"
          sub="Saved for later" color="#ef4444" href="/consumer/wishlist" />
        <StatCard icon={<Award className="w-6 h-6" />} value={rewardPoints.toLocaleString()} label="Reward Points"
          sub={`≈ ₹${Math.floor(rewardPoints / 10)}`} color="#8b5cf6" />
      </div>

      {/* ── Charts + Orders ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Spending chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-bold text-sm">Monthly Spending & Savings</h3>
              <p className="text-slate-400 text-xs mt-0.5">vs supermarket prices</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Spent</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Saved</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendingData}>
              <defs>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "rgba(5,8,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                formatter={(v: any) => [`₹${v.toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={2} fill="url(#spentGrad)" />
              <Area type="monotone" dataKey="saved" stroke="#f59e0b" strokeWidth={2} fill="url(#savedGrad)" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={DEMO_CATEGORY_SPEND} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {DEMO_CATEGORY_SPEND.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, ""]}
                contentStyle={{ background: "rgba(5,8,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {DEMO_CATEGORY_SPEND.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-slate-400">{c.name}</span>
                </div>
                <span className="text-white font-medium">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Orders + Wishlist ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm">Recent Orders</h3>
            <Link href="/consumer/orders" className="text-emerald-400 text-xs hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 rounded-xl anim-shimmer" />)}</div>
          ) : (
            <div>
              {orders.slice(0, 5).map((order: any) => <RecentOrderRow key={order.id} order={order} />)}
            </div>
          )}
        </div>

        {/* Wishlist + Market prices */}
        <div className="space-y-5">
          {/* Wishlist */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />Wishlist
              </h3>
              <Link href="/consumer/wishlist" className="text-red-400 text-xs hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {wishlist.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">No items saved yet</p>
            ) : (
              <div className="space-y-2">
                {wishlist.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/consumer/marketplace/${item.id}`}
                    className="flex items-center gap-2 py-1.5 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ background: "rgba(239,68,68,0.08)" }}>
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center"><Leaf className="w-3 h-3 text-red-400/40" /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs truncate">{item.title}</p>
                      <p className="text-emerald-400 text-xs">₹{item.pricePerUnit}/{item.unitType}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Market flash */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />Live Prices
            </h3>
            <div className="space-y-2">
              {DEMO_MARKET_PRICES.slice(0, 4).map((p) => (
                <div key={p.crop} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate">{p.crop}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-semibold">₹{p.price}/{p.unit}</span>
                    <span className={`${p.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                      {p.trend === "up" ? "▲" : "▼"}{Math.abs(p.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: "/consumer/marketplace", icon: <Leaf className="w-5 h-5" />, label: "Browse Market", color: "#10b981" },
          { href: "/consumer/orders", icon: <Package className="w-5 h-5" />, label: "My Orders", color: "#38bdf8" },
          { href: "/consumer/wishlist", icon: <Heart className="w-5 h-5" />, label: "Wishlist", color: "#ef4444" },
          { href: "/consumer/reviews", icon: <Star className="w-5 h-5" />, label: "Write Review", color: "#fbbf24" },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${a.color}15`, color: a.color }}>
              {a.icon}
            </div>
            <span className="text-slate-300 text-xs font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
