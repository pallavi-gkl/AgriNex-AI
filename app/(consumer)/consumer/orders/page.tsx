"use client";
import { useTranslation } from "@/hooks/useTranslation";


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
  pending:          { label: "Order Placed",      color: "#d97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.2)",   icon: Clock,        step: 1 },
  accepted:         { label: "Accepted",          color: "#059669", bg: "rgba(5,150,105,0.08)",   border: "rgba(5,150,105,0.2)",   icon: CheckCircle2, step: 2 },
  quality_verified: { label: "Quality Verified",  color: "#7c3aed", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)",  icon: CheckCircle2, step: 3 },
  dispatched:       { label: "In Transit",        color: "#0284c7", bg: "rgba(2,132,199,0.08)",   border: "rgba(2,132,199,0.2)",   icon: Truck,        step: 4 },
  delivered:        { label: "Delivered",         color: "#16a34a", bg: "rgba(22,163,74,0.08)",   border: "rgba(22,163,74,0.2)",   icon: CheckCircle2, step: 5 },
  cancelled:        { label: "Cancelled",         color: "#dc2626", bg: "rgba(220,38,38,0.08)",   border: "rgba(220,38,38,0.2)",   icon: AlertCircle,  step: 0 },
};

const STATUS_STEPS = ["pending", "accepted", "quality_verified", "dispatched", "delivered"];

// ─── Mini progress track ──────────────────────────────────────────────────────
function OrderProgress({ status }: { status: string }) {
  const { t } = useTranslation("consumer");
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  if (status === "cancelled") return (
    <span className="text-xs text-red-600 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-red-500" />{t("cancelled")}</span>
  );
  return (
    <div className="flex items-center gap-1 mt-2">
      {STATUS_STEPS.map((s, i) => {
        const stepNum = i + 1;
        const done = currentStep >= stepNum;
        const active = currentStep === stepNum;
        return (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full transition-all ${active ? "w-2.5 h-2.5 scale-110" : ""}`}
              style={{ background: done ? STATUS_CONFIG[s].color : "#cbd5e1" }} />
            {i < STATUS_STEPS.length - 1 && (
              <div className="h-0.5 w-4 rounded-full"
                style={{ background: currentStep > stepNum ? STATUS_CONFIG[STATUS_STEPS[i]].color : "#f1f5f9" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: any }) {
  const { t } = useTranslation("consumer");
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"];
  const Icon = cfg.icon;
  const firstItem = order.order_items?.[0];
  const itemCount = order.order_items?.length ?? 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="premium-card rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Product image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-50 border-slate-100">
              {firstItem?.product?.image_url ? (
                <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-50/20">
                  <Package className="w-6 h-6 text-emerald-600/35" />
                </div>
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-slate-800 font-bold text-sm truncate">
                {firstItem?.product?.title ?? "Order"}
                {itemCount > 1 && <span className="text-slate-400 text-xs font-semibold ml-1.5">+{itemCount - 1} more</span>}
              </p>
              <p className="text-slate-400 font-mono font-bold text-[10px] mt-0.5">
                #{order.id.substring(0, 8).toUpperCase()}
              </p>
              <OrderProgress status={order.status} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-emerald-600 font-extrabold text-base">₹{(order.total_amount ?? 0).toLocaleString()}</p>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold mt-1.5 border"
              style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
              <Icon className="w-3 h-3" />{cfg.label}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50 text-xs text-slate-450 text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          {order.farmer && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {order.farmer.full_name ?? order.farmer.fullName}
            </span>
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4 text-left bg-slate-50/20">
            {/* Items */}
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Order Items</p>
              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm premium-card p-2.5 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-50 border-slate-100">
                        {item.product?.image_url && (
                          <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-slate-800 text-xs font-bold">{item.product?.title ?? "Product"}</span>
                      <span className="text-slate-450 text-slate-400 text-xs font-bold">Ã—{item.quantity} {item.product?.unit_type}</span>
                    </div>
                    <span className="text-emerald-600 text-xs font-extrabold">
                      ₹{(item.price_at_purchase * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            {order.delivery_address && (
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{t("deliveryAddress")}</p>
                <p className="text-slate-700 text-xs font-medium">{order.delivery_address}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-50">
              {["dispatched", "delivered"].includes(order.status) && (
                <Link href={`/consumer/orders/${order.id}/track`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 border-sky-200 bg-sky-50 text-sky-700 no-underline">
                  <Truck className="w-3.5 h-3.5" />{t("trackOrder")}
                </Link>
              )}
              {order.status === "delivered" && (
                <Link href={`/consumer/reviews?orderId=${order.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 border-amber-200 bg-amber-50 text-amber-700 no-underline">
                  <Star className="w-3.5 h-3.5" />Write Review
                </Link>
              )}
              {firstItem?.product?.id && (
                <Link href={`/consumer/marketplace/${firstItem.product.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-slate-800 transition-all border border-slate-200/80 premium-card no-underline">
                  {t("viewProduct")}
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
  const { t } = useTranslation("consumer");
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
      <h3 className="text-slate-800 font-bold text-lg mb-2">{t("noOrdersYet")}</h3>
      <p className="text-slate-505 text-slate-500 text-sm mb-6 font-semibold">Start shopping directly from verified farmers</p>
      <Link href="/consumer/marketplace"
        className="btn-primary no-underline text-sm">
        {t("browseMarketplace")}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ConsumerOrdersPage() {
  const { t } = useTranslation("consumer");
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-slate-850 text-slate-800">{t("myOrders")}</h1>
          <p className="text-slate-505 text-slate-500 text-xs font-semibold mt-1">Track your farm-fresh deliveries</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} disabled={isRefetching}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-650 text-slate-600 hover:text-slate-800 premium-card cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            {t("refresh")}
          </button>
          <Link href="/consumer/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 border-emerald-200 bg-emerald-50 text-emerald-700 cursor-pointer no-underline">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            {t("farmerDashboard")}
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Orders", value: orders.length, color: "#10b981", icon: <Package className="w-5 h-5" /> },
          { label: "Active Deliveries", value: activeCount, color: "#38bdf8", icon: <Truck className="w-5 h-5" /> },
          { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, color: "#f59e0b", icon: <TrendingUp className="w-5 h-5" /> },
        ].map((stat) => (
          <div key={stat.label} className="premium-card rounded-3xl shadow-sm p-4 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${stat.color}10`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-extrabold text-slate-800 leading-none mt-1">{stat.value}</p>
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
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{
              background: filter === f.key ? "rgba(16,185,129,0.12)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${filter === f.key ? "rgba(16,185,129,0.25)" : "rgba(0,0,0,0.06)"}`,
              color: filter === f.key ? "#059669" : "#475569",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="premium-card rounded-3xl shadow-sm h-24 animate-pulse anim-shimmer" />
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
        <div className="mt-6 rounded-2xl p-4 flex items-center gap-3 text-sm bg-amber-50 border-amber-200 text-slate-700 text-left font-medium">
          <span className="text-base">🛒</span>
          <span>
            Ready to shop? <Link href="/consumer/marketplace" className="text-amber-705 text-amber-700 hover:underline font-bold">{t("browseTheMarketplace")}</Link> to place your first order.
          </span>
        </div>
      )}
    </motion.div>
  );
}