"use client";
import { useTranslation } from "@/hooks/useTranslation";
import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Sparkles,
  Download,
  Filter,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  MapPin,
  Award,
  ChevronRight,
  Compass,
  DollarSign,
  Info,
} from "lucide-react";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { DEMO_MARKET_PRICES } from "@/lib/demoData";
import { useRouter, useSearchParams } from "next/navigation";

// Category mapping helper
const cropCategoryMap: Record<string, string> = {
  "Basmati Rice": "Grains & Cereals",
  "Wheat (Sharbati)": "Grains & Cereals",
  "Alphonso Mango": "Fruits",
  "Turmeric Finger": "Spices & Herbs",
  "Onion": "Vegetables",
  "Potato": "Vegetables",
  "Tomato": "Vegetables",
  "Green Chilli": "Vegetables",
  "Cotton": "Fibers",
  "Soybean": "Oilseeds",
};

// Crop image helper to make crop details visually outstanding
const cropImageMap: Record<string, string> = {
  "Basmati Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
  "Wheat (Sharbati)": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
  "Alphonso Mango": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600",
  "Turmeric Finger": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
  "Onion": "https://images.unsplash.com/photo-1618243868665-1f6f1141798e?auto=format&fit=crop&q=80&w=600",
  "Potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600",
  "Tomato": "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600",
  "Green Chilli": "https://images.unsplash.com/photo-1567167690757-c8310f82c4cc?auto=format&fit=crop&q=80&w=600",
  "Cotton": "https://images.unsplash.com/photo-1594901357022-de9dbb18423f?auto=format&fit=crop&q=80&w=600",
  "Soybean": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600",
};

// Static 7-day price movement data for the chart
const CHART_DATA = [
  { day: "Mon", "Basmati Rice": 82, "Wheat": 22, "Alphonso Mango": 310 },
  { day: "Tue", "Basmati Rice": 84, "Wheat": 23, "Alphonso Mango": 320 },
  { day: "Wed", "Basmati Rice": 85, "Wheat": 22.5, "Alphonso Mango": 335 },
  { day: "Thu", "Basmati Rice": 87, "Wheat": 23.8, "Alphonso Mango": 330 },
  { day: "Fri", "Basmati Rice": 86.5, "Wheat": 24, "Alphonso Mango": 345 },
  { day: "Sat", "Basmati Rice": 88, "Wheat": 24.2, "Alphonso Mango": 350 },
  { day: "Sun", "Basmati Rice": 88, "Wheat": 24, "Alphonso Mango": 350 },
];

export default function MarketPricesPage() {
  const { t } = useTranslation("farmer");
  const { nearbyMandis, requestLocation, loading } = useLocationWeather();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCropId = searchParams.get("cropId");
  const showAiAnalysis = searchParams.get("aiAnalysis");
  const selectedMandiId = searchParams.get("mandiId");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mandiFilter, setMandiFilter] = useState("All");
  const [demandFilter, setDemandFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  // Fallback to demo market data if geolocation or nearby mandis are loading/empty
  const activeMarketData = useMemo(() => {
    return nearbyMandis.length > 0 ? nearbyMandis : DEMO_MARKET_PRICES;
  }, [nearbyMandis]);

  // Derive unique mandis list
  const mandisList = useMemo(() => {
    const set = new Set(activeMarketData.map((m) => m.mandi));
    return ["All", ...Array.from(set)];
  }, [activeMarketData]);

  // Derive unique categories list
  const categoriesList = useMemo(() => {
    const set = new Set(activeMarketData.map((m) => cropCategoryMap[m.crop] || "Other"));
    return ["All", ...Array.from(set)];
  }, [activeMarketData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    requestLocation();
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setRefreshing(false);
  };

  // Reset all filters in empty state
  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
    setMandiFilter("All");
    setDemandFilter("All");
    setSortBy("default");
  };

  // Filtered & Sorted Prices
  const processedPrices = useMemo(() => {
    return activeMarketData
      .filter((m) => {
        const matchesSearch =
          m.crop.toLowerCase().includes(search.toLowerCase()) ||
          m.mandi.toLowerCase().includes(search.toLowerCase());
        const matchesMandi = mandiFilter === "All" || m.mandi === mandiFilter;
        const matchesDemand = demandFilter === "All" || m.demand === demandFilter;
        const matchesCategory = category === "All" || (cropCategoryMap[m.crop] || "Other") === category;
        return matchesSearch && matchesMandi && matchesDemand && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "change-high") return b.change - a.change;
        if (sortBy === "change-low") return a.change - b.change;
        return 0;
      });
  }, [activeMarketData, search, mandiFilter, demandFilter, category, sortBy]);

  // KPI calculations
  const highestPriceToday = useMemo(() => {
    if (activeMarketData.length === 0) return { crop: "—", price: 0, mandi: "—" };
    return [...activeMarketData].sort((a, b) => b.price - a.price)[0];
  }, [activeMarketData]);

  const biggestGainer = useMemo(() => {
    if (activeMarketData.length === 0) return { crop: "—", change: 0, mandi: "—" };
    return [...activeMarketData].sort((a, b) => b.change - a.change)[0];
  }, [activeMarketData]);

  const highestDemand = useMemo(() => {
    if (activeMarketData.length === 0) return { crop: "—", demand: "—" };
    const priority = { very_high: 4, high: 3, medium: 2, low: 1 };
    return [...activeMarketData].sort((a, b) => (priority[b.demand] || 0) - (priority[a.demand] || 0))[0];
  }, [activeMarketData]);

  // Selected details targets
  const selectedCropDetails = useMemo(() => {
    if (!selectedCropId) return null;
    return activeMarketData.find((m) => m.crop === selectedCropId) || null;
  }, [activeMarketData, selectedCropId]);

  const selectedMandiDetails = useMemo(() => {
    if (!selectedMandiId) return null;
    const recommendations = [
      {
        mandi: "Sonepat APMC",
        crop: "Basmati Rice",
        margin: "₹88/Kg (Max Return)",
        confidence: "95% Confidence",
        reason: t("str_1SonepatApmcOffersBestBasm"),
        distance: "42 Km",
        fee: "1.5% Mandi Tax",
        facilities: ["Dry Warehouse", "Grain Dryer", "AI Assaying lab"],
        officer: "A. K. Sharma",
        phone: "+91 98765 43210"
      },
      {
        mandi: "Mumbai APMC Direct",
        crop: "Wheat (Sharbati)",
        margin: "₹24.2/Kg (+1.2% Peak)",
        confidence: "92% Confidence",
        reason: t("str_2MumbaiDirectTransportYiel"),
        distance: "1420 Km",
        fee: "2.0% Wholesale Fee",
        facilities: ["Cold Storage Chain", "Railhead access", "Electronic auctions"],
        officer: "R. S. Patil",
        phone: "+91 99887 76655"
      }
    ];
    return recommendations.find((r) => r.mandi === selectedMandiId) || null;
  }, [selectedMandiId, t]);

  // Real client-side CSV export trigger
  const handleExportCSV = () => {
    if (processedPrices.length === 0) return;
    const headers = ["Crop Variety", "APMC Mandi", "Price Index (INR)", "24h Shift (%)", "Expected Demand"];
    const rows = processedPrices.map((m) => [
      m.crop,
      m.mandi,
      m.price,
      m.change,
      m.demand.replace("_", " ").toUpperCase()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Market_Mandi_Prices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ───────────────────────────────────────────────────────────
      VIEW 1: MARKET CROP DETAILS VIEW (?cropId=XYZ)
     ─────────────────────────────────────────────────────────── */
  if (selectedCropDetails) {
    const crop = selectedCropDetails;
    const cropCategory = cropCategoryMap[crop.crop] || "General Commodities";
    const cropImage = cropImageMap[crop.crop] || "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600";
    
    // Filter other mandis for the same crop
    const otherMandis = activeMarketData.filter((m) => m.crop === crop.crop && m.mandi !== crop.mandi);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "48px" }}>
        <div>
          <button
            onClick={() => router.push("/farmer/market")}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "transparent", border: "none",
              color: "#22C55E", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", transition: "color 0.15s",
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#16A34A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#22C55E"; }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            ← Back to Mandi Intelligence
          </button>
        </div>

        <div style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "20px", display: "flex", flexDirection: "column",
          overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
        }} className="md:flex-row">
          
          {/* Left Panel: Media & Overview */}
          <div style={{ position: "relative", background: "#0F172A", display: "flex", flexDirection: "column" }} className="md:w-2/5">
            <img src={cropImage} alt={crop.crop} style={{ width: "100%", height: "260px", objectFit: "cover" }} className="md:h-full md:min-h-[420px]" />
            <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{
                background: "#22C55E", color: "#ffffff", fontSize: "11px",
                fontWeight: 700, padding: "4px 12px", borderRadius: "99px",
                display: "inline-flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 8px rgba(34,197,94,0.3)"
              }}>
                <Sparkles style={{ width: "12px", height: "12px" }} />
                AI Price Verified
              </span>
            </div>
            <div style={{
              position: "absolute", bottom: "16px", left: "16px", right: "16px",
              background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)", padding: "14px", borderRadius: "16px"
            }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#22C55E", textTransform: "uppercase", margin: 0 }}>PRIMARY APMC NODE</p>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", margin: "4px 0 0" }}>{crop.mandi}</h3>
              <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "4px 0 0" }}>Daily Index Rate: ₹{crop.price}/{crop.unit}</p>
            </div>
          </div>

          {/* Right Panel: Deep Analytics */}
          <div style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#22C55E", letterSpacing: "0.06em" }}>
                {cropCategory}
              </span>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1F2937", margin: "4px 0 0" }}>
                {crop.crop} Market Index Details
              </h2>
            </div>

            {/* Current Metrics Box */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "12px 14px", borderRadius: "12px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: 0 }}>CURRENT APMC PRICE</p>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#22C55E", marginTop: "4px", margin: "4px 0 0" }}>₹{crop.price}/{crop.unit}</p>
              </div>
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "12px 14px", borderRadius: "12px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: 0 }}>24H PRICE INDEX SHIFT</p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "2px", marginTop: "4px",
                  fontSize: "13px", fontWeight: 700, color: crop.change > 0 ? "#22C55E" : "#EF4444"
                }}>
                  {crop.change > 0 ? <ArrowUpRight style={{ width: "14px", height: "14px" }} /> : <ArrowDownRight style={{ width: "14px", height: "14px" }} />}
                  {Math.abs(crop.change)}%
                </span>
              </div>
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "12px 14px", borderRadius: "12px" }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: 0 }}>MARKET DEMAND LEVEL</p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", marginTop: "4px", margin: "4px 0 0", textTransform: "capitalize" }}>
                  {crop.demand.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Price Trend Chart preview */}
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", margin: "0 0 12px" }}>7-Day Price Movement</h3>
              <div style={{ height: "140px", width: "100%", background: "#F9FAFB", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "12px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} width={28} />
                    <Line type="monotone" dataKey="Basmati Rice" stroke="#22C55E" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Other APMC Prices comparative index */}
            {otherMandis.length > 0 && (
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", margin: "0 0 8px" }}>Other Regional APMC Rates</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {otherMandis.map((om, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "12px" }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>{om.mandi}</span>
                      <span style={{ fontWeight: 700, color: "#22C55E" }}>₹{om.price}/{om.unit} ({om.change > 0 ? "+" : ""}{om.change}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Advisor Logistics & Transport suggestions */}
            <div style={{ display: "flex", gap: "12px", borderTop: "1px solid #F3F4F6", paddingTop: "20px" }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 4px" }}>LOGISTICS & ROAD FREIGHT SUGGESTION</h4>
                <p style={{ fontSize: "13px", color: "#4B5563", margin: 0, lineHeight: 1.4 }}>
                  Transport via NH highway recommended. High baseline warehouse drying availability in {crop.mandi} guarantees low cargo moisture risks.
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", margin: "0 0 4px" }}>AI FARMER RECOMMENDATION</h4>
                <p style={{ fontSize: "13px", color: "#4B5563", margin: 0, lineHeight: 1.4 }}>
                  Hold inventory listings for another 48 hours. Regional APMC supply volume indices indicate a rising price window peak.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  }

  /* ───────────────────────────────────────────────────────────
      VIEW 2: AI SALES TIMING ANALYSIS VIEW (?aiAnalysis=true)
     ─────────────────────────────────────────────────────────── */
  if (showAiAnalysis) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "48px" }}>
        <div>
          <button
            onClick={() => router.push("/farmer/market")}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "transparent", border: "none",
              color: "#22C55E", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", transition: "color 0.15s",
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#16A34A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#22C55E"; }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            ← Back to Mandi Intelligence
          </button>
        </div>

        <div style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "20px", padding: "32px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
          display: "flex", flexDirection: "column", gap: "24px"
        }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1F2937", display: "flex", alignItems: "center", gap: "8px", margin: 0, fontFamily: "Inter, sans-serif" }}>
              <span style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
                display: "inline-flex", alignItems: "center", justifyContent: "center"
              }}>
                <Sparkles style={{ width: "16px", height: "16px", color: "#ffffff" }} />
              </span>
              Detailed AI Sales Timing Advisor Ledger
            </h2>
            <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
              Advanced predictive price analysis generated from APMC volume indices and historical mandi logs.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 md:grid-cols-2">
            
            {/* Parameters list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: "0 0 4px" }}>Advisory Parameters</h3>
              {[
                { label: "Price Trend Model", val: "BULLISH / RISING INDEX", color: "#22C55E" },
                { label: "AI Prediction Confidence", val: "94.2% Accuracy Rating", color: "#2563EB" },
                { label: "Optimal Sale Window", val: "Next 5 Business Days", color: "#1F2937" },
                { label: "Regional Surplus Index", val: "Deficit (Supportive of Price Hike)", color: "#EF4444" },
                { label: "Est. Expected Net Return Increase", val: "₹12.50 per Kilogram", color: "#22C55E" }
              ].map((param) => (
                <div key={param.label} style={{
                  padding: "14px 16px", background: "#F9FAFB", border: "1px solid #E5E7EB",
                  borderRadius: "12px", display: "flex", justifyContent: "space-between", fontSize: "13px"
                }}>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>{param.label}</span>
                  <span style={{ fontWeight: 700, color: param.color }}>{param.val}</span>
                </div>
              ))}
            </div>

            {/* Analysis details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#F7FCF7", border: "1px solid #DCEFD9", padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2E7D32", margin: 0 }}>System Advisory Decision Log</h3>
              <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, margin: 0 }}>
                Wholesale Basmati supply metrics show a strong contraction of arrivals at Karnal APMC. Concurrently, national retail ledgers exhibit steady baseline demand. 
              </p>
              <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, margin: 0 }}>
                Our neural models recommend listing active inventories gradually. Set high reserve bids on the marketplace during the Wednesday trading window to capture maximal margins.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "10px 14px", border: "1px solid #DCEFD9", borderRadius: "10px", marginTop: "8px" }}>
                <CheckCircle style={{ width: "16px", height: "16px", color: "#2E7D32", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#2E7D32" }}>Logistics pipeline cleared for immediate listing.</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  }

  /* ───────────────────────────────────────────────────────────
      VIEW 3: RECOMMENDED MANDI DETAILS VIEW (?mandiId=XYZ)
     ─────────────────────────────────────────────────────────── */
  if (selectedMandiDetails) {
    const rec = selectedMandiDetails;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "48px" }}>
        <div>
          <button
            onClick={() => router.push("/farmer/market")}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "transparent", border: "none",
              color: "#22C55E", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", transition: "color 0.15s",
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#16A34A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#22C55E"; }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            ← Back to Mandi Intelligence
          </button>
        </div>

        <div style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "20px", padding: "32px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
          display: "flex", flexDirection: "column", gap: "24px"
        }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#2563EB", background: "#EFF6FF", padding: "3px 9px", borderRadius: "99px", border: "1px solid #BFDBFE" }}>
                {rec.crop} match
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1F2937", margin: "8px 0 0" }}>
                {rec.mandi} Nodes Overview
              </h2>
            </div>
            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "10px 18px", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", margin: 0 }}>EXPECTED MARGIN</p>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#22C55E", margin: "2px 0 0" }}>{rec.margin}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 md:grid-cols-2">
            
            {/* logistics parameters */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: "0 0 4px" }}>APMC Logistics Metrics</h3>
              {[
                { label: "Logistics Distance", val: rec.distance },
                { label: "Mandi Tax / Fee structure", val: rec.fee },
                { label: "AI Recommendation score", val: rec.confidence },
                { label: "Primary APMC Officer", val: rec.officer },
                { label: "Official Support Contact", val: rec.phone }
              ].map((log) => (
                <div key={log.label} style={{
                  padding: "14px 16px", background: "#F9FAFB", border: "1px solid #E5E7EB",
                  borderRadius: "12px", display: "flex", justifyContent: "space-between", fontSize: "13px"
                }}>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>{log.label}</span>
                  <span style={{ fontWeight: 700, color: "#1F2937" }}>{log.val}</span>
                </div>
              ))}
            </div>

            {/* facilities listing */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#F7FCF7", border: "1px solid #DCEFD9", padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2E7D32", margin: 0 }}>Available On-Site APMC Facilities</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {rec.facilities.map((fac, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "10px 14px", border: "1px solid #DCEFD9", borderRadius: "10px" }}>
                    <CheckCircle style={{ width: "16px", height: "16px", color: "#2E7D32", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{fac}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "8px 0 0", lineHeight: 1.4 }}>
                Reasoning: {rec.reason}
              </p>
            </div>

          </div>
        </div>

      </div>
    );
  }

  /* ───────────────────────────────────────────────────────────
      MAIN INDEX DASHBOARD VIEW (No params)
     ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px" }}>

      {/* 1. PREMIUM HEADER HERO SECTION */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 70%, #F8FAFC 100%)",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "28px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "#22C55E",
              background: "#DCFCE7", border: "1px solid #BBF7D0",
              padding: "3px 10px", borderRadius: "99px",
              display: "flex", alignItems: "center", gap: "4px"
            }}>
              <span style={{ width: "6px", height: "6px", background: "#22C55E", borderRadius: "50%", display: "inline-block" }} />
              Live Connected
            </span>
          </div>
          <h1 style={{
            fontSize: "26px", fontWeight: 800, color: "#1F2937",
            letterSpacing: "-0.5px", margin: 0, fontFamily: "Inter, sans-serif"
          }}>
            📈 Live Market Mandi Intelligence
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", fontWeight: 500, marginTop: "4px" }}>
            Real-time AI-powered wholesale pricing across regional APMC mandis synchronized with national market data.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: "11px", color: "#64748B" }}>
            <p style={{ margin: 0, fontWeight: 700 }}>LAST UPDATED</p>
            <p style={{ margin: "2px 0 0", color: "#1F2937" }}>{lastUpdated}</p>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              height: "40px", padding: "0 16px", borderRadius: "10px",
              border: "1px solid #E5E7EB", background: "#ffffff",
              color: "#374151", fontWeight: 700, fontSize: "13px",
              display: "flex", alignItems: "center", gap: "6px",
              cursor: "pointer", transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F9FAFB";
              e.currentTarget.style.borderColor = "#22C55E";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} style={{ width: "14px", height: "14px", color: "#22C55E" }} />
            Refresh Tickers
          </button>
        </div>
      </div>

      {/* 2. MARKET OVERVIEW KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} className="grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Highest Price Today",
            value: `₹${(highestPriceToday as any).price || 0}`,
            unit: `/${(highestPriceToday as any).unit || "Kg"}`,
            subtitle: `${highestPriceToday.crop} · ${(highestPriceToday as any).mandi || "—"}`,
            trend: "Max Peak",
            trendColor: "#22C55E",
            icon: TrendingUp,
            iconBg: "#DCFCE7",
            onClick: () => router.push(`/farmer/market?cropId=${highestPriceToday.crop}`)
          },
          {
            label: "Biggest Gainer",
            value: `+${biggestGainer.change}%`,
            unit: "",
            subtitle: `${biggestGainer.crop} · ${biggestGainer.mandi}`,
            trend: "Bullish Spike",
            trendColor: "#22C55E",
            icon: ArrowUpRight,
            iconBg: "#DCFCE7",
            onClick: () => router.push(`/farmer/market?cropId=${biggestGainer.crop}`)
          },
          {
            label: "Highest Demand Crop",
            value: highestDemand.crop,
            unit: "",
            subtitle: `Demand: ${highestDemand.demand?.replace("_", " ")}`,
            trend: "Market Star",
            trendColor: "#2563EB",
            icon: Sparkles,
            iconBg: "#DBEAFE",
            onClick: () => router.push(`/farmer/market?cropId=${highestDemand.crop}`)
          },
          {
            label: "AI Sales Recommendation",
            value: "Hold & Sell",
            unit: "",
            subtitle: "Basmati Rice · Next 5 Days",
            trend: "Bullish Trend",
            trendColor: "#F59E0B",
            icon: Clock,
            iconBg: "#FEF3C7",
            onClick: () => router.push("/farmer/market?aiAnalysis=true")
          },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={card.onClick}
            style={{
              background: "#ffffff", border: "1px solid #E5E7EB",
              borderRadius: "16px", padding: "20px 22px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
            }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", borderColor: "#22C55E" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {card.label}
              </span>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <card.icon style={{ width: "18px", height: "18px", color: card.trendColor }} />
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1F2937", margin: 0, display: "inline-block" }}>
                {card.value}
              </h3>
              {card.unit && <span style={{ fontSize: "12px", color: "#64748B" }}>{card.unit}</span>}
              <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0", fontWeight: 550 }}>
                {card.subtitle}
              </p>
            </div>

            <div style={{
              marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #F3F4F6",
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              <span style={{ width: "6px", height: "6px", background: card.trendColor, borderRadius: "50%" }} />
              <span style={{ fontSize: "10px", fontWeight: 700, color: card.trendColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {card.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div
        style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "16px", padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          display: "flex", flexWrap: "wrap",
          alignItems: "center", justifyContent: "space-between", gap: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flex: "1 1 280px", maxWidth: "340px", position: "relative" }}>
          <Search style={{ position: "absolute", left: "14px", width: "16px", height: "16px", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search crop varieties or local mandis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", height: "42px", background: "#F9FAFB",
              border: "1px solid #E5E7EB", borderRadius: "10px",
              paddingLeft: "38px", paddingRight: "14px",
              fontSize: "13px", color: "#374151", outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#22C55E";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.1)";
              e.currentTarget.style.background = "#ffffff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "#F9FAFB";
            }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
          
          {/* Crop Category Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter style={{ width: "14px", height: "14px", color: "#9CA3AF" }} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                height: "40px", background: "#ffffff", border: "1px solid #E5E7EB",
                borderRadius: "10px", padding: "0 12px", fontSize: "13px",
                fontWeight: 600, color: "#4B5563", outline: "none", cursor: "pointer",
              }}
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>
          </div>

          {/* Mandi selector */}
          <select
            value={mandiFilter}
            onChange={(e) => setMandiFilter(e.target.value)}
            style={{
              height: "40px", background: "#ffffff", border: "1px solid #E5E7EB",
              borderRadius: "10px", padding: "0 12px", fontSize: "13px",
              fontWeight: 600, color: "#4B5563", outline: "none", cursor: "pointer",
            }}
          >
            {mandisList.map((m) => (
              <option key={m} value={m}>{m === "All" ? "All Mandis" : m}</option>
            ))}
          </select>

          {/* Demand filter */}
          <select
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value)}
            style={{
              height: "40px", background: "#ffffff", border: "1px solid #E5E7EB",
              borderRadius: "10px", padding: "0 12px", fontSize: "13px",
              fontWeight: 600, color: "#4B5563", outline: "none", cursor: "pointer",
            }}
          >
            <option value="All">All Demand Levels</option>
            <option value="very_high">Very High 🔥</option>
            <option value="high">High Demand</option>
            <option value="medium">Medium Demand</option>
            <option value="low">Low Demand</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              height: "40px", background: "#ffffff", border: "1px solid #E5E7EB",
              borderRadius: "10px", padding: "0 12px", fontSize: "13px",
              fontWeight: 600, color: "#4B5563", outline: "none", cursor: "pointer",
            }}
          >
            <option value="default">Default Sort</option>
            <option value="price-high">Highest Price</option>
            <option value="price-low">Lowest Price</option>
            <option value="change-high">Highest 24h Gainer</option>
            <option value="change-low">Highest 24h Loser</option>
          </select>

          {/* Export Button (Real CSV download) */}
          <button
            onClick={handleExportCSV}
            style={{
              height: "40px", padding: "0 14px", borderRadius: "10px",
              border: "1px solid #E5E7EB", background: "#ffffff",
              color: "#374151", fontWeight: 700, fontSize: "13px",
              display: "flex", alignItems: "center", gap: "6px",
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
          >
            <Download style={{ width: "14px", height: "14px", color: "#64748B" }} />
            Export
          </button>
        </div>
      </div>

      {/* 4. LIVE MARKET TABLE AND AI TIMING ADVISOR SPLIT */}
      {loading && processedPrices.length === 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ height: "300px", borderRadius: "18px", border: "1px solid #E5E7EB", background: "#ffffff" }} className="anim-shimmer" />
          ))}
        </div>
      ) : processedPrices.length === 0 ? (
        <div style={{
          background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "20px",
          padding: "64px 32px", textAlign: "center", display: "flex", flexDirection: "column",
          alignItems: "center", gap: "16px", boxShadow: "0 2px 16px rgba(0,0,0,0.02)",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "#F9FAFB", border: "1px solid #E5E7EB",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Info style={{ width: "28px", height: "28px", color: "#64748B" }} />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1F2937", margin: 0 }}>No market data found for your current filters.</h3>
          <p style={{ fontSize: "13px", color: "#64748B", margin: 0, maxWidth: "420px", lineHeight: 1.55 }}>
            Try resetting your searches, categories, and regional filters to load available APMC prices.
          </p>
          <button
            onClick={handleResetFilters}
            style={{
              height: "40px", padding: "0 20px", borderRadius: "10px",
              border: "none", background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
              color: "#ffffff", fontWeight: 700, fontSize: "13px",
              boxShadow: "0 4px 12px rgba(34,197,94,0.2)", cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="lg:grid-cols-3">
          
          {/* Mandi List Table (2/3 width) */}
          <div
            className="lg:col-span-2"
            style={{
              background: "#ffffff", border: "1px solid #E5E7EB",
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 2px 16px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: 0, fontFamily: "Inter, sans-serif" }}>
                  Live APMC Mandi Index Table
                </h3>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Realtime APMC wholesale price indexes</p>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#22C55E", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "6px", height: "6px", background: "#22C55E", borderRadius: "50%" }} />
                Live Ledger Ticker
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {[t("cropVarietyLabel"), t("apmcMandi"), "Price Index", "24h Shift", "Expected Demand", "AI Verification"].map((h) => (
                      <th key={h} style={{
                        padding: "12px 20px", textAlign: "left",
                        fontSize: "11px", fontWeight: 700, color: "#6B7280",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        borderBottom: "1px solid #E5E7EB",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedPrices.map((m, idx) => {
                    const demandBadges = {
                      very_high: { text: "Very High 🔥", bg: "#FFEBEE", color: "#C62828", border: "#FFCDD2" },
                      high:      { text: "High 🟢", bg: "#E8F5E9", color: "#2E7D32", border: "#DCEFD9" },
                      medium:    { text: "Medium 🟡", bg: "#FFF9C4", color: "#F57F17", border: "#FFF59D" },
                      low:       { text: "Low 🔴", bg: "#ECEFF1", color: "#374151", border: "#CFD8DC" },
                    }[m.demand] || { text: m.demand, bg: "#F9FAFB", color: "#374151", border: "#E5E7EB" };

                    return (
                      <tr key={idx} style={{
                        borderBottom: idx < processedPrices.length - 1 ? "1px solid #F3F4F6" : "none",
                        transition: "background 0.12s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#F9FAFB"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                      onClick={() => router.push(`/farmer/market?cropId=${m.crop}`)}>
                        
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>
                          {m.crop}
                        </td>
                        
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#4B5563", fontWeight: 500 }}>
                          {m.mandi}
                        </td>
                        
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#22C55E", fontFamily: "monospace" }}>
                          ₹{m.price} / {m.unit}
                        </td>
                        
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, fontFamily: "monospace" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "2px", color: m.change > 0 ? "#22C55E" : "#EF4444" }}>
                            {m.change > 0 ? <ArrowUpRight style={{ width: "14px", height: "14px" }} /> : <ArrowDownRight style={{ width: "14px", height: "14px" }} />}
                            {Math.abs(m.change)}%
                          </span>
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                            padding: "2px 8px", borderRadius: "99px",
                            background: demandBadges.bg, color: demandBadges.color, border: `1px solid ${demandBadges.border}`
                          }}>
                            {demandBadges.text}
                          </span>
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            fontSize: "10px", fontWeight: 700, color: "#2563EB",
                            background: "#EFF6FF", border: "1px solid #BFDBFE",
                            padding: "2px 8px", borderRadius: "99px",
                            display: "inline-flex", alignItems: "center", gap: "4px"
                          }}>
                            <Sparkles style={{ width: "10px", height: "10px" }} />
                            AI Approved
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Selling Strategy Timing Advisor (1/3 width) */}
          <div
            style={{
              background: "#ffffff", border: "1px solid #E5E7EB",
              borderRadius: "20px", padding: "24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.02)",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", display: "flex", alignItems: "center", gap: "8px", margin: 0, fontFamily: "Inter, sans-serif" }}>
                <span style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Sparkles style={{ width: "14px", height: "14px", color: "#ffffff" }} />
                </span>
                🤖 AI Sales Timing Advisor
              </h3>

              <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.55, margin: 0 }}>
                {t("basmatiRiceWholesaleSupplyInde")}
              </p>

              <div style={{
                background: "#F9FAFB", border: "1px solid #E5E7EB",
                borderRadius: "12px", padding: "14px 16px",
                display: "flex", flexDirection: "column", gap: "10px",
                fontFamily: "monospace", fontSize: "12px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9CA3AF" }}>{t("currentTrend")}</span>
                  <span style={{ color: "#22C55E", fontWeight: 700 }}>{t("bullishRising")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9CA3AF" }}>Confidence Index</span>
                  <span style={{ color: "#2563EB", fontWeight: 700 }}>94% Opportunity</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9CA3AF" }}>{t("bestWindow")}</span>
                  <span style={{ color: "#1F2937", fontWeight: 700 }}>Next 5 Days</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "16px", marginTop: "16px" }}>
              <button
                onClick={() => router.push("/farmer/market?aiAnalysis=true")}
                style={{
                  width: "100%", height: "42px", borderRadius: "10px",
                  border: "none", background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                  color: "#ffffff", fontWeight: 700, fontSize: "13px",
                  boxShadow: "0 4px 12px rgba(34,197,94,0.2)", cursor: "pointer",
                  transition: "all 0.15s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
              >
                View Complete Analysis
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 5. 7-DAY MARKET TREND CHART */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "20px", padding: "24px 28px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: 0, fontFamily: "Inter, sans-serif" }}>
            Market Price Trend
          </h2>
          <p style={{ fontSize: "13px", color: "#64748B", marginTop: "3px" }}>
            7-day wholesale price movement across selected crops
          </p>
        </div>

        <div style={{ height: "260px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#ffffff", border: "1px solid #E5E7EB",
                  borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="Basmati Rice" stroke="#22C55E" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Wheat" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Alphonso Mango" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 6. MANDI SOURCING RECOMMENDATIONS */}
      <div
        style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "20px", padding: "24px 28px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: 0, fontFamily: "Inter, sans-serif" }}>
            Mandi Sourcing Recommendations
          </h3>
          <p style={{ fontSize: "13px", color: "#64748B", marginTop: "3px" }}>
            Recommended distribution APMC nodes optimizing logistics cost and expected margins.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {[
            {
              mandi: "Sonepat APMC",
              crop: "Basmati Rice",
              margin: "₹88/Kg (Max Return)",
              confidence: "95% Confidence",
              reason: t("str_1SonepatApmcOffersBestBasm"),
              border: "#DCEFD9",
              badgeBg: "#E8F5E9",
              badgeColor: "#2E7D32",
            },
            {
              mandi: "Mumbai APMC Direct",
              crop: "Wheat (Sharbati)",
              margin: "₹24.2/Kg (+1.2% Peak)",
              confidence: "92% Confidence",
              reason: t("str_2MumbaiDirectTransportYiel"),
              border: "#BFDBFE",
              badgeBg: "#EFF6FF",
              badgeColor: "#1E40AF",
            },
          ].map((rec, i) => (
            <div key={i} style={{
              background: "#F9FAFB", border: `1px solid ${rec.border}`,
              borderRadius: "14px", padding: "18px 20px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              gap: "12px", transition: "box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 20px rgba(0,0,0,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "none";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.05em", padding: "3px 9px", borderRadius: "99px",
                    background: rec.badgeBg, color: rec.badgeColor
                  }}>
                    {rec.crop}
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF" }}>
                    {rec.confidence}
                  </span>
                </div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", margin: "10px 0 4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin style={{ width: "14px", height: "14px", color: "#EF4444" }} />
                  {rec.mandi}
                </h4>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "6px 0 0", lineHeight: 1.55 }}>
                  {rec.reason}
                </p>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingTop: "10px", borderTop: "1px solid #E5E7EB", marginTop: "8px"
              }}>
                <span style={{ fontSize: "12px", color: "#22C55E", fontWeight: 700 }}>
                  Est: {rec.margin}
                </span>
                <button
                  onClick={() => router.push(`/farmer/market?mandiId=${rec.mandi}`)}
                  style={{
                    fontSize: "12px", fontWeight: 700, color: "#2563EB",
                    background: "none", border: "none", cursor: "pointer",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#1D4ED8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#2563EB"; }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}