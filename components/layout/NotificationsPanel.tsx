/**
 * @fileoverview NotificationsPanel — Slide-out notifications drawer.
 * Phase 5: Bell icon in sidebar header triggers this panel.
 *
 * Features:
 *  - Slide-in from right (Framer Motion)
 *  - Lists all notifications for the current user (newest first)
 *  - Unread badge count on bell icon
 *  - Mark-all-read button
 *  - Notification type icons: order_update (sky), price_alert (emerald), verification (purple)
 *  - Click-outside to close
 */
"use client";

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

// ─── Type → Icon + colour map ─────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  string,
  { Icon: React.ElementType; color: string; bg: string; border: string }
> = {
  order_update: {
    Icon: Package,
    color: "#38bdf8",
    bg: "rgba(14,165,233,0.12)",
    border: "rgba(14,165,233,0.25)",
  },
  price_alert: {
    Icon: TrendingUp,
    color: "#34d399",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
  },
  verification: {
    Icon: ShieldCheck,
    color: "#c084fc",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
  },
};

const defaultType = {
  Icon: Bell,
  color: "#94a3b8",
  bg: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.1)",
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
      className="flex items-start gap-3 p-3 rounded-xl transition-all"
      style={{
        background: n.is_read
          ? "rgba(255,255,255,0.02)"
          : cfg.bg,
        border: `1px solid ${n.is_read ? "rgba(255,255,255,0.05)" : cfg.border}`,
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${
            n.is_read ? "text-slate-400" : "text-white"
          }`}
        >
          {n.title}
        </p>
        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
          {n.message}
        </p>
        <p className="text-slate-700 text-[10px] font-mono mt-1">
          {new Date(n.created_at).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
          style={{ background: cfg.color }} />
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
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAllRead, isPending: marking } = useMarkAllRead();
  const overlayRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Close on click-outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
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
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          />

          {/* Slide-in panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-panel-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[380px] z-50 flex flex-col"
            style={{
              background: "rgba(5, 8, 20, 0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-400" aria-hidden="true" />
                <span
                  id="notifications-panel-title"
                  className="font-semibold text-white text-sm"
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "#ef4444", color: "white" }}
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
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                  >
                    <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Mark all read
                  </button>
                )}
                <button
                  id="notifications-close-btn"
                  onClick={onClose}
                  aria-label="Close notifications panel"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {isLoading ? (
                // Skeleton loader
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl anim-shimmer"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Inbox className="w-10 h-10 text-slate-700 mb-3" />
                  <p className="text-slate-500 text-sm font-medium">
                    No notifications yet
                  </p>
                  <p className="text-slate-700 text-xs mt-1">
                    Order updates and alerts will appear here
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
              <div className="px-4 py-3 border-t border-white/5 text-center">
                <p className="text-slate-700 text-xs">
                  Showing last {notifications.length} notifications
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
      className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: "#ef4444" }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </motion.span>
      )}
    </button>
  );
}
