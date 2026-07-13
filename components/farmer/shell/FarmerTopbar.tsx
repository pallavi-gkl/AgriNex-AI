"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search, Bell, Menu, CloudSun, Sun, Moon,
  MapPin, Leaf, ChevronDown, User, Settings, LogOut,
} from "lucide-react";
import type { Profile } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { useTheme } from "@/context/ThemeContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import { supabase } from "@/lib/supabase";

/* ─── Shared button style ───────────────────────────────────── */
const iconBtnCls =
  "relative flex items-center justify-center w-9 h-9 rounded-xl " +
  "text-slate-500 hover:text-slate-800 hover:bg-slate-100 " +
  "active:scale-95 transition-all duration-150 shrink-0 cursor-pointer border-0 bg-transparent";

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
  const { t }                         = useTranslation();
  const { location, weather, loading }= useLocationWeather();
  const { theme, toggleTheme }        = useTheme();
  const pathname                      = usePathname();
  const router                        = useRouter();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  /* ── Close dropdowns on outside click ────────────────────── */
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ── Weather text ─────────────────────────────────────────── */
  let weatherText = "—";
  if (weather) {
    weatherText = `${weather.temperature}°C · ${weather.condition || "Clear"}`;
  } else if (!loading) {
    weatherText = location?.permissionStatus === "denied" ? "Set Location" : "No GPS";
  }

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/signin");
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <header
      className="ag-topbar fixed top-0 left-0 right-0"
      style={{
        /* Layout */
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "8px",
        flexWrap: "nowrap",
        padding: "0 20px",
        width: "100%",
        height: "70px",
        /* Visual */
        background: "#ffffff",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 1px 6px 0 rgba(0,0,0,0.04)",
        zIndex: 1000,
        overflow: "visible",
        whiteSpace: "nowrap",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ── 1. Brand logo ──────────────────────────────────────── */}
      <Link
        href="/"
        className="flex items-center gap-2.5 group no-underline shrink-0"
        style={{ marginRight: "8px" }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #16A34A, #14532D)",
            boxShadow: "0 2px 8px rgba(22,163,74,0.22)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
          className="group-hover:scale-105"
        >
          <Leaf style={{ width: "18px", height: "18px", color: "#fff" }} />
        </div>
        <div>
          <span
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: "17px",
              lineHeight: 1,
              color: "#111827",
              letterSpacing: "-0.3px",
            }}
          >
            {t("agrinex")}
          </span>
          <span
            style={{
              display: "block",
              fontWeight: 500,
              fontSize: "10px",
              lineHeight: 1,
              color: "#22C55E",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginTop: "3px",
            }}
          >
            Farmer Platform
          </span>
        </div>
      </Link>

      {/* ── Mobile hamburger (hidden on desktop) ───────────────── */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className={`lg:hidden ${iconBtnCls}`}
        >
          <Menu style={{ width: "18px", height: "18px" }} />
        </button>
      )}

      {/* ── 2. Search bar ──────────────────────────────────────── */}
      <div
        className="hidden md:flex items-center relative shrink-0"
        style={{ width: "280px", height: "38px" }}
      >
        <Search
          style={{
            position: "absolute",
            left: "12px",
            width: "15px",
            height: "15px",
            color: "#9CA3AF",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Search crops, orders, markets…"
          aria-label={t("search")}
          style={{
            width: "100%",
            height: "100%",
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            paddingLeft: "34px",
            paddingRight: "12px",
            fontSize: "13px",
            color: "#374151",
            fontFamily: "Inter, sans-serif",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#22C55E";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.1)";
            e.currentTarget.style.background = "#fff";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = "#F9FAFB";
          }}
        />
      </div>

      {/* ── Spacer — pushes right-side controls to the right ───── */}
      <div style={{ flex: "1 1 0%" }} />

      {/* ── 3. Location ────────────────────────────────────────── */}
      <button
        onClick={() =>
          router.push(
            `/change-location?from=${encodeURIComponent(pathname)}&platform=farmer`
          )
        }
        title="Change Location"
        aria-label="Change location"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "6px 10px",
          borderRadius: "10px",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
          color: "#374151",
          background: "transparent",
          border: "1px solid transparent",
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
        }
      >
        <MapPin style={{ width: "14px", height: "14px", color: "#22C55E", flexShrink: 0 }} />
        <span>{location?.city || "Set Location"}</span>
        <ChevronDown style={{ width: "12px", height: "12px", color: "#9CA3AF" }} />
      </button>

      {/* ── 4. Weather chip ────────────────────────────────────── */}
      <Link
        href="/farmer/weather"
        title="View Weather"
        className="no-underline shrink-0"
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
          transition: "background 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "#F0FDF4";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#BBF7D0";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "#F9FAFB";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E5E7EB";
        }}
      >
        {weather?.condition_icon ? (
          <span style={{ fontSize: "14px", lineHeight: 1 }} aria-hidden>
            {weather.condition_icon}
          </span>
        ) : (
          <CloudSun style={{ width: "14px", height: "14px", color: "#22C55E" }} />
        )}
        <span>{weatherText}</span>
      </Link>

      {/* ── 5. Notifications ────────────────────────────────────── */}
      <div className="relative shrink-0" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className={iconBtnCls}
          style={{ color: notifOpen ? "#22C55E" : undefined }}
        >
          <Bell style={{ width: "18px", height: "18px" }} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                minWidth: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                fontWeight: 700,
                background: "#22C55E",
                color: "#fff",
                borderRadius: "9999px",
                padding: "0 3px",
                lineHeight: 1,
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <NotificationsPanel
          isOpen={notifOpen}
          onClose={() => setNotifOpen(false)}
          variant="dropdown"
        />
      </div>

      {/* ── 6. Language switcher ────────────────────────────────── */}
      <div className="hidden lg:block shrink-0" style={{ width: "116px" }}>
        <LanguageSwitcher compact platform="farmer" align="bottom" />
      </div>

      {/* ── 7. Theme toggle ─────────────────────────────────────── */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        className={iconBtnCls}
      >
        {theme === "light" ? (
          <Moon style={{ width: "17px", height: "17px" }} />
        ) : (
          <Sun style={{ width: "17px", height: "17px" }} />
        )}
      </button>

      {/* ── 8. AI Chat button ───────────────────────────────────── */}
      {onAIChatClick && (
        <button
          onClick={onAIChatClick}
          aria-label="Open AI Assistant"
          title="AI Chat Assistant"
          className="shrink-0 flex items-center gap-1.5 cursor-pointer border-0"
          style={{
            padding: "7px 14px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
            boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 14px rgba(37,99,235,0.35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "none";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 2px 8px rgba(37,99,235,0.25)";
          }}
        >
          ✨ AI Chat
        </button>
      )}

      {/* ── 9. Profile dropdown ─────────────────────────────────── */}
      {profile && (
        <div className="relative shrink-0" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen((v) => !v)}
            aria-label="Profile menu"
            aria-expanded={profileMenuOpen}
            className="flex items-center gap-2 cursor-pointer border-0 shrink-0"
            style={{
              padding: "4px 8px 4px 4px",
              height: "40px",
              borderRadius: "10px",
              background: "#ffffff",
              border: "1px solid #E5E7EB",
              transition: "border-color 0.15s, background 0.15s",
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
            {/* Avatar */}
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
              {profile.full_name?.charAt(0).toUpperCase() || "F"}
            </div>
            {/* Name */}
            {profile.full_name && (
              <span
                className="hidden md:inline truncate"
                style={{
                  maxWidth: "90px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                }}
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

          {/* Dropdown panel */}
          {profileMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "208px",
                background: "#ffffff",
                border: "1px solid #E5E7EB",
                borderRadius: "14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                padding: "6px",
                zIndex: 1100,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {/* User info */}
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #F3F4F6",
                  marginBottom: "4px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {profile.full_name}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "11px",
                    color: "#6B7280",
                    textTransform: "capitalize",
                  }}
                >
                  {profile.role}
                </p>
              </div>

              {/* Menu items */}
              {[
                { href: "/farmer/profile",  icon: User,     label: "Profile" },
                { href: "/farmer/settings", icon: Settings, label: "Settings" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setProfileMenuOpen(false)}
                  className="no-underline"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#374151",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background = "#F3F4F6")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")
                  }
                >
                  <Icon style={{ width: "15px", height: "15px", color: "#9CA3AF", flexShrink: 0 }} />
                  {label}
                </Link>
              ))}

              <div style={{ borderTop: "1px solid #F3F4F6", marginTop: "4px", paddingTop: "4px" }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#DC2626",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "Inter, sans-serif",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                  }
                >
                  <LogOut style={{ width: "15px", height: "15px", color: "#F87171", flexShrink: 0 }} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}