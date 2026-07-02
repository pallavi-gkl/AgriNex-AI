"use client";

/**
 * @fileoverview Consumer Orders Page — /consumer/orders
 * Displays all orders for the logged-in consumer with status tracking,
 * real-time updates, and quick actions.
 * Queries are strictly filtered by consumer_id — no cross-role data.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Package, Truck, CheckCircle2, Clock, AlertCircle, ChevronRight,
  MapPin, Calendar, ShoppingBag, Star, BarChart2,
  RefreshCw, TrendingUp, ArrowRight,
} from "lucide-react";
import { useConsumerOrders } from "@/hooks/useConsumerOrders";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType; step: number }> = {
  pending:          { label: "Order Placed",      color: "#fbbf24", bg: "rgba(251,191,36,0.12)",   border: "rgba(251,191,36,0.3)",   icon: Clock,        step: 1 },
  accepted:         { label: "Accepted",          color: "#34d399", bg: "rgba(52,211,153,0.12)",   border: "rgba(52,211,153,0.3)",   icon: CheckCircle2, step: 2 },
  quality_verified: { label: "Quality Verified",  color: "#c084fc", bg: "rgba(192,132,252,0.12)",  border: "rgba(192,132,252,0.3)",  icon: CheckCircle2, step: 3 },
  dispatched:       { label: "In Transit",        color: "#38bdf8", bg: "rgba(56,189,248,0.12)",   border: "rgba(56,189,248,0.3)",   icon: Truck,        step: 4 },
  delivered:        { label: "Delivered",         color: "#4ade80", bg: "rgba(74,222,128,0.12)",   border: "rgba(74,222,128,0.3)",   icon: CheckCircle2, step: 5 },
  cancelled:        { label: "Cancelled",         color: "#f87171", bg: "rgba(248,113,113,0.12)",  border: "rgba(248,113,113,0.3)",  icon: AlertCircle,  step: 0 },
};

const STATUS_STEPS = ["pending", "accepted", "quality_verified", "dispatched", "delivered"];

// ─── Mini progress track ──────────────────────────────────────────────────────
function OrderProgress({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  if (status === "cancelled") return (
    <span className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Cancelled</span>
  );
  return (
    <div className="flex items-center gap-1 mt-2">
      {STATUS_STEPS.map((s, i) => {
        const stepNum = i + 1;
        const done = currentStep >= stepNum;
        const active = currentStep === stepNum;
        return (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full transition-all ${active ? "w-3 h-3" : ""}`}
              style={{ background: done ? STATUS_CONFIG[s].color : "rgba(255,255,255,0.08)" }} />
            {i < STATUS_STEPS.length - 1 && (
              <div className="h-0.5 w-4 rounded-full"
                style={{ background: currentStep > stepNum ? STATUS_CONFIG[STATUS_STEPS[i]].color : "rgba(255,255,255,0.06)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"];
  const Icon = cfg.icon;
  const firstItem = order.order_items?.[0];
  const itemCount = order.order_items?.length ?? 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Product image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
              style={{ background: "rgba(16,185,129,0.08)" }}>
              {firstItem?.product?.image_url ? (
                <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-400/40" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {firstItem?.product?.title ?? "Order"}
                {itemCount > 1 && <span className="text-slate-400 text-xs ml-1">+{itemCount - 1} more</span>}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                #{order.id.substring(0, 8).toUpperCase()}
              </p>
              <OrderProgress status={order.status} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-emerald-400 font-bold text-base">₹{(order.total_amount ?? 0).toLocaleString()}</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1"
              style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <Icon className="w-3 h-3" />{cfg.label}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          {order.farmer && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {order.farmer.full_name ?? order.farmer.fullName}
            </span>
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 px-5 pb-5 pt-4 space-y-4">
            {/* Items */}
            <div>
              <p className="text-slate-400 text-xs mb-2">Order Items</p>
              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                        {item.product?.image_url && (
                          <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-white text-xs">{item.product?.title ?? "Product"}</span>
                      <span className="text-slate-500 text-xs">×{item.quantity} {item.product?.unit_type}</span>
                    </div>
                    <span className="text-emerald-400 text-xs font-semibold">
                      ₹{(item.price_at_purchase * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            {order.delivery_address && (
              <div>
                <p className="text-slate-400 text-xs mb-1">Delivery Address</p>
                <p className="text-white text-xs">{order.delivery_address}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {["dispatched", "delivered"].includes(order.status) && (
                <Link href={`/consumer/orders/${order.id}/track`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                  style={{ background: "rgba(56,189,248,0.2)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8" }}>
                  <Truck className="w-3.5 h-3.5" />Track Order
                </Link>
              )}
              {order.status === "delivered" && (
                <Link href={`/consumer/reviews?orderId=${order.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                  style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                  <Star className="w-3.5 h-3.5" />Write Review
                </Link>
              )}
              {firstItem?.product?.id && (
                <Link href={`/consumer/marketplace/${firstItem.product.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  View Product
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShoppingBag className="w-16 h-16 text-slate-700 mb-4" />
      <h3 className="text-white font-semibold text-lg mb-2">No orders yet</h3>
      <p className="text-slate-400 text-sm mb-6">Start shopping directly from verified farmers</p>
      <Link href="/consumer/marketplace"
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}>
        Browse Marketplace
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ConsumerOrdersPage() {
  const { data: orders = [], isLoading, refetch, isRefetching } = useConsumerOrders();
  const [filter, setFilter] = useState("all");

  const filtered = orders.filter((o: any) => {
    if (filter === "all") return true;
    if (filter === "active") return ["pending", "accepted", "quality_verified", "dispatched"].includes(o.status);
    if (filter === "delivered") return o.status === "delivered";
    return o.status === filter;
  });

  // Stats
  const totalSpent = orders.reduce((s: number, o: any) => s + (o.total_amount ?? 0), 0);
  const activeCount = orders.filter((o: any) => ["pending", "accepted", "quality_verified", "dispatched"].includes(o.status)).length;
  const deliveredCount = orders.filter((o: any) => o.status === "delivered").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-slate-400 text-sm mt-1">Track your farm-fresh deliveries</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} disabled={isRefetching}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link href="/consumer/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:scale-105"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>
            <BarChart2 className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Orders", value: orders.length, color: "#10b981", icon: <Package className="w-5 h-5" /> },
          { label: "Active Deliveries", value: activeCount, color: "#38bdf8", icon: <Truck className="w-5 h-5" /> },
          { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, color: "#fbbf24", icon: <TrendingUp className="w-5 h-5" /> },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="text-white font-bold text-lg leading-none mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "All Orders" },
          { key: "active", label: "Active" },
          { key: "delivered", label: "Delivered" },
          { key: "pending", label: "Pending" },
          { key: "cancelled", label: "Cancelled" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              background: filter === f.key ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f.key ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: filter === f.key ? "#34d399" : "#64748b",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl h-24 animate-pulse anim-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CTA when no orders */}
      {!isLoading && orders.length === 0 && (
        <div className="mt-6 rounded-2xl p-4 flex items-center gap-3 text-sm"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
          <span className="text-amber-400">🛒</span>
          <span className="text-slate-400">
            Ready to shop? <Link href="/consumer/marketplace" className="text-amber-400 hover:underline font-bold">Browse the marketplace</Link> to place your first order.
          </span>
        </div>
      )}
    </motion.div>
  );
}
