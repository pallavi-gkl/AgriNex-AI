"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React from "react";
import Link from "next/link";
import {
  Bell,
  Sparkles,
  User,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import type { Profile } from "@/types";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/context/ThemeContext";

interface GlobalTopbarProps {
  profile: Profile | null;
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
}

export default function GlobalTopbar({ profile, onMenuClick, isMobileMenuOpen }: GlobalTopbarProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();


  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <header className="ag-topbar sticky top-0 h-16 flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-full border border-slate-200/80 text-slate-500 premium-card hover:text-slate-800 transition"
            aria-label="Open navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group no-underline">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-md hidden sm:flex"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 3px 12px rgba(22,163,74,0.3)",
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-base sm:text-lg leading-none block tracking-tight">
                {t("agrinex")}
              </span>
              <span className="text-[9px] text-emerald-600 block leading-none mt-0.5 font-mono tracking-wider uppercase font-bold hidden sm:block">
                {t("aiPlatform")}
              </span>
            </div>
          </Link>
        </div>



        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notifications Link */}
          <Link
            href={profile?.role === "farmer" ? "/farmer/notifications" : "/consumer/notifications"}
            className="p-2 rounded-full border border-slate-200/80 text-slate-500 hover:text-slate-800 transition relative shrink-0"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200/80 text-slate-500 premium-card hover:text-slate-800 transition"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Profile Link */}
          <Link
            href={profile?.role === "farmer" ? "/farmer/profile" : "/consumer/settings"}
            className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200/80 hover:bg-slate-50 transition shrink-0"
            aria-label="View profile"
          >
            {profile ? (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                {profile.full_name?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </Link>

        </div>
      </header>
    </>
  );
}