"use client";
import { useTranslation } from "@/hooks/useTranslation";

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
  { Icon: React.ElementType; color: string; bg: string; border: string; label: string; iconBg: string }
> = {
  order_update: {
    Icon: Package,
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    iconBg: "#fef3c7",
    label: "Order Update",
  },
  delivery: {
    Icon: Truck,
    color: "#0369a1",
    bg: "#f0f9ff",
    border: "#bae6fd",
    iconBg: "#e0f2fe",
    label: "Delivery",
  },
  payment: {
    Icon: CreditCard,
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    iconBg: "#dcfce7",
    label: "Payment",
  },
  offer: {
    Icon: Tag,
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#e9d5ff",
    iconBg: "#f3e8ff",
    label: "Offer",
  },
  delivered: {
    Icon: CheckCircle2,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    iconBg: "#dcfce7",
    label: "Delivered",
  },
  price_alert: {
    Icon: Tag,
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    iconBg: "#ffedd5",
    label: "Price Alert",
  },
};

const defaultType = {
  Icon: Bell,
  color: "#64748b",
  bg: "#f8fafc",
  border: "#e2e8f0",
  iconBg: "#f1f5f9",
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
      className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all shadow-sm"
      style={{
        background: n.is_read ? "#f8fafc" : cfg.bg,
        border: `1px solid ${n.is_read ? "#e2e8f0" : cfg.border}`,
        opacity: n.is_read ? 0.7 : 1,
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: n.is_read ? "#f1f5f9" : cfg.iconBg, border: `1px solid ${n.is_read ? "#e2e8f0" : cfg.border}` }}
      >
        <Icon className="w-5 h-5" style={{ color: n.is_read ? "#94a3b8" : cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: n.is_read ? "#94a3b8" : "#1e293b" }}
          >
            {n.title}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold shrink-0">
            {new Date(n.created_at).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
          {n.message}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
            style={{
              background: n.is_read ? "#f1f5f9" : cfg.iconBg,
              color: n.is_read ? "#94a3b8" : cfg.color,
              border: `1px solid ${n.is_read ? "#e2e8f0" : cfg.border}`,
            }}
          >
            {cfg.label}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
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
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-slate-700 font-semibold text-lg mb-2">
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
  const { t } = useTranslation("consumer");
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
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            {t("notifications2")}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Order updates, delivery tracking, payments, and exclusive offers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              disabled={marking}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all premium-card shadow-sm"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all premium-card shadow-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: notifications.length, color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
          { label: "Unread", value: unreadCount, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
          {
            label: "Orders",
            value: notifications.filter((n) => n.type === "order_update").length,
            color: "#0369a1",
            bg: "#f0f9ff",
            border: "#bae6fd",
          },
          {
            label: "Deliveries",
            value: notifications.filter((n) =>
              ["delivery", "delivered"].includes(n.type)
            ).length,
            color: "#16a34a",
            bg: "#f0fdf4",
            border: "#bbf7d0",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 text-center shadow-sm"
            style={{
              background: stat.bg,
              border: `1px solid ${stat.border}`,
            }}
          >
            <p className="text-xl font-extrabold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">
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
              background: filter === f.key ? "#fffbeb" : "#fff",
              border: `1px solid ${filter === f.key ? "#fbbf24" : "#e2e8f0"}`,
              color: filter === f.key ? "#d97706" : "#64748b",
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
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
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
            background: "#fffbeb",
            border: "1px solid #fde68a",
          }}
        >
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-slate-600 font-semibold">
            Place an order to start receiving notifications about your
            deliveries and updates.
          </span>
        </div>
      )}
    </motion.div>
  );
}