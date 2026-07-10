"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview app/(farmer)/farmer/settings/page.tsx
 * Farmer-specific settings — profile info, language, and accessibility.
 * Premium redesign with glassmorphism and animations.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Globe, Accessibility, User, Shield,
  Star, CheckCircle2, Clock, Save, Loader2, CheckCircle, AlertCircle, Sparkles, Lock, Bell
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import AccessibilityPanel from "@/components/settings/AccessibilityPanel";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { cn } from "@/lib/utils";

type TabId = "general" | "accessibility" | "profile";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "general",       label: "General",       icon: Globe },
  { id: "profile",       label: "Farm Profile",   icon: User },
  { id: "accessibility", label: "Accessibility",  icon: Accessibility },
];

export default function FarmerSettingsPage() {
  const { t } = useTranslation("farmer");
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [farmArea, setFarmArea] = useState("24.5");
  const [primaryCrops, setPrimaryCrops] = useState("Basmati Rice, Turmeric");
  const [soilType, setSoilType] = useState("Clay Loam");
  const [irrigationType, setIrrigationType] = useState("Drip");
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
        .update({ full_name: fullName.trim(), phone_number: phoneNumber.trim(), address: address.trim() })
        .eq("id", profile.id);
      if (error) throw error;
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setProfile({ ...profile, full_name: fullName.trim(), phone_number: phoneNumber.trim(), address: address.trim() });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-emerald-50 border border-slate-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-lg shadow-slate-500/30">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {t("farmerSettings1")}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Profile, language, and accessibility preferences
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">{t("customizeExperience")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200 shadow-sm">
              <Bell className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-slate-700">{t("notifications2")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Summary Card */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card rounded-3xl shadow-sm p-6 flex items-center gap-6"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            {profile.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-slate-800 font-bold text-xl">{profile.full_name}</h2>
              {profile.is_verified
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" />
                : <Clock className="w-5 h-5 text-amber-500 shrink-0" />}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">{t("farmer")}</span>
              <span className="text-slate-500 text-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold">{profile.trust_score?.toFixed(1) || "4.9"}</span>
                <span className="text-slate-400">{t("trustScore")}</span>
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        role="tablist" 
        className="flex gap-2 p-2 rounded-2xl bg-slate-100 border border-slate-200"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} role="tab" aria-selected={isActive} onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "bg-white text-emerald-600 shadow-sm border border-emerald-200" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}>
          {activeTab === "general" && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="premium-card rounded-3xl shadow-sm p-6"
              >
                <LanguageSwitcher compact={false} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="premium-card rounded-3xl shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-slate-800 font-bold text-lg">Security & Privacy</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Email Authentication", status: "Active", color: "emerald" },
                    { label: "Row-Level Security (RLS)", status: "Enforced", color: "emerald" },
                    { label: "API Rate Limiting", status: "10 req/min", color: "sky" },
                    { label: "Farmer KYC", status: profile?.is_verified ? "Verified" : "Pending", color: profile?.is_verified ? "emerald" : "amber" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl">
                      <span className="text-slate-600 font-semibold">{item.label}</span>
                      <span className={cn(
                        "font-bold px-3 py-1.5 rounded-lg text-sm",
                        item.color === "emerald" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                        item.color === "sky" ? "bg-sky-100 text-sky-700 border border-sky-200" :
                        "bg-amber-100 text-amber-700 border border-amber-200"
                      )}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-4 bg-slate-50 border border-slate-200 text-center"
              >
                <p className="text-xs text-slate-500 font-mono">AgriNex AI v1.0.0 · Farmer Platform · Powered by Google Gemini</p>
              </motion.div>
            </div>
          )}

          {activeTab === "profile" && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSaveProfile} 
              className="premium-card shadow-sm p-8 rounded-3xl space-y-8"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{t("personalInfo")}</h3>
                <p className="text-slate-500 text-sm">Update your personal contact details</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("fullName")}</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="glass-input w-full px-4 py-3 text-sm" placeholder="e.g. Rajesh Kumar" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Phone Number</label>
                  <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                    className="glass-input w-full px-4 py-3 text-sm" placeholder="e.g. 9876543210" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("farmAddressLocation")}</label>
                  <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
                    className="glass-input w-full px-4 py-3 text-sm" placeholder="e.g. Karnal Mandi Road, Sector 4, Haryana" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{t("agriculturalProfile")}</h3>
                <p className="text-slate-500 text-sm">{t("informationAboutYourFarmOperat")}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Area (Acres)</label>
                  <input type="number" step="0.1" required value={farmArea} onChange={(e) => setFarmArea(e.target.value)}
                    className="glass-input w-full px-4 py-3 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Primary Crops</label>
                  <input type="text" required value={primaryCrops} onChange={(e) => setPrimaryCrops(e.target.value)}
                    className="glass-input w-full px-4 py-3 text-sm" placeholder="e.g. Rice, Wheat, Turmeric" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("soilType")}</label>
                  <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="glass-input w-full px-4 py-3 text-sm cursor-pointer">
                    <option value={t("clayLoam")}>{t("clayLoam")}</option>
                    <option value="Alluvial">{t("alluvialSoil")}</option>
                    <option value="Sandy">Sandy Loam</option>
                    <option value="Black Cotton">{t("blackCottonSoil")}</option>
                    <option value="Laterite">Laterite Soil</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("irrigationType")}</label>
                  <select value={irrigationType} onChange={(e) => setIrrigationType(e.target.value)} className="glass-input w-full px-4 py-3 text-sm cursor-pointer">
                    <option value={t("drip")}>{t("dripIrrigation")}</option>
                    <option value={t("sprinkler")}>Sprinkler Irrigation</option>
                    <option value={t("flood")}>{t("canalFloodIrrigation")}</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-xl text-sm font-medium flex items-center gap-3",
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}>
                  {message.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  {message.text}
                </motion.div>
              )}

              <button type="submit" disabled={saving}
                className="w-full py-4 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Profile</>}
              </button>
            </motion.form>
          )}

          {activeTab === "accessibility" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card rounded-3xl shadow-sm p-6"
            >
              <AccessibilityPanel />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}