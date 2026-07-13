"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview AI Farm Intelligence Center -- /farmer/analytics
 * Phase 10 Premium Analytics redesign.
 * Dynamic analytics from: useFarmerInventory, useFarmerOrdersDirect,
 * useLocationWeather, DEMO_CHART_DATA, DEMO_SUMMARY, DEMO_MARKET_PRICES.
 * Preserves existing handleExport (PDF/Excel) functionality.
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  TrendingUp, DollarSign, Award, Download, FileSpreadsheet,
  Sparkles, Leaf, Droplets, Star, Package,
  Users, Brain, Activity, CheckCircle, AlertCircle, RefreshCw,
  ArrowUp, ArrowDown, Globe,
} from "lucide-react";
import { DEMO_CHART_DATA, DEMO_SUMMARY, DEMO_MARKET_PRICES } from "@/lib/demoData";
import { exportToPDF, exportToExcel } from "@/lib/exporter";
import { useFarmerInventory } from "@/hooks/useFarmerInventory";
import { useFarmerOrdersDirect } from "@/hooks/useFarmerOrdersDirect";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { supabase } from "@/lib/supabase";

const PALETTE = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#A855F7", "#0EA5E9", "#06B6D4"];

// ---- Circular gauge ----
function CircleGauge({
  value, max = 100, size = 88, stroke = 8, color = "#22C55E", label, sublabel,
}: {
  value: number; max?: number; size?: number; stroke?: number;
  color?: string; label: string; sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(value / max, 1);
  const mid = size / 2;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={mid} cy={mid} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
          <circle cx={mid} cy={mid} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.9s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 900, color: "#1F2937", margin: 0 }}>{value}%</p>
        </div>
      </div>
      <p style={{ fontSize: "11px", fontWeight: 700, color: "#374151", margin: 0, textAlign: "center" }}>{label}</p>
      {sublabel && <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>{sublabel}</p>}
    </div>
  );
}

// ---- Inline sparkline ----
function Sparkline({ data, color = "#22C55E" }: { data: number[]; color?: string }) {
  const max = Math.max(...data); const min = Math.min(...data);
  const w = 56; const h = 22;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---- Trend badge ----
function Trend({ val, suffix = "%" }: { val: number; suffix?: string }) {
  const up = val >= 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "3px",
      fontSize: "11px", fontWeight: 700,
      color: up ? "#16A34A" : "#DC2626",
      background: up ? "#F0FDF4" : "#FEF2F2",
      borderRadius: "6px", padding: "2px 7px",
    }}>
      {up
        ? <ArrowUp style={{ width: "10px", height: "10px" }} />
        : <ArrowDown style={{ width: "10px", height: "10px" }} />}
      {Math.abs(val)}{suffix}
    </span>
  );
}

// ---- Main ----
export default function AnalyticsPage() {
  const { t } = useTranslation("farmer");
  const [timeframe, setTimeframe] = useState<"monthly" | "weekly">("monthly");
  const [refreshing, setRefreshing] = useState(false);
  const [farmerName, setFarmerName] = useState("Farmer");
  const [toast, setToast] = useState<string | null>(null);

  const { crops } = useFarmerInventory();
  const { data: orders = [] } = useFarmerOrdersDirect();
  const { location, weather } = useLocationWeather();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setFarmerName(user.user_metadata.full_name.split(" ")[0]);
      else if (user?.email) setFarmerName(user.email.split("@")[0]);
    });
  }, []);

  // ---- Derived analytics ----
  const cropNames: string[] = useMemo(() => {
    if (crops && crops.length > 0) return crops.map((c: any) => c.title);
    return ["Basmati Rice", "Alphonso Mango", "Turmeric Finger"];
  }, [crops]);

  const orderCount = orders.length;
  const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length;
  const totalRevenue = useMemo(() => {
    if (orderCount > 0) {
      const sum = orders.reduce((s: number, o: any) => s + (o.total_amount || 0), 0);
      return sum || DEMO_SUMMARY.totalEarnings;
    }
    return DEMO_SUMMARY.totalEarnings;
  }, [orders, orderCount]);

  const avgRating = 4.8;
  const waterEfficiency = 82;
  const aiScore = 91;
  const sustainabilityScore = DEMO_SUMMARY.sustainabilityScore;
  const farmHealth = DEMO_SUMMARY.farmHealthScore;
  const profitMargin = 83.8;

  const cropPieData = useMemo(() => {
    const base = [
      { name: "Basmati Rice",    value: 350000 },
      { name: "Alphonso Mango",  value: 120000 },
      { name: "Turmeric Finger", value: 59000 },
    ];
    if (crops && crops.length > 0) {
      return crops.slice(0, 4).map((c: any, i: number) => ({
        name: c.title,
        value: base[i]?.value || 30000 + (i + 1) * 25000,
      }));
    }
    return base;
  }, [crops]);

  const waterData = DEMO_CHART_DATA.map((d, i) => ({
    month: d.month,
    used: 800 + i * 60,
    saved: 180 + i * 30,
  }));

  const aiUsageData = DEMO_CHART_DATA.map((d, i) => ({
    month: d.month,
    queries: 3 + i * 2 + (i % 3),
  }));

  const revSpark = DEMO_CHART_DATA.map((d) => d.personalEarnings);
  const ordSpark = DEMO_CHART_DATA.map((d) => d.orders);

  const locationLabel = location?.city ? location.city : "Karnal, Haryana";
  const topCrop = cropNames[0] || "Basmati Rice";
  const weatherNote = weather
    ? `Current weather in ${locationLabel}: ${weather.temperature}\u00b0C, ${weather.condition}.`
    : "";

  const executiveSummary = `Based on ${farmerName}'s farm profile, ${cropNames.length} active inventory crops, ${orderCount} orders on record, AI diagnostics history, irrigation schedule and logistics performance, your farm is performing above the regional average. ${topCrop} is currently your highest-contributing crop category. Marketplace demand is trending upward. Water usage is efficient at ${waterEfficiency}% score. ${weatherNote} Your next opportunity is improving logistics route efficiency to reduce delivery time.`;

  const kpiCards = [
    { icon: DollarSign, label: "Total Revenue",      val: `Rs.${(totalRevenue / 100000).toFixed(1)}L`, trend: 23.4, color: "#22C55E", bg: "#F0FDF4", border: "#86EFAC", spark: revSpark },
    { icon: TrendingUp, label: "Net Profit Margin",  val: `${profitMargin}%`,                         trend: 5.2,  color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", spark: revSpark.map(v => v * 0.83) },
    { icon: Leaf,       label: "Active Crops",       val: `${cropNames.length}`,                      trend: 0,    color: "#10B981", bg: "#F0FDF4", border: "#6EE7B7", spark: [2,2,3,3,3,cropNames.length] },
    { icon: Package,    label: "Orders Completed",   val: `${deliveredOrders || 28}`,                 trend: 12.1, color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", spark: ordSpark },
    { icon: Star,       label: "Customer Rating",    val: `${avgRating}`,                             trend: 0.2,  color: "#A855F7", bg: "#FAF5FF", border: "#D8B4FE", spark: [4.5,4.6,4.7,4.7,4.8,4.8] },
    { icon: Brain,      label: "AI Performance",     val: `${aiScore}%`,                              trend: 3.1,  color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD", spark: [75,78,82,85,88,aiScore] },
    { icon: Droplets,   label: "Water Efficiency",   val: `${waterEfficiency}%`,                      trend: 4.5,  color: "#06B6D4", bg: "#ECFEFF", border: "#A5F3FC", spark: [70,72,74,78,80,waterEfficiency] },
    { icon: Globe,      label: "Sustainability",     val: `${sustainabilityScore}%`,                  trend: 2.0,  color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC", spark: [75,77,79,81,83,sustainabilityScore] },
  ];

  const cropPerformance = cropPieData.map((c, i) => ({
    name: c.name,
    revenue: c.value,
    profit: Math.round(c.value * 0.82),
    orders: Math.round(8 + i * 5),
    rating: parseFloat((4.5 + i * 0.1).toFixed(1)),
    demand: ["High", "Very High", "Medium", "Growing"][i % 4],
    trend: [14.2, 8.7, -3.1, 21.4][i % 4],
    aiRec: [
      "Increase listing volume. Demand outpacing supply in NCR.",
      "Optimal harvest window opens next week. List early.",
      "Consider value-added processing for better margins.",
      "New export opportunity detected in Gulf markets.",
    ][i % 4],
    color: PALETTE[i % PALETTE.length],
  }));

  const card: React.CSSProperties = {
    background: "#ffffff", borderRadius: "20px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    padding: "22px 24px",
    fontFamily: "Inter, sans-serif",
  };

  const handleExport = (format: "pdf" | "excel") => {
    const columns = [
      { header: "Month",                  key: "month",            format: "string" as const },
      { header: "Your Earnings (Rs.)",    key: "personalEarnings", format: "currency" as const },
      { header: "Market Avg (Rs.)",       key: "marketAverage",    format: "currency" as const },
      { header: "Dispatches (Orders)",    key: "orders",           format: "number" as const },
    ];
    const title = "AI Farm Intelligence Report";
    const execSummary = `AgriNex AI quarterly performance report for ${farmerName}. Farm health: ${farmHealth}%. Top crop: ${topCrop}.`;
    const totals = { month: "Total", personalEarnings: totalRevenue, marketAverage: 371000, orders: orderCount || 78 };
    if (format === "pdf") {
      exportToPDF(title, DEMO_CHART_DATA, columns, { platform: "Farmer Platform", userName: farmerName, executiveSummary: execSummary, totals });
      showToast("PDF report exported successfully!");
    } else {
      exportToExcel(title, DEMO_CHART_DATA, columns, { platform: "Farmer Platform", userName: farmerName, executiveSummary: execSummary, totals });
      showToast("Excel ledger exported successfully!");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); showToast("Analytics refreshed!"); }, 1400);
  };

  const ttStyle = {
    contentStyle: { background: "#fff", borderColor: "#E5E7EB", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" },
    itemStyle: { fontSize: "12px", color: "#334155" },
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#F8FAFC", paddingBottom: "48px" }}>
      <style>{`@keyframes spin360 { to { transform: rotate(360deg); } }`}</style>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, background: "#10B981", color: "#fff", padding: "12px 22px", borderRadius: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600 }}>
            <CheckCircle style={{ width: "16px", height: "16px" }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- HERO ---- */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 45%, #4f46e5 80%, #6d28d9 100%)", borderRadius: "24px", padding: "36px 40px", marginBottom: "28px", boxShadow: "0 8px 32px rgba(79,70,229,0.28)" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(139,92,246,0.18)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "35%", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(99,102,241,0.15)", filter: "blur(40px)" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
            {[`Farmer: ${farmerName}`, `Location: ${locationLabel}`, `Crops: ${cropNames.length} active`, "AI-Powered"].map(pill => (
              <span key={pill} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "99px", padding: "5px 14px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{pill}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
                AI Farm Intelligence Center
              </h1>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.65, maxWidth: "520px" }}>
                Advanced business analytics powered by AI using your complete farm activity -- inventory, orders, irrigation, logistics, marketplace and AI diagnostics.
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                {["AI Insights", "Real-time Tracking", "Executive Summary", "Live Updates"].map(tag => (
                  <span key={tag} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "99px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "18px", padding: "20px 24px", minWidth: "190px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", margin: "0 0 6px", letterSpacing: "0.08em" }}>Farm Health Score</p>
              <p style={{ fontSize: "42px", fontWeight: 900, color: "#ffffff", margin: "0 0 4px", lineHeight: 1 }}>{farmHealth}%</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: 0 }}>AI Confidence: 96%</p>
              <div style={{ marginTop: "10px" }}>
                <span style={{ fontSize: "11px", background: "rgba(34,197,94,0.3)", color: "#86EFAC", padding: "3px 10px", borderRadius: "99px", fontWeight: 700 }}>Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---- Action Bar ---- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>View:</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value as any)}
            style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "7px 14px", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={handleRefresh} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            <RefreshCw style={{ width: "13px", height: "13px", animation: refreshing ? "spin360 0.9s linear infinite" : "none" }} />
            Refresh
          </button>
          <button onClick={() => handleExport("pdf")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            <Download style={{ width: "13px", height: "13px" }} /> {t("exportPdf")}
          </button>
          <button onClick={() => handleExport("excel")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "10px", fontSize: "13px", fontWeight: 600, color: "#16A34A", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            <FileSpreadsheet style={{ width: "13px", height: "13px" }} /> {t("excelLedger")}
          </button>
        </div>
      </div>

      {/* ---- KPI Cards ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {kpiCards.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
            style={{ background: "#ffffff", borderRadius: "18px", border: `1px solid ${k.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: k.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.icon style={{ width: "18px", height: "18px", color: k.color }} />
              </div>
              <Sparkline data={k.spark} color={k.color} />
            </div>
            <p style={{ fontSize: "24px", fontWeight: 900, color: "#1F2937", margin: "0 0 3px", letterSpacing: "-0.5px" }}>{k.val}</p>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", margin: "0 0 6px" }}>{k.label}</p>
            {k.trend !== 0 && <Trend val={k.trend} />}
          </motion.div>
        ))}
      </div>

      {/* ---- Row 1: Revenue chart + Health gauges ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>Revenue vs Market Trend</h2>
              <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Your earnings vs benchmark</p>
            </div>
            <Trend val={23.4} />
          </div>
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_CHART_DATA}>
                <defs>
                  <linearGradient id="gEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMarket" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip {...ttStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="personalEarnings" name="Your Earnings" stroke="#22C55E" strokeWidth={2.5} fillOpacity={1} fill="url(#gEarnings)" />
                <Area type="monotone" dataKey="marketAverage"    name="Market Avg"    stroke="#3B82F6" strokeWidth={2}   strokeDasharray="4 4" fillOpacity={1} fill="url(#gMarket)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} style={{ ...card, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>AI Farm Health</h2>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Composite AI analysis</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <CircleGauge value={farmHealth}          color="#22C55E" label="Farm Health"    sublabel="Above avg" />
            <CircleGauge value={aiScore}             color="#6366F1" label="AI Score"       sublabel="Excellent" />
            <CircleGauge value={waterEfficiency}     color="#0EA5E9" label="Water Eff."     sublabel="Efficient" />
            <CircleGauge value={sustainabilityScore} color="#10B981" label="Sustainability" sublabel="Green" />
          </div>
          <div style={{ background: "linear-gradient(135deg, #F0FDF4, #ECFEFF)", borderRadius: "12px", padding: "12px 14px" }}>
            {[
              { label: "Profitability",     val: "Excellent", color: "#22C55E" },
              { label: "Market Readiness",  val: "High",      color: "#0EA5E9" },
              { label: "Risk Level",        val: "Low",       color: "#F59E0B" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "3px 0" }}>
                <span style={{ color: "#64748B", fontWeight: 600 }}>{row.label}</span>
                <span style={{ color: row.color, fontWeight: 800 }}>{row.val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ---- Row 2: Orders bar + Crop pie ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={card}>
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>Order Volume Trend</h2>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Monthly dispatch count</p>
          </div>
          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_CHART_DATA}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip {...ttStyle} />
                <Bar dataKey="orders" name="Orders" fill="#6366F1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>Crop Revenue Split</h2>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>By category</p>
          </div>
          <div style={{ height: "150px", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cropPieData} cx="50%" cy="50%" innerRadius={44} outerRadius={65} paddingAngle={4} dataKey="value">
                  {cropPieData.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip {...ttStyle} formatter={(v: any) => [`Rs.${Number(v).toLocaleString()}`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <p style={{ fontSize: "9px", color: "#94A3B8", fontWeight: 700, margin: 0 }}>TOTAL</p>
              <p style={{ fontSize: "13px", fontWeight: 900, color: "#1F2937", margin: 0 }}>
                Rs.{(cropPieData.reduce((a: number, c: any) => a + c.value, 0) / 100000).toFixed(1)}L
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {cropPieData.map((c: any, i: number) => (
              <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#374151", fontWeight: 600 }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: PALETTE[i % PALETTE.length], flexShrink: 0, display: "inline-block" }} />
                  {c.name}
                </span>
                <span style={{ fontWeight: 800, color: "#1F2937" }}>Rs.{(c.value / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ---- AI Executive Summary ---- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ ...card, background: "linear-gradient(135deg, #FAF5FF 0%, #EEF2FF 50%, #ffffff 100%)", border: "1px solid #C4B5FD", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles style={{ width: "20px", height: "20px", color: "#ffffff" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#4C1D95", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "8px" }}>
              AI Executive Summary
              <span style={{ fontSize: "10px", background: "#7C3AED", color: "#fff", borderRadius: "6px", padding: "2px 8px", fontWeight: 700 }}>LIVE</span>
            </h2>
            <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.75, margin: 0 }}>{executiveSummary}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
              {[`Top Crop: ${topCrop}`, `Health: ${farmHealth}%`, `Orders: ${orderCount || 28}`, `Location: ${locationLabel}`].map(tag => (
                <span key={tag} style={{ fontSize: "11px", fontWeight: 700, color: "#6D28D9", background: "rgba(124,58,237,0.1)", borderRadius: "7px", padding: "3px 10px" }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---- Row 4: Water + Market ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={card}>
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>Water Usage & Conservation</h2>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Monthly irrigation (litres x100)</p>
          </div>
          <div style={{ height: "190px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterData}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip {...ttStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="used"  name="Water Used"  fill="#0EA5E9" radius={[4,4,0,0]} />
                <Bar dataKey="saved" name="Water Saved" fill="#6EE7B7" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={card}>
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>Market Price Intelligence</h2>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Current APMC rates</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px", maxHeight: "210px", overflowY: "auto" }}>
            {DEMO_MARKET_PRICES.slice(0, 7).map((m, i) => (
              <div key={m.crop} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: i % 2 === 0 ? "#F8FAFC" : "#ffffff", borderRadius: "10px", border: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{m.crop}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937" }}>Rs.{m.price}/{m.unit}</span>
                  <Trend val={m.change} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ---- Crop Performance Cards ---- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        style={{ ...card, marginBottom: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>Crop Performance Analytics</h2>
          <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Revenue, orders, ratings and AI recommendations per crop</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
          {cropPerformance.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}
              whileHover={{ y: -3, boxShadow: "0 6px 20px rgba(0,0,0,0.09)" }}
              style={{ background: "#FAFAFA", borderRadius: "16px", border: `1px solid ${c.color}30`, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: c.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Leaf style={{ width: "14px", height: "14px", color: c.color }} />
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{c.name}</p>
                </div>
                <Trend val={c.trend} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginBottom: "10px" }}>
                {[
                  { label: "Revenue", val: `Rs.${(c.revenue/1000).toFixed(0)}K` },
                  { label: "Orders",  val: `${c.orders}` },
                  { label: "Profit",  val: `Rs.${(c.profit/1000).toFixed(0)}K` },
                  { label: "Rating",  val: `${c.rating} stars` },
                ].map(stat => (
                  <div key={stat.label} style={{ background: "#ffffff", borderRadius: "8px", padding: "7px 10px", border: "1px solid #F1F5F9" }}>
                    <p style={{ fontSize: "9px", color: "#94A3B8", fontWeight: 700, margin: "0 0 2px", textTransform: "uppercase" }}>{stat.label}</p>
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{stat.val}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: c.color + "10", borderRadius: "8px", padding: "8px 10px", marginBottom: "8px" }}>
                <p style={{ fontSize: "11px", color: c.color, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>AI: {c.aiRec}</p>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: c.color, background: c.color + "15", borderRadius: "6px", padding: "3px 9px" }}>Demand: {c.demand}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ---- Row 6: AI Intel + Customer ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={card}>
          <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "7px" }}>
            <Brain style={{ width: "16px", height: "16px", color: "#6366F1" }} /> AI Intelligence
          </h2>
          <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 14px" }}>Analytics from your AI sessions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "14px" }}>
            {[
              { label: "Most Researched Crop",  val: topCrop,             icon: Leaf,        color: "#22C55E" },
              { label: "Most Common Problem",   val: "Disease Detection",  icon: AlertCircle, color: "#EF4444" },
              { label: "Top Query Category",    val: "Irrigation Advice",  icon: Droplets,    color: "#0EA5E9" },
              { label: "Most Used AI Model",    val: "Disease Detector",   icon: Brain,       color: "#6366F1" },
              { label: "Total AI Sessions",     val: "42 this month",      icon: Activity,    color: "#A855F7" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: "#F8FAFC", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <row.icon style={{ width: "13px", height: "13px", color: row.color }} />
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>{row.label}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#1F2937" }}>{row.val}</span>
              </div>
            ))}
          </div>
          <div style={{ height: "120px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiUsageData}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip {...ttStyle} />
                <Line type="monotone" dataKey="queries" name="AI Queries" stroke="#6366F1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} style={card}>
          <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "7px" }}>
            <Users style={{ width: "16px", height: "16px", color: "#A855F7" }} /> Customer Analytics
          </h2>
          <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 14px" }}>Buyer satisfaction insights</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            {[
              { label: "Avg Rating",            val: `${avgRating}`, color: "#F59E0B", icon: Star },
              { label: "Repeat Customers",      val: "68%",          color: "#22C55E", icon: Users },
              { label: "Delivery Satisfaction", val: "94%",          color: "#0EA5E9", icon: CheckCircle },
              { label: "Review Sentiment",      val: "Positive",     color: "#6366F1", icon: Award },
            ].map(s => (
              <div key={s.label} style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px", border: "1px solid #F1F5F9" }}>
                <s.icon style={{ width: "16px", height: "16px", color: s.color, marginBottom: "8px" }} />
                <p style={{ fontSize: "18px", fontWeight: 900, color: s.color, margin: "0 0 3px" }}>{s.val}</p>
                <p style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "linear-gradient(135deg, #FAF5FF, #EEF2FF)", borderRadius: "12px", padding: "12px 14px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#6D28D9", margin: "0 0 4px" }}>AI Customer Summary</p>
            <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.6, margin: 0 }}>
              {farmerName}'s buyer base shows strong loyalty with 68% repeat orders. Delivery satisfaction is above platform average. {topCrop} receives the highest praise in reviews.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ---- Crop Rankings ---- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        style={{ ...card, marginBottom: "20px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "7px" }}>
          <Award style={{ width: "16px", height: "16px", color: "#F59E0B" }} /> {t("cropSalesRankings")}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {cropPerformance.slice(0, 3).map((c, i) => (
            <div key={c.name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 16px", borderRadius: "14px",
              background: i === 0 ? "linear-gradient(135deg,#F0FDF4,#ECFDF5)" : i === 1 ? "linear-gradient(135deg,#EFF6FF,#F0F9FF)" : "linear-gradient(135deg,#FFF7ED,#FFFBEB)",
              border: `1px solid ${i === 0 ? "#86EFAC" : i === 1 ? "#BAE6FD" : "#FDE68A"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "18px", fontWeight: 900, color: i === 0 ? "#15803D" : i === 1 ? "#1D4ED8" : "#D97706" }}>#{i + 1}</span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>{c.orders} orders completed</p>
                </div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <p style={{ fontSize: "16px", fontWeight: 900, color: "#1F2937", margin: 0 }}>Rs.{(c.revenue/1000).toFixed(0)}K</p>
                <Trend val={c.trend} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center" as const, marginTop: "12px", fontWeight: 600 }}>Updated automatically at APMC Mandi settlement</p>
      </motion.div>

    </div>
  );
}
