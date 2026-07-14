"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { FileText, Copy, CheckCircle, Sparkles, MapPin, Award, Shield, Check } from "lucide-react";

interface Props { onComplete?: (data: any, cropName: string) => void; }

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", height: "48px",
  background: "#ffffff", border: "1.5px solid #C7D2FE", borderRadius: "14px",
  paddingLeft: "42px", paddingRight: "14px",
  fontSize: "14px", fontWeight: 500, color: "#1F2937",
  outline: "none", appearance: "none", WebkitAppearance: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function PremiumInput({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#4F46E5", pointerEvents: "none", display: "flex" }}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

export default function AIProductWriter({ onComplete }: Props = {}) {
  const { t } = useTranslation("farmer");
  const [cropName, setCropName] = useState("Alphonso Mango");
  const [grade, setGrade] = useState("A+");
  const [isOrganic, setIsOrganic] = useState(true);
  const [location, setLocation] = useState("Ratnagiri, Maharashtra");
  const [featuresInput, setFeaturesInput] = useState("GI Tagged, Sun-ripened, Fiberless sweet pulp");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const handleCopy = (text: string, type: "title" | "desc") => {
    navigator.clipboard.writeText(text);
    if (type === "title") {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const uniqueFeatures = featuresInput.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/ai/product-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropName, grade, isOrganic, location, uniqueFeatures }),
      });
      const data = await res.json();
      setResult(data);
      onComplete?.(data, cropName);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 50%, #EEF2FF 100%)", border: "1.5px solid #C7D2FE", borderRadius: "20px", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #4F46E5, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(79,70,229,0.30)" }}>
              <FileText style={{ width: "26px", height: "26px", color: "#ffffff" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{t("listingGeneratorTitle")}</h2>
              </div>
              <p style={{ fontSize: "13px", color: "#3730A3", margin: 0, fontWeight: 500 }}>🟢 Powered by Gemini AI &nbsp;·&nbsp; <span style={{ fontWeight: 700 }}>98% Accuracy</span> &nbsp;·&nbsp; Avg Time: 6 sec</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[{l:"Ad Copywriter",c:"#4F46E5",bg:"#EEF2FF",b:"#C7D2FE"},{l:"SEO Meta Title",c:"#059669",bg:"#D1FAE5",b:"#6EE7B7"},{l:"USP Optimizer",c:"#D97706",bg:"#FEF3C7",b:"#FDE68A"}].map(p=>(
              <span key={p.l} style={{ fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px", background: p.bg, color: p.c, border: `1px solid ${p.b}` }}>{p.l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          <PremiumInput label="Crop Produce Name" icon={<FileText style={{ width: "16px", height: "16px" }} />}>
            <input type="text" required value={cropName} onChange={e => setCropName(e.target.value)} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#4F46E5";e.currentTarget.style.boxShadow="0 0 0 3px rgba(79,70,229,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#C7D2FE";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Origin Location" icon={<MapPin style={{ width: "16px", height: "16px" }} />}>
            <input type="text" required value={location} onChange={e => setLocation(e.target.value)} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#4F46E5";e.currentTarget.style.boxShadow="0 0 0 3px rgba(79,70,229,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#C7D2FE";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Quality Grade" icon={<Award style={{ width: "16px", height: "16px" }} />}>
            <select value={grade} onChange={e => setGrade(e.target.value)} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#4F46E5";e.currentTarget.style.boxShadow="0 0 0 3px rgba(79,70,229,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#C7D2FE";e.currentTarget.style.boxShadow="none";}}>
              <option value="A+">{t("gradeA1")}</option>
              <option value="A">{t("gradeA")}</option>
              <option value="B">{t("gradeB")}</option>
              <option value="C">{t("gradeC")}</option>
            </select>
          </PremiumInput>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "48px", background: "#ffffff", border: "1.5px solid #C7D2FE", borderRadius: "14px", paddingLeft: "16px", paddingRight: "16px", marginTop: "23px", boxSizing: "border-box" }}>
            <input
              type="checkbox"
              id="is_organic_writer"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#10B981", cursor: "pointer" }}
            />
            <label htmlFor="is_organic_writer" style={{ fontSize: "13px", fontWeight: 600, color: "#475569", cursor: "pointer" }}>
              {t("grownOrganically")}
            </label>
          </div>
        </div>

        <PremiumInput label="Unique Features (USPs)" icon={<Sparkles style={{ width: "16px", height: "16px" }} />}>
          <input type="text" required value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} style={inputStyle} placeholder="GI Tagged, Sun-ripened, Fiberless sweet pulp"
            onFocus={e=>{e.currentTarget.style.borderColor="#4F46E5";e.currentTarget.style.boxShadow="0 0 0 3px rgba(79,70,229,0.10)";}}
            onBlur={e=>{e.currentTarget.style.borderColor="#C7D2FE";e.currentTarget.style.boxShadow="none";}} />
        </PremiumInput>

        <button type="submit" disabled={loading} style={{ width: "100%", height: "56px", borderRadius: "16px", border: "none", background: loading ? "#94A3B8" : "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)", color: "#ffffff", fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 6px 24px rgba(79,70,229,0.28)", transition: "all 0.25s" }}
          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 32px rgba(79,70,229,0.38)"; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? "none" : "0 6px 24px rgba(79,70,229,0.28)"; }}>
          {loading ? (<><svg style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>{t("authoringSalesCopyWriting")}</span></>) : (<><FileText style={{ width: "20px", height: "20px" }} />✨ Generate Marketplace Ad Copy</>)}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.08em", background: "#EEF2FF", padding: "4px 14px", borderRadius: "99px", border: "1px solid #C7D2FE" }}>✍️ Ad Copywriting Output</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          {/* Copy Title Card */}
          <div style={{ background: "#ffffff", border: "1.5px solid #C7D2FE", borderRadius: "16px", padding: "20px 22px", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Optimized Product Title</p>
            <p style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: 0, paddingRight: "36px", lineHeight: 1.5 }}>{result.title}</p>
            <button
              type="button"
              onClick={() => handleCopy(result.title, "title")}
              style={{ position: "absolute", top: "16px", right: "16px", background: "#F3F4F6", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: copiedTitle ? "#10B981" : "#4B5563", transition: "all 0.2s" }}
            >
              {copiedTitle ? <Check style={{ width: "16px", height: "16px" }} /> : <Copy style={{ width: "16px", height: "16px" }} />}
            </button>
          </div>

          {/* Copy Description Card */}
          <div style={{ background: "#ffffff", border: "1.5px solid #C7D2FE", borderRadius: "16px", padding: "20px 22px", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>{t("fullSalesDescription")}</p>
            <p style={{ fontSize: "13px", color: "#374151", margin: 0, paddingRight: "36px", lineHeight: 1.7 }}>{result.description}</p>
            <button
              type="button"
              onClick={() => handleCopy(result.description, "desc")}
              style={{ position: "absolute", top: "16px", right: "16px", background: "#F3F4F6", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: copiedDesc ? "#10B981" : "#4B5563", transition: "all 0.2s" }}
            >
              {copiedDesc ? <Check style={{ width: "16px", height: "16px" }} /> : <Copy style={{ width: "16px", height: "16px" }} />}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* USPs */}
            <div style={{ background: "#ffffff", border: "1.5px solid #86EFAC", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#16A34A", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles style={{ width: "16px", height: "16px" }} /> Optimized Marketing USPs
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {result.usps?.map((u: string, idx: number) => (
                  <span key={idx} style={{ fontSize: "11px", fontWeight: 700, background: "#F0FDF4", color: "#16A34A", border: "1px solid #86EFAC", padding: "6px 12px", borderRadius: "8px" }}>
                    {u}
                  </span>
                ))}
              </div>
            </div>

            {/* Price reference range */}
            <div style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 100%)", border: "1.5px solid #A5B4FC", borderRadius: "16px", padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#3730A3", margin: "0 0 4px" }}>Suggested Price Range</h4>
                <p style={{ fontSize: "12px", color: "#4F46E5", margin: 0 }}>{t("calculatedUsingRegionalMarkupI")}</p>
              </div>
              <span style={{ fontSize: "24px", fontWeight: 900, color: "#312E81", fontFamily: "monospace" }}>{result.suggested_price_range}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}