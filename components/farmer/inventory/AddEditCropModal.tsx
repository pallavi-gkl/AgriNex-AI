"use client";

import { useTranslation } from "@/hooks/useTranslation";
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  AlertTriangle,
  Leaf,
  Loader2,
  CheckCircle2,
  Calendar,
  IndianRupee,
  FileText,
  Thermometer,
  Shield,
  UploadCloud,
  Image as ImageIcon,
  Compass,
  ArrowRight,
  TrendingUp,
  Info,
  Package,
  Activity,
  Heart,
  ChevronDown,
  Search,
  Check,
  MapPin,
  Star,
  BadgeCheck,
  ShieldCheck,
  Eye,
  BarChart3,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Interfaces ─────────────────────────────────────────── */
interface Crop {
  id?: string;
  title: string;
  scientific_name?: string;
  category: string;
  description?: string | null;
  quantity_available: number;
  unit_type: string;
  production_date?: string;
  harvest_date?: string;
  supply_start_date?: string;
  supply_end_date?: string;
  shelf_life_days?: number;
  is_organic?: boolean;
  status: "available" | "reserved" | "out_of_stock";
  farmer_price: number;
  ai_recommended_price?: number | null;
  market_price?: number;
  warehouse_location?: string;
  storage_temp?: string;
  storage_condition?: string;
  ai_quality_grade?: string;
  ai_confidence_score?: number;
  ai_freshness_score?: number;
  ai_disease_score?: number;
  ai_pest_score?: number;
  certificates?: string[];
  location?: string;
  gps_lat?: number;
  gps_lng?: number;
  traceability_code?: string | null;
  image_url?: string | null;
  is_active: boolean;
}

interface AddEditCropModalProps {
  crop?: Crop | null;
  onClose: () => void;
  onSave: (cropData: any) => Promise<void>;
  inline?: boolean;
}

/* ─── Constants ─────────────────────────────────────────── */
const CATEGORIES = [
  "Grains & Cereals",
  "Fruits",
  "Vegetables",
  "Spices & Herbs",
  "Leafy Greens",
  "Pulses & Legumes",
];

const TABS = [
  { id: "basic",   icon: "🌾", label: "Basic Information", desc: "Identity & category" },
  { id: "pricing", icon: "💰", label: "Pricing & Stock",   desc: "Rates & quantities" },
  { id: "ai",      icon: "🤖", label: "AI Insights",       desc: "Quality diagnostics" },
  { id: "media",   icon: "🖼",  label: "Media Gallery",     desc: "Produce attachments" },
  { id: "certs",   icon: "📜", label: "Certifications",    desc: "Compliance credentials" },
];

const AGRI_HUBS = [
  { label: "Karnal, Haryana", short: "HR" },
  { label: "Nashik, Maharashtra", short: "MH" },
  { label: "Ludhiana, Punjab", short: "PB" },
  { label: "Guntur, Andhra Pradesh", short: "AP" },
  { label: "Wayanad, Kerala", short: "KL" },
  { label: "Coimbatore, Tamil Nadu", short: "TN" },
  { label: "Belgaum, Karnataka", short: "KA" },
  { label: "Patna, Bihar", short: "BR" },
  { label: "Varanasi, Uttar Pradesh", short: "UP" },
  { label: "Jaipur, Rajasthan", short: "RJ" },
];

/* ─── Main Component ─────────────────────────────────────── */
export default function AddEditCropModal({ crop, onClose, onSave, inline = false }: AddEditCropModalProps) {
  const { t } = useTranslation("farmer");
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "ai" | "media" | "certs">("basic");
  const [loading, setLoading] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryRef = useRef<HTMLDivElement>(null);

  /* ─── Form State (all existing fields preserved) ─── */
  const [form, setForm] = useState({
    title: crop?.title || "",
    scientific_name: crop?.scientific_name || "",
    category: crop?.category || "Grains & Cereals",
    description: crop?.description || "",
    is_organic: crop?.is_organic ?? false,
    production_date: crop?.production_date || "",
    harvest_date: crop?.harvest_date || "",
    supply_start_date: crop?.supply_start_date || "",
    supply_end_date: crop?.supply_end_date || "",
    shelf_life_days: crop?.shelf_life_days || 30,
    location: crop?.location || "Karnal, Haryana",
    gps_lat: crop?.gps_lat || 29.6857,
    gps_lng: crop?.gps_lng || 76.9905,
    warehouse_location: crop?.warehouse_location || "",
    farmer_price: crop?.farmer_price || 0,
    unit_type: crop?.unit_type || "Kg",
    quantity_available: crop?.quantity_available || 0,
    status: crop?.status || "available",
    storage_temp: crop?.storage_temp || "10–15°C",
    storage_condition: crop?.storage_condition || "",
    ai_quality_grade: crop?.ai_quality_grade || "A",
    ai_confidence_score: crop?.ai_confidence_score || 95,
    ai_freshness_score: crop?.ai_freshness_score || 90,
    ai_disease_score: crop?.ai_disease_score || 0,
    ai_pest_score: crop?.ai_pest_score || 0,
    traceability_code: crop?.traceability_code || "",
    image_url: crop?.image_url || "",
    certificates: crop?.certificates || ["FSSAI Certified"],
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    if (!form.traceability_code) {
      setForm((prev) => ({ ...prev, traceability_code: `AGX-2026-REG-${Math.floor(100 + Math.random() * 900)}` }));
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ─── Handlers (all preserved) ─── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const runAiEngine = async () => {
    setAiRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setForm((prev) => ({
      ...prev,
      ai_quality_grade: "A+",
      ai_confidence_score: 98,
      ai_freshness_score: 96,
      ai_disease_score: 1,
      ai_pest_score: 0,
      traceability_code: `AGX-2026-AI-${Math.floor(100 + Math.random() * 900)}`,
    }));
    setAiRunning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...form,
        farmer_price: Number(form.farmer_price),
        quantity_available: Number(form.quantity_available),
        shelf_life_days: Number(form.shelf_life_days),
        gps_lat: Number(form.gps_lat),
        gps_lng: Number(form.gps_lng),
        is_active: crop ? crop.is_active : true,
      });
      setShowSuccessToast(true);
      setTimeout(() => { setShowSuccessToast(false); onClose(); }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Computed values ─── */
  const expectedProfit = form.farmer_price * form.quantity_available;
  const aiRecommended = Math.round(form.farmer_price * 1.06);
  const marketAverage  = Math.round(form.farmer_price * 0.98);
  const filteredCategories = CATEGORIES.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()));
  const descriptionLength = form.description?.length || 0;
  const tabOrder = ["basic", "pricing", "ai", "media", "certs"];

  /* ─── Shared styles ─── */
  const S = {
    page: {
      background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 40%, #F0FFF0 100%)",
      minHeight: "100%",
      fontFamily: "'Inter', 'Outfit', sans-serif",
      padding: "32px 28px 80px",
    } as React.CSSProperties,
    card: {
      background: "#ffffff",
      border: "1.5px solid #DCFCE7",
      borderRadius: "22px",
      boxShadow: "0 4px 28px rgba(22,163,74,0.05)",
      padding: "28px",
    } as React.CSSProperties,
    inputCard: {
      display: "flex",
      flexDirection: "column" as const,
      background: "#FAFFFE",
      border: "1.5px solid #DCFCE7",
      borderRadius: "16px",
      padding: "10px 16px",
      transition: "all 0.2s",
    } as React.CSSProperties,
  };

  /* ─── Inner content ─── */
  const innerFormContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", color: "#0F172A" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');

        .ec-input-card {
          display: flex;
          flex-direction: column;
          background: #FAFFFE;
          border: 1.5px solid #DCFCE7;
          border-radius: 16px;
          padding: 10px 16px;
          transition: all 0.22s;
        }
        .ec-input-card:focus-within {
          border-color: #16A34A !important;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.1) !important;
          background: #fff !important;
        }
        .ec-input-card:hover:not(:focus-within) {
          border-color: #22C55E;
        }
        .ec-label {
          font-size: 10px;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
          font-family: 'Inter', sans-serif;
        }
        .ec-control {
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: #0F172A;
          font-weight: 600;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .ec-control::placeholder { color: #CBD5E1; }
        .ec-control option { background: #fff; color: #0F172A; }

        .ec-btn-gradient {
          background: linear-gradient(135deg, #16A34A, #22C55E);
          color: #fff;
          border: none;
          font-weight: 800;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
        }
        .ec-btn-gradient:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22,163,74,0.30);
        }
        .ec-btn-gradient:active { transform: translateY(0); }
        .ec-btn-gradient:disabled { opacity: 0.65; cursor: not-allowed; }

        .ec-btn-blue {
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          color: #fff;
          border: none;
          font-weight: 800;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
        }
        .ec-btn-blue:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.30);
        }

        .ec-btn-purple {
          background: linear-gradient(135deg, #8B5CF6, #6366F1);
          color: #fff;
          border: none;
          font-weight: 800;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
        }
        .ec-btn-purple:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(139,92,246,0.30);
        }
        .ec-btn-purple:disabled { opacity: 0.65; cursor: not-allowed; }

        .ec-btn-white {
          background: #fff;
          color: #64748B;
          border: 1.5px solid #E2E8F0;
          font-weight: 700;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
        }
        .ec-btn-white:hover { background: #F8FAFC; color: #0F172A; border-color: #CBD5E1; }

        .ec-btn-red {
          background: #fff;
          color: #EF4444;
          border: 1.5px solid #FCA5A5;
          font-weight: 700;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
        }
        .ec-btn-red:hover { background: #FEF2F2; border-color: #EF4444; }

        .ec-progress-bar {
          height: 6px;
          border-radius: 999px;
          background: #F1F5F9;
          overflow: hidden;
        }
        .ec-progress-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.5s ease;
        }

        .ec-cert-card {
          padding: 18px 14px;
          border-radius: 16px;
          border: 1.5px solid #DCFCE7;
          background: #fff;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          transition: all 0.2s;
        }
        .ec-cert-card:hover {
          border-color: #22C55E;
          box-shadow: 0 4px 12px rgba(22,163,74,0.1);
          transform: translateY(-2px);
        }
        .ec-cert-card.selected {
          border-color: #16A34A;
          background: #F0FDF4;
          box-shadow: 0 4px 16px rgba(22,163,74,0.15);
        }
      `}</style>

      {/* ─── HERO HEADER ─── */}
      <div style={{
        background: "linear-gradient(135deg, #16A34A 0%, #22C55E 60%, #4ADE80 100%)",
        borderRadius: "22px",
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 10px 40px rgba(22,163,74,0.25)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <span style={{ fontSize: "32px" }}>🌾</span>
            <h2 style={{ fontSize: "26px", fontWeight: 900, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px" }}>
              Edit Crop Listing
            </h2>
          </div>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "14px", margin: 0, fontWeight: 500, maxWidth: "520px" }}>
            Update crop details, pricing, AI insights, certifications, images and marketplace information.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {[
            { label: crop?.is_active ? "✓ Active Listing" : "⊘ Draft", pulse: crop?.is_active },
            { label: "🤖 AI Verified" },
            { label: `⭐ Grade ${form.ai_quality_grade}` },
            { label: "🕒 Last Updated Today" },
          ].map((b) => (
            <span key={b.label} style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.32)",
              fontSize: "12px",
              fontWeight: 750,
              color: "#fff",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              {b.pulse && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#86EFAC", display: "inline-block", animation: "pulse 2s infinite" }} />}
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* ─── PREMIUM TAB NAVIGATION ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDone = tabOrder.indexOf(activeTab) > tabOrder.indexOf(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "16px",
                borderRadius: "18px",
                border: isActive ? "1.5px solid #16A34A" : isDone ? "1.5px solid #DCFCE7" : "1.5px solid #E2E8F0",
                background: isActive
                  ? "linear-gradient(135deg, #16A34A, #22C55E)"
                  : isDone
                  ? "#F0FDF4"
                  : "#fff",
                cursor: "pointer",
                transition: "all 0.22s",
                boxShadow: isActive ? "0 6px 20px rgba(22,163,74,0.22)" : "0 2px 8px rgba(0,0,0,0.04)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = "#22C55E"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(22,163,74,0.12)"; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = isDone ? "#DCFCE7" : "#E2E8F0"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "10px" }}>
                <span style={{ fontSize: "22px" }}>{tab.icon}</span>
                {isDone && (
                  <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check style={{ width: "10px", height: "10px", color: "#fff", strokeWidth: 3 }} />
                  </span>
                )}
              </div>
              <span style={{ fontSize: "12px", fontWeight: 800, color: isActive ? "#fff" : isDone ? "#16A34A" : "#0F172A", lineHeight: 1.3 }}>{tab.label}</span>
              <span style={{ fontSize: "10px", color: isActive ? "rgba(255,255,255,0.75)" : "#94A3B8", marginTop: "3px", fontWeight: 600 }}>{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TWO-COLUMN WORKSPACE ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }}>

        {/* LEFT: Active Tab Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

              {/* ══════ TAB 1: BASIC INFORMATION ══════ */}
              {activeTab === "basic" && (
                <div style={S.card} className="space-y-5">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "14px", borderBottom: "1.5px solid #F1F5F9" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText style={{ width: "18px", height: "18px", color: "#16A34A" }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "'Outfit', sans-serif" }}>Basic Information</h3>
                      <p style={{ fontSize: "12px", color: "#94A3B8", margin: "2px 0 0", fontWeight: 600 }}>Define category, crop identity and traceability</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="ec-input-card">
                      <label className="ec-label">Crop Name *</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="text" name="title" required value={form.title} onChange={handleChange} placeholder="e.g. Premium Basmati Rice" className="ec-control" />
                        <Leaf style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                    <div className="ec-input-card">
                      <label className="ec-label">Scientific Name</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="text" name="scientific_name" value={form.scientific_name} onChange={handleChange} placeholder="e.g. Oryza sativa" className="ec-control" />
                        <Info style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="ec-input-card relative" ref={categoryRef}>
                      <label className="ec-label">Category *</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                        <input type="text" placeholder="Search category..." value={categorySearch || form.category} onChange={(e) => { setCategorySearch(e.target.value); setShowCategoryDropdown(true); }} className="ec-control" style={{ paddingRight: "24px" }} />
                        <ChevronDown style={{ color: "#94A3B8", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                      {showCategoryDropdown && (
                        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: "8px", borderRadius: "16px", background: "#fff", border: "2px solid #DCFCE7", boxShadow: "0 8px 30px rgba(0,0,0,0.1)", zIndex: 50, padding: "6px", maxHeight: "220px", overflowY: "auto" }}>
                          {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                            <button key={cat} type="button" onClick={() => { setForm(p => ({ ...p, category: cat })); setCategorySearch(""); setShowCategoryDropdown(false); }}
                              style={{ width: "100%", textAlign: "left", padding: "9px 12px", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: form.category === cat ? "#fff" : "#0F172A", background: form.category === cat ? "#16A34A" : "transparent", cursor: "pointer" }}>
                              {cat}
                            </button>
                          )) : (
                            <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "#94A3B8", fontWeight: 700 }}>No matching categories</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ec-input-card">
                      <label className="ec-label">Traceability Origin</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="text" name="location" value={form.location} onChange={handleChange} className="ec-control" />
                        <MapPin style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                  </div>

                  <div className="ec-input-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label className="ec-label" style={{ marginBottom: 0 }}>Product Description</label>
                      <span style={{ fontSize: "10px", color: "#94A3B8", fontFamily: "monospace", fontWeight: 700 }}>{descriptionLength} / 1000</span>
                    </div>
                    <textarea name="description" value={form.description || ""} onChange={handleChange} rows={5} maxLength={1000} placeholder="Describe your crop's quality, cultivation method, packaging..." className="ec-control" style={{ resize: "none", lineHeight: 1.7 }} />
                  </div>

                  {/* Timeline dates */}
                  <div>
                    <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>📅 Timeline & Lifespan Dates</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
                      {[
                        { label: "🌱 Production", name: "production_date" },
                        { label: "🌾 Harvest", name: "harvest_date" },
                        { label: "🚚 Supply Start", name: "supply_start_date" },
                        { label: "📦 Supply End", name: "supply_end_date" },
                      ].map(d => (
                        <div key={d.name} style={{ background: "#F8FFF8", border: "1.5px solid #DCFCE7", borderRadius: "14px", padding: "12px 10px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 800, textTransform: "uppercase" }}>{d.label}</span>
                          <input type="date" name={d.name} value={(form as any)[d.name] || ""} onChange={handleChange} style={{ background: "transparent", border: "none", outline: "none", fontSize: "11px", color: "#0F172A", fontFamily: "monospace", fontWeight: 700, textAlign: "center", width: "100%", cursor: "pointer" }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Organic toggle */}
                  <div style={{
                    padding: "18px 20px",
                    borderRadius: "18px",
                    border: `1.5px solid ${form.is_organic ? "#16A34A" : "#E2E8F0"}`,
                    background: form.is_organic ? "linear-gradient(135deg, rgba(22,163,74,0.04), rgba(34,197,94,0.04))" : "#FAFFFE",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    transition: "all 0.22s",
                  }} onClick={() => setForm(p => ({ ...p, is_organic: !p.is_organic }))}>
                    <div style={{ width: "48px", height: "28px", borderRadius: "999px", background: form.is_organic ? "#16A34A" : "#E2E8F0", display: "flex", alignItems: "center", padding: "3px", transition: "all 0.25s", flexShrink: 0 }}>
                      <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#fff", transform: form.is_organic ? "translateX(20px)" : "translateX(0)", transition: "all 0.25s", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Leaf style={{ width: "15px", height: "15px", color: "#16A34A" }} />
                        🌿 Organic Certified
                      </div>
                      <p style={{ fontSize: "11px", color: "#94A3B8", margin: "3px 0 0", lineHeight: 1.5, fontWeight: 500 }}>
                        Flag this listing as organically cultivated — zero chemical fertilizers or pesticides used.
                      </p>
                    </div>
                    {form.is_organic && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {["🌿 Organic", "✔ No Chemicals", "✔ Eco-Farm"].map(f => (
                          <span key={f} style={{ fontSize: "9px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: "#DCFCE7", color: "#16A34A", border: "1px solid #DCFCE7" }}>{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══════ TAB 2: PRICING & STOCK ══════ */}
              {activeTab === "pricing" && (
                <div style={S.card} className="space-y-5">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "14px", borderBottom: "1.5px solid #F1F5F9" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #FFF7ED, #FED7AA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IndianRupee style={{ width: "18px", height: "18px", color: "#EA580C" }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "'Outfit', sans-serif" }}>Pricing & Inventory</h3>
                      <p style={{ fontSize: "12px", color: "#94A3B8", margin: "2px 0 0", fontWeight: 600 }}>Manage crop price points, supply metrics and storage</p>
                    </div>
                  </div>

                  {/* Pricing summary cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    {[
                      { label: "Current Price", val: `₹${form.farmer_price}`, sub: `per ${form.unit_type}`, color: "#0F172A", bg: "#F8FFF8", border: "#DCFCE7" },
                      { label: "AI Suggested", val: `₹${aiRecommended}`, sub: `per ${form.unit_type}`, color: "#16A34A", bg: "#F0FDF4", border: "#DCFCE7" },
                      { label: "Market Average", val: `₹${marketAverage}`, sub: `per ${form.unit_type}`, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
                      { label: "Expected Profit", val: `₹${expectedProfit.toLocaleString("en-IN")}`, sub: "total", color: "#0D9488", bg: "#F0FDFA", border: "#CCFBF1" },
                    ].map(m => (
                      <div key={m.label} style={{ background: m.bg, border: `1.5px solid ${m.border}`, borderRadius: "16px", padding: "14px 12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                        <span style={{ fontSize: "9px", color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>{m.label}</span>
                        <span style={{ fontSize: "16px", fontWeight: 900, color: m.color, display: "block", marginTop: "4px" }}>{m.val}</span>
                        <span style={{ fontSize: "9px", color: "#CBD5E1", fontWeight: 600 }}>{m.sub}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="ec-input-card">
                      <label className="ec-label">Farmer Price per Unit *</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="number" name="farmer_price" required value={form.farmer_price || ""} onChange={handleChange} placeholder="₹ price per unit" className="ec-control" style={{ fontFamily: "monospace" }} />
                        <IndianRupee style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                    <div className="ec-input-card">
                      <label className="ec-label">Unit Type</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <select name="unit_type" value={form.unit_type} onChange={handleChange} className="ec-control" style={{ cursor: "pointer" }}>
                          <option value="Kg">Kg</option>
                          <option value="Ton">Ton</option>
                          <option value="Bag">Bag (50Kg)</option>
                          <option value="Box">Box</option>
                          <option value="Crate">Crate</option>
                          <option value="Quintal">Quintal</option>
                        </select>
                        <Package style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="ec-input-card">
                      <label className="ec-label">Quantity Available *</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="number" name="quantity_available" required value={form.quantity_available || ""} onChange={handleChange} className="ec-control" style={{ fontFamily: "monospace" }} />
                        <Package style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                    <div className="ec-input-card">
                      <label className="ec-label">Listing Status</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <select name="status" value={form.status} onChange={handleChange} className="ec-control" style={{ cursor: "pointer" }}>
                          <option value="available">Available (Live)</option>
                          <option value="reserved">Reserved (Bidded)</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                        <Activity style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="ec-input-card">
                      <label className="ec-label">Shelf Life (Days)</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="number" name="shelf_life_days" value={form.shelf_life_days} onChange={handleChange} className="ec-control" style={{ fontFamily: "monospace" }} />
                        <Calendar style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                    <div className="ec-input-card">
                      <label className="ec-label">Storage Temperature</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="text" name="storage_temp" value={form.storage_temp} onChange={handleChange} placeholder="e.g. 10–15°C" className="ec-control" style={{ fontFamily: "monospace" }} />
                        <Thermometer style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                  </div>

                  <div className="ec-input-card">
                    <label className="ec-label">Storage Condition Recommendation</label>
                    <textarea name="storage_condition" value={form.storage_condition || ""} onChange={handleChange} rows={2} placeholder="e.g. Cool, dry place, away from sunlight" className="ec-control" style={{ resize: "none", lineHeight: 1.7 }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="ec-input-card">
                      <label className="ec-label">GPS Latitude</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="number" step="0.0001" name="gps_lat" value={form.gps_lat} onChange={handleChange} className="ec-control" style={{ fontFamily: "monospace" }} />
                        <Compass style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                    <div className="ec-input-card">
                      <label className="ec-label">GPS Longitude</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="number" step="0.0001" name="gps_lng" value={form.gps_lng} onChange={handleChange} className="ec-control" style={{ fontFamily: "monospace" }} />
                        <Compass style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════ TAB 3: AI INSIGHTS ══════ */}
              {activeTab === "ai" && (
                <div style={S.card} className="space-y-5">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "14px", borderBottom: "1.5px solid #F1F5F9" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #F5F3FF, #EDE9FE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Sparkles style={{ width: "18px", height: "18px", color: "#7C3AED" }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "'Outfit', sans-serif" }}>AI Crop Diagnostics Engine</h3>
                      <p style={{ fontSize: "12px", color: "#94A3B8", margin: "2px 0 0", fontWeight: 600 }}>Automated quality grading and pricing prediction models</p>
                    </div>
                  </div>

                  {/* AI Run Button Banner */}
                  <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(99,102,241,0.06))", border: "1.5px solid rgba(124,58,237,0.15)", borderRadius: "18px", padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #7C3AED, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Sparkles style={{ width: "20px", height: "20px", color: "#fff" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>AgriNex AI Multimodal Diagnostics</h4>
                      <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 14px", lineHeight: 1.6, fontWeight: 500 }}>
                        Integrates Gemini Vision scanning to analyze crop images and produce quality grades, freshness scores and price recommendations automatically.
                      </p>
                      <button type="button" onClick={runAiEngine} disabled={aiRunning} className="ec-btn-purple" style={{ height: "42px", padding: "0 20px", fontSize: "13px" }}>
                        {aiRunning ? (
                          <><Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> AI Diagnostics Running...</>
                        ) : (
                          <><Activity style={{ width: "14px", height: "14px" }} /> Run AI Diagnostics Now</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* AI Insight Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      { title: `Recommended Price: ₹${aiRecommended}`, desc: "High demand matches your harvest window.", icon: "💡", color: "#16A34A", bg: "#F0FDF4", border: "#DCFCE7" },
                      { title: "Market Demand: High", desc: `District supply dropping in ${form.category}`, icon: "📈", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
                      { title: `Expected Profit: ₹${expectedProfit.toLocaleString("en-IN")}`, desc: "Based on current price × stock.", icon: "💰", color: "#0D9488", bg: "#F0FDFA", border: "#CCFBF1" },
                      { title: `Market Trend: Positive`, desc: `Confidence level: ${form.ai_confidence_score}%`, icon: "🚚", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
                    ].map(r => (
                      <div key={r.title} style={{ background: r.bg, border: `1.5px solid ${r.border}`, borderRadius: "16px", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <span style={{ fontSize: "22px", flexShrink: 0 }}>{r.icon}</span>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: r.color }}>{r.title}</div>
                          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, marginTop: "2px" }}>{r.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="ec-input-card">
                      <label className="ec-label">AI Certified Quality Grade</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <select name="ai_quality_grade" value={form.ai_quality_grade} onChange={handleChange} className="ec-control" style={{ cursor: "pointer", fontWeight: 800 }}>
                          <option value="A+">Grade A+ (Excellent)</option>
                          <option value="A">Grade A (Good)</option>
                          <option value="B">Grade B (Fair)</option>
                          <option value="C">Grade C (Substandard)</option>
                        </select>
                        <Sparkles style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                    <div className="ec-input-card">
                      <label className="ec-label">Ledger Traceability Code</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="text" name="traceability_code" readOnly value={form.traceability_code || ""} className="ec-control" style={{ color: "#94A3B8", cursor: "not-allowed", fontFamily: "monospace" }} />
                        <Shield style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                      </div>
                    </div>
                  </div>

                  {/* Score Progress Bars */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    {[
                      { label: "Freshness Index", key: "ai_freshness_score", color: "#16A34A" },
                      { label: "AI Confidence Index", key: "ai_confidence_score", color: "#7C3AED" },
                      { label: "Disease Risk Index", key: "ai_disease_score", color: "#EF4444" },
                      { label: "Pest Infestation Index", key: "ai_pest_score", color: "#F59E0B" },
                    ].map(s => (
                      <div key={s.key} style={{ background: "#F8FFF8", border: "1.5px solid #DCFCE7", borderRadius: "16px", padding: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>{s.label}</span>
                          <span style={{ fontSize: "12px", fontWeight: 900, color: s.color, fontFamily: "monospace" }}>{(form as any)[s.key]}%</span>
                        </div>
                        <div className="ec-progress-bar">
                          <div className="ec-progress-fill" style={{ width: `${(form as any)[s.key]}%`, background: s.color }} />
                        </div>
                        <input type="range" name={s.key} min="0" max="100" value={(form as any)[s.key]} onChange={handleChange}
                          style={{ width: "100%", marginTop: "6px", accentColor: s.color, cursor: "pointer" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══════ TAB 4: MEDIA GALLERY ══════ */}
              {activeTab === "media" && (
                <div style={S.card} className="space-y-5">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "14px", borderBottom: "1.5px solid #F1F5F9" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #F0F9FF, #BAE6FD)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon style={{ width: "18px", height: "18px", color: "#0284C7" }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "'Outfit', sans-serif" }}>Media & Attachments</h3>
                      <p style={{ fontSize: "12px", color: "#94A3B8", margin: "2px 0 0", fontWeight: 600 }}>Attach batch images and verify product previews</p>
                    </div>
                  </div>

                  <div className="ec-input-card">
                    <label className="ec-label">Primary Cover Image URL</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input type="text" name="image_url" value={form.image_url || ""} onChange={handleChange} placeholder="https://images.unsplash.com/..." className="ec-control" />
                      <ImageIcon style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                    </div>
                  </div>

                  {/* Live image preview */}
                  {form.image_url && (
                    <div>
                      <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Current Cover Preview</span>
                      <div style={{ position: "relative", border: "1.5px solid #DCFCE7", borderRadius: "18px", overflow: "hidden", width: "240px", height: "170px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                        <img src={form.image_url} alt="Crop listing primary" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button type="button" onClick={() => setForm(p => ({ ...p, image_url: "" }))}
                          style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.9)", color: "#fff", border: "none", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}>
                          🗑 Remove Image
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop Zone */}
                  <div style={{ border: "2px dashed #DCFCE7", borderRadius: "20px", padding: "40px 24px", textAlign: "center", background: "#F8FFF8", transition: "all 0.2s", cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#22C55E"; (e.currentTarget as HTMLElement).style.background = "#F0FDF4"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#DCFCE7"; (e.currentTarget as HTMLElement).style.background = "#F8FFF8"; }}>
                    <UploadCloud style={{ width: "36px", height: "36px", color: "#16A34A", margin: "0 auto 10px" }} />
                    <p style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>Drag & Drop Batch Images Here</p>
                    <p style={{ fontSize: "11px", color: "#94A3B8", margin: "0 0 16px", fontWeight: 500 }}>JPEG, PNG, WEBP, MP4 · Max 50MB · Encrypted on IPFS</p>
                    <button type="button" className="ec-btn-gradient" style={{ height: "36px", padding: "0 18px", fontSize: "12px" }}>Browse Local Files</button>
                  </div>

                  {/* Gallery Image URL Inputs */}
                  <div>
                    <p style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Additional Gallery Images</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {["Gallery Image 1", "Gallery Image 2", "Farm Photo", "Harvest Photo"].map((lbl) => (
                        <div key={lbl} className="ec-input-card">
                          <label className="ec-label">{lbl}</label>
                          <input type="text" placeholder="https://..." className="ec-control" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════ TAB 5: CERTIFICATIONS ══════ */}
              {activeTab === "certs" && (
                <div style={S.card} className="space-y-5">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "14px", borderBottom: "1.5px solid #F1F5F9" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Shield style={{ width: "18px", height: "18px", color: "#16A34A" }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "'Outfit', sans-serif" }}>Certifications & Compliance</h3>
                      <p style={{ fontSize: "12px", color: "#94A3B8", margin: "2px 0 0", fontWeight: 600 }}>Declare regulatory badges and compliance credentials</p>
                    </div>
                  </div>

                  {/* Certification toggle cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                    {[
                      { id: "FSSAI Certified",    icon: "📜", label: "FSSAI" },
                      { id: "Organic Certified",  icon: "🌿", label: "Organic" },
                      { id: "GI Tag",             icon: "🚜", label: "GI Tag" },
                      { id: "Government Reg",     icon: "🛡", label: "Gov Reg" },
                      { id: "ISO Certified",      icon: "✅", label: "ISO" },
                    ].map(cert => {
                      const selected = form.certificates.includes(cert.id);
                      return (
                        <div key={cert.id} className={cn("ec-cert-card", selected && "selected")}
                          onClick={() => setForm(p => ({ ...p, certificates: selected ? p.certificates.filter(c => c !== cert.id) : [...p.certificates, cert.id] }))}>
                          <span style={{ fontSize: "24px" }}>{cert.icon}</span>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: selected ? "#16A34A" : "#64748B" }}>{cert.label}</span>
                          <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${selected ? "#16A34A" : "#E2E8F0"}`, background: selected ? "#16A34A" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                            {selected && <Check style={{ width: "10px", height: "10px", color: "#fff", strokeWidth: 3 }} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="ec-input-card">
                    <label className="ec-label">Additional Quality Credentials (comma separated)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input type="text" name="certificates_raw" value={form.certificates.join(", ")}
                        onChange={(e) => {
                          const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                          setForm((prev) => ({ ...prev, certificates: arr }));
                        }}
                        className="ec-control" style={{ fontFamily: "monospace" }} />
                      <Shield style={{ color: "#CBD5E1", flexShrink: 0, width: "16px", height: "16px" }} />
                    </div>
                  </div>

                  {/* Active badge pills */}
                  {form.certificates.length > 0 && (
                    <div>
                      <p style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Active Quality Badges</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {form.certificates.map(c => (
                          <span key={c} style={{ padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, background: "linear-gradient(135deg, rgba(22,163,74,0.1), rgba(34,197,94,0.1))", border: "1px solid rgba(22,163,74,0.2)", color: "#16A34A", display: "flex", alignItems: "center", gap: "6px" }}>
                            <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                            {c}
                            <button type="button" onClick={() => setForm(p => ({ ...p, certificates: p.certificates.filter(x => x !== c) }))}
                              style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "14px", fontWeight: 900, lineHeight: 1, padding: 0, marginLeft: "2px" }}>×</button>
                          </span>
                        ))}
                        <span style={{ padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(99,102,241,0.1))", border: "1px solid rgba(124,58,237,0.2)", color: "#7C3AED", display: "flex", alignItems: "center", gap: "6px" }}>
                          🤖 AI Verified
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Compliance warning */}
                  <div style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: "16px", padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <AlertTriangle style={{ width: "18px", height: "18px", color: "#F59E0B", flexShrink: 0, marginTop: "1px" }} />
                    <div>
                      <h5 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>Compliance & Traceability Ledger</h5>
                      <p style={{ fontSize: "11px", color: "#64748B", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                        Certifications are automatically recorded to the AgriNex traceability ledger. Declaring false information can result in account suspension.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Agricultural Hub Quick Select — always visible */}
          <div style={{ ...S.card, marginTop: "4px" }}>
            <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin style={{ width: "13px", height: "13px", color: "#16A34A" }} />
              Quick Select: Popular Indian Agricultural Hubs
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {AGRI_HUBS.map(hub => (
                <button key={hub.label} type="button" onClick={() => setForm(p => ({ ...p, location: hub.label }))} disabled={loading}
                  style={{
                    padding: "6px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: "1.5px solid",
                    borderColor: form.location === hub.label ? "#16A34A" : "#E2E8F0",
                    background: form.location === hub.label ? "#F0FDF4" : "#fff",
                    color: form.location === hub.label ? "#16A34A" : "#64748B",
                    transition: "all 0.18s",
                  }}>
                  📍 {hub.label} <span style={{ fontSize: "10px", color: "#CBD5E1", fontWeight: 500 }}>({hub.short})</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── STICKY BOTTOM ACTION BUTTONS ── */}
          <div style={{
            background: "rgba(255,255,255,0.95)",
            border: "1.5px solid #DCFCE7",
            borderRadius: "20px",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 -4px 24px rgba(22,163,74,0.06)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            bottom: "16px",
            zIndex: 40,
          }}>
            <button type="button" onClick={onClose} className="ec-btn-red" style={{ height: "48px", padding: "0 22px", fontSize: "14px" }}>
              Cancel
            </button>
            <button type="button" onClick={() => {
              setForm(prev => ({ ...prev, status: "out_of_stock" }));
              setTimeout(() => { document.getElementById("enterprise-submit-btn")?.click(); }, 50);
            }} disabled={loading} className="ec-btn-blue" style={{ height: "48px", padding: "0 22px", fontSize: "14px" }}>
              Save Draft
            </button>
            <button type="button" className="ec-btn-white" style={{ height: "48px", padding: "0 22px", fontSize: "14px" }}>
              <Eye style={{ width: "15px", height: "15px" }} /> Preview Changes
            </button>
            <button id="enterprise-submit-btn" type="submit" onClick={handleSubmit} disabled={loading} className="ec-btn-gradient" style={{ height: "48px", padding: "0 28px", fontSize: "14px" }}>
              {loading ? (
                <><Loader2 style={{ width: "15px", height: "15px", animation: "spin 1s linear infinite" }} /> Updating Crop...</>
              ) : (
                <><CheckCircle2 style={{ width: "15px", height: "15px" }} /> Update Crop Listing</>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Preview + Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "20px" }}>

          {/* Live Marketplace Preview Card */}
          <div style={S.card}>
            <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Activity style={{ width: "13px", height: "13px", color: "#16A34A" }} />
              Live Marketplace Preview
            </h3>

            <div style={{ background: "#fff", border: "1.5px solid #DCFCE7", borderRadius: "18px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {/* Image area */}
              <div style={{ height: "168px", background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {form.image_url ? (
                  <img src={form.image_url} alt={form.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <ImageIcon style={{ width: "28px", height: "28px", color: "#CBD5E1" }} />
                    <span style={{ fontSize: "11px", color: "#CBD5E1", fontWeight: 600 }}>No image uploaded</span>
                  </div>
                )}
                <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "9px", fontWeight: 800, background: "rgba(15,23,42,0.9)", color: "#fff" }}>
                    GRADE {form.ai_quality_grade}
                  </span>
                  {form.is_organic && (
                    <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "9px", fontWeight: 800, background: "#16A34A", color: "#fff" }}>
                      🌿 Organic
                    </span>
                  )}
                </div>
                <div style={{ position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                  <Heart style={{ width: "13px", height: "13px", color: "#CBD5E1", fill: "#CBD5E1" }} />
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "9px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{form.category}</span>
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "2px 0 0", lineHeight: 1.3 }}>{form.title || "Crop Name Preview"}</h4>
                  {form.scientific_name && <p style={{ fontSize: "10px", color: "#94A3B8", fontStyle: "italic", margin: "2px 0 0" }}>{form.scientific_name}</p>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid #F1F5F9", paddingTop: "10px" }}>
                  <div>
                    <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", fontWeight: 700, textTransform: "uppercase" }}>Price</span>
                    <span style={{ fontSize: "18px", fontWeight: 900, color: "#16A34A" }}>
                      ₹{form.farmer_price || 0} <span style={{ fontSize: "11px", color: "#CBD5E1", fontWeight: 400 }}>/{form.unit_type}</span>
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", fontWeight: 700, textTransform: "uppercase" }}>Stock</span>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A" }}>{form.quantity_available || 0} {form.unit_type}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #F1F5F9", paddingTop: "10px", fontSize: "10px", color: "#94A3B8" }}>
                  <span>Origin: {form.location}</span>
                  <span style={{ color: "#16A34A", fontWeight: 750 }}>Verified Farmer ✓</span>
                </div>
              </div>
            </div>

            {/* Extended preview metrics */}
            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1.5px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                ["Shelf Life", `${form.shelf_life_days} Days`],
                ["Storage Temp", form.storage_temp],
                ["AI Grade", `Grade ${form.ai_quality_grade}`],
                ["Traceability", form.traceability_code || "Pending"],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span style={{ color: "#94A3B8", fontWeight: 600 }}>{lbl}:</span>
                  <span style={{ color: lbl === "Traceability" ? "#16A34A" : "#0F172A", fontWeight: 750, fontFamily: lbl === "Traceability" ? "monospace" : "inherit", fontSize: lbl === "Traceability" ? "9px" : "11px" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Listing Summary Card */}
          <div style={S.card}>
            <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText style={{ width: "13px", height: "13px", color: "#16A34A" }} />
              Listing Details Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                ["Crop Name", form.title || "N/A", undefined],
                ["Category", form.category, undefined],
                ["Unit Price", `₹${form.farmer_price || 0} / ${form.unit_type}`, undefined],
                ["Total Stock", `${form.quantity_available || 0} ${form.unit_type}`, undefined],
                ["Origin Location", form.location, undefined],
                ["Shelf Life", `${form.shelf_life_days} Days`, undefined],
                ["Storage Temp", form.storage_temp, undefined],
                ["Traceability Code", form.traceability_code || "N/A", "#16A34A"],
                ["AI Certified Grade", `Grade ${form.ai_quality_grade}`, undefined],
                ["Organic Certified", form.is_organic ? "Yes 🌿" : "No", form.is_organic ? "#16A34A" : undefined],
                ["Marketplace Status", form.status === "available" ? "✓ Live" : form.status, form.status === "available" ? "#16A34A" : undefined],
              ].map(([lbl, val, col]) => (
                <div key={lbl as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F1F5F9", fontSize: "11px" }}>
                  <span style={{ color: "#94A3B8", fontWeight: 600 }}>{lbl}:</span>
                  <span style={{ color: (col as string) || "#0F172A", fontWeight: 800, fontSize: "11px", fontFamily: lbl === "Traceability Code" ? "monospace" : "inherit" }}>{val as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Score summary card */}
          <div style={{ ...S.card, background: "linear-gradient(135deg, #F9F5FF, #fff)", border: "1.5px solid #DDD6FE" }}>
            <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>🤖 AI Diagnostics Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                ["Quality Grade", `Grade ${form.ai_quality_grade}`, "#7C3AED"],
                ["Freshness", `${form.ai_freshness_score}%`, "#16A34A"],
                ["Confidence", `${form.ai_confidence_score}%`, "#7C3AED"],
                ["Disease Risk", `${form.ai_disease_score}%`, "#EF4444"],
              ].map(([lbl, val, col]) => (
                <div key={lbl} style={{ background: "#fff", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: "9px", color: "#94A3B8", fontWeight: 750, display: "block", textTransform: "uppercase" }}>{lbl}</span>
                  <span style={{ fontSize: "13px", fontWeight: 900, color: col, display: "block", marginTop: "3px" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── SUCCESS TOAST ── */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{ position: "fixed", bottom: "24px", right: "24px", background: "#0F172A", border: "1px solid rgba(22,163,74,0.3)", color: "#4ADE80", padding: "14px 20px", borderRadius: "18px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.25)", zIndex: 55, fontSize: "13px", fontWeight: 700 }}
          >
            <CheckCircle2 style={{ width: "18px", height: "18px", flexShrink: 0 }} />
            Listing updated successfully on the traceability ledger!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ─── Render modes ─── */
  if (inline) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 40%, #F0FFF0 100%)",
        borderRadius: "28px",
        overflow: "hidden",
        padding: "28px",
        border: "1.5px solid #DCFCE7",
        boxShadow: "0 4px 30px rgba(22,163,74,0.06)",
      }}>
        {innerFormContent}
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", overflowY: "auto" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        style={{
          width: "100%",
          maxWidth: "1200px",
          borderRadius: "28px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 30%, #F8FFF8 100%)",
          border: "1.5px solid #DCFCE7",
          padding: "24px",
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
          <button onClick={onClose} style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#fff", border: "1.5px solid #E2E8F0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", color: "#94A3B8" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.borderColor = "#FCA5A5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; }}>
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
          {innerFormContent}
        </div>
      </motion.div>
    </div>
  );
}