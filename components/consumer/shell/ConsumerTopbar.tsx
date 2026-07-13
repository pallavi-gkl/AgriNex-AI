"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu, Bell, Search, Sparkles, Sun, Moon,
  MapPin, ChevronDown, User, LogOut,
  ShoppingBag, Heart, Star, CreditCard, Package, Globe, Check, CloudSun
} from "lucide-react";
import type { Profile } from "@/types";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { supabase } from "@/lib/supabase";
import {
  dispatchLanguageChange,
  getCurrentLanguage,
} from "@/components/layout/LanguageSwitcher";
import { motion } from "framer-motion";

/* ─── Shared icon button style ───────────────────────────────── */
const iconBtnCls =
  "relative flex items-center justify-center w-10 h-10 rounded-xl " +
  "text-slate-500 hover:text-slate-800 hover:bg-slate-100 " +
  "active:scale-95 transition-all duration-150 shrink-0 cursor-pointer border border-slate-200 bg-transparent";

/* ─── Language button style (no fixed width) ─────────────────── */
const langBtnCls =
  "relative flex items-center justify-center h-10 rounded-xl " +
  "text-slate-500 hover:text-slate-800 hover:bg-slate-100 " +
  "active:scale-95 transition-all duration-150 shrink-0 cursor-pointer border border-slate-200 bg-transparent px-3";

/* ─── Language Options ───────────────────────────────────────── */
const LANG_OPTIONS = [
  { code: "en", flag: "🇬🇧", native: "English", short: "English" },
  { code: "te", flag: "🇮🇳", native: "తెలుగు (Telugu)", short: "తెలుగు" },
  { code: "hi", flag: "🇮🇳", native: "हिन्दी (Hindi)", short: "हिन्दी" },
  { code: "ta", flag: "🇮🇳", native: "தமிழ் (Tamil)", short: "தமிழ்" },
  { code: "kn", flag: "🇮🇳", native: "ಕನ್ನಡ (Kannada)", short: "ಕನ್ನಡ" },
];

function LanguageRow({
  lang,
  isSelected,
  onClick,
}: {
  lang: typeof LANG_OPTIONS[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: isSelected ? 700 : 500,
        color: isSelected ? "#047857" : (hovered ? "#047857" : "#374151"),
        background: isSelected ? "#ecfdf5" : (hovered ? "#ecfdf5" : "transparent"),
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "Inter, sans-serif",
        transition: "all 0.15s ease-in-out",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: "16px" }}>{lang.flag}</span>
      <span style={{ flex: 1 }}>{lang.native}</span>
      {isSelected && <Check style={{ width: "14px", height: "14px", color: "#047857" }} />}
    </button>
  );
}

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
  const { t }                          = useTranslation("consumer");
  const router                         = useRouter();
  const pathname                       = usePathname();
  const { theme, toggleTheme }         = useTheme();
  const { location, weather }          = useLocationWeather();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [profileHovered, setProfileHovered] = useState(false);
  const [signOutHovered, setSignOutHovered] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const langRef = useRef<HTMLDivElement>(null);

  /* ── Sync current language on mount ─────────────────────────── */
  useEffect(() => {
    const code = getCurrentLanguage("consumer");
    if (code) setCurrentLang(code);
    const handleLangChange = (e: Event) => {
      const ev = e as CustomEvent<{ code: string }>;
      if (ev.detail?.code) setCurrentLang(ev.detail.code);
    };
    window.addEventListener("agrinex:language-change", handleLangChange);
    return () => window.removeEventListener("agrinex:language-change", handleLangChange);
  }, []);

  /* ── Close Profile Dropdown on Click Outside (Only when Open) ── */
  useEffect(() => {
    if (!profileMenuOpen) return;
    function onDown(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileMenuOpen]);

  /* ── Close Notification Panel on Click Outside (Only when Open) ── */
  useEffect(() => {
    if (!notifOpen) return;
    function onDown(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

  /* ── Close Language Dropdown on Click Outside (Only when Open) ── */
  useEffect(() => {
    if (!langOpen) return;
    function onDown(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [langOpen]);

  /* ── Keyboard Accessibility: Escape Key to Close Dropdowns ── */
  useEffect(() => {
    if (!profileMenuOpen && !langOpen && !notifOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setProfileMenuOpen(false);
        setLangOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [profileMenuOpen, langOpen, notifOpen]);

  const handleSelectLang = (code: string) => {
    setLangOpen(false);
    setCurrentLang(code);
    dispatchLanguageChange(code, "consumer");
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
    router.push("/signin");
  };

  const currentLangObj = LANG_OPTIONS.find((l) => l.code === currentLang) ?? LANG_OPTIONS[0];

  let weatherText = "—";
  if (weather) {
    weatherText = `${weather.temperature}°C · ${weather.condition || "Clear"}`;
  } else {
    weatherText = "No Weather";
  }

  /* ─────────────────────────────────────────────────────────── */
  return (
    <header
      className="ag-topbar sticky top-0"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        width: "100%",
        height: "70px",
        background: "#ffffff",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 1px 6px 0 rgba(0,0,0,0.02)",
        zIndex: 1000,
        overflow: "visible",
        whiteSpace: "nowrap",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-dropdown {
          animation: slideDownFade 180ms ease-out forwards;
          transform-origin: top right;
        }
      `}</style>

      {/* ── LEFT: Hamburger Menu + Search Bar ───────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 auto" }}>
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className={`lg:hidden ${iconBtnCls}`}
          >
            <Menu style={{ width: "18px", height: "18px" }} />
          </button>
        )}
        
        {/* Search Bar */}
        <div
          className="hidden md:flex items-center relative"
          style={{ width: "320px", height: "40px" }}
        >
          <Search
            style={{
              position: "absolute",
              left: "14px",
              width: "16px",
              height: "16px",
              color: "#94A3B8",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder") || "Search products, farmers…"}
            aria-label={t("search") || "Search"}
            style={{
              width: "100%",
              height: "100%",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "9999px",
              paddingLeft: "42px",
              paddingRight: "14px",
              fontSize: "13px",
              color: "#334155",
              fontFamily: "Inter, sans-serif",
              outline: "none",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#10B981";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.08), 0 0 0 3px rgba(16, 185, 129, 0.1)";
              e.currentTarget.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.02)";
              e.currentTarget.style.background = "#F8FAFC";
            }}
          />
        </div>
      </div>

      {/* ── RIGHT: Location, Weather, Notification, Language, AI Chat, Profile ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        
        {/* 1. Location Chip */}
        <button
          onClick={() =>
            router.push(
              `/change-location?from=${encodeURIComponent(pathname)}&platform=consumer`
            )
          }
          title="Change Location"
          aria-label="Change location"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            color: "#374151",
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F0FDF4";
            e.currentTarget.style.borderColor = "#BBF7D0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#F9FAFB";
            e.currentTarget.style.borderColor = "#E5E7EB";
          }}
        >
          <MapPin style={{ width: "14px", height: "14px", color: "#10B981", flexShrink: 0 }} />
          <span>{location?.city || "Set Location"}</span>
          <ChevronDown style={{ width: "12px", height: "12px", color: "#9CA3AF" }} />
        </button>

        {/* 2. Weather Chip */}
        <div
          title="Current Weather"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            color: "#374151",
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {weather?.condition_icon ? (
            <span style={{ fontSize: "14px", lineHeight: 1 }} aria-hidden>
              {weather.condition_icon}
            </span>
          ) : (
            <CloudSun style={{ width: "14px", height: "14px", color: "#10B981" }} />
          )}
          <span>{weatherText}</span>
        </div>

        {/* 3. Notifications */}
        <div className="relative shrink-0" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            className={iconBtnCls}
            style={{ color: notifOpen ? "#10B981" : undefined }}
          >
            <Bell style={{ width: "18px", height: "18px" }} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  minWidth: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 700,
                  background: "#EF4444",
                  color: "#fff",
                  borderRadius: "9999px",
                  padding: "0 4px",
                  lineHeight: 1,
                  boxShadow: "0 0 0 2px #fff",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </button>
          <NotificationsPanel
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            variant="dropdown"
          />
        </div>

        {/* 4. Language switcher */}
        <div className="relative hidden md:block" ref={langRef}>
          <button
            onClick={() => setLangOpen((v) => !v)}
            className={langBtnCls}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: langOpen ? "#10B981" : "#475569",
            }}
            aria-label="Change language"
            aria-expanded={langOpen}
          >
            <Globe style={{ width: "16px", height: "16px" }} />
            <span style={{ fontSize: "12px", fontWeight: 600 }}>
              {currentLangObj.flag} {currentLangObj.short}
            </span>
            <ChevronDown
              style={{
                width: "12px",
                height: "12px",
                color: "#94A3B8",
                transform: langOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {langOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                minWidth: "220px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                padding: "12px",
                zIndex: 99999,
                fontFamily: "Inter, sans-serif",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                overflow: "hidden",
              }}
            >
              {LANG_OPTIONS.map((lang) => {
                const isSelected = lang.code === currentLang;
                return (
                  <LanguageRow
                    key={lang.code}
                    lang={lang}
                    isSelected={isSelected}
                    onClick={() => handleSelectLang(lang.code)}
                  />
                );
              })}
            </motion.div>
          )}
        </div>

        {/* 5. AI Chat button */}
        {onAIChatClick && (
          <button
            onClick={onAIChatClick}
            aria-label="Open AI Assistant"
            title="AI Chat Assistant"
            className="shrink-0 flex items-center gap-1.5 cursor-pointer border border-transparent"
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 750,
              fontFamily: "Inter, sans-serif",
              color: "#ffffff",
              background: "linear-gradient(135deg, #10B981, #059669)",
              boxShadow: "0 2px 8px rgba(16,185,129,0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 14px rgba(16,185,129,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 2px 8px rgba(16,185,129,0.25)";
            }}
          >
            <Sparkles style={{ width: "13px", height: "13px" }} />
            <span className="hidden sm:inline">{t("aiChat") || "AI Chat"}</span>
          </button>
        )}

        {/* 6. Profile dropdown */}
        {profile && (
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen((v) => !v)}
              aria-label="Profile menu"
              aria-expanded={profileMenuOpen}
              className="flex items-center gap-2 cursor-pointer shrink-0"
              style={{
                padding: "4px 8px 4px 4px",
                height: "40px",
                borderRadius: "12px",
                background: "#ffffff",
                border: "1px solid #E5E7EB",
                transition: "all 0.15s",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#D1D5DB";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                {profile.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              {profile.full_name && (
                <span
                  className="hidden md:inline truncate"
                  style={{ maxWidth: "90px", fontSize: "13px", fontWeight: 600, color: "#374151" }}
                >
                  {profile.full_name.split(" ")[0]}
                </span>
              )}
              <ChevronDown
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#9CA3AF",
                  transform: profileMenuOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  minWidth: "220px",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "16px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                  padding: "12px",
                  zIndex: 99999,
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  color: "#111827",
                  overflow: "visible",
                }}
              >
                {/* ── Profile link ── */}
                <Link
                  href="/consumer/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="no-underline"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: profileHovered ? "#047857" : "#374151",
                    background: profileHovered ? "#ecfdf5" : "transparent",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setProfileHovered(true)}
                  onMouseLeave={() => setProfileHovered(false)}
                >
                  <span style={{ fontSize: "16px" }}>👤</span>
                  <span>Profile</span>
                </Link>

                {/* ── Sign Out ── */}
                <button
                  onClick={handleSignOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: signOutHovered ? "#dc2626" : "#DC2626",
                    background: signOutHovered ? "#fef2f2" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={() => setSignOutHovered(true)}
                  onMouseLeave={() => setSignOutHovered(false)}
                >
                  <span style={{ fontSize: "16px" }}>🚪</span>
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}