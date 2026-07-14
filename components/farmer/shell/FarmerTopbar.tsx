"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search, Bell, Menu, CloudSun, Sun, Moon,
  MapPin, Leaf, ChevronDown, User, Settings, LogOut, Check,
} from "lucide-react";
import type { Profile } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import { supabase } from "@/lib/supabase";
import { DEMO_CROPS } from "@/lib/demoData";

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
  const pathname                      = usePathname();
  const router                        = useRouter();

  /* Search state and logic */
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ type: "page" | "product"; label: string; url: string }>>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const getFarmerPages = () => [
    { label: "Crop Inventory & Listings", url: "/farmer/inventory", keywords: ["crops", "listings", "inventory", "rice", "wheat", "cotton", "millet"] },
    { label: "Irrigation Module", url: "/farmer/irrigation", keywords: ["irrigation", "water", "planner"] },
    { label: "Farm Calendar", url: "/farmer/calendar", keywords: ["calendar", "schedule", "tasks"] },
    { label: "Digital Twin Space", url: "/farmer/farm-twin", keywords: ["twin", "farm-twin", "digital twin"] },
    { label: "Market Prices", url: "/farmer/market", keywords: ["market", "prices", "mandi"] },
    { label: "Farmer Orders", url: "/farmer/orders", keywords: ["orders", "sales", "buyer"] },
    { label: "AI Diagnostics & Labs", url: "/farmer/ai-lab", keywords: ["ai lab", "ai diagnostics", "forecaster", "pricing", "fertilizer", "advisor"] },
    { label: "AI Chat Assistant", url: "/farmer/ai-assistant", keywords: ["ai assistant", "chatbot", "chat"] },
    { label: "Weather Forecast", url: "/farmer/weather", keywords: ["weather", "rain", "temperature"] },
    { label: "Analytics Dashboard", url: "/farmer/analytics", keywords: ["analytics", "charts", "profit"] },
    { label: "Reports & Documentation", url: "/farmer/reports", keywords: ["reports", "invoices", "pdf"] },
    { label: "Government Schemes", url: "/farmer/schemes", keywords: ["schemes", "gov", "subsidy"] },
    { label: "Logistics Map", url: "/farmer/maps", keywords: ["maps", "logistics", "route"] },
    { label: "Settings", url: "/farmer/settings", keywords: ["settings", "language"] },
    { label: "Farmer Profile", url: "/farmer/profile", keywords: ["profile", "kyc", "bank"] },
    { label: "Notifications", url: "/farmer/notifications", keywords: ["notifications", "alerts", "unread"] },
  ];

  // Close search suggestions on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const q = val.toLowerCase().trim();
    const matches: Array<{ type: "page" | "product"; label: string; url: string }> = [];

    // Search pages
    getFarmerPages().forEach(p => {
      if (p.label.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q))) {
        matches.push({ type: "page", label: p.label, url: p.url });
      }
    });

    // Search crop products/listings
    DEMO_CROPS.forEach(c => {
      if (c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
        matches.push({ type: "product", label: c.title, url: `/farmer/inventory?search=${encodeURIComponent(c.title)}` });
      }
    });

    setSuggestions(matches.slice(0, 8));
    setShowSuggestions(true);
  };

  const selectSuggestion = (item: { type: "page" | "product"; label: string; url: string }) => {
    setSearchQuery(item.label);
    setShowSuggestions(false);
    router.push(item.url);
  };

  const triggerSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    setShowSuggestions(false);

    // 1. Exact or keyword match page
    const matchedPage = getFarmerPages().find(p => p.label.toLowerCase() === q.toLowerCase() || p.keywords.some(k => k.toLowerCase() === q.toLowerCase()));
    if (matchedPage) {
      router.push(matchedPage.url);
      return;
    }

    // 2. Exact match product/crop
    const matchedProduct = DEMO_CROPS.find(c => c.title.toLowerCase() === q.toLowerCase());
    if (matchedProduct) {
      router.push(`/farmer/inventory?search=${encodeURIComponent(matchedProduct.title)}`);
      return;
    }

    // 3. Fallback: navigate with search query
    router.push(`/farmer/inventory?search=${encodeURIComponent(q)}`);
  };

  const executeSearch = () => {
    triggerSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

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
        ref={searchRef}
        className="hidden md:flex items-center relative shrink-0"
        style={{ width: "280px", height: "38px" }}
      >
        <button
          type="button"
          onClick={executeSearch}
          style={{
            position: "absolute",
            left: "8px",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
          }}
          title="Search"
        >
          <Search
            style={{
              width: "15px",
              height: "15px",
              color: "#9CA3AF",
            }}
          />
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
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
        />

        {/* Search suggestions dropdown */}
        {showSuggestions && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "100%",
              marginTop: "6px",
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              zIndex: 1000,
              padding: "6px",
              maxHeight: "320px",
              overflowY: "auto",
            }}
          >
            {suggestions.length > 0 ? (
              suggestions.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSuggestion(item)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F0FDF4";
                    e.currentTarget.style.color = "#16A34A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#374151";
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: "9px",
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: item.type === "page" ? "#EFF6FF" : "#F0FDF4",
                      color: item.type === "page" ? "#1E40AF" : "#166534",
                      fontWeight: 700,
                    }}
                  >
                    {item.type}
                  </span>
                </button>
              ))
            ) : searchQuery.trim() ? (
              <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "#64748B" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>No matching products, pages, or records found.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => { setShowSuggestions(false); router.push("/farmer/inventory"); }}
                    style={{ fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "6px", border: "1px solid #DCFCE7", background: "#F0FDF4", color: "#16A34A", cursor: "pointer" }}
                  >
                    Crop Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSuggestions(false); router.push("/farmer/ai-lab"); }}
                    style={{ fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "6px", border: "1px solid #E0E7FF", background: "#EEF2FF", color: "#4F46E5", cursor: "pointer" }}
                  >
                    AI Labs
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "10px 12px", fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>
                Type to search inventory, orders, settings, or AI labs...
              </div>
            )}
          </div>
        )}
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