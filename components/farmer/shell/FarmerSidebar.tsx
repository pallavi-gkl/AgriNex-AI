"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocationWeather } from "@/context/LocationWeatherContext";

// ─── Nav key map ────────────────────────────────────────────
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

// ─── Navigation definition ──────────────────────────────────
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
      { href: "/farmer/ai-assistant",   label: "AI Assistant", icon: Cpu },
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

export default function FarmerSidebar({
  profile,
  unreadCount = 0,
  isDemoMode = true,
}: FarmerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useVoiceAssistant();
  const { t } = useTranslation();
  const { location, weather } = useLocationWeather();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const NavItem = ({
    item,
  }: {
    item: { href: string; label: string; icon: React.ElementType };
  }) => {
  const { t } = useTranslation("farmer");
    const Icon = item.icon;
    const active = isActive(item.href);
    const translatedLabel = FARMER_NAV_KEY[item.label]
      ? t(FARMER_NAV_KEY[item.label])
      : item.label;

    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative no-underline",
          active
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
            : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/60"
        )}
      >
        {/* Active left indicator */}
        {active && (
          <motion.span
            layoutId="farmer-sidebar-indicator"
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-emerald-500"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        <Icon
          className={cn(
            "w-4 h-4 shrink-0 transition-all duration-200",
            active
              ? "text-emerald-600"
              : "text-slate-400 group-hover:text-emerald-500 group-hover:scale-110"
          )}
        />
        <span className="flex-1 truncate">{translatedLabel}</span>

        {/* Notification badge on notification link */}
        {item.href === "/farmer/notifications" && unreadCount > 0 && (
          <span className="flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold bg-emerald-500 text-white rounded-full px-1.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Subtle chevron on hover (non-active) */}
        {!active && (
          <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <aside className="ag-sidebar fixed left-0 top-0 h-full w-[280px] z-40 flex flex-col">
      {/* ── Brand Logo ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-[#0f172a] text-lg leading-none block">
              {t("agrinex")}
            </span>
            <span className="text-[10px] text-emerald-600 block leading-none mt-0.5 font-mono tracking-wider uppercase">
              {t("farmerPlatform")}
            </span>
          </div>
        </Link>
      </div>

      {/* ── Location Card ─────────────────────────────────────── */}
      <div
        className="mx-3 my-2 rounded-2xl px-4 py-3 shrink-0"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(5,150,105,0.03) 100%)",
          border: "1px solid rgba(16,185,129,0.18)",
          boxShadow: "0 2px 12px rgba(16,185,129,0.07)",
        }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {/* City / Village */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-extrabold text-sm text-slate-800 truncate">
                {location?.city || "Select Location"}
              </span>
            </div>
            {/* Temperature + Weather */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-semibold">
              <span className="text-base leading-none select-none" aria-hidden>
                {weather?.condition_icon || "🌤"}
              </span>
              <span className="text-slate-700 font-bold">
                {weather?.temperature !== undefined ? `${weather.temperature}°C` : "--°C"}
              </span>
              <span className="text-slate-300">|</span>
              <span className="truncate text-slate-500">
                {weather?.condition || "--"}
              </span>
            </div>
          </div>
        </div>
        {/* Change Location Button */}
        <button
          onClick={() => router.push(`/change-location?from=${encodeURIComponent(pathname)}&platform=farmer`)}
          className="w-full mt-2.5 py-2 px-3 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-0"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
            boxShadow: "0 4px 12px rgba(22, 197, 94, 0.2)",
          }}
        >
          <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
          {t("changeLocation")}
        </button>
      </div>

      {/* ── User Profile ─────────────────────────────────────────── */}
      {profile && (
        <div className="mx-3 my-3 glass-panel rounded-3xl px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              >
                {profile.full_name?.charAt(0).toUpperCase() || "F"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-white shadow">
                {profile.is_verified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 text-sm font-semibold truncate leading-tight">
                {profile.full_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full capitalize font-bold tracking-wide">
                  {profile.role}
                </span>
                <span className="flex items-center gap-0.5 text-slate-500 text-xs">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {profile.trust_score?.toFixed(1) || "4.9"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Grouped Navigation ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 section-label">
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

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="p-4 border-t border-slate-100 space-y-2 shrink-0">
        {/* Language Switcher */}
        <div className="mb-1">
          <LanguageSwitcher compact />
        </div>

        {/* Demo Mode pill */}
        {isDemoMode && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <span className="text-[10px] text-amber-700 font-bold tracking-wide uppercase">
              {t("demoMode")}
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          </div>
        )}

        {/* Settings link */}
        <Link
          href="/farmer/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline",
            pathname === "/farmer/settings"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/60"
          )}
        >
          <Settings
            className={cn(
              "w-4 h-4 shrink-0",
              pathname === "/farmer/settings"
                ? "text-emerald-600"
                : "text-slate-400"
            )}
          />
          <span>{t("farmerSettings")}</span>
        </Link>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span>{t("signOut")}</span>
        </button>
      </div>
    </aside>
  );
}