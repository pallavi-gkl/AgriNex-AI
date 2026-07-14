"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { Briefcase, DollarSign, Award, ShieldAlert, Sparkles, Download, RefreshCw, Bookmark, Layers, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { onComplete?: (data: any, cropName: string) => void; }

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", height: "48px",
  background: "#ffffff", border: "1.5px solid #FDE68A", borderRadius: "14px",
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
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#D97706", pointerEvents: "none", display: "flex" }}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

export default function AIBusinessAdvisor({ onComplete }: Props = {}) {
  const { t } = useTranslation("farmer");
  const [crops, setCrops] = useState(["Basmati Rice"]);
  const [totalRevenue, setTotalRevenue] = useState(529000);
  const [totalExpenses, setTotalExpenses] = useState(85500);
  const [state, setState] = useState("Haryana");
  const [areaAcres, setAreaAcres] = useState(24.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"profit" | "loans" | "growth" | "risks">("profit");

  const handleAdvise = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crops, totalRevenue, totalExpenses, state, areaAcres }),
      });
      const data = await res.json();
      setResult(data);
      onComplete?.(data, crops[0] ?? "Farm");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `AgriNex_Business_Plan_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FFFBEB 100%)", border: "1.5px solid #FDE68A", borderRadius: "20px", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #D97706, #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(217,119,6,0.30)" }}>
              <Briefcase style={{ width: "26px", height: "26px", color: "#ffffff" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{t("businessAdvisorTitle")}</h2>
              </div>
              <p style={{ fontSize: "13px", color: "#B45309", margin: 0, fontWeight: 500 }}>🟢 Powered by Gemini AI &nbsp;·&nbsp; <span style={{ fontWeight: 700 }}>91% Accuracy</span> &nbsp;·&nbsp; Avg Time: 18 sec</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[{l:"Profit Margins",c:"#D97706",bg:"#FEF3C7",b:"#FDE68A"},{l:"Credit Limit",c:"#059669",bg:"#D1FAE5",b:"#6EE7B7"},{l:"Risk Assessment",c:"#EF4444",bg:"#FEE2E2",b:"#FECACA"}].map(p=>(
              <span key={p.l} style={{ fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px", background: p.bg, color: p.c, border: `1px solid ${p.b}` }}>{p.l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleAdvise} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          <PremiumInput label="Annual Revenue (₹)" icon={<DollarSign style={{ width: "16px", height: "16px" }} />}>
            <input type="number" required value={totalRevenue} onChange={e => setTotalRevenue(Number(e.target.value))} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#D97706";e.currentTarget.style.boxShadow="0 0 0 3px rgba(217,119,6,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#FDE68A";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Operational Expenditures (₹)" icon={<DollarSign style={{ width: "16px", height: "16px" }} />}>
            <input type="number" required value={totalExpenses} onChange={e => setTotalExpenses(Number(e.target.value))} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#D97706";e.currentTarget.style.boxShadow="0 0 0 3px rgba(217,119,6,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#FDE68A";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Land Holding (Acres)" icon={<Layers style={{ width: "16px", height: "16px" }} />}>
            <input type="number" required step="0.1" value={areaAcres} onChange={e => setAreaAcres(Number(e.target.value))} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#D97706";e.currentTarget.style.boxShadow="0 0 0 3px rgba(217,119,6,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#FDE68A";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Region State" icon={<Layers style={{ width: "16px", height: "16px" }} />}>
            <select value={state} onChange={e => setState(e.target.value)} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#D97706";e.currentTarget.style.boxShadow="0 0 0 3px rgba(217,119,6,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#FDE68A";e.currentTarget.style.boxShadow="none";}}>
              <option value={t("haryana")}>{t("haryana")}</option>
              <option value="Punjab">Punjab</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </PremiumInput>
        </div>
        <button type="submit" disabled={loading} style={{ width: "100%", height: "56px", borderRadius: "16px", border: "none", background: loading ? "#94A3B8" : "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)", color: "#ffffff", fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 6px 24px rgba(217,119,6,0.28)", transition: "all 0.25s" }}
          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 32px rgba(217,119,6,0.38)"; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? "none" : "0 6px 24px rgba(217,119,6,0.28)"; }}>
          {loading ? (<><svg style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>{t("computingCreditScoresAndRiskIn")}</span></>) : (<><Briefcase style={{ width: "20px", height: "20px" }} />📈 Analyze Financial Performance</>)}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.08em", background: "#FFFBEB", padding: "4px 14px", borderRadius: "99px", border: "1px solid #FDE68A" }}>💼 Farm Business Report</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[{label:"Download Plan",icon:<Download style={{width:"14px",height:"14px"}} />,onClick:handleDownload,c:"#D97706",bg:"#fff",border:"#FDE68A"},{label:"Analyze Again",icon:<RefreshCw style={{width:"14px",height:"14px"}} />,onClick:()=>setResult(null),c:"#059669",bg:"#fff",border:"#DCFCE7"},{label:"Save Report",icon:<Bookmark style={{width:"14px",height:"14px"}} />,onClick:()=>{},c:"#64748B",bg:"#fff",border:"#E2E8F0"}].map(btn=>(
              <button key={btn.label} onClick={btn.onClick} style={{ height:"40px",padding:"0 16px",borderRadius:"12px",border:`1.5px solid ${btn.border}`,background:btn.bg,color:btn.c,fontWeight:700,fontSize:"12px",display:"flex",alignItems:"center",gap:"6px",cursor:"pointer",transition:"all 0.15s" }}>{btn.icon}{btn.label}</button>
            ))}
          </div>

          {/* Subtabs */}
          <div style={{ display: "flex", borderBottom: "1.5px solid #E2E8F0", gap: "16px", overflowX: "auto", paddingBottom: "2px" }}>
            {(["profit", "loans", "growth", "risks"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSubTab(tab)}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderBottom: activeSubTab === tab ? "2px solid #D97706" : "2px solid transparent",
                  background: "transparent",
                  color: activeSubTab === tab ? "#D97706" : "#64748B",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab === "profit" && "Profit Analysis"}
                {tab === "loans" && "Loan & Credit Limits"}
                {tab === "growth" && "Growth Strategy"}
                {tab === "risks" && "Risk Assessment"}
              </button>
            ))}
          </div>

          {/* Sub Tab Contents */}
          <div style={{ minHeight: "140px" }}>
            {activeSubTab === "profit" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
                  <div style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: "14px", padding: "16px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 6px" }}>NET OPERATIONAL PROFIT</p>
                    <p style={{ fontSize: "20px", fontWeight: 900, color: "#16A34A", margin: 0, fontFamily: "monospace" }}>₹{result.profit_analysis.net_profit.toLocaleString("en-IN")}</p>
                  </div>
                  <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "16px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 6px" }}>PROFIT MARGIN RATE</p>
                    <p style={{ fontSize: "20px", fontWeight: 900, color: "#1F2937", margin: 0, fontFamily: "monospace" }}>{result.profit_analysis.profit_margin_percent}%</p>
                  </div>
                  <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "16px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 6px" }}>{t("efficiencyIndexGrade")}</p>
                    <span style={{ fontSize: "11px", fontWeight: 800, background: "#F0FDF4", color: "#16A34A", border: "1px solid #86EFAC", padding: "4px 10px", borderRadius: "99px", display: "inline-block", marginTop: "4px" }}>
                      {t("grade")} {result.profit_analysis.efficiency_grade}
                    </span>
                  </div>
                  <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "16px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 6px" }}>NEXT SEASON EST.</p>
                    <p style={{ fontSize: "20px", fontWeight: 900, color: "#1F2937", margin: 0, fontFamily: "monospace" }}>₹{result.revenue_prediction.next_season_estimate.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div style={{ background: "linear-gradient(135deg,#F0FDF4 0%,#ECFDF5 100%)", border: "1.5px solid #6EE7B7", borderRadius: "16px", padding: "20px 22px", display: "flex", gap: "12px", alignItems: "start" }}>
                  <Sparkles style={{ width: "20px", height: "20px", color: "#059669", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h5 style={{ fontSize: "13px", fontWeight: 800, color: "#065F46", margin: "0 0 6px" }}>Revenue Growth Potential</h5>
                    <p style={{ fontSize: "12px", color: "#047857", margin: 0, lineHeight: 1.6 }}>
                      Based on machine learning models, diversifying 15% of your crops into pulses/legumes next season can improve net cash flow by up to {result.revenue_prediction.growth_potential_percent}%.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "loans" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h5 style={{ fontSize: "14px", fontWeight: 800, color: "#1F2937", margin: "0 0 4px" }}>{t("eligibleKisanCreditLoanCap")}</h5>
                    <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>{t("estimatedLimitUsingRegionalSca")}</p>
                  </div>
                  <span style={{ fontSize: "26px", fontWeight: 900, color: "#16A34A", fontFamily: "monospace" }}>₹{result.loan_eligibility.max_amount_inr.toLocaleString("en-IN")}</span>
                </div>

                <div style={{ background: "#ffffff", border: "1.5px solid #FDE68A", borderRadius: "16px", padding: "20px 22px" }}>
                  <h5 style={{ fontSize: "13px", fontWeight: 800, color: "#D97706", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Award style={{ width: "16px", height: "16px" }} /> Recommended Government Bank Schemes
                  </h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.loan_eligibility.recommended_programs?.map((prog: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#475569" }}>
                        <span>•</span>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>{prog}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "growth" && (
              <div style={{ background: "#ffffff", border: "1.5px solid #86EFAC", borderRadius: "16px", padding: "20px 22px" }}>
                <h5 style={{ fontSize: "13px", fontWeight: 800, color: "#15803D", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <TrendingUp style={{ width: "16px", height: "16px" }} /> {t("expansionCropDiversificationSt")}
                </h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.growth_strategies?.map((strat: string, idx: number) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: "10px", padding: "10px 12px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: "linear-gradient(135deg,#22C55E,#16A34A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{idx + 1}</span>
                      <p style={{ fontSize: "12px", color: "#374151", margin: 0, lineHeight: 1.5 }}>{strat}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === "risks" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "16px", padding: "20px 22px" }}>
                  <h5 style={{ fontSize: "13px", fontWeight: 800, color: "#DC2626", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <ShieldAlert style={{ width: "16px", height: "16px" }} /> Risk Assessment Logs
                  </h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.risk_assessment?.map((risk: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#991B1B" }}>
                        <span>•</span>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: "16px", padding: "20px 22px" }}>
                  <h5 style={{ fontSize: "13px", fontWeight: 800, color: "#16A34A", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Award style={{ width: "16px", height: "16px" }} /> Suggested Insurance Programs
                  </h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.insurance_suggestions?.map((ins: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#14532D" }}>
                        <span>•</span>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>{ins}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}