"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Leaf,
  ShoppingBag,
  ClipboardList,
  Heart,
  Bell,
  LogOut,
  LayoutDashboard,
  Star,
  CheckCircle2,
  Clock,
  GitCompare,
  Truck,
  Settings,
  Sparkles,
  Bot,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocationWeather } from "@/context/LocationWeatherContext";

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
  { href: "/consumer/notifications", label: "Notifications", icon: Bell, badgeKey: "notifications" },
];

const NAV_ACCOUNT = [
  { href: "/consumer/settings",      label: "Settings",     icon: Settings },
];

export default function ConsumerSidebar({ profile, unreadCount }: ConsumerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useVoiceAssistant();
  const { t } = useTranslation();
  const { location, weather } = useLocationWeather();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/signin");
  };

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
      "Settings":      "settings",
      "Sign Out":      "signOut",
    };
    const key = mapping[label];
    return key ? t(key) : label;
  };

  const NavLink = ({
    item,
  }: {
    item: { href: string; label: string; icon: React.ElementType; badgeKey?: string };
  }) => {
  const { t } = useTranslation("consumer");
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 relative no-underline",
          active
            ? "glass-panel text-emerald-700 shadow-sm border-emerald-100/80"
            : "text-slate-500 hover:text-emerald-700 hover:bg-white/60 hover:backdrop-blur-sm"
        )}
      >
        {active && (
          <motion.span
            layoutId="consumer-sidebar-indicator"
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
        <span className="flex-1 truncate">{getTranslation(item.label)}</span>
        {item.badgeKey === "notifications" && unreadCount > 0 && (
          <span className="badge badge-red flex-shrink-0 min-w-[20px] h-5 px-1.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {!active && (
          <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <div className="ag-sidebar flex flex-col h-full w-[280px]">
      {/* ── Brand Logo ─────────────────────────────────────── */}
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
              {t("marketplace")}
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
          onClick={() => router.push(`/change-location?from=${encodeURIComponent(pathname)}&platform=consumer`)}
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

      {/* ── User Profile ─────────────────────────────────────── */}
      {profile && (
        <div className="mx-3 my-3 premium-card rounded-3xl px-4 py-3 border-emerald-100/60">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                {profile.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-white shadow">
                {profile.is_verified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 text-sm font-semibold truncate leading-tight">
                {profile.full_name}
              </p>
              <span className="badge badge-green capitalize">
                {t("consumer1")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Assistant shortcut ─────────────────────────── */}
      <div className="px-3 pb-2 shrink-0">
        <Link
          href="/consumer/ai-assistant"
          className="btn-ai w-full text-sm py-2.5 group flex items-center gap-3 no-underline"
        >
          <Bot className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="flex-1 text-left">{t("aiAssistant")}</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-500/60" />
        </Link>
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.12em]">Main</p>
          <div className="space-y-0.5">
            {NAV_MAIN.map((item) => <NavLink key={item.href + item.label} item={item} />)}
          </div>
        </div>
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.12em]">{t("ordersTitle")}</p>
          <div className="space-y-0.5">
            {NAV_ORDERS.map((item) => <NavLink key={item.href + item.label} item={item} />)}
          </div>
        </div>
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.12em]">{t("personal")}</p>
          <div className="space-y-0.5">
            {NAV_PERSONAL.map((item) => <NavLink key={item.href + item.label} item={item} />)}
          </div>
        </div>
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.12em]">{t("account")}</p>
          <div className="space-y-0.5">
            {NAV_ACCOUNT.map((item) => <NavLink key={item.href} item={item} />)}
          </div>
        </div>
      </nav>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="p-4 border-t border-slate-100 space-y-2 shrink-0">
        <div className="mb-1">
          <LanguageSwitcher compact />
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/80 hover:backdrop-blur-sm transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span>{t("signOut")}</span>
        </button>
      </div>
    </div>
  );
}