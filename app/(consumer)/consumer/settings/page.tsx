"use client";

/**
 * @fileoverview app/(consumer)/consumer/settings/page.tsx
 * Consumer-specific settings — profile info, language, and accessibility.
 * Automatically wrapped by ConsumerShell via the (consumer) layout.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Globe, Accessibility, User, Shield,
  Star, CheckCircle2, Clock, Save, Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import AccessibilityPanel from "@/components/settings/AccessibilityPanel";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

type TabId = "general" | "accessibility" | "profile";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "general",       label: "General",       icon: Globe },
  { id: "profile",       label: "My Profile",    icon: User },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
];

export default function ConsumerSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields (Database linked)
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Expanded fields (Auth metadata linked)
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

  const [savedAddresses, setSavedAddresses] = useState("");
  const [notifPref, setNotifPref] = useState("Email & Push");
  const [commPref, setCommPref] = useState("WhatsApp");

  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Fetch from DB profiles
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

          // 2. Fetch extra profile details from metadata
          const meta = user.user_metadata?.profile_details || {};
          setProfilePhoto(meta.profilePhoto || "");
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
          setFavCategories(meta.favCategories || "");
          setFavCrops(meta.favCrops || "");
          setWishlistPref(meta.wishlistPref || "In-Stock Only");
          setSavedAddresses(meta.savedAddresses || "");
          setNotifPref(meta.notifPref || "Email & Push");
          setCommPref(meta.commPref || "WhatsApp");
          setUpiId(meta.upiId || "");
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
      // Update public.profiles
      const { error: dbError } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          address: address.trim(),
        })
        .eq("id", profile.id);

      if (dbError) throw dbError;

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          profile_details: {
            profilePhoto,
            dob,
            gender,
            languages,
            houseNumber,
            street,
            locality,
            city,
            district,
            state,
            country,
            pinCode,
            alternateDelivery,
            gpsLocation,
            prefLanguage,
            prefPayment,
            favCategories,
            favCrops,
            wishlistPref,
            savedAddresses,
            notifPref,
            commPref,
            upiId
          }
        }
      });

      if (authError) throw authError;

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setProfile({
        ...profile,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        address: address.trim(),
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-sm font-semibold">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.35)" }}>
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Account Settings</h1>
            <p className="text-slate-500 text-xs mt-0.5">Profile, language, and accessibility preferences</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Summary Card */}
      {profile && (
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-amber-500/20" />
          ) : (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 0 24px rgba(245,158,11,0.3)" }}>
              {profile.full_name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-base truncate">{profile.full_name}</h2>
              {profile.is_verified
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" />
                : <Clock className="w-4 h-4 text-amber-400 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Consumer</span>
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {profile.trust_score?.toFixed(1) || "4.9"} Rating
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div role="tablist" className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} role="tab" aria-selected={isActive} onClick={() => setActiveTab(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                color: isActive ? "#60a5fa" : "#94a3b8",
                border: isActive ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
              }}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}>
          {activeTab === "general" && (
            <div className="space-y-5">
              <div className="glass-panel rounded-2xl p-5">
                <LanguageSwitcher compact={false} />
              </div>
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <h3 className="text-white font-semibold text-sm">Security & Privacy</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Email Authentication", status: "Active", color: "#10b981" },
                    { label: "Row-Level Security (RLS)", status: "Enforced", color: "#10b981" },
                    { label: "Data Encryption", status: "AES-256", color: "#38bdf8" },
                    { label: "Account Status", status: profile?.is_verified ? "Verified" : "Active", color: "#10b981" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="font-medium px-2 py-0.5 rounded-full"
                        style={{ color: item.color, background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-4 bg-slate-900/40 border border-white/5">
                <p className="text-[10px] text-slate-500 font-mono">AgriNex AI v1.0.0 · Customer Marketplace · Powered by Google Gemini</p>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-2xl space-y-6">
              {/* PERSONAL INFORMATION */}
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Profile Photo URL</label>
                  <input type="text" value={profilePhoto} onChange={(e) => setProfilePhoto(e.target.value)}
                    className="glass-input text-xs" placeholder="https://example.com/photo.jpg" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Full Name</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Priya Sharma" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Phone Number</label>
                  <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. 9876543210" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Email Address</label>
                  <input type="email" value={profile?.id ? (profile as any).email || "" : ""} disabled
                    className="glass-input text-xs opacity-50 cursor-not-allowed" placeholder="Email Address" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Date of Birth</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                    className="glass-input text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="glass-input text-xs">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Languages Spoken</label>
                  <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. English, Hindi, Punjabi" />
                </div>
              </div>

              {/* ADDRESS INFORMATION */}
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">Address Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">House / Flat Number</label>
                  <input type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Flat 4B" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Street</label>
                  <input type="text" value={street} onChange={(e) => setStreet(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Green Apartments" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Area / Locality</label>
                  <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Andheri West" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Mumbai" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">District</label>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Mumbai Suburban" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">State</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Maharashtra" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. India" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">PIN Code</label>
                  <input type="text" value={pinCode} onChange={(e) => setPinCode(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. 400053" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Default Delivery Address</label>
                  <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Flat 4B, Green Apartments, Andheri West, Mumbai 400053" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Alternate Delivery Address</label>
                  <input type="text" value={alternateDelivery} onChange={(e) => setAlternateDelivery(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Office: Sector 5, Powai, Mumbai 400076" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 font-mono">GPS Location Coordinates (Optional)</label>
                  <input type="text" value={gpsLocation} onChange={(e) => setGpsLocation(e.target.value)}
                    className="glass-input text-xs font-mono" placeholder="e.g. 19.1136° N, 72.8697° E" />
                </div>
              </div>

              {/* PREFERENCES */}
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">Preferences</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Preferred Language</label>
                  <select value={prefLanguage} onChange={(e) => setPrefLanguage(e.target.value)} className="glass-input text-xs">
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    <option value="ml">മലയാളം (Malayalam)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Preferred Payment Method</label>
                  <select value={prefPayment} onChange={(e) => setPrefPayment(e.target.value)} className="glass-input text-xs">
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="NetBanking">Net Banking</option>
                    <option value="COD">Cash on Delivery</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Favourite Categories</label>
                  <input type="text" value={favCategories} onChange={(e) => setFavCategories(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Organic, Fruits, Leafy Greens" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Favourite Crops</label>
                  <input type="text" value={favCrops} onChange={(e) => setFavCrops(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Basmati Rice, Alphonso Mango" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Wishlist Preferences</label>
                  <select value={wishlistPref} onChange={(e) => setWishlistPref(e.target.value)} className="glass-input text-xs">
                    <option value="In-Stock Only">Notify when In-Stock Only</option>
                    <option value="Price Drops">Notify on Price Drops</option>
                    <option value="Always Notify">Always Notify</option>
                  </select>
                </div>
              </div>

              {/* ACCOUNT INFORMATION */}
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Saved Delivery Locations (Shortcuts)</label>
                  <input type="text" value={savedAddresses} onChange={(e) => setSavedAddresses(e.target.value)}
                    className="glass-input text-xs" placeholder="e.g. Home, Work, Parents" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Notification Preferences</label>
                  <select value={notifPref} onChange={(e) => setNotifPref(e.target.value)} className="glass-input text-xs">
                    <option value="Email & Push">Email & Push Notifications</option>
                    <option value="SMS Only">SMS Tickers Only</option>
                    <option value="Mute All">Mute All Notifications</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Communication Preferences</label>
                  <select value={commPref} onChange={(e) => setCommPref(e.target.value)} className="glass-input text-xs">
                    <option value="WhatsApp">WhatsApp Messages</option>
                    <option value="SMS">SMS Texting</option>
                    <option value="Email">Email Newsletters</option>
                  </select>
                </div>
              </div>

              {/* PAYMENT DETAILS */}
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">Payment Details</h3>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">UPI ID (e.g. rajesh@oksbi)</label>
                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                  className="glass-input text-xs font-mono" placeholder="e.g. priyasharma@okaxis" />
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {message.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={saving}
                className="w-full py-3 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 4px 12px rgba(59,130,246,0.2)" }}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Profile</>}
              </button>
            </form>
          )}

          {activeTab === "accessibility" && (
            <div className="glass-panel rounded-2xl p-5">
              <AccessibilityPanel />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
