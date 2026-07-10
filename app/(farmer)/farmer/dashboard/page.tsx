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
import { useLocationWeather } from "@/context/LocationWeatherContext";

export default function RedesignedDashboardPage() {
  const { isDemoMode } = useDemoMode();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [farmerName, setFarmerName] = useState<string>("Farmer");
  const { nearbyMandis } = useLocationWeather();
  const displayMandis = nearbyMandis.length > 0 ? nearbyMandis : DEMO_MARKET_PRICES;

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
  const { t } = useTranslation("farmer");
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome Hero Section */}
      <div className="p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-100 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider font-mono">
                {t("agrinexActive")}
              </span>
              {isDemoMode && (
                <span className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  {t("demoMode")}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-3 tracking-tight">
              {t(greetingKey)}, {farmerName}! 🌱
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              {t("farmHealthy")}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="premium-card rounded-3xl border-slate-200/50 px-4 py-2.5 text-center min-w-[85px] shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("soilHealth")}</p>
              <p className="text-base font-bold text-emerald-600 mt-1">{DEMO_SUMMARY.soilHealthScore}%</p>
            </div>
            <div className="premium-card rounded-3xl border-slate-200/50 px-4 py-2.5 text-center min-w-[85px] shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("cropHealth")}</p>
              <p className="text-base font-bold text-emerald-600 mt-1">{DEMO_SUMMARY.cropHealthScore}%</p>
            </div>
            <div className="premium-card rounded-3xl border-slate-200/50 px-4 py-2.5 text-center min-w-[85px] shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("carbon")}</p>
              <p className="text-base font-bold text-teal-600 mt-1">82/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="premium-card shadow-sm p-4 rounded-3xl flex items-center justify-between border-slate-200/80 hover:border-emerald-500/30 hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("totalRevenue")}</p>
            <p className="text-xl font-bold text-slate-800">₹{DEMO_SUMMARY.totalEarnings.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-bold font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              +{DEMO_SUMMARY.revenueGrowth}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border-emerald-100 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="premium-card shadow-sm p-4 rounded-3xl flex items-center justify-between border-slate-200/80 hover:border-emerald-500/30 hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("unitsSold")}</p>
            <p className="text-xl font-bold text-slate-800">{DEMO_SUMMARY.bagsSold} Kg</p>
            <p className="text-[10px] text-slate-500 font-semibold">{t("allTimeDispatch")}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border-emerald-100 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="premium-card shadow-sm p-4 rounded-3xl flex items-center justify-between border-slate-200/80 hover:border-emerald-500/30 hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("activeProducts")}</p>
            <p className="text-xl font-bold text-slate-800">{DEMO_SUMMARY.activeListings}</p>
            <p className="text-[10px] text-emerald-600 font-bold">{t("onMarketplace")}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border-emerald-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="premium-card shadow-sm p-4 rounded-3xl flex items-center justify-between border-slate-200/80 hover:border-emerald-500/30 hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("trustScore")}</p>
            <p className="text-xl font-bold text-slate-800">{DEMO_SUMMARY.trustScore} / 5.0</p>
            <div className="flex gap-0.5 items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-550 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border-emerald-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* 3. Live Price Scrolling Ticker */}
      <div className="bg-emerald-950 border border-emerald-900 rounded-2xl p-3 overflow-hidden shadow-sm relative flex items-center gap-4">
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[10px] text-emerald-400 font-bold tracking-wider uppercase font-mono shrink-0">
          {t("livePrices")}
        </div>
        <div className="relative w-full overflow-hidden h-6 flex items-center">
          <div className="flex items-center gap-12 whitespace-nowrap animate-[marquee_25s_linear_infinite]">
            {displayMandis.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-100 font-bold">{m.crop}</span>
                <span className="text-emerald-400/70">{m.mandi}</span>
                <span className="text-emerald-400 font-bold">₹{m.price}/{m.unit}</span>
                <span className={m.change > 0 ? "text-emerald-300 font-bold" : "text-rose-400 font-bold"}>
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
        <div className="lg:col-span-2 premium-card shadow-sm p-5 rounded-3xl border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">{t("revenueChart")}</h2>
              <p className="text-slate-500 text-[11px] font-semibold">{t("personalPerformance")}</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                {t("personal")}
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
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
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                  itemStyle={{ fontSize: "12px", color: "#1e293b" }}
                  labelStyle={{ fontWeight: "bold", color: "#0f172a" }}
                />
                <Area type="monotone" dataKey="personalEarnings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#personal)" />
                <Area type="monotone" dataKey="marketAverage" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#average)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's farm tasks list */}
        <div className="premium-card shadow-sm p-5 rounded-3xl border-slate-200/80 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-1">Today's Farm Agenda</h2>
            <p className="text-slate-500 text-[11px] font-semibold mb-4">Urgent tasks synchronized with weather alerts</p>
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-start gap-3 p-3 premium-card border-slate-100/60 hover:border-emerald-200 hover:bg-emerald-50/10 rounded-xl cursor-pointer transition shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    readOnly
                    className="mt-1 w-4 h-4 rounded border-slate-300 bg-white accent-emerald-500 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold text-slate-700 ${task.done && "line-through opacity-50"}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide font-mono">
                      Due: {task.due}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono",
                      task.priority === "urgent"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : task.priority === "high"
                        ? "bg-amber-550/10 bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
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
            className="flex items-center justify-between text-xs font-bold text-emerald-600 font-mono mt-4 pt-3 border-t border-slate-150 hover:text-emerald-700 transition no-underline"
          >
            <span>{t("farmCalendar")}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 5. AI Recommendations Panel */}
      <div className="premium-card shadow-sm p-5 rounded-3xl border-slate-200/80">
        <h2 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
          <Brain className="w-4.5 h-4.5 text-purple-650 text-purple-600" />
          {t("aiDiagnosticAlertsAdvisoryFeed")}
        </h2>
        <p className="text-slate-500 text-[11px] font-semibold mb-4">
          Realtime advisories parsed from localized soil health profiles and climate anomalies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_FARM_TWIN.ai_insights.map((insight, idx) => (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-3xl border flex flex-col justify-between space-y-3 premium-card relative overflow-hidden transition hover:shadow-lg duration-200",
                insight.priority === "urgent"
                  ? "border-red-200 hover:border-red-300"
                  : insight.priority === "high"
                  ? "border-amber-200 hover:border-amber-300"
                  : "border-blue-200 hover:border-blue-300"
              )}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono",
                    insight.priority === "urgent"
                      ? "bg-red-50 text-red-700"
                      : insight.priority === "high"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-blue-50 text-blue-700"
                  )}
                >
                  {insight.priority} Priority
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide font-mono">{insight.type}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">{insight.insight}</p>
              <Link
                href="/farmer/ai-lab"
                className="text-[11px] text-emerald-600 font-bold font-mono flex items-center gap-1 hover:text-emerald-700 mt-2 transition no-underline"
              >
                <span>Launch Diagnostics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Quick Actions Grid */}
      <div className="premium-card shadow-sm p-5 rounded-3xl border-slate-200/80">
        <h2 className="text-sm font-bold text-slate-800 mb-4">{t("quickActions")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            href="/farmer/inventory?action=add"
            className="p-4 premium-card border-slate-100/60 hover:border-emerald-200 hover:shadow-md rounded-2xl text-center space-y-2 hover:scale-[1.02] transition no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-700 font-bold">{t("addCrop")}</p>
          </Link>
          <Link
            href="/farmer/ai-lab"
            className="p-4 premium-card border-slate-100/60 hover:border-purple-200 hover:shadow-md rounded-2xl text-center space-y-2 hover:scale-[1.02] transition no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center mx-auto text-purple-600">
              <Brain className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-700 font-bold">{t("diseaseDetection")}</p>
          </Link>
          <Link
            href="/farmer/farm-twin"
            className="p-4 premium-card border-slate-100/60 hover:border-cyan-200 hover:shadow-md rounded-2xl text-center space-y-2 hover:scale-[1.02] transition no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center mx-auto text-cyan-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-700 font-bold">{t("digitalTwin")}</p>
          </Link>
          <Link
            href="/farmer/market"
            className="p-4 premium-card border-slate-100/60 hover:border-red-200 hover:shadow-md rounded-2xl text-center space-y-2 hover:scale-[1.02] transition no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-700 font-bold">Market Mandi</p>
          </Link>
          <Link
            href="/farmer/analytics"
            className="p-4 premium-card border-slate-100/60 hover:border-emerald-200 hover:shadow-md rounded-2xl text-center space-y-2 hover:scale-[1.02] transition no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-700 font-bold">{t("analytics")}</p>
          </Link>
          <Link
            href="/farmer/calendar"
            className="p-4 premium-card border-slate-100/60 hover:border-teal-200 hover:shadow-md rounded-2xl text-center space-y-2 hover:scale-[1.02] transition no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-teal-600">
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-700 font-bold">{t("farmCalendar")}</p>
          </Link>
        </div>
      </div>

      {/* 7. Orders & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 premium-card shadow-sm p-5 rounded-3xl border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <h3 className="text-sm font-bold text-slate-800">{t("recentOrders")}</h3>
            <Link href="/farmer/orders" className="text-xs text-emerald-600 font-mono font-bold hover:text-emerald-700 transition no-underline">
              {t("viewAllOrders")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="ag-table">
              <thead>
                <tr>
                  <th>{t("buyer")}</th>
                  <th>{t("product")}</th>
                  <th>{t("quantity")}</th>
                  <th>{t("amount")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_ORDERS.slice(0, 3).map((o) => (
                  <tr key={o.id}>
                    <td className="font-sans font-bold">{o.consumer.full_name}</td>
                    <td className="font-sans font-semibold text-slate-600">{o.order_items[0]?.product?.title}</td>
                    <td>{o.order_items[0]?.quantity} Kg</td>
                    <td className="font-bold text-emerald-600">₹{o.total_amount.toLocaleString()}</td>
                    <td>
                      <span
                        className={cn(
                          "badge",
                          o.status === "pending"
                            ? "badge-amber"
                            : o.status === "accepted"
                            ? "badge-blue"
                            : "badge-green"
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

        {/* Customer reviews */}
        <div className="premium-card shadow-sm p-5 rounded-3xl border-slate-200/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">{t("customerReviews")}</h3>
            <p className="text-slate-500 text-[11px] font-semibold mb-4">{t("directMarketplaceFeedbackOnCro")}</p>
            <div className="space-y-3">
              {DEMO_REVIEWS.map((r) => (
                <div key={r.id} className="premium-card border-slate-100/60 p-3 rounded-xl shadow-sm space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">{r.reviewer}</span>
                    <div className="flex gap-0.5">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-550 italic text-slate-650 font-medium">"{r.comment}"</p>
                  <p className="text-[9px] text-slate-400 text-right font-bold uppercase font-mono">— {r.product}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
            Weighted Rating Avg: <strong className="text-slate-700">4.9 / 5.0</strong>
          </div>
        </div>
      </div>

      {/* 8. Eligible Government Schemes banner */}
      <div className="premium-card shadow-sm p-5 rounded-3xl border-slate-200/80">
        <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t("eligibleGovernmentSchemes")}</h3>
            <p className="text-slate-500 text-[11px] font-semibold">Recommended schemes matching geographic details and crop types</p>
          </div>
          <Link href="/farmer/schemes" className="text-xs text-emerald-600 font-mono font-bold hover:text-emerald-700 transition no-underline">
            Match All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_SCHEMES.map((s, idx) => (
            <div key={idx} className="premium-card border-slate-100/60 p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-sm">
              <div>
                <span className="text-[9px] uppercase font-bold font-mono bg-amber-50 text-amber-700 border-amber-200 px-2 py-0.5 rounded">
                  {s.benefit}
                </span>
                <h4 className="text-xs font-bold text-slate-800 mt-2.5 leading-tight">{s.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase font-mono mt-1">{s.ministry}</p>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold font-mono border-t border-slate-50 pt-2">
                <span className="text-slate-400">Deadline: {s.deadline}</span>
                <button className="text-emerald-600 hover:text-emerald-700 transition">Apply Now →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Profit Predictor panel */}
      <div className="shadow-sm p-5 rounded-2xl border-slate-200/80 bg-gradient-to-r from-emerald-50 to-transparent flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            {t("aiProfitabilityForecast")}
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed max-w-xl font-medium">
            {t("basedOnCurrentCropMaturityRate")}
          </p>
        </div>

        <div className="flex gap-4 shrink-0 font-mono text-center">
          <div className="premium-card px-4 py-2.5 rounded-2xl min-w-[120px] shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold">THIS MONTH EST.</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">₹1,17,500</p>
          </div>
          <div className="bg-emerald-50 border-emerald-250 px-4 py-2.5 rounded-2xl min-w-[120px] shadow-sm">
            <p className="text-[10px] text-emerald-700 font-bold">NEXT MONTH FORECAST</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">₹1,85,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}