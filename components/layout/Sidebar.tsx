"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  BarChart2,
  Settings,
  LogOut,
  Leaf,
  CheckCircle2,
  Clock,
  Heart,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import NotificationsPanel, {
  NotificationBellButton,
} from "@/components/layout/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

// ─── Nav link definition ────────────────────────────────────
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
  { href: "/consumer/compare",    label: "Compare",     icon: BarChart2,     roles: ["consumer"] },
  { href: "/consumer/reviews",    label: "Reviews",     icon: Star,          roles: ["consumer"] },
  { href: "/admin",               label: "Admin Panel", icon: BarChart2,     roles: ["admin"] },
  { href: "/settings",            label: "Settings",    icon: Settings,      roles: ["all"] },
];



interface SidebarProps {
  profile: Profile | null;
}

/**
 * Frosted glass sidebar (260px).
 * Phase 5: Added notification bell button + NotificationsPanel slide-out.
 */
export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  // Fetch unread count for badge (notifications hook polls every 10s)
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
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed left-0 top-0 h-full w-[260px] z-40 flex flex-col"
        style={{
          background: "rgba(5, 8, 20, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 0 20px rgba(16,185,129,0.4)",
              }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg leading-none">AgriNex</span>
              <span className="text-[10px] text-emerald-400/70 block leading-none mt-0.5 font-mono">
                AI Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Profile indicator + notification bell */}
        {profile && (
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
                >
                  {profile.full_name?.charAt(0).toUpperCase()}
                </div>
                {/* Verification badge */}
                <div className="absolute -bottom-1 -right-1">
                  {profile.is_verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" fill="currentColor" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{profile.full_name}</p>
                <p className="text-slate-400 text-xs capitalize">{profile.role}</p>
              </div>

              {/* Bell icon with unread badge */}
              <NotificationBellButton
                unreadCount={unreadCount}
                onClick={() => setNotifOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-emerald-400" : "text-slate-500")} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language switcher — LanguageSwitcher component (compact sidebar mode) */}
        <div className="px-4 py-3 border-t border-white/5">
          <LanguageSwitcher compact={true} />
        </div>

        {/* Sign out */}
        <div className="px-3 pb-4">
          <button
            id="sidebar-signout-btn"
            onClick={handleSignOut}
            aria-label="Sign out of AgriNex AI"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Notifications panel (renders in portal-like position outside sidebar) */}
      <NotificationsPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}
