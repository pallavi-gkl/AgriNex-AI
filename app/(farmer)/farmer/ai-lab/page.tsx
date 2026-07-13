"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview AI Diagnostics Laboratory — /farmer/ai-lab
 * Phase 6 + Refinement: Dynamic history tracking + premium report UI.
 * All 6 AI models, Gemini integration, existing questions fully preserved.
 * History is session-local (no fake backend).
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
  TrendingDown,
  Info,
} from "lucide-react";

// ── AI sub-components (UNMODIFIED — only receive optional onComplete prop) ────
import AIDiseaseDetector from "@/components/farmer/ai/AIDiseaseDetector";
import AIYieldPredictor from "@/components/farmer/ai/AIYieldPredictor";
import AIMarketAdvisor from "@/components/farmer/ai/AIMarketAdvisor";
import AIFertilizerAdvisor from "@/components/farmer/ai/AIFertilizerAdvisor";
import AIBusinessAdvisor from "@/components/farmer/ai/AIBusinessAdvisor";
import AIProductWriter from "@/components/farmer/ai/AIProductWriter";

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── AI Tool definitions (all 6 preserved) ────────────────────────────────────
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
  },
];

const HOW_IT_WORKS = [
  { icon: Leaf, label: "Upload Crop Data", sub: "Images, soil reports, or farm metrics", color: "#22C55E", bg: "#DCFCE7" },
  { icon: Brain, label: "Gemini AI Analysis", sub: "Advanced neural model processes your data", color: "#7C3AED", bg: "#EDE9FE" },
  { icon: BarChart2, label: "Smart Report", sub: "Structured confidence-scored output", color: "#2563EB", bg: "#DBEAFE" },
  { icon: Star, label: "Actionable Insights", sub: "Take decisions backed by AI science", color: "#D97706", bg: "#FEF3C7" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};

// ── Severity color helper ─────────────────────────────────────────────────────
function severityStyle(sev?: string) {
  if (!sev) return { color: "#64748B", bg: "#F9FAFB", border: "#E5E7EB" };
  const s = sev.toLowerCase();
  if (s === "low") return { color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" };
  if (s === "medium") return { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
  return { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
}

// ── Premium AI Report Renderer ────────────────────────────────────────────────
// Reads the raw data object returned by Gemini and renders it as structured cards.
// Does NOT change any AI logic — only presents the existing data differently.
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
    const content = JSON.stringify(entry.data, null, 2);
    const blob = new Blob([content], { type: "application/json" });
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
      {/* Back + Actions bar */}
      <div style={{
        background: "#ffffff", border: "1px solid #E5E7EB",
        borderRadius: "16px", padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}>
        <button
          onClick={onClose}
          style={{
            height: "36px", padding: "0 16px", borderRadius: "10px",
            border: "1px solid #E5E7EB", background: "#ffffff",
            color: "#374151", fontWeight: 700, fontSize: "13px",
            display: "flex", alignItems: "center", gap: "7px",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.color = "#7C3AED"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} />
          Back to History
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleDownload}
            style={{
              height: "36px", padding: "0 14px", borderRadius: "10px",
              border: "1px solid #E5E7EB", background: "#F9FAFB",
              color: "#374151", fontWeight: 700, fontSize: "12px",
              display: "flex", alignItems: "center", gap: "6px",
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#F9FAFB"; }}
          >
            <Download style={{ width: "13px", height: "13px" }} />
            Download JSON
          </button>
          <button
            onClick={onNewAnalysis}
            style={{
              height: "36px", padding: "0 14px", borderRadius: "10px",
              border: "none", background: tool ? `linear-gradient(135deg, ${tool.accentHex}, ${tool.accentHex}CC)` : "#22C55E",
              color: "#ffffff", fontWeight: 700, fontSize: "12px",
              display: "flex", alignItems: "center", gap: "6px",
              cursor: "pointer",
              boxShadow: `0 4px 12px ${tool?.accentHex ?? "#22C55E"}30`,
            }}
          >
            <RefreshCw style={{ width: "13px", height: "13px" }} />
            New Analysis
          </button>
        </div>
      </div>

      {/* Report Hero */}
      <div style={{
        background: tool ? `linear-gradient(135deg, ${tool.accentBg} 0%, #ffffff 60%)` : "#F9FAFB",
        border: `1px solid ${tool?.accentBorder ?? "#E5E7EB"}`,
        borderRadius: "20px", padding: "28px 32px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {tool && (
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: tool.accentBg, border: `1px solid ${tool.accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <tool.icon style={{ width: "26px", height: "26px", color: tool.accentHex }} />
              </div>
            )}
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: tool?.accentHex ?? "#22C55E" }}>
                {tool?.category ?? "AI Report"}
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1F2937", margin: "4px 0 2px" }}>
                🤖 {entry.toolTitle}
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                Crop: <strong>{entry.cropName}</strong> &nbsp;·&nbsp; Generated by Gemini AI &nbsp;·&nbsp; {dateLabel} at {timeLabel}
              </p>
            </div>
          </div>

          {/* Confidence + Severity badges */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {d?.confidence !== undefined && (
              <div style={{ textAlign: "center", background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "10px 16px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Confidence</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#22C55E", margin: "2px 0 0", fontFamily: "monospace" }}>{d.confidence}%</p>
              </div>
            )}
            {d?.severity && (
              <div style={{ textAlign: "center", background: sevStyle.bg, border: `1px solid ${sevStyle.border}`, borderRadius: "12px", padding: "10px 16px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Severity</p>
                <p style={{ fontSize: "15px", fontWeight: 800, color: sevStyle.color, margin: "2px 0 0" }}>{d.severity}</p>
              </div>
            )}
            {d?.estimated_crop_loss_percent !== undefined && (
              <div style={{ textAlign: "center", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "10px 16px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Est. Crop Loss</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#DC2626", margin: "2px 0 0", fontFamily: "monospace" }}>{d.estimated_crop_loss_percent}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disease / Primary diagnosis name */}
      {d?.disease_name && (
        <div style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "16px", padding: "20px 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          display: "flex", alignItems: "center", gap: "14px",
        }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertCircle style={{ width: "22px", height: "22px", color: "#DC2626" }} />
          </div>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Disease Identified</p>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1F2937", margin: "4px 0 0" }}>{d.disease_name}</h3>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{
              fontSize: "10px", fontWeight: 800, padding: "4px 12px", borderRadius: "99px",
              background: sevStyle.bg, color: sevStyle.color, border: `1px solid ${sevStyle.border}`,
            }}>
              {d.severity} Severity
            </span>
          </div>
        </div>
      )}

      {/* Symptoms */}
      {d?.symptoms && Array.isArray(d.symptoms) && d.symptoms.length > 0 && (
        <div style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "16px", padding: "20px 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#7C3AED", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#EDE9FE", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Activity style={{ width: "13px", height: "13px", color: "#7C3AED" }} />
            </span>
            Identified Pathology Symptoms
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {d.symptoms.map((s: string, idx: number) => (
              <div key={idx} style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                background: "#F9FAFB", border: "1px solid #F3F4F6",
                borderRadius: "10px", padding: "10px 14px",
              }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: "#EDE9FE", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#7C3AED" }}>{idx + 1}</span>
                </span>
                <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatment */}
      {d?.treatment && Array.isArray(d.treatment) && d.treatment.length > 0 && (
        <div style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "16px", padding: "20px 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#059669", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#D1FAE5", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle style={{ width: "13px", height: "13px", color: "#059669" }} />
            </span>
            Recommended Intervention Treatment
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {d.treatment.map((t: string, idx: number) => (
              <div key={idx} style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                background: "#F0FDF4", border: "1px solid #DCEFD9",
                borderRadius: "10px", padding: "12px 16px",
              }}>
                <span style={{
                  width: "24px", height: "24px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #22C55E, #16A34A)",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 800, color: "#ffffff",
                }}>
                  {idx + 1}
                </span>
                <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: 1.5 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organic Treatment */}
      {d?.organic_treatment && (
        <div style={{
          background: "#F0FDF4", border: "1px solid #86EFAC",
          borderRadius: "16px", padding: "20px 24px",
          boxShadow: "0 2px 8px rgba(34,197,94,0.06)",
        }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#15803D", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles style={{ width: "16px", height: "16px" }} />
            🌿 Organic Cultivation Alternative
          </h4>
          <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: 1.65 }}>{d.organic_treatment}</p>
        </div>
      )}

      {/* Generic key/value fields — covers all other tool responses */}
      {d && (() => {
        const SKIP = ["symptoms", "treatment", "organic_treatment", "disease_name", "severity", "confidence", "estimated_crop_loss_percent", "monthly_breakdown", "key_factors", "risks"];
        const entries = Object.entries(d).filter(([k]) => !SKIP.includes(k) && typeof d[k] !== "object");
        if (entries.length === 0) return null;
        return (
          <div style={{
            background: "#ffffff", border: "1px solid #E5E7EB",
            borderRadius: "16px", padding: "20px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#2563EB", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#DBEAFE", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Info style={{ width: "13px", height: "13px", color: "#2563EB" }} />
              </span>
              Analysis Summary
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              {entries.map(([key, val]) => (
                <div key={key} style={{
                  background: "#F9FAFB", border: "1px solid #E5E7EB",
                  borderRadius: "10px", padding: "12px 14px",
                }}>
                  <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                    {key.replace(/_/g, " ")}
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", margin: 0 }}>
                    {String(val)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Array fields (key_factors, risks, etc.) */}
      {d?.key_factors && Array.isArray(d.key_factors) && (
        <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#D97706", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#FEF3C7", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 style={{ width: "13px", height: "13px", color: "#D97706" }} />
            </span>
            Key Influence Factors
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {d.key_factors.map((f: string, idx: number) => (
              <div key={idx} style={{ display: "flex", gap: "8px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#374151" }}>
                <span style={{ color: "#D97706", fontWeight: 700 }}>•</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
}

// ── History Card ──────────────────────────────────────────────────────────────
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
      style={{
        background: "#ffffff", border: `1px solid ${tool?.accentBorder ?? "#E5E7EB"}`,
        borderRadius: "16px", padding: "16px 18px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        display: "flex", flexDirection: "column", gap: "12px",
        transition: "box-shadow 0.2s ease",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {tool && (
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: tool.accentBg, border: `1px solid ${tool.accentBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <tool.icon style={{ width: "18px", height: "18px", color: tool.accentHex }} />
            </div>
          )}
          <div>
            <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{entry.toolTitle}</p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>Crop: {entry.cropName}</p>
          </div>
        </div>
        <span style={{
          fontSize: "10px", fontWeight: 700, color: "#22C55E",
          background: "#DCFCE7", border: "1px solid #BBF7D0",
          padding: "2px 8px", borderRadius: "99px", flexShrink: 0,
        }}>
          Completed
        </span>
      </div>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {entry.confidence !== undefined && (
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: "#22C55E" }}>
            Confidence: {entry.confidence}%
          </div>
        )}
        {entry.severity && (
          <div style={{ background: sevStyle.bg, border: `1px solid ${sevStyle.border}`, borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: sevStyle.color }}>
            Severity: {entry.severity}
          </div>
        )}
        {entry.summary && (
          <div style={{ fontSize: "11px", color: "#64748B", fontStyle: "italic", alignSelf: "center" }}>
            {entry.summary}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F3F4F6", paddingTop: "10px" }}>
        <span style={{ fontSize: "11px", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock style={{ width: "12px", height: "12px" }} />
          {dateLabel}
        </span>
        <button
          onClick={() => onViewReport(entry)}
          style={{
            height: "30px", padding: "0 14px", borderRadius: "8px",
            border: "none",
            background: tool ? `linear-gradient(135deg, ${tool.accentHex}, ${tool.accentHex}CC)` : "#22C55E",
            color: "#ffffff", fontWeight: 700, fontSize: "12px",
            display: "flex", alignItems: "center", gap: "5px",
            cursor: "pointer", transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          View Report
          <ChevronRight style={{ width: "12px", height: "12px" }} />
        </button>
      </div>
    </motion.div>
  );
}

// Minimal inline chevron-right
function ChevronRight({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
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

  // Called by each AI component after completing analysis
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px", fontFamily: "Inter, sans-serif" }}>

      {/* ── 1. PREMIUM HERO HEADER ────────────────────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #F5F3FF 0%, #ffffff 50%, #EFF6FF 100%)",
        border: "1px solid #E5E7EB", borderRadius: "24px", padding: "32px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
      }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />

        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(124,58,237,0.3)" }}>
                <Brain style={{ width: "26px", height: "26px", color: "#ffffff" }} />
              </div>
              <div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1F2937", letterSpacing: "-0.5px", margin: 0 }}>
                  🤖 {t("aiDiagnosticsLab")}
                </h1>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0", fontWeight: 500 }}>
                  Powered by Gemini AI • Intelligent farming assistance for smarter decisions.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
              {[
                { icon: Sparkles, label: t("sixModels"), color: "#7C3AED", bg: "#EDE9FE", border: "#DDD6FE" },
                { icon: Cpu, label: t("realTimeAnalysis"), color: "#2563EB", bg: "#DBEAFE", border: "#BFDBFE" },
                { icon: Zap, label: t("instantResults"), color: "#059669", bg: "#D1FAE5", border: "#6EE7B7" },
              ].map((pill) => (
                <div key={pill.label} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "99px", background: pill.bg, border: `1px solid ${pill.border}`, fontSize: "12px", fontWeight: 700, color: pill.color }}>
                  <pill.icon style={{ width: "13px", height: "13px" }} />
                  {pill.label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "AI Models", value: "6", icon: FlaskConical, color: "#7C3AED", bg: "#EDE9FE" },
              { label: "Real-time Analysis", value: "Live", icon: Activity, color: "#2563EB", bg: "#DBEAFE" },
              { label: "Session History", value: String(history.length), icon: Clock, color: "#059669", bg: "#D1FAE5" },
            ].map((kpi) => (
              <div key={kpi.label} style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "14px 18px", display: "flex", flexDirection: "column", gap: "8px", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <kpi.icon style={{ width: "16px", height: "16px", color: kpi.color }} />
                </div>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "#1F2937", margin: 0, lineHeight: 1 }}>{kpi.value}</p>
                  <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AnimatePresence: Report View / Tool View / Grid View ───────── */}
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

          /* ── GRID VIEW ─────────────────────────────────────────────── */
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Search & Filters */}
            <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ position: "relative", flex: "1 1 240px", maxWidth: "340px" }}>
                <Search style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder="Search AI models..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", height: "40px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", paddingLeft: "36px", paddingRight: "14px", fontSize: "13px", color: "#374151", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; e.currentTarget.style.background = "#ffffff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#F9FAFB"; }}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{ height: "36px", padding: "0 14px", borderRadius: "99px", border: "1px solid", borderColor: categoryFilter === cat ? "#7C3AED" : "#E5E7EB", background: categoryFilter === cat ? "#EDE9FE" : "#F9FAFB", color: categoryFilter === cat ? "#6D28D9" : "#64748B", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.15s ease" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Model Grid */}
            {filteredTools.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "56px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#F9FAFB", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FlaskConical style={{ width: "26px", height: "26px", color: "#D1D5DB" }} />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1F2937", margin: 0 }}>No AI models match your search.</h3>
                <button onClick={() => { setSearch(""); setCategoryFilter("All"); }} style={{ height: "38px", padding: "0 20px", borderRadius: "10px", border: "none", background: "#F3F4F6", color: "#374151", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      key={tool.id}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
                      onClick={() => setSelectedTool(tool.id)}
                      style={{ background: "#ffffff", border: `1px solid ${tool.accentBorder}`, borderRadius: "20px", padding: "24px", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${tool.accentHex}, ${tool.accentHex}88)`, borderRadius: "20px 20px 0 0" }} />

                      {tool.badge && (
                        <div style={{ position: "absolute", top: "16px", right: "16px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "99px", background: `linear-gradient(135deg, ${tool.accentHex}, ${tool.accentHex}BB)`, color: "#ffffff", boxShadow: `0 2px 8px ${tool.accentHex}40` }}>
                            {tool.badge}
                          </span>
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                        <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: tool.accentBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${tool.accentBorder}` }}>
                          <Icon style={{ width: "26px", height: "26px", color: tool.accentHex }} />
                        </div>
                        <div style={{ flex: 1, paddingTop: "2px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: tool.accentHex }}>{tool.category}</span>
                          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "3px 0 0", lineHeight: 1.3 }}>{tool.title}</h3>
                        </div>
                      </div>

                      <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>{tool.desc}</p>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[{ label: `Accuracy: ${tool.accuracy}`, icon: CheckCircle }, { label: `ETA: ${tool.eta}`, icon: Clock }, { label: `Input: ${tool.inputType}`, icon: Cpu }].map((meta) => (
                          <div key={meta.label} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 700, color: "#64748B", background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "3px 8px", borderRadius: "6px" }}>
                            <meta.icon style={{ width: "10px", height: "10px" }} />
                            {meta.label}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #F3F4F6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "7px", height: "7px", background: "#22C55E", borderRadius: "50%", display: "inline-block" }} />
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#22C55E" }}>Ready</span>
                        </div>
                        <button
                          style={{ height: "36px", padding: "0 16px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${tool.accentHex} 0%, ${tool.accentHex}CC 100%)`, color: "#ffffff", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", boxShadow: `0 4px 12px ${tool.accentHex}30`, transition: "all 0.18s ease" }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 18px ${tool.accentHex}40`; }}
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

            {/* How It Works + Recent Activity / History */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="lg:grid-cols-2">

              {/* How It Works */}
              <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: "0 0 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <FlaskConical style={{ width: "14px", height: "14px", color: "#ffffff" }} />
                  </span>
                  How AI Lab Works
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {HOW_IT_WORKS.map((step, idx) => (
                    <div key={step.label} style={{ display: "flex", gap: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: step.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.04)" }}>
                          <step.icon style={{ width: "20px", height: "20px", color: step.color }} />
                        </div>
                        {idx < HOW_IT_WORKS.length - 1 && (
                          <div style={{ width: "2px", flex: 1, minHeight: "20px", background: "linear-gradient(to bottom, #E5E7EB, transparent)", margin: "4px 0" }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: idx < HOW_IT_WORKS.length - 1 ? "16px" : "0", paddingTop: "8px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", margin: "0 0 2px" }}>{step.label}</p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Recent History */}
              <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity style={{ width: "18px", height: "18px", color: "#22C55E" }} />
                  Recent AI Analyses
                  {history.length > 0 && (
                    <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 8px", borderRadius: "99px" }}>
                      {history.length} total
                    </span>
                  )}
                </h3>

                {history.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F9FAFB", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Clock style={{ width: "22px", height: "22px", color: "#D1D5DB" }} />
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

          /* ── ACTIVE TOOL VIEW ─────────────────────────────────────── */
          <motion.div key={selectedTool} initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -20 }} transition={{ duration: 0.3 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Breadcrumb header */}
            <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <button
                  onClick={() => setSelectedTool(null)}
                  style={{ height: "38px", padding: "0 16px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "#ffffff", color: "#374151", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", transition: "all 0.15s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.color = "#7C3AED"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
                >
                  <ArrowLeft style={{ width: "14px", height: "14px" }} />
                  {t("backToAiHub")}
                </button>

                {selectedToolData && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: selectedToolData.accentBg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${selectedToolData.accentBorder}` }}>
                      <selectedToolData.icon style={{ width: "18px", height: "18px", color: selectedToolData.accentHex }} />
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
                  {[{ label: `Accuracy: ${selectedToolData.accuracy}`, color: selectedToolData.accentHex }, { label: `ETA: ${selectedToolData.eta}`, color: "#64748B" }].map((meta) => (
                    <span key={meta.label} style={{ fontSize: "11px", fontWeight: 700, color: meta.color, background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "4px 10px", borderRadius: "8px" }}>
                      {meta.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* AI Component Container — passes onComplete callback */}
            <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              {selectedTool === "disease" && <AIDiseaseDetector onComplete={handleAnalysisComplete("disease", "AI Disease Detection")} />}
              {selectedTool === "yield" && <AIYieldPredictor onComplete={handleAnalysisComplete("yield", "AI Yield Prediction")} />}
              {selectedTool === "market" && <AIMarketAdvisor onComplete={handleAnalysisComplete("market", "AI Market Intelligence")} />}
              {selectedTool === "fertilizer" && <AIFertilizerAdvisor onComplete={handleAnalysisComplete("fertilizer", "AI Fertilizer Advisor")} />}
              {selectedTool === "business" && <AIBusinessAdvisor onComplete={handleAnalysisComplete("business", "AI Business Advisor")} />}
              {selectedTool === "writer" && <AIProductWriter onComplete={handleAnalysisComplete("writer", "AI Listing Generator")} />}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}