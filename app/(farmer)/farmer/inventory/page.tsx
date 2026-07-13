"use client";
import { useTranslation } from "@/hooks/useTranslation";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Package,
  TrendingUp,
  Sparkles,
  Leaf,
  ArrowLeft,
  QrCode,
  Globe,
  CheckCircle2,
  Thermometer,
  CloudRain,
  Shield,
  Award,
} from "lucide-react";
import { useFarmerInventory } from "@/hooks/useFarmerInventory";
import CropCard from "@/components/farmer/inventory/CropCard";
import AddEditCropModal from "@/components/farmer/inventory/AddEditCropModal";
import { useDemoMode } from "@/context/DemoContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function InventoryPage() {
  const { t } = useTranslation("farmer");
  const { isDemoMode } = useDemoMode();
  const { crops, loading, error, addCrop, updateCrop, duplicateCrop, archiveCrop, deleteCrop } = useFarmerInventory();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCropId = searchParams.get("id");
  const editCropId = searchParams.get("edit");

  // Filter & search states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");

  // Modals state
  const [selectedCrop, setSelectedCrop] = useState<any | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Selected Crop Details for dynamic page rendering
  const selectedCropDetails = useMemo(() => {
    if (!selectedCropId) return null;
    return crops.find((c) => c.id === selectedCropId) || null;
  }, [crops, selectedCropId]);

  // Edit Crop Details for dynamic edit page rendering
  const editCropDetails = useMemo(() => {
    if (!editCropId) return null;
    return crops.find((c) => c.id === editCropId) || null;
  }, [crops, editCropId]);

  // Computed summary metrics
  const summary = useMemo(() => {
    const total = crops.length;
    const active = crops.filter((c) => c.is_active).length;
    const available = crops.filter((c) => c.status === "available").length;
    const value = crops.reduce((sum, c) => sum + (c.farmer_price * c.quantity_available), 0);
    return { total, active, available, value };
  }, [crops]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(crops.map((c) => c.category));
    return ["All", ...Array.from(set)];
  }, [crops]);

  // Filtered crops
  const filteredCrops = useMemo(() => {
    return crops
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          (c.scientific_name || "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "All" || c.category === category;
        const matchesStatus = status === "All" || c.status === status;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "price-high") return b.farmer_price - a.farmer_price;
        if (sort === "price-low") return a.farmer_price - b.farmer_price;
        if (sort === "stock-high") return b.quantity_available - a.quantity_available;
        if (sort === "stock-low") return a.quantity_available - b.quantity_available;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [crops, search, category, status, sort]);

  const handleEditOpen = (crop: any) => {
    router.push(`/farmer/inventory?edit=${crop.id}`);
  };

  const handlePassportOpen = (crop: any) => {
    router.push(`/farmer/inventory?id=${crop.id}`);
  };

  const statCardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.35,
        ease: "easeOut"
      }
    })
  };

  /* ───────────────────────────────────────────────────────────
      EDIT CROP DEDICATED PAGE VIEW
     ─────────────────────────────────────────────────────────── */
  if (editCropDetails) {
    const crop = editCropDetails;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "48px" }}>
        
        {/* Back Link Header */}
        <div>
          <button
            onClick={() => router.push("/farmer/inventory")}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "transparent", border: "none",
              color: "#2E7D32", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", transition: "color 0.15s",
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1B5E20"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#2E7D32"; }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            ← Back to Crops & Inventory
          </button>
        </div>

        {/* Dedicated Edit Form Page */}
        <AddEditCropModal
          crop={crop}
          inline={true}
          onClose={() => router.push("/farmer/inventory")}
          onSave={(data) => updateCrop(crop.id, data)}
        />
      </div>
    );
  }

  /* ───────────────────────────────────────────────────────────
      CROP DETAILS DEDICATED PAGE VIEW
     ─────────────────────────────────────────────────────────── */
  if (selectedCropDetails) {
    const crop = selectedCropDetails;
    const steps = [
      { label: "Sowing & Growth", date: crop.production_date || "2026-04-01", desc: "Monitored organic sowing under sustainable guidelines." },
      { label: "Harvesting", date: crop.harvest_date || "2026-05-20", desc: "Harvested at peak maturity, cleaning & sorting completed." },
      { label: "AI Quality Grading", date: crop.harvest_date || "2026-05-20", desc: `Graded AI ${crop.ai_quality_grade || "A"} with ${crop.ai_confidence_score || 95}% confidence.` },
      { label: "Listing on AgriNex", date: crop.created_at ? new Date(crop.created_at).toISOString().split('T')[0] : "2026-06-01", desc: "Listed for public bidding with transparency ledger." },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "48px" }}>
        
        {/* Back Link Header */}
        <div>
          <button
            onClick={() => router.push("/farmer/inventory")}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "transparent", border: "none",
              color: "#2E7D32", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", transition: "color 0.15s",
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1B5E20"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#2E7D32"; }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            ← Back to Inventory
          </button>
        </div>

        {/* Dedicated Crop Details Layout */}
        <div style={{
          background: "#ffffff", border: "1px solid #DCEFD9",
          borderRadius: "20px", display: "flex", flexDirection: "column",
          overflow: "hidden", boxShadow: "0 4px 16px rgba(46, 125, 50, 0.04)"
        }} className="md:flex-row">
          
          {/* Left Column: Image, QR Code & Core tags */}
          <div style={{
            position: "relative", background: "#0F172A",
            borderRight: "1px solid #E5E7EB", display: "flex", flexDirection: "column",
          }} className="md:w-2/5">
            {crop.image_url ? (
              <img
                src={crop.image_url}
                alt={crop.title}
                style={{ width: "100%", height: "300px", objectFit: "cover" }}
                className="md:h-full md:min-h-[480px]"
              />
            ) : (
              <div style={{ flex: 1, minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                No Crop Image Available
              </div>
            )}

            {/* Float Badges */}
            <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {crop.is_organic && (
                <span style={{
                  background: "#2E7D32", color: "#ffffff", fontSize: "12px",
                  fontWeight: 700, padding: "4px 12px", borderRadius: "99px",
                  display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}>
                  <Leaf style={{ width: "13px", height: "13px", fill: "#ffffff" }} />
                  {t("certifiedOrganic")}
                </span>
              )}
              <span style={{
                background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(46, 125, 50, 0.3)",
                color: "#2E7D32", fontSize: "10px", fontFamily: "monospace",
                fontWeight: 700, padding: "4px 10px", borderRadius: "99px",
              }}>
                TRACE CODE: {crop.traceability_code || "AGX-2026-GEN-00"}
              </span>
            </div>

            {/* QR Section Overlay */}
            <div style={{
              position: "absolute", bottom: "16px", left: "16px", right: "16px",
              background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)", padding: "14px", borderRadius: "16px"
            }}>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 10px" }}>
                <QrCode style={{ width: "16px", height: "16px", color: "#2E7D32" }} />
                {t("digitalLedgerQrPassport")}
              </h4>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ background: "#ffffff", padding: "4px", borderRadius: "8px", flexShrink: 0 }}>
                  <div style={{ width: "64px", height: "64px", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode style={{ width: "48px", height: "48px", color: "#2E7D32" }} />
                  </div>
                </div>
                <div style={{ minWidth: 0, fontFamily: "monospace", fontSize: "10px", color: "#9CA3AF", lineHeight: 1.4 }}>
                  <p style={{ margin: 0 }}>Origin: {crop.location}</p>
                  <p style={{ margin: "2px 0 0" }}>GPS Lat: {crop.gps_lat || 29.685}</p>
                  <p style={{ margin: "2px 0 0" }}>GPS Lng: {crop.gps_lng || 76.990}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Deep Passport/Details Fields */}
          <div style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Title & Scientific name */}
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#2E7D32", letterSpacing: "0.06em" }}>
                {t("digitalCropPassport")}
              </span>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1F2937", marginTop: "4px", display: "flex", alignItems: "center", gap: "8px", margin: "4px 0 0" }}>
                {crop.title}
                {crop.is_verified && <CheckCircle2 style={{ width: "20px", height: "20px", color: "#2E7D32" }} />}
              </h2>
              {crop.scientific_name && (
                <p style={{ fontSize: "13px", color: "#9CA3AF", fontStyle: "italic", margin: "2px 0 0" }}>
                  {crop.scientific_name}
                </p>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: 1.6, margin: 0 }}>
              {crop.description}
            </p>

            {/* Stock, shelf life, and grade grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { title: "STOCK QUANTITY", val: `${crop.quantity_available} ${crop.unit_type}` },
                { title: t("expectedShelfLife"), val: `${crop.shelf_life_days || 14} ${t("days")}` },
                { title: t("aiStabilityGrade"), val: `Grade ${crop.ai_quality_grade || "A+"}`, isGrade: true }
              ].map((box) => (
                <div key={box.title} style={{
                  background: "#F9FAFB", border: "1px solid #E5E7EB",
                  padding: "12px 14px", borderRadius: "12px",
                }}>
                  <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em", margin: 0 }}>
                    {box.title}
                  </p>
                  {box.isGrade ? (
                    <span style={{
                      display: "inline-block", marginTop: "4px", fontSize: "12px",
                      fontWeight: 700, color: "#2E7D32", background: "#E8F5E9",
                      padding: "2px 8px", borderRadius: "4px", border: "1px solid #DCEFD9"
                    }}>
                      {box.val}
                    </span>
                  ) : (
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", marginTop: "4px", margin: "4px 0 0" }}>
                      {box.val}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* AI Health Diagnostics */}
            <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px" }}>
                <Shield style={{ width: "16px", height: "16px", color: "#7C3AED" }} />
                {t("aiCropHealthDiagnosticsGeminiV")}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  { label: t("freshnessIntegrity"), score: crop.ai_freshness_score || 95, color: "#2E7D32" },
                  { label: t("aiConfidenceIndex"),  score: crop.ai_confidence_score || 96, color: "#7C3AED" },
                  { label: "Pathological/Disease Index", score: crop.ai_disease_score || 0, color: "#C62828" },
                  { label: "Pest Infestation Score", score: crop.ai_pest_score || 0, color: "#EF6C00" }
                ].map((diagnostics) => (
                  <div key={diagnostics.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "monospace" }}>
                      <span style={{ color: "#4B5563", fontWeight: 600 }}>{diagnostics.label}</span>
                      <span style={{ color: diagnostics.color, fontWeight: 700 }}>{diagnostics.score}%</span>
                    </div>
                    <div style={{ height: "6px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${diagnostics.score}%`, background: diagnostics.color, borderRadius: "99px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage specs */}
            <div style={{
              borderTop: "1px solid #F3F4F6", paddingTop: "20px",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"
            }}>
              <div>
                <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 4px" }}>
                  <Thermometer style={{ width: "14px", height: "14px", color: "#1565C0" }} />
                  TEMPERATURE RECOMMENDATION
                </h4>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", margin: 0, fontFamily: "monospace" }}>
                  {crop.storage_temp || "8–12°C"}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 4px" }}>
                  <CloudRain style={{ width: "14px", height: "14px", color: "#00838F" }} />
                  STORAGE ENVIRONMENT
                </h4>
                <p style={{ fontSize: "12px", color: "#4B5563", margin: 0, lineHeight: 1.4 }}>
                  {crop.storage_condition || "Controlled humidity and cool dry logistics pipeline."}
                </p>
              </div>
            </div>

            {/* Traceability Timeline */}
            <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px" }}>
                <Globe style={{ width: "16px", height: "16px", color: "#2E7D32" }} />
                Ledger Traceability Timeline
              </h3>
              <div style={{ borderLeft: "1px solid #E5E7EB", paddingLeft: "16px", marginLeft: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {steps.map((step, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", left: "-21.5px", top: "4px",
                      width: "10px", height: "10px", borderRadius: "50%",
                      background: "#2E7D32", border: "2px solid #ffffff",
                    }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "monospace" }}>
                      <span style={{ fontWeight: 700, color: "#1F2937" }}>{step.label}</span>
                      <span style={{ color: "#9CA3AF" }}>{step.date}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#6B7280", margin: "2px 0 0", lineHeight: 1.4 }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Credentials / Certificates */}
            {crop.certificates && crop.certificates.length > 0 && (
              <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "20px" }}>
                <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px" }}>
                  <Award style={{ width: "14px", height: "14px", color: "#EF6C00" }} />
                  {t("agriculturalCredentials")}
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {crop.certificates.map((cert: string) => (
                    <span key={cert} style={{
                      background: "#F9FAFB", border: "1px solid #E5E7EB",
                      padding: "4px 10px", borderRadius: "6px",
                      fontSize: "11px", fontWeight: 650, color: "#4B5563", fontFamily: "monospace"
                    }}>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    );
  }

  /* ───────────────────────────────────────────────────────────
      MAIN INVENTORY LISTING VIEW
     ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px" }}>
      
      {/* 1. Premium Page Header */}
      <div 
        style={{
          background: "linear-gradient(135deg, #E8F5E9 0%, #ffffff 70%, #F7FCF7 100%)",
          border: "1px solid #DCEFD9",
          borderRadius: "20px",
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(46, 125, 50, 0.04)",
        }}
      >
        <div style={{
          position: "absolute", top: "-45px", right: "-45px",
          width: "180px", height: "180px",
          background: "radial-gradient(circle, rgba(46,125,50,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        
        <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
              display: "flex", alignItems: "center",
              justifyContent: "center", alignSelf: "center",
              boxShadow: "0 4px 12px rgba(46,125,50,0.2)",
              flexShrink: 0,
            }}>
              <Package style={{ width: "24px", height: "24px", color: "#ffffff" }} />
            </div>
            <div>
              <h1 style={{
                fontSize: "26px", fontWeight: 800, color: "#1F2937",
                letterSpacing: "-0.5px", margin: 0, fontFamily: "Inter, sans-serif"
              }}>
                {t("farmCropInventory")}
              </h1>
              <p style={{ fontSize: "14px", color: "#64748B", fontWeight: 500, marginTop: "4px" }}>
                Manage crop passports, AI pricing, traceability and inventory.
              </p>
            </div>
          </div>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {[
              { text: t("digitalPassports"), icon: Sparkles, bg: "#E8F5E9", border: "#DCEFD9", color: "#2E7D32" },
              { text: t("aiPricing"),        icon: TrendingUp, bg: "#E3F2FD", border: "#BBDEFB", color: "#1565C0" },
              { text: "Traceability",        icon: Leaf,       bg: "#FFF3E0", border: "#FFE0B2", color: "#EF6C00" },
            ].map((chip) => (
              <div key={chip.text} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", borderRadius: "99px",
                background: chip.bg, border: `1px solid ${chip.border}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
              }}>
                <chip.icon style={{ width: "14px", height: "14px", color: chip.color }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{chip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Statistics Cards */}
      <motion.div 
        initial="hidden" animate="visible"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}
        className="grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: "Total Listings",  value: summary.total, icon: Package, iconColor: "#64748B", iconBg: "#F1F5F9" },
          { label: t("activeProducts"), value: summary.active, icon: Sparkles, iconColor: "#2E7D32", iconBg: "#E8F5E9" },
          { label: t("availableStock"), icon: Leaf, iconColor: "#1565C0", iconBg: "#E3F2FD",
            value: `${summary.available}`
          },
          { label: "Total Est. Value", icon: TrendingUp, iconColor: "#EF6C00", iconBg: "#FFF3E0",
            value: new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(summary.value)
          },
        ].map((card, i) => (
          <motion.div 
            key={card.label} custom={i} variants={statCardVariants}
            style={{
              background: "#ffffff", border: "1px solid #DCEFD9",
              borderRadius: "16px", padding: "20px 22px",
              display: "flex", flexDirection: "column", gap: "12px",
              boxShadow: "0 2px 8px rgba(46,125,50,0.02)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(46,125,50,0.06)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: card.iconBg, display: "flex", alignItems: "center",
                justifyContent: "center",
              }}>
                <card.icon style={{ width: "18px", height: "18px", color: card.iconColor }} />
              </div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                {card.label}
              </p>
            </div>
            <p style={{ fontSize: "24px", fontWeight: 800, color: "#1F2937", margin: 0, fontFamily: "Inter, sans-serif" }}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Search & Filter Elegant Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          background: "#ffffff", border: "1px solid #DCEFD9",
          borderRadius: "18px", padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(46,125,50,0.02)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          
          {/* Search bar */}
          <div style={{ display: "flex", alignItems: "center", flex: "1 1 280px", maxWidth: "340px", position: "relative" }}>
            <Search style={{ position: "absolute", left: "14px", width: "16px", height: "16px", color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder={t("searchCropsPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", height: "42px", background: "#F9FAFB",
                border: "1px solid #E5E7EB", borderRadius: "10px",
                paddingLeft: "38px", paddingRight: "14px",
                fontSize: "13px", color: "#374151", outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2E7D32";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(46,125,50,0.1)";
                e.currentTarget.style.background = "#ffffff";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "#F9FAFB";
              }}
            />
          </div>

          {/* Filters, sorting & add crop button */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
            
            {/* Category filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter style={{ width: "15px", height: "15px", color: "#9CA3AF" }} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  height: "40px", background: "#ffffff", border: "1px solid #E5E7EB",
                  borderRadius: "10px", padding: "0 12px", fontSize: "13px",
                  fontWeight: 600, color: "#4B5563", outline: "none", cursor: "pointer",
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                height: "40px", background: "#ffffff", border: "1px solid #E5E7EB",
                borderRadius: "10px", padding: "0 12px", fontSize: "13px",
                fontWeight: 600, color: "#4B5563", outline: "none", cursor: "pointer",
              }}
            >
              <option value="All">{t("allStatuses")}</option>
              <option value="available">{t("available")}</option>
              <option value="reserved">Reserved</option>
              <option value="out_of_stock">{t("outOfStock")}</option>
            </select>

            {/* Sorting */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                height: "40px", background: "#ffffff", border: "1px solid #E5E7EB",
                borderRadius: "10px", padding: "0 12px", fontSize: "13px",
                fontWeight: 600, color: "#4B5563", outline: "none", cursor: "pointer",
              }}
            >
              <option value="newest">Newest Listed</option>
              <option value="price-high">{t("priceHighLow")}</option>
              <option value="price-low">{t("priceLowHigh")}</option>
              <option value="stock-high">Stock: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
            </select>

            {/* Add Crop button */}
            <button
              onClick={() => setAddModalOpen(true)}
              style={{
                height: "40px", padding: "0 18px", borderRadius: "10px",
                border: "none", background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
                color: "#ffffff", fontWeight: 700, fontSize: "13px",
                display: "flex", alignItems: "center", gap: "6px",
                boxShadow: "0 4px 12px rgba(46,125,50,0.22)",
                cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(46,125,50,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(46,125,50,0.22)";
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              {t("addCropListing")}
            </button>

          </div>
        </div>
      </motion.div>

      {/* 4. Responsive Grid Listings */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ height: "340px", borderRadius: "18px", border: "1px solid #DCEFD9", background: "#ffffff" }} className="anim-shimmer" />
          ))}
        </div>
      ) : error ? (
        <div style={{
          background: "#FFEBEE", border: "1px solid #FFCDD2", borderRadius: "18px",
          padding: "32px", textAlign: "center"
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#C62828", margin: "0 0 8px" }}>
            {t("errorLoadingInventory")}
          </h3>
          <p style={{ fontSize: "13px", color: "#EF5350", fontWeight: 650, margin: 0 }}>{error}</p>
        </div>
      ) : filteredCrops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: "#ffffff", border: "1px solid #DCEFD9", borderRadius: "20px",
            padding: "64px 32px", textAlign: "center", display: "flex", flexDirection: "column",
            alignItems: "center", gap: "16px", boxShadow: "0 2px 16px rgba(46,125,50,0.02)",
          }}
        >
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "#F7FCF7", border: "1px solid #DCEFD9",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package style={{ width: "28px", height: "28px", color: "#2E7D32" }} />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1F2937", margin: 0 }}>No crop listings found</h3>
          <p style={{ fontSize: "13px", color: "#64748B", margin: 0, maxWidth: "420px", lineHeight: 1.55 }}>
            Try adjusting search queries or add a new crop listing to get started with AgriNex.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              view="grid"
              onEdit={handleEditOpen}
              onViewPassport={handlePassportOpen}
              onDuplicate={duplicateCrop}
              onArchive={archiveCrop}
              onDelete={deleteCrop}
            />
          ))}
        </motion.div>
      )}

      {/* Add Crop Modal */}
      {addModalOpen && (
        <AddEditCropModal
          onClose={() => setAddModalOpen(false)}
          onSave={addCrop}
        />
      )}

    </div>
  );
}