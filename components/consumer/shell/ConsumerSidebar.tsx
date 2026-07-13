"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Star,
  GitCompare,
  Truck,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface ConsumerSidebarProps {
  profile: Profile | null;
  unreadCount: number;
}

const NAV_MAIN = [
  { href: "/consumer/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/consumer/marketplace",  label: "Marketplace",  icon: ShoppingBag },
];

const NAV_ORDERS = [
  { href: "/consumer/orders",       label: "My Orders",    icon: ClipboardList },
  { href: "/consumer/orders",       label: "Live Tracking", icon: Truck },
];

const NAV_PERSONAL = [
  { href: "/consumer/wishlist",      label: "Wishlist",      icon: Heart },
  { href: "/consumer/reviews",       label: "My Reviews",    icon: Star },
  { href: "/consumer/compare",       label: "Compare",       icon: GitCompare },
];

// NAV_ACCOUNT removed — Settings/Profile now accessible via Header Profile dropdown

export default function ConsumerSidebar({ profile, unreadCount }: ConsumerSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const getTranslation = (label: string) => {
    const mapping: Record<string, string> = {
      "Dashboard":     "dashboard",
      "Marketplace":   "marketplace",
      "My Orders":     "myOrders",
      "Live Tracking": "liveTracking",
      "Wishlist":      "wishlist",
      "My Reviews":    "myReviews",
      "Compare":       "compare",
      "Notifications": "notifications",
    };
    const key = mapping[label];
    return key ? t(key) : label;
  };

  /* ─── Premium Navigation Card ─── */
  const NavLink = ({
    item,
  }: {
    item: { href: string; label: string; icon: React.ElementType; badgeKey?: string };
  }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link href={item.href} className="no-underline block">
        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          style={{
            background: active ? "#DCFCE7" : "#FFFFFF", // Selected: light green
            borderRadius: "16px",
            padding: "16px",
            border: `1px solid ${active ? "#86EFAC" : "#E5E7EB"}`,
            boxShadow: active 
              ? "0 4px 14px rgba(34,197,94,0.06)" 
              : "0 2px 8px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "relative",
            cursor: "pointer",
            height: "56px",
            transition: "background-color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!active) {
              e.currentTarget.style.backgroundColor = "#E6F8E6"; // Hover light green
              e.currentTarget.style.borderColor = "#A7F3D0";
            }
          }}
          onMouseLeave={(e) => {
            if (!active) {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }
          }}
        >
          {/* Active Indicator Line */}
          {active && (
            <motion.div
              layoutId="active-indicator"
              style={{
                position: "absolute",
                left: "0",
                top: "14px",
                bottom: "14px",
                width: "4px",
                background: "#22C55E",
                borderRadius: "0 4px 4px 0",
              }}
            />
          )}

          {/* Left Icon */}
          <Icon
            style={{
              width: "18px",
              height: "18px",
              color: active ? "#16A34A" : "#64748B",
              flexShrink: 0,
            }}
          />

          {/* Label Text */}
          <span
            style={{
              flex: "1 1 0%",
              fontSize: "14px",
              fontWeight: active ? 700 : 550,
              color: active ? "#16A34A" : "#374151",
              fontFamily: "Inter, sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {getTranslation(item.label)}
          </span>

          {/* Unread badge for notifications */}
          {item.badgeKey === "notifications" && unreadCount > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#EF4444",
                color: "#FFFFFF",
                borderRadius: "9999px",
                fontSize: "10px",
                fontWeight: 700,
                minWidth: "20px",
                height: "20px",
                padding: "0 6px",
                flexShrink: 0,
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}

          {/* ChevronRight */}
          <ChevronRight
            style={{
              width: "14px",
              height: "14px",
              color: active ? "#16A34A" : "#9CA3AF",
              flexShrink: 0,
              transition: "transform 0.2s ease",
            }}
          />
        </motion.div>
      </Link>
    );
  };

  return (
    <div className="ag-sidebar flex flex-col h-full w-[280px]" style={{ background: "#FFFFFF" }}>
      {/* ── Brand Logo — matches visual proportions of Farmer Platform sidebar ── */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #E5E7EB",
          background: "#F6FFF4", // Light green background
          display: "flex",
          alignItems: "center",
          height: "70px",
          boxSizing: "border-box",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 group no-underline">
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: "linear-gradient(135deg, #10B981, #059669)",
              boxShadow: "0 2px 8px rgba(16,185,129,0.22)",
              transition: "transform 0.25s ease",
            }}
            className="group-hover:scale-105"
          >
            <Leaf style={{ width: "18px", height: "18px", color: "#fff" }} />
          </div>
          <div>
            <span
              style={{
                display: "block",
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: 1.1,
                color: "#111827",
                letterSpacing: "-0.3px",
              }}
            >
              {t("agrinex") || "AgriNex"}
            </span>
            <span
              style={{
                display: "block",
                fontWeight: 500,
                fontSize: "9.5px",
                lineHeight: 1,
                color: "#10B981",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              Consumer Platform
            </span>
          </div>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <div>
          <p style={{
            margin: "0 0 8px 12px",
            fontSize: "10px",
            fontWeight: 800,
            color: "#94A3B8",
            letterSpacing: "0.12em",
            textTransform: "uppercase"
          }}>{t("main") || "Main"}</p>
          <div className="space-y-2">
            {NAV_MAIN.map((item) => <NavLink key={item.href + item.label} item={item} />)}
          </div>
        </div>
        <div>
          <p style={{
            margin: "0 0 8px 12px",
            fontSize: "10px",
            fontWeight: 800,
            color: "#94A3B8",
            letterSpacing: "0.12em",
            textTransform: "uppercase"
          }}>{t("ordersTitle") || "Orders"}</p>
          <div className="space-y-2">
            {NAV_ORDERS.map((item) => <NavLink key={item.href + item.label} item={item} />)}
          </div>
        </div>
        <div>
          <p style={{
            margin: "0 0 8px 12px",
            fontSize: "10px",
            fontWeight: 800,
            color: "#94A3B8",
            letterSpacing: "0.12em",
            textTransform: "uppercase"
          }}>{t("personal") || "Personal"}</p>
          <div className="space-y-2">
            {NAV_PERSONAL.map((item) => <NavLink key={item.href + item.label} item={item} />)}
          </div>
        </div>
      </nav>
    </div>
  );
}