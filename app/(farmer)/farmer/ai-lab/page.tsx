"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sprout,
  TrendingUp,
  Compass,
  Briefcase,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Globe,
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
  { 
    id: "disease", 
    title: "AI Disease Detection", 
    desc: "Upload crop images for instant AI-powered disease diagnosis and treatment recommendations.", 
    icon: ShieldCheck, 
    accent: "from-purple-500 to-violet-600",
    iconBg: "bg-gradient-to-br from-purple-50 to-violet-100", 
    iconColor: "text-purple-600", 
    border: "border-purple-200", 
    hover: "hover:border-purple-400 hover:shadow-purple-500/20",
    badge: "Popular"
  },
  { 
    id: "yield", 
    title: "AI Yield Prediction", 
    desc: "Predict harvest yields using advanced ML models analyzing weather, soil, and historical data.", 
    icon: Sprout, 
    accent: "from-emerald-500 to-teal-600",
    iconBg: "bg-gradient-to-br from-emerald-50 to-teal-100", 
    iconColor: "text-emerald-600", 
    border: "border-emerald-200", 
    hover: "hover:border-emerald-400 hover:shadow-emerald-500/20",
    badge: "New"
  },
  { 
    id: "market", 
    title: "AI Market Intelligence", 
    desc: "Real-time price forecasting, demand analysis, and optimal selling time recommendations.", 
    icon: TrendingUp, 
    accent: "from-blue-500 to-cyan-600",
    iconBg: "bg-gradient-to-br from-blue-50 to-cyan-100", 
    iconColor: "text-blue-600", 
    border: "border-blue-200", 
    hover: "hover:border-blue-400 hover:shadow-blue-500/20",
  },
  { 
    id: "fertilizer", 
    title: "AI Fertilizer Advisor", 
    desc: "Personalized NPK recommendations based on soil analysis and crop requirements.", 
    icon: Compass, 
    accent: "from-teal-500 to-emerald-600",
    iconBg: "bg-gradient-to-br from-teal-50 to-emerald-100", 
    iconColor: "text-teal-600", 
    border: "border-teal-200", 
    hover: "hover:border-teal-400 hover:shadow-teal-500/20",
  },
  { 
    id: "business", 
    title: "AI Business Advisor", 
    desc: "Financial planning, loan eligibility, insurance suggestions, and profit optimization.", 
    icon: Briefcase, 
    accent: "from-amber-500 to-orange-600",
    iconBg: "bg-gradient-to-br from-amber-50 to-orange-100", 
    iconColor: "text-amber-600", 
    border: "border-amber-200", 
    hover: "hover:border-amber-400 hover:shadow-amber-500/20",
  },
  { 
    id: "writer", 
    title: "AI Listing Generator", 
    desc: "Generate SEO-optimized product titles and descriptions for marketplace listings.", 
    icon: FileText, 
    accent: "from-indigo-500 to-purple-600",
    iconBg: "bg-gradient-to-br from-indigo-50 to-purple-100", 
    iconColor: "text-indigo-600", 
    border: "border-indigo-200", 
    hover: "hover:border-indigo-400 hover:shadow-indigo-500/20",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  }),
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

export default function AILabPage() {
  const { t } = useTranslation("farmer");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const selectedToolData = AI_TOOLS.find(t => t.id === selectedTool);

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-white to-blue-50 border border-purple-100 p-8">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {t("aiDiagnosticsLab")}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Powered by Gemini AI • Advanced Machine Learning Models
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-purple-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-slate-700">{t("sixModels")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-blue-200 shadow-sm">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">{t("realTimeAnalysis")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">{t("instantResults")}</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedTool ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {AI_TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  onClick={() => setSelectedTool(tool.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl p-6 cursor-pointer",
                    "bg-gradient-to-br from-white via-white to-slate-50",
                    "border border-slate-200 shadow-sm",
                    "hover:shadow-xl hover:border-purple-300 transition-all duration-300"
                  )}
                >
                  {/* Gradient overlay on hover */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    tool.accent,
                    "bg-opacity-5"
                  )} />
                  
                  {/* Badge */}
                  {tool.badge && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md">
                        {tool.badge}
                      </span>
                    </div>
                  )}

                  <div className="relative z-10 space-y-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                      tool.iconBg,
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <Icon className={cn("w-7 h-7", tool.iconColor)} />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className={cn(
                      "flex items-center gap-2 text-sm font-bold pt-3",
                      tool.iconColor
                    )}>
                      <span>Launch</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Animated border gradient */}
                  <div className={cn(
                    "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    "bg-gradient-to-br",
                    tool.accent,
                    "bg-opacity-10 blur-xl"
                  )} />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Tool Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedTool(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-sm"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                {t("backToAiHub")}
              </button>
              {selectedToolData && (
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    selectedToolData.iconBg
                  )}>
                    <selectedToolData.icon className={cn("w-5 h-5", selectedToolData.iconColor)} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedToolData.title}</h2>
                    <p className="text-xs text-slate-500">{t("aiPoweredAnalysis")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tool Content */}
            <div className="premium-card rounded-3xl p-6 shadow-sm border border-slate-200">
              {selectedTool === "disease" && <AIDiseaseDetector />}
              {selectedTool === "yield" && <AIYieldPredictor />}
              {selectedTool === "market" && <AIMarketAdvisor />}
              {selectedTool === "fertilizer" && <AIFertilizerAdvisor />}
              {selectedTool === "business" && <AIBusinessAdvisor />}
              {selectedTool === "writer" && <AIProductWriter />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}