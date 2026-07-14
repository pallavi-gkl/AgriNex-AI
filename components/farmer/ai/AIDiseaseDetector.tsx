"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import {
  Brain,
  Activity,
  Sparkles,
  CheckCircle,
  ShieldAlert,
  Leaf,
  Droplets,
  FlaskConical,
  Shield,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Download,
  RefreshCw,
  Share2,
  Bookmark,
  TrendingUp,
  ChevronRight,
  XCircle,
} from "lucide-react";

interface Props { onComplete?: (data: any, cropName: string) => void; }

/* ── Severity helpers ─────────────────────────────────────── */
function severityConfig(sev?: string) {
  const s = (sev ?? "").toLowerCase();
  if (s === "low") return { color: "#15803D", bg: "#DCFCE7", border: "#86EFAC", label: "Low Risk", dot: "#22C55E" };
  if (s === "medium") return { color: "#D97706", bg: "#FEF3C7", border: "#FDE68A", label: "Moderate Risk", dot: "#F59E0B" };
  return { color: "#DC2626", bg: "#FEE2E2", border: "#FECACA", label: "High Risk", dot: "#EF4444" };
}

/* ── Animated confidence bar ─────────────────────────────── */
function ConfidenceBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: 800, color, fontFamily: "monospace" }}>{value}%</span>
      </div>
      <div style={{ height: "8px", background: "#F1F5F9", borderRadius: "99px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            borderRadius: "99px",
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

/* ── Recovery Timeline ───────────────────────────────────── */
function RecoveryTimeline() {
  const weeks = [
    { week: "Week 1", label: "Initial Treatment", desc: "Apply medicine & remove infected leaves", color: "#EF4444" },
    { week: "Week 2", label: "Monitoring Phase", desc: "Check progress, reapply if needed", color: "#F59E0B" },
    { week: "Week 3", label: "Recovery Signs", desc: "New healthy growth visible", color: "#22C55E" },
    { week: "Week 4", label: "Full Recovery", desc: "Crop returns to healthy state", color: "#16A34A" },
  ];
  return (
    <div style={{ display: "flex", gap: "0", overflowX: "auto" }}>
      {weeks.map((w, i) => (
        <div key={w.week} style={{ flex: "1", minWidth: "120px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {i < weeks.length - 1 && (
            <div style={{ position: "absolute", top: "18px", left: "50%", right: "-50%", height: "2px", background: `linear-gradient(90deg, ${w.color}, ${weeks[i + 1].color})`, zIndex: 0 }} />
          )}
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: w.color, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, boxShadow: `0 4px 12px ${w.color}40`, marginBottom: "10px", flexShrink: 0 }}>
            <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: 800 }}>{i + 1}</span>
          </div>
          <p style={{ fontSize: "10px", fontWeight: 800, color: "#0F172A", margin: "0 0 2px", textAlign: "center" }}>{w.week}</p>
          <p style={{ fontSize: "9px", fontWeight: 700, color: w.color, margin: "0 0 2px", textAlign: "center" }}>{w.label}</p>
          <p style={{ fontSize: "8px", color: "#94A3B8", textAlign: "center", lineHeight: 1.4 }}>{w.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Recommendation Card ─────────────────────────────────── */
const TREATMENT_ICONS = ["💧", "🌱", "🧪", "🛡️", "🌿", "⚡", "🔬", "🌾"];

function TreatmentCard({ text, index }: { text: string; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: "12px",
        background: hovered ? "#F0FDF4" : "#ffffff",
        border: `1.5px solid ${hovered ? "#86EFAC" : "#DCFCE7"}`,
        borderRadius: "14px", padding: "14px 16px",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 20px rgba(22,163,74,0.10)" : "0 2px 6px rgba(0,0,0,0.03)",
        cursor: "default",
      }}
    >
      <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1 }}>{TREATMENT_ICONS[index % TREATMENT_ICONS.length]}</span>
      <p style={{ fontSize: "13px", color: "#1E293B", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{text}</p>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AIDiseaseDetector({ onComplete }: Props = {}) {
  const { t } = useTranslation("farmer");
  const [cropType, setCropType] = useState("Rice");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [descFocused, setDescFocused] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropType, description }),
      });
      const data = await res.json();
      setResult(data);
      onComplete?.(data, cropType);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AgriNex_Disease_Report_${cropType}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sev = result ? severityConfig(result.severity) : null;

  const CROPS = ["Rice", "Wheat", "Mango", "Tomato", "Turmeric", "Spinach", "Cotton", "Sugarcane", "Maize", "Soybean"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Tool Header ─────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)",
        border: "1.5px solid #DDD6FE",
        borderRadius: "20px", padding: "24px 28px",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", flexWrap: "wrap",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blob */}
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "140px", height: "140px", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #7C3AED, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(124,58,237,0.30)", flexShrink: 0 }}>
            <Brain style={{ width: "26px", height: "26px", color: "#ffffff" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1F2937", margin: 0, letterSpacing: "-0.3px" }}>AI Disease Detection</h2>
              <span style={{ fontSize: "10px", fontWeight: 800, background: "linear-gradient(135deg, #7C3AED, #6366F1)", color: "#ffffff", padding: "2px 10px", borderRadius: "99px" }}>Popular</span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748B", margin: 0, fontWeight: 500 }}>
              🟢 Powered by Gemini AI &nbsp;·&nbsp; <span style={{ color: "#7C3AED", fontWeight: 700 }}>97% Accuracy</span> &nbsp;·&nbsp; Avg Time: 15 sec
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          {[
            { label: "Smart Crop Health Engine", color: "#7C3AED", bg: "#EDE9FE", border: "#DDD6FE" },
            { label: "Real-time Detection", color: "#2563EB", bg: "#DBEAFE", border: "#BFDBFE" },
            { label: "Organic Remedies", color: "#059669", bg: "#D1FAE5", border: "#6EE7B7" },
          ].map(b => (
            <span key={b.label} style={{ fontSize: "10px", fontWeight: 700, background: b.bg, color: b.color, border: `1px solid ${b.border}`, padding: "4px 10px", borderRadius: "99px" }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Form ────────────────────────────────────── */}
      <form onSubmit={handleAnalyze} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Crop Variety */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
            Crop Variety <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <Leaf style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#7C3AED", pointerEvents: "none" }} />
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              style={{
                width: "100%", height: "52px",
                background: "#ffffff",
                border: "1.5px solid #DDD6FE",
                borderRadius: "14px",
                paddingLeft: "42px", paddingRight: "16px",
                fontSize: "15px", fontWeight: 600, color: "#1F2937",
                outline: "none", cursor: "pointer",
                appearance: "none", WebkitAppearance: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.10)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#DDD6FE"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronRight style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%) rotate(90deg)", width: "16px", height: "16px", color: "#94A3B8", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Symptoms Description <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#94A3B8", fontFamily: "monospace" }}>{description.length} / 400</span>
          </div>
          <div style={{ position: "relative" }}>
            <Leaf style={{ position: "absolute", left: "14px", top: "16px", width: "16px", height: "16px", color: "#7C3AED", pointerEvents: "none" }} />
            <textarea
              required
              rows={4}
              maxLength={400}
              placeholder={"Describe visible symptoms...\n• Yellow leaves with brown spots\n• Leaf curl or wilting\n• Fungal growth or dry stem"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={(e) => { setDescFocused(true); e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.10)"; }}
              onBlur={(e) => { setDescFocused(false); e.currentTarget.style.borderColor = "#DDD6FE"; e.currentTarget.style.boxShadow = "none"; }}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#ffffff",
                border: `1.5px solid ${descFocused ? "#7C3AED" : "#DDD6FE"}`,
                borderRadius: "14px",
                paddingTop: "14px", paddingBottom: "14px",
                paddingLeft: "42px", paddingRight: "16px",
                fontSize: "14px", color: "#1F2937",
                fontWeight: 500, lineHeight: 1.7,
                outline: "none", resize: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
          {/* Symptom chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
            {["Yellow Leaves", "Brown Spots", "Leaf Curl", "Fungal Growth", "Dry Stem", "Poor Flowering"].map(s => (
              <button
                key={s} type="button"
                onClick={() => setDescription(prev => prev ? prev + ", " + s : s)}
                style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px", background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE", cursor: "pointer", transition: "all 0.15s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#EDE9FE"; e.currentTarget.style.borderColor = "#7C3AED"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F5F3FF"; e.currentTarget.style.borderColor = "#DDD6FE"; }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", height: "56px",
            borderRadius: "16px", border: "none",
            background: loading
              ? "#94A3B8"
              : "linear-gradient(135deg, #7C3AED 0%, #6366F1 50%, #4F46E5 100%)",
            color: "#ffffff",
            fontSize: "16px", fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 6px 24px rgba(124,58,237,0.30)",
            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            letterSpacing: "-0.2px",
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(124,58,237,0.40)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = loading ? "none" : "0 6px 24px rgba(124,58,237,0.30)"; }}
        >
          {loading ? (
            <>
              <svg style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Running Gemini AI Analysis...</span>
              <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "99px" }}>Please wait</span>
            </>
          ) : (
            <>
              <Sparkles style={{ width: "20px", height: "20px" }} />
              ✨ Analyze Crop Health
              <Brain style={{ width: "18px", height: "18px", opacity: 0.8 }} />
            </>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      {/* ── AI Result Dashboard ─────────────────────── */}
      {result && sev && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Divider label */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em", background: "#F5F3FF", padding: "4px 14px", borderRadius: "99px", border: "1px solid #DDD6FE" }}>
              🤖 AI Diagnosis Report
            </span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleDownload}
              style={{ height: "40px", padding: "0 16px", borderRadius: "12px", border: "1.5px solid #DCFCE7", background: "#ffffff", color: "#16A34A", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F0FDF4"; e.currentTarget.style.borderColor = "#16A34A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#DCFCE7"; }}
            >
              <Download style={{ width: "14px", height: "14px" }} /> Download Report
            </button>
            <button
              onClick={() => setResult(null)}
              style={{ height: "40px", padding: "0 16px", borderRadius: "12px", border: "1.5px solid #DDD6FE", background: "#ffffff", color: "#7C3AED", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F3FF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
            >
              <RefreshCw style={{ width: "14px", height: "14px" }} /> New Analysis
            </button>
            <button
              style={{ height: "40px", padding: "0 16px", borderRadius: "12px", border: "1.5px solid #E2E8F0", background: "#ffffff", color: "#64748B", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
            >
              <Share2 style={{ width: "14px", height: "14px" }} /> Share Report
            </button>
            <button
              style={{ height: "40px", padding: "0 16px", borderRadius: "12px", border: "1.5px solid #E2E8F0", background: "#ffffff", color: "#64748B", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
            >
              <Bookmark style={{ width: "14px", height: "14px" }} /> Save to History
            </button>
          </div>

          {/* Disease Name Card */}
          <div style={{ background: "linear-gradient(135deg, #FEF2F2 0%, #ffffff 100%)", border: "1.5px solid #FECACA", borderRadius: "20px", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", boxShadow: "0 4px 16px rgba(239,68,68,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: sev.bg, border: `1.5px solid ${sev.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle style={{ width: "26px", height: "26px", color: sev.color }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3AF" }}>Disease Identified</span>
                  <span style={{ fontSize: "10px", fontWeight: 800, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`, padding: "2px 10px", borderRadius: "99px" }}>
                    {sev.label}
                  </span>
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#1F2937", margin: 0, letterSpacing: "-0.4px" }}>{result.disease_name}</h3>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "12px 18px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Confidence</p>
                <p style={{ fontSize: "24px", fontWeight: 900, color: "#22C55E", margin: 0, fontFamily: "monospace" }}>{result.confidence}%</p>
              </div>
              <div style={{ textAlign: "center", background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "14px", padding: "12px 18px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Est. Crop Loss</p>
                <p style={{ fontSize: "24px", fontWeight: 900, color: "#DC2626", margin: 0, fontFamily: "monospace" }}>{result.estimated_crop_loss_percent}%</p>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ background: "#ffffff", border: "1.5px solid #DCFCE7", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>AI Confidence Meter</p>
              <ConfidenceBar value={result.confidence ?? 0} label="Diagnostic Confidence" color="#22C55E" />
              <ConfidenceBar value={Math.max(0, 100 - (result.estimated_crop_loss_percent ?? 0))} label="Crop Health Score" color="#16A34A" />
              <ConfidenceBar value={result.estimated_crop_loss_percent ?? 0} label="Disease Risk Level" color="#EF4444" />
            </div>

            {/* Symptom chips */}
            {result.symptoms && Array.isArray(result.symptoms) && result.symptoms.length > 0 && (
              <div style={{ background: "#ffffff", border: "1.5px solid #DDD6FE", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Symptoms Found</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {result.symptoms.map((s: string, i: number) => (
                    <span key={i} style={{ fontSize: "11px", fontWeight: 700, background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE", padding: "5px 10px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle style={{ width: "10px", height: "10px" }} /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Treatment Cards */}
          {result.treatment && Array.isArray(result.treatment) && result.treatment.length > 0 && (
            <div style={{ background: "#ffffff", border: "1.5px solid #DCFCE7", borderRadius: "20px", padding: "24px 26px", boxShadow: "0 4px 16px rgba(22,163,74,0.04)" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#15803D", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #22C55E, #16A34A)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle style={{ width: "14px", height: "14px", color: "#ffffff" }} />
                </span>
                Recommended Treatment Plan
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.treatment.map((t: string, i: number) => (
                  <TreatmentCard key={i} text={t} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Do's & Don'ts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Do's */}
            <div style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: "16px", padding: "20px 22px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#15803D", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "7px" }}>
                <ThumbsUp style={{ width: "16px", height: "16px" }} /> Do's
              </h4>
              {["Remove infected leaves immediately", "Improve soil drainage system", "Maintain proper plant spacing", "Apply recommended fungicide dose", "Monitor daily for 2 weeks"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ color: "#16A34A", fontWeight: 800, fontSize: "14px", lineHeight: 1.2, flexShrink: 0 }}>✔</span>
                  <p style={{ fontSize: "12px", color: "#166534", margin: 0, lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>

            {/* Don'ts */}
            <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "16px", padding: "20px 22px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#DC2626", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "7px" }}>
                <ThumbsDown style={{ width: "16px", height: "16px" }} /> Don'ts
              </h4>
              {["Don't overwater the affected plants", "Don't spray during peak afternoon", "Don't mix multiple chemicals", "Don't ignore early symptoms", "Don't reuse infected equipment"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ color: "#EF4444", fontWeight: 800, fontSize: "14px", lineHeight: 1.2, flexShrink: 0 }}>✖</span>
                  <p style={{ fontSize: "12px", color: "#991B1B", margin: 0, lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Organic Treatment */}
          {result.organic_treatment && (
            <div style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)", border: "1.5px solid #6EE7B7", borderRadius: "16px", padding: "22px 26px", boxShadow: "0 4px 16px rgba(22,163,74,0.08)" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#15803D", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles style={{ width: "16px", height: "16px" }} />
                🌿 Organic Cultivation Alternative
              </h4>
              <p style={{ fontSize: "13px", color: "#166534", margin: 0, lineHeight: 1.7, fontWeight: 500 }}>{result.organic_treatment}</p>
            </div>
          )}

          {/* Recovery Timeline */}
          <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px 28px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#1F2937", margin: "0 0 24px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp style={{ width: "18px", height: "18px", color: "#22C55E" }} />
              Expected Recovery Timeline
            </h4>
            <RecoveryTimeline />
          </div>

        </div>
      )}
    </div>
  );
}