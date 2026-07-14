"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview AI Diagnostics Laboratory — /farmer/ai-lab
 * Premium redesign: glassmorphic hero, status cards, premium model grid,
 * animated history panel. All 6 AI models, Gemini integration, history
 * tracking fully preserved. Only UI is changed.
 */

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sprout,
  TrendingUp,
  Compass,
  Briefcase,
  FileText,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  CheckCircle,
  Clock,
  Activity,
  BarChart2,
  Leaf,
  Star,
  FlaskConical,
  Search,
  X,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  Info,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

import AIDiseaseDetector    from "@/components/farmer/ai/AIDiseaseDetector";
import AIYieldPredictor     from "@/components/farmer/ai/AIYieldPredictor";
import AIMarketAdvisor      from "@/components/farmer/ai/AIMarketAdvisor";
import AIFertilizerAdvisor  from "@/components/farmer/ai/AIFertilizerAdvisor";
import AIBusinessAdvisor    from "@/components/farmer/ai/AIBusinessAdvisor";
import AIProductWriter      from "@/components/farmer/ai/AIProductWriter";

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface HistoryEntry {
  id: string;
  toolId: string;
  toolTitle: string;
  cropName: string;
  data: any;
  timestamp: Date;
  confidence?: number;
  severity?: string;
  summary?: string;
}

/* ── AI Tool definitions (all 6 preserved) ────────────────────────────────── */
const AI_TOOLS = [
  {
    id: "disease",
    title: "AI Disease Detection",
    desc: "Upload crop images for instant AI-powered disease diagnosis and treatment recommendations.",
    icon: ShieldCheck,
    badge: "Popular",
    category: "Diagnostics",
    accuracy: "97%",
    eta: "~15 sec",
    inputType: "Crop Image",
    accentHex: "#7C3AED",
    accentBg: "#F5F3FF",
    accentBorder: "#DDD6FE",
    accentLight: "#EDE9FE",
    emoji: "🧠",
  },
  {
    id: "yield",
    title: "AI Yield Prediction",
    desc: "Predict harvest yields using advanced ML models analyzing weather, soil, and historical data.",
    icon: Sprout,
    badge: "New",
    category: "Prediction",
    accuracy: "94%",
    eta: "~10 sec",
    inputType: "Farm Details",
    accentHex: "#059669",
    accentBg: "#ECFDF5",
    accentBorder: "#6EE7B7",
    accentLight: "#D1FAE5",
    emoji: "🌾",
  },
  {
    id: "market",
    title: "AI Market Intelligence",
    desc: "Real-time price forecasting, demand analysis, and optimal selling time recommendations.",
    icon: TrendingUp,
    badge: undefined,
    category: "Market",
    accuracy: "92%",
    eta: "~8 sec",
    inputType: "Crop & Region",
    accentHex: "#2563EB",
    accentBg: "#EFF6FF",
    accentBorder: "#BFDBFE",
    accentLight: "#DBEAFE",
    emoji: "📈",
  },
  {
    id: "fertilizer",
    title: "AI Fertilizer Advisor",
    desc: "Personalized NPK recommendations based on soil analysis and crop requirements.",
    icon: Compass,
    badge: undefined,
    category: "Soil",
    accuracy: "96%",
    eta: "~12 sec",
    inputType: "Soil Data",
    accentHex: "#0D9488",
    accentBg: "#F0FDFA",
    accentBorder: "#99F6E4",
    accentLight: "#CCFBF1",
    emoji: "🌱",
  },
  {
    id: "business",
    title: "AI Business Advisor",
    desc: "Financial planning, loan eligibility, insurance suggestions, and profit optimization.",
    icon: Briefcase,
    badge: undefined,
    category: "Finance",
    accuracy: "91%",
    eta: "~18 sec",
    inputType: "Farm Financials",
    accentHex: "#D97706",
    accentBg: "#FFFBEB",
    accentBorder: "#FDE68A",
    accentLight: "#FEF3C7",
    emoji: "💼",
  },
  {
    id: "writer",
    title: "AI Listing Generator",
    desc: "Generate SEO-optimized product titles and descriptions for marketplace listings.",
    icon: FileText,
    badge: undefined,
    category: "Content",
    accuracy: "98%",
    eta: "~6 sec",
    inputType: "Crop Details",
    accentHex: "#4F46E5",
    accentBg: "#EEF2FF",
    accentBorder: "#C7D2FE",
    accentLight: "#E0E7FF",
    emoji: "✍️",
  },
];

const HOW_IT_WORKS = [
  { icon: Leaf,     label: "Upload Crop Data",    sub: "Images, soil reports, or farm metrics",          color: "#22C55E", bg: "#DCFCE7" },
  { icon: Brain,    label: "Gemini AI Analysis",  sub: "Advanced neural model processes your data",      color: "#7C3AED", bg: "#EDE9FE" },
  { icon: BarChart2,label: "Smart Report",        sub: "Structured confidence-scored output",            color: "#2563EB", bg: "#DBEAFE" },
  { icon: Star,     label: "Actionable Insights", sub: "Take decisions backed by AI science",           color: "#D97706", bg: "#FEF3C7" },
];

const cardVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};

function severityStyle(sev?: string) {
  if (!sev) return { color: "#64748B", bg: "#F9FAFB", border: "#E5E7EB" };
  const s = sev.toLowerCase();
  if (s === "low")    return { color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" };
  if (s === "medium") return { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
  return { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
}

/* ── Premium Report View (for history) ────────────────────────────────────── */
function PremiumReportView({ entry, onClose, onNewAnalysis }: {
  entry: HistoryEntry;
  onClose: () => void;
  onNewAnalysis: () => void;
}) {
  const tool = AI_TOOLS.find((t) => t.id === entry.toolId);
  const d = entry.data;
  const sevStyle = severityStyle(d?.severity);
  const timeLabel = entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateLabel = entry.timestamp.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(entry.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AgriNex_AI_Report_${entry.toolId}_${entry.cropName}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "Inter, sans-serif" }}
    >
      {/* Action bar */}
      <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <button
          onClick={onClose}
          style={{ height: "38px", padding: "0 16px", borderRadius: "10px", border: "1.5px solid #E2E8F0", background: "#ffffff", color: "#374151", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.color = "#7C3AED"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#374151"; }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} /> Back to History
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleDownload}
            style={{ height: "38px", padding: "0 14px", borderRadius: "10px", border: "1.5px solid #DCFCE7", background: "#ffffff", color: "#16A34A", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F0FDF4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
          >
            <Download style={{ width: "13px", height: "13px" }} /> Download JSON
          </button>
          <button
            onClick={onNewAnalysis}
            style={{ height: "38px", padding: "0 14px", borderRadius: "10px", border: "none", background: tool ? `linear-gradient(135deg, ${tool.accentHex}, ${tool.accentHex}CC)` : "#22C55E", color: "#ffffff", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", boxShadow: `0 4px 12px ${tool?.accentHex ?? "#22C55E"}30` }}
          >
            <RefreshCw style={{ width: "13px", height: "13px" }} /> New Analysis
          </button>
        </div>
      </div>

      {/* Report hero */}
      <div style={{ background: tool ? `linear-gradient(135deg, ${tool.accentBg} 0%, #ffffff 60%)` : "#F9FAFB", border: `1.5px solid ${tool?.accentBorder ?? "#E2E8F0"}`, borderRadius: "20px", padding: "28px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {tool && (
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: tool.accentBg, border: `1.5px solid ${tool.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <tool.icon style={{ width: "26px", height: "26px", color: tool.accentHex }} />
              </div>
            )}
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: tool?.accentHex ?? "#22C55E" }}>{tool?.category ?? "AI Report"}</span>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1F2937", margin: "4px 0 2px", letterSpacing: "-0.3px" }}>🤖 {entry.toolTitle}</h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Crop: <strong>{entry.cropName}</strong> &nbsp;·&nbsp; {dateLabel} at {timeLabel}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {d?.confidence !== undefined && (
              <div style={{ textAlign: "center", background: "#ffffff", border: "1.5px solid #DCFCE7", borderRadius: "12px", padding: "10px 18px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Confidence</p>
                <p style={{ fontSize: "22px", fontWeight: 900, color: "#22C55E", margin: 0, fontFamily: "monospace" }}>{d.confidence}%</p>
              </div>
            )}
            {d?.severity && (
              <div style={{ textAlign: "center", background: sevStyle.bg, border: `1.5px solid ${sevStyle.border}`, borderRadius: "12px", padding: "10px 18px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Severity</p>
                <p style={{ fontSize: "16px", fontWeight: 800, color: sevStyle.color, margin: 0 }}>{d.severity}</p>
              </div>
            )}
            {d?.estimated_crop_loss_percent !== undefined && (
              <div style={{ textAlign: "center", background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "12px", padding: "10px 18px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Est. Crop Loss</p>
                <p style={{ fontSize: "22px", fontWeight: 900, color: "#DC2626", margin: 0, fontFamily: "monospace" }}>{d.estimated_crop_loss_percent}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disease name */}
      {d?.disease_name && (
        <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#FEF2F2", border: "1.5px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertCircle style={{ width: "22px", height: "22px", color: "#DC2626" }} />
          </div>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Disease Identified</p>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1F2937", margin: "4px 0 0", letterSpacing: "-0.3px" }}>{d.disease_name}</h3>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, padding: "5px 14px", borderRadius: "99px", background: sevStyle.bg, color: sevStyle.color, border: `1.5px solid ${sevStyle.border}` }}>
              {d.severity} Severity
            </span>
          </div>
        </div>
      )}

      {/* Symptoms */}
      {d?.symptoms && Array.isArray(d.symptoms) && d.symptoms.length > 0 && (
        <div style={{ background: "#ffffff", border: "1.5px solid #DDD6FE", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#7C3AED", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#EDE9FE", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Activity style={{ width: "13px", height: "13px", color: "#7C3AED" }} />
            </span>
            Identified Pathology Symptoms
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {d.symptoms.map((s: string, idx: number) => (
              <span key={idx} style={{ fontSize: "12px", fontWeight: 700, background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE", padding: "5px 12px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "5px" }}>
                <CheckCircle style={{ width: "11px", height: "11px" }} /> {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Treatment */}
      {d?.treatment && Array.isArray(d.treatment) && d.treatment.length > 0 && (
        <div style={{ background: "#ffffff", border: "1.5px solid #DCFCE7", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#059669", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#D1FAE5", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle style={{ width: "13px", height: "13px", color: "#059669" }} />
            </span>
            Recommended Treatment Plan
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {d.treatment.map((t: string, idx: number) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#F0FDF4", border: "1.5px solid #DCFCE7", borderRadius: "12px", padding: "12px 16px" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "8px", background: "linear-gradient(135deg, #22C55E, #16A34A)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#ffffff" }}>{idx + 1}</span>
                <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: 1.5 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organic treatment */}
      {d?.organic_treatment && (
        <div style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)", border: "1.5px solid #86EFAC", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(34,197,94,0.06)" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#15803D", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles style={{ width: "16px", height: "16px" }} /> 🌿 Organic Cultivation Alternative
          </h4>
          <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: 1.65 }}>{d.organic_treatment}</p>
        </div>
      )}

      {/* Generic key/value fields */}
      {d && (() => {
        const SKIP = ["symptoms","treatment","organic_treatment","disease_name","severity","confidence","estimated_crop_loss_percent","monthly_breakdown","key_factors","risks"];
        const entries = Object.entries(d).filter(([k]) => !SKIP.includes(k) && typeof d[k] !== "object");
        if (entries.length === 0) return null;
        return (
          <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#2563EB", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#DBEAFE", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Info style={{ width: "13px", height: "13px", color: "#2563EB" }} />
              </span>
              Analysis Summary
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              {entries.map(([key, val]) => (
                <div key={key} style={{ background: "#F9FAFB", border: "1.5px solid #E2E8F0", borderRadius: "10px", padding: "12px 14px" }}>
                  <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{key.replace(/_/g, " ")}</p>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", margin: 0 }}>{String(val)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Key factors */}
      {d?.key_factors && Array.isArray(d.key_factors) && (
        <div style={{ background: "#ffffff", border: "1.5px solid #FDE68A", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#D97706", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#FEF3C7", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 style={{ width: "13px", height: "13px", color: "#D97706" }} />
            </span>
            Key Influence Factors
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {d.key_factors.map((f: string, idx: number) => (
              <div key={idx} style={{ display: "flex", gap: "8px", background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#374151" }}>
                <span style={{ color: "#D97706", fontWeight: 800 }}>•</span> {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ── History Card ─────────────────────────────────────────────────────────── */
function HistoryCard({ entry, onViewReport }: { entry: HistoryEntry; onViewReport: (e: HistoryEntry) => void }) {
  const tool = AI_TOOLS.find((t) => t.id === entry.toolId);
  const sevStyle = severityStyle(entry.severity);
  const timeLabel = entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isToday = new Date().toDateString() === entry.timestamp.toDateString();
  const dateLabel = isToday ? `Today · ${timeLabel}` : `${entry.timestamp.toLocaleDateString("en-IN")} · ${timeLabel}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
      style={{ background: "#ffffff", border: `1.5px solid ${tool?.accentBorder ?? "#E2E8F0"}`, borderRadius: "16px", padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "12px", transition: "box-shadow 0.2s ease" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {tool && (
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: tool.accentBg, border: `1.5px solid ${tool.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <tool.icon style={{ width: "18px", height: "18px", color: tool.accentHex }} />
            </div>
          )}
          <div>
            <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{entry.toolTitle}</p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>Crop: {entry.cropName}</p>
          </div>
        </div>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "#22C55E", background: "#DCFCE7", border: "1px solid #BBF7D0", padding: "3px 10px", borderRadius: "99px", flexShrink: 0 }}>Completed</span>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {entry.confidence !== undefined && (
          <div style={{ background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: "#16A34A" }}>
            Confidence: {entry.confidence}%
          </div>
        )}
        {entry.severity && (
          <div style={{ background: sevStyle.bg, border: `1px solid ${sevStyle.border}`, borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: sevStyle.color }}>
            Severity: {entry.severity}
          </div>
        )}
        {entry.summary && (
          <div style={{ fontSize: "11px", color: "#64748B", fontStyle: "italic", alignSelf: "center" }}>{entry.summary}</div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F3F4F6", paddingTop: "10px" }}>
        <span style={{ fontSize: "11px", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock style={{ width: "12px", height: "12px" }} /> {dateLabel}
        </span>
        <button
          onClick={() => onViewReport(entry)}
          style={{ height: "30px", padding: "0 14px", borderRadius: "8px", border: "none", background: tool ? `linear-gradient(135deg, ${tool.accentHex}, ${tool.accentHex}CC)` : "#22C55E", color: "#ffffff", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", transition: "opacity 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          View Report <ChevronRightIcon style={{ width: "12px", height: "12px" }} />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Main Page Component ──────────────────────────────────────────────────── */
export default function AILabPage() {
  const { t } = useTranslation("farmer");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [viewingReport, setViewingReport] = useState<HistoryEntry | null>(null);

  const selectedToolData = AI_TOOLS.find((tool) => tool.id === selectedTool);
  const categories = ["All", ...Array.from(new Set(AI_TOOLS.map((t) => t.category)))];

  const filteredTools = useMemo(() => {
    return AI_TOOLS.filter((tool) => {
      const matchesSearch =
        tool.title.toLowerCase().includes(search.toLowerCase()) ||
        tool.desc.toLowerCase().includes(search.toLowerCase()) ||
        tool.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || tool.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const handleAnalysisComplete = useCallback((toolId: string, toolTitle: string) => {
    return (data: any, cropName: string) => {
      const entry: HistoryEntry = {
        id: `${toolId}_${Date.now()}`,
        toolId,
        toolTitle,
        cropName,
        data,
        timestamp: new Date(),
        confidence: data?.confidence,
        severity: data?.severity,
        summary: data?.disease_name || data?.recommendation_summary || data?.profit_after_expenses
          ? `${data?.disease_name ?? ""} ${data?.recommendation_summary ?? ""} ${data?.profit_after_expenses ? `₹${data.profit_after_expenses}` : ""}`.trim().slice(0, 60)
          : undefined,
      };
      setHistory((prev) => [entry, ...prev]);
    };
  }, []);

  /* ── STATUS CARD DATA ── */
  const statusCards = [
    {
      emoji: "🧠",
      value: "6",
      title: "AI Models Available",
      desc: "Ready for diagnosis",
      color: "#7C3AED",
      bg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
      border: "#DDD6FE",
      iconBg: "linear-gradient(135deg, #7C3AED, #6366F1)",
    },
    {
      emoji: "⚡",
      value: "Live",
      title: "Real-time Processing",
      desc: "Gemini AI Connected",
      color: "#2563EB",
      bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      border: "#BFDBFE",
      iconBg: "linear-gradient(135deg, #2563EB, #3B82F6)",
    },
    {
      emoji: "📊",
      value: String(history.length),
      title: "Analysis History",
      desc: "Today's reports",
      color: "#16A34A",
      bg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
      border: "#86EFAC",
      iconBg: "linear-gradient(135deg, #16A34A, #22C55E)",
    },
    {
      emoji: "🎯",
      value: "97%",
      title: "Top Accuracy",
      desc: "Disease Detection",
      color: "#D97706",
      bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
      border: "#FDE68A",
      iconBg: "linear-gradient(135deg, #D97706, #F59E0B)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "56px", fontFamily: "'Inter', sans-serif" }}>

      {/* ── PREMIUM HERO HEADER ──────────────────────────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 40%, #EFF6FF 100%)",
        border: "1.5px solid #DCFCE7",
        borderRadius: "24px", padding: "36px 40px",
        boxShadow: "0 8px 32px rgba(22,163,74,0.06)",
      }}>
        {/* Decorative glows */}
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "260px", height: "260px", background: "radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        {/* Subtle AI grid pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#16A34A18 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "28px" }}>
          {/* Left: Branding */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "16px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 28px rgba(22,163,74,0.32)", flexShrink: 0 }}>
                <Brain style={{ width: "30px", height: "30px", color: "#ffffff" }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#16A34A", background: "#DCFCE7", padding: "2px 10px", borderRadius: "99px", border: "1px solid #86EFAC" }}>
                    🤖 AI LABORATORY
                  </span>
                </div>
                <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.8px", margin: 0, lineHeight: 1.1 }}>
                  AI Diagnostics Laboratory
                </h1>
                <p style={{ fontSize: "15px", color: "#475569", margin: "8px 0 0", fontWeight: 500, lineHeight: 1.5 }}>
                  AI Plant Disease Detection &amp; Crop Health Intelligence
                </p>
              </div>
            </div>

            {/* Powered by badge + info pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "99px", background: "#ffffff", border: "1.5px solid #DCFCE7", fontSize: "12px", fontWeight: 700, color: "#16A34A", boxShadow: "0 2px 8px rgba(22,163,74,0.08)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22C55E", display: "inline-block", boxShadow: "0 0 6px #22C55E" }} />
                Powered by Gemini AI
              </div>
              {[
                { label: "6 AI Models", color: "#7C3AED", bg: "#EDE9FE", border: "#DDD6FE" },
                { label: "97% Accuracy", color: "#2563EB", bg: "#DBEAFE", border: "#BFDBFE" },
                { label: "Real-time Analysis", color: "#D97706", bg: "#FEF3C7", border: "#FDE68A" },
              ].map(p => (
                <span key={p.label} style={{ fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "99px", background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Status KPI Cards */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            {statusCards.map((card) => (
              <motion.div
                key={card.title}
                whileHover={{ y: -4, boxShadow: `0 16px 32px ${card.color}20` }}
                style={{ background: "#ffffff", border: `1.5px solid ${card.border}`, borderRadius: "18px", padding: "18px 20px", minWidth: "120px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", cursor: "default", transition: "box-shadow 0.2s ease" }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", boxShadow: `0 4px 10px ${card.color}30` }}>
                  <span style={{ fontSize: "18px" }}>{card.emoji}</span>
                </div>
                <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px", lineHeight: 1 }}>{card.value}</p>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#374151", margin: "4px 0 2px" }}>{card.title}</p>
                <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AnimatePresence: Report / Tool / Grid ────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* VIEW REPORT */}
        {viewingReport ? (
          <PremiumReportView
            key="report"
            entry={viewingReport}
            onClose={() => setViewingReport(null)}
            onNewAnalysis={() => {
              setViewingReport(null);
              setSelectedTool(viewingReport.toolId);
            }}
          />
        ) : !selectedTool ? (

          /* ── GRID VIEW ───────────────────────────────────────────────── */
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Search & Filters */}
            <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "18px", padding: "18px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ position: "relative", flex: "1 1 240px", maxWidth: "360px" }}>
                <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder="Search AI models..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", height: "44px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", paddingLeft: "40px", paddingRight: "14px", fontSize: "14px", color: "#374151", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#16A34A"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.10)"; e.currentTarget.style.background = "#ffffff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#F8FAFC"; }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0 }}>
                    <X style={{ width: "14px", height: "14px" }} />
                  </button>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{ height: "38px", padding: "0 16px", borderRadius: "99px", border: `1.5px solid ${categoryFilter === cat ? "#16A34A" : "#E2E8F0"}`, background: categoryFilter === cat ? "#DCFCE7" : "#F8FAFC", color: categoryFilter === cat ? "#15803D" : "#64748B", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.15s ease" }}
                    onMouseEnter={(e) => { if (categoryFilter !== cat) { e.currentTarget.style.borderColor = "#16A34A"; e.currentTarget.style.color = "#16A34A"; } }}
                    onMouseLeave={(e) => { if (categoryFilter !== cat) { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#64748B"; } }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Model Grid */}
            {filteredTools.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "56px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#F9FAFB", border: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FlaskConical style={{ width: "26px", height: "26px", color: "#D1D5DB" }} />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1F2937", margin: 0 }}>No AI models match your search.</h3>
                <button onClick={() => { setSearch(""); setCategoryFilter("All"); }} style={{ height: "40px", padding: "0 20px", borderRadius: "10px", border: "none", background: "#F3F4F6", color: "#374151", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {filteredTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      key={tool.id}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -6, boxShadow: `0 20px 44px ${tool.accentHex}18` }}
                      onClick={() => setSelectedTool(tool.id)}
                      style={{ background: "#ffffff", border: `1.5px solid ${tool.accentBorder}`, borderRadius: "20px", padding: "26px", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "16px", transition: "box-shadow 0.25s ease" }}
                    >
                      {/* Top accent bar */}
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${tool.accentHex}, ${tool.accentHex}88)`, borderRadius: "20px 20px 0 0" }} />

                      {/* Subtle bg pattern */}
                      <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: `radial-gradient(circle, ${tool.accentHex}0A 0%, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />

                      {tool.badge && (
                        <div style={{ position: "absolute", top: "18px", right: "18px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "99px", background: `linear-gradient(135deg, ${tool.accentHex}, ${tool.accentHex}BB)`, color: "#ffffff", boxShadow: `0 2px 8px ${tool.accentHex}40` }}>
                            {tool.badge}
                          </span>
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                        <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: tool.accentBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${tool.accentBorder}`, boxShadow: `0 4px 12px ${tool.accentHex}15` }}>
                          <span style={{ fontSize: "22px" }}>{tool.emoji}</span>
                        </div>
                        <div style={{ flex: 1, paddingTop: "2px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: tool.accentHex }}>{tool.category}</span>
                          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "3px 0 0", lineHeight: 1.3, letterSpacing: "-0.2px" }}>{tool.title}</h3>
                        </div>
                      </div>

                      <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.65, margin: 0 }}>{tool.desc}</p>

                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {[
                          { label: `✓ ${tool.accuracy} Accuracy` },
                          { label: `⚡ ${tool.eta}` },
                          { label: `📥 ${tool.inputType}` },
                        ].map((meta) => (
                          <span key={meta.label} style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "3px 9px", borderRadius: "6px" }}>
                            {meta.label}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: `1px solid ${tool.accentLight}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "8px", height: "8px", background: "#22C55E", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 6px #22C55E80" }} />
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#22C55E" }}>Ready</span>
                        </div>
                        <button
                          style={{ height: "38px", padding: "0 18px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${tool.accentHex} 0%, ${tool.accentHex}CC 100%)`, color: "#ffffff", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", boxShadow: `0 4px 12px ${tool.accentHex}30`, transition: "all 0.18s ease" }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 20px ${tool.accentHex}40`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 12px ${tool.accentHex}30`; }}
                          onClick={(e) => { e.stopPropagation(); setSelectedTool(tool.id); }}
                        >
                          Launch <ArrowRight style={{ width: "14px", height: "14px" }} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* How It Works + History */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              {/* How It Works */}
              <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "26px", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 22px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <FlaskConical style={{ width: "14px", height: "14px", color: "#ffffff" }} />
                  </span>
                  How AI Lab Works
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {HOW_IT_WORKS.map((step, idx) => (
                    <div key={step.label} style={{ display: "flex", gap: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: step.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.04)", boxShadow: `0 4px 10px ${step.color}18` }}>
                          <step.icon style={{ width: "20px", height: "20px", color: step.color }} />
                        </div>
                        {idx < HOW_IT_WORKS.length - 1 && (
                          <div style={{ width: "2px", flex: 1, minHeight: "20px", background: `linear-gradient(to bottom, ${step.color}40, transparent)`, margin: "4px 0" }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: idx < HOW_IT_WORKS.length - 1 ? "16px" : "0", paddingTop: "8px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", margin: "0 0 3px" }}>{step.label}</p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* History */}
              <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "26px", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity style={{ width: "18px", height: "18px", color: "#22C55E" }} />
                  Recent AI Analyses
                  {history.length > 0 && (
                    <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 8px", borderRadius: "99px" }}>
                      {history.length} total
                    </span>
                  )}
                </h3>

                {history.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "36px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)", border: "1.5px solid #DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Clock style={{ width: "24px", height: "24px", color: "#22C55E" }} />
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#9CA3AF", margin: 0 }}>No analyses yet this session.</p>
                    <p style={{ fontSize: "11px", color: "#D1D5DB", margin: 0 }}>Run an AI model above to see your history here.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px" }}>
                    <AnimatePresence>
                      {history.map((entry) => (
                        <HistoryCard key={entry.id} entry={entry} onViewReport={setViewingReport} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        ) : (

          /* ── ACTIVE TOOL VIEW ────────────────────────────────────────── */
          <motion.div
            key={selectedTool}
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Breadcrumb header */}
            <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "18px", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <button
                  onClick={() => setSelectedTool(null)}
                  style={{ height: "40px", padding: "0 16px", borderRadius: "12px", border: "1.5px solid #E2E8F0", background: "#ffffff", color: "#374151", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", transition: "all 0.15s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#16A34A"; e.currentTarget.style.color = "#16A34A"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#374151"; }}
                >
                  <ArrowLeft style={{ width: "14px", height: "14px" }} /> {t("backToAiHub")}
                </button>

                {selectedToolData && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: selectedToolData.accentBg, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${selectedToolData.accentBorder}` }}>
                      <span style={{ fontSize: "18px" }}>{selectedToolData.emoji}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{selectedToolData.title}</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>{t("aiPoweredAnalysis")} · Powered by Gemini AI</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedToolData && (
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { label: `✓ ${selectedToolData.accuracy} Accuracy`, color: selectedToolData.accentHex },
                    { label: `⚡ ${selectedToolData.eta}`, color: "#64748B" },
                  ].map((meta) => (
                    <span key={meta.label} style={{ fontSize: "11px", fontWeight: 700, color: meta.color, background: "#F8FAFC", border: "1.5px solid #E2E8F0", padding: "5px 12px", borderRadius: "99px" }}>
                      {meta.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* AI Component Container */}
            <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "22px", padding: "36px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              {selectedTool === "disease"     && <AIDiseaseDetector    onComplete={handleAnalysisComplete("disease",    "AI Disease Detection")} />}
              {selectedTool === "yield"       && <AIYieldPredictor     onComplete={handleAnalysisComplete("yield",      "AI Yield Prediction")} />}
              {selectedTool === "market"      && <AIMarketAdvisor      onComplete={handleAnalysisComplete("market",     "AI Market Intelligence")} />}
              {selectedTool === "fertilizer"  && <AIFertilizerAdvisor  onComplete={handleAnalysisComplete("fertilizer", "AI Fertilizer Advisor")} />}
              {selectedTool === "business"    && <AIBusinessAdvisor    onComplete={handleAnalysisComplete("business",   "AI Business Advisor")} />}
              {selectedTool === "writer"      && <AIProductWriter      onComplete={handleAnalysisComplete("writer",     "AI Listing Generator")} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}