"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Star,
  Brain,
  TrendingUp,
  CloudSun,
  ShieldCheck,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  Plus,
} from "lucide-react";
import {
  DEMO_SUMMARY,
  DEMO_CHART_DATA,
  DEMO_WEATHER,
  DEMO_ORDERS,
  DEMO_NOTIFICATIONS,
  DEMO_TASKS,
  DEMO_MARKET_PRICES,
  DEMO_SCHEMES,
  DEMO_REVIEWS,
  DEMO_FARM_TWIN,
} from "@/lib/demoData";
import { cn } from "@/lib/utils";
import { useDemoMode } from "@/context/DemoContext";
import { supabase } from "@/lib/supabase";

export default function RedesignedDashboardPage() {
  const { isDemoMode } = useDemoMode();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [farmerName, setFarmerName] = useState<string>("Farmer");

  // Fetch actual logged-in farmer's name
  useEffect(() => {
    const fetchName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle() as { data: { full_name: string | null } | null };
        if (profile?.full_name) {
          setFarmerName(profile.full_name.split(" ")[0]);
        } else if (user.user_metadata?.full_name) {
          setFarmerName(user.user_metadata.full_name.split(" ")[0]);
        } else if (user.email) {
          setFarmerName(user.email.split("@")[0]);
        }
      }
    };
    fetchName();
  }, []);

  // Derive time-based greeting key
  const greetingKey = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "goodMorning";
    if (hour < 17) return "goodAfternoon";
    return "goodEvening";
  }, []);

  // Toggle tasks
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Pie chart helper for orders
  const pieData = [
    { name: "Pending", value: DEMO_SUMMARY.pendingOrders, color: "#f59e0b" },
    { name: "Accepted", value: DEMO_SUMMARY.acceptedOrders, color: "#3b82f6" },
    { name: "Dispatched", value: DEMO_SUMMARY.dispatchedOrders, color: "#8b5cf6" },
    { name: "Delivered", value: DEMO_SUMMARY.bagsSold - DEMO_SUMMARY.pendingOrders - DEMO_SUMMARY.acceptedOrders - DEMO_SUMMARY.dispatchedOrders, color: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Welcome Hero Section */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-emerald-950/20 via-[#030704] to-purple-950/20 border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                {t("agrinexActive")}
              </span>
              {isDemoMode && (
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  {t("demoMode")}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">
              {t(greetingKey)}, {farmerName}! 🌱
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {t("farmHealthy")}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
              <p className="text-[10px] text-slate-500 font-mono">{t("soilHealth")}</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{DEMO_SUMMARY.soilHealthScore}%</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
              <p className="text-[10px] text-slate-500 font-mono">{t("cropHealth")}</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{DEMO_SUMMARY.cropHealthScore}%</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
              <p className="text-[10px] text-slate-500 font-mono">{t("carbon")}</p>
              <p className="text-base font-bold text-teal-400 mt-0.5">82/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-mono">{t("totalRevenue").toUpperCase()}</p>
            <p className="text-xl font-bold text-white">₹{DEMO_SUMMARY.totalEarnings.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-mono">
              <TrendingUp className="w-3 h-3" />
              +{DEMO_SUMMARY.revenueGrowth}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-mono">{t("unitsSold").toUpperCase()}</p>
            <p className="text-xl font-bold text-white">{DEMO_SUMMARY.bagsSold} Kg</p>
            <p className="text-[10px] text-slate-400 font-mono">{t("allTimeDispatch")}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-mono">{t("activeProducts").toUpperCase()}</p>
            <p className="text-xl font-bold text-white">{DEMO_SUMMARY.activeListings}</p>
            <p className="text-[10px] text-emerald-400 font-mono">{t("onMarketplace")}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-mono">{t("trustScore").toUpperCase()}</p>
            <p className="text-xl font-bold text-white">{DEMO_SUMMARY.trustScore} / 5.0</p>
            <div className="flex gap-0.5 items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              ))}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* 3. Live Price Scrolling Ticker */}
      <div className="glass-panel rounded-2xl p-3 overflow-hidden bg-black/40 border-white/5 relative flex items-center gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono uppercase font-bold shrink-0">
          {t("livePrices")}
        </div>
        <div className="relative w-full overflow-hidden h-6 flex items-center">
          <div className="flex items-center gap-12 whitespace-nowrap animate-[marquee_25s_linear_infinite]">
            {DEMO_MARKET_PRICES.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                <span className="text-white font-bold">{m.crop}</span>
                <span className="text-slate-400">{m.mandi}</span>
                <span className="text-emerald-400 font-bold">₹{m.price}/{m.unit}</span>
                <span className={m.change > 0 ? "text-emerald-400" : "text-red-400"}>
                  {m.change > 0 ? "▲" : "▼"} {Math.abs(m.change)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Chart & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings area chart (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">{t("revenueChart")}</h2>
              <p className="text-slate-500 text-[11px]">{t("personalPerformance")}</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                {t("personal")}
              </span>
              <span className="flex items-center gap-1 text-white">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                {t("mktAverage")}
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_CHART_DATA}>
                <defs>
                  <linearGradient id="personal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="average" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0d1426", borderColor: "rgba(255,255,255,0.08)", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="personalEarnings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#personal)" />
                <Area type="monotone" dataKey="marketAverage" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" fillOpacity={1} fill="url(#average)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's farm tasks list */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Today's Farm Agenda</h2>
            <p className="text-slate-500 text-[11px] mb-4">Urgent tasks synchronized with local weather changes</p>
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-start gap-3 p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    readOnly
                    className="mt-1 w-4 h-4 rounded border-white/15 bg-white/5 accent-emerald-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs text-white ${task.done && "line-through opacity-50"}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      Due: {task.due}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold",
                      task.priority === "urgent"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : task.priority === "high"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-blue-500/10 text-white border border-blue-500/20"
                    )}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/farmer/calendar"
            className="flex items-center justify-between text-xs text-emerald-400 font-mono mt-4 pt-3 border-t border-white/5 hover:text-emerald-300 transition"
          >
            <span>{t("farmCalendar")}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 5. AI Recommendations Panel */}
      <div className="glass-panel p-5 rounded-2xl">
        <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-purple-400" />
          AI Diagnostic Alerts & Advisory Feed (Gemini AI)
        </h2>
        <p className="text-slate-500 text-[11px] mb-4">
          Realtime advisories parsed from localized soil health profiles and climate anomalies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_FARM_TWIN.ai_insights.map((insight, idx) => (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-xl border flex flex-col justify-between space-y-3 relative overflow-hidden bg-white/[0.01]",
                insight.priority === "urgent"
                  ? "border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                  : insight.priority === "high"
                  ? "border-amber-500/20"
                  : "border-blue-500/20"
              )}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase",
                    insight.priority === "urgent"
                      ? "bg-red-500/10 text-red-400"
                      : insight.priority === "high"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-blue-500/10 text-white"
                  )}
                >
                  {insight.priority} Priority
                </span>
                <span className="text-[10px] text-slate-500 font-mono capitalize">{insight.type}</span>
              </div>
              <p className="text-xs text-white leading-relaxed">{insight.insight}</p>
              <Link
                href="/farmer/ai-lab"
                className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 hover:text-emerald-300 mt-2 transition"
              >
                <span>Launch Diagnostics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Quick Actions Grid */}
      <div className="glass-panel p-5 rounded-2xl">
        <h2 className="text-sm font-bold text-white mb-4">{t("quickActions")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            href="/farmer/inventory?action=add"
            className="p-3 bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-2xl text-center space-y-2 hover:scale-[1.02] transition"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-xs text-white font-medium">{t("addCrop")}</p>
          </Link>
          <Link
            href="/farmer/ai-lab"
            className="p-3 bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-2xl text-center space-y-2 hover:scale-[1.02] transition"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <p className="text-xs text-white font-medium">{t("diseaseDetection")}</p>
          </Link>
          <Link
            href="/farmer/farm-twin"
            className="p-3 bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-2xl text-center space-y-2 hover:scale-[1.02] transition"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs text-white font-medium">Digital Twin</p>
          </Link>
          <Link
            href="/farmer/market"
            className="p-3 bg-white/5 border border-white/10 hover:border-red-500/30 rounded-2xl text-center space-y-2 hover:scale-[1.02] transition"
          >
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xs text-white font-medium">Market Mandi</p>
          </Link>
          <Link
            href="/farmer/analytics"
            className="p-3 bg-white/5 border border-white/10 hover:border-green-500/30 rounded-2xl text-center space-y-2 hover:scale-[1.02] transition"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mx-auto text-green-400">
              <Award className="w-4 h-4" />
            </div>
            <p className="text-xs text-white font-medium">{t("analytics")}</p>
          </Link>
          <Link
            href="/farmer/calendar"
            className="p-3 bg-white/5 border border-white/10 hover:border-teal-500/30 rounded-2xl text-center space-y-2 hover:scale-[1.02] transition"
          >
            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto text-teal-400">
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-xs text-white font-medium">{t("farmCalendar")}</p>
          </Link>
        </div>
      </div>

      {/* 7. Orders & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white">{t("recentOrders")}</h3>
            <Link href="/farmer/orders" className="text-xs text-emerald-400 font-mono hover:text-emerald-300 transition">
              {t("viewAllOrders")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-white/5 pb-2">
                  <th className="py-2">{t("buyer")}</th>
                  <th className="py-2">{t("product")}</th>
                  <th className="py-2">{t("quantity")}</th>
                  <th className="py-2">{t("amount")}</th>
                  <th className="py-2">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {DEMO_ORDERS.slice(0, 3).map((o) => (
                  <tr key={o.id} className="text-white hover:bg-white/[0.02] transition">
                    <td className="py-3 font-sans font-bold">{o.consumer.full_name}</td>
                    <td className="py-3 font-sans">{o.order_items[0]?.product?.title}</td>
                    <td className="py-3">{o.order_items[0]?.quantity} Kg</td>
                    <td className="py-3 font-bold text-emerald-400">₹{o.total_amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border",
                          o.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : o.status === "accepted"
                            ? "bg-blue-500/10 text-white border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer satisfaction */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Customer Reviews</h3>
            <p className="text-slate-500 text-[11px] mb-4">Direct marketplace feedback on your crop deliveries</p>
            <div className="space-y-3">
              {DEMO_REVIEWS.map((r) => (
                <div key={r.id} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{r.reviewer}</span>
                    <div className="flex gap-0.5">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">"{r.comment}"</p>
                  <p className="text-[9px] text-slate-500 text-right font-mono">— {r.product}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 pt-3 mt-4 text-[10px] text-slate-500 font-mono text-center">
            Weighted Rating Avg: <strong className="text-white">4.9 / 5.0</strong>
          </div>
        </div>
      </div>

      {/* 8. Active Government Schemes banner */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Eligible Government Schemes</h3>
            <p className="text-slate-500 text-[11px]">Recommended schemes matching your geographic location and crop types</p>
          </div>
          <Link href="/farmer/ai-lab?tool=schemes" className="text-xs text-emerald-400 font-mono hover:text-emerald-300 transition">
            Match All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_SCHEMES.map((s, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[9px] uppercase font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                  {s.benefit}
                </span>
                <h4 className="text-xs font-bold text-white mt-2 leading-tight">{s.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">{s.ministry}</p>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">Deadline: {s.deadline}</span>
                <button className="text-emerald-400 font-bold hover:underline">Apply Now →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Profit Predictor panel */}
      <div className="glass-panel p-5 rounded-2xl bg-gradient-to-r from-emerald-950/10 to-transparent border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Profitability Forecast
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
            Based on current crop maturity rates, weather forecasting, and market mandi trends, your expected net profit for next month is forecasted to grow.
          </p>
        </div>

        <div className="flex gap-4 shrink-0 font-mono text-center">
          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl min-w-[120px]">
            <p className="text-[10px] text-slate-500">THIS MONTH EST.</p>
            <p className="text-lg font-bold text-white mt-0.5">₹1,17,500</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl min-w-[120px]">
            <p className="text-[10px] text-emerald-400 font-bold">NEXT MONTH FORECAST</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">₹1,85,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
