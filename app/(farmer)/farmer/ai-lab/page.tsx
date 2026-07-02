"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sprout,
  TrendingUp,
  Award,
  Users,
  Compass,
  Briefcase,
  HelpCircle,
  FileText,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Copy,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sub-components for forms
import AIDiseaseDetector from "@/components/farmer/ai/AIDiseaseDetector";
import AIYieldPredictor from "@/components/farmer/ai/AIYieldPredictor";
import AIMarketAdvisor from "@/components/farmer/ai/AIMarketAdvisor";
import AIFertilizerAdvisor from "@/components/farmer/ai/AIFertilizerAdvisor";
import AIBusinessAdvisor from "@/components/farmer/ai/AIBusinessAdvisor";
import AIProductWriter from "@/components/farmer/ai/AIProductWriter";

const AI_TOOLS = [
  { id: "disease", title: "AI Crop Disease Detection", desc: "Upload leaf symptoms or describe pathology to diagnose crops.", icon: Brain, color: "text-purple-400 border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40" },
  { id: "yield", title: "AI Yield Prediction", desc: "Calculate expected harvest yield in metric tonnes per acre.", icon: Sprout, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40" },
  { id: "market", title: "AI Price & Demand", desc: "Realtime wholesale market price forecasts and buyer discovery.", icon: TrendingUp, color: "text-white border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40" },
  { id: "fertilizer", title: "AI Fertilizer Recommendation", desc: "NPK-aware soil health optimizer for maximizing crop sizes.", icon: Compass, color: "text-teal-400 border-teal-500/20 bg-teal-500/5 hover:border-teal-500/40" },
  { id: "business", title: "AI Business & Finance Advisor", desc: "Check Kisan Credit Card loan eligibility, insurance suggestions.", icon: Briefcase, color: "text-amber-400 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40" },
  { id: "writer", title: "AI Product Listing Assistant", desc: "Generate SEO-optimized eCommerce titles and descriptions.", icon: FileText, color: "text-white border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40" },
];

export default function AILabPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Diagnostics Laboratory
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Access state-of-the-art machine learning models to inspect soils, optimize irrigation, write catalogs, and maximize revenues.
          </p>
        </div>
        {selectedTool && (
          <button
            onClick={() => setSelectedTool(null)}
            className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl border border-white/10 shrink-0 font-mono transition"
          >
            ← Back to AI Hub
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedTool ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {AI_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={cn(
                    "glass-panel p-5 rounded-3xl cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all duration-300 border",
                    tool.color
                  )}
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white leading-tight">{tool.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{tool.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold pt-2">
                    <span>Launch Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-panel p-6 rounded-3xl"
          >
            {selectedTool === "disease" && <AIDiseaseDetector />}
            {selectedTool === "yield" && <AIYieldPredictor />}
            {selectedTool === "market" && <AIMarketAdvisor />}
            {selectedTool === "fertilizer" && <AIFertilizerAdvisor />}
            {selectedTool === "business" && <AIBusinessAdvisor />}
            {selectedTool === "writer" && <AIProductWriter />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
