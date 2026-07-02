"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Leaf,
  LayoutDashboard,
  Package,
  Brain,
  BarChart3,
  ClipboardList,
  TrendingUp,
  MapPin,
  Bell,
  Calendar,
  Settings,
  LogOut,
  CheckCircle2,
  Clock,
  Star,
  CloudSun,
  Droplets,
  Award,
  FileText,
  Cpu,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Nav key map (English label → translation key) ─────────────────────────
const FARMER_NAV_KEY: Record<string, string> = {
  "Dashboard":        "farmerDashboard",
  "Crops & Inventory": "cropsInventory",
  "Market Prices":    "marketPrices",
  "Orders":           "farmerOrders",
  "AI Lab":           "aiLab",
  "AI Assistant":     "aiAssistantFarmer",
  "Irrigation":       "irrigation",
  "Farm Calendar":    "farmCalendar",
  "Logistics Map":    "logisticsMap",
  "Weather AI":       "weatherAI",
  "Analytics":        "analytics",
  "Reports":          "reports",
  "Gov. Schemes":     "govSchemes",
  "Notifications":    "farmerNotifications",
};

const GROUP_KEY: Record<string, string> = {
  "Dashboard":               "farmerDashboard",
  "Marketplace Management":  "marketPrices",
  "AI Tools":                "aiLab",
  "Farm Operations":         "farmCalendar",
  "Analytics & Reports":     "analytics",
  "Communication":           "farmerNotifications",
};

// ─── Grouped Navigation definition ─────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Dashboard",
    items: [
      { href: "/farmer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Marketplace Management",
    items: [
      { href: "/farmer/inventory", label: "Crops & Inventory", icon: Package },
      { href: "/farmer/market",    label: "Market Prices",     icon: TrendingUp },
      { href: "/farmer/orders",    label: "Orders",            icon: ClipboardList },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { href: "/farmer/ai-lab",  label: "AI Lab",       icon: Brain },
      { href: "#ai-assistant",   label: "AI Assistant", icon: Cpu },
    ],
  },
  {
    label: "Farm Operations",
    items: [
      { href: "/farmer/irrigation", label: "Irrigation",    icon: Droplets },
      { href: "/farmer/calendar",   label: "Farm Calendar", icon: Calendar },
      { href: "/farmer/maps",       label: "Logistics Map", icon: MapPin },
      { href: "/farmer/weather",    label: "Weather AI",    icon: CloudSun },
    ],
  },
  {
    label: "Analytics & Reports",
    items: [
      { href: "/farmer/analytics", label: "Analytics",    icon: BarChart3 },
      { href: "/farmer/reports",   label: "Reports",      icon: FileText },
      { href: "/farmer/schemes",   label: "Gov. Schemes", icon: Award },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/farmer/notifications", label: "Notifications", icon: Bell },
    ],
  },
];

interface FarmerSidebarProps {
  profile: Profile | null;
  unreadCount?: number;
  isDemoMode?: boolean;
}

export default function FarmerSidebar({ profile, unreadCount = 0, isDemoMode = true }: FarmerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useVoiceAssistant();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const isActive = (href: string) =>
    href !== "#ai-assistant" && (pathname === href || pathname.startsWith(href + "/"));

  const NavItem = ({ item }: { item: { href: string; label: string; icon: React.ElementType } }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const translatedLabel = FARMER_NAV_KEY[item.label] ? t(FARMER_NAV_KEY[item.label]) : item.label;

    return (
      <Link
        href={item.href}
        onClick={(e) => {
          if (item.href === "#ai-assistant") {
            e.preventDefault();
            openModal();
          }
        }}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative group",
          active
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
            active ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"
          )}
        />
        <span className="flex-1">{translatedLabel}</span>
        {item.href === "/farmer/notifications" && unreadCount > 0 && (
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {active && (
          <motion.div
            layoutId="farmer-active-indicator"
            className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-emerald-500 rounded-r"
          />
        )}
      </Link>
    );
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[280px] z-40 flex flex-col"
      style={{
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
      }}
    >
      {/* ── Brand Logo ────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 0 18px rgba(16,185,129,0.25)",
            }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg leading-none block">AgriNex</span>
            <span className="text-[10px] text-emerald-600 block leading-none mt-0.5 font-mono tracking-wider">
              {t("farmerPlatform")}
            </span>
          </div>
        </Link>
      </div>

      {/* ── User Profile ──────────────────────────────────────────────────── */}
      {profile && (
        <div className="px-5 py-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                {profile.full_name?.charAt(0).toUpperCase() || "F"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5">
                {profile.is_verified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-white" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400 fill-white" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 text-sm font-semibold truncate leading-tight">{profile.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full capitalize font-mono">
                  {profile.role}
                </span>
                <span className="flex items-center gap-0.5 text-slate-500 text-xs">
                  <Star className="w-3 h-3 text-emerald-500 fill-emerald-400" />
                  {profile.trust_score?.toFixed(1) || "4.9"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Grouped Navigation ────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {GROUP_KEY[group.label] ? t(GROUP_KEY[group.label]) : group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href + item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-slate-200 space-y-2 shrink-0">
        {/* Language Switcher */}
        <div className="mb-2">
          <LanguageSwitcher compact />
        </div>

        {isDemoMode && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <span className="text-[11px] text-emerald-700 font-semibold font-mono">
              {t("demoMode").toUpperCase()} ACTIVE
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        )}

        <Link
          href="/farmer/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            pathname === "/farmer/settings"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"
          )}
        >
          <Settings className={cn("w-4 h-4 shrink-0", pathname === "/farmer/settings" ? "text-emerald-600" : "text-slate-400")} />
          <span>{t("farmerSettings")}</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>{t("signOut")}</span>
        </button>
      </div>
    </aside>
  );
}
