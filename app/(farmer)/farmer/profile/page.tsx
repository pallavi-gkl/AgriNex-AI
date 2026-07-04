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

  // Editable fields (Database linked)
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  // KYC Upload states
  const [kycStatus, setKycStatus] = useState<"pending" | "verified" | "not_submitted">("pending");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Expanded fields (Auth metadata linked)
  const [profilePhoto, setProfilePhoto] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [languages, setLanguages] = useState("");

  const [farmName, setFarmName] = useState("");
  const [village, setVillage] = useState("");
  const [mandal, setMandal] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [pinCode, setPinCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [totalLand, setTotalLand] = useState("");
  const [cultivatedLand, setCultivatedLand] = useState("");
  const [irrigatedLand, setIrrigatedLand] = useState("");
  const [soilType, setSoilType] = useState("Clay Loam");
  const [waterSource, setWaterSource] = useState("Borewell");
  const [farmingType, setFarmingType] = useState("Crop Farming");
  const [farmingPractice, setFarmingPractice] = useState("Organic");
  const [majorCrops, setMajorCrops] = useState("");
  const [seasonalCrops, setSeasonalCrops] = useState("");
  const [cropRotation, setCropRotation] = useState("");

  const [livestock, setLivestock] = useState("");
  const [equipment, setEquipment] = useState("");
  const [storageCapacity, setStorageCapacity] = useState("");
  const [irrigationMethod, setIrrigationMethod] = useState("Drip");
  const [greenhouse, setGreenhouse] = useState("No");
  const [warehouse, setWarehouse] = useState("No");

  const [organicCert, setOrganicCert] = useState("");
  const [govRegIds, setGovRegIds] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [fssai, setFssai] = useState("");
  const [otherCerts, setOtherCerts] = useState("");

  const [experienceYears, setExperienceYears] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState("Horticulture");
  const [preferredMarkets, setPreferredMarkets] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Fetch DB profile details
          const { data } = await (supabase as any)
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

          // 2. Fetch extra profile details from metadata
          const meta = user.user_metadata?.profile_details || {};
          setProfilePhoto(meta.profilePhoto || "");
          setDob(meta.dob || "");
          setGender(meta.gender || "Male");
          setLanguages(meta.languages || "");
          setFarmName(meta.farmName || "");
          setVillage(meta.village || "");
          setMandal(meta.mandal || "");
          setDistrict(meta.district || "");
          setState(meta.state || "");
          setCountry(meta.country || "India");
          setPinCode(meta.pinCode || "");
          setLatitude(meta.latitude || "");
          setLongitude(meta.longitude || "");
          setTotalLand(meta.totalLand || "");
          setCultivatedLand(meta.cultivatedLand || "");
          setIrrigatedLand(meta.irrigatedLand || "");
          setSoilType(meta.soilType || "Clay Loam");
          setWaterSource(meta.waterSource || "Borewell");
          setFarmingType(meta.farmingType || "Crop Farming");
          setFarmingPractice(meta.farmingPractice || "Organic");
          setMajorCrops(meta.majorCrops || "");
          setSeasonalCrops(meta.seasonalCrops || "");
          setCropRotation(meta.cropRotation || "");
          setLivestock(meta.livestock || "");
          setEquipment(meta.equipment || "");
          setStorageCapacity(meta.storageCapacity || "");
          setIrrigationMethod(meta.irrigationMethod || "Drip");
          setGreenhouse(meta.greenhouse || "No");
          setWarehouse(meta.warehouse || "No");
          setOrganicCert(meta.organicCert || "");
          setGovRegIds(meta.govRegIds || "");
          setFarmerId(meta.farmerId || "");
          setFssai(meta.fssai || "");
          setOtherCerts(meta.otherCerts || "");
          setExperienceYears(meta.experienceYears || "");
          setPrimaryCategory(meta.primaryCategory || "Horticulture");
          setPreferredMarkets(meta.preferredMarkets || "");
          setBankName(meta.bankName || "");
          setBankHolder(meta.bankHolder || "");
          setBankAccount(meta.bankAccount || "");
          setBankIfsc(meta.bankIfsc || "");
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
            farmName,
            village,
            mandal,
            district,
            state,
            country,
            pinCode,
            latitude,
            longitude,
            totalLand,
            cultivatedLand,
            irrigatedLand,
            soilType,
            waterSource,
            farmingType,
            farmingPractice,
            majorCrops,
            seasonalCrops,
            cropRotation,
            livestock,
            equipment,
            storageCapacity,
            irrigationMethod,
            greenhouse,
            warehouse,
            organicCert,
            govRegIds,
            farmerId,
            fssai,
            otherCerts,
            experienceYears,
            primaryCategory,
            preferredMarkets,
            bankName,
            bankHolder,
            bankAccount,
            bankIfsc,
            upiId
          }
        }
      });

      if (authError) throw authError;

      setMessage({ type: "success", text: "Profile details updated successfully!" });
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
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-emerald-500/20"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white font-extrabold text-3xl mx-auto border-2 border-emerald-500/20"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 0 24px rgba(16,185,129,0.2)",
                  }}
                >
                  {fullName.charAt(0).toUpperCase() || "F"}
                </div>
              )}
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
            {/* PERSONAL INFORMATION */}
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Profile Photo URL</label>
                <input
                  type="text"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Farmer Name</label>
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
                <label className="text-xs text-slate-400 font-mono">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Email Address</label>
                <input
                  type="email"
                  value={profile?.id ? (profile as any).email || "" : ""}
                  disabled
                  className="glass-input text-xs opacity-50 cursor-not-allowed"
                  placeholder="Email Address"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-mono">Languages Spoken</label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Hindi, Telugu, English"
                />
              </div>
            </div>

            {/* ADDRESS INFORMATION */}
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">
              Address Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Farm Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Green Valley Farm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Farm Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Plot No 12, APMC Area"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Shamgarh"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Mandal / Taluk</label>
                <input
                  type="text"
                  value={mandal}
                  onChange={(e) => setMandal(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Gharaunda"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Karnal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Haryana"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. India"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">PIN Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 132001"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">GPS Location Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 29.6857"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">GPS Location Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 76.9905"
                />
              </div>
            </div>

            {/* FARM INFORMATION */}
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">
              Farm Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Total Land Owned (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={totalLand}
                  onChange={(e) => setTotalLand(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 25.0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Cultivated Land (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cultivatedLand}
                  onChange={(e) => setCultivatedLand(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 24.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Irrigated Land (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={irrigatedLand}
                  onChange={(e) => setIrrigatedLand(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 22.0"
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
                <label className="text-xs text-slate-400 font-mono">Water Source</label>
                <select
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Borewell">Borewell</option>
                  <option value="Canal">Canal</option>
                  <option value="Open Well">Open Well</option>
                  <option value="Rainfed">Rainfed</option>
                  <option value="Pond">Pond</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Farming Type</label>
                <input
                  type="text"
                  value={farmingType}
                  onChange={(e) => setFarmingType(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Mixed, Crop, Horticulture"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Practice Type</label>
                <select
                  value={farmingPractice}
                  onChange={(e) => setFarmingPractice(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Organic">Organic</option>
                  <option value="Conventional">Conventional</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Major Crops</label>
                <input
                  type="text"
                  value={majorCrops}
                  onChange={(e) => setMajorCrops(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Basmati Rice, Wheat"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Seasonal Crops</label>
                <input
                  type="text"
                  value={seasonalCrops}
                  onChange={(e) => setSeasonalCrops(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Mustard, Vegetables"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Crop Rotation Details</label>
                <input
                  type="text"
                  value={cropRotation}
                  onChange={(e) => setCropRotation(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Rice-Wheat rotation cycle"
                />
              </div>
            </div>

            {/* AGRICULTURAL RESOURCES */}
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">
              Agricultural Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Livestock Details</label>
                <input
                  type="text"
                  value={livestock}
                  onChange={(e) => setLivestock(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 4 Cows, 2 Buffaloes"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Farm Equipment</label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Tractor, Power Tiller, Drip lines"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Storage Capacity</label>
                <input
                  type="text"
                  value={storageCapacity}
                  onChange={(e) => setStorageCapacity(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 50 Metric Tons Warehouse"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Irrigation Method</label>
                <select
                  value={irrigationMethod}
                  onChange={(e) => setIrrigationMethod(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Drip">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler Irrigation</option>
                  <option value="Flood">Flood Irrigation</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Greenhouse Availability</label>
                <select
                  value={greenhouse}
                  onChange={(e) => setGreenhouse(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Warehouse Availability</label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            {/* CERTIFICATIONS & REGISTRATION */}
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">
              Certifications & Registration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Organic Certifications</label>
                <input
                  type="text"
                  value={organicCert}
                  onChange={(e) => setOrganicCert(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. NPOP Organic Cert, PGS-India"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Government Registration IDs</label>
                <input
                  type="text"
                  value={govRegIds}
                  onChange={(e) => setGovRegIds(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. PM-KISAN ID"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Farmer ID</label>
                <input
                  type="text"
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. GOV-FRM-837492"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">FSSAI ID (if applicable)</label>
                <input
                  type="text"
                  value={fssai}
                  onChange={(e) => setFssai(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. FSSAI-283948293849"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-mono">Other Certifications</label>
                <input
                  type="text"
                  value={otherCerts}
                  onChange={(e) => setOtherCerts(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. ISO 22000, Good Agricultural Practices (GAP)"
                />
              </div>
            </div>

            {/* EXPERIENCE */}
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">
              Experience
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Years of Farming Experience</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. 15"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Primary Farming Category</label>
                <select
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Horticulture">Horticulture (Fruits & Veg)</option>
                  <option value="Grain Crop">Grain Crops (Wheat, Paddy)</option>
                  <option value="Spices">Spices & Cash Crops</option>
                  <option value="Floriculture">Floriculture (Flowers)</option>
                  <option value="Dairy / Poultry">Dairy & Animal Husbandry</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-mono">Preferred Selling Markets</label>
                <input
                  type="text"
                  value={preferredMarkets}
                  onChange={(e) => setPreferredMarkets(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Delhi APMC, Local Cooperative Mandi"
                />
              </div>
            </div>

            {/* PAYMENT DETAILS */}
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 pt-2">
              Payment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. State Bank of India"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Account Holder Name</label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Account Number</label>
                <input
                  type="password"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="glass-input text-xs font-mono"
                  placeholder="Bank Account Number"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">IFSC Code</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  className="glass-input text-xs font-mono uppercase"
                  placeholder="e.g. SBIN0001234"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-mono">UPI ID (e.g. GPay, PhonePe)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="glass-input text-xs font-mono"
                  placeholder="e.g. rajeshkumar@okaxis"
                />
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
