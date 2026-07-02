"use client";

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
      case "due": return "border-red-500/20 bg-red-500/5 text-red-400";
      case "scheduled": return "border-amber-500/20 bg-amber-500/5 text-amber-400";
      case "ok": return "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
      default: return "border-white/10 bg-white/5 text-slate-400";
    }
  };

  const getMoistureColor = (moisture: number) => {
    if (moisture < 40) return "bg-red-500";
    if (moisture < 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Droplets className="w-6 h-6 text-blue-400" />
            AI Irrigation Advisor
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Precision irrigation scheduling based on soil moisture sensors, weather data, and crop-specific requirements.
          </p>
        </div>
        <button
          onClick={handleGetAdvice}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-white text-xs font-mono rounded-xl transition self-start sm:self-auto shrink-0"
        >
          <Zap className={cn("w-3.5 h-3.5", loading && "animate-pulse")} />
          {loading ? "Analyzing..." : "Get AI Advisory"}
        </button>
      </div>

      {/* AI Advisory Panel */}
      {aiAdvice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5"
        >
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">AI Irrigation Advisory (Gemini)</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">{aiAdvice}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Farm Area", value: "24.5 Acres", icon: BarChart3, color: "emerald" },
          { label: "Water Used Today", value: "1,200 L", icon: Droplets, color: "blue" },
          { label: "Next Irrigation", value: "6:00 PM Today", icon: Clock, color: "amber" },
          { label: "Avg Soil Moisture", value: "58%", icon: Thermometer, color: "cyan" },
        ].map((s, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-2xl">
            <p className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</p>
            <p className="text-lg font-bold text-white mt-1">{s.value}</p>
            <div className={`w-8 h-8 rounded-xl bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center mt-2`}>
              <s.icon className={`w-4 h-4 text-${s.color}-400`} />
            </div>
          </div>
        ))}
      </div>

      {/* Irrigation Schedules */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-white/5 pb-2">
          Field-by-Field Irrigation Schedule
        </h2>
        <div className="space-y-4">
          {IRRIGATION_SCHEDULES.map((sched, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveSchedule(activeSchedule === idx ? null : idx)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all",
                getStatusColor(sched.status)
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border",
                      sched.status === "due" ? "text-red-400 border-red-500/30 bg-red-500/10"
                      : sched.status === "scheduled" ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                      : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    )}>
                      {sched.status === "due" ? "DUE NOW" : sched.status === "scheduled" ? "UPCOMING" : "OK"}
                    </span>
                    <h3 className="text-xs font-bold text-white">{sched.field}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">{sched.area} · {sched.method}</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <p className="text-slate-500 text-[10px]">NEXT IRRIGATION</p>
                    <p className="text-white font-bold">{sched.nextIrrigation}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">DURATION</p>
                    <p className="text-white font-bold">{sched.duration}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">WATER NEEDED</p>
                    <p className="text-white font-bold">{sched.waterRequired}</p>
                  </div>
                </div>
              </div>

              {/* Soil Moisture Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Soil Moisture Level</span>
                  <span className="text-white font-bold">{sched.soilMoisture}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${getMoistureColor(sched.soilMoisture)} transition-all`}
                    style={{ width: `${sched.soilMoisture}%` }}
                  />
                </div>
              </div>

              {/* Expanded weather note */}
              {activeSchedule === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-white/5"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300">{sched.weatherNote}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Crop-Specific Tips */}
      <div className="glass-panel p-5 rounded-2xl">
        <h2 className="text-sm font-bold text-white mb-4">AI Crop-Specific Irrigation Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AI_IRRIGATION_TIPS.map((tip, idx) => (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-xl border space-y-3",
                tip.priority === "urgent" ? "border-red-500/20 bg-red-500/5"
                : tip.priority === "high" ? "border-amber-500/20 bg-amber-500/5"
                : "border-blue-500/20 bg-blue-500/5"
              )}
            >
              <div className="flex items-center gap-2">
                <tip.icon className={cn(
                  "w-4 h-4",
                  tip.priority === "urgent" ? "text-red-400"
                  : tip.priority === "high" ? "text-amber-400"
                  : "text-blue-400"
                )} />
                <h4 className="text-xs font-bold text-white">{tip.crop}</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Water Conservation Score */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-blue-950/10 to-transparent border-white/5">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Water Conservation Score
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
            Your drip irrigation system is saving approximately 40% more water compared to traditional flood irrigation. 
            Excellent sustainability practices!
          </p>
        </div>
        <div className="flex gap-4 shrink-0 font-mono text-center">
          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl min-w-[100px]">
            <p className="text-[10px] text-slate-500">WATER SAVED</p>
            <p className="text-lg font-bold text-white mt-0.5">12,400 L</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl min-w-[100px]">
            <p className="text-[10px] text-emerald-400 font-bold">EFFICIENCY SCORE</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">87 / 100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
