"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Zap,
  Leaf,
  RefreshCw,
  CheckCircle,
  Clock,
  CloudSun,
  Thermometer,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const IRRIGATION_SCHEDULES = [
  {
    field: "North Field — Basmati Rice",
    area: "8.5 acres",
    method: "Drip Irrigation",
    nextIrrigation: "Today 6:00 PM",
    duration: "45 minutes",
    waterRequired: "320 liters",
    soilMoisture: 42,
    status: "due",
    weatherNote: "No rain expected in 48h — irrigate as scheduled.",
  },
  {
    field: "South Field — Turmeric",
    area: "6.0 acres",
    method: "Sprinkler",
    nextIrrigation: "Tomorrow 6:30 AM",
    duration: "30 minutes",
    waterRequired: "180 liters",
    soilMoisture: 58,
    status: "scheduled",
    weatherNote: "Adequate moisture. Can delay 12 hours safely.",
  },
  {
    field: "East Orchard — Alphonso Mango",
    area: "10.0 acres",
    method: "Flood Irrigation",
    nextIrrigation: "Jul 5, 2026",
    duration: "2 hours",
    waterRequired: "800 liters",
    soilMoisture: 74,
    status: "ok",
    weatherNote: "Heavy rain expected Thursday — skip this cycle.",
  },
];

const AI_IRRIGATION_TIPS = [
  {
    crop: "Basmati Rice",
    tip: "Rice is at tillering stage. Maintain 2-5 cm standing water in the field for optimal development. Avoid water stress during this critical phase.",
    icon: Leaf,
    priority: "urgent",
  },
  {
    crop: "Turmeric",
    tip: "Turmeric requires consistent soil moisture at 60-70% field capacity. Use ridge-and-furrow method to prevent waterlogging which causes rhizome rot.",
    icon: Droplets,
    priority: "high",
  },
  {
    crop: "Alphonso Mango",
    tip: "Post-flowering stage: Reduce irrigation frequency. Excessive moisture now causes fruit splitting. One deep irrigation per week is sufficient.",
    icon: CloudSun,
    priority: "medium",
  },
];

export default function AIIrrigationPage() {
  const { t } = useTranslation("farmer");
  const [activeSchedule, setActiveSchedule] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/fertilizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropType: "Basmati Rice",
          soilType: "Clay Loam",
          season: "Kharif",
          topic: "irrigation",
        }),
      });
      const data = await res.json();
      setAiAdvice(data.recommendation || data.summary || "Maintain consistent soil moisture at field capacity. Monitor soil tension regularly.");
    } catch {
      setAiAdvice("For Kharif season Basmati Rice: Maintain 2-5cm standing water during tillering (21-45 days after transplanting). Drain fields 10 days before harvest to facilitate combine harvesting and improve grain quality.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "due": return "border-rose-200 bg-rose-50 text-rose-700";
      case "scheduled": return "border-amber-200 bg-amber-50 text-amber-700";
      case "ok": return "border-emerald-200 bg-emerald-50 text-emerald-700";
      default: return "border-slate-200 bg-slate-50 text-slate-400";
    }
  };

  const getMoistureColor = (moisture: number) => {
  const { t } = useTranslation("farmer");
    if (moisture < 40) return "bg-red-500";
    if (moisture < 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-cyan-50 border border-blue-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {t("aiIrrigationAdvisor")}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Precision irrigation scheduling based on soil moisture sensors, weather data, and crop requirements
                </p>
              </div>
            </div>
            <button
              onClick={handleGetAdvice}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-500/30"
            >
              <Zap className={cn("w-4 h-4", loading && "animate-pulse")} />
              {loading ? "Analyzing..." : "Get AI Advisory"}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-blue-200 shadow-sm">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">{t("aiPowered")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-cyan-200 shadow-sm">
              <Thermometer className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-semibold text-slate-700">Soil Sensors</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <CloudSun className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">Weather Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Advisory Panel */}
      {aiAdvice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card shadow-sm p-6 rounded-3xl border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-800">{t("aiIrrigationAdvisory")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">{aiAdvice}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: "Total Farm Area", value: "24.5 Acres", icon: BarChart3, color: "emerald" },
          { label: "Water Used Today", value: "1,200 L", icon: Droplets, color: "blue" },
          { label: "Next Irrigation", value: "6:00 PM Today", icon: Clock, color: "amber" },
          { label: "Avg Soil Moisture", value: "58%", icon: Thermometer, color: "cyan" },
        ].map((s, idx) => (
          <div key={idx} className="premium-card shadow-sm p-6 rounded-3xl">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{s.value}</p>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center mt-3">
              <s.icon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Irrigation Schedules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="premium-card shadow-sm p-6 rounded-3xl space-y-6"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-slate-800">{t("fieldByFieldIrrigationSchedule")}</h2>
        </div>
        <div className="space-y-5">
          {IRRIGATION_SCHEDULES.map((sched, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveSchedule(activeSchedule === idx ? null : idx)}
              className={cn(
                "p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
                getStatusColor(sched.status)
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-xs uppercase font-bold px-3 py-1 rounded-lg border",
                      sched.status === "due" ? "text-red-700 border-red-500/30 bg-gradient-to-r from-red-100 to-rose-100"
                      : sched.status === "scheduled" ? "text-amber-700 border-amber-500/30 bg-gradient-to-r from-amber-100 to-orange-100"
                      : "text-emerald-700 border-emerald-500/30 bg-gradient-to-r from-emerald-100 to-teal-100"
                    )}>
                      {sched.status === "due" ? "DUE NOW" : sched.status === "scheduled" ? "UPCOMING" : "OK"}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">{sched.field}</h3>
                  </div>
                  <p className="text-sm text-slate-500 font-semibold">{sched.area} · {sched.method}</p>
                </div>
                <div className="flex items-center gap-6 text-sm font-mono">
                  <div className="bg-white/50 px-4 py-2 rounded-xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{t("nextIrrigation")}</p>
                    <p className="text-slate-800 font-bold mt-0.5">{sched.nextIrrigation}</p>
                  </div>
                  <div className="bg-white/50 px-4 py-2 rounded-xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{t("duration")}</p>
                    <p className="text-slate-800 font-bold mt-0.5">{sched.duration}</p>
                  </div>
                  <div className="bg-white/50 px-4 py-2 rounded-xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">WATER NEEDED</p>
                    <p className="text-slate-800 font-bold mt-0.5">{sched.waterRequired}</p>
                  </div>
                </div>
              </div>

              {/* Soil Moisture Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Soil Moisture Level</span>
                  <span className="text-slate-800 font-bold">{sched.soilMoisture}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getMoistureColor(sched.soilMoisture)} transition-all shadow-sm`}
                    style={{ width: `${sched.soilMoisture}%` }}
                  />
                </div>
              </div>

              {/* Expanded weather note */}
              {activeSchedule === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-slate-100"
                >
                  <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{sched.weatherNote}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Crop-Specific Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="premium-card shadow-sm p-6 rounded-3xl"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-base font-bold text-slate-800">{t("aiCropSpecificIrrigationInsigh")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {AI_IRRIGATION_TIPS.map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-5 rounded-2xl border space-y-4",
                tip.priority === "urgent" ? "border-red-200 bg-gradient-to-r from-red-50 to-rose-50"
                : tip.priority === "high" ? "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50"
                : "border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <tip.icon className={cn(
                    "w-5 h-5",
                    tip.priority === "urgent" ? "text-rose-600"
                    : tip.priority === "high" ? "text-amber-600"
                    : "text-blue-600"
                  )} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">{tip.crop}</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{tip.tip}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Water Conservation Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="premium-card shadow-sm p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-blue-950/5 to-cyan-950/5 border-slate-100"
      >
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            Water Conservation Score
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
            Your drip irrigation system is saving approximately 40% more water compared to traditional flood irrigation. 
            Excellent sustainability practices!
          </p>
        </div>
        <div className="flex gap-5 shrink-0 font-mono text-center">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 px-6 py-4 rounded-2xl min-w-[120px]">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">WATER SAVED</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{t("str_12400L")}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 px-6 py-4 rounded-2xl min-w-[120px]">
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{t("efficiencyScore")}</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">87 / 100</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}