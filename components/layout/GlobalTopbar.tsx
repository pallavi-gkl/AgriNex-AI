"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  MapPin,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Leaf,
  Globe,
  Check,
} from "lucide-react";
import type { Profile } from "@/types";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/context/ThemeContext";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  dispatchLanguageChange,
  getCurrentLanguage,
  detectPlatform,
} from "@/components/layout/LanguageSwitcher";

/* ─── Language options for the topbar inline picker ───────────────────────── */
const LANG_OPTIONS = [
  { code: "en", flag: "🇬🇧", label: "English",   native: "English"  },
  { code: "hi", flag: "🇮🇳", label: "Hindi",     native: "हिंदी"     },
  { code: "te", flag: "🇮🇳", label: "Telugu",    native: "తెలుగు"    },
  { code: "ta", flag: "🇮🇳", label: "Tamil",     native: "தமிழ்"     },
  { code: "kn", flag: "🇮🇳", label: "Kannada",   native: "ಕನ್ನಡ"     },
  { code: "ml", flag: "🇮🇳", label: "Malayalam", native: "മലയാളം"   },
];

interface GlobalTopbarProps {
  profile: Profile | null;
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
}

export default function GlobalTopbar({
  profile,
  onMenuClick,
  isMobileMenuOpen,
}: GlobalTopbarProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { location, weather, setModalOpen } = useLocationWeather();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const router = useRouter();

  /* Profile dropdown state */
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  /* Language picker state */
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const langRef = useRef<HTMLDivElement>(null);

  /* Detect platform */
  const isFarmer = profile?.role === "farmer";
  const activePlatform = isFarmer ? "farmer" : "consumer";

  /* Sync current language on mount */
  useEffect(() => {
    const code = getCurrentLanguage(activePlatform);
    if (code) setCurrentLang(code);
    const handleLangChange = (e: Event) => {
      const ev = e as CustomEvent<{ code: string }>;
      if (ev.detail?.code) setCurrentLang(ev.detail.code);
    };
    window.addEventListener("agrinex:language-change", handleLangChange);
    return () => window.removeEventListener("agrinex:language-change", handleLangChange);
  }, [activePlatform]);

  /* Close profile dropdown when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Close language picker when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectLang = (code: string) => {
    setLangOpen(false);
    setCurrentLang(code);
    const platform = detectPlatform() || activePlatform;
    dispatchLanguageChange(code, platform);
    /* Persist to Supabase (non-blocking) */
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        (supabase.from("profiles") as any)
          .update({ language_preference: code })
          .eq("id", user.id);
      }
    });
  };

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    await supabase.auth.signOut();
    router.refresh();
    router.push("/signin");
  };

  const notifHref = isFarmer ? "/farmer/notifications" : "/consumer/notifications";
  const profileHref = isFarmer ? "/farmer/profile" : "/consumer/settings";
  const settingsHref = isFarmer ? "/farmer/settings" : "/consumer/settings";

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const locationLabel = location?.city
    ? location.state
      ? `${location.city}, ${location.state.split(" ")[0]}`
      : location.city
    : "Set Location";

  const currentLangObj = LANG_OPTIONS.find((l) => l.code === currentLang) ?? LANG_OPTIONS[0];

  /* Shared icon-button class */
  const iconBtn =
    "p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 active:scale-95 transition-all duration-150 shrink-0 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800";

  return (
    <header
      className="ag-topbar shrink-0 flex items-center gap-3 px-4 sm:px-6 z-30 bg-white dark:bg-slate-900"
      style={{
        height: "72px",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 1px 8px 0 rgba(0,0,0,0.04)",
      }}
    >
      {/* ── LEFT: Mobile toggle + Logo ─────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className={`lg:hidden ${iconBtn}`}
          aria-label="Open navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group no-underline shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              boxShadow: "0 3px 12px rgba(34,197,94,0.22)",
            }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="leading-none hidden sm:block">
            <span className="font-extrabold text-slate-800 text-sm leading-tight block tracking-tight dark:text-slate-100">
              AgriNex AI
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block leading-tight mt-0.5 font-semibold tracking-wide">
              {isFarmer ? "Farmer Platform" : "Consumer Platform"}
            </span>
          </div>
        </Link>
      </div>

      {/* ── CENTER: Search Bar ──────────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 max-w-sm relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={
            isFarmer
              ? "Search crops, inventory, orders..."
              : "Search products, orders..."
          }
          className="w-full h-10 pl-10 pr-4 rounded-xl text-sm bg-[#F8FAFC] text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      {/* ── RIGHT: All controls in one aligned row ──────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">

        {/* 1. Location Capsule */}
        <button
          onClick={() => setModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-left cursor-pointer dark:border-slate-700 dark:hover:bg-slate-800"
          title="Change location"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 dark:text-emerald-400" />
          <div className="min-w-0 leading-tight">
            <div className="text-xs font-semibold text-slate-700 truncate max-w-[96px] dark:text-slate-200">
              {locationLabel}
            </div>
            {weather?.temperature !== undefined && (
              <div className="text-[10px] text-slate-500 flex items-center gap-0.5 dark:text-slate-400">
                <span>{weather.condition_icon || "🌤"}</span>
                <span>{weather.temperature}°C</span>
              </div>
            )}
          </div>
        </button>

        {/* 2. Notifications */}
        <Link
          href={notifHref}
          className={`relative ${iconBtn}`}
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* 3. Language Picker — inline topbar version */}
        <div className="relative hidden md:block" ref={langRef}>
          <button
            onClick={() => setLangOpen((v) => !v)}
            className={`${iconBtn} flex items-center gap-1.5 px-3`}
            aria-label="Change language"
            aria-expanded={langOpen}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold hidden lg:block">
              {currentLangObj.flag} {currentLangObj.native}
            </span>
            <ChevronDown
              className="w-3 h-3 text-slate-400 transition-transform duration-200 hidden lg:block"
              style={{ transform: langOpen ? "rotate(180deg)" : "none" }}
            />
          </button>

          {/* Language dropdown */}
          {langOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden py-1 dark:bg-slate-900 dark:border-slate-700"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
            >
              {LANG_OPTIONS.map((lang) => {
                const isSelected = lang.code === currentLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLang(lang.code)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-all duration-100 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer border-0 bg-transparent"
                    style={{
                      color: isSelected ? "#16a34a" : "#374151",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="flex-1">{lang.native}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={iconBtn}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-4.5 h-4.5" />
          ) : (
            <Sun className="w-4.5 h-4.5" />
          )}
        </button>

        {/* 5. Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2.5 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition dark:border-slate-700 dark:hover:bg-slate-800"
            aria-label="Profile menu"
            aria-expanded={profileMenuOpen}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0"
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              }}
            >
              {initials}
            </div>
            {/* First name (desktop only) */}
            {profile?.full_name && (
              <span className="hidden xl:block text-sm font-semibold text-slate-700 max-w-[110px] truncate dark:text-slate-200">
                {profile.full_name.split(" ")[0]}
              </span>
            )}
            <ChevronDown
              className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
              style={{ transform: profileMenuOpen ? "rotate(180deg)" : "none" }}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden py-1 dark:bg-slate-900 dark:border-slate-700"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {profile?.role || "Member"}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href={profileHref}
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition no-underline dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                >
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">Profile</span>
                </Link>
                <Link
                  href={settingsHref}
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition no-underline dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                >
                  <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">Settings</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 py-1 dark:border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer border-0 bg-transparent dark:hover:bg-red-950/20 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}