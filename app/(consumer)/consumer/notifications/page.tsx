"use client";

/**
 * @fileoverview Consumer Notifications Page — /consumer/notifications
 * Displays order updates, delivery tracking, payment confirmations, and offers
 * for the logged-in consumer. Filters by user_id (server-side via hook).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Package,
  Truck,
  CheckCircle2,
  Tag,
  CreditCard,
  AlertCircle,
  CheckCheck,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { useNotifications, useMarkAllRead } from "@/hooks/useNotifications";

// ─── Notification type config (consumer-specific) ─────────────────────────────
const TYPE_CONFIG: Record<
  string,
  { Icon: React.ElementType; color: string; bg: string; border: string; label: string }
> = {
  order_update: {
    Icon: Package,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
    label: "Order Update",
  },
  delivery: {
    Icon: Truck,
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.1)",
    border: "rgba(56,189,248,0.2)",
    label: "Delivery",
  },
  payment: {
    Icon: CreditCard,
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.2)",
    label: "Payment",
  },
  offer: {
    Icon: Tag,
    color: "#c084fc",
    bg: "rgba(192,132,252,0.1)",
    border: "rgba(192,132,252,0.2)",
    label: "Offer",
  },
  delivered: {
    Icon: CheckCircle2,
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.2)",
    label: "Delivered",
  },
  price_alert: {
    Icon: Tag,
    color: "#fb923c",
    bg: "rgba(251,146,60,0.1)",
    border: "rgba(251,146,60,0.2)",
    label: "Price Alert",
  },
};

const defaultType = {
  Icon: Bell,
  color: "#94a3b8",
  bg: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.08)",
  label: "Notification",
};

// ─── Notification Card ────────────────────────────────────────────────────────
function NotifCard({ n, onRead }: { n: any; onRead: (id: string) => void }) {
  const cfg = TYPE_CONFIG[n.type] ?? defaultType;
  const Icon = cfg.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={() => !n.is_read && onRead(n.id)}
      className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all"
      style={{
        background: n.is_read ? "rgba(255,255,255,0.02)" : cfg.bg,
        border: `1px solid ${n.is_read ? "rgba(255,255,255,0.05)" : cfg.border}`,
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: n.is_read ? "#64748b" : "#f1f5f9" }}
          >
            {n.title}
          </p>
          <span className="text-[10px] text-slate-600 font-mono shrink-0">
            {new Date(n.created_at).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
          {n.message}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide font-mono"
            style={{
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
            }}
          >
            {cfg.label}
          </span>
          <span className="text-[10px] text-slate-600 font-mono">
            {new Date(n.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 mt-2"
          style={{ background: cfg.color }}
        />
      )}
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Inbox className="w-16 h-16 text-slate-700 mb-4" />
      <h3 className="text-white font-semibold text-lg mb-2">
        No notifications yet
      </h3>
      <p className="text-slate-400 text-sm">
        Order updates, delivery tracking, and offers will appear here
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ConsumerNotificationsPage() {
  const { data: notifications = [], isLoading, refetch, isRefetching } =
    useNotifications();
  const { mutate: markAllRead, isPending: marking } = useMarkAllRead();
  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => n.type === filter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            Notifications
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Order updates, delivery tracking, payments, and exclusive offers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              disabled={marking}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: notifications.length, color: "#94a3b8" },
          { label: "Unread", value: unreadCount, color: "#f59e0b" },
          {
            label: "Orders",
            value: notifications.filter((n) => n.type === "order_update")
              .length,
            color: "#38bdf8",
          },
          {
            label: "Deliveries",
            value: notifications.filter((n) =>
              ["delivery", "delivered"].includes(n.type)
            ).length,
            color: "#4ade80",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              className="text-xl font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread" },
          { key: "order_update", label: "Orders" },
          { key: "delivery", label: "Delivery" },
          { key: "payment", label: "Payment" },
          { key: "offer", label: "Offers" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background:
                filter === f.key
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                filter === f.key
                  ? "rgba(245,158,11,0.35)"
                  : "rgba(255,255,255,0.06)"
              }`,
              color: filter === f.key ? "#f59e0b" : "#64748b",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl animate-pulse"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2 max-w-3xl">
          <AnimatePresence>
            {filtered.map((n) => (
              <NotifCard key={n.id} n={n} onRead={() => {}} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info banner */}
      {!isLoading && notifications.length === 0 && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3 text-sm"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
          }}
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-400">
            Place an order to start receiving notifications about your
            deliveries and updates.
          </span>
        </div>
      )}
    </motion.div>
  );
}
