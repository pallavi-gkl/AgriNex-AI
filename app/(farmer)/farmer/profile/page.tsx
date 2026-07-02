"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Star,
  Sprout,
  Loader2,
  Save,
  CheckCircle,
  FileText,
  AlertCircle,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { cn } from "@/lib/utils";

export default function FarmerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [farmArea, setFarmArea] = useState("24.5");
  const [primaryCrops, setPrimaryCrops] = useState("Basmati Rice, Turmeric");
  const [soilType, setSoilType] = useState("Clay Loam");
  const [irrigationType, setIrrigationType] = useState("Drip");

  // KYC Upload states
  const [kycStatus, setKycStatus] = useState<"pending" | "verified" | "not_submitted">("pending");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (data) {
            setProfile(data);
            setFullName(data.full_name || "");
            setPhoneNumber(data.phone_number || "");
            setAddress(data.address || "");
            setKycStatus(data.is_verified ? "verified" : "pending");
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

      setMessage({ type: "success", text: "Profile details updated successfully!" });
      // Update local state profile
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

  const handleUploadKYC = async () => {
    setUploadingDoc(true);
    // Simulate file upload delay
    await new Promise((r) => setTimeout(r, 2000));
    setKycStatus("pending");
    setMessage({ type: "success", text: "KYC Documents submitted successfully. Verification takes 24-48 hours." });
    setUploadingDoc(false);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
          <p className="text-sm font-semibold font-sans">Loading Profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-400" />
          Farmer Profile Settings
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Manage your personal details, farm details, and complete your KYC verification status.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Trust Score Card */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-3xl text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white font-extrabold text-3xl mx-auto border-2 border-emerald-500/20"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 0 24px rgba(16,185,129,0.2)",
                }}
              >
                {fullName.charAt(0).toUpperCase() || "F"}
              </div>
              <div className="absolute bottom-0 right-1/2 translate-x-12">
                {kycStatus === "verified" ? (
                  <div className="bg-emerald-500 text-black rounded-full p-1 border border-black" title="Verified Farmer">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="bg-amber-500 text-black rounded-full p-1 border border-black" title="Verification Pending">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{fullName || "AgriNex Farmer"}</h2>
              <p className="text-xs text-emerald-400 font-mono mt-1 capitalize">{profile?.role || "Farmer"}</p>
            </div>

            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-2 text-center font-mono">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500">TRUST SCORE</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-white">4.9</span>
                </div>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500">KYC STATUS</p>
                <p className={cn(
                  "text-[11px] font-bold mt-1 uppercase",
                  kycStatus === "verified" ? "text-emerald-400" : "text-amber-400"
                )}>
                  {kycStatus}
                </p>
              </div>
            </div>
          </div>

          {/* KYC Document Verification */}
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              KYC Verification
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify your agricultural status to raise listing limits, enable instant payments, and boost consumer trust score.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Land Registry Records</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Aadhaar Card / Crop Card</span>
              </div>
            </div>

            {kycStatus === "verified" ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-bold">
                ✓ Documents Verified
              </div>
            ) : (
              <button
                onClick={handleUploadKYC}
                disabled={uploadingDoc}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-mono font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
              >
                {uploadingDoc ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Documents
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Editable Forms */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-3xl space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-mono">Farm Address / Location</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Karnal Mandi Road, Sector 4, Haryana"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">
              Agricultural Profile (For Yield &amp; Price AI Models)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Total Cultivated Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Primary Cultivated Crops</label>
                <input
                  type="text"
                  required
                  value={primaryCrops}
                  onChange={(e) => setPrimaryCrops(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Rice, Wheat, Turmeric"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Alluvial">Alluvial Soil</option>
                  <option value="Sandy">Sandy Loam</option>
                  <option value="Black Cotton">Black Cotton Soil</option>
                  <option value="Laterite">Laterite Soil</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Irrigation Infrastructure</label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Drip">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler Irrigation</option>
                  <option value="Flood">Canal/Flood Irrigation</option>
                  <option value="Rainfed">Rainfed (No artificial irrigation)</option>
                </select>
              </div>
            </div>

            {message && (
              <div
                className={cn(
                  "p-3 rounded-xl text-xs font-medium font-sans flex items-center gap-2",
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}
              >
                {message.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-mono font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile Settings
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
