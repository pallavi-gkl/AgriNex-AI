"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { TrendingUp, User, DollarSign, List, Download, RefreshCw, Bookmark, MapPin, ShoppingCart, IndianRupee, BarChart2, ArrowUpRight, ChevronRight } from "lucide-react";

interface Props { onComplete?: (data: any, cropName: string) => void; }

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", height: "48px",
  background: "#ffffff", border: "1.5px solid #BFDBFE",
  borderRadius: "14px", paddingLeft: "42px", paddingRight: "14px",
  fontSize: "14px", fontWeight: 500, color: "#1F2937",
  outline: "none", appearance: "none", WebkitAppearance: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function PremiumInput({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#2563EB", pointerEvents: "none", display: "flex" }}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

export default function AIMarketAdvisor({ onComplete }: Props = {}) {
  const { t } = useTranslation("farmer");
  const [cropType, setCropType] = useState("Basmati Rice");
  const [currentPrice, setCurrentPrice] = useState(85);
  const [quantity, setQuantity] = useState(4200);
  const [location, setLocation] = useState("Karnal, Haryana");
  const [targetMarket, setTargetMarket] = useState("APMC Mandi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/market-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropType, currentPrice, quantity, location, targetMarket }),
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
    const a = document.createElement("a"); a.href = url; a.download = `AgriNex_Market_Report_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const trendColor = result?.market_trend?.toLowerCase().includes("bull") ? "#16A34A" : result?.market_trend?.toLowerCase().includes("bear") ? "#DC2626" : "#D97706";
  const trendBg = result?.market_trend?.toLowerCase().includes("bull") ? "#DCFCE7" : result?.market_trend?.toLowerCase().includes("bear") ? "#FEE2E2" : "#FEF3C7";
  const trendBorder = result?.market_trend?.toLowerCase().includes("bull") ? "#86EFAC" : result?.market_trend?.toLowerCase().includes("bear") ? "#FECACA" : "#FDE68A";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)", border: "1.5px solid #BFDBFE", borderRadius: "20px", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #2563EB, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(37,99,235,0.30)" }}>
              <TrendingUp style={{ width: "26px", height: "26px", color: "#ffffff" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{t("mandiMarketAdvisor")}</h2>
              </div>
              <p style={{ fontSize: "13px", color: "#1D4ED8", margin: 0, fontWeight: 500 }}>🟢 Powered by Gemini AI &nbsp;·&nbsp; <span style={{ fontWeight: 700 }}>92% Accuracy</span> &nbsp;·&nbsp; Avg Time: 8 sec</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[{l:"Smart Pricing",c:"#2563EB",bg:"#DBEAFE",b:"#BFDBFE"},{l:"Buyer Discovery",c:"#059669",bg:"#D1FAE5",b:"#6EE7B7"},{l:"Market Trends",c:"#D97706",bg:"#FEF3C7",b:"#FDE68A"}].map(p=>(
              <span key={p.l} style={{ fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px", background: p.bg, color: p.c, border: `1px solid ${p.b}` }}>{p.l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleConsult} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          <PremiumInput label="Crop Variety" icon={<ShoppingCart style={{ width: "16px", height: "16px" }} />}>
            <select value={cropType} onChange={e => setCropType(e.target.value)} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#2563EB";e.currentTarget.style.boxShadow="0 0 0 3px rgba(37,99,235,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#BFDBFE";e.currentTarget.style.boxShadow="none";}}>
              <option value={t("basmatiRiceTitle")}>{t("basmatiRiceTitle")}</option>
              <option value={t("alphonsoMangoTitle")}>{t("alphonsoMangoTitle")}</option>
              <option value="Turmeric Finger">Turmeric Finger</option>
              <option value="Organic Spinach">Organic Spinach</option>
            </select>
          </PremiumInput>

          <PremiumInput label="Spot Price (₹/Kg)" icon={<IndianRupee style={{ width: "16px", height: "16px" }} />}>
            <input type="number" required value={currentPrice} onChange={e => setCurrentPrice(Number(e.target.value))} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#2563EB";e.currentTarget.style.boxShadow="0 0 0 3px rgba(37,99,235,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#BFDBFE";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Supply Volume (Kg)" icon={<BarChart2 style={{ width: "16px", height: "16px" }} />}>
            <input type="number" required value={quantity} onChange={e => setQuantity(Number(e.target.value))} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#2563EB";e.currentTarget.style.boxShadow="0 0 0 3px rgba(37,99,235,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#BFDBFE";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Storage Location" icon={<MapPin style={{ width: "16px", height: "16px" }} />}>
            <input type="text" required value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} placeholder="e.g. Karnal, Haryana"
              onFocus={e=>{e.currentTarget.style.borderColor="#2563EB";e.currentTarget.style.boxShadow="0 0 0 3px rgba(37,99,235,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#BFDBFE";e.currentTarget.style.boxShadow="none";}} />
          </PremiumInput>

          <PremiumInput label="Target Market" icon={<User style={{ width: "16px", height: "16px" }} />}>
            <select value={targetMarket} onChange={e => setTargetMarket(e.target.value)} style={inputStyle}
              onFocus={e=>{e.currentTarget.style.borderColor="#2563EB";e.currentTarget.style.boxShadow="0 0 0 3px rgba(37,99,235,0.10)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#BFDBFE";e.currentTarget.style.boxShadow="none";}}>
              <option value={t("apmcMandi")}>{t("apmcMandiYard")}</option>
              <option value="Export Sourcing">{t("exportHouses")}</option>
              <option value="Retail Contract">Retail Aggregators</option>
              <option value="Direct Consumer">{t("directConsumerMarket")}</option>
            </select>
          </PremiumInput>
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", height: "56px", borderRadius: "16px", border: "none", background: loading ? "#94A3B8" : "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", color: "#ffffff", fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 6px 24px rgba(37,99,235,0.28)", transition: "all 0.25s" }}
          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 32px rgba(37,99,235,0.38)"; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? "none" : "0 6px 24px rgba(37,99,235,0.28)"; }}>
          {loading ? (<><svg style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>{t("fetchingMandisOrderBooksAndInd")}</span></>) : (<><TrendingUp style={{ width: "20px", height: "20px" }} />💰 Predict Best Market Price</>)}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.08em", background: "#EFF6FF", padding: "4px 14px", borderRadius: "99px", border: "1px solid #BFDBFE" }}>📈 Market Intelligence Report</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[{label:"Download",icon:<Download style={{width:"14px",height:"14px"}} />,onClick:handleDownload,c:"#2563EB",bg:"#fff",border:"#BFDBFE"},{label:"New Analysis",icon:<RefreshCw style={{width:"14px",height:"14px"}} />,onClick:()=>setResult(null),c:"#059669",bg:"#fff",border:"#DCFCE7"},{label:"Save Report",icon:<Bookmark style={{width:"14px",height:"14px"}} />,onClick:()=>{},c:"#64748B",bg:"#fff",border:"#E2E8F0"}].map(btn=>(
              <button key={btn.label} onClick={btn.onClick} style={{ height:"40px",padding:"0 16px",borderRadius:"12px",border:`1.5px solid ${btn.border}`,background:btn.bg,color:btn.c,fontWeight:700,fontSize:"12px",display:"flex",alignItems:"center",gap:"6px",cursor:"pointer",transition:"all 0.15s" }}>{btn.icon}{btn.label}</button>
            ))}
          </div>

          {/* Market Trend Badge + Recommended Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: trendBg, border: `1.5px solid ${trendBorder}`, borderRadius: "16px", padding: "20px 22px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Market Trend</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ArrowUpRight style={{ width: "20px", height: "20px", color: trendColor }} />
                <span style={{ fontSize: "20px", fontWeight: 900, color: trendColor }}>{result.market_trend}</span>
              </div>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "8px 0 0", lineHeight: 1.5 }}>{result.demand_forecast}</p>
            </div>
            <div style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: "16px", padding: "20px 22px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>AI Recommended Price</p>
              <p style={{ fontSize: "32px", fontWeight: 900, color: "#16A34A", margin: 0, fontFamily: "monospace" }}>₹{result.recommended_price}</p>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0" }}>per Kg</p>
            </div>
          </div>

          {/* Buyers + Tips */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#ffffff", border: "1.5px solid #BFDBFE", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#2563EB", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <User style={{ width: "16px", height: "16px" }} /> Premium Buyers
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.best_buyers?.map((b: any, i: number) => (
                  <div key={i} style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", margin: "0 0 6px" }}>{b.type}</p>
                      <span style={{ fontSize: "13px", fontWeight: 900, color: "#16A34A", fontFamily: "monospace" }}>₹{b.expected_price}/Kg</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {b.pros?.map((p: string, pi: number) => (
                        <span key={pi} style={{ fontSize: "10px", fontWeight: 600, background: "#DBEAFE", color: "#1D4ED8", padding: "2px 8px", borderRadius: "6px" }}>{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#ffffff", border: "1.5px solid #DCFCE7", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#059669", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <List style={{ width: "16px", height: "16px" }} /> {t("aiNegotiationRecommendations")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.negotiation_tips?.map((tip: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "10px", background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: "10px", padding: "10px 12px" }}>
                    <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: "linear-gradient(135deg,#22C55E,#16A34A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{i + 1}</span>
                    <p style={{ fontSize: "12px", color: "#374151", margin: 0, lineHeight: 1.5 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profit estimate */}
          <div style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)", border: "1.5px solid #86EFAC", borderRadius: "16px", padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#15803D", margin: "0 0 4px" }}>{t("estimatedCropRevenueImpact")}</h4>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>{t("basedOnRecommendedListingPrice")}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Total Net Impact</span>
              <span style={{ fontSize: "28px", fontWeight: 900, color: "#16A34A", fontFamily: "monospace" }}>₹{result.profit_estimate?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}