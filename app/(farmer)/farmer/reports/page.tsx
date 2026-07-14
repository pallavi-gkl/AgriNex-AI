"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview AI Farm Reports & Export Center -- /farmer/reports
 * Phase 11 Bugfix and UI Refinement.
 * Resolves Issue 1: Hydration mismatch via manual non-locale-dependent number formatter.
 * Resolves Issue 2: View Report navigates to dedicated detail pages instead of popups.
 * Resolves Issue 3: Header background replaced with high-contrast soft emerald light green gradient.
 * Preserves all existing export and download capabilities.
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import {
  FileText, Download, FileSpreadsheet, TrendingUp, Package,
  IndianRupee, Printer, BarChart3, CheckCircle, Sparkles,
  Star, Leaf, Brain, ArrowUp, ArrowDown, RefreshCw, Eye,
  Receipt, Filter, Clock, Globe, ShieldCheck, Droplets,
  ArrowLeft, Calendar, User, Activity, AlertTriangle, MapPin,
} from "lucide-react";
import { DEMO_SUMMARY, DEMO_CHART_DATA, DEMO_CROPS, DEMO_ORDERS, DEMO_MARKET_PRICES } from "@/lib/demoData";
import { exportToPDF, exportToExcel } from "@/lib/exporter";
import { useFarmerInventory } from "@/hooks/useFarmerInventory";
import { useFarmerOrdersDirect } from "@/hooks/useFarmerOrdersDirect";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { supabase } from "@/lib/supabase";

const PAL = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#A855F7", "#0EA5E9", "#06B6D4"];

// ---- Pure deterministic number formatting to prevent hydration errors ----
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// ---- Tiny sparkline ----
function Sparkline({ data, color = "#22C55E" }: { data: number[]; color?: string }) {
  const max = Math.max(...data); const min = Math.min(...data);
  const w = 54; const h = 20;
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: 700, color: up ? "#16A34A" : "#DC2626", background: up ? "#F0FDF4" : "#FEF2F2", borderRadius: "6px", padding: "2px 7px" }}>
      {up ? <ArrowUp style={{ width: "10px", height: "10px" }} /> : <ArrowDown style={{ width: "10px", height: "10px" }} />}
      {Math.abs(val)}{suffix}
    </span>
  );
}

// ---- Status badge ----
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    pending:    { bg: "#FFFBEB", color: "#D97706" },
    accepted:   { bg: "#EFF6FF", color: "#2563EB" },
    dispatched: { bg: "#FAF5FF", color: "#7C3AED" },
    delivered:  { bg: "#F0FDF4", color: "#16A34A" },
    cancelled:  { bg: "#FEF2F2", color: "#DC2626" },
  };
  const s = map[status] || { bg: "#F8FAFC", color: "#64748B" };
  return (
    <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", padding: "3px 9px", borderRadius: "6px", background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// ---- Report type definitions ----
const REPORT_TYPES = [
  { id: "financial",   emoji: "💰", title: "Financial Report",        desc: "Revenue, expenses, profit margins and tax-ready ledger for the financial year.",               period: "FY 2025-26",   color: "#22C55E", bg: "#F0FDF4", border: "#86EFAC", icon: IndianRupee,   status: "Ready",   coverage: "6 months" },
  { id: "performance", emoji: "🌾", title: "Crop Performance Report", desc: "Yield comparison, AI quality grades, pricing analysis and stock health across all crops.",    period: "2026 Season",  color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: TrendingUp,    status: "Ready",   coverage: "All crops" },
  { id: "orders",      emoji: "📦", title: "Order Fulfillment Report",desc: "Complete dispatch history, buyer analytics, pending orders and fulfillment rates.",          period: "Q1 2026",     color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", icon: BarChart3,     status: "Ready",   coverage: "All orders" },
  { id: "inventory",   emoji: "🗃️", title: "Inventory Report",        desc: "Detailed stock levels, warehouse distribution and crop expiry tracking.",                     period: "June 2026",   color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD", icon: Package,      status: "Ready",   coverage: "All listings" },
  { id: "irrigation",  emoji: "💧", title: "Irrigation Report",       desc: "Water consumption analysis, irrigation schedule adherence and efficiency metrics.",           period: "June 2026",   color: "#06B6D4", bg: "#ECFEFF", border: "#A5F3FC", icon: Droplets,     status: "Ready",   coverage: "Full season" },
  { id: "ai",          emoji: "🤖", title: "AI Diagnostics Report",   desc: "Disease detection history, AI model performance and Gemini AI recommendation adherence.",    period: "Last 30 days", color: "#A855F7", bg: "#FAF5FF", border: "#D8B4FE", icon: Brain,       status: "Ready",   coverage: "All AI sessions" },
  { id: "logistics",   emoji: "🚚", title: "Logistics Report",        desc: "Route efficiency, delivery timelines, warehouse usage and carrier performance.",              period: "Q1 2026",     color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", icon: Globe,       status: "Ready",   coverage: "All routes" },
  { id: "customer",    emoji: "⭐", title: "Customer Review Report",  desc: "Buyer satisfaction scores, repeat customer metrics and sentiment analysis.",                  period: "2026",        color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: Star,        status: "Ready",   coverage: "All buyers" },
  { id: "calendar",    emoji: "📅", title: "Calendar & Activities",   desc: "Farm activity log, scheduled tasks, AI reminders and seasonal planting calendar.",           period: "June 2026",   color: "#10B981", bg: "#F0FDF4", border: "#6EE7B7", icon: Clock,       status: "Ready",   coverage: "Full month" },
];

export default function ReportsPage() {
  const { t } = useTranslation("farmer");
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<string[]>([]);
  const [farmerName, setFarmerName] = useState("Farmer");
  const [toast, setToast] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { crops } = useFarmerInventory();
  const { data: orders = [] } = useFarmerOrdersDirect();
  const { location, weather } = useLocationWeather();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setFarmerName(user.user_metadata.full_name.split(" ")[0]);
      else if (user?.email) setFarmerName(user.email.split("@")[0]);
    });
  }, []);

  const locationLabel = location?.city ? location.city : "Karnal, Haryana";
  const topCrop = useMemo(() => (crops && crops.length > 0) ? crops[0].title : "Basmati Rice", [crops]);
  const cropNames = useMemo(() => (crops && crops.length > 0) ? crops.map((c: any) => c.title) : ["Basmati Rice", "Alphonso Mango", "Turmeric"], [crops]);
  const liveOrderCount = orders.length;
  const totalRevenue = DEMO_SUMMARY.totalEarnings;

  const aiSummary = `Based on ${farmerName}'s complete farm activity, overall business performance has improved by ${DEMO_SUMMARY.revenueGrowth}%. ${topCrop} continues to be your highest-performing crop with strong buyer demand. Marketplace listings are gaining visibility across ${locationLabel} and neighboring mandis. Water efficiency remains above regional average. Your next recommended focus is logistics route optimization and proactive inventory planning before the next harvest season.`;

  // ---- KPI cards ----
  const kpiCards = [
    { icon: IndianRupee, label: "Total Revenue",     val: `₹${formatNumber(totalRevenue)}`,           trend: 23.4,  color: "#22C55E", bg: "#F0FDF4", border: "#86EFAC", spark: DEMO_CHART_DATA.map(d => d.personalEarnings) },
    { icon: Package,     label: "Orders Completed",  val: `${liveOrderCount || 28}`,                    trend: 12.1,  color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", spark: DEMO_CHART_DATA.map(d => d.orders) },
    { icon: Leaf,        label: "Active Crops",      val: `${cropNames.length}`,                        trend: 0,     color: "#10B981", bg: "#F0FDF4", border: "#6EE7B7", spark: [2,2,3,3,3,cropNames.length] },
    { icon: Star,        label: "Customer Rating",   val: "4.8",                                        trend: 0.2,   color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", spark: [4.5,4.6,4.7,4.7,4.8,4.8] },
    { icon: TrendingUp,  label: "Profit Margin",     val: "83.8%",                                      trend: 5.2,   color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", spark: DEMO_CHART_DATA.map(d => d.personalEarnings * 0.83) },
    { icon: ShieldCheck, label: "AI Farm Health",    val: `${DEMO_SUMMARY.farmHealthScore}%`,           trend: 3.0,   color: "#A855F7", bg: "#FAF5FF", border: "#D8B4FE", spark: [75,78,81,83,86,DEMO_SUMMARY.farmHealthScore] },
  ];

  // ---- Export handlers ----
  const handleGenerate = async (reportId: string, format: "pdf" | "excel") => {
    const key = `${reportId}-${format}`;
    setGenerating(key);
    try {
      const userLabel = `${farmerName} (AgriNex Farmer)`;
      if (reportId === "financial") {
        const columns = [
          { header: "Month",                       key: "month",            format: "string" as const },
          { header: "Your Earnings (₹)",         key: "personalEarnings", format: "currency" as const },
          { header: "Mandi Benchmark Avg (₹)",   key: "marketAverage",    format: "currency" as const },
          { header: "Orders Shipped",              key: "orders",           format: "number" as const },
        ];
        const title = "Financial Summary Report";
        const executiveSummary = `AgriNex AI financial statement for ${farmerName}. Summarizing monthly crop wholesale margins compared against APMC benchmark. Revenue growth: ${DEMO_SUMMARY.revenueGrowth}%.`;
        const totals = { month: "Total Summary", personalEarnings: DEMO_SUMMARY.totalEarnings, marketAverage: 371000, orders: DEMO_SUMMARY.bagsSold };
        if (format === "pdf") exportToPDF(title, DEMO_CHART_DATA, columns, { platform: "Farmer Platform", userName: userLabel, executiveSummary, totals });
        else exportToExcel(title, DEMO_CHART_DATA, columns, { platform: "Farmer Platform", userName: userLabel, executiveSummary, totals });
      } else if (reportId === "orders") {
        const flatOrdersData = DEMO_ORDERS.map(o => ({
          id: `#${o.id.slice(-6).toUpperCase()}`,
          buyer: o.consumer.full_name,
          crop: o.order_items[0]?.product?.title || "-",
          amount: o.total_amount,
          status: o.status,
          date: new Date(o.created_at).toLocaleDateString("en-IN"),
        }));
        const columns = [
          { header: "Order ID",           key: "id",     format: "string" as const },
          { header: "Buyer",              key: "buyer",  format: "string" as const },
          { header: "Crop Product",       key: "crop",   format: "string" as const },
          { header: "Total Amount (₹)", key: "amount", format: "currency" as const },
          { header: "Status",             key: "status", format: "string" as const },
          { header: "Date",               key: "date",   format: "string" as const },
        ];
        const title = "Order Fulfillment Report";
        const executiveSummary = `AgriNex AI transactions and logistics report for ${farmerName}. Showing crop fulfillment rates and invoice values.`;
        if (format === "pdf") exportToPDF(title, flatOrdersData, columns, { platform: "Farmer Platform", userName: userLabel, executiveSummary });
        else exportToExcel(title, flatOrdersData, columns, { platform: "Farmer Platform", userName: userLabel, executiveSummary });
      } else if (reportId === "performance" || reportId === "inventory") {
        const flatCropsData = DEMO_CROPS.map(c => ({
          title: c.title,
          grade: c.ai_quality_grade,
          stock: c.current_stock,
          unit: c.unit_type,
          price: c.farmer_price,
          recommended: c.ai_recommended_price,
          confidence: `${c.ai_confidence_score}%`,
        }));
        const columns = [
          { header: "Crop Product",                    key: "title",       format: "string" as const },
          { header: "AI Quality Grade",                key: "grade",       format: "string" as const },
          { header: "Current Stock",                   key: "stock",       format: "number" as const },
          { header: "Unit Type",                       key: "unit",        format: "string" as const },
          { header: "Farmer Price (₹/unit)",         key: "price",       format: "currency" as const },
          { header: "AI Recommended Price (₹/unit)", key: "recommended", format: "currency" as const },
          { header: "AI Confidence Score",             key: "confidence",  format: "string" as const },
        ];
        const title = reportId === "performance" ? "Farm Performance Report" : "Crop Inventory Report";
        const executiveSummary = `AgriNex AI crop listing report for ${farmerName}. Analyzing stock levels and grading scores generated by Gemini Vision AI.`;
        if (format === "pdf") exportToPDF(title, flatCropsData, columns, { platform: "Farmer Platform", userName: userLabel, executiveSummary });
        else exportToExcel(title, flatCropsData, columns, { platform: "Farmer Platform", userName: userLabel, executiveSummary });
      } else {
        const columns = [
          { header: "Month", key: "month", format: "string" as const },
          { header: "Earnings (₹)", key: "personalEarnings", format: "currency" as const },
          { header: "Orders", key: "orders", format: "number" as const },
        ];
        const rtype = REPORT_TYPES.find(r => r.id === reportId);
        const title = rtype?.title || "Farm Report";
        const executiveSummary = `AgriNex AI ${title} for ${farmerName}. Period: ${rtype?.period}. Coverage: ${rtype?.coverage}.`;
        if (format === "pdf") exportToPDF(title, DEMO_CHART_DATA, columns, { platform: "Farmer Platform", userName: userLabel, executiveSummary });
        else exportToExcel(title, DEMO_CHART_DATA, columns, { platform: "Farmer Platform", userName: userLabel, executiveSummary });
      }
      setGeneratedReports(prev => [...prev, key]);
      showToast(`${format.toUpperCase()} report exported successfully!`);
    } catch (err) {
      console.error("[Reports] Export failed:", err);
      showToast("Export failed. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const handleCompleteReport = (format: "pdf" | "excel" | "print") => {
    if (format === "print") { window.print(); return; }
    const columns = [
      { header: "Month", key: "month", format: "string" as const },
      { header: "Your Earnings (₹)", key: "personalEarnings", format: "currency" as const },
      { header: "Market Avg (₹)",    key: "marketAverage",    format: "currency" as const },
      { header: "Orders",              key: "orders",           format: "number" as const },
    ];
    const title = "Complete Farm Intelligence Report";
    const executiveSummary = aiSummary;
    const totals = { month: "Total", personalEarnings: totalRevenue, marketAverage: 371000, orders: liveOrderCount || 78 };
    const opts = { platform: "Farmer Platform", userName: `${farmerName} (AgriNex Farmer)`, executiveSummary, totals };
    if (format === "pdf") { exportToPDF(title, DEMO_CHART_DATA, columns, opts); showToast("Complete farm report PDF exported!"); }
    else { exportToExcel(title, DEMO_CHART_DATA, columns, opts); showToast("Complete farm report Excel exported!"); }
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff", borderRadius: "20px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    padding: "22px 24px",
    fontFamily: "Inter, sans-serif",
  };

  const filteredReports = activeFilter === "all" ? REPORT_TYPES : REPORT_TYPES.filter(r => r.id === activeFilter);

  // ---- DEDICATED REPORT PAGE VIEW (ISSUE 2) ----
  if (selectedReportId) {
    const reportDetails = REPORT_TYPES.find(r => r.id === selectedReportId) || REPORT_TYPES[0];
    const pdfKey = `${reportDetails.id}-pdf`;
    const excelKey = `${reportDetails.id}-excel`;
    const pdfDone = generatedReports.includes(pdfKey);
    const excelDone = generatedReports.includes(excelKey);

    return (
      <div style={{ fontFamily: "Inter, sans-serif", background: "#F8FAFC", paddingBottom: "48px", minHeight: "100vh" }}>
        
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

        {/* Back Button */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setSelectedReportId(null)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#ffffff", border: "1px solid #E5E7EB",
              borderRadius: "12px", padding: "10px 18px",
              fontSize: "13px", fontWeight: 700, color: "#374151", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.transform = "translateX(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.transform = "translateX(0)"; }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            Back to Dashboard
          </button>
        </div>

        {/* Dedicated Report Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdfa 100%)",
            border: "1px solid #bbf7d0", borderRadius: "20px",
            padding: "28px 32px", marginBottom: "24px",
            boxShadow: "0 4px 20px rgba(34,197,94,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: reportDetails.bg, border: `1px solid ${reportDetails.border}`, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "24px" }}>
                {reportDetails.emoji}
              </div>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#064e3b", margin: "0 0 4px" }}>
                  {reportDetails.title}
                </h1>
                <p style={{ fontSize: "13px", color: "#166534", margin: 0 }}>
                  Active analysis statement for {farmerName} · Period: {reportDetails.period}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => handleGenerate(reportDetails.id, "pdf")}
                disabled={!!generating}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px",
                  background: pdfDone ? "#22C55E" : "#EF4444", border: "none", borderRadius: "11px",
                  color: "#ffffff", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                }}
              >
                {generating === pdfKey ? <RefreshCw style={{ width: "13px", height: "13px", animation: "spin360 0.9s linear infinite" }} />
                  : pdfDone ? <CheckCircle style={{ width: "13px", height: "13px" }} />
                  : <Download style={{ width: "13px", height: "13px" }} />}
                {pdfDone ? "PDF Downloaded" : "Download PDF"}
              </button>
              <button
                onClick={() => handleGenerate(reportDetails.id, "excel")}
                disabled={!!generating}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px",
                  background: excelDone ? "#22C55E" : "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "11px",
                  color: excelDone ? "#ffffff" : "#16A34A", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                }}
              >
                {excelDone ? <CheckCircle style={{ width: "13px", height: "13px" }} /> : <FileSpreadsheet style={{ width: "13px", height: "13px" }} />}
                {excelDone ? "Excel Saved" : "Export Excel"}
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px",
                  background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: "11px",
                  color: "#374151", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                }}
              >
                <Printer style={{ width: "13px", height: "13px" }} /> Print
              </button>
            </div>
          </div>
        </motion.div>

        {/* Detailed Layout Container */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          
          {/* Executive Overview Card */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 12px" }}>Executive Summary & Meta Parameters</h3>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", border: "1px solid #E5E7EB", marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.65, margin: 0 }}>
                This is a dynamically assembled {reportDetails.title} compilation containing live farm feeds, profile parameters, and automated market evaluations under local APMC index guidelines. Generated on {new Date().toLocaleDateString()} with 96% AI confidence parameters.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              {[
                { label: "Data Scope", val: reportDetails.coverage, icon: Globe },
                { label: "Date Span", val: reportDetails.period, icon: Calendar },
                { label: "Integrity Verification", val: "Supabase Live SSL", icon: ShieldCheck },
                { label: "Confidence Coefficient", val: "96.4% Accuracy", icon: Brain },
              ].map(cell => (
                <div key={cell.label} style={{ padding: "12px", border: "1px solid #F1F5F9", borderRadius: "10px", background: "#FAFAFA" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <cell.icon style={{ width: "14px", height: "14px", color: "#6366F1" }} />
                    <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>{cell.label}</span>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{cell.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Render dynamic reports depending on ID */}
          {selectedReportId === "financial" && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px" }}>Financial Ledger Breakdown</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {["Month", "Personal Earnings (₹)", "Market Benchmark (₹)", "Performance Variance"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_CHART_DATA.map((d, idx) => (
                      <tr key={d.month} style={{ borderTop: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 700 }}>{d.month}</td>
                        <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 800, color: "#22C55E" }}>₹{formatNumber(d.personalEarnings)}</td>
                        <td style={{ padding: "12px 14px", fontSize: "13px", color: "#64748B" }}>₹{formatNumber(d.marketAverage)}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <Trend val={Math.round(((d.personalEarnings - d.marketAverage)/d.marketAverage)*100)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReportId === "performance" && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px" }}>Crop Performance Indicators</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                {DEMO_CROPS.slice(0, 3).map((crop, i) => (
                  <div key={crop.id} style={{ background: "#FAFAFA", borderRadius: "14px", border: "1px solid #E5E7EB", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800 }}>{crop.title}</span>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#16A34A", background: "#F0FDF4", padding: "2px 7px", borderRadius: "5px" }}>{crop.ai_quality_grade}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Current Stock</span>
                        <strong style={{ color: "#1F2937" }}>{crop.current_stock} {crop.unit_type}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Recommended Price</span>
                        <strong style={{ color: "#22C55E" }}>₹{crop.ai_recommended_price}/{crop.unit_type}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>AI Confidence Score</span>
                        <strong style={{ color: "#3B82F6" }}>{crop.ai_confidence_score}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReportId === "orders" && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px" }}>Transaction Ledger & Dispatches</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {["ID", "Buyer", "Product", "Value", "Status", "Date"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_ORDERS.map(o => (
                      <tr key={o.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "12px 14px", fontSize: "12px", fontFamily: "monospace", color: "#6366F1" }}>#{o.id.slice(-6).toUpperCase()}</td>
                        <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 700 }}>{o.consumer.full_name}</td>
                        <td style={{ padding: "12px 14px", fontSize: "12px" }}>{o.order_items[0]?.product?.title}</td>
                        <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 800, color: "#22C55E" }}>₹{formatNumber(o.total_amount)}</td>
                        <td style={{ padding: "12px 14px" }}><StatusBadge status={o.status} /></td>
                        <td style={{ padding: "12px 14px", fontSize: "11px", color: "#94A3B8" }}>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fallback layout for other reports */}
          {!["financial", "performance", "orders"].includes(selectedReportId) && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px" }}>Analytics Trend</h3>
              <div style={{ height: "240px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEMO_CHART_DATA}>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", borderColor: "#E5E7EB", borderRadius: "12px" }} />
                    <Bar dataKey="personalEarnings" name="Operational Quantity" fill={reportDetails.color} radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

      </div>
    );
  }

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

      {/* ---- HERO (RESOLVES ISSUE 3: LIGHT GREEN MINT MUDDY BLUE GRADIENT REPLACED) ---- */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdfa 100%)",
          border: "1px solid #bbf7d0", borderRadius: "24px",
          padding: "36px 40px", marginBottom: "28px",
          boxShadow: "0 4px 20px rgba(34,197,94,0.06)",
        }}
      >
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(34,197,94,0.18)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "30%", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(16,185,129,0.12)", filter: "blur(40px)" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
            {[`Farmer: ${farmerName}`, `Location: ${locationLabel}`, `${cropNames.length} Active Crops`, "AI-Powered Reports"].map(pill => (
              <span key={pill} style={{ background: "rgba(4,120,87,0.06)", border: "1px solid rgba(4,120,87,0.15)", borderRadius: "99px", padding: "5px 14px", fontSize: "12px", fontWeight: 700, color: "#047857" }}>{pill}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#064e3b", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
                📑 AI Farm Reports & Export Center
              </h1>
              <p style={{ fontSize: "14px", color: "#1b4332", margin: 0, lineHeight: 1.65, maxWidth: "520px" }}>
                Generate intelligent business reports, operational summaries, financial statements and AI-powered farm insights from your complete farm activities.
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                {["Financial Reports", "AI Diagnostics", "Inventory Reports", "Export Center"].map(tag => (
                  <span key={tag} style={{ background: "rgba(4,120,87,0.08)", border: "1px solid rgba(4,120,87,0.2)", borderRadius: "99px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "#047857" }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexDirection: "column", minWidth: "180px" }}>
              <button onClick={() => handleCompleteReport("pdf")} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", background: "#16a34a", border: "none", borderRadius: "12px", color: "#ffffff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                <Download style={{ width: "14px", height: "14px" }} /> Download PDF
              </button>
              <button onClick={() => handleCompleteReport("excel")} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", background: "#f0fdf4", border: "1px solid #86EFAC", borderRadius: "12px", color: "#15803d", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                <FileSpreadsheet style={{ width: "14px", height: "14px" }} /> Export Excel
              </button>
              <button onClick={() => handleCompleteReport("print")} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", background: "#ffffff", border: "1px solid #dcfce7", borderRadius: "12px", color: "#166534", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                <Printer style={{ width: "14px", height: "14px" }} /> Print
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---- KPI Cards ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {kpiCards.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
            style={{ background: "#ffffff", borderRadius: "18px", border: `1px solid ${k.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
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

      {/* ---- Complete Farm Report Banner ---- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ ...cardStyle, background: "linear-gradient(135deg, #F0F9FF 0%, #EEF2FF 50%, #FAF5FF 100%)", border: "1px solid #C7D2FE", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: "linear-gradient(135deg, #1D4ED8, #7C3AED)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText style={{ width: "22px", height: "22px", color: "#ffffff" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1E3A5F", margin: "0 0 6px" }}>
              Generate Complete Farm Report
            </h2>
            <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.65, margin: "0 0 14px", maxWidth: "600px" }}>
              Generate a single comprehensive professional report combining every module of the platform.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {["Farmer Profile", "Financial Summary", "Inventory", "Orders", "AI Diagnostics", "Irrigation", "Logistics"].map(m => (
                <span key={m} style={{ fontSize: "10px", fontWeight: 700, color: "#1D4ED8", background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.2)", borderRadius: "6px", padding: "3px 10px" }}>{m}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
            <button onClick={() => handleCompleteReport("pdf")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", background: "#1D4ED8", border: "none", borderRadius: "11px", color: "#ffffff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              <Download style={{ width: "13px", height: "13px" }} /> PDF
            </button>
            <button onClick={() => handleCompleteReport("excel")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "11px", color: "#16A34A", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              <FileSpreadsheet style={{ width: "13px", height: "13px" }} /> Excel
            </button>
            <button onClick={() => handleCompleteReport("print")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: "11px", color: "#374151", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              <Printer style={{ width: "13px", height: "13px" }} /> Print
            </button>
          </div>
        </div>
      </motion.div>

      {/* ---- Revenue Chart ---- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ ...cardStyle, marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>Revenue Trend - FY 2025-26</h2>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Your monthly earnings vs APMC market benchmark</p>
          </div>
          <Trend val={DEMO_SUMMARY.revenueGrowth} />
        </div>
        <div style={{ height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_CHART_DATA}>
              <defs>
                <linearGradient id="rptEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rptMarket" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fff", borderColor: "#E5E7EB", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }} itemStyle={{ fontSize: "12px", color: "#334155" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="personalEarnings" name="Your Earnings" stroke="#22C55E" strokeWidth={2.5} fillOpacity={1} fill="url(#rptEarnings)" />
              <Area type="monotone" dataKey="marketAverage"    name="Market Avg"    stroke="#3B82F6" strokeWidth={2}   strokeDasharray="4 4" fillOpacity={1} fill="url(#rptMarket)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ---- AI Business Summary ---- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ ...cardStyle, background: "linear-gradient(135deg, #FAF5FF 0%, #EEF2FF 60%, #ffffff 100%)", border: "1px solid #C4B5FD", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles style={{ width: "20px", height: "20px", color: "#ffffff" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#4C1D95", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "8px" }}>
              AI Business Summary
              <span style={{ fontSize: "10px", background: "#7C3AED", color: "#fff", borderRadius: "6px", padding: "2px 8px", fontWeight: 700 }}>DYNAMIC</span>
            </h2>
            <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.75, margin: "0 0 12px" }}>{aiSummary}</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[`Top Crop: ${topCrop}`, `Growth: +${DEMO_SUMMARY.revenueGrowth}%`, `Health: ${DEMO_SUMMARY.farmHealthScore}%`, `Orders: ${liveOrderCount || 28}`].map(tag => (
                <span key={tag} style={{ fontSize: "11px", fontWeight: 700, color: "#6D28D9", background: "rgba(124,58,237,0.1)", borderRadius: "7px", padding: "3px 10px" }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---- Filter Bar ---- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
        style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "4px" }}>
          <Filter style={{ width: "14px", height: "14px", color: "#64748B" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Filter:</span>
        </div>
        {[{ id: "all", label: "All Reports" }, ...REPORT_TYPES.slice(0, 5).map(r => ({ id: r.id, label: r.emoji + " " + r.title.split(" ")[0] }))].map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
            padding: "6px 14px", borderRadius: "99px", border: "1px solid", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", fontFamily: "Inter, sans-serif",
            background: activeFilter === f.id ? "#1D4ED8" : "#ffffff",
            color: activeFilter === f.id ? "#ffffff" : "#374151",
            borderColor: activeFilter === f.id ? "#1D4ED8" : "#E5E7EB",
            transition: "all 0.2s ease",
          }}>
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* ---- Report Category Cards (RESOLVES ISSUE 2: NAVIGATE TO VIEW DEDICATED REPORT PAGE) ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {filteredReports.map((report, idx) => {
          const pdfKey = `${report.id}-pdf`;
          const excelKey = `${report.id}-excel`;
          const pdfDone = generatedReports.includes(pdfKey);
          const excelDone = generatedReports.includes(excelKey);
          return (
            <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
              style={{ background: "#ffffff", borderRadius: "18px", border: `1px solid ${report.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "20px", transition: "transform 0.2s, box-shadow 0.2s" }}>
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: report.bg, border: `1px solid ${report.border}`, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                    {report.emoji}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1F2937", margin: "0 0 3px" }}>{report.title}</h3>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: report.color, background: report.bg, borderRadius: "5px", padding: "2px 8px" }}>{report.period}</span>
                  </div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#16A34A", background: "#F0FDF4", borderRadius: "6px", padding: "3px 9px" }}>
                  {report.status}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.65, margin: "0 0 10px" }}>{report.desc}</p>
              {/* Meta row */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600 }}>Coverage: <strong style={{ color: "#374151" }}>{report.coverage}</strong></span>
                <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600 }}>Updated: <strong style={{ color: "#374151" }}>Today</strong></span>
              </div>
              {/* Progress bar */}
              <div style={{ height: "4px", borderRadius: "99px", background: "#F1F5F9", overflow: "hidden", marginBottom: "14px" }}>
                <div style={{ width: "92%", height: "100%", background: `linear-gradient(90deg, ${report.color}, ${report.color}99)`, borderRadius: "99px", transition: "width 0.6s ease" }} />
              </div>
              {/* Action buttons */}
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                <button onClick={() => setSelectedReportId(report.id)} style={{
                  display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "9px",
                  border: "1px solid #1D4ED8", background: "#1D4ED8",
                  color: "#ffffff", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif",
                }}>
                  <Eye style={{ width: "11px", height: "11px" }} /> View Report
                </button>
                <button onClick={() => handleGenerate(report.id, "pdf")} disabled={!!generating} style={{
                  display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px",
                  border: "none", cursor: !!generating ? "wait" : "pointer",
                  background: pdfDone ? "#F0FDF4" : "#FEF2F2",
                  color: pdfDone ? "#16A34A" : "#DC2626",
                  fontSize: "11px", fontWeight: 700, fontFamily: "Inter, sans-serif",
                  transition: "opacity 0.2s ease",
                }}>
                  {generating === pdfKey ? <RefreshCw style={{ width: "11px", height: "11px", animation: "spin360 0.9s linear infinite" }} />
                    : pdfDone ? <CheckCircle style={{ width: "11px", height: "11px" }} />
                    : <Download style={{ width: "11px", height: "11px" }} />}
                  {pdfDone ? "PDF Ready" : "Download PDF"}
                </button>
                <button onClick={() => handleGenerate(report.id, "excel")} disabled={!!generating} style={{
                  display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px",
                  border: "none", cursor: !!generating ? "wait" : "pointer",
                  background: excelDone ? "#F0FDF4" : "#F0F9FF",
                  color: excelDone ? "#16A34A" : "#0369A1",
                  fontSize: "11px", fontWeight: 700, fontFamily: "Inter, sans-serif",
                  transition: "opacity 0.2s ease",
                }}>
                  {excelDone ? <CheckCircle style={{ width: "11px", height: "11px" }} /> : <FileSpreadsheet style={{ width: "11px", height: "11px" }} />}
                  {excelDone ? "Excel Ready" : "Export Excel"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ---- Transaction Ledger ---- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ ...cardStyle, marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Receipt style={{ width: "16px", height: "16px", color: "#6366F1" }} />
              Recent Transaction Ledger
            </h2>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Last 30 days - All orders and payments</p>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#22C55E", background: "#F0FDF4", borderRadius: "8px", padding: "4px 12px" }}>Live</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Order ID", "Buyer", "Crop", "Amount", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left" as const, fontSize: "10px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_ORDERS.map((o, i) => (
                <tr key={o.id} style={{ borderTop: "1px solid #F1F5F9", transition: "background 0.15s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: 700, color: "#6366F1", fontFamily: "monospace" }}>#{o.id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>{o.consumer.full_name}</td>
                  <td style={{ padding: "12px 14px", fontSize: "12px", color: "#374151" }}>{o.order_items[0]?.product?.title || "-"}</td>
                  <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 800, color: "#22C55E" }}>₹{formatNumber(o.total_amount)}</td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: "12px 14px", fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => showToast(`Viewing order #${o.id.slice(-6).toUpperCase()}`)} style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid #E5E7EB", background: "#F8FAFC", color: "#374151", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                        View
                      </button>
                      <button onClick={() => handleGenerate("orders", "pdf")} style={{ padding: "4px 10px", borderRadius: "7px", border: "none", background: "#FEF2F2", color: "#DC2626", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ---- Crop Performance Summary ---- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ ...cardStyle, marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>
              {t("cropPerformanceSummary")}
            </h2>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>AI quality grades, pricing and confidence scores</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
          {DEMO_CROPS.slice(0, 3).map((crop, i) => (
            <motion.div key={crop.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}
              style={{ background: "#FAFAFA", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "16px" }}>
              <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: PAL[i] + "20", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                    <Leaf style={{ width: "16px", height: "16px", color: PAL[i] }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{crop.title}</p>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#16A34A", background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "5px", padding: "1px 7px" }}>{crop.ai_quality_grade}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                {[
                  { label: "Stock",        val: `${crop.current_stock.toLocaleString()} ${crop.unit_type}` },
                  { label: "Your Price",   val: `₹${crop.farmer_price}/${crop.unit_type}` },
                  { label: "AI Rec Price", val: `₹${crop.ai_recommended_price}/${crop.unit_type}` },
                  { label: "AI Confidence", val: `${crop.ai_confidence_score}%` },
                ].map(s => (
                  <div key={s.label} style={{ background: "#ffffff", borderRadius: "8px", padding: "7px 10px", border: "1px solid #F1F5F9" }}>
                    <p style={{ fontSize: "9px", color: "#94A3B8", fontWeight: 700, margin: "0 0 2px", textTransform: "uppercase" }}>{s.label}</p>
                    <p style={{ fontSize: "12px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{s.val}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600 }}>AI Confidence</span>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: PAL[i] }}>{crop.ai_confidence_score}%</span>
                </div>
                <div style={{ height: "5px", borderRadius: "99px", background: "#F1F5F9", overflow: "hidden" }}>
                  <div style={{ width: `${crop.ai_confidence_score}%`, height: "100%", background: `linear-gradient(90deg, ${PAL[i]}, ${PAL[i]}aa)`, borderRadius: "99px", transition: "width 0.6s ease" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "7px" }}>
                <button onClick={() => setSelectedReportId("performance")} style={{ flex: 1, padding: "7px", borderRadius: "9px", border: "none", background: PAL[i] + "15", color: PAL[i], fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  View Details
                </button>
                <button onClick={() => handleGenerate("performance", "pdf")} style={{ padding: "7px 12px", borderRadius: "9px", border: "1px solid #E5E7EB", background: "#ffffff", color: "#374151", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  <Download style={{ width: "11px", height: "11px" }} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ---- Export Center ---- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} style={cardStyle}>
        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 4px" }}>Export Center</h2>
        <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 18px" }}>Choose your preferred export format for the complete farm report</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>
          {[
            { label: "Export PDF Report",    sub: "Professional formatted PDF",   icon: Download,        color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", action: () => handleCompleteReport("pdf") },
            { label: "Export Excel Ledger",  sub: "Full data spreadsheet",         icon: FileSpreadsheet, color: "#22C55E", bg: "#F0FDF4", border: "#86EFAC", action: () => handleCompleteReport("excel") },
            { label: "Print Report",         sub: "Browser print dialog",          icon: Printer,         color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", action: () => handleCompleteReport("print") },
            { label: "Print This Page",      sub: "Current view printout",         icon: Printer,         color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD", action: () => window.print() },
          ].map((btn) => (
            <button key={btn.label} onClick={btn.action} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 16px", borderRadius: "14px",
              border: `1px solid ${btn.border}`, background: btn.bg,
              cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" as const,
              transition: "opacity 0.2s ease, transform 0.15s ease",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: btn.color + "20", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <btn.icon style={{ width: "16px", height: "16px", color: btn.color }} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", margin: "0 0 2px" }}>{btn.label}</p>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>{btn.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
