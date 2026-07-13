"use client";
import { useTranslation } from "@/hooks/useTranslation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Accessibility, User, Shield,
  Star, CheckCircle2, Clock, Save, Loader2, CheckCircle, AlertCircle,
  MapPin, Package, Heart, Lock, HelpCircle, Send,
  Compass, Eye, Users, Trash2, Plus, Phone, Mail, Award, Check, ChevronDown,
  Bell, Edit3, Camera, ShieldCheck, Activity, Cpu, Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import AccessibilityPanel from "@/components/settings/AccessibilityPanel";
import { useRouter } from "next/navigation";

type TabId =
  | "general"
  | "addresses"
  | "orders"
  | "wishlist"
  | "notifications"
  | "security"
  | "language"
  | "accessibility"
  | "ai"
  | "support";

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "general",       label: "General",        icon: User,          desc: "Personal info & contact" },
  { id: "addresses",     label: "Addresses",      icon: MapPin,        desc: "Saved delivery locations" },
  { id: "orders",        label: "Orders Summary", icon: Package,       desc: "Order history & stats" },
  { id: "wishlist",      label: "Wishlist",        icon: Heart,         desc: "Saved products" },
  { id: "notifications", label: "Notifications",  icon: Bell,          desc: "Alert preferences" },
  { id: "security",      label: "Security",       icon: Shield,        desc: "Password & devices" },
  { id: "language",      label: "Language",       icon: Globe,         desc: "Platform language" },
  { id: "accessibility", label: "Accessibility",  icon: Accessibility, desc: "Visual & input options" },
  { id: "ai",            label: "AI Preferences", icon: Cpu,           desc: "Smart recommendations" },
  { id: "support",       label: "Support",        icon: HelpCircle,    desc: "Help & tickets" },
];

/* ─── Input field component ─────────────────────────────────────────────── */
function Field({
  label, value, onChange, type = "text", placeholder, disabled, required, children
}: {
  label: string; value?: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean; required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
      <label style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      {children ?? (
        <input
          type={type}
          required={required}
          disabled={disabled}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: disabled ? "#f8fafc" : "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "13px",
            color: disabled ? "#94a3b8" : "#334155",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            cursor: disabled ? "not-allowed" : "text",
            fontFamily: "Inter, sans-serif",
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = "#10b981";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.08)";
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      )}
    </div>
  );
}

/* ─── Section header ────────────────────────────────────────────────────── */
function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginBottom: "24px", textAlign: "left" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#1e293b", margin: 0 }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0", fontWeight: 600 }}>{desc}</p>
    </div>
  );
}

/* ─── Message banner ────────────────────────────────────────────────────── */
function MessageBanner({ message }: { message: { type: "success" | "error"; text: string } | null }) {
  if (!message) return null;
  const isSuccess = message.type === "success";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "12px 16px", borderRadius: "14px",
      background: isSuccess ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${isSuccess ? "#bbf7d0" : "#fee2e2"}`,
      color: isSuccess ? "#059669" : "#ef4444",
      fontSize: "13px", fontWeight: 700,
    }}>
      {isSuccess
        ? <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
        : <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
      }
      {message.text}
    </div>
  );
}

/* ─── Toggle switch ─────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        position: "relative", width: 44, height: 24, borderRadius: 12,
        background: checked ? "#10b981" : "#cbd5e1",
        border: "none", cursor: "pointer", flexShrink: 0,
        transition: "background 0.25s",
      }}
    >
      <span style={{
        position: "absolute", top: "3px",
        left: checked ? "23px" : "3px",
        width: 18, height: 18, borderRadius: "50%",
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        transition: "left 0.25s",
        display: "block",
      }} />
    </button>
  );
}

export default function ConsumerSettingsPage() {
  const { t } = useTranslation("consumer");
  const router = useRouter();
  const { location, weather } = useLocationWeather();

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Extended profile fields
  const [profilePhoto, setProfilePhoto] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Female");
  const [languages, setLanguages] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [pinCode, setPinCode] = useState("");
  const [alternateDelivery, setAlternateDelivery] = useState("");
  const [gpsLocation, setGpsLocation] = useState("");
  const [prefLanguage, setPrefLanguage] = useState("en");
  const [prefPayment, setPrefPayment] = useState("UPI");
  const [favCategories, setFavCategories] = useState("");
  const [favCrops, setFavCrops] = useState("");
  const [wishlistPref, setWishlistPref] = useState("In-Stock Only");
  const [upiId, setUpiId] = useState("");
  const [email, setEmail] = useState("");

  // Notification toggles
  const [notifOrderUpdates, setNotifOrderUpdates] = useState(true);
  const [notifDeliveryAlerts, setNotifDeliveryAlerts] = useState(true);
  const [notifPriceDrops, setNotifPriceDrops] = useState(true);
  const [notifWeather, setNotifWeather] = useState(false);
  const [notifAISuggestions, setNotifAISuggestions] = useState(true);
  const [notifSchemes, setNotifSchemes] = useState(false);
  const [notifOffers, setNotifOffers] = useState(true);

  // Saved Addresses
  const [addressesList, setAddressesList] = useState<{ id: string; label: string; details: string; isDefault: boolean }[]>([
    { id: "1", label: "Home Address", details: "Flat 4B, Green Apartments, Andheri West, Mumbai, Maharashtra 400053", isDefault: true },
    { id: "2", label: "Office / Work", details: "9th Floor, Tech Hub, Sector 5, Powai, Mumbai, Maharashtra 400076", isDefault: false },
  ]);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrDetails, setNewAddrDetails] = useState("");

  // Support state
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [supportTicketTitle, setSupportTicketTitle] = useState("");
  const [supportTicketDesc, setSupportTicketDesc] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || "");
          const { data } = await (supabase as any)
            .from("profiles").select("*").eq("id", user.id).maybeSingle();
          if (data) {
            setProfile(data as Profile);
            setFullName(data.full_name || "");
            setPhoneNumber(data.phone_number || "");
            setAddress(data.address || "");
          }
          const meta = user.user_metadata?.profile_details || {};
          setProfilePhoto(meta.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
          setDob(meta.dob || "");
          setGender(meta.gender || "Female");
          setLanguages(meta.languages || "");
          setHouseNumber(meta.houseNumber || "");
          setStreet(meta.street || "");
          setLocality(meta.locality || "");
          setCity(meta.city || "");
          setDistrict(meta.district || "");
          setState(meta.state || "");
          setCountry(meta.country || "India");
          setPinCode(meta.pinCode || "");
          setAlternateDelivery(meta.alternateDelivery || "");
          setGpsLocation(meta.gpsLocation || "");
          setPrefLanguage(meta.prefLanguage || "en");
          setPrefPayment(meta.prefPayment || "UPI");
          setFavCategories(meta.favCategories || "Organic, Fruits, Leafy Greens");
          setFavCrops(meta.favCrops || "Basmati Rice, Alphonso Mango");
          setWishlistPref(meta.wishlistPref || "In-Stock Only");
          setUpiId(meta.upiId || "");
          if (meta.notifOrderUpdates !== undefined) setNotifOrderUpdates(meta.notifOrderUpdates);
          if (meta.notifDeliveryAlerts !== undefined) setNotifDeliveryAlerts(meta.notifDeliveryAlerts);
          if (meta.notifPriceDrops !== undefined) setNotifPriceDrops(meta.notifPriceDrops);
          if (meta.notifWeather !== undefined) setNotifWeather(meta.notifWeather);
          if (meta.notifAISuggestions !== undefined) setNotifAISuggestions(meta.notifAISuggestions);
          if (meta.notifSchemes !== undefined) setNotifSchemes(meta.notifSchemes);
          if (meta.notifOffers !== undefined) setNotifOffers(meta.notifOffers);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error: dbError } = await (supabase as any)
        .from("profiles")
        .update({ full_name: fullName.trim(), phone_number: phoneNumber.trim(), address: address.trim() })
        .eq("id", profile.id);
      if (dbError) throw dbError;
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          profile_details: {
            profilePhoto, dob, gender, languages, houseNumber, street, locality, city,
            district, state, country, pinCode, alternateDelivery, gpsLocation,
            prefLanguage, prefPayment, favCategories, favCrops, wishlistPref, upiId,
            notifOrderUpdates, notifDeliveryAlerts, notifPriceDrops, notifWeather,
            notifAISuggestions, notifSchemes, notifOffers,
          }
        }
      });
      if (authError) throw authError;
      setMessage({ type: "success", text: "Profile settings saved successfully!" });
      setProfile({ ...profile, full_name: fullName.trim(), phone_number: phoneNumber.trim(), address: address.trim() });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddrLabel || !newAddrDetails) return;
    setAddressesList([...addressesList, { id: Date.now().toString(), label: newAddrLabel, details: newAddrDetails, isDefault: false }]);
    setNewAddrLabel("");
    setNewAddrDetails("");
    setMessage({ type: "success", text: "Address added successfully!" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteAddress = (id: string) => {
    setAddressesList(addressesList.filter(item => item.id !== id));
    setMessage({ type: "success", text: "Address removed successfully!" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddressesList(addressesList.map(item => ({ ...item, isDefault: item.id === id })));
    const matched = addressesList.find(item => item.id === id);
    if (matched) setAddress(matched.details);
    setMessage({ type: "success", text: "Default delivery address updated!" });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#64748b" }}>
          <Loader2 style={{ width: 32, height: 32, color: "#10b981" }} className="animate-spin" />
          <p style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Package,  value: "14",                         label: "Total Orders",      color: "#10b981", bg: "rgba(16,185,129,0.08)" },
    { icon: Heart,    value: "8",                          label: "Wishlist Items",    color: "#f43f5e", bg: "rgba(244,63,94,0.08)" },
    { icon: Users,    value: "12",                         label: "Saved Farmers",     color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
    { icon: Star,     value: "5",                          label: "My Reviews",        color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { icon: Award,    value: "350",                        label: "Reward Points",     color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
    { icon: MapPin,   value: `${addressesList.length}`,   label: "Saved Addresses",   color: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
    { icon: Eye,      value: "4",                          label: "Recently Viewed",   color: "#64748b", bg: "rgba(100,116,139,0.08)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "28px 0", minHeight: "100vh", background: "#f8fafc" }}
    >
      {/* ── PREMIUM PROFILE HERO ────────────────────────────────────────── */}
      {profile && (
        <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
          borderRadius: "28px",
          border: "1px solid #e2e8f0",
          padding: "32px",
          marginBottom: "28px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: "24px",
        }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                style={{
                  width: 96, height: 96, borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #ffffff",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.18)",
                }}
              />
            ) : (
              <div style={{
                width: 96, height: 96, borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#ffffff", fontWeight: 900, fontSize: "32px",
                boxShadow: "0 8px 24px rgba(16,185,129,0.25)",
                border: "3px solid #ffffff",
              }}>
                {profile.full_name?.charAt(0)?.toUpperCase() || "C"}
              </div>
            )}
            {/* Verified badge */}
            <div style={{
              position: "absolute", bottom: "2px", right: "2px",
              width: 24, height: 24, borderRadius: "50%", background: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0",
            }}>
              {profile.is_verified
                ? <CheckCircle2 style={{ width: 14, height: 14, color: "#10b981" }} />
                : <Clock style={{ width: 14, height: 14, color: "#f59e0b" }} />
              }
            </div>
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: "260px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 950, color: "#1e293b", margin: 0 }}>
                {profile.full_name || "Consumer"}
              </h1>
              <span style={{
                fontSize: "10px", fontWeight: 800, color: "#059669",
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                ✓ Verified Consumer
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", color: "#64748b", fontSize: "13px", marginBottom: "12px", fontWeight: 650 }}>
              {email && (
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Mail style={{ width: 14, height: 14 }} /> {email}
                </span>
              )}
              {profile.phone_number && (
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Phone style={{ width: 14, height: 14 }} /> {profile.phone_number}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <span style={{
                padding: "5px 12px", borderRadius: "10px", background: "#f1f5f9",
                fontSize: "11px", fontWeight: 750, color: "#374151",
                display: "flex", alignItems: "center", gap: "4px",
              }}>
                <Star style={{ width: 12, height: 12, color: "#f59e0b", fill: "#f59e0b" }} />
                {profile.trust_score?.toFixed(1) || "4.9"} Trust Score
              </span>
              <span style={{
                padding: "5px 12px", borderRadius: "10px", background: "#f1f5f9",
                fontSize: "11px", fontWeight: 750, color: "#374151",
              }}>
                🗓️ Member Since 2024
              </span>
              {location?.city && (
                <span style={{
                  padding: "5px 12px", borderRadius: "10px", background: "#f0fdf4",
                  border: "1px solid #dcfce7", fontSize: "11px", fontWeight: 750, color: "#059669",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <MapPin style={{ width: 12, height: 12 }} />
                  {location.city}, {location.state}
                </span>
              )}
              {weather && (
                <span style={{
                  padding: "5px 12px", borderRadius: "10px", background: "#eff6ff",
                  border: "1px solid #bfdbfe", fontSize: "11px", fontWeight: 750, color: "#2563eb",
                }}>
                  {weather.condition_icon || "🌤"} {weather.temperature}°C · {weather.condition}
                </span>
              )}
            </div>
          </div>

          {/* Edit Profile button */}
          <button
            onClick={() => setActiveTab("general")}
            style={{
              padding: "10px 20px", borderRadius: "14px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#ffffff", fontSize: "13px", fontWeight: 800,
              border: "none", cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
          >
            <Edit3 style={{ width: 14, height: 14 }} />
            Edit Profile
          </button>
        </div>
      )}

      {/* ── QUICK STATS ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px", textAlign: "left" }}>
          Marketplace Activity
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: "12px",
        }}>
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.07)" }}
                style={{
                  background: "#ffffff", border: "1px solid #e2e8f0",
                  borderRadius: "20px", padding: "16px 14px",
                  textAlign: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "10px", background: card.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 8px", color: card.color,
                }}>
                  <Icon style={{ width: 16, height: 16 }} />
                </div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#1e293b", lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginTop: "4px" }}>{card.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT: Tabs + Panel ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", alignItems: "start" }} className="lg:grid-cols-[260px_1fr]">

        {/* Left: Tab Navigation */}
        <div style={{
          background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0",
          padding: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        }}>
          <p style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 12px 12px", textAlign: "left" }}>
            Profile Sections
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {TABS.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMessage(null); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 14px", borderRadius: "16px",
                    background: isActive ? "#f0fdf4" : "transparent",
                    border: `1px solid ${isActive ? "#bbf7d0" : "transparent"}`,
                    color: isActive ? "#059669" : "#475569",
                    fontSize: "13px", fontWeight: isActive ? 800 : 600,
                    cursor: "pointer", textAlign: "left", width: "100%",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <Icon style={{ width: 16, height: 16, color: isActive ? "#10b981" : "#94a3b8", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
                    {isActive && (
                      <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 500, marginTop: "1px" }}>{item.desc}</div>
                    )}
                  </div>
                  {isActive && (
                    <div style={{ width: 3, height: 16, borderRadius: 4, background: "#10b981", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            style={{
              background: "#ffffff", border: "1px solid #e2e8f0",
              borderRadius: "24px", padding: "28px 32px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              textAlign: "left",
            }}
          >
            {/* 1. GENERAL */}
            {activeTab === "general" && (
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <SectionTitle title="General Information" desc="Update your personal contact details and basic identity." />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                  <Field label="Profile Photo URL" value={profilePhoto} onChange={setProfilePhoto} placeholder="https://example.com/photo.jpg" />
                  <Field label="Full Name" value={fullName} onChange={setFullName} required />
                  <Field label="Phone Number" type="tel" value={phoneNumber} onChange={setPhoneNumber} required />
                  <Field label="Email Address (Auth ID)" value={email} disabled />
                  <Field label="Gender">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={{
                        width: "100%", background: "#ffffff", border: "1px solid #e2e8f0",
                        borderRadius: "12px", padding: "10px 14px", fontSize: "13px",
                        color: "#334155", outline: "none", fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </Field>
                  <Field label="Date of Birth" type="date" value={dob} onChange={setDob} />
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field
                      label="Geographic Location (Synced from Header)"
                      value={locality || city ? `${locality ? locality + ", " : ""}${city || ""}` : ""}
                      disabled
                      placeholder="Synced from GPS header"
                    />
                  </div>
                </div>
                <MessageBanner message={message} />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: "12px 24px", borderRadius: "14px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#ffffff", fontSize: "13px", fontWeight: 800,
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                      transition: "transform 0.15s",
                    }}
                  >
                    {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Save style={{ width: 14, height: 14 }} />}
                    Save Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFullName(profile?.full_name || ""); setPhoneNumber(profile?.phone_number || ""); }}
                    style={{
                      padding: "12px 20px", borderRadius: "14px",
                      background: "#ffffff", border: "1px solid #e2e8f0",
                      color: "#475569", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    Discard Changes
                  </button>
                </div>
              </form>
            )}

            {/* 2. ADDRESSES */}
            {activeTab === "addresses" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SectionTitle title="Saved Addresses" desc="Manage your saved delivery locations." />
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {addressesList.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px",
                        padding: "16px 20px", borderRadius: "18px",
                        background: addr.isDefault ? "#f0fdf4" : "#ffffff",
                        border: `1px solid ${addr.isDefault ? "#86efac" : "#e2e8f0"}`,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b" }}>{addr.label}</span>
                          {addr.isDefault && (
                            <span style={{ fontSize: "9px", fontWeight: 800, color: "#fff", background: "#10b981", padding: "2px 8px", borderRadius: "20px", textTransform: "uppercase" }}>
                              Default
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: 600, lineHeight: 1.5 }}>{addr.details}</p>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            style={{
                              padding: "6px 12px", borderRadius: "10px",
                              background: "#ffffff", border: "1px solid #e2e8f0",
                              color: "#475569", fontSize: "11px", fontWeight: 750, cursor: "pointer",
                            }}
                          >
                            Make Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          style={{
                            width: 32, height: 32, borderRadius: "10px",
                            background: "#fff5f5", border: "1px solid #fecaca",
                            color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new address */}
                <div style={{
                  padding: "20px", borderRadius: "18px",
                  background: "#f8fafc", border: "1px dashed #cbd5e1",
                }}>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#374151", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Plus style={{ width: 14, height: 14, color: "#10b981" }} /> Add New Address
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                    <input
                      type="text"
                      value={newAddrLabel}
                      onChange={(e) => setNewAddrLabel(e.target.value)}
                      placeholder="Label (e.g. Home)"
                      style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }}
                    />
                    <input
                      type="text"
                      value={newAddrDetails}
                      onChange={(e) => setNewAddrDetails(e.target.value)}
                      placeholder="Full address with PIN code"
                      style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                  <button
                    onClick={handleAddAddress}
                    style={{
                      marginTop: "12px", padding: "10px 20px", borderRadius: "12px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#ffffff", fontSize: "13px", fontWeight: 800, border: "none", cursor: "pointer",
                    }}
                  >
                    Save Address
                  </button>
                </div>
                <MessageBanner message={message} />
              </div>
            )}

            {/* 3. ORDERS */}
            {activeTab === "orders" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SectionTitle title="Orders Summary" desc="Overview of your transaction history and fulfillment statuses." />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
                  {[
                    { label: "Total Orders", value: "14", color: "#1e293b" },
                    { label: "Delivered", value: "11", color: "#10b981" },
                    { label: "Pending", value: "2", color: "#f59e0b" },
                    { label: "Cancelled", value: "1", color: "#ef4444" },
                  ].map((s) => (
                    <div key={s.label} style={{ padding: "16px", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
                      <div style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</div>
                      <div style={{ fontSize: "28px", fontWeight: 900, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  padding: "20px 24px", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0",
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px",
                }}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Total Spending Volume</div>
                    <div style={{ fontSize: "24px", fontWeight: 900, color: "#1e293b" }}>₹8,240.00</div>
                  </div>
                  <button
                    onClick={() => router.push("/consumer/orders")}
                    style={{
                      padding: "10px 20px", borderRadius: "12px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff", fontSize: "13px", fontWeight: 800, border: "none", cursor: "pointer",
                    }}
                  >
                    View All Orders
                  </button>
                </div>
              </div>
            )}

            {/* 4. WISHLIST */}
            {activeTab === "wishlist" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SectionTitle title="Saved Wishlist" desc="Farm items you have saved to purchase later." />
                <div style={{ padding: "20px", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#fff0f3", border: "1px solid #fecdd3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Heart style={{ width: 20, height: 20, color: "#f43f5e", fill: "#f43f5e" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b" }}>8 Items Saved</div>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0", fontWeight: 600 }}>Basmati Rice, Turmeric, Honey, Mangoes, and more...</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => router.push("/consumer/marketplace")} style={{ padding: "10px 18px", borderRadius: "12px", border: "1px solid #10b981", background: "#fff", color: "#059669", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>Continue Shopping</button>
                  <button onClick={() => router.push("/consumer/wishlist")} style={{ padding: "10px 18px", borderRadius: "12px", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontSize: "13px", fontWeight: 800, border: "none", cursor: "pointer" }}>View Wishlist</button>
                </div>
              </div>
            )}

            {/* 5. NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SectionTitle title="Notification Preferences" desc="Control which alert types you receive." />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {[
                    { state: notifOrderUpdates, set: setNotifOrderUpdates, label: "Order Updates", desc: "Real-time updates on order creation, payment, and dispatch." },
                    { state: notifDeliveryAlerts, set: setNotifDeliveryAlerts, label: "Delivery Alerts", desc: "Automated alerts when courier reaches out-for-delivery status." },
                    { state: notifPriceDrops, set: setNotifPriceDrops, label: "Price Drop Alerts", desc: "Triggered when a wishlist item drops in price." },
                    { state: notifWeather, set: setNotifWeather, label: "Weather Alerts", desc: "Regional temperature or weather warnings near delivery areas." },
                    { state: notifAISuggestions, set: setNotifAISuggestions, label: "AI Suggestions", desc: "Smart recommendations based on your purchase history." },
                    { state: notifSchemes, set: setNotifSchemes, label: "Government Schemes", desc: "Food benefit programs and consumer policies." },
                    { state: notifOffers, set: setNotifOffers, label: "Marketplace Offers", desc: "Discounts and wholesale coupons from verified farmers." },
                  ].map((item) => (
                    <div key={item.label} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                      padding: "14px 0", borderBottom: "1px solid #f1f5f9",
                    }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block" }}>{item.label}</span>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{item.desc}</span>
                      </div>
                      <Toggle checked={item.state} onChange={(v) => { item.set(v); setTimeout(() => handleSaveProfile(), 100); }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. SECURITY */}
            {activeTab === "security" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SectionTitle title="Security & Account Access" desc="Manage passwords, authentication, and active sessions." />
                <div style={{ padding: "20px", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#374151", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Lock style={{ width: 14, height: 14, color: "#10b981" }} /> Change Account Password
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <input type="password" placeholder="Current Password" style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />
                    <input type="password" placeholder="New Password" style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMessage({ type: "success", text: "Password change request sent to your email!" }); setTimeout(() => setMessage(null), 3000); }}
                    style={{ alignSelf: "flex-start", padding: "9px 18px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#374151", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Update Password
                  </button>
                </div>
                <div style={{ padding: "20px", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#374151", margin: "0 0 12px" }}>Login Devices & Active Sessions</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { device: "Windows PC (Chrome)", location: "Mumbai, India · Current Device", online: true },
                      { device: "Apple iPhone 15 Pro", location: "Pune, India · Last login 2 hours ago", online: false },
                    ].map((d) => (
                      <div key={d.device} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", margin: 0 }}>{d.device}</p>
                          <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0" }}>{d.location}</p>
                        </div>
                        {d.online
                          ? <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 10px", borderRadius: "20px" }}>Online</span>
                          : <button onClick={() => { setMessage({ type: "success", text: "Device session revoked!" }); setTimeout(() => setMessage(null), 3000); }} style={{ fontSize: "11px", fontWeight: 800, color: "#ef4444", background: "transparent", border: "none", cursor: "pointer" }}>Revoke</button>
                        }
                      </div>
                    ))}
                  </div>
                </div>
                <MessageBanner message={message} />
              </div>
            )}

            {/* 7. LANGUAGE */}
            {activeTab === "language" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SectionTitle title="Language Settings" desc="Choose your preferred language across the marketplace." />
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "20px" }}>
                  <LanguageSwitcher compact={false} platform="consumer" />
                </div>
              </div>
            )}

            {/* 8. ACCESSIBILITY */}
            {activeTab === "accessibility" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SectionTitle title="Accessibility Preferences" desc="Toggle visual assistance, voice control, and text scaling." />
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "20px" }}>
                  <AccessibilityPanel />
                </div>
              </div>
            )}

            {/* 9. AI PREFERENCES */}
            {activeTab === "ai" && (
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SectionTitle title="AI Personalization" desc="Tailor recommendations, alerts, and crop filters to your preferences." />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                  <Field label="Favorite Crop Categories" value={favCategories} onChange={setFavCategories} placeholder="e.g. Organic, Fruits, Vegetables" />
                  <Field label="Favorite Target Crops" value={favCrops} onChange={setFavCrops} placeholder="e.g. Basmati Rice, Alphonso Mango" />
                  <Field label="Preferred Delivery Timeline">
                    <select value={wishlistPref} onChange={(e) => setWishlistPref(e.target.value)} style={{ width: "100%", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", color: "#334155", outline: "none", fontFamily: "Inter, sans-serif" }}>
                      <option value="In-Stock Only">Same-Day Delivery Only</option>
                      <option value="Price Drops">Express (Within 24 Hours)</option>
                      <option value="Always Notify">No Preference</option>
                    </select>
                  </Field>
                  <Field label="Preferred Farmer Types">
                    <select style={{ width: "100%", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", color: "#334155", outline: "none", fontFamily: "Inter, sans-serif" }}>
                      <option value="all">Any Verified Farmer</option>
                      <option value="organic">Organic Certified Only</option>
                      <option value="cooperative">Farmer Cooperatives Only</option>
                    </select>
                  </Field>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" disabled={saving} style={{ padding: "12px 24px", borderRadius: "14px", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontSize: "13px", fontWeight: 800, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Zap style={{ width: 14, height: 14 }} />}
                    Save Preferences
                  </button>
                </div>
                <MessageBanner message={message} />
              </form>
            )}

            {/* 10. SUPPORT */}
            {activeTab === "support" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SectionTitle title="Help & Support Desk" desc="Read FAQ guides, raise troubleshooting tickets, or submit feedback." />

                {/* FAQ */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Frequently Asked Questions</p>
                  {[
                    { q: "How is item pricing decided?", a: "Prices are set directly by the farmers themselves based on their cost of cultivation and local mandi wholesale indicators. AgriNex AI adds no middleman commissions." },
                    { q: "What is my trust score rating?", a: "Your trust score represents purchase fulfillment rating. Completing checkouts, submitting verified reviews, and maintaining zero spam orders keeps the score high." },
                    { q: "Can I coordinate bulk delivery?", a: "Yes, you can coordinate wholesale logistics directly by selecting cooperative farmers on the marketplace catalog." },
                  ].map((item, idx) => {
                    const isOpen = faqOpenIndex === idx;
                    return (
                      <div key={item.q} style={{ border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
                        <button
                          type="button"
                          onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#f8fafc", fontSize: "13px", fontWeight: 800, color: "#374151", cursor: "pointer", border: "none", textAlign: "left", fontFamily: "Inter, sans-serif" }}
                        >
                          <span>{item.q}</span>
                          <ChevronDown style={{ width: 14, height: 14, color: "#94a3b8", transform: isOpen ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }} />
                        </button>
                        {isOpen && (
                          <div style={{ padding: "14px 16px", background: "#ffffff", fontSize: "13px", color: "#64748b", lineHeight: 1.6, fontWeight: 600, borderTop: "1px solid #f1f5f9" }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Support ticket form */}
                <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#374151", margin: 0 }}>Open Support Ticket</p>
                  <input
                    type="text"
                    placeholder="Subject / Summary of Issue"
                    value={supportTicketTitle}
                    onChange={(e) => setSupportTicketTitle(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }}
                  />
                  <textarea
                    rows={3}
                    placeholder="Describe the issue in detail..."
                    value={supportTicketDesc}
                    onChange={(e) => setSupportTicketDesc(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", resize: "none", fontFamily: "Inter, sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!supportTicketTitle || !supportTicketDesc) return;
                      setMessage({ type: "success", text: "Support ticket registered! ID: #AGX-9382" });
                      setSupportTicketTitle("");
                      setSupportTicketDesc("");
                      setTimeout(() => setMessage(null), 4000);
                    }}
                    style={{ alignSelf: "flex-start", padding: "10px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#374151", fontSize: "13px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Send style={{ width: 14, height: 14, color: "#10b981" }} />
                    Submit Ticket
                  </button>
                  <MessageBanner message={message} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}