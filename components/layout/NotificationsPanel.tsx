"use client";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Package,
  TrendingUp,
  ShieldCheck,
  CheckCheck,
  Inbox,
  Award,
  Cpu,
  Star,
  Heart,
  Leaf,
  Sparkles,
  Trash2,
  Flame,
  Truck,
  HelpCircle,
} from "lucide-react";
import { useNotifications, useMarkAllRead, useClearRead } from "@/hooks/useNotifications";
import type { Notification } from "@/types";
import Link from "next/link";

// ─── Type → Icon + colour map (Redesigned with design system colors) ───────────
const TYPE_CONFIG: Record<
  string,
  { Icon: React.ElementType; color: string; bg: string; border: string }
> = {
  order_update: {
    Icon: Package,
    color: "#10b981", // Emerald Green
    bg: "#f0fdf4",
    border: "#dcfce7",
  },
  price_alert: {
    Icon: TrendingUp,
    color: "#f59e0b", // Amber Yellow
    bg: "#fffbeb",
    border: "#fde68a",
  },
  verification: {
    Icon: ShieldCheck,
    color: "#8b5cf6", // Purple
    bg: "#faf5ff",
    border: "#e9d5ff",
  },
  flash_deal: {
    Icon: Flame,
    color: "#f97316", // Orange
    bg: "#fff7ed",
    border: "#ffedd5",
  },
  rewards: {
    Icon: Award,
    color: "#ec4899", // Pink/Magenta
    bg: "#fdf2f8",
    border: "#fbcfe8",
  },
  ai: {
    Icon: Cpu,
    color: "#3b82f6", // Blue
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  review: {
    Icon: Star,
    color: "#fbbf24", // Gold
    bg: "#fffdf0",
    border: "#fef3c7",
  },
  wishlist: {
    Icon: Heart,
    color: "#ef4444", // Red
    bg: "#fef2f2",
    border: "#fee2e2",
  },
  seasonal: {
    Icon: Leaf,
    color: "#06b6d4", // Cyan/Teal
    bg: "#ecfeff",
    border: "#a5f3fc",
  },
};

const defaultType = {
  Icon: Bell,
  color: "#64748b",
  bg: "#f8fafc",
  border: "#e2e8f0",
};

function getNotificationAction(message: string): { label: string; href: string } | null {
  const msg = message.toLowerCase();
  if (msg.includes("track live") || msg.includes("track order")) {
    return { label: "Track Live →", href: "/consumer/orders" };
  }
  if (msg.includes("rate product") || msg.includes("rate")) {
    return { label: "Rate Product →", href: "/consumer/reviews" };
  }
  if (msg.includes("shop now") || msg.includes("buy now") || msg.includes("special price")) {
    return { label: "Shop Now →", href: "/consumer/marketplace" };
  }
  if (msg.includes("compare") || msg.includes("compare now")) {
    return { label: "Compare Now →", href: "/consumer/compare" };
  }
  if (msg.includes("view wishlist") || msg.includes("wishlist")) {
    return { label: "View Wishlist →", href: "/consumer/wishlist" };
  }
  if (msg.includes("view order")) {
    return { label: "View Order →", href: "/consumer/orders" };
  }
  return null;
}

// ─── Single notification row ──────────────────────────────────────────────────
function NotificationRow({ n, onClickAction }: { n: Notification; onClickAction: () => void }) {
  const cfg = TYPE_CONFIG[n.type] ?? defaultType;
  const { Icon } = cfg;
  const action = getNotificationAction(n.message);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-start gap-3 p-4 rounded-2xl transition-all"
      style={{
        background: n.is_read ? "#ffffff" : "rgba(240, 253, 244, 0.4)",
        border: `1.5px solid ${n.is_read ? "#f1f5f9" : cfg.border}`,
        boxShadow: n.is_read ? "none" : "0 4px 14px rgba(16,185,129,0.03)",
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
      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-start gap-2">
          <p
            className={`text-xs font-bold leading-snug ${
              n.is_read ? "text-slate-650" : "text-slate-900"
            }`}
          >
            {n.title}
          </p>
        </div>
        <p className="text-slate-500 text-[11px] mt-1 leading-relaxed font-medium">
          {n.message}
        </p>

        {/* Action Button */}
        {action && (
          <Link
            href={action.href}
            onClick={onClickAction}
            className="inline-flex items-center gap-1 mt-2.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all no-underline"
          >
            {action.label}
          </Link>
        )}

        <p className="text-slate-400 text-[8px] font-bold mt-2 uppercase tracking-wide">
          {new Date(n.created_at).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
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
  variant?: "drawer" | "dropdown";
}

// ─── Panel ────────────────────────────────────────────────────────────────────
export default function NotificationsPanel({
  isOpen,
  onClose,
  variant = "drawer",
}: NotificationsPanelProps) {
  const { t } = useTranslation();
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAllRead, isPending: marking } = useMarkAllRead();
  const { mutate: clearRead, isPending: clearing } = useClearRead();
  const overlayRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount = notifications.length - unreadCount;

  // Close on click-outside (only for drawer overlay)
  useEffect(() => {
    if (!isOpen || variant !== "drawer") return;
    const handler = (e: MouseEvent) => {
      if (overlayRef.current === e.target) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, variant]);

  // Auto mark all read when panel opens
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllRead();
    }
  }, [isOpen, unreadCount, markAllRead]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay — only for drawer variant */}
          {variant === "drawer" && (
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-[2px]"
            />
          )}

          {/* Dropdown panel positioned overlaying everything */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-panel-title"
            initial={variant === "drawer" ? { x: "100%" } : { opacity: 0, y: -10, scale: 0.95 }}
            animate={variant === "drawer" ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={variant === "drawer" ? { x: "100%" } : { opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={
              variant === "drawer"
                ? "fixed right-0 top-0 h-full w-[360px] sm:w-[385px] z-50 flex flex-col bg-white border-l border-slate-200 shadow-2xl"
                : "absolute right-0 top-full mt-2 w-[360px] sm:w-[385px] max-h-[500px] z-[99999] flex flex-col bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden"
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                  <Bell className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                </div>
                <span
                  id="notifications-panel-title"
                  className="font-extrabold text-slate-800 text-sm"
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white"
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    id="notifications-mark-all-read"
                    onClick={() => markAllRead()}
                    disabled={marking}
                    title="Mark all as read"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all border border-slate-200 cursor-pointer bg-white"
                  >
                    <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Read All
                  </button>
                )}
                {readCount > 0 && (
                  <button
                    id="notifications-clear-read"
                    onClick={() => clearRead()}
                    disabled={clearing}
                    title="Clear read alerts"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all border border-red-200 cursor-pointer bg-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Clear Read
                  </button>
                )}
                <button
                  id="notifications-close-btn"
                  onClick={onClose}
                  aria-label="Close notifications panel"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer border-0 bg-transparent"
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
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                    <Inbox className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-800 text-sm font-bold">
                    You're all caught up!
                  </p>
                  <p className="text-slate-450 text-xs mt-1 leading-normal font-medium">
                    No notifications yet. Alert logs will appear here.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map((n) => (
                    <NotificationRow key={n.id} n={n} onClickAction={onClose} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-center">
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                  Showing last {notifications.length} alerts
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
      className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all border-0 bg-transparent"
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