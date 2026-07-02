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
  Brain,
  Settings,
  MessageSquare,
  Sparkles,
  Bot,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

interface ConsumerSidebarProps {
  profile: Profile | null;
  unreadCount: number;
}

// ─── Navigation Groups ─────────────────────────────────────────────────────
const NAV_MAIN = [
  { href: "/consumer/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/consumer/marketplace",  label: "Marketplace",  icon: ShoppingBag },
];

const NAV_ORDERS = [
  { href: "/consumer/orders",       label: "My Orders",    icon: ClipboardList },
  { href: "/consumer/orders",       label: "Live Tracking", icon: Truck },
];

const NAV_PERSONAL = [
  { href: "/consumer/wishlist",     label: "Wishlist",      icon: Heart },
  { href: "/consumer/reviews",      label: "My Reviews",    icon: Star },
  { href: "/consumer/compare",      label: "Compare",       icon: GitCompare },
  { href: "/consumer/notifications",label: "Notifications", icon: Bell, badgeKey: "notifications" },
];

const NAV_ACCOUNT = [
  { href: "/consumer/settings",     label: "Settings",     icon: Settings },
];

export default function ConsumerSidebar({ profile, unreadCount }: ConsumerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useVoiceAssistant();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/signin");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const getTranslation = (label: string) => {
    const mapping: Record<string, string> = {
      "Dashboard": "dashboard",
      "Marketplace": "marketplace",
      "My Orders": "myOrders",
      "Live Tracking": "liveTracking",
      "Wishlist": "wishlist",
      "My Reviews": "myReviews",
      "Compare": "compare",
      "Notifications": "notifications",
      "Settings": "settings",
      "Sign Out": "signOut",
    };
    const key = mapping[label];
    return key ? t(key) : label;
  };

  const NavLink = ({ item }: { item: { href: string; label: string; icon: React.ElementType; badgeKey?: string } }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative group",
          active ? "text-amber-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        )}
        style={active ? { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" } : {}}
      >
        <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-105", active ? "text-amber-600" : "text-slate-500")} />
        <span className="flex-1 truncate">{getTranslation(item.label)}</span>
        {item.badgeKey === "notifications" && unreadCount > 0 && (
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-red-500">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {active && (
          <div className="w-1.5 h-1.5 rounded-full absolute right-3 top-1/2 -translate-y-1/2" style={{ background: "#d97706" }} />
        )}
      </Link>
    );
  };

  return (
    <div
      className="flex flex-col h-full w-[280px]"
      style={{
        background: "#f8fafc",
        borderRight: "1px solid #e2e8f0",
      }}
    >
      {/* ── Brand Header ─────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-slate-200 flex items-center gap-3 shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            boxShadow: "0 4px 14px rgba(245,158,11,0.2)",
          }}
        >
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-slate-800 text-base leading-none block tracking-tight">AgriNex</span>
          <span className="text-[9px] font-bold block mt-0.5 uppercase tracking-widest font-mono" style={{ color: "#d97706" }}>
            Marketplace
          </span>
        </div>
      </div>

      {/* ── User Info ────────────────────────────────────────────────────── */}
      {profile && (
        <div className="px-4 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
              >
                {profile.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1">
                {profile.is_verified ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-600 fill-white" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-500 fill-white" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 text-xs font-bold truncate leading-tight">{profile.full_name}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono bg-amber-50 text-amber-700 border border-amber-200">
                consumer
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Shopping Assistant (prominent shortcut) ───────────────────── */}
      <div className="px-3 pt-3 shrink-0">
        <button
          onClick={() => openModal()}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(217,119,6,0.06))",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <Bot className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="flex-1 text-left text-amber-800">{t("aiAssistant")}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-600/60" />
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Main */}
        <div>
          <p className="px-2 mb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("dashboard")}</p>
          <div className="space-y-0.5">
            {NAV_MAIN.map((item) => <NavLink key={item.href + item.label} item={item} />)}
          </div>
        </div>

        {/* Orders */}
        <div>
          <p className="px-2 mb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("myOrders")}</p>
          <div className="space-y-0.5">
            {NAV_ORDERS.map((item) => <NavLink key={item.href + item.label} item={item} />)}
          </div>
        </div>

        {/* Personal */}
        <div>
          <p className="px-2 mb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("profile")}</p>
          <div className="space-y-0.5">
            {NAV_PERSONAL.map((item) => <NavLink key={item.href + item.label} item={item} />)}
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="px-2 mb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("settings")}</p>
          <div className="space-y-0.5">
            {NAV_ACCOUNT.map((item) => <NavLink key={item.href} item={item} />)}
          </div>
        </div>
      </nav>

      {/* ── Language Switcher ─────────────────────────────────────────────── */}
      <div className="px-3 pb-2 shrink-0">
        <LanguageSwitcher compact />
      </div>

      {/* ── Sign Out ─────────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-200 shrink-0">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>{t("signOut")}</span>
        </button>
      </div>
    </div>
  );
}
