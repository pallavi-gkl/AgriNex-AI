"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Star,
  Brain,
  TrendingUp,
  CloudSun,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  Plus,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import {
  DEMO_SUMMARY,
  DEMO_CHART_DATA,
  DEMO_ORDERS,
  DEMO_NOTIFICATIONS,
  DEMO_TASKS,
  DEMO_MARKET_PRICES,
  DEMO_SCHEMES,
  DEMO_REVIEWS,
  DEMO_FARM_TWIN,
} from "@/lib/demoData";
import { cn } from "@/lib/utils";
import { useDemoMode } from "@/context/DemoContext";
import { supabase } from "@/lib/supabase";
import { useLocationWeather } from "@/context/LocationWeatherContext";

/* ── Shared card animation variant ──────────────────────────── */
const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function RedesignedDashboardPage() {
  const { isDemoMode } = useDemoMode();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [farmerName, setFarmerName] = useState<string>("Farmer");
  const { nearbyMandis } = useLocationWeather();
  const displayMandis = nearbyMandis.length > 0 ? nearbyMandis : DEMO_MARKET_PRICES;

  // Fetch actual logged-in farmer's name
  useEffect(() => {
    const fetchName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle() as { data: { full_name: string | null } | null };
        if (profile?.full_name) {
          setFarmerName(profile.full_name.split(" ")[0]);
        } else if (user.user_metadata?.full_name) {
          setFarmerName(user.user_metadata.full_name.split(" ")[0]);
        } else if (user.email) {
          setFarmerName(user.email.split("@")[0]);
        }
      }
    };
    fetchName();
  }, []);

  // Derive time-based greeting key
  const greetingKey = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "goodMorning";
    if (hour < 17) return "goodAfternoon";
    return "goodEvening";
  }, []);

  // Toggle tasks
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px" }}>

      {/* ═══════════════════════════════════════════════════════
          1. WELCOME HERO
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariant} initial="hidden" animate="show"
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #fefce8 100%)",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "200px", height: "200px",
          background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: "-30px", left: "20%",
          width: "160px", height: "160px",
          background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          {/* Left: greeting */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "#16A34A",
                background: "#DCFCE7", border: "1px solid #BBF7D0",
                padding: "3px 10px", borderRadius: "99px",
              }}>
                {t("agrinexActive")}
              </span>
              {isDemoMode && (
                <span style={{
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
                  textTransform: "uppercase", color: "#92400E",
                  background: "#FEF3C7", border: "1px solid #FDE68A",
                  padding: "3px 10px", borderRadius: "99px",
                }}>
                  {t("demoMode")}
                </span>
              )}
            </div>
            <h1 style={{
              fontSize: "26px", fontWeight: 800, color: "#111827",
              letterSpacing: "-0.5px", lineHeight: 1.2, margin: 0,
              fontFamily: "Inter, sans-serif",
            }}>
              {t(greetingKey)}, {farmerName}! 🌱
            </h1>
            <p style={{
              fontSize: "14px", color: "#6B7280", fontWeight: 500,
              marginTop: "6px", fontFamily: "Inter, sans-serif",
            }}>
              {t("farmHealthy")}
            </p>
          </div>

          {/* Right: farm health KPIs */}
          <div style={{ display: "flex", gap: "12px" }}>
            {[
              { label: t("soilHealth"),  value: `${DEMO_SUMMARY.soilHealthScore}%`, color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
              { label: t("cropHealth"),  value: `${DEMO_SUMMARY.cropHealthScore}%`, color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" },
              { label: t("carbon"),      value: "82/100",                           color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD" },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: "14px", padding: "12px 18px",
                textAlign: "center", minWidth: "88px",
              }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{label}</p>
                <p style={{ fontSize: "18px", fontWeight: 800, color, marginTop: "4px", fontFamily: "Inter, sans-serif" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          2. STATS GRID — 4 metric cards
      ═══════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}
           className="grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t("totalRevenue"),
            value: `₹${DEMO_SUMMARY.totalEarnings.toLocaleString("en-IN")}`,
            sub: `+${DEMO_SUMMARY.revenueGrowth}% this month`,
            subColor: "#16A34A",
            icon: IndianRupee,
            iconBg: "linear-gradient(135deg, #22C55E, #16A34A)",
          },
          {
            label: t("unitsSold"),
            value: `${DEMO_SUMMARY.bagsSold} Kg`,
            sub: t("allTimeDispatch"),
            subColor: "#6B7280",
            icon: ShoppingBag,
            iconBg: "linear-gradient(135deg, #38BDF8, #0284C7)",
          },
          {
            label: t("activeProducts"),
            value: `${DEMO_SUMMARY.activeListings}`,
            sub: t("onMarketplace"),
            subColor: "#16A34A",
            icon: Package,
            iconBg: "linear-gradient(135deg, #A78BFA, #7C3AED)",
          },
          {
            label: t("trustScore"),
            value: `${DEMO_SUMMARY.trustScore} / 5.0`,
            sub: "★★★★★",
            subColor: "#F59E0B",
            icon: Star,
            iconBg: "linear-gradient(135deg, #FCD34D, #F59E0B)",
          },
        ].map(({ label, value, sub, subColor, icon: Icon, iconBg }, i) => (
          <motion.div
            key={label}
            variants={cardVariant} initial="hidden" animate="show"
            transition={{ delay: i * 0.07 }}
            style={{
              background: "#ffffff",
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
              cursor: "default",
            }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", borderColor: "#BBF7D0" } as any}
          >
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#111827", marginTop: "6px", fontFamily: "Inter, sans-serif", letterSpacing: "-0.5px" }}>{value}</p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: subColor, marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                {sub.includes("%") && <ArrowUpRight style={{ width: "13px", height: "13px" }} />}
                {sub}
              </p>
            </div>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon style={{ width: "20px", height: "20px", color: "#ffffff" }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          3. LIVE PRICE TICKER
      ═══════════════════════════════════════════════════════ */}
      <div style={{
        background: "#0A1628",
        border: "1px solid #1E3A5F",
        borderRadius: "14px",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}>
        <div style={{
          background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
          padding: "5px 12px", borderRadius: "8px", flexShrink: 0,
          fontSize: "10px", fontWeight: 700, color: "#4ADE80",
          letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace",
        }}>
          {t("livePrices")}
        </div>
        <div style={{ position: "relative", flex: 1, overflow: "hidden", height: "24px", display: "flex", alignItems: "center" }}>
          <div className="animate-[marquee_25s_linear_infinite]" style={{ display: "flex", alignItems: "center", gap: "48px", whiteSpace: "nowrap" }}>
            {displayMandis.map((m, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontFamily: "monospace" }}>
                <span style={{ color: "#F1F5F9", fontWeight: 700 }}>{m.crop}</span>
                <span style={{ color: "#64748B" }}>{m.mandi}</span>
                <span style={{ color: "#22C55E", fontWeight: 700 }}>₹{m.price}/{m.unit}</span>
                <span style={{ color: m.change > 0 ? "#4ADE80" : "#F87171", fontWeight: 700 }}>
                  {m.change > 0 ? "▲" : "▼"} {Math.abs(m.change)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          4. REVENUE CHART + FARM AGENDA
      ═══════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="lg:grid-cols-3">
        {/* Revenue Chart — 2/3 */}
        <motion.div
          variants={cardVariant} initial="hidden" animate="show"
          className="lg:col-span-2"
          style={{
            background: "#ffffff", border: "1px solid #E5E7EB",
            borderRadius: "20px", padding: "24px 28px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0, fontFamily: "Inter, sans-serif" }}>
                {t("revenueChart")}
              </h2>
              <p style={{ fontSize: "13px", color: "#6B7280", fontWeight: 400, marginTop: "3px" }}>
                {t("personalPerformance")}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#10B981" }}>
                <span style={{ width: "10px", height: "10px", background: "#10B981", borderRadius: "50%", display: "inline-block" }} />
                {t("personal")}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#3B82F6" }}>
                <span style={{ width: "10px", height: "10px", background: "#3B82F6", borderRadius: "50%", display: "inline-block" }} />
                {t("mktAverage")}
              </span>
            </div>
          </div>
          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_CHART_DATA}>
                <defs>
                  <linearGradient id="personal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="average" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff", border: "1px solid #E5E7EB",
                    borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "#374151", fontWeight: 600 }}
                  labelStyle={{ fontWeight: 700, color: "#111827", marginBottom: "4px" }}
                />
                <Area type="monotone" dataKey="personalEarnings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#personal)" />
                <Area type="monotone" dataKey="marketAverage"    stroke="#3b82f6" strokeWidth={2}   strokeDasharray="5 4" fillOpacity={1} fill="url(#average)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Farm Agenda — 1/3 */}
        <motion.div
          variants={cardVariant} initial="hidden" animate="show"
          style={{
            background: "#ffffff", border: "1px solid #E5E7EB",
            borderRadius: "20px", padding: "24px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0, fontFamily: "Inter, sans-serif" }}>
              Today's Farm Agenda
            </h2>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
              Tasks synced with weather alerts
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  padding: "12px 14px",
                  background: task.done ? "#F9FAFB" : "#ffffff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                  opacity: task.done ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!task.done) (e.currentTarget as HTMLDivElement).style.borderColor = "#BBF7D0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB";
                }}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  readOnly
                  style={{ marginTop: "2px", width: "15px", height: "15px", accentColor: "#22C55E", flexShrink: 0, cursor: "pointer" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: "13px", fontWeight: 600, color: "#1F2937", margin: 0,
                    textDecoration: task.done ? "line-through" : "none",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {task.title}
                  </p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500, marginTop: "2px" }}>
                    Due: {task.due}
                  </p>
                </div>
                <span style={{
                  fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                  padding: "3px 8px", borderRadius: "99px", flexShrink: 0,
                  ...(task.priority === "urgent"
                    ? { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }
                    : task.priority === "high"
                    ? { background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }
                    : { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }),
                }}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/farmer/calendar"
            className="no-underline"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              fontSize: "13px", fontWeight: 600, color: "#16A34A",
              paddingTop: "14px", marginTop: "12px",
              borderTop: "1px solid #F3F4F6",
              transition: "color 0.15s",
            }}
          >
            <span>{t("farmCalendar")}</span>
            <ChevronRight style={{ width: "16px", height: "16px" }} />
          </Link>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          5. AI ADVISORY PANEL
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariant} initial="hidden" animate="show"
        style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "20px", padding: "24px 28px",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "8px", fontFamily: "Inter, sans-serif" }}>
              <span style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: "linear-gradient(135deg, #A78BFA, #7C3AED)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                <Brain style={{ width: "15px", height: "15px", color: "#ffffff" }} />
              </span>
              {t("aiDiagnosticAlertsAdvisoryFeed")}
            </h2>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px" }}>
              Realtime advisories from soil health profiles and climate anomalies.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {DEMO_FARM_TWIN.ai_insights.map((insight, idx) => {
            const isPriority = {
              urgent: { border: "#FECACA", topBar: "#EF4444", badge: { bg: "#FEF2F2", text: "#DC2626" } },
              high:   { border: "#FDE68A", topBar: "#F59E0B", badge: { bg: "#FFFBEB", text: "#D97706" } },
              medium: { border: "#BFDBFE", topBar: "#3B82F6", badge: { bg: "#EFF6FF", text: "#2563EB" } },
            }[insight.priority] ?? { border: "#E5E7EB", topBar: "#6B7280", badge: { bg: "#F9FAFB", text: "#374151" } };

            return (
              <div key={idx} style={{
                background: "#ffffff",
                border: `1px solid ${isPriority.border}`,
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "none";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}>
                {/* Priority colour bar */}
                <div style={{ height: "3px", background: isPriority.topBar }} />

                <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.06em", padding: "3px 8px", borderRadius: "99px",
                      background: isPriority.badge.bg, color: isPriority.badge.text,
                    }}>
                      {insight.priority}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {insight.type}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.55, fontWeight: 500, flex: 1, margin: 0 }}>
                    {insight.insight}
                  </p>

                  <Link href="/farmer/ai-lab" className="no-underline" style={{
                    fontSize: "12px", fontWeight: 700, color: "#7C3AED",
                    display: "flex", alignItems: "center", gap: "4px",
                    transition: "color 0.15s",
                  }}>
                    Launch Diagnostics
                    <ChevronRight style={{ width: "13px", height: "13px" }} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          6. QUICK ACTIONS
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariant} initial="hidden" animate="show"
        style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "20px", padding: "24px 28px",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: "0 0 18px", fontFamily: "Inter, sans-serif" }}>
          {t("quickActions")}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }} className="grid-cols-3 lg:grid-cols-6">
          {[
            { href: "/farmer/inventory?action=add", icon: Plus,      iconBg: "linear-gradient(135deg,#22C55E,#16A34A)", label: t("addCrop"),          hoverBorder: "#BBF7D0" },
            { href: "/farmer/ai-lab",               icon: Brain,     iconBg: "linear-gradient(135deg,#A78BFA,#7C3AED)", label: t("diseaseDetection"), hoverBorder: "#DDD6FE" },
            { href: "/farmer/farm-twin",             icon: Sparkles,  iconBg: "linear-gradient(135deg,#38BDF8,#0284C7)", label: t("digitalTwin"),       hoverBorder: "#BAE6FD" },
            { href: "/farmer/market",               icon: TrendingUp,iconBg: "linear-gradient(135deg,#FB7185,#E11D48)", label: "Market Mandi",         hoverBorder: "#FECDD3" },
            { href: "/farmer/analytics",             icon: BarChart3, iconBg: "linear-gradient(135deg,#34D399,#059669)", label: t("analytics"),         hoverBorder: "#A7F3D0" },
            { href: "/farmer/calendar",             icon: Zap,       iconBg: "linear-gradient(135deg,#FCD34D,#F59E0B)", label: t("farmCalendar"),      hoverBorder: "#FDE68A" },
          ].map(({ href, icon: Icon, iconBg, label, hoverBorder }) => (
            <Link key={href} href={href} className="no-underline" style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "18px 12px", gap: "10px",
              background: "#F9FAFB", border: "1px solid #E5E7EB",
              borderRadius: "14px", textAlign: "center",
              transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s, background 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = hoverBorder;
              el.style.background = "#ffffff";
              el.style.transform = "translateY(-2px)";
              el.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "#E5E7EB";
              el.style.background = "#F9FAFB";
              el.style.transform = "none";
              el.style.boxShadow = "none";
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px",
                background: iconBg, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon style={{ width: "18px", height: "18px", color: "#ffffff" }} />
              </div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: 0, lineHeight: 1.3 }}>
                {label}
              </p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          7. RECENT ORDERS + CUSTOMER REVIEWS
      ═══════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="lg:grid-cols-3">
        {/* Recent Orders Table — 2/3 */}
        <motion.div
          variants={cardVariant} initial="hidden" animate="show"
          className="lg:col-span-2"
          style={{
            background: "#ffffff", border: "1px solid #E5E7EB",
            borderRadius: "20px", overflow: "hidden",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #F3F4F6",
          }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0, fontFamily: "Inter, sans-serif" }}>
                {t("recentOrders")}
              </h3>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Latest incoming order activity</p>
            </div>
            <Link href="/farmer/orders" className="no-underline" style={{
              fontSize: "13px", fontWeight: 600, color: "#16A34A",
              display: "flex", alignItems: "center", gap: "4px",
              padding: "6px 12px", borderRadius: "8px",
              border: "1px solid #BBF7D0", background: "#F0FDF4",
              transition: "background 0.15s",
            }}>
              {t("viewAllOrders")}
              <ChevronRight style={{ width: "14px", height: "14px" }} />
            </Link>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {[t("buyer"), t("product"), t("quantity"), t("amount"), t("status")].map((h) => (
                    <th key={h} style={{
                      padding: "11px 20px", textAlign: "left",
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
                {DEMO_ORDERS.slice(0, 4).map((o, i) => (
                  <tr key={o.id} style={{
                    borderBottom: i < 3 ? "1px solid #F3F4F6" : "none",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#F9FAFB"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
                    <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                      {o.consumer.full_name}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#4B5563", fontWeight: 500 }}>
                      {o.order_items[0]?.product?.title}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#6B7280" }}>
                      {o.order_items[0]?.quantity} Kg
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#16A34A" }}>
                      ₹{o.total_amount.toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span className={cn(
                        "badge",
                        o.status === "pending" ? "badge-amber" : o.status === "accepted" ? "badge-blue" : "badge-green"
                      )}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Customer Reviews — 1/3 */}
        <motion.div
          variants={cardVariant} initial="hidden" animate="show"
          style={{
            background: "#ffffff", border: "1px solid #E5E7EB",
            borderRadius: "20px", padding: "20px 22px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0, fontFamily: "Inter, sans-serif" }}>
              {t("customerReviews")}
            </h3>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "3px" }}>
              {t("directMarketplaceFeedbackOnCro")}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            {DEMO_REVIEWS.map((r) => (
              <div key={r.id} style={{
                background: "#F9FAFB", border: "1px solid #F3F4F6",
                borderRadius: "12px", padding: "12px 14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{r.reviewer}</span>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} style={{ width: "12px", height: "12px", color: "#F59E0B", fill: "#F59E0B" }} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "#6B7280", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                  "{r.comment}"
                </p>
                <p style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 600, textAlign: "right", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {r.product}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: "1px solid #F3F4F6", paddingTop: "12px", marginTop: "12px",
            textAlign: "center", fontSize: "12px", color: "#9CA3AF", fontWeight: 600,
          }}>
            Weighted Rating:&nbsp;
            <strong style={{ color: "#111827", fontSize: "14px" }}>4.9 / 5.0</strong>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          8. ELIGIBLE GOVERNMENT SCHEMES
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariant} initial="hidden" animate="show"
        style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "20px", padding: "24px 28px",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0, fontFamily: "Inter, sans-serif" }}>
              {t("eligibleGovernmentSchemes")}
            </h3>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
              Recommended schemes matching your geographic details and crop types
            </p>
          </div>
          <Link href="/farmer/schemes" className="no-underline" style={{
            fontSize: "13px", fontWeight: 600, color: "#16A34A",
            padding: "6px 12px", borderRadius: "8px",
            border: "1px solid #BBF7D0", background: "#F0FDF4",
          }}>
            Match All
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {DEMO_SCHEMES.map((s, idx) => (
            <div key={idx} style={{
              background: "#F9FAFB", border: "1px solid #E5E7EB",
              borderRadius: "14px", padding: "18px 20px",
              display: "flex", flexDirection: "column", gap: "12px",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "#FDE68A";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(245,158,11,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}>
              <div>
                <span style={{
                  fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.05em", padding: "3px 9px", borderRadius: "99px",
                  background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A",
                }}>
                  {s.benefit}
                </span>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "10px 0 4px", lineHeight: 1.35 }}>
                  {s.name}
                </h4>
                <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                  {s.ministry}
                </p>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingTop: "10px", borderTop: "1px solid #E5E7EB",
              }}>
                <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
                  Deadline: {s.deadline}
                </span>
                <button style={{
                  fontSize: "12px", fontWeight: 700, color: "#16A34A",
                  background: "none", border: "none", cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#15803D"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#16A34A"; }}>
                  Apply Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          9. AI PROFITABILITY FORECAST
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariant} initial="hidden" animate="show"
        style={{
          background: "linear-gradient(135deg, #F0FDF4 0%, #ffffff 100%)",
          border: "1px solid #BBF7D0",
          borderRadius: "20px", padding: "24px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "24px", flexWrap: "wrap",
          boxShadow: "0 2px 16px rgba(34,197,94,0.08)",
        }}
      >
        <div>
          <h3 style={{
            fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0,
            display: "flex", alignItems: "center", gap: "8px",
            fontFamily: "Inter, sans-serif",
          }}>
            <Sparkles style={{ width: "18px", height: "18px", color: "#22C55E" }} />
            {t("aiProfitabilityForecast")}
          </h3>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px", maxWidth: "520px", lineHeight: 1.55 }}>
            {t("basedOnCurrentCropMaturityRate")}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          <div style={{
            background: "#ffffff", border: "1px solid #E5E7EB",
            borderRadius: "14px", padding: "14px 20px",
            minWidth: "130px", textAlign: "center",
            boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
              THIS MONTH EST.
            </p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "#111827", marginTop: "6px", fontFamily: "Inter, sans-serif", letterSpacing: "-0.5px" }}>
              ₹1,17,500
            </p>
          </div>
          <div style={{
            background: "linear-gradient(135deg, #22C55E, #16A34A)",
            border: "none", borderRadius: "14px", padding: "14px 20px",
            minWidth: "130px", textAlign: "center",
            boxShadow: "0 4px 14px rgba(34,197,94,0.3)",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
              NEXT MONTH
            </p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginTop: "6px", fontFamily: "Inter, sans-serif", letterSpacing: "-0.5px" }}>
              ₹1,85,000
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}