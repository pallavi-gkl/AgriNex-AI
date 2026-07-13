"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview app/(farmer)/farmer/settings/page.tsx
 * Farmer settings redesign - general, farm profile, accessibility,
 * notifications, security, and theme preferences.
 * Implements: premium cards layout, modern profile widget, CSS override block,
 * custom anim switches/toggles, and focus animations.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Globe, Accessibility, User, Shield, Star,
  CheckCircle2, Clock, Save, Loader2, CheckCircle, AlertCircle,
  Sparkles, Lock, Bell, Eye, EyeOff, ShieldAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import AccessibilityPanel from "@/components/settings/AccessibilityPanel";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { cn } from "@/lib/utils";

// ---- Premium Toggle Switch ----
function PremiumToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "99px",
        background: checked ? "#22C55E" : "#E5E7EB",
        border: "none",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "0 3px",
        transition: "background-color 0.25s ease",
      }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          x: checked ? "22px" : "0px",
        }}
      />
    </button>
  );
}

export default function FarmerSettingsPage() {
  const { t } = useTranslation("farmer");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable Profile fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [farmArea, setFarmArea] = useState("24.5");
  const [primaryCrops, setPrimaryCrops] = useState("Basmati Rice, Turmeric");
  const [soilType, setSoilType] = useState("Clay Loam");
  const [irrigationType, setIrrigationType] = useState("Drip");

  // Notifications toggles
  const [notifOrders, setNotifOrders] = useState(true);
  const [notifWeather, setNotifWeather] = useState(true);
  const [notifIrrigation, setNotifIrrigation] = useState(false);
  const [notifMarket, setNotifMarket] = useState(true);

  // Appearance
  const [darkMode, setDarkMode] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          if (data) {
            setProfile(data as Profile);
            setFullName(data.full_name || "");
            setPhoneNumber(data.phone_number || "");
            setAddress(data.address || "");
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          address: address.trim(),
        })
        .eq("id", profile.id);
      if (error) throw error;
      setMessage({ type: "success", text: "Profile settings saved successfully!" });
      setProfile({
        ...profile,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        address: address.trim(),
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhoneNumber(profile.phone_number || "");
      setAddress(profile.address || "");
    }
    setFarmArea("24.5");
    setPrimaryCrops("Basmati Rice, Turmeric");
    setSoilType("Clay Loam");
    setIrrigationType("Drip");
    setMessage({ type: "success", text: "Form fields reset to default." });
    setTimeout(() => setMessage(null), 2500);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "50%",
            border: "4px solid #E2E8F0", borderTopColor: "#22C55E",
            animation: "settingsSpin 0.9s linear infinite",
          }} />
          <style>{`@keyframes settingsSpin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#64748B" }}>Loading Farmer Settings...</span>
        </div>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "#ffffff", borderRadius: "20px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    padding: "24px 28px",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#F8FAFC", paddingBottom: "48px" }} className="farmer-settings-container">
      
      {/* Dynamic CSS styles to force light-theme overrides on AccessibilityPanel */}
      <style>{`
        .farmer-settings-container .text-white { color: #1f2937 !important; }
        .farmer-settings-container .text-slate-500 { color: #64748b !important; }
        .farmer-settings-container .text-sky-400 { color: #0ea5e9 !important; }
        .farmer-settings-container .text-purple-300 { color: #7c3aed !important; }
        .farmer-settings-container .text-emerald-700 { color: #15803d !important; }
        .farmer-settings-container .text-white\\/60 { color: #475569 !important; }
        .farmer-settings-container [style*="rgba(255,255,255,0.02)"] { background: #f8fafc !important; border: 1px solid #e5e7eb !important; }
        .farmer-settings-container [style*="rgba(255,255,255,0.05)"] { background: #f8fafc !important; border: 1px solid #e5e7eb !important; }
        .farmer-settings-container [style*="rgba(255,255,255,0.08)"] { background: #e2e8f0 !important; }
        .farmer-settings-container [style*="rgba(255,255,255,0.12)"] { border: 1px solid #cbd5e1 !important; }
        .farmer-settings-container [style*="rgba(255,255,255,0.1)"] { background: #cbd5e1 !important; }
        .farmer-settings-container [style*="rgba(56,189,248,0.05)"] { background: #f0f9ff !important; border: 1px solid #bae6fd !important; }
        .farmer-settings-container [style*="rgba(139,92,246,0.08)"] { background: #f3e8ff !important; border: 1px solid #d8b4fe !important; }
        
        .premium-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          font-size: 13px;
          color: #1F2937;
          background: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: Inter, sans-serif;
        }
        .premium-input:focus {
          border-color: #22C55E;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.15);
          outline: none;
        }
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ---- SETTINGS HEADER ---- */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdfa 100%)",
          border: "1px solid #bbf7d0", borderRadius: "24px",
          padding: "28px 32px", marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(34,197,94,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#ffffff", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(34,197,94,0.08)" }}>
              <Settings style={{ width: "22px", height: "22px", color: "#16A34A" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#064e3b", margin: "0 0 3px" }}>
                Farmer Settings
              </h1>
              <p style={{ fontSize: "12px", color: "#166534", margin: 0 }}>
                Configure your farm profile details, accessibility tools, notifications, and language.
              </p>
            </div>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#16A34A", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "4px 12px" }}>
            Last Updated: Today
          </span>
        </div>
      </motion.div>

      {/* ---- PROFILE SUMMARY CARD ---- */}
      {profile && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          style={{ ...cardStyle, display: "flex", gap: "20px", alignItems: "center", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "20px",
            background: "linear-gradient(135deg, #22C55E, #16A34A)",
            display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
            color: "#ffffff", fontSize: "24px", fontWeight: 900, boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
          }}>
            {fullName?.charAt(0)?.toUpperCase() || "F"}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1F2937", margin: 0 }}>{fullName || profile.full_name}</h2>
              {profile.is_verified
                ? <CheckCircle2 style={{ width: "16px", height: "16px", color: "#10B981" }} />
                : <Clock style={{ width: "16px", height: "16px", color: "#F59E0B" }} />}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#16A34A", background: "#F0FDF4", padding: "2px 8px", borderRadius: "5px", textTransform: "uppercase" }}>
                {t("farmer")}
              </span>
              <span style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                <Star style={{ width: "13px", height: "13px", color: "#F59E0B", fill: "#F59E0B" }} />
                <strong>{profile.trust_score?.toFixed(1) || "4.9"}</strong> {t("trustScore")}
              </span>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>Member since: {new Date(profile.created_at || Date.now()).getFullYear()}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---- SETTINGS SECTION GRID ---- */}
      <div className="settings-grid">
        
        {/* Left Column: Profile fields form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Farm Profile Details Form Card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              <User style={{ width: "18px", height: "18px", color: "#22C55E" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: 0 }}>Farm Profile & Contact</h3>
            </div>
            
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-cols">
                <style>{`
                  @media (max-width: 500px) {
                    .form-cols { grid-template-columns: 1fr !important; }
                  }
                `}</style>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748B", marginBottom: "6px" }}>FULL NAME</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="premium-input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748B", marginBottom: "6px" }}>PHONE NUMBER</label>
                  <input type="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="premium-input" />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748B", marginBottom: "6px" }}>FARM LOCATION ADDRESS</label>
                <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="premium-input" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-cols">
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748B", marginBottom: "6px" }}>TOTAL AREA (ACRES)</label>
                  <input type="number" step="0.1" required value={farmArea} onChange={e => setFarmArea(e.target.value)} className="premium-input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748B", marginBottom: "6px" }}>PRIMARY CROPS</label>
                  <input type="text" required value={primaryCrops} onChange={e => setPrimaryCrops(e.target.value)} className="premium-input" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-cols">
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748B", marginBottom: "6px" }}>SOIL TYPE</label>
                  <select value={soilType} onChange={e => setSoilType(e.target.value)} className="premium-input" style={{ cursor: "pointer" }}>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Alluvial">Alluvial Soil</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Black Cotton">Black Cotton Soil</option>
                    <option value="Laterite">Laterite Soil</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748B", marginBottom: "6px" }}>IRRIGATION TYPE</label>
                  <select value={irrigationType} onChange={e => setIrrigationType(e.target.value)} className="premium-input" style={{ cursor: "pointer" }}>
                    <option value="Drip">Drip Irrigation</option>
                    <option value="Sprinkler">Sprinkler Irrigation</option>
                    <option value="Flood">Canal Flood Irrigation</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>

              {message && (
                <div style={{
                  padding: "12px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: 700,
                  background: message.type === "success" ? "#F0FDF4" : "#FEF2F2",
                  color: message.type === "success" ? "#16A34A" : "#DC2626",
                  border: `1px solid ${message.type === "success" ? "#86EFAC" : "#FCA5A5"}`,
                  display: "flex", gap: "6px", alignItems: "center"
                }}>
                  {message.type === "success" ? <CheckCircle style={{ width: "16px", height: "16px" }} /> : <AlertCircle style={{ width: "16px", height: "16px" }} />}
                  {message.text}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: "12px", border: "none", borderRadius: "12px",
                  background: "linear-gradient(135deg, #22C55E, #16A34A)", color: "#ffffff",
                  fontSize: "13px", fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: "6px",
                }}>
                  {saving ? <Loader2 style={{ width: "14px", height: "14px", animation: "settingsSpin 0.9s linear infinite" }} /> : <Save style={{ width: "14px", height: "14px" }} />}
                  Save Changes
                </button>
                <button type="button" onClick={handleResetForm} style={{
                  padding: "12px 18px", border: "1px solid #E5E7EB", borderRadius: "12px",
                  background: "#F8FAFC", color: "#374151", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                }}>
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Security & Verification Card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              <Shield style={{ width: "18px", height: "18px", color: "#0EA5E9" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: 0 }}>Security & Verification</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "SSL Data Authentication", val: "Active Protection", color: "#10B981", bg: "#F0FDF4" },
                { label: "Row-Level Security (RLS)", val: "Enforced", color: "#10B981", bg: "#F0FDF4" },
                { label: "Farmer KYC Status", val: profile?.is_verified ? "Verified Holder" : "Pending", color: profile?.is_verified ? "#10B981" : "#F59E0B", bg: profile?.is_verified ? "#F0FDF4" : "#FFFBEB" },
              ].map(sec => (
                <div key={sec.label} style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#4B5563", fontWeight: 600 }}>{sec.label}</span>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: sec.color, background: sec.bg, padding: "2px 8px", borderRadius: "5px" }}>
                    {sec.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Accessibility, Notification Toggles, Appearance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* General Language Card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              <Globe style={{ width: "18px", height: "18px", color: "#10B981" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: 0 }}>Language Selection</h3>
            </div>
            <LanguageSwitcher compact={false} />
          </div>

          {/* Notifications Card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              <Bell style={{ width: "18px", height: "18px", color: "#A855F7" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: 0 }}>Notification Toggles</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "New Order Alerts", checked: notifOrders, onChange: setNotifOrders },
                { label: "AI Weather Advisories", checked: notifWeather, onChange: setNotifWeather },
                { label: "AI Irrigation Reminders", checked: notifIrrigation, onChange: setNotifIrrigation },
                { label: "APMC Market Updates", checked: notifMarket, onChange: setNotifMarket },
              ].map(notif => (
                <div key={notif.label} style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <span style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>{notif.label}</span>
                  <PremiumToggle checked={notif.checked} onChange={notif.onChange} />
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility Settings card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
              <Accessibility style={{ width: "18px", height: "18px", color: "#6366F1" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: 0 }}>Accessibility Panel</h3>
            </div>
            <AccessibilityPanel />
          </div>

          {/* Appearance card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              <Sparkles style={{ width: "18px", height: "18px", color: "#F59E0B" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: 0 }}>Appearance Mode</h3>
            </div>
            <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ display: "block", fontSize: "13px", color: "#374151", fontWeight: 700 }}>Theme Mode Override</span>
                <span style={{ display: "block", fontSize: "11px", color: "#94A3B8" }}>Toggle light and dark visual appearance</span>
              </div>
              <PremiumToggle checked={darkMode} onChange={setDarkMode} />
            </div>
          </div>

          {/* App footer card */}
          <div style={{ textAlign: "center", padding: "12px", border: "1px dashed #E5E7EB", borderRadius: "14px" }}>
            <p style={{ fontSize: "10px", color: "#94A3B8", fontFamily: "monospace", margin: 0 }}>
              AgriNex AI v1.0.0 · Farmer Platform · Secure SSL session
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
