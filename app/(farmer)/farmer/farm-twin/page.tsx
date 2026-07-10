"use client";
import { useTranslation } from "@/hooks/useTranslation";


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
  const { t } = useTranslation("farmer");
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
    <div className="space-y-8">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-emerald-50 border border-cyan-100 p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-600 shadow-lg shadow-cyan-500/30">
              <Globe className="w-8 h-8 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                  Real-Time AI Twin Active
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {t("greenValleyAiFarmTwin")}
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Synchronized modeling of 24.5 acres in Karnal, Haryana. Last sync: <span className="text-cyan-600 font-bold">{t("str_1MinAgo")}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={handleReloadInsights}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-600 hover:to-emerald-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-cyan-500/30"
          >
            <RefreshCw className={cn("w-4 h-4", loadingInsights && "animate-spin")} />
            Sync AI Engine
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-cyan-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-semibold text-slate-700">{t("aiPowered")}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">{t("digitalTwin")}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-teal-200 shadow-sm">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-slate-700">{t("gpsSynced")}</span>
          </div>
        </div>
      </div>

      {/* Premium Tab Navigator */}
      <div className="flex gap-2 overflow-x-auto shrink-0 bg-slate-50 p-2 rounded-2xl border border-slate-200">
        {(["overview", "soil", "crop", "forecasts", "insights"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0",
              activeTab === tab
                ? "bg-gradient-to-r from-cyan-500 to-emerald-600 text-white shadow-lg shadow-cyan-500/30"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
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
            className="space-y-8"
          >
            {/* KPI Cards Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-5 gap-6"
            >
              <div className="premium-card shadow-sm p-6 rounded-3xl text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-sky-100 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-cyan-600" />
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Total Area</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{DEMO_FARM_TWIN.total_area_acres} Acres</p>
              </div>
              <div className="premium-card shadow-sm p-6 rounded-3xl text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">{t("activeVarieties")}</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{t("str_3Crops")}</p>
              </div>
              <div className="premium-card shadow-sm p-6 rounded-3xl text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Next Harvest</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{DEMO_FARM_TWIN.harvest_prediction.days_to_harvest} {t("days")}</p>
              </div>
              <div className="premium-card shadow-sm p-6 rounded-3xl text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Profit Forecast</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">₹1.42 Lakhs</p>
              </div>
              <div className="premium-card shadow-sm p-6 rounded-3xl text-center col-span-2 lg:col-span-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Sustainability</p>
                <p className="text-xl font-bold text-teal-600 mt-1">{DEMO_FARM_TWIN.carbon_score.sustainability_score}/100</p>
              </div>
            </motion.div>

            {/* Land allocation & risk map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Land allocation Donut */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="premium-card shadow-sm p-6 rounded-3xl space-y-6"
              >
                <h3 className="text-base font-bold text-slate-800">Land Allocation</h3>
                <div className="h-56 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DEMO_FARM_TWIN.crop_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
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
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">TOTAL AREA</p>
                    <p className="text-2xl font-bold text-slate-800">{t("str_245Ac")}</p>
                  </div>
                </div>
                {/* Custom Legend */}
                <div className="space-y-2 text-sm font-mono">
                  {DEMO_FARM_TWIN.crop_distribution.map((c, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        {c.name}
                      </span>
                      <span className="text-slate-800 font-bold">{c.acres} Ac ({c.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Disease risk zones map */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 premium-card shadow-sm p-6 rounded-3xl space-y-6"
              >
                <h3 className="text-base font-bold text-slate-800">Pathological Risk Heatmap Zones</h3>
                <div className="space-y-4">
                  {DEMO_FARM_TWIN.disease_risk.zones.map((z, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "p-5 rounded-2xl border bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition",
                        z.risk === "Medium" ? "border-amber-200" : "border-slate-200"
                      )}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800">{z.name}</p>
                        {z.issue && <p className="text-xs text-amber-600 font-semibold mt-1">{z.issue}</p>}
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full shadow-sm", z.risk === "Medium" ? "bg-gradient-to-r from-amber-400 to-orange-400 w-2/5" : "bg-gradient-to-r from-emerald-400 to-teal-400 w-1/5")}
                          />
                        </div>
                        <span className={cn("text-xs px-3 py-1.5 rounded-lg font-bold uppercase", z.risk === "Medium" ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700" : "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700")}>
                          {z.risk} Risk
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Soil health Radar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="premium-card shadow-sm p-6 rounded-3xl space-y-6"
            >
              <h3 className="text-base font-bold text-slate-800">NPK Soil Nutrients Matrix</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={soilRadarData}>
                    <PolarGrid stroke="#f8fafc" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={12} />
                    <Radar name="Current Soil" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} />
                    <Radar name="Target Optimal" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Water usage efficiency */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="premium-card shadow-sm p-6 rounded-3xl space-y-6"
            >
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                Water Usage & Irrigation Pipeline
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">This Week Irrigation Intake</span>
                  <span className="text-slate-800 font-bold">{DEMO_FARM_TWIN.water_usage.this_week_liters.toLocaleString()} Liters</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full w-[85%] shadow-sm" />
                </div>
                <p className="text-xs text-red-600 font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Over-usage Warning: +13% above target of {DEMO_FARM_TWIN.water_usage.recommended_liters.toLocaleString()} Liters due to temperature surge.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-center pt-2">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4 rounded-2xl">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">PIPELINE EFFICIENCY</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">{DEMO_FARM_TWIN.water_usage.efficiency_score}%</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4 rounded-2xl">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">SCHEDULER STATUS</p>
                  <p className="text-sm font-bold text-slate-800 mt-2 truncate">{t("dripScheduled6pm")}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Tab 3: Crop Health */}
        {activeTab === "crop" && (
          <motion.div
            key="crop"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            {/* Upcoming harvests countdown timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="premium-card shadow-sm p-6 rounded-3xl space-y-6"
            >
              <h3 className="text-base font-bold text-slate-800">{t("harvestCountdownTimeline")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {DEMO_FARM_TWIN.harvest_prediction.upcoming.map((h, idx) => (
                  <motion.div
                    key={idx}
 initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-slate-50 to-white border-slate-200 p-5 rounded-2xl space-y-4"
                  >
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-slate-800 font-bold">{h.crop}</span>
                      <span className="text-amber-600 font-bold">{h.days} Days Left</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full shadow-sm"
                        style={{ width: `${Math.max(5, 100 - (h.days * 2))}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">Est. Yield Output: {h.yield_kg.toLocaleString()} Kg</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Individual AI crop health scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="premium-card shadow-sm p-6 rounded-3xl space-y-6"
            >
              <h3 className="text-base font-bold text-slate-800">{t("aiDiagnosticsQualityScores")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4 p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-slate-200"
                >
                  <h4 className="text-sm font-bold text-slate-800">{t("basmatiRiceTitle")}</h4>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-500"><span>{t("freshnessIndex")}</span><span className="text-emerald-600 font-bold">94%</span></div>
                    <div className="flex justify-between text-slate-500"><span>{t("diseaseRiskIndex")}</span><span className="text-rose-600 font-bold">8%</span></div>
                    <div className="flex justify-between text-slate-500"><span>Pest Index</span><span className="text-rose-600 font-bold">4%</span></div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4 p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-slate-200"
                >
                  <h4 className="text-sm font-bold text-slate-800">Ratnagiri Alphonso</h4>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-500"><span>{t("freshnessIndex")}</span><span className="text-emerald-600 font-bold">97%</span></div>
                    <div className="flex justify-between text-slate-500"><span>{t("diseaseRiskIndex")}</span><span className="text-emerald-600 font-bold">0%</span></div>
                    <div className="flex justify-between text-slate-500"><span>Pest Index</span><span className="text-emerald-600 font-bold">0%</span></div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4 p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-slate-200"
                >
                  <h4 className="text-sm font-bold text-slate-800">Organic Turmeric</h4>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-500"><span>{t("freshnessIndex")}</span><span className="text-emerald-600 font-bold">88%</span></div>
                    <div className="flex justify-between text-slate-500"><span>{t("diseaseRiskIndex")}</span><span className="text-rose-600 font-bold">12%</span></div>
                    <div className="flex justify-between text-slate-500"><span>Pest Index</span><span className="text-amber-600 font-bold">6%</span></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Tab 4: Forecasts */}
        {activeTab === "forecasts" && (
          <motion.div
            key="forecasts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Yield Forecast Bar Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 premium-card shadow-sm p-6 rounded-3xl space-y-6"
              >
                <h3 className="text-base font-bold text-slate-800">Maturity Yield Forecast (Next 6 Months)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEMO_FARM_TWIN.yield_forecast}>
                      <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#0d1426", borderColor: "#f8fafc" }}
                        itemStyle={{ fontSize: "12px" }}
                      />
                      <Bar dataKey="expected" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Profit forecast & Carbon footprints */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="premium-card shadow-sm p-6 rounded-3xl flex flex-col justify-between space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-4">Profit Capital Estimations</h3>
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("thisMonth")}</p>
                      <p className="text-lg font-bold text-emerald-600 mt-2">₹{DEMO_FARM_TWIN.profit_forecast.this_month.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">NEXT MONTH</p>
                      <p className="text-lg font-bold text-slate-800 mt-2">₹{DEMO_FARM_TWIN.profit_forecast.next_month.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl col-span-2">
                      <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{t("annualizedProjected")}</p>
                      <p className="text-lg font-bold text-emerald-600 mt-2">₹{DEMO_FARM_TWIN.profit_forecast.year.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-teal-600" />
                    </div>
                    {t("carbonOffsetScore")}
                  </h4>
                  <div className="flex justify-between text-sm font-mono text-slate-500">
                    <span>{t("footprint")}</span>
                    <span className="text-slate-800 font-bold">{DEMO_FARM_TWIN.carbon_score.footprint_kg_co2} Kg CO2</span>
                  </div>
                  <div className="flex justify-between text-sm font-mono text-slate-500">
                    <span>Mandi Avg:</span>
                    <span className="text-slate-400">{DEMO_FARM_TWIN.carbon_score.industry_average} Kg CO2</span>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 text-teal-700 text-xs rounded-xl font-mono text-center font-bold">
                    Savings: -{(DEMO_FARM_TWIN.carbon_score.industry_average - DEMO_FARM_TWIN.carbon_score.footprint_kg_co2)} Kg CO2 offset!
                  </div>
                </div>
              </motion.div>
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
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-emerald-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-600" />
                </div>
                Live AI Farm Advisory Feed
              </h3>
              <span className="text-xs text-slate-500 font-mono">Last generated: 2 mins ago</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((ins, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-6 rounded-3xl border bg-gradient-to-br from-slate-50 to-white flex flex-col justify-between space-y-4 relative overflow-hidden hover:shadow-md transition",
                    ins.priority === "urgent"
                      ? "border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)] animate-pulse"
                      : ins.priority === "high"
                      ? "border-amber-200"
                      : "border-blue-200"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-lg font-bold uppercase",
                        ins.priority === "urgent"
                          ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700"
                          : ins.priority === "high"
                          ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
                          : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
                      )}
                    >
                      {ins.priority} Priority
                    </span>
                    <span className="text-xs text-slate-500 font-mono capitalize">{ins.type}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{ins.insight}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}