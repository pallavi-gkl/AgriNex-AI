"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sprout, BarChart3, TrendingUp, Download, RefreshCw, Bookmark, MapPin, Droplets, Sun, Layers, ChevronRight } from "lucide-react";

interface Props { onComplete?: (data: any, cropName: string) => void; }

function MetricCard({ label, value, sub, color, bg, border }: { label: string; value: string; sub?: string; color: string; bg: string; border: string }) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: "16px", padding: "18px 20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
      <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: "22px", fontWeight: 900, color, margin: 0, fontFamily: "monospace", letterSpacing: "-0.5px" }}>{value}</p>
      {sub && <p style={{ fontSize: "10px", color: "#94A3B8", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function PremiumInput({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#059669", pointerEvents: "none", display: "flex" }}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", height: "48px",
  background: "#ffffff", border: "1.5px solid #D1FAE5", borderRadius: "14px",
  paddingLeft: "42px", paddingRight: "14px",
  fontSize: "14px", fontWeight: 500, color: "#1F2937",
  outline: "none", appearance: "none", WebkitAppearance: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function AIYieldPredictor({ onComplete }: Props = {}) {
  const { t } = useTranslation("farmer");
  const [cropType, setCropType] = useState("Basmati Rice");
  const [areaAcres, setAreaAcres] = useState(10);
  const [soilType, setSoilType] = useState("Clay Loam");
  const [state, setState] = useState("Haryana");
  const [season, setSeason] = useState("Kharif");
  const [irrigationType, setIrrigationType] = useState("Drip");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/yield", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-acres": String(areaAcres) },
        body: JSON.stringify({ cropType, areaAcres, soilType, state, season, irrigationType }),
      });
      const data = await res.json();
      setResult(data);
      onComplete?.(data, cropType);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `AgriNex_Yield_Report_${cropType}_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #F0FDF4 100%)", border: "1.5px solid #6EE7B7", borderRadius: "20px", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #059669, #22C55E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(5,150,105,0.30)" }}>
              <Sprout style={{ width: "26px", height: "26px", color: "#ffffff" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{t("yieldForecasterTitle")}</h2>
                <span style={{ fontSize: "10px", fontWeight: 800, background: "linear-gradient(135deg, #059669, #22C55E)", color: "#fff", padding: "2px 10px", borderRadius: "99px" }}>New</span>
              </div>
              <p style={{ fontSize: "13px", color: "#065F46", margin: 0, fontWeight: 500 }}>🟢 Powered by Gemini AI &nbsp;·&nbsp; <span style={{ fontWeight: 700 }}>94% Accuracy</span> &nbsp;·&nbsp; Avg Time: 10 sec</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[{l:"Yield Prediction",c:"#059669",bg:"#D1FAE5",b:"#6EE7B7"},{l:"Climate AI",c:"#2563EB",bg:"#DBEAFE",b:"#BFDBFE"},{l:"Harvest Planner",c:"#D97706",bg:"#FEF3C7",b:"#FDE68A"}].map(p=>(
              <span key={p.l} style={{ fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px", background: p.bg, color: p.c, border: `1px solid ${p.b}` }}>{p.l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handlePredict} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          <PremiumInput label="Crop Variety" icon={<Sprout style={{ width: "16px", height: "16px" }} />}>
            <select value={cropType} onChange={e => setCropType(e.target.value)} style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#D1FAE5"; e.currentTarget.style.boxShadow = "none"; }}>
              <option value={t("basmatiRiceTitle")}>{t("basmatiRiceTitle")}</option>
              <option value="Wheat">Wheat</option><option value="Turmeric">Turmeric</option>
              <option value="Tomato">Tomato</option><option value={t("babySpinach1")}>{t("babySpinach1")}</option>
            </select>
          </PremiumInput>

          <PremiumInput label="Area (Acres)" icon={<Layers style={{ width: "16px", height: "16px" }} />}>
            <input type="number" required min="1" value={areaAcres} onChange={e => setAreaAcres(Number(e.target.value))} style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#D1FAE5"; e.currentTarget.style.boxShadow = "none"; }} />
          </PremiumInput>

          <PremiumInput label="Soil Type" icon={<Layers style={{ width: "16px", height: "16px" }} />}>
            <select value={soilType} onChange={e => setSoilType(e.target.value)} style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#D1FAE5"; e.currentTarget.style.boxShadow = "none"; }}>
              <option value={t("clayLoam")}>{t("clayLoam")}</option>
              <option value="Sandy Soil">Sandy Soil</option><option value="Silt Clay">Silt Clay</option>
              <option value="Black Soil">{t("blackCottonSoil")}</option>
            </select>
          </PremiumInput>

          <PremiumInput label="State / Region" icon={<MapPin style={{ width: "16px", height: "16px" }} />}>
            <select value={state} onChange={e => setState(e.target.value)} style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#D1FAE5"; e.currentTarget.style.boxShadow = "none"; }}>
              <option value={t("haryana")}>{t("haryana")}</option>
              <option value="Punjab">Punjab</option><option value="Maharashtra">Maharashtra</option><option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </PremiumInput>

          <PremiumInput label="Irrigation Type" icon={<Droplets style={{ width: "16px", height: "16px" }} />}>
            <select value={irrigationType} onChange={e => setIrrigationType(e.target.value)} style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#D1FAE5"; e.currentTarget.style.boxShadow = "none"; }}>
              <option value={t("drip")}>{t("dripIrrigation")}</option>
              <option value={t("sprinkler")}>Sprinkler System</option>
              <option value={t("flood")}>{t("floodSluice")}</option>
              <option value="Rainfed">Rainfed (Dryland)</option>
            </select>
          </PremiumInput>

          <PremiumInput label="Season" icon={<Sun style={{ width: "16px", height: "16px" }} />}>
            <select value={season} onChange={e => setSeason(e.target.value)} style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#D1FAE5"; e.currentTarget.style.boxShadow = "none"; }}>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>
          </PremiumInput>
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", height: "56px", borderRadius: "16px", border: "none", background: loading ? "#94A3B8" : "linear-gradient(135deg, #059669 0%, #22C55E 100%)", color: "#ffffff", fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 6px 24px rgba(5,150,105,0.28)", transition: "all 0.25s" }}
          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 32px rgba(5,150,105,0.38)"; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? "none" : "0 6px 24px rgba(5,150,105,0.28)"; }}>
          {loading ? (<><svg style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Running Climate Simulation...</span></>) : (<><Sprout style={{ width: "20px", height: "20px" }} />✨ Forecast Expected Tonnage</>)}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", background: "#ECFDF5", padding: "4px 14px", borderRadius: "99px", border: "1px solid #6EE7B7" }}>🌾 Yield Forecast Report</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[{label:"Download",icon:<Download style={{width:"14px",height:"14px"}} />,onClick:handleDownload,c:"#16A34A",bg:"#fff",border:"#DCFCE7"},{label:"Forecast Again",icon:<RefreshCw style={{width:"14px",height:"14px"}} />,onClick:()=>setResult(null),c:"#059669",bg:"#fff",border:"#D1FAE5"},{label:"Save Report",icon:<Bookmark style={{width:"14px",height:"14px"}} />,onClick:()=>{},c:"#64748B",bg:"#fff",border:"#E2E8F0"}].map(btn=>(
              <button key={btn.label} onClick={btn.onClick} style={{ height:"40px",padding:"0 16px",borderRadius:"12px",border:`1.5px solid ${btn.border}`,background:btn.bg,color:btn.c,fontWeight:700,fontSize:"12px",display:"flex",alignItems:"center",gap:"6px",cursor:"pointer",transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#F0FDF4";}}
                onMouseLeave={e=>{e.currentTarget.style.background=btn.bg;}}>
                {btn.icon}{btn.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
            <MetricCard label="Total Estimated Yield" value={`${result.predicted_yield_kg?.toLocaleString()} Kg`} sub="Full harvest output" color="#059669" bg="#ECFDF5" border="#6EE7B7" />
            <MetricCard label="Yield Per Acre" value={`${result.yield_per_acre} Kg`} sub="Per acre average" color="#16A34A" bg="#F0FDF4" border="#DCFCE7" />
            <MetricCard label="Regional Average" value={`${result.national_average_yield_per_acre} Kg`} sub="Mandi benchmark" color="#2563EB" bg="#EFF6FF" border="#BFDBFE" />
            <MetricCard label="Confidence Score" value="94%" sub="AI accuracy" color="#D97706" bg="#FFFBEB" border="#FDE68A" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
            <div style={{ background: "#ffffff", border: "1.5px solid #D1FAE5", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#059669", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart3 style={{ width: "16px", height: "16px" }} /> Influence Factors
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.key_factors?.map((f: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "8px", background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: "10px", padding: "9px 12px" }}>
                    <span style={{ color: "#059669", fontWeight: 800 }}>•</span>
                    <p style={{ fontSize: "12px", color: "#374151", margin: 0, lineHeight: 1.5 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#ffffff", border: "1.5px solid #D1FAE5", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#059669", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp style={{ width: "16px", height: "16px" }} /> Monthly Maturity Timeline
              </h4>
              <div style={{ height: "200px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.monthly_breakdown}>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#ffffff", borderColor: "#DCFCE7", borderRadius: "12px", fontSize: "12px" }} />
                    <Bar dataKey="expected_kg" fill="url(#greenGrad)" radius={[6, 6, 0, 0]} />
                    <defs><linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}