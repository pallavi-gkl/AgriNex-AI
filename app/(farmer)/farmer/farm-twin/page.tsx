"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Globe,
  Leaf,
  Droplets,
  Sun,
  ShieldAlert,
  Calendar,
  DollarSign,
  Award,
  Sparkles,
  Zap,
  MapPin,
  RefreshCw,
  Compass,
} from "lucide-react";
import { DEMO_FARM_TWIN, DEMO_WEATHER } from "@/lib/demoData";
import { cn } from "@/lib/utils";

const COLORS = ["#10b981", "#f59e0b", "#34d399", "#475569"];

export default function FarmTwinPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "soil" | "crop" | "forecasts" | "insights">("overview");
  const [insights, setInsights] = useState(DEMO_FARM_TWIN.ai_insights);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Trigger insight reloading
  const handleReloadInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropTypes: ["Basmati Rice", "Turmeric"], location: "Karnal, Haryana" }),
      });
      const data = await res.json();
      if (data && data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Soil health radar data matching soil_health structure
  const soilRadarData = [
    { subject: "Nitrogen", A: DEMO_FARM_TWIN.soil_health.nitrogen, B: 85, fullMark: 100 },
    { subject: "Phosphorus", A: DEMO_FARM_TWIN.soil_health.phosphorus, B: 75, fullMark: 100 },
    { subject: "Potassium", A: DEMO_FARM_TWIN.soil_health.potassium, B: 80, fullMark: 100 },
    { subject: "Moisture", A: DEMO_FARM_TWIN.soil_health.moisture, B: 60, fullMark: 100 },
    { subject: "Org Matter", A: Math.round(DEMO_FARM_TWIN.soil_health.organic_matter * 25), B: 80, fullMark: 100 },
    { subject: "pH Profile", A: Math.round(DEMO_FARM_TWIN.soil_health.ph * 10), B: 70, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Flagship Header Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-cyan-950/20 via-[#030704] to-emerald-950/20 border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-bold">
                Real-Time AI Twin Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              <Globe className="w-8 h-8 text-cyan-400 animate-spin-slow" />
              Green Valley AI Farm Twin
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Synchronized modeling of 24.5 acres of land in Karnal, Haryana. Last sync: <span className="text-cyan-400 font-mono">1 min ago</span>.
            </p>
          </div>

          <button
            onClick={handleReloadInsights}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono transition"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loadingInsights && "animate-spin")} />
            Sync AI Engine
          </button>
        </div>
      </div>

      {/* Sticky Tab Navigator */}
      <div className="flex border-b border-white/5 gap-4 overflow-x-auto shrink-0 bg-black/40 p-2 rounded-2xl border border-white/5">
        {(["overview", "soil", "crop", "forecasts", "insights"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all shrink-0",
              activeTab === tab
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold"
                : "text-slate-400 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="glass-panel p-4 rounded-2xl text-center">
                <Globe className="w-5 h-5 text-cyan-400 mx-auto" />
                <p className="text-[10px] text-slate-500 font-mono mt-2">TOTAL AREA</p>
                <p className="text-base font-bold text-white mt-0.5">{DEMO_FARM_TWIN.total_area_acres} Acres</p>
              </div>
              <div className="glass-panel p-4 rounded-2xl text-center">
                <Leaf className="w-5 h-5 text-emerald-400 mx-auto" />
                <p className="text-[10px] text-slate-500 font-mono mt-2">ACTIVE VARIETIES</p>
                <p className="text-base font-bold text-white mt-0.5">3 Crops</p>
              </div>
              <div className="glass-panel p-4 rounded-2xl text-center">
                <Calendar className="w-5 h-5 text-amber-400 mx-auto" />
                <p className="text-[10px] text-slate-500 font-mono mt-2">NEXT HARVEST</p>
                <p className="text-base font-bold text-white mt-0.5">{DEMO_FARM_TWIN.harvest_prediction.days_to_harvest} Days</p>
              </div>
              <div className="glass-panel p-4 rounded-2xl text-center">
                <DollarSign className="w-5 h-5 text-emerald-400 mx-auto" />
                <p className="text-[10px] text-slate-500 font-mono mt-2">PROFIT FORECAST</p>
                <p className="text-base font-bold text-emerald-400 mt-0.5">₹1.42 Lakhs</p>
              </div>
              <div className="glass-panel p-4 rounded-2xl text-center col-span-2 lg:col-span-1">
                <Award className="w-5 h-5 text-teal-400 mx-auto" />
                <p className="text-[10px] text-slate-500 font-mono mt-2">SUSTAINABILITY</p>
                <p className="text-base font-bold text-teal-400 mt-0.5">{DEMO_FARM_TWIN.carbon_score.sustainability_score}/100</p>
              </div>
            </div>

            {/* Land allocation & risk map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Land allocation Donut */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white">Land Allocation</h3>
                <div className="h-48 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DEMO_FARM_TWIN.crop_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="acres"
                      >
                        {DEMO_FARM_TWIN.crop_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <p className="text-[10px] text-slate-500 font-mono">TOTAL AREA</p>
                    <p className="text-base font-bold text-white">24.5 Ac</p>
                  </div>
                </div>
                {/* Custom Legend */}
                <div className="space-y-1.5 text-xs font-mono">
                  {DEMO_FARM_TWIN.crop_distribution.map((c, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        {c.name}
                      </span>
                      <span className="text-white font-bold">{c.acres} Ac ({c.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disease risk zones map */}
              <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white">Pathological Risk Heatmap Zones</h3>
                <div className="space-y-2.5">
                  {DEMO_FARM_TWIN.disease_risk.zones.map((z, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-xl border bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-2",
                        z.risk === "Medium" ? "border-amber-500/20" : "border-white/5"
                      )}
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{z.name}</p>
                        {z.issue && <p className="text-[10px] text-amber-400 font-mono mt-0.5">{z.issue}</p>}
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", z.risk === "Medium" ? "bg-amber-500 w-2/5" : "bg-emerald-500 w-1/5")}
                          />
                        </div>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase", z.risk === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400")}>
                          {z.risk} Risk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Soil & Water */}
        {activeTab === "soil" && (
          <motion.div
            key="soil"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Soil health Radar */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white">NPK Soil Nutrients Matrix</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={soilRadarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                    <Radar name="Current Soil" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} />
                    <Radar name="Target Optimal" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Water usage efficiency */}
            <div className="glass-panel p-5 rounded-2xl space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Droplets className="w-5 h-5 text-blue-400" />
                Water Usage & Irrigation Pipeline
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">This Week Irrigation Intake</span>
                  <span className="text-white font-bold">{DEMO_FARM_TWIN.water_usage.this_week_liters.toLocaleString()} Liters</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full w-[85%]" />
                </div>
                <p className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                  Over-usage Warning: +13% above target of {DEMO_FARM_TWIN.water_usage.recommended_liters.toLocaleString()} Liters due to temperature surge.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-center pt-2">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <p className="text-[9px] text-slate-500">PIPELINE EFFICIENCY</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{DEMO_FARM_TWIN.water_usage.efficiency_score}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <p className="text-[9px] text-slate-500">SCHEDULER STATUS</p>
                  <p className="text-xs font-bold text-white mt-1.5 truncate">Drip scheduled 6PM</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Crop Health */}
        {activeTab === "crop" && (
          <motion.div
            key="crop"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Upcoming harvests countdown timeline */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white">Harvest Countdown Timeline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {DEMO_FARM_TWIN.harvest_prediction.upcoming.map((h, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white font-bold">{h.crop}</span>
                      <span className="text-amber-400 font-bold">{h.days} Days Left</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.max(5, 100 - (h.days * 2))}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">Est. Yield Output: {h.yield_kg.toLocaleString()} Kg</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual AI crop health scores */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white">AI Diagnostics Quality Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-white">Basmati Rice</h4>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-400"><span>Freshness Index</span><span className="text-emerald-400">94%</span></div>
                    <div className="flex justify-between text-slate-400"><span>Disease Risk Index</span><span className="text-red-400">8%</span></div>
                    <div className="flex justify-between text-slate-400"><span>Pest Index</span><span className="text-red-400">4%</span></div>
                  </div>
                </div>
                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-white">Ratnagiri Alphonso</h4>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-400"><span>Freshness Index</span><span className="text-emerald-400">97%</span></div>
                    <div className="flex justify-between text-slate-400"><span>Disease Risk Index</span><span className="text-emerald-400">0%</span></div>
                    <div className="flex justify-between text-slate-400"><span>Pest Index</span><span className="text-emerald-400">0%</span></div>
                  </div>
                </div>
                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-white">Organic Turmeric</h4>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-400"><span>Freshness Index</span><span className="text-emerald-400">88%</span></div>
                    <div className="flex justify-between text-slate-400"><span>Disease Risk Index</span><span className="text-red-400">12%</span></div>
                    <div className="flex justify-between text-slate-400"><span>Pest Index</span><span className="text-amber-400">6%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Forecasts */}
        {activeTab === "forecasts" && (
          <motion.div
            key="forecasts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Yield Forecast Bar Chart */}
              <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white">Maturity Yield Forecast (Next 6 Months)</h3>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEMO_FARM_TWIN.yield_forecast}>
                      <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#0d1426", borderColor: "rgba(255,255,255,0.08)" }}
                        itemStyle={{ fontSize: "11px" }}
                      />
                      <Bar dataKey="expected" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Profit forecast & Carbon footprints */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Profit Capital Estimations</h3>
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <p className="text-[9px] text-slate-500">THIS MONTH</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">₹{DEMO_FARM_TWIN.profit_forecast.this_month.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <p className="text-[9px] text-slate-500">NEXT MONTH</p>
                      <p className="text-sm font-bold text-white mt-1">₹{DEMO_FARM_TWIN.profit_forecast.next_month.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl col-span-2">
                      <p className="text-[9px] text-slate-500">ANNUALIZED PROJECTED</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">₹{DEMO_FARM_TWIN.profit_forecast.year.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <Leaf className="w-4 h-4 text-teal-400" />
                    Carbon Offset Score
                  </h4>
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Footprint:</span>
                    <span className="text-white font-bold">{DEMO_FARM_TWIN.carbon_score.footprint_kg_co2} Kg CO2</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Mandi Avg:</span>
                    <span className="text-slate-400">{DEMO_FARM_TWIN.carbon_score.industry_average} Kg CO2</span>
                  </div>
                  <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] rounded font-mono text-center">
                    Savings: -{(DEMO_FARM_TWIN.carbon_score.industry_average - DEMO_FARM_TWIN.carbon_score.footprint_kg_co2)} Kg CO2 offset!
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: AI Insights */}
        {activeTab === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4.5 h-4.5 text-cyan-400" />
                Live AI Farm Advisory Feed
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Last generated: 2 mins ago</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((ins, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-2xl border bg-white/[0.01] flex flex-col justify-between space-y-3 relative overflow-hidden",
                    ins.priority === "urgent"
                      ? "border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)] animate-pulse"
                      : ins.priority === "high"
                      ? "border-amber-500/20"
                      : "border-blue-500/20"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase",
                        ins.priority === "urgent"
                          ? "bg-red-500/10 text-red-400"
                          : ins.priority === "high"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                      )}
                    >
                      {ins.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono capitalize">{ins.type}</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">{ins.insight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
