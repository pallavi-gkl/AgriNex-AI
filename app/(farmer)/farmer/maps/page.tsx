"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview Smart Logistics & Supply Command Center -- /farmer/maps
 * Phase 9 Premium UI/UX redesign.
 * Preserves all existing FarmerMap logic and DEMO_NEARBY_BUYERS / DEMO_WAREHOUSES data.
 * Adds: KPI dashboard, AI Route panel, premium buyer/warehouse cards,
 * delivery status overview, quick actions, and fully responsive layout.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Warehouse, Users, Navigation, Zap,
  Truck, Clock, Star, Phone, Eye, RefreshCw, Route,
  Package, CheckCircle, AlertCircle, XCircle, TrendingUp,
  ChevronRight, Leaf, CloudSun, Activity, ShieldCheck, BarChart2,
} from "lucide-react";
import { DEMO_NEARBY_BUYERS, DEMO_WAREHOUSES } from "@/lib/demoData";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { useFarmerInventory } from "@/hooks/useFarmerInventory";

// Map loading skeleton
function MapLoader() {
  return (
    <div style={{
      width: "100%", height: "480px",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #F0F9FF 0%, #F8FAFC 100%)",
      borderRadius: "20px", border: "1px solid #E0F2FE",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          border: "4px solid #E0F2FE", borderTopColor: "#0EA5E9",
          animation: "mapSpin 0.9s linear infinite",
        }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>Initialising Map Engine...</span>
        <style>{`@keyframes mapSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

const FarmerMap = dynamic(() => import("@/components/farmer/FarmerMap"), {
  ssr: false,
  loading: () => <MapLoader />,
});

// Star Rating helper
const StarRating = ({ rating }: { rating: number }) => (
  <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} style={{
        width: "11px", height: "11px",
        color: s <= Math.round(rating) ? "#F59E0B" : "#E5E7EB",
        fill: s <= Math.round(rating) ? "#F59E0B" : "transparent",
      }} />
    ))}
    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", marginLeft: "4px" }}>{rating}</span>
  </div>
);

// Warehouse capacity bar
const CapacityBar = ({ used, total }: { used: number; total: number }) => {
  const filled = Math.round(((total - used) / total) * 100);
  const color = filled < 50 ? "#22C55E" : filled < 80 ? "#F59E0B" : "#EF4444";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600 }}>UTILISATION</span>
        <span style={{ fontSize: "10px", color, fontWeight: 700 }}>{filled}% filled</span>
      </div>
      <div style={{ height: "5px", borderRadius: "99px", background: "#F1F5F9", overflow: "hidden" }}>
        <div style={{ width: `${filled}%`, height: "100%", background: color, borderRadius: "99px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
};

const KPI_CARDS = [
  { icon: Truck,       value: "12",    label: "Active Deliveries",    sub: "4 in transit right now",    color: "#22C55E", bg: "#F0FDF4", border: "#86EFAC" },
  { icon: Warehouse,   value: "3",     label: "Nearby Warehouses",    sub: "within 50 km radius",       color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD" },
  { icon: Users,       value: "4",     label: "Active Buyers",        sub: "interested in your crops",  color: "#A855F7", bg: "#FAF5FF", border: "#D8B4FE" },
  { icon: Leaf,        value: "2",     label: "Collection Centers",   sub: "active grading stations",   color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  { icon: Clock,       value: "2.4h",  label: "Avg Delivery Time",    sub: "per completed order",        color: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
  { icon: ShieldCheck, value: "96%",   label: "Logistics Efficiency", sub: "based on last 30 orders",   color: "#06B6D4", bg: "#ECFEFF", border: "#A5F3FC" },
];

const DELIVERY_STATS = [
  { label: "Pending",    count: 5,  icon: AlertCircle, color: "#F59E0B", bg: "#FFFBEB" },
  { label: "In Transit", count: 4,  icon: Truck,        color: "#0EA5E9", bg: "#F0F9FF" },
  { label: "Delivered",  count: 18, icon: CheckCircle, color: "#22C55E", bg: "#F0FDF4" },
  { label: "Cancelled",  count: 1,  icon: XCircle,     color: "#EF4444", bg: "#FEF2F2" },
];

export default function MapsPage() {
  const { t } = useTranslation("farmer");
  const { location, weather } = useLocationWeather();
  const { crops } = useFarmerInventory();

  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" | "warning" } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<"buyers" | "warehouses" | "delivery">("buyers");

  const locationLabel = useMemo(() => {
    if (location?.city) return `${location.city}${location.state ? ", " + location.state : ""}`;
    return "Karnal, Haryana";
  }, [location]);

  const weatherLabel = useMemo(() => {
    if (weather) return `${weather.condition} - ${weather.temperature}degC`;
    return "Clear - 32degC";
  }, [weather]);

  const showToast = (msg: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    showToast("Map data refreshed successfully!", "success");
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleOptimiseRoute = () => showToast("AI route optimisation complete. Best path computed.", "success");
  const handleNearestWarehouse = () => showToast(`Nearest: ${DEMO_WAREHOUSES[0].name} (${DEMO_WAREHOUSES[0].distance_km} km)`, "info");
  const handleNearbyBuyers = () => { setActiveSection("buyers"); showToast(`${DEMO_NEARBY_BUYERS.length} buyers found near ${locationLabel}`, "info"); };

  const aiRoute = useMemo(() => ({
    route: `${locationLabel} ? ${DEMO_WAREHOUSES[0].name} ? ${DEMO_NEARBY_BUYERS[0].name}`,
    distance: "37 km", time: "52 min",
    fuelSaving: "?180 saved vs alternate",
    roadCondition: "Good", weatherCondition: weatherLabel, trafficStatus: "Moderate",
  }), [locationLabel, weatherLabel]);

  const farmerCropNames = useMemo(() => {
    if (crops && crops.length > 0) return crops.map((c: any) => c.title).slice(0, 3);
    return ["Basmati Rice", "Turmeric", "Alphonso Mango"];
  }, [crops]);

  const card: React.CSSProperties = {
    background: "#ffffff", borderRadius: "20px", border: "1px solid #E5E7EB",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "22px 24px",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#F8FAFC", paddingBottom: "48px" }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
              background: toast.type === "success" ? "#10B981" : toast.type === "warning" ? "#F59E0B" : "#3B82F6",
              color: "#fff", padding: "12px 22px", borderRadius: "12px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600,
            }}
          >
            <CheckCircle style={{ width: "16px", height: "16px" }} />
            {toast.msg}
            <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginLeft: "8px", fontWeight: 800 }}>?</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)",
          borderRadius: "24px", padding: "36px 40px", marginBottom: "28px",
          border: "2px solid #22C55E",
          boxShadow: "0 8px 32px rgba(34,197,94,0.12), 0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Soft decorative blobs */}
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(34,197,94,0.10)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "30%", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(16,185,129,0.08)", filter: "blur(40px)" }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[`📍 ${locationLabel}`, `🌤 ${weatherLabel}`, "🚛 Live Logistics"].map((pill) => (
              <div key={pill} style={{
                background: "rgba(255,255,255,0.75)", border: "1px solid #86EFAC",
                borderRadius: "99px", padding: "5px 14px", fontSize: "12px", fontWeight: 600,
                color: "#16A34A", backdropFilter: "blur(8px)",
              }}>{pill}</div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#14532D", margin: "0 0 10px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                🗺️ Smart Logistics &amp; Supply Command Center
              </h1>
              <p style={{ fontSize: "14px", color: "#334155", margin: 0, maxWidth: "560px", lineHeight: 1.65 }}>
                AI-powered logistics, buyer discovery, warehouse availability and route optimisation for smarter agricultural deliveries.
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                {["Real-time Tracking", "Multi-layer View", "Smart Routes", "AI Optimisation"].map((tag) => (
                  <span key={tag} style={{
                    background: "rgba(255,255,255,0.8)", border: "1px solid #86EFAC",
                    borderRadius: "99px", padding: "4px 14px", fontSize: "11px", fontWeight: 700,
                    color: "#16A34A", letterSpacing: "0.02em",
                  }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.80)", border: "1px solid #86EFAC",
              borderRadius: "18px", padding: "16px 20px", minWidth: "190px",
              boxShadow: "0 2px 12px rgba(34,197,94,0.10)",
            }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#16A34A", textTransform: "uppercase", margin: "0 0 10px", letterSpacing: "0.08em" }}>Your Active Crops</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {farmerCropNames.map((crop: string) => (
                  <div key={crop} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Leaf style={{ width: "12px", height: "12px", color: "#16A34A" }} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#14532D" }}>{crop}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {KPI_CARDS.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
            style={{
              background: "#ffffff", borderRadius: "18px", border: `1px solid ${k.border}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "20px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "default",
            }}
          >
            <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <k.icon style={{ width: "20px", height: "20px", color: k.color }} />
            </div>
            <p style={{ fontSize: "26px", fontWeight: 900, color: "#1F2937", margin: "0 0 4px", letterSpacing: "-0.5px" }}>{k.value}</p>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", margin: "0 0 3px" }}>{k.label}</p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
        <style>{`
          @media (max-width: 1024px) { .lg-two-col { grid-template-columns: 1fr !important; } }
        `}</style>

        {/* Left: Map + Delivery */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Map card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>?? Interactive Supply Map</h2>
                <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Farms - Buyers - Warehouses - Collection Centers</p>
              </div>
              <button
                onClick={handleRefresh}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "10px",
                  padding: "7px 14px", fontSize: "12px", fontWeight: 700, color: "#16A34A", cursor: "pointer",
                }}
              >
                <RefreshCw style={{ width: "13px", height: "13px", animation: refreshing ? "mapSpin 0.9s linear infinite" : "none" }} />
                Refresh
              </button>
            </div>
            <FarmerMap />
          </motion.div>

          {/* Delivery Status */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={card}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package style={{ width: "18px", height: "18px", color: "#6366F1" }} />
              Delivery Status Overview
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "14px" }}>
              {DELIVERY_STATS.map((s) => (
                <div key={s.label} style={{
                  background: s.bg, borderRadius: "14px", padding: "16px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px",
                }}>
                  <s.icon style={{ width: "18px", height: "18px", color: s.color }} />
                  <p style={{ fontSize: "24px", fontWeight: 900, color: "#1F2937", margin: 0 }}>{s.count}</p>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: s.color, background: "rgba(255,255,255,0.7)", borderRadius: "6px", padding: "2px 8px" }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{
              padding: "12px 14px", background: "linear-gradient(135deg, #F0FDF4, #ffffff)",
              borderRadius: "12px", border: "1px solid #86EFAC",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <BarChart2 style={{ width: "16px", height: "16px", color: "#22C55E" }} />
              <div>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#166534", margin: "0 0 2px" }}>On-Time Rate: 94%</p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>27 of 28 orders delivered on schedule</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Quick Actions */}
          <div style={card}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1F2937", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap style={{ width: "15px", height: "15px", color: "#F59E0B" }} />
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { icon: Route,     label: "Optimise Route",     color: "#22C55E", action: handleOptimiseRoute },
                { icon: RefreshCw, label: "Refresh Map",        color: "#0EA5E9", action: handleRefresh },
                { icon: Warehouse, label: "Nearest Warehouse",  color: "#6366F1", action: handleNearestWarehouse },
                { icon: Users,     label: "Nearby Buyers",      color: "#A855F7", action: handleNearbyBuyers },
              ].map((btn) => (
                <button key={btn.label} onClick={btn.action} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "12px",
                  border: "1px solid #F1F5F9", background: "#FAFAFA",
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                  fontSize: "13px", fontWeight: 600, color: "#374151",
                  transition: "background 0.2s ease", textAlign: "left" as const,
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FDF4")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                >
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: btn.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <btn.icon style={{ width: "14px", height: "14px", color: btn.color }} />
                  </div>
                  {btn.label}
                  <ChevronRight style={{ width: "14px", height: "14px", color: "#CBD5E1", marginLeft: "auto" }} />
                </button>
              ))}
            </div>
          </div>

          {/* AI Route Recommendation */}
          <div style={{ ...card, background: "linear-gradient(135deg, #FAF5FF 0%, #ffffff 100%)", border: "1px solid #E9D5FF" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#6B21A8", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "6px" }}>
              ?? AI Route Recommendation
            </h3>
            <div style={{ background: "#F3E8FF", borderRadius: "12px", padding: "12px 14px", fontSize: "12px", color: "#581C87", fontWeight: 600, lineHeight: 1.6, marginBottom: "14px" }}>
              ?? {aiRoute.route}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Est. Distance",   val: aiRoute.distance,          icon: Navigation },
                { label: "Est. Time",       val: aiRoute.time,              icon: Clock },
                { label: "Fuel Saving",     val: aiRoute.fuelSaving,        icon: TrendingUp },
                { label: "Road Condition",  val: aiRoute.roadCondition,     icon: Route },
                { label: "Weather",         val: aiRoute.weatherCondition,  icon: CloudSun },
                { label: "Traffic Status",  val: aiRoute.trafficStatus,     icon: Activity },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F3E8FF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <row.icon style={{ width: "13px", height: "13px", color: "#A855F7" }} />
                    <span style={{ fontSize: "12px", color: "#6B7280" }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1F2937" }}>{row.val}</span>
                </div>
              ))}
            </div>
            <button onClick={handleOptimiseRoute} style={{
              marginTop: "14px", width: "100%", padding: "10px",
              background: "linear-gradient(135deg, #A855F7, #7C3AED)",
              border: "none", borderRadius: "12px", color: "#ffffff",
              fontSize: "13px", fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              fontFamily: "Inter, sans-serif",
            }}>
              <Zap style={{ width: "14px", height: "14px" }} />
              Apply Route Optimisation
            </button>
          </div>

          {/* Section Tabs */}
          <div style={card}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
              {(["buyers", "warehouses", "delivery"] as const).map((s) => (
                <button key={s} onClick={() => setActiveSection(s)} style={{
                  flex: 1, padding: "7px 4px", borderRadius: "10px", border: "none",
                  background: activeSection === s ? "#22C55E" : "#F1F5F9",
                  color: activeSection === s ? "#ffffff" : "#64748B",
                  fontSize: "11px", fontWeight: 700, cursor: "pointer",
                  transition: "background 0.2s ease", fontFamily: "Inter, sans-serif",
                }}>
                  {s === "buyers" ? "?? Buyers" : s === "warehouses" ? "?? Warehouses" : "?? Delivery"}
                </button>
              ))}
            </div>

            {/* BUYERS */}
            {activeSection === "buyers" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "460px", overflowY: "auto", paddingRight: "4px" }}>
                {DEMO_NEARBY_BUYERS.map((b: any, idx: number) => (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                    whileHover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                    style={{ background: "#FAFAFA", borderRadius: "14px", border: "1px solid #E5E7EB", padding: "14px" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #A855F7, #EC4899)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Users style={{ width: "18px", height: "18px", color: "#ffffff" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: "0 0 3px", lineHeight: 1.3 }}>{b.name}</p>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#A855F7", background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: "5px", padding: "1px 7px" }}>{b.type}</span>
                      </div>
                      <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "8px", padding: "4px 9px", fontSize: "11px", fontWeight: 800, color: "#16A34A", flexShrink: 0 }}>
                        {b.distance_km} km
                      </div>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <p style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600, margin: "0 0 5px" }}>INTERESTED CROPS</p>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {b.interested_in.map((crop: string) => (
                          <span key={crop} style={{ fontSize: "10px", fontWeight: 600, color: "#374151", background: "#F1F5F9", borderRadius: "5px", padding: "2px 8px" }}>{crop}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <StarRating rating={b.rating} />
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={{ height: "28px", width: "28px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Phone style={{ width: "12px", height: "12px", color: "#6B7280" }} />
                        </button>
                        <button onClick={() => showToast(`Viewing details for ${b.name}`, "info")}
                          style={{ height: "28px", padding: "0 12px", borderRadius: "8px", border: "none", background: "#22C55E", color: "#ffffff", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontFamily: "Inter, sans-serif" }}>
                          <Eye style={{ width: "11px", height: "11px" }} /> View
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* WAREHOUSES */}
            {activeSection === "warehouses" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "460px", overflowY: "auto", paddingRight: "4px" }}>
                {DEMO_WAREHOUSES.map((w: any, idx: number) => (
                  <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                    whileHover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                    style={{ background: "#FAFAFA", borderRadius: "14px", border: "1px solid #E5E7EB", padding: "14px" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #0EA5E9, #0369A1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Warehouse style={{ width: "18px", height: "18px", color: "#ffffff" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: "0 0 3px", lineHeight: 1.3 }}>{w.name}</p>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>?? {w.temp_range} - {w.capacity_mt.toLocaleString()} MT total</span>
                      </div>
                      <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "8px", padding: "4px 9px", fontSize: "11px", fontWeight: 800, color: "#0369A1", flexShrink: 0 }}>
                        {w.distance_km} km
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      {[
                        { label: "CAPACITY", val: `${w.capacity_mt.toLocaleString()} MT` },
                        { label: "AVAILABLE", val: `${w.available_mt.toLocaleString()} MT`, color: "#22C55E" },
                        { label: "TEMP RANGE", val: w.temp_range, color: "#0EA5E9" },
                      ].map((stat) => (
                        <div key={stat.label} style={{ textAlign: "center" as const }}>
                          <p style={{ fontSize: "9px", color: "#94A3B8", margin: "0 0 2px", fontWeight: 600 }}>{stat.label}</p>
                          <p style={{ fontSize: "12px", fontWeight: 800, color: (stat as any).color || "#1F2937", margin: 0 }}>{stat.val}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <CapacityBar used={w.available_mt} total={w.capacity_mt} />
                    </div>
                    <button onClick={() => showToast(`Viewing ${w.name} details`, "info")} style={{
                      width: "100%", height: "32px", borderRadius: "9px",
                      border: "1px solid #BAE6FD", background: "#F0F9FF",
                      color: "#0369A1", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                      fontFamily: "Inter, sans-serif",
                    }}>
                      <Eye style={{ width: "13px", height: "13px" }} /> View Details
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* DELIVERY tab */}
            {activeSection === "delivery" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {DELIVERY_STATS.map((s) => (
                  <div key={s.label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", background: s.bg, borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <s.icon style={{ width: "18px", height: "18px", color: s.color }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 900, color: s.color, background: "rgba(255,255,255,0.7)", borderRadius: "8px", padding: "2px 10px", minWidth: "36px", textAlign: "center" as const }}>{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
