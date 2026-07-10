"use client";
import { useTranslation } from "@/hooks/useTranslation";


import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Settings,
  LogOut,
  Leaf,
  CheckCircle2,
  Clock,
  Heart,
  Star,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import NotificationsPanel, {
  NotificationBellButton,
} from "@/components/layout/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Array<"farmer" | "consumer" | "admin" | "all">;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",                    label: "Home",        icon: Home,          roles: ["all"] },
  { href: "/farmer/dashboard",    label: "Dashboard",   icon: LayoutDashboard, roles: ["farmer", "admin"] },
  { href: "/consumer/dashboard",  label: "Dashboard",   icon: LayoutDashboard, roles: ["consumer"] },
  { href: "/consumer/marketplace",label: "Marketplace", icon: ShoppingBag,   roles: ["consumer", "farmer", "admin"] },
  { href: "/consumer/orders",     label: "My Orders",   icon: ClipboardList, roles: ["consumer"] },
  { href: "/orders",              label: "My Orders",   icon: ClipboardList, roles: ["farmer"] },
  { href: "/consumer/wishlist",   label: "Wishlist",    icon: Heart,         roles: ["consumer"] },
  { href: "/consumer/compare",    label: "Compare",     icon: Star,          roles: ["consumer"] },
  { href: "/consumer/reviews",    label: "Reviews",     icon: Star,          roles: ["consumer"] },
  { href: "/admin",               label: "Admin Panel", icon: LayoutDashboard, roles: ["admin"] },
  { href: "/settings",            label: "Settings",    icon: Settings,      roles: ["all"] },
];

interface SidebarProps {
  profile: Profile | null;
}

export default function Sidebar({ profile }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router   = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes("all") ||
    (profile?.role && item.roles.includes(profile.role as "farmer" | "consumer" | "admin"))
  );

  return (
    <>
      <aside
        className="ag-sidebar fixed left-0 top-0 h-full w-[260px] z-40 flex flex-col"
        style={{
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3 group no-underline">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
              }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-base leading-none block">{t("agrinex")}</span>
              <span className="text-[10px] text-emerald-600 block leading-none mt-1 font-mono tracking-wider uppercase">
                {t("aiPlatform")}
              </span>
            </div>
          </Link>
        </div>

        {/* Profile indicator */}
        {profile && (
          <div className="mx-3 my-3 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  {profile.full_name?.charAt(0).toUpperCase()}
                </div>
                {/* Verification badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-white shadow">
                  {profile.is_verified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-800 text-xs font-bold truncate leading-tight">{profile.full_name}</p>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">{profile.role}</p>
              </div>

              {/* Notification Bell */}
              <NotificationBellButton
                unreadCount={unreadCount}
                onClick={() => setNotifOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative no-underline",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                    : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/60"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="generic-sidebar-indicator"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-emerald-500"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 shrink-0 transition-transform duration-200", isActive ? "text-emerald-600" : "text-slate-400 group-hover:scale-110")} />
                <span className="flex-1 truncate">{item.label}</span>
                {!isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language Switcher */}
        <div className="px-4 py-3 border-t border-slate-100">
          <LanguageSwitcher compact={true} />
        </div>

        {/* Sign out */}
        <div className="px-3 pb-4">
          <button
            id="sidebar-signout-btn"
            onClick={handleSignOut}
            aria-label="Sign out of AgriNex AI"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" aria-hidden="true" />
            <span>{t("signOut")}</span>
          </button>
        </div>
      </aside>

      {/* Notifications panel */}
      <NotificationsPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}