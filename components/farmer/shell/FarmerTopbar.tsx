"use client";
import React from "react";
import { Search, Bell, Bot, Menu, CloudSun, Sparkles } from "lucide-react";
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

  let weatherText = "Loading...";
  if (weather && location) {
    weatherText = `${weather.temperature}°C · ${location.city}`;
  } else if (!loading) {
    if (location?.permissionStatus === "denied") {
      weatherText = "Set Location";
    } else {
      weatherText = "No GPS";
    }
  }

  return (
    <header className="ag-topbar fixed top-0 right-0 left-0 lg:left-[280px] h-16 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Search bar */}
      <div className="hidden md:flex items-center w-[280px] lg:w-[380px] relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          aria-label={t("search")}
          className="w-full bg-white/70 border border-slate-200/80 rounded-full py-2 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 backdrop-blur-sm"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Demo pill */}
        {isDemoMode && (
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t("demo")}
          </div>
        )}

        {/* Weather chip */}
        <Link
          href="/farmer/weather"
          title="View Weather Intelligence"
          className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all duration-200 no-underline"
        >
          <CloudSun className="w-3.5 h-3.5 text-emerald-500" />
          <span>{weatherText}</span>
        </Link>

        {/* AI Chat shortcut */}
        {onAIChatClick && (
          <button
            onClick={onAIChatClick}
            aria-label="Open AI Assistant"
            title="AI Chat Assistant"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 btn-ai"
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
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-extrabold bg-emerald-500 text-white rounded-full px-0.5">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar */}
        {profile && (
          <Link
            href="/farmer/profile"
            title="View Profile"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md hover:scale-105 transition-transform duration-200 no-underline"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
            }}
          >
            {profile.full_name?.charAt(0).toUpperCase() || "F"}
          </Link>
        )}
      </div>
    </header>
  );
}