"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, DollarSign, Award, ChevronDown, Download, FileSpreadsheet, Sparkles, Target, Zap } from "lucide-react";
import { DEMO_CHART_DATA, DEMO_SUMMARY } from "@/lib/demoData";
import { cn } from "@/lib/utils";
import { exportToPDF, exportToExcel } from "@/lib/exporter";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const { t } = useTranslation("farmer");
  const [timeframe, setTimeframe] = useState("monthly");

  const pieData = [
    { name: "Basmati Rice", value: 350000 },
    { name: "Alphonso Mango", value: 120000 },
    { name: "Turmeric Finger", value: 59000 },
  ];

  const handleExport = (format: "pdf" | "excel") => {
    const columns = [
      { header: "Month", key: "month", format: "string" as const },
      { header: "Your Earnings (Rs.)", key: "personalEarnings", format: "currency" as const },
      { header: "Mandi Benchmark Avg (Rs.)", key: "marketAverage", format: "currency" as const },
      { header: "Dispatches Volume (Orders)", key: "orders", format: "number" as const },
    ];

    const title = "Performance Analytics Ledger";
    const executiveSummary = "AgriNex AI quarterly performance report. Summary of personal monthly mandi sales volume dispatches and mandi wholesale benchmark index averages.";
    const totals = {
      month: "Total Summary",
      personalEarnings: 384000,
      marketAverage: 371000,
      orders: 78,
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
  };

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-blue-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Performance Analytics
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {t("detailedReportsOfEarningsMargi")}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-blue-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">{t("aiPoweredInsights")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-purple-200 shadow-sm">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-slate-700">Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">Live Updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end gap-3"
      >
        <button
          onClick={() => handleExport("pdf")}
          className="flex items-center gap-2 px-5 py-2.5 premium-card hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          {t("exportPdf")}
        </button>
        <button
          onClick={() => handleExport("excel")}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl transition shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {t("excelLedger")}
        </button>
      </motion.div>

      {/* Overview Cards */}
      <motion.div 
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <motion.div custom={0} variants={statCardVariants} className="premium-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t("aggregateEarnings")}</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">₹{DEMO_SUMMARY.totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-2">↑ Lifetime</p>
        </motion.div>
        
        <motion.div custom={1} variants={statCardVariants} className="premium-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Profit Margin</p>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">83.8%</p>
          <p className="text-xs text-emerald-600 font-semibold mt-2">↑ Above average</p>
        </motion.div>
        
        <motion.div custom={2} variants={statCardVariants} className="premium-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Revenue Growth</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">+{DEMO_SUMMARY.revenueGrowth}%</p>
          <p className="text-xs text-emerald-600 font-semibold mt-2">↑ YoY growth</p>
        </motion.div>
        
        <motion.div custom={3} variants={statCardVariants} className="premium-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t("dispatchedUnits")}</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{DEMO_SUMMARY.bagsSold} Kg</p>
          <p className="text-xs text-blue-600 font-semibold mt-2">Total shipped</p>
        </motion.div>
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 premium-card rounded-3xl p-6 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Monthly Revenue Trends</h3>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value={t("weekly")}>Weekly View</option>
              <option value={t("monthly")}>Monthly View</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_CHART_DATA}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", borderColor: "#e2e8f0", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                  itemStyle={{ fontSize: "12px", color: "#334155" }}
                />
                <Area type="monotone" dataKey="personalEarnings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#revenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sales by crop breakdown donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="premium-card rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
        >
          <h3 className="text-lg font-bold text-slate-800">Sales Breakdown by Crop</h3>
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TOTAL SALES</p>
              <p className="text-sm font-extrabold text-slate-800">₹5.29L</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            {pieData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  {item.name}
                </span>
                <span className="text-slate-800 font-bold">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Grid Row 3: Orders count + Top buyers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Orders Count Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 premium-card rounded-3xl p-6 shadow-sm space-y-4"
        >
          <h3 className="text-lg font-bold text-slate-800">Volume Order Dispatches (Count)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_CHART_DATA}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", borderColor: "#e2e8f0", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                  itemStyle={{ fontSize: "12px", color: "#334155" }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Crop Rank Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="premium-card rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">{t("cropSalesRankings")}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">{t("str_1BestSeller")}</span>
                  <p className="text-sm font-bold text-slate-800">{t("basmatiRiceTitle")}</p>
                </div>
                <span className="text-emerald-700 font-bold">₹3.50L</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("str_2RunnerUp")}</span>
                  <p className="text-sm font-bold text-slate-800">{t("alphonsoMangoTitle")}</p>
                </div>
                <span className="text-slate-700 font-bold">₹1.20L</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">{t("str_6LowestRevenue")}</span>
                  <p className="text-sm font-bold text-slate-800">{t("hybridTomatoes")}</p>
                </div>
                <span className="text-rose-600 font-bold">₹0</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center font-semibold mt-4 pt-4 border-t border-slate-100">
            Updated automatically at APMC Mandi settlement.
          </div>
        </motion.div>
      </div>
    </div>
  );
}