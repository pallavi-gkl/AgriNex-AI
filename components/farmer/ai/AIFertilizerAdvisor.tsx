"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { Compass, AlertTriangle, Sparkles, Download, RefreshCw, Bookmark, ShieldCheck, Thermometer, Database } from "lucide-react";

interface Props { onComplete?: (data: any, cropName: string) => void; }

function SliderInput({ label, value, max, target, color, onChange }: { label: string; value: number; max: number; target: string; color: string; onChange: (v: number) => void }) {
  return (
    <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "14px 18px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, fontFamily: "monospace", marginBottom: "8px" }}>
        <span style={{ color }}>{label}: {value}%</span>
        <span style={{ color: "#94A3B8" }}>Target: {target}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: color,
          height: "6px",
          background: "#F1F5F9",
          borderRadius: "99px",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", height: "48px",
  background: "#ffffff", border: "1.5px solid #CCFBF1", borderRadius: "14px",
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
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#0D9488", pointerEvents: "none", display: "flex" }}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

export default function AIFertilizerAdvisor({ onComplete }: Props = {}) {
  const { t } = useTranslation("farmer");
  const [cropType, setCropType] = useState("Basmati Rice");
  const [soilN, setSoilN] = useState(45);
  const [soilP, setSoilP] = useState(30);
  const [soilK, setSoilK] = useState(65);
  const [soilPh, setSoilPh] = useState(6.8);
  const [areaAcres, setAreaAcres] = useState(10);
  const [growthStage, setGrowthStage] = useState("Vegetative");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/fertilizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropType, soilN, soilP, soilK, soilPh, areaAcres, growthStage }),
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
    const a = document.createElement("a"); a.href = url; a.download = `AgriNex_Fertilizer_Plan_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 50%, #F0FDFA 100%)", border: "1.5px solid #99F6E4", borderRadius: "20px", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #0D9488, #14B8A6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(13,148,136,0.30)" }}>
              <Compass style={{ width: "26px", height: "26px", color: "#ffffff" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{t("fertilizerAdvisorTitle")}</h2>
              </div>
              <p style={{ fontSize: "13px", color: "#0F766E", margin: 0, fontWeight: 500 }}>🟢 Powered by Gemini AI &nbsp;·&nbsp; <span style={{ fontWeight: 700 }}>96% Accuracy</span> &nbsp;·&nbsp; Avg Time: 12 sec</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[{l:"NPK Analysis",c:"#0D9488",bg:"#CCFBF1",b:"#99F6E4"},{l:"Soil pH Balance",c:"#2563EB",bg:"#DBEAFE",b:"#BFDBFE"},{l:"Bio Alternatives",c:"#059669",bg:"#D1FAE5",b:"#6EE7B7"}].map(p=>(
              <span key={p.l} style={{ fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px", background: p.bg, color: p.c, border: `1px solid ${p.b}` }}>{p.l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleRecommend} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* NPK Sliders */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", padding: "20px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "18px" }}>
          <SliderInput label="Nitrogen (N)" value={soilN} max={100} target="60%" color="#EF4444" onChange={setSoilN} />
          <SliderInput label="Phosphorus (P)" value={soilP} max={100} target="45%" color="#F59E0B" onChange={setSoilP} />
          <SliderInput label="Potassium (K)" value={soilK} max={100} target="70%" color="#3B82F6" onChange={setSoilK} />
        </div>

        {/* Inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          <PremiumInput label={`Soil pH (${soilPh})`} icon={<Thermometer style={{ width: "16px", height: "16px" }} />}>
            <input type="number" step="0.1" min="4" max="10" value={soilPh} onChange={e => setSoilPh(Number(e.target.value))} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#0D9488";e.currentTarget.style.boxShadow="0 0 0 3px rgba(13,148,136,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#CCFBF1";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Crop Variety" icon={<Database style={{ width: "16px", height: "16px" }} />}>
            <select value={cropType} onChange={e => setCropType(e.target.value)} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#0D9488";e.currentTarget.style.boxShadow="0 0 0 3px rgba(13,148,136,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#CCFBF1";e.currentTarget.style.boxShadow="none";}}>
              <option value={t("basmatiRiceTitle")}>{t("basmatiRiceTitle")}</option>
              <option value="Wheat">Wheat</option>
              <option value="Turmeric">Turmeric</option>
              <option value="Tomato">Tomato</option>
            </select>
          </PremiumInput>

          <PremiumInput label="Acreage Area" icon={<Database style={{ width: "16px", height: "16px" }} />}>
            <input type="number" required min="1" value={areaAcres} onChange={e => setAreaAcres(Number(e.target.value))} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#0D9488";e.currentTarget.style.boxShadow="0 0 0 3px rgba(13,148,136,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#CCFBF1";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Growth Stage" icon={<Compass style={{ width: "16px", height: "16px" }} />}>
            <select value={growthStage} onChange={e => setGrowthStage(e.target.value)} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#0D9488";e.currentTarget.style.boxShadow="0 0 0 3px rgba(13,148,136,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#CCFBF1";e.currentTarget.style.boxShadow="none";}}>
              <option value="Vegetative">Vegetative Growth</option>
              <option value="Tillering">Tillering Stage</option>
              <option value="Panicle Initiation">Panicle Initiation</option>
              <option value="Flowering">{t("floweringStage")}</option>
            </select>
          </PremiumInput>
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", height: "56px", borderRadius: "16px", border: "none", background: loading ? "#94A3B8" : "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)", color: "#ffffff", fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 6px 24px rgba(13,148,136,0.28)", transition: "all 0.25s" }}
          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 32px rgba(13,148,136,0.38)"; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? "none" : "0 6px 24px rgba(13,148,136,0.28)"; }}>
          {loading ? (<><svg style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>{t("computingNutrientBalanceAlgori")}</span></>) : (<><Compass style={{ width: "20px", height: "20px" }} />🌿 Generate Fertilizer Plan</>)}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0D9488", textTransform: "uppercase", letterSpacing: "0.08em", background: "#F0FDFA", padding: "4px 14px", borderRadius: "99px", border: "1px solid #99F6E4" }}>🌿 Fertilizer Prescription Plan</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[{label:"Download Plan",icon:<Download style={{width:"14px",height:"14px"}} />,onClick:handleDownload,c:"#0D9488",bg:"#fff",border:"#99F6E4"},{label:"Recalculate",icon:<RefreshCw style={{width:"14px",height:"14px"}} />,onClick:()=>setResult(null),c:"#059669",bg:"#fff",border:"#DCFCE7"},{label:"Save Report",icon:<Bookmark style={{width:"14px",height:"14px"}} />,onClick:()=>{},c:"#64748B",bg:"#fff",border:"#E2E8F0"}].map(btn=>(
              <button key={btn.label} onClick={btn.onClick} style={{ height:"40px",padding:"0 16px",borderRadius:"12px",border:`1.5px solid ${btn.border}`,background:btn.bg,color:btn.c,fontWeight:700,fontSize:"12px",display:"flex",alignItems:"center",gap:"6px",cursor:"pointer",transition:"all 0.15s" }}>{btn.icon}{btn.label}</button>
            ))}
          </div>

          {/* Schedule Table */}
          <div style={{ background: "#ffffff", border: "1.5px solid #CCFBF1", borderRadius: "20px", padding: "24px 26px", boxShadow: "0 4px 16px rgba(13,148,136,0.04)", overflowX: "auto" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F766E", margin: "0 0 16px" }}>Prescribed Fertilizer Schedule</h4>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#64748B", borderBottom: "1.5px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 8px", fontWeight: 700 }}>{t("fertilizerName")}</th>
                  <th style={{ padding: "12px 8px", fontWeight: 700 }}>{t("dosageAcre")}</th>
                  <th style={{ padding: "12px 8px", fontWeight: 700 }}>{t("applicationTiming")}</th>
                  <th style={{ padding: "12px 8px", fontWeight: 700 }}>Method</th>
                </tr>
              </thead>
              <tbody>
                {result.recommendations?.map((rec: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 8px", fontWeight: 700, color: "#1F2937" }}>{rec.fertilizer_name}</td>
                    <td style={{ padding: "14px 8px", fontWeight: 800, color: "#0D9488" }}>{rec.quantity_kg_per_acre} Kg</td>
                    <td style={{ padding: "14px 8px", color: "#475569" }}>{rec.timing}</td>
                    <td style={{ padding: "14px 8px", color: "#64748B" }}>{rec.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cautions & Organic Alternatives */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: "16px", padding: "20px 22px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#D97706", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle style={{ width: "16px", height: "16px" }} /> Warnings &amp; Guidelines
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.cautions?.map((c: string, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#78350F" }}>
                    <span>•</span>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{c}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: "16px", padding: "20px 22px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#16A34A", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles style={{ width: "16px", height: "16px" }} /> Organic Bio-Alternatives
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.organic_alternatives?.map((o: string, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#14532D" }}>
                    <span>•</span>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{o}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Estimate */}
          <div style={{ background: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)", border: "1.5px solid #99F6E4", borderRadius: "16px", padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F766E", margin: "0 0 4px" }}>{t("estimatedAggregateProcurementC")}</h4>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>{t("estimatedWholesalePricingIndex")}</p>
            </div>
            <span style={{ fontSize: "28px", fontWeight: 900, color: "#0D9488", fontFamily: "monospace" }}>₹{result.total_cost_estimate?.toLocaleString("en-IN")}</span>
          </div>

        </div>
      )}
    </div>
  );
}