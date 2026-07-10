"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, Search, ShoppingCart, Sparkles } from "lucide-react";
import type { Profile } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";

interface ConsumerTopbarProps {
  title: string;
  profile: Profile | null;
  unreadCount: number;
  onMenuClick: () => void;
  onNotifClick: () => void;
  onAIChatClick?: () => void;
}

export default function ConsumerTopbar({
  title,
  profile,
  unreadCount,
  onMenuClick,
  onNotifClick,
  onAIChatClick,
}: ConsumerTopbarProps) {
  const { t } = useTranslation("consumer");
  const router = useRouter();

  return (
    <header className="ag-topbar fixed top-0 right-0 left-0 lg:left-[280px] h-16 flex items-center justify-between px-4 sm:px-6 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-slate-800 text-base sm:text-lg tracking-tight select-none leading-tight">
          {title}
        </h1>
      </div>

      {/* Center: Search bar */}
      <div className="hidden md:flex items-center w-[280px] lg:w-[380px] relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products, farmers…"
          aria-label={t("search")}
          className="w-full bg-white/70 border border-slate-200/80 rounded-full py-2 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 backdrop-blur-sm"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Chat shortcut */}
        {onAIChatClick && (
          <button
            onClick={onAIChatClick}
            aria-label="Open AI Assistant"
            title="AI Chat Assistant"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 btn-ai border-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("aiChat")}</span>
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={onNotifClick}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full px-0.5"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </button>

        {/* Profile Avatar */}
        {profile && (
          <Link
            href="/consumer/settings"
            title={t("settingsTitle")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md hover:scale-105 transition-transform duration-200 no-underline"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
            }}
          >
            {profile.full_name?.charAt(0).toUpperCase() || "U"}
          </Link>
        )}
      </div>
    </header>
  );
}