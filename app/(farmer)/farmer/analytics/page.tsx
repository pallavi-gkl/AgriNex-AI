"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, DollarSign, Award, ChevronDown, Download, FileSpreadsheet } from "lucide-react";
import { DEMO_CHART_DATA, DEMO_SUMMARY } from "@/lib/demoData";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("monthly");

  const pieData = [
    { name: "Basmati Rice", value: 350000 },
    { name: "Alphonso Mango", value: 120000 },
    { name: "Turmeric Finger", value: 59000 },
  ];

  const handleExport = (format: "pdf" | "excel") => {
    alert(`Generating AgriNex ${format.toUpperCase()} analytics report simulation... Download will start automatically.`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Performance Analytics</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Detailed reports of your operational earnings, margins, order dispatch rates, and product sales.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF Report
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel Ledger
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500">AGGREGATE EARNINGS</p>
          <p className="text-xl font-bold text-white mt-1">₹{DEMO_SUMMARY.totalEarnings.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500">PROFITABILITY MARGIN</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">83.8%</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500">REVENUE GROWTH RATE</p>
          <p className="text-xl font-bold text-white mt-1">+{DEMO_SUMMARY.revenueGrowth}%</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500">DISPATCHED UNITS</p>
          <p className="text-xl font-bold text-white mt-1">{DEMO_SUMMARY.bagsSold} Kg</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings area chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Monthly Revenue Trends</h3>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_CHART_DATA}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0d1426", borderColor: "rgba(255,255,255,0.08)", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="personalEarnings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#revenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by crop breakdown donut */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white">Sales Breakdown by Crop</h3>
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
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
              <p className="text-[10px] text-slate-500 font-mono">TOTAL SALES</p>
              <p className="text-xs font-bold text-white">₹5.29L</p>
            </div>
          </div>
          
          <div className="space-y-1.5 text-xs font-mono">
            {pieData.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  {item.name}
                </span>
                <span className="text-white font-bold">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Row 3: Orders count + Top buyers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Orders Count Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Volume Order Dispatches (Count)</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_CHART_DATA}>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0d1426", borderColor: "rgba(255,255,255,0.08)", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crop Rank Cards */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4">Crop Sales Rankings</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-emerald-400 font-bold">#1 BEST SELLER</span>
                  <p className="text-xs font-bold text-white font-sans">Basmati Rice</p>
                </div>
                <span className="text-emerald-400 font-bold">₹3.50L Earned</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500">#2 RUNNER UP</span>
                  <p className="text-xs font-bold text-white font-sans">Alphonso Mango</p>
                </div>
                <span className="text-white font-bold">₹1.20L Earned</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-red-400">#6 LOWEST REVENUE</span>
                  <p className="text-xs font-bold text-white font-sans">Hybrid Tomatoes</p>
                </div>
                <span className="text-red-400 font-bold">₹0 Earned</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 text-center font-mono mt-4 pt-3 border-t border-white/5">
            Updated automatically at APMC Mandi settlement.
          </div>
        </div>
      </div>
    </div>
  );
}
