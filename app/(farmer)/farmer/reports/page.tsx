"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  FileSpreadsheet,
  TrendingUp,
  Package,
  IndianRupee,
  Calendar,
  Printer,
  BarChart3,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { DEMO_SUMMARY, DEMO_CHART_DATA, DEMO_CROPS, DEMO_ORDERS } from "@/lib/demoData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";
import { exportToPDF, exportToExcel } from "@/lib/exporter";

const REPORT_TYPES = [
  {
    id: "financial",
    title: "Financial Summary Report",
    desc: "Revenue, expenses, profit margins and tax-ready ledger for the financial year.",
    icon: IndianRupee,
    color: "emerald",
    period: "FY 2025–26",
  },
  {
    id: "inventory",
    title: "Crop Inventory & Stock Report",
    desc: "Detailed stock levels, expiry tracking and warehouse distribution analysis.",
    icon: Package,
    color: "blue",
    period: "June 2026",
  },
  {
    id: "orders",
    title: "Order Fulfillment Report",
    desc: "Complete dispatch history, pending orders and buyer analytics.",
    icon: BarChart3,
    color: "purple",
    period: "Q1 2026",
  },
  {
    id: "performance",
    title: "Farm Performance Report",
    desc: "Yield comparison, soil health scores and AI recommendation adherence.",
    icon: TrendingUp,
    color: "amber",
    period: "2026 Season",
  },
];

export default function ReportsPage() {
  const { t } = useTranslation("farmer");
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<string[]>([]);

  const handleGenerate = async (reportId: string, format: "pdf" | "excel") => {
    const key = `${reportId}-${format}`;
    setGenerating(key);

    try {
      if (reportId === "financial") {
        const columns = [
          { header: "Month", key: "month", format: "string" as const },
          { header: "Your Earnings (Rs.)", key: "personalEarnings", format: "currency" as const },
          { header: "Mandi Benchmark Avg (Rs.)", key: "marketAverage", format: "currency" as const },
          { header: "Orders Shipped", key: "orders", format: "number" as const },
        ];
        const title = "Financial Summary Report";
        const executiveSummary = "AgriNex AI financial statement summarizing monthly crop wholesale margins compared against APMC benchmark wholesale averages.";
        const totals = {
          month: "Total Summary",
          personalEarnings: DEMO_SUMMARY.totalEarnings,
          marketAverage: 371000,
          orders: DEMO_SUMMARY.bagsSold,
        };

        if (format === "pdf") {
          exportToPDF(title, DEMO_CHART_DATA, columns, {
            platform: "Farmer Platform",
            userName: "Devendra P. (Potato Cultivator)",
            executiveSummary,
            totals,
          });
        } else {
          exportToExcel(title, DEMO_CHART_DATA, columns, {
            platform: "Farmer Platform",
            userName: "Devendra P. (Potato Cultivator)",
            executiveSummary,
            totals,
          });
        }
      } else if (reportId === "orders") {
        const flatOrdersData = DEMO_ORDERS.map(o => ({
          id: `#${o.id.slice(-6).toUpperCase()}`,
          buyer: o.consumer.full_name,
          crop: o.order_items[0]?.product?.title || "-",
          amount: o.total_amount,
          status: o.status,
          date: new Date(o.created_at).toLocaleDateString("en-IN")
        }));

        const columns = [
          { header: "Order ID", key: "id", format: "string" as const },
          { header: "Buyer", key: "buyer", format: "string" as const },
          { header: "Crop Product", key: "crop", format: "string" as const },
          { header: "Total Amount (Rs.)", key: "amount", format: "currency" as const },
          { header: "Fulfillment Status", key: "status", format: "string" as const },
          { header: "Transaction Date", key: "date", format: "string" as const },
        ];
        const title = "Order Fulfillment Report";
        const executiveSummary = "AgriNex AI transactions and logistics report showing crop fulfillment rates and invoice values.";

        if (format === "pdf") {
          exportToPDF(title, flatOrdersData, columns, {
            platform: "Farmer Platform",
            userName: "Devendra P. (Potato Cultivator)",
            executiveSummary,
          });
        } else {
          exportToExcel(title, flatOrdersData, columns, {
            platform: "Farmer Platform",
            userName: "Devendra P. (Potato Cultivator)",
            executiveSummary,
          });
        }
      } else if (reportId === "performance") {
        const flatCropsData = DEMO_CROPS.map(c => ({
          title: c.title,
          grade: c.ai_quality_grade,
          stock: c.current_stock,
          unit: c.unit_type,
          price: c.farmer_price,
          recommended: c.ai_recommended_price,
          confidence: `${c.ai_confidence_score}%`
        }));

        const columns = [
          { header: "Crop Product", key: "title", format: "string" as const },
          { header: "AI Quality Grade", key: "grade", format: "string" as const },
          { header: "Current Stock", key: "stock", format: "number" as const },
          { header: "Unit Type", key: "unit", format: "string" as const },
          { header: "Farmer Price (Rs./unit)", key: "price", format: "currency" as const },
          { header: "AI Recommended Price (Rs./unit)", key: "recommended", format: "currency" as const },
          { header: "AI Confidence Score", key: "confidence", format: "string" as const },
        ];
        const title = "Farm Performance Report";
        const executiveSummary = "AgriNex AI crop listing report analyzing stock levels and grading scores generated by Gemini Vision AI.";

        if (format === "pdf") {
          exportToPDF(title, flatCropsData, columns, {
            platform: "Farmer Platform",
            userName: "Devendra P. (Potato Cultivator)",
            executiveSummary,
          });
        } else {
          exportToExcel(title, flatCropsData, columns, {
            platform: "Farmer Platform",
            userName: "Devendra P. (Potato Cultivator)",
            executiveSummary,
          });
        }
      }

      setGeneratedReports((prev) => [...prev, key]);
    } catch (err) {
      console.error("[Reports] Export failed:", err);
    } finally {
      setGenerating(null);
    }
  };

  const stats = [
    { label: "Total Revenue", value: `₹${DEMO_SUMMARY.totalEarnings.toLocaleString("en-IN")}`, icon: IndianRupee, color: "emerald" },
    { label: "Units Dispatched", value: `${DEMO_SUMMARY.bagsSold} Kg`, icon: Package, color: "blue" },
    { label: "Active Listings", value: `${DEMO_SUMMARY.activeListings}`, icon: TrendingUp, color: "purple" },
    { label: "Revenue Growth", value: `+${DEMO_SUMMARY.revenueGrowth}%`, icon: BarChart3, color: "amber" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Reports & Export Center
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {t("generatePdfExcelSummariesOfYou")}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-mono rounded-xl transition self-start sm:self-auto shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          Print This Page
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="premium-card shadow-sm p-4 rounded-2xl"
            >
              <p className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</p>
              <p className={`text-xl font-bold text-white mt-1`}>{s.value}</p>
              <div className={`w-8 h-8 rounded-xl bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center mt-2`}>
                <Icon className={`w-4 h-4 text-${s.color}-400`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="premium-card shadow-sm p-5 rounded-2xl">
        <h2 className="text-sm font-bold text-slate-800 mb-1">Revenue Trend — FY 2025–26</h2>
        <p className="text-slate-500 text-[11px] mb-4">Monthly revenue vs market average benchmark</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_CHART_DATA}>
              <defs>
                <linearGradient id="rptRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0d1426", borderColor: "#e2e8f0", borderRadius: "12px" }}
                itemStyle={{ fontSize: "11px" }}
              />
              <Area type="monotone" dataKey="personalEarnings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#rptRevenue)" name="Your Earnings" />
              <Area type="monotone" dataKey="marketAverage" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" fillOpacity={0} name="Market Avg" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORT_TYPES.map((report, idx) => {
          const Icon = report.icon;
          const pdfKey = `${report.id}-pdf`;
          const excelKey = `${report.id}-excel`;
          const pdfGenerated = generatedReports.includes(pdfKey);
          const excelGenerated = generatedReports.includes(excelKey);

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              className="premium-card shadow-sm p-5 rounded-2xl space-y-4 border border-slate-100 hover:border-slate-200 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${report.color}-500/10 border border-${report.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${report.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{report.title}</h3>
                    <span className={`text-[10px] font-mono text-${report.color}-400`}>{report.period}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{report.desc}</p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleGenerate(report.id, "pdf")}
                  disabled={!!generating}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-mono font-bold transition",
                    pdfGenerated
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                  )}
                >
                  {generating === pdfKey ? (
                    <span className="animate-pulse">{t("generating")}</span>
                  ) : pdfGenerated ? (
                    <><CheckCircle className="w-3.5 h-3.5" /> PDF Ready</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> {t("downloadPDF")}</>
                  )}
                </button>
                <button
                  onClick={() => handleGenerate(report.id, "excel")}
                  disabled={!!generating}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-mono font-bold transition",
                    excelGenerated
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                  )}
                >
                  {generating === excelKey ? (
                    <span className="animate-pulse">{t("generating")}</span>
                  ) : excelGenerated ? (
                    <><CheckCircle className="w-3.5 h-3.5" /> {t("excelReady")}</>
                  ) : (
                    <><FileSpreadsheet className="w-3.5 h-3.5" /> {t("excelExport")}</>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders Summary Table */}
      <div className="premium-card shadow-sm p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">Recent Transaction Ledger</h2>
          <span className="text-[10px] font-mono text-slate-500">Last 30 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="py-2">{t("orderId")}</th>
                <th className="py-2">{t("buyer")}</th>
                <th className="py-2">{t("cropHealth")}</th>
                <th className="py-2 text-right">{t("schemeAmount")}</th>
                <th className="py-2">{t("schemeStatus")}</th>
                <th className="py-2">{t("date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {DEMO_ORDERS.map((o) => (
                <tr key={o.id} className="text-white hover:bg-white/[0.02] transition">
                  <td className="py-3 text-slate-500">#{o.id.slice(-6).toUpperCase()}</td>
                  <td className="py-3 font-sans font-bold">{o.consumer.full_name}</td>
                  <td className="py-3 font-sans">{o.order_items[0]?.product?.title}</td>
                  <td className="py-3 text-right text-emerald-600 font-bold">₹{o.total_amount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border",
                      o.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : o.status === "accepted" ? "bg-blue-500/10 text-white border-blue-500/20"
                      : o.status === "dispatched" ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crop Performance Summary */}
      <div className="premium-card shadow-sm p-5 rounded-2xl">
        <h2 className="text-sm font-bold text-slate-800 mb-4">{t("cropPerformanceSummary")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_CROPS.slice(0, 3).map((crop) => (
            <div key={crop.id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold text-slate-800 leading-tight">{crop.title}</h4>
                <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                  {crop.ai_quality_grade}
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Stock:</span>
                  <span className="text-slate-800 font-bold">{crop.current_stock.toLocaleString()} {crop.unit_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Price:</span>
                  <span className="text-emerald-600 font-bold">₹{crop.farmer_price}/{crop.unit_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("aiRecommended")}</span>
                  <span className="text-slate-800 font-bold">₹{crop.ai_recommended_price}/{crop.unit_type}</span>
                </div>
              </div>
              <div className="w-full bg-slate-50 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${crop.ai_confidence_score}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-600 font-mono">AI Confidence: {crop.ai_confidence_score}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}