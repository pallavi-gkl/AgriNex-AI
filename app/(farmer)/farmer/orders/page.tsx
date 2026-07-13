"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview Farmer Orders Page — /farmer/orders
 * Shows incoming orders from consumers, filtered by farmer_id.
 * Uses direct Supabase queries — no demo data contamination.
 * UI/CSS redesigned for Phase 5: enterprise-grade order management dashboard.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
  Search,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Inbox,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Leaf,
  BarChart2,
  ArrowRight,
  Star,
  MapPin,
  Activity,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useFarmerOrdersDirect, useUpdateFarmerOrderStatus } from "@/hooks/useFarmerOrdersDirect";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType; bg: string; hex: string; hexBg: string }
> = {
  pending: {
    label: "Pending Review",
    color: "text-amber-700",
    icon: Clock,
    bg: "bg-amber-50 border-amber-200",
    hex: "#B45309",
    hexBg: "#FFFBEB",
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-700",
    icon: CheckCircle,
    bg: "bg-blue-50 border-blue-200",
    hex: "#1D4ED8",
    hexBg: "#EFF6FF",
  },
  quality_verified: {
    label: "Quality Verified",
    color: "text-purple-700",
    icon: Package,
    bg: "bg-purple-50 border-purple-200",
    hex: "#7C3AED",
    hexBg: "#F5F3FF",
  },
  dispatched: {
    label: "Dispatched",
    color: "text-sky-700",
    icon: Truck,
    bg: "bg-sky-50 border-sky-200",
    hex: "#0369A1",
    hexBg: "#F0F9FF",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    icon: CheckCircle,
    bg: "bg-emerald-50 border-emerald-200",
    hex: "#047857",
    hexBg: "#ECFDF5",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    icon: XCircle,
    bg: "bg-rose-50 border-rose-200",
    hex: "#B91C1C",
    hexBg: "#FFF1F2",
  },
};

// ─── PREMIUM EMPTY STATE ──────────────────────────────────────────────────────
function EmptyState() {
  const { t } = useTranslation("farmer");
  const router = useRouter();

  const QUICK_ACTIONS = [
    {
      icon: Leaf,
      label: "Add New Crop",
      desc: "Publish a new crop listing",
      color: "#22C55E",
      bg: "#DCFCE7",
      route: "/farmer/inventory",
    },
    {
      icon: ShoppingBag,
      label: "Go to Marketplace",
      desc: "View your active listings",
      color: "#2563EB",
      bg: "#DBEAFE",
      route: "/farmer/inventory",
    },
    {
      icon: Package,
      label: "Inventory",
      desc: "Manage crops & stock",
      color: "#7C3AED",
      bg: "#EDE9FE",
      route: "/farmer/inventory",
    },
    {
      icon: BarChart2,
      label: "View Analytics",
      desc: "Sales & performance data",
      color: "#F59E0B",
      bg: "#FEF3C7",
      route: "/farmer/analytics",
    },
  ];

  const AI_TIPS = [
    { icon: "🌾", tip: "Keep at least 5 active crop listings to attract more buyers." },
    { icon: "📋", tip: "Complete Digital Passports for all crops to build trust." },
    { icon: "🤖", tip: "Enable AI Pricing for competitive real-time rates." },
    { icon: "⭐", tip: "Maintain a Trust Score above 4.8 to get featured." },
    { icon: "📸", tip: "Upload high-quality crop images to increase conversions." },
    { icon: "✍️", tip: "Improve crop descriptions with harvest dates and certifications." },
  ];

  const ACTIVITY = [
    { icon: Package, label: "Inventory Updated", sub: "2 crops marked active", color: "#22C55E", bg: "#DCFCE7" },
    { icon: ShoppingBag, label: "Marketplace Published", sub: "Basmati Rice listing live", color: "#2563EB", bg: "#DBEAFE" },
    { icon: Sparkles, label: "AI Pricing Applied", sub: "Auto-optimised for demand", color: "#F59E0B", bg: "#FEF3C7" },
    { icon: Star, label: "Crop Passport Generated", sub: "Wheat — Digital certificate", color: "#7C3AED", bg: "#EDE9FE" },
  ];

  const WORKFLOW = [
    { icon: ShoppingBag, label: "Customer Places Order", color: "#2563EB", bg: "#DBEAFE" },
    { icon: ClipboardList, label: "Farmer Reviews Order", color: "#F59E0B", bg: "#FEF3C7" },
    { icon: CheckCircle, label: "Order Accepted", color: "#22C55E", bg: "#DCFCE7" },
    { icon: Truck, label: "Shipment Starts", color: "#0369A1", bg: "#F0F9FF" },
    { icon: Star, label: "Delivered Successfully", color: "#7C3AED", bg: "#EDE9FE" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Empty State Hero Card ─────────────────────────────── */}
      <div style={{
        background: "#ffffff", border: "1px solid #E5E7EB",
        borderRadius: "24px", padding: "56px 32px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
        textAlign: "center",
      }}>
        {/* Illustration */}
        <div style={{
          width: "96px", height: "96px",
          background: "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)",
          borderRadius: "28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(34,197,94,0.15)",
          border: "2px solid #86EFAC",
        }}>
          <Inbox style={{ width: "44px", height: "44px", color: "#16A34A" }} />
        </div>

        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1F2937", margin: "0 0 8px", fontFamily: "Inter, sans-serif" }}>
            No Incoming Orders Yet
          </h2>
          <p style={{ fontSize: "14px", color: "#64748B", maxWidth: "440px", lineHeight: 1.65, margin: "0 auto 4px" }}>
            Your marketplace is ready to receive customer orders.
          </p>
          <p style={{ fontSize: "13px", color: "#9CA3AF", maxWidth: "400px", lineHeight: 1.5, margin: "0 auto" }}>
            Publish more crops and keep your inventory active to start receiving orders.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "4px" }}>
          <button
            onClick={() => router.push("/farmer/inventory")}
            style={{
              height: "44px", padding: "0 24px", borderRadius: "12px",
              border: "none", background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
              color: "#ffffff", fontWeight: 700, fontSize: "14px",
              boxShadow: "0 4px 14px rgba(34,197,94,0.25)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(34,197,94,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(34,197,94,0.25)";
            }}
          >
            <Leaf style={{ width: "16px", height: "16px" }} />
            Add New Crop Listing
          </button>
          <button
            onClick={() => router.push("/farmer/inventory")}
            style={{
              height: "44px", padding: "0 24px", borderRadius: "12px",
              border: "1px solid #E5E7EB", background: "#ffffff",
              color: "#374151", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
              transition: "all 0.18s ease",
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
            <ShoppingBag style={{ width: "16px", height: "16px" }} />
            Browse Marketplace
          </button>
        </div>
      </div>

      {/* ── Quick Action Buttons ───────────────────────────────── */}
      <div>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: "0 0 16px", fontFamily: "Inter, sans-serif" }}>
          Quick Actions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {QUICK_ACTIONS.map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ y: -3, boxShadow: "0 12px 28px rgba(0,0,0,0.07)" }}
              onClick={() => router.push(action.route)}
              style={{
                background: "#ffffff", border: "1px solid #E5E7EB",
                borderRadius: "16px", padding: "18px 20px",
                display: "flex", alignItems: "center", gap: "14px",
                cursor: "pointer", textAlign: "left",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = action.color; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB"; }}
            >
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: action.bg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <action.icon style={{ width: "22px", height: "22px", color: action.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", margin: "0 0 2px" }}>{action.label}</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{action.desc}</p>
              </div>
              <ArrowRight style={{ width: "16px", height: "16px", color: "#9CA3AF", flexShrink: 0 }} />
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="lg:grid-cols-3">
        {/* ── How It Works Timeline ──────────────────────────── */}
        <div style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "20px", padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
        }} className="lg:col-span-1">
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: "0 0 20px", fontFamily: "Inter, sans-serif" }}>
            📦 How It Works
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {WORKFLOW.map((step, idx) => (
              <div key={step.label} style={{ display: "flex", gap: "14px" }}>
                {/* Icon + Connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: step.bg, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}>
                    <step.icon style={{ width: "18px", height: "18px", color: step.color }} />
                  </div>
                  {idx < WORKFLOW.length - 1 && (
                    <div style={{
                      width: "2px", flex: 1, minHeight: "20px",
                      background: "linear-gradient(to bottom, #E5E7EB, transparent)",
                      margin: "4px 0",
                    }} />
                  )}
                </div>
                {/* Label */}
                <div style={{ paddingBottom: idx < WORKFLOW.length - 1 ? "16px" : "0", paddingTop: "8px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", margin: 0, lineHeight: 1 }}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Recommendations ────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(135deg, #FAFFFE 0%, #ffffff 100%)",
          border: "1px solid #E5E7EB",
          borderRadius: "20px", padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
        }} className="lg:col-span-2">
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Inter, sans-serif" }}>
            <span style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
              display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Sparkles style={{ width: "14px", height: "14px", color: "#ffffff" }} />
            </span>
            🤖 AI Sales Recommendations
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {AI_TIPS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: "#F9FAFB", border: "1px solid #E5E7EB",
                  borderRadius: "12px", padding: "12px 14px",
                  display: "flex", gap: "10px", alignItems: "flex-start",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                whileHover={{ borderColor: "#22C55E", boxShadow: "0 4px 12px rgba(34,197,94,0.08)" }}
              >
                <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: "22px", marginTop: "1px" }}>{tip.icon}</span>
                <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.55, margin: 0 }}>{tip.tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Marketplace Activity ──────────────────────────── */}
      <div style={{
        background: "#ffffff", border: "1px solid #E5E7EB",
        borderRadius: "20px", padding: "24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
      }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Inter, sans-serif" }}>
          <Activity style={{ width: "18px", height: "18px", color: "#22C55E" }} />
          Recent Marketplace Activity
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {ACTIVITY.map((item, i) => (
            <div key={i} style={{
              background: "#F9FAFB", border: "1px solid #E5E7EB",
              borderRadius: "12px", padding: "14px 16px",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: item.bg, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <item.icon style={{ width: "18px", height: "18px", color: item.color }} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", margin: "0 0 2px" }}>{item.label}</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function FarmerOrdersPage() {
  const { t } = useTranslation("farmer");
  const router = useRouter();

  const { data: orders = [], isLoading, refetch, isRefetching } =
    useFarmerOrdersDirect();
  const { mutate: updateStatus, isPending: updating } =
    useUpdateFarmerOrderStatus();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // ── Filtering (all existing logic preserved) ─────────────────────────────
  const filteredOrders = orders.filter((o) => {
    const consumerName = o.consumer?.full_name ?? o.consumer?.fullName ?? "";
    const firstProduct = o.order_items?.[0]?.product?.title ?? "";
    const matchesSearch =
      consumerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      firstProduct.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Status mutation (existing logic preserved) ────────────────────────────
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateStatus({ orderId, status: newStatus });
  };

  // ── KPI summary ───────────────────────────────────────────────────────────
  const summary = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => ["accepted", "quality_verified"].includes(o.status)).length,
    dispatched: orders.filter((o) => o.status === "dispatched").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders.reduce((acc, o) => acc + (o.total_amount ?? 0), 0),
  };

  const KPI_CARDS = [
    { label: "Total Orders", value: summary.total, color: "#1F2937", bg: "#F9FAFB", border: "#E5E7EB", icon: ClipboardList, iconColor: "#374151", iconBg: "#F3F4F6" },
    { label: t("pendingOrders"), value: summary.pending, color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", icon: Clock, iconColor: "#B45309", iconBg: "#FEF3C7" },
    { label: "Processing", value: summary.processing, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", icon: Package, iconColor: "#1D4ED8", iconBg: "#DBEAFE" },
    { label: t("inTransit"), value: summary.dispatched, color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD", icon: Truck, iconColor: "#0369A1", iconBg: "#E0F2FE" },
    { label: t("deliveredOrders"), value: summary.delivered, color: "#047857", bg: "#ECFDF5", border: "#6EE7B7", icon: CheckCircle, iconColor: "#047857", iconBg: "#D1FAE5" },
    { label: t("totalRevenue"), value: `₹${summary.revenue.toLocaleString("en-IN")}`, color: "#22C55E", bg: "#F0FDF4", border: "#86EFAC", icon: DollarSign, iconColor: "#22C55E", iconBg: "#DCFCE7", wide: true },
  ];

  const STATUS_FILTER_TABS = ["all", "pending", "accepted", "dispatched", "delivered", "cancelled"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px", fontFamily: "Inter, sans-serif" }}>

      {/* ── 1. PREMIUM PAGE HEADER ────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #F0FDF4 0%, #ffffff 60%, #F8FAFC 100%)",
        border: "1px solid #E5E7EB", borderRadius: "20px", padding: "28px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "20px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
      }}>
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
              Order Management
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1F2937", letterSpacing: "-0.5px", margin: 0 }}>
            📦 Incoming Orders
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", fontWeight: 500, marginTop: "4px" }}>
            Review, accept, dispatch and track customer orders from your marketplace.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            style={{
              height: "40px", padding: "0 18px", borderRadius: "10px",
              border: "1px solid #E5E7EB", background: "#ffffff",
              color: "#374151", fontWeight: 700, fontSize: "13px",
              display: "flex", alignItems: "center", gap: "7px",
              cursor: "pointer", transition: "all 0.15s ease", flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#22C55E"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
          >
            <RefreshCw
              style={{ width: "14px", height: "14px", color: "#22C55E" }}
              className={isRefetching ? "animate-spin" : ""}
            />
            Sync Orders
          </button>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            style={{
              height: "40px", padding: "0 18px", borderRadius: "10px",
              border: "none", background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
              color: "#ffffff", fontWeight: 700, fontSize: "13px",
              display: "flex", alignItems: "center", gap: "7px",
              boxShadow: "0 4px 12px rgba(34,197,94,0.22)",
              cursor: "pointer", transition: "all 0.15s ease", flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(34,197,94,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(34,197,94,0.22)"; }}
          >
            <Activity style={{ width: "14px", height: "14px" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── 2. KPI SUMMARY CARDS — always visible ─────────────────── */}
      {!isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }} className="sm:grid-cols-2 lg:grid-cols-6">
          {KPI_CARDS.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
              style={{
                background: card.bg, border: `1px solid ${card.border}`,
                borderRadius: "16px", padding: "18px 16px",
                display: "flex", flexDirection: "column", gap: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                gridColumn: (card as any).wide ? "span 1" : "span 1",
              }}
            >
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <card.icon style={{ width: "18px", height: "18px", color: card.iconColor }} />
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                  {card.label}
                </p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: card.color, margin: 0, fontFamily: "monospace", letterSpacing: "-0.5px" }}>
                  {card.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 3. LOADING SKELETONS ──────────────────────────────────── */}
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              height: "88px", borderRadius: "18px",
              border: "1px solid #E5E7EB", background: "#ffffff",
              overflow: "hidden", position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
              }} />
            </div>
          ))}
          <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
      )}

      {/* ── 4. EMPTY STATE ────────────────────────────────────────── */}
      {!isLoading && orders.length === 0 && <EmptyState />}

      {/* ── 5. SEARCH & FILTERS (shown only when there are orders) ── */}
      {!isLoading && orders.length > 0 && (
        <div style={{
          background: "#ffffff", border: "1px solid #E5E7EB",
          borderRadius: "16px", padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center",
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "360px" }}>
            <Search style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Search by buyer, crop, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", height: "40px", background: "#F9FAFB",
                border: "1px solid #E5E7EB", borderRadius: "10px",
                paddingLeft: "36px", paddingRight: "14px",
                fontSize: "13px", color: "#374151", outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
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

          {/* Status filter pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {STATUS_FILTER_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  height: "36px", padding: "0 14px", borderRadius: "99px",
                  border: "1px solid",
                  borderColor: statusFilter === s ? "#22C55E" : "#E5E7EB",
                  background: statusFilter === s ? "#DCFCE7" : "#F9FAFB",
                  color: statusFilter === s ? "#15803D" : "#64748B",
                  fontSize: "12px", fontWeight: 700,
                  textTransform: "capitalize", cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (statusFilter !== s) {
                    e.currentTarget.style.background = "#F3F4F6";
                    e.currentTarget.style.borderColor = "#D1D5DB";
                  }
                }}
                onMouseLeave={(e) => {
                  if (statusFilter !== s) {
                    e.currentTarget.style.background = "#F9FAFB";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }
                }}
              >
                {s === "all" ? "All Orders" : s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. ORDER CARDS LIST ───────────────────────────────────── */}
      {!isLoading && orders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.pending;
              const StatusIcon = config.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "18px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                  }}
                  whileHover={{ boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}
                >
                  {/* ── Order Header Row ── */}
                  <div
                    style={{
                      padding: "18px 22px",
                      display: "flex", flexWrap: "wrap",
                      alignItems: "center", justifyContent: "space-between",
                      gap: "12px", cursor: "pointer",
                    }}
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    {/* Left: Status icon + Order info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                      <div style={{
                        width: "46px", height: "46px", borderRadius: "13px",
                        background: config.hexBg, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${config.hex}30`,
                      }}>
                        <StatusIcon style={{ width: "22px", height: "22px", color: config.hex }} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937" }}>
                            {order.consumer?.full_name ?? "Customer"}
                          </span>
                          <span style={{
                            fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
                            textTransform: "uppercase", padding: "2px 9px", borderRadius: "99px",
                            color: config.hex, background: config.hexBg, border: `1px solid ${config.hex}30`,
                          }}>
                            {config.label}
                          </span>
                        </div>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "4px 0 0", fontFamily: "monospace" }}>
                          #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                          {order.order_items?.[0]?.product?.title ?? "Mixed Items"} ·{" "}
                          {new Date(order.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount + chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>
                          Order Value
                        </p>
                        <p style={{ fontSize: "17px", fontWeight: 800, color: "#22C55E", margin: 0, fontFamily: "monospace" }}>
                          ₹{(order.total_amount ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "#F9FAFB", border: "1px solid #E5E7EB",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {isExpanded
                          ? <ChevronUp style={{ width: "16px", height: "16px", color: "#64748B" }} />
                          : <ChevronDown style={{ width: "16px", height: "16px", color: "#64748B" }} />
                        }
                      </div>
                    </div>
                  </div>

                  {/* ── Expanded Panel ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{
                          borderTop: "1px solid #F3F4F6",
                          padding: "20px 22px",
                          background: "#FAFAFA",
                          display: "flex", flexDirection: "column", gap: "16px",
                        }}
                      >
                        {/* Line Items */}
                        <div>
                          <h4 style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>
                            Order Items
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {order.order_items?.map((item: any) => (
                              <div key={item.id} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                background: "#ffffff", border: "1px solid #E5E7EB",
                                borderRadius: "10px", padding: "10px 14px",
                                fontSize: "12px", fontFamily: "monospace",
                              }}>
                                <span style={{ fontWeight: 700, color: "#1F2937" }}>
                                  {item.product?.title ?? "Product"}
                                </span>
                                <div style={{ display: "flex", gap: "20px" }}>
                                  <span style={{ color: "#9CA3AF" }}>
                                    {item.quantity} {item.product?.unit_type ?? "Kg"}
                                  </span>
                                  <span style={{ fontWeight: 700, color: "#22C55E" }}>
                                    ₹{(item.quantity * item.price_at_purchase).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Buyer + Address info row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }} className="grid-cols-1 md:grid-cols-2">
                          {order.consumer && (
                            <div style={{
                              background: "#ffffff", border: "1px solid #E5E7EB",
                              borderRadius: "10px", padding: "12px 14px",
                            }}>
                              <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
                                {t("buyerDetails")}
                              </p>
                              <p style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", margin: "0 0 2px" }}>
                                {order.consumer.full_name}
                              </p>
                              {order.consumer.phone_number && (
                                <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                                  📞 {order.consumer.phone_number}
                                </p>
                              )}
                            </div>
                          )}
                          {order.delivery_address && (
                            <div style={{
                              background: "#ffffff", border: "1px solid #E5E7EB",
                              borderRadius: "10px", padding: "12px 14px",
                            }}>
                              <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
                                {t("deliveryAddress")}
                              </p>
                              <p style={{ fontSize: "12px", color: "#374151", margin: 0, lineHeight: 1.5 }}>
                                {order.delivery_address}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons — all existing actions preserved */}
                        <div style={{
                          display: "flex", flexWrap: "wrap", gap: "10px",
                          paddingTop: "12px", borderTop: "1px solid #F3F4F6",
                        }}>
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id, "accepted")}
                                disabled={updating}
                                style={{
                                  height: "38px", padding: "0 18px", borderRadius: "10px",
                                  border: "1px solid #6EE7B7", background: "#ECFDF5",
                                  color: "#047857", fontWeight: 700, fontSize: "13px",
                                  display: "flex", alignItems: "center", gap: "6px",
                                  cursor: "pointer", transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#D1FAE5"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#ECFDF5"; }}
                              >
                                <CheckCircle style={{ width: "14px", height: "14px" }} />
                                {t("acceptOrder1")}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                disabled={updating}
                                style={{
                                  height: "38px", padding: "0 18px", borderRadius: "10px",
                                  border: "1px solid #FECACA", background: "#FFF1F2",
                                  color: "#B91C1C", fontWeight: 700, fontSize: "13px",
                                  display: "flex", alignItems: "center", gap: "6px",
                                  cursor: "pointer", transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#FFE4E6"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#FFF1F2"; }}
                              >
                                <XCircle style={{ width: "14px", height: "14px" }} />
                                {t("rejectOrder")}
                              </button>
                            </>
                          )}

                          {order.status === "accepted" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "dispatched")}
                              disabled={updating}
                              style={{
                                height: "38px", padding: "0 18px", borderRadius: "10px",
                                border: "1px solid #BAE6FD", background: "#F0F9FF",
                                color: "#0369A1", fontWeight: 700, fontSize: "13px",
                                display: "flex", alignItems: "center", gap: "6px",
                                cursor: "pointer", transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#E0F2FE"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "#F0F9FF"; }}
                            >
                              <Truck style={{ width: "14px", height: "14px" }} />
                              Mark as Dispatched
                            </button>
                          )}

                          {order.status === "dispatched" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "delivered")}
                              disabled={updating}
                              style={{
                                height: "38px", padding: "0 18px", borderRadius: "10px",
                                border: "1px solid #6EE7B7", background: "#ECFDF5",
                                color: "#047857", fontWeight: 700, fontSize: "13px",
                                display: "flex", alignItems: "center", gap: "6px",
                                cursor: "pointer", transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#D1FAE5"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "#ECFDF5"; }}
                            >
                              <CheckCircle style={{ width: "14px", height: "14px" }} />
                              {t("confirmDelivery")}
                            </button>
                          )}

                          <button
                            style={{
                              height: "38px", padding: "0 18px", borderRadius: "10px",
                              border: "1px solid #E5E7EB", background: "#F9FAFB",
                              color: "#64748B", fontWeight: 700, fontSize: "13px",
                              display: "flex", alignItems: "center", gap: "6px",
                              cursor: "pointer", transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#F9FAFB"; }}
                          >
                            <MessageSquare style={{ width: "14px", height: "14px" }} />
                            Message Buyer
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* ── Filtered empty state ───────────── */}
          {filteredOrders.length === 0 && (
            <div style={{
              background: "#ffffff", border: "1px solid #E5E7EB",
              borderRadius: "18px", padding: "48px 32px",
              textAlign: "center", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "14px",
                background: "#F9FAFB", border: "1px solid #E5E7EB",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AlertCircle style={{ width: "26px", height: "26px", color: "#D1D5DB" }} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1F2937", margin: 0 }}>
                No orders match your filter
              </h3>
              <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
                Try changing the search criteria or status filter.
              </p>
              <button
                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                style={{
                  height: "38px", padding: "0 20px", borderRadius: "10px",
                  border: "none", background: "#F3F4F6", color: "#374151",
                  fontWeight: 700, fontSize: "13px", cursor: "pointer",
                  transition: "background 0.15s",
                  marginTop: "4px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#E5E7EB"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}