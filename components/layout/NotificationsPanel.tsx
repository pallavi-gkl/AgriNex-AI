"use client";
import { useTranslation } from "@/hooks/useTranslation";
﻿/**
 * @fileoverview NotificationsPanel — Slide-out notifications drawer.
 * Redesigned into a beautiful white glass frosted panel.
 */


import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Package,
  TrendingUp,
  ShieldCheck,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { useNotifications, useMarkAllRead } from "@/hooks/useNotifications";
import type { Notification } from "@/types";

// ─── Type → Icon + colour map (Redesigned with design system colors) ───────────
const TYPE_CONFIG: Record<
  string,
  { Icon: React.ElementType; color: string; bg: string; border: string }
> = {
  order_update: {
    Icon: Package,
    color: "#10b981", // Emerald
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  price_alert: {
    Icon: TrendingUp,
    color: "#f59e0b", // Amber
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  verification: {
    Icon: ShieldCheck,
    color: "#8b5cf6", // Purple
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
};

const defaultType = {
  Icon: Bell,
  color: "#64748b",
  bg: "rgba(100,116,139,0.08)",
  border: "rgba(100,116,139,0.2)",
};

// ─── Single notification row ──────────────────────────────────────────────────
function NotificationRow({ n }: { n: Notification }) {
  const cfg = TYPE_CONFIG[n.type] ?? defaultType;
  const { Icon } = cfg;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-start gap-3 p-3.5 rounded-xl transition-all"
      style={{
        background: n.is_read
          ? "#ffffff"
          : "rgba(255,255,255,0.7)",
        border: `1.5px solid ${n.is_read ? "#f1f5f9" : cfg.border}`,
        boxShadow: n.is_read ? "none" : "0 4px 12px rgba(0,0,0,0.02)",
      }}
    >
      {/* Icon Wrapper */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-bold leading-snug ${
            n.is_read ? "text-slate-500" : "text-slate-800"
          }`}
        >
          {n.title}
        </p>
        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed font-medium">
          {n.message}
        </p>
        <p className="text-slate-400 text-[9px] font-bold mt-1.5 uppercase font-mono">
          {new Date(n.created_at).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
          style={{ background: cfg.color }}
        />
      )}
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Panel ────────────────────────────────────────────────────────────────────
export default function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const { t } = useTranslation();
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAllRead, isPending: marking } = useMarkAllRead();
  const overlayRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Close on click-outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
  const { t } = useTranslation();
      if (overlayRef.current === e.target) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-[2px]"
          />

          {/* Slide-in panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-panel-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[360px] sm:w-[385px] z-50 flex flex-col bg-white/90 backdrop-blur-2xl border-l border-white/60 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                  <Bell className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                </div>
                <span
                  id="notifications-panel-title"
                  className="font-bold text-slate-800 text-sm"
                >
                  {t("notifications2")}
                </span>
                {unreadCount > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white"
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    id="notifications-mark-all-read"
                    onClick={() => markAllRead()}
                    disabled={marking}
                    aria-label="Mark all notifications as read"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all border border-slate-200"
                  >
                    <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Mark all read
                  </button>
                )}
                <button
                  id="notifications-close-btn"
                  onClick={onClose}
                  aria-label="Close notifications panel"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
              {isLoading ? (
                // Skeleton loader
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl anim-shimmer border border-slate-200"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-800 text-sm font-bold">
                    {t("allCaughtUp")}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 leading-normal">
                    Order updates and regional market alerts will appear here.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map((n) => (
                    <NotificationRow key={n.id} n={n} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  Showing last {notifications.length} {t("notifications2")}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Bell trigger button (exported for use in Sidebar) ────────────────────────
interface BellButtonProps {
  unreadCount: number;
  onClick: () => void;
}

export function NotificationBellButton({
  unreadCount,
  onClick,
}: BellButtonProps) {
  return (
    <button
      id="sidebar-notifications-bell"
      onClick={onClick}
      className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="w-4.5 h-4.5" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5 bg-red-500"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </motion.span>
      )}
    </button>
  );
}