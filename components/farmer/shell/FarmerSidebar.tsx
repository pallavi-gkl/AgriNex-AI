"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Leaf, LayoutDashboard, Package, Brain, BarChart3, ClipboardList,
  TrendingUp, MapPin, Calendar, Droplets, Award, FileText,
  ChevronRight, Settings, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/farmer/dashboard",  label: "Dashboard",          icon: LayoutDashboard },
  { href: "/farmer/inventory",  label: "Crops & Inventory",  icon: Package },
  { href: "/farmer/market",     label: "Market Prices",      icon: TrendingUp },
  { href: "/farmer/orders",     label: "Orders",             icon: ClipboardList },
  { href: "/farmer/ai-lab",     label: "AI Lab",             icon: Brain },
  { href: "/farmer/irrigation", label: "Irrigation",         icon: Droplets },
  { href: "/farmer/calendar",   label: "Farm Calendar",      icon: Calendar },
  { href: "/farmer/maps",       label: "Logistics Map",      icon: MapPin },
  { href: "/farmer/analytics",  label: "Analytics",          icon: BarChart3 },
  { href: "/farmer/reports",    label: "Reports",            icon: FileText },
  { href: "/farmer/schemes",    label: "Gov. Schemes",       icon: Award },
];

const TRANSLATION_MAP: Record<string, string> = {
  "Dashboard":          "farmerDashboard",
  "Crops & Inventory":  "cropsInventory",
  "Market Prices":      "marketPrices",
  "Orders":             "farmerOrders",
  "AI Lab":             "aiLab",
  "Irrigation":         "irrigation",
  "Farm Calendar":      "farmCalendar",
  "Logistics Map":      "logisticsMap",
  "Analytics":          "analytics",
  "Reports":            "reports",
  "Gov. Schemes":       "govSchemes",
};

interface FarmerSidebarProps {
  profile: any;
  unreadCount?: number;
  isDemoMode?: boolean;
}

export default function FarmerSidebar({
  profile,
  unreadCount = 0,
  isDemoMode = true,
}: FarmerSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation("farmer");

  const isActive = (href: string) => {
    if (href === "/farmer/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="farmer-sidebar flex flex-col flex-shrink-0"
      style={{
        width: "280px",
        minWidth: "280px",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        background: "#F8FFF8", // Soft premium green background
        borderRight: "1px solid #E5E7EB",
        padding: "20px 16px",
      }}
    >
      {/* Navigation cards stack */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px", // Gap between cards
          width: "100%",
        }}
      >
        {SIDEBAR_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const labelText = TRANSLATION_MAP[item.label] ? t(TRANSLATION_MAP[item.label]) : item.label;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                whileHover={{ y: -2, scale: 1.01 }}
                style={{
                  background: active ? "#DCFCE7" : "#FFFFFF", // Selected: #DCFCE7, Default: White
                  borderRadius: "16px", // Border Radius: 16px
                  padding: "16px", // Padding: 16px
                  border: `1px solid ${active ? "#86EFAC" : "#E5E7EB"}`,
                  boxShadow: active 
                    ? "0 4px 14px rgba(34,197,94,0.06)" 
                    : "0 2px 8px rgba(0,0,0,0.02)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  position: "relative",
                  cursor: "pointer",
                  height: "56px", // Equal height
                  transition: "background-color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#E6F8E6"; // Hover: #E6F8E6
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
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: active ? 800 : 600,
                    color: active ? "#111827" : "#1F2937",
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {labelText}
                </span>

                {/* Unread badge for orders */}
                {item.href === "/farmer/orders" && unreadCount > 0 && (
                  <span
                    style={{
                      background: "#EF4444",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 800,
                      borderRadius: "99px",
                      padding: "2px 6px",
                      flexShrink: 0,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}

                {/* Right Arrow */}
                <ChevronRight
                  style={{
                    width: "14px",
                    height: "14px",
                    color: active ? "#16A34A" : "#CBD5E1",
                    flexShrink: 0,
                  }}
                />
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Demo Mode Badge */}
      {isDemoMode && (
        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: "10px",
                color: "#92400E",
                textTransform: "uppercase",
              }}
            >
              Demo Active
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
