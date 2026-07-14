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
  Layers,
  Award,
  Globe,
  Settings,
  HelpCircle,
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
          <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
          <p className="text-sm font-semibold font-sans">Loading Profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #F8FFF8 0%, #EAF7EC 50%, #F3FAF0 100%)",
      minHeight: "100vh",
      padding: "40px 20px",
      fontFamily: "Inter, sans-serif"
    }}>
      <style jsx global>{`
        .premium-input-box {
          width: 100%;
          height: 52px;
          background: #ffffff;
          border: 1.5px solid #BBF7D0;
          border-radius: 16px;
          padding: 0 16px;
          font-size: 15px;
          color: #0F172A;
          outline: none;
          box-sizing: border-box;
          transition: all 0.25s ease-in-out;
        }
        .premium-input-box::placeholder {
          color: #64748B;
          opacity: 0.7;
        }
        .premium-input-box:hover {
          border-color: #22C55E;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.06);
        }
        .premium-input-box:focus {
          border-color: #16A34A;
          border-width: 2px;
          box-shadow: 0 0 0 4px rgba(22, 197, 94, 0.15);
        }
        .premium-textarea-box {
          width: 100%;
          background: #ffffff;
          border: 1.5px solid #BBF7D0;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 15px;
          color: #0F172A;
          outline: none;
          box-sizing: border-box;
          transition: all 0.25s ease-in-out;
          resize: vertical;
          font-family: inherit;
        }
        .premium-textarea-box::placeholder {
          color: #64748B;
          opacity: 0.7;
        }
        .premium-textarea-box:hover {
          border-color: #22C55E;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.06);
        }
        .premium-textarea-box:focus {
          border-color: #16A34A;
          border-width: 2px;
          box-shadow: 0 0 0 4px rgba(22, 197, 94, 0.15);
        }
        .premium-select-box {
          width: 100%;
          height: 52px;
          background: #ffffff;
          border: 1.5px solid #BBF7D0;
          border-radius: 16px;
          padding: 0 16px;
          font-size: 15px;
          color: #0F172A;
          outline: none;
          box-sizing: border-box;
          transition: all 0.25s ease-in-out;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 16px center;
          background-repeat: no-repeat;
          background-size: 20px;
        }
        .premium-select-box:hover {
          border-color: #22C55E;
        }
        .premium-select-box:focus {
          border-color: #16A34A;
          border-width: 2px;
          box-shadow: 0 0 0 4px rgba(22, 197, 94, 0.15);
        }
        .premium-section-card {
          background: #ffffff;
          border: 1.5px solid #DCFCE7;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(22, 197, 94, 0.03);
          transition: all 0.25s ease-in-out;
        }
        .premium-section-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(22, 197, 94, 0.06);
          border-color: #BBF7D0;
        }
        .field-label {
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 8px;
        }
        .required-star {
          color: #EF4444;
          margin-left: 2px;
        }
      `}</style>

      {/* Main Wrapper Container */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1.5px solid #BBF7D0",
        boxShadow: "0 12px 40px rgba(22, 197, 94, 0.08)",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "36px",
        boxSizing: "border-box"
      }}>

        {/* ── PROFILE HEADER ── */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          background: "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 60%, #EFF6FF 100%)",
          border: "1.5px solid #DCFCE7",
          padding: "36px 40px",
          boxShadow: "0 4px 24px rgba(22,163,74,0.04)"
        }}>
          {/* Ambient glows */}
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", background: "radial-gradient(circle, rgba(22,197,94,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(22,163,74,0.28)", flexShrink: 0 }}>
                <span style={{ fontSize: "28px" }}>👨‍🌾</span>
              </div>
              <div>
                <h1 style={{ fontSize: "36px", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.8px", margin: 0, lineHeight: 1.1 }}>
                  {t("farmerProfile")}
                </h1>
                <p style={{ fontSize: "15px", color: "#64748B", margin: "8px 0 0", fontWeight: 500 }}>
                  Manage your personal details, farm information and KYC verification.
                </p>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {kycStatus === "verified" ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "99px", background: "#DCFCE7", border: "1px solid #86EFAC", fontSize: "13px", fontWeight: 700, color: "#16A34A" }}>
                  <ShieldCheck style={{ width: "15px", height: "15px" }} />
                  KYC Verified
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "99px", background: "#FEF3C7", border: "1px solid #FDE68A", fontSize: "13px", fontWeight: 700, color: "#D97706" }}>
                  <AlertCircle style={{ width: "15px", height: "15px" }} />
                  Verification Pending
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "99px", background: "#E0F2FE", border: "1px solid #BAE6FD", fontSize: "13px", fontWeight: 700, color: "#0369A1" }}>
                <Sprout style={{ width: "15px", height: "15px" }} />
                🌾 Farmer Badge
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "99px", background: "#FFFBEB", border: "1px solid #FDE68A", fontSize: "13px", fontWeight: 700, color: "#D97706" }}>
                <Star style={{ width: "15px", height: "15px", fill: "#F59E0B", color: "#F59E0B" }} />
                ⭐ Trust Score: 4.9
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Layout Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "32px"
        }} className="grid-cols-1 md:grid-cols-3">

          {/* Left Column: Summary Card & KYC */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Profile Summary Card */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid #DCFCE7",
              borderRadius: "24px",
              padding: "32px 24px",
              textAlign: "center",
              boxShadow: "0 6px 24px rgba(22,197,94,0.02)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "radial-gradient(circle, rgba(22,197,94,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />

              <div style={{ position: "relative", marginBottom: "20px" }}>
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    style={{
                      width: "120px", height: "120px",
                      borderRadius: "50%", objectFit: "cover",
                      margin: "0 auto", border: "4px solid #16A34A20",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px", height: "120px",
                      borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: "#ffffff", fontWeight: 900,
                      fontSize: "44px", margin: "0 auto",
                      border: "4px solid #16A34A20",
                      background: "linear-gradient(135deg, #16A34A, #22C55E)",
                      boxShadow: "0 8px 24px rgba(22,163,74,0.25)"
                    }}
                  >
                    {fullName.charAt(0).toUpperCase() || "F"}
                  </div>
                )}
                <div style={{ position: "absolute", bottom: 0, right: "calc(50% - 60px)" }}>
                  {kycStatus === "verified" ? (
                    <div style={{ background: "#16A34A", color: "#fff", borderRadius: "50%", padding: "6px", border: "3px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex" }}>
                      <ShieldCheck style={{ width: "18px", height: "18px" }} />
                    </div>
                  ) : (
                    <div style={{ background: "#F59E0B", color: "#fff", borderRadius: "50%", padding: "6px", border: "3px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex" }}>
                      <AlertCircle style={{ width: "18px", height: "18px" }} />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.4px" }}>
                  {fullName || "AgriNex Farmer"}
                </h2>
                <p style={{ fontSize: "14px", color: "#16A34A", fontWeight: 700, marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {profile?.role || "Farmer"}
                </p>
              </div>

              {/* Information List */}
              <div style={{ borderTop: "1.5px solid #F1F5F9", marginTop: "24px", paddingTop: "24px", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Trust Score", val: "4.9 / 5.0 ⭐", color: "#D97706" },
                  { label: "KYC Status", val: kycStatus === "verified" ? "Verified" : "Pending", color: kycStatus === "verified" ? "#16A34A" : "#D97706" },
                  { label: "Phone", val: phoneNumber || "Not provided", color: "#475569" },
                  { label: "Location", val: village && district ? `${village}, ${district}` : address || "Not provided", color: "#475569" }
                ].map(info => (
                  <div key={info.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                    <span style={{ color: "#94A3B8", fontWeight: 600 }}>{info.label}</span>
                    <span style={{ fontWeight: 700, color: info.color }}>{info.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* KYC Section Card */}
            <div style={{
              background: "#ffffff",
              border: "1.5px solid #DCFCE7",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 6px 24px rgba(22,197,94,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "14px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck style={{ width: "20px", height: "20px", color: "#16A34A" }} />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>KYC Verification</h3>
              </div>

              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                Verify your agricultural credentials to raise your weekly listing cap, unlock immediate payments, and boost buyers' trust.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                  <FileText style={{ width: "18px", height: "18px", color: "#64748B", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>Land Registry Records</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                  <FileText style={{ width: "18px", height: "18px", color: "#64748B", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>{t("aadhaarCardCropCard")}</span>
                </div>
              </div>

              {kycStatus === "verified" ? (
                <div style={{
                  padding: "14px",
                  background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
                  border: "1.5px solid #86EFAC",
                  borderRadius: "14px",
                  color: "#16A34A",
                  fontWeight: 800,
                  fontSize: "14px",
                  textAlign: "center"
                }}>
                  ✓ Documents Verified
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadKYC}
                  disabled={uploadingDoc}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "14px",
                    border: "1.5px solid #16A34A",
                    background: "transparent",
                    color: "#16A34A",
                    fontWeight: 700,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: uploadingDoc ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { if (!uploadingDoc) { e.currentTarget.style.background = "#F0FDF4"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  {uploadingDoc ? (
                    <>
                      <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload style={{ width: "16px", height: "16px" }} />
                      Upload Documents
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Profile Form */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "32px" }}>
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

              {/* 👤 PERSONAL INFORMATION */}
              <div className="premium-section-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "14px", marginBottom: "24px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User style={{ width: "20px", height: "20px", color: "#16A34A" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>👤 {t("personalInfo")}</h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>Update your personal contact details</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Profile Photo URL</label>
                    <input
                      type="text"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. https://example.com/photo.jpg"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("farmerName")}<span className="required-star">*</span></label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </div>
                  <div>
                    <label className="field-label">Mobile Number<span className="required-star">*</span></label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("emailAddress")}</label>
                    <input
                      type="email"
                      value={profile?.id ? (profile as any).email || "" : ""}
                      disabled
                      style={{ background: "#F1F5F9", cursor: "not-allowed" }}
                      className="premium-input-box"
                      placeholder={t("emailAddress")}
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("dateOfBirth")}</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="premium-input-box"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("gender")}</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="premium-select-box"
                    >
                      <option value="Male">Male</option>
                      <option value={t("female")}>{t("female")}</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="field-label">Languages Spoken</label>
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Hindi, Telugu, English"
                    />
                  </div>
                </div>
              </div>

              {/* 📍 ADDRESS INFORMATION */}
              <div className="premium-section-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "14px", marginBottom: "24px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin style={{ width: "20px", height: "20px", color: "#16A34A" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>📍 {t("addressInformation")}</h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>{t("farmLocationAndContactDetails")}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="field-label">{t("farmName")}</label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Green Valley Farm"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("farmAddress")}<span className="required-star">*</span></label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Plot No 12, APMC Area"
                    />
                  </div>
                  <div>
                    <label className="field-label">Village</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Shamgarh"
                    />
                  </div>
                  <div>
                    <label className="field-label">Mandal / Taluk</label>
                    <input
                      type="text"
                      value={mandal}
                      onChange={(e) => setMandal(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Gharaunda"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("district")}</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Karnal"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("state")}</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Haryana"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("country")}</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. India"
                    />
                  </div>
                  <div>
                    <label className="field-label">PIN Code</label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 132001"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("gpsLocationLatitude")}</label>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 29.6857"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("gpsLocationLongitude")}</label>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 76.9905"
                    />
                  </div>
                </div>
              </div>

              {/* 🌾 FARM INFORMATION */}
              <div className="premium-section-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "14px", marginBottom: "24px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sprout style={{ width: "20px", height: "20px", color: "#16A34A" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>🌾 {t("farmInformation")}</h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>Land details and farming practices</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Total Land Owned (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={totalLand}
                      onChange={(e) => setTotalLand(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 25.0"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("cultivatedLandAcres")}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cultivatedLand}
                      onChange={(e) => setCultivatedLand(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 24.5"
                    />
                  </div>
                  <div>
                    <label className="field-label">Irrigated Land (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={irrigatedLand}
                      onChange={(e) => setIrrigatedLand(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 22.0"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("soilType")}</label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="premium-select-box"
                    >
                      <option value={t("clayLoam")}>{t("clayLoam")}</option>
                      <option value="Alluvial">{t("alluvialSoil")}</option>
                      <option value="Sandy">Sandy Loam</option>
                      <option value="Black Cotton">{t("blackCottonSoil")}</option>
                      <option value="Laterite">Laterite Soil</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">{t("waterSource")}</label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value)}
                      className="premium-select-box"
                    >
                      <option value={t("borewell")}>{t("borewell")}</option>
                      <option value={t("canal")}>{t("canal")}</option>
                      <option value="Open Well">Open Well</option>
                      <option value="Rainfed">Rainfed</option>
                      <option value="Pond">Pond</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">{t("farmingType")}</label>
                    <input
                      type="text"
                      value={farmingType}
                      onChange={(e) => setFarmingType(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Mixed, Crop, Horticulture"
                    />
                  </div>
                  <div>
                    <label className="field-label">Practice Type</label>
                    <select
                      value={farmingPractice}
                      onChange={(e) => setFarmingPractice(e.target.value)}
                      className="premium-select-box"
                    >
                      <option value={t("organic")}>{t("organic")}</option>
                      <option value={t("conventional")}>{t("conventional")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Major Crops</label>
                    <input
                      type="text"
                      value={majorCrops}
                      onChange={(e) => setMajorCrops(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Basmati Rice, Wheat"
                    />
                  </div>
                  <div>
                    <label className="field-label">Seasonal Crops</label>
                    <input
                      type="text"
                      value={seasonalCrops}
                      onChange={(e) => setSeasonalCrops(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Mustard, Vegetables"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("cropRotationDetails")}</label>
                    <input
                      type="text"
                      value={cropRotation}
                      onChange={(e) => setCropRotation(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Rice-Wheat rotation cycle"
                    />
                  </div>
                </div>
              </div>

              {/* 🚜 AGRICULTURAL RESOURCES */}
              <div className="premium-section-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "14px", marginBottom: "24px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Layers style={{ width: "20px", height: "20px", color: "#16A34A" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>🚜 {t("agriculturalResources")}</h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>{t("equipmentAndInfrastructureDeta")}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Livestock Details</label>
                    <input
                      type="text"
                      value={livestock}
                      onChange={(e) => setLivestock(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 4 Cows, 2 Buffaloes"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("farmEquipment")}</label>
                    <input
                      type="text"
                      value={equipment}
                      onChange={(e) => setEquipment(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Tractor, Power Tiller, Drip lines"
                    />
                  </div>
                  <div>
                    <label className="field-label">Storage Capacity</label>
                    <input
                      type="text"
                      value={storageCapacity}
                      onChange={(e) => setStorageCapacity(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 50 Metric Tons Warehouse"
                    />
                  </div>
                  <div>
                    <label className="field-label">Irrigation Method</label>
                    <select
                      value={irrigationMethod}
                      onChange={(e) => setIrrigationMethod(e.target.value)}
                      className="premium-select-box"
                    >
                      <option value={t("drip")}>{t("dripIrrigation")}</option>
                      <option value={t("sprinkler")}>Sprinkler Irrigation</option>
                      <option value={t("flood")}>{t("floodIrrigation")}</option>
                      <option value="Rainfed">Rainfed</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">{t("greenhouseAvailability")}</label>
                    <select
                      value={greenhouse}
                      onChange={(e) => setGreenhouse(e.target.value)}
                      className="premium-select-box"
                    >
                      <option value={t("no")}>{t("no")}</option>
                      <option value={t("yes")}>{t("yes")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Warehouse Availability</label>
                    <select
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      className="premium-select-box"
                    >
                      <option value={t("no")}>{t("no")}</option>
                      <option value={t("yes")}>{t("yes")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 📜 CERTIFICATIONS & REGISTRATION */}
              <div className="premium-section-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "14px", marginBottom: "24px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Award style={{ width: "20px", height: "20px", color: "#16A34A" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>📜 {t("certificationsRegistration")}</h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>{t("governmentAndOrganicCertificat")}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Organic Certifications</label>
                    <input
                      type="text"
                      value={organicCert}
                      onChange={(e) => setOrganicCert(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. NPOP Organic Cert, PGS-India"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("governmentRegistrationIds")}</label>
                    <input
                      type="text"
                      value={govRegIds}
                      onChange={(e) => setGovRegIds(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. PM-KISAN ID"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("farmerId")}</label>
                    <input
                      type="text"
                      value={farmerId}
                      onChange={(e) => setFarmerId(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. GOV-FRM-837492"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("fssaiIdIfApplicable")}</label>
                    <input
                      type="text"
                      value={fssai}
                      onChange={(e) => setFssai(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. FSSAI-283948293849"
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="field-label">Other Certifications</label>
                    <input
                      type="text"
                      value={otherCerts}
                      onChange={(e) => setOtherCerts(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. ISO 22000, Good Agricultural Practices (GAP)"
                    />
                  </div>
                </div>
              </div>

              {/* 🌱 EXPERIENCE */}
              <div className="premium-section-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "14px", marginBottom: "24px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sprout style={{ width: "20px", height: "20px", color: "#16A34A" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>🌱 {t("experience")}</h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>{t("farmingExperienceAndMarketPref")}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Years of Farming Experience</label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. 15"
                    />
                  </div>
                  <div>
                    <label className="field-label">Primary Farming Category</label>
                    <select
                      value={primaryCategory}
                      onChange={(e) => setPrimaryCategory(e.target.value)}
                      className="premium-select-box"
                    >
                      <option value="Horticulture">{t("horticultureFruitsVeg")}</option>
                      <option value="Grain Crop">{t("grainCropsWheatPaddy")}</option>
                      <option value={t("spices")}>Spices & Cash Crops</option>
                      <option value="Floriculture">{t("floricultureFlowers")}</option>
                      <option value="Dairy / Poultry">{t("dairyAnimalHusbandry")}</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="field-label">Preferred Selling Markets</label>
                    <input
                      type="text"
                      value={preferredMarkets}
                      onChange={(e) => setPreferredMarkets(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Delhi APMC, Local Cooperative Mandi"
                    />
                  </div>
                </div>
              </div>

              {/* 🏦 PAYMENT DETAILS */}
              <div className="premium-section-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "14px", marginBottom: "24px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Award style={{ width: "20px", height: "20px", color: "#16A34A" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>🏦 {t("paymentDetails")}</h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>{t("bankAccountAndPaymentInformati")}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="field-label">{t("bankName")}</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. State Bank of India"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("accountHolderName")}</label>
                    <input
                      type="text"
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      className="premium-input-box"
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("accountNumber")}</label>
                    <input
                      type="password"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="premium-input-box font-mono"
                      placeholder="Bank Account Number"
                    />
                  </div>
                  <div>
                    <label className="field-label">{t("ifscCode")}</label>
                    <input
                      type="text"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      className="premium-input-box font-mono uppercase"
                      placeholder="e.g. SBIN0001234"
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="field-label">UPI ID (e.g. GPay, PhonePe)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="premium-input-box font-mono"
                      placeholder="e.g. rajeshkumar@okaxis"
                    />
                  </div>
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

              {/* Save Settings Button */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "16px",
                  border: "none",
                  background: saving ? "#94A3B8" : "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saving ? "none" : "0 6px 24px rgba(22,163,74,0.25)",
                  transition: "all 0.25s",
                  letterSpacing: "-0.2px",
                }}
                onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(22,163,74,0.35)"; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = saving ? "none" : "0 6px 24px rgba(22,163,74,0.25)"; }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Profile Settings
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}