"use client";
import { useTranslation } from "@/hooks/useTranslation";


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
  const { t } = useTranslation("farmer");
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {t("farmerProfile")}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage your personal details, farm information, and KYC verification
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">KYC Verified</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-teal-200 shadow-sm">
              <Sprout className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-slate-700">{t("farmDetails")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200 shadow-sm">
              <Star className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-slate-700">{t("trustScore")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Trust Score Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="premium-card shadow-sm p-6 rounded-3xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-emerald-500/20 shadow-lg"
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-white font-extrabold text-4xl mx-auto border-4 border-emerald-500/20 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 0 32px rgba(16,185,129,0.3)",
                  }}
                >
                  {fullName.charAt(0).toUpperCase() || "F"}
                </div>
              )}
              <div className="absolute bottom-0 right-1/2 translate-x-14">
                {kycStatus === "verified" ? (
                  <div className="bg-emerald-500 text-white rounded-full p-2 border-2 border-white shadow-lg" title="Verified Farmer">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="bg-amber-500 text-white rounded-full p-2 border-2 border-white shadow-lg" title="Verification Pending">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">{fullName || "AgriNex Farmer"}</h2>
              <p className="text-sm text-emerald-600 font-semibold mt-1 capitalize">{profile?.role || "Farmer"}</p>
            </div>

            <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-4 text-center">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("trustScore")}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-bold text-slate-800">4.9</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200">
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">KYC Status</p>
                <p className={cn(
                  "text-sm font-bold mt-2 uppercase",
                  kycStatus === "verified" ? "text-emerald-600" : "text-amber-600"
                )}>
                  {kycStatus}
                </p>
              </div>
            </div>
          </div>

          {/* KYC Document Verification */}
          <div className="premium-card shadow-sm p-6 rounded-3xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">KYC Verification</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Verify your agricultural status to raise listing limits, enable instant payments, and boost consumer trust score.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl">
                <FileText className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600 font-semibold">Land Registry Records</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl">
                <FileText className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600 font-semibold">{t("aadhaarCardCropCard")}</span>
              </div>
            </div>

            {kycStatus === "verified" ? (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 rounded-xl text-center text-sm font-bold">
                ✓ Documents Verified
              </div>
            ) : (
              <button
                onClick={handleUploadKYC}
                disabled={uploadingDoc}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
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
        </motion.div>

        {/* Right Column: Editable Forms */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 space-y-6"
        >
          <form onSubmit={handleSaveProfile} className="premium-card shadow-sm p-8 rounded-3xl space-y-8">
            {/* PERSONAL INFORMATION */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t("personalInfo")}</h3>
              <p className="text-sm text-slate-500">Update your personal contact details</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Profile Photo URL</label>
                <input
                  type="text"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("farmerName")}</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("emailAddress")}</label>
                <input
                  type="email"
                  value={profile?.id ? (profile as any).email || "" : ""}
                  disabled
                  className="glass-input w-full px-4 py-3 text-sm opacity-50 cursor-not-allowed"
                  placeholder={t("emailAddress")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("dateOfBirth")}</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("gender")}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value={t("female")}>{t("female")}</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Languages Spoken</label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Hindi, Telugu, English"
                />
              </div>
            </div>

            {/* ADDRESS INFORMATION */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t("addressInformation")}</h3>
              <p className="text-sm text-slate-500">{t("farmLocationAndContactDetails")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("farmName")}</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Green Valley Farm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("farmAddress")}</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Plot No 12, APMC Area"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Shamgarh"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mandal / Taluk</label>
                <input
                  type="text"
                  value={mandal}
                  onChange={(e) => setMandal(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Gharaunda"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("district")}</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Karnal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("state")}</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Haryana"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("country")}</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. India"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">PIN Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 132001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("gpsLocationLatitude")}</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 29.6857"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("gpsLocationLongitude")}</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 76.9905"
                />
              </div>
            </div>

            {/* FARM INFORMATION */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t("farmInformation")}</h3>
              <p className="text-sm text-slate-500">Land details and farming practices</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Land Owned (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={totalLand}
                  onChange={(e) => setTotalLand(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 25.0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("cultivatedLandAcres")}</label>
                <input
                  type="number"
                  step="0.1"
                  value={cultivatedLand}
                  onChange={(e) => setCultivatedLand(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 24.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Irrigated Land (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={irrigatedLand}
                  onChange={(e) => setIrrigatedLand(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 22.0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("soilType")}</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm cursor-pointer"
                >
                  <option value={t("clayLoam")}>{t("clayLoam")}</option>
                  <option value="Alluvial">{t("alluvialSoil")}</option>
                  <option value="Sandy">Sandy Loam</option>
                  <option value="Black Cotton">{t("blackCottonSoil")}</option>
                  <option value="Laterite">Laterite Soil</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("waterSource")}</label>
                <select
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm cursor-pointer"
                >
                  <option value={t("borewell")}>{t("borewell")}</option>
                  <option value={t("canal")}>{t("canal")}</option>
                  <option value="Open Well">Open Well</option>
                  <option value="Rainfed">Rainfed</option>
                  <option value="Pond">Pond</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("farmingType")}</label>
                <input
                  type="text"
                  value={farmingType}
                  onChange={(e) => setFarmingType(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Mixed, Crop, Horticulture"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Practice Type</label>
                <select
                  value={farmingPractice}
                  onChange={(e) => setFarmingPractice(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm cursor-pointer"
                >
                  <option value={t("organic")}>{t("organic")}</option>
                  <option value={t("conventional")}>{t("conventional")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Major Crops</label>
                <input
                  type="text"
                  value={majorCrops}
                  onChange={(e) => setMajorCrops(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Basmati Rice, Wheat"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Seasonal Crops</label>
                <input
                  type="text"
                  value={seasonalCrops}
                  onChange={(e) => setSeasonalCrops(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Mustard, Vegetables"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("cropRotationDetails")}</label>
                <input
                  type="text"
                  value={cropRotation}
                  onChange={(e) => setCropRotation(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Rice-Wheat rotation cycle"
                />
              </div>
            </div>

            {/* AGRICULTURAL RESOURCES */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t("agriculturalResources")}</h3>
              <p className="text-sm text-slate-500">{t("equipmentAndInfrastructureDeta")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Livestock Details</label>
                <input
                  type="text"
                  value={livestock}
                  onChange={(e) => setLivestock(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 4 Cows, 2 Buffaloes"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("farmEquipment")}</label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Tractor, Power Tiller, Drip lines"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Storage Capacity</label>
                <input
                  type="text"
                  value={storageCapacity}
                  onChange={(e) => setStorageCapacity(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 50 Metric Tons Warehouse"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Irrigation Method</label>
                <select
                  value={irrigationMethod}
                  onChange={(e) => setIrrigationMethod(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm cursor-pointer"
                >
                  <option value={t("drip")}>{t("dripIrrigation")}</option>
                  <option value={t("sprinkler")}>Sprinkler Irrigation</option>
                  <option value={t("flood")}>{t("floodIrrigation")}</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("greenhouseAvailability")}</label>
                <select
                  value={greenhouse}
                  onChange={(e) => setGreenhouse(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm cursor-pointer"
                >
                  <option value={t("no")}>{t("no")}</option>
                  <option value={t("yes")}>{t("yes")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Warehouse Availability</label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm cursor-pointer"
                >
                  <option value={t("no")}>{t("no")}</option>
                  <option value={t("yes")}>{t("yes")}</option>
                </select>
              </div>
            </div>

            {/* CERTIFICATIONS & REGISTRATION */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t("certificationsRegistration")}</h3>
              <p className="text-sm text-slate-500">{t("governmentAndOrganicCertificat")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Organic Certifications</label>
                <input
                  type="text"
                  value={organicCert}
                  onChange={(e) => setOrganicCert(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. NPOP Organic Cert, PGS-India"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("governmentRegistrationIds")}</label>
                <input
                  type="text"
                  value={govRegIds}
                  onChange={(e) => setGovRegIds(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. PM-KISAN ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("farmerId")}</label>
                <input
                  type="text"
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. GOV-FRM-837492"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("fssaiIdIfApplicable")}</label>
                <input
                  type="text"
                  value={fssai}
                  onChange={(e) => setFssai(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. FSSAI-283948293849"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Other Certifications</label>
                <input
                  type="text"
                  value={otherCerts}
                  onChange={(e) => setOtherCerts(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. ISO 22000, Good Agricultural Practices (GAP)"
                />
              </div>
            </div>

            {/* EXPERIENCE */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t("experience")}</h3>
              <p className="text-sm text-slate-500">{t("farmingExperienceAndMarketPref")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Years of Farming Experience</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. 15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Primary Farming Category</label>
                <select
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm cursor-pointer"
                >
                  <option value="Horticulture">{t("horticultureFruitsVeg")}</option>
                  <option value="Grain Crop">{t("grainCropsWheatPaddy")}</option>
                  <option value={t("spices")}>Spices & Cash Crops</option>
                  <option value="Floriculture">{t("floricultureFlowers")}</option>
                  <option value="Dairy / Poultry">{t("dairyAnimalHusbandry")}</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Preferred Selling Markets</label>
                <input
                  type="text"
                  value={preferredMarkets}
                  onChange={(e) => setPreferredMarkets(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Delhi APMC, Local Cooperative Mandi"
                />
              </div>
            </div>

            {/* PAYMENT DETAILS */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t("paymentDetails")}</h3>
              <p className="text-sm text-slate-500">{t("bankAccountAndPaymentInformati")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("bankName")}</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. State Bank of India"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("accountHolderName")}</label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("accountNumber")}</label>
                <input
                  type="password"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm font-mono"
                  placeholder="Bank Account Number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("ifscCode")}</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm font-mono uppercase"
                  placeholder="e.g. SBIN0001234"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">UPI ID (e.g. GPay, PhonePe)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm font-mono"
                  placeholder="e.g. rajeshkumar@okaxis"
                />
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
                )}
              >
                {message.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                {message.text}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-60"
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
        </motion.div>
      </div>
    </div>
  );
}