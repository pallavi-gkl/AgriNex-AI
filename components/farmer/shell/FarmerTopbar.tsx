"use client";

import React from "react";
import { Search, Bell, Bot, Menu, CloudSun } from "lucide-react";
import type { Profile } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import Link from "next/link";

interface FarmerTopbarProps {
  title: string;
  profile: Profile | null;
  unreadCount?: number;
  isDemoMode?: boolean;
  onMenuClick?: () => void;
  onNotifClick?: () => void;
  onAIChatClick?: () => void;
}

export default function FarmerTopbar({
  title,
  profile,
  unreadCount = 0,
  isDemoMode = true,
  onMenuClick,
  onNotifClick,
  onAIChatClick,
}: FarmerTopbarProps) {
  const { t } = useTranslation();
  const { location, weather, loading } = useLocationWeather();

  // Determine text to show
  let weatherText = "Loading...";
  if (weather && location) {
    weatherText = `${weather.temperature}°C • ${location.city}`;
  } else if (!loading) {
    if (location?.permissionStatus === "denied") {
      weatherText = "Set Location";
    } else {
      weatherText = "No GPS";
    }
  }

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-[280px] h-16 z-30 flex items-center justify-between px-6 border-b border-slate-200 bg-white"
    >
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-bold text-slate-800 tracking-wide">{title}</h1>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center w-[300px] lg:w-[400px] relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      {/* Right side: Demo badge, weather, AI chat, notification, avatar */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Pulsing Demo Pill */}
        {isDemoMode && (
          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-emerald-500 text-emerald-600 text-[11px] font-mono px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Demo Engine
          </div>
        )}

        {/* Mini Weather */}
        <Link
          href="/farmer/weather"
          className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs text-black hover:bg-slate-50 transition"
          title="Click to view Weather Intelligence"
        >
          <CloudSun className="w-4 h-4 text-emerald-500" />
          <span>{weatherText}</span>
        </Link>

        {/* AI Chat shortcut */}
        {onAIChatClick && (
          <button
            onClick={onAIChatClick}
            className="p-2 rounded-xl text-white hover:opacity-90 transition-all flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 0 10px rgba(16,185,129,0.3)",
            }}
            title="AI Chat Assistant"
          >
            <Bot className="w-4 h-4" />
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={onNotifClick}
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          )}
        </button>

        {/* Profile Avatar */}
        {profile && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            {profile.full_name?.charAt(0).toUpperCase() || "F"}
          </div>
        )}
      </div>
    </header>
  );
}
