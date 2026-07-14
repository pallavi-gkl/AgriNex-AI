"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Leaf,
  Sparkles,
  IndianRupee,
  Calendar,
  MapPin,
  Package,
  Shield,
  UploadCloud,
  Image as ImageIcon,
  Activity,
  Info,
  FileText,
  Loader2,
  AlertCircle,
  ChevronDown,
  Heart,
  Thermometer,
  Eye,
  X,
  Plus,
  Compass,
  Star,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────── */
interface AddCropWizardProps {
  onClose: () => void;
  onSave: (data: any) => Promise<any>;
  farmerName?: string;
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

const SOIL_TYPES = ["Alluvial", "Black Cotton", "Red", "Laterite", "Sandy Loam", "Clay"];
const CULTIVATION_METHODS = ["Organic", "Conventional", "Hydroponic", "Natural Farming", "Permaculture"];
const PACKAGING_TYPES = ["Jute Bags", "Cardboard Boxes", "Plastic Crates", "Mesh Bags", "Wooden Crates"];
const UNIT_TYPES = ["Kg", "Ton", "Bag (50Kg)", "Box", "Crate", "Quintal"];

const STEPS = [
  { id: 1, icon: "🌾", label: "Basic Info", desc: "Identity & category" },
  { id: 2, icon: "📍", label: "Farm Details", desc: "Origin & soil" },
  { id: 3, icon: "📅", label: "Timeline", desc: "Sowing & harvests" },
  { id: 4, icon: "📦", label: "Stock Info", desc: "Quantities & warehouse" },
  { id: 5, icon: "💰", label: "Pricing", desc: "Margins & retail rates" },
  { id: 6, icon: "📷", label: "Images & Media", desc: "Crop photos gallery" },
  { id: 7, icon: "🤖", label: "AI & Details", desc: "Diagnostics grading" },
  { id: 8, icon: "📜", label: "Certifications", desc: "Compliance & preview" },
];

const AGRI_HUBS = [
  { label: "Karnal, Haryana" }, { label: "Nashik, Maharashtra" }, { label: "Ludhiana, Punjab" },
  { label: "Guntur, Andhra Pradesh" }, { label: "Wayanad, Kerala" }, { label: "Coimbatore, Tamil Nadu" },
  { label: "Belgaum, Karnataka" }, { label: "Patna, Bihar" }, { label: "Varanasi, Uttar Pradesh" },
  { label: "Jaipur, Rajasthan" },
];

/* ─── Main Component ─────────────────────────────────────── */
export default function AddCropWizard({ onClose, onSave, farmerName }: AddCropWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiRunning, setAiRunning] = useState(false);

  // Category Selector Dropdown State
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryRef = useRef<HTMLDivElement>(null);

  /* ─── Form state ─── */
  const [form, setForm] = useState({
    // Basic Information
    title: "",
    scientific_name: "",
    category: "Grains & Cereals",
    sub_category: "",
    variety: "",
    ai_quality_grade: "A",
    quality_grade: "A",
    is_organic: false,
    description: "",
    tags: "",
    hsn_code: "",

    // Farm Details
    farm_name: "",
    farmer_name: farmerName || "Verified Farmer",
    village: "",
    district: "",
    state: "",
    country: "India",
    pin_code: "",
    gps_lat: 29.6857,
    gps_lng: 76.9905,
    farm_size: "",
    soil_type: "Alluvial",
    water_source: "Borewell",
    cultivation_method: "Organic",
    location: "Karnal, Haryana",
    warehouse_location: "",

    // Crop Timeline
    sowing_date: "",
    cultivation_start: "",
    flowering_date: "",
    harvest_date: "",
    packing_date: "",
    supply_start_date: "",
    supply_end_date: "",
    shelf_life_days: 30,
    storage_temp: "10–15°C",
    storage_condition: "",

    // Stock Information
    quantity_available: 0,
    unit_type: "Kg",
    minimum_order: 100,
    maximum_order: 5000,
    expected_daily_production: 500,
    reserved_stock: 0,
    current_inventory: 1000,
    warehouse_capacity: 10000,
    packaging_type: "Jute Bags",
    status: "available",

    // Pricing
    farmer_price: 0,
    retail_price: 0,
    wholesale_price: 0,
    min_negotiation_price: 0,
    marketplace_price: 0,
    transport_charge: 0,
    platform_fee: 5,
    gst: 5,
    discount: 0,
    offer: "",
    ai_recommended_price: 0,
    price_per_unit: 0,

    // Images
    image_url: "",
    gallery_img_1: "",
    gallery_img_2: "",
    gallery_img_3: "",
    gallery_img_4: "",
    farm_img: "",
    harvest_img: "",
    packing_img: "",
    video_url: "",

    // Certifications
    cert_organic: false,
    cert_fssai: false,
    cert_gov: false,
    cert_gi: false,
    cert_iso: false,
    certificates: ["FSSAI Certified"] as string[],

    // AI Info
    ai_freshness_score: 90,
    ai_confidence_score: 95,
    ai_market_demand: "High",
    ai_price_prediction: 0,
    ai_expected_profit: 0,
    ai_season_score: 85,
    ai_disease_prediction: "Healthy",
    ai_disease_score: 0,
    ai_pest_score: 0,
    traceability_code: "",

    is_active: true,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    if (!form.traceability_code) {
      setForm((prev) => ({
        ...prev,
        traceability_code: `AGX-2026-REG-${Math.floor(100 + Math.random() * 900)}`
      }));
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const set = useCallback((key: string, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    set(name, type === "number" ? parseFloat(value) || 0 : value);
  }, [set]);

  const handleCheckbox = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    set(e.target.name, e.target.checked);
  }, [set]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setForm(prev => ({ ...prev, farmer_price: val, price_per_unit: val }));
    setErrors(prev => { const next = { ...prev }; delete next.farmer_price; return next; });
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, ai_quality_grade: e.target.value, quality_grade: e.target.value }));
  };

  /* ─── AI Button Handlers ─── */
  const analyzeCrop = async () => {
    setAiRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setForm(prev => ({
      ...prev,
      ai_quality_grade: "A+",
      quality_grade: "A+",
      ai_confidence_score: 99,
      ai_freshness_score: 98,
      ai_disease_score: 0,
      ai_pest_score: 0,
      traceability_code: `AGX-2026-AI-${Math.floor(100 + Math.random() * 900)}`,
    }));
    setAiRunning(false);
  };

  const generateDescription = () => {
    const varietyText = form.variety ? ` (${form.variety} variety)` : "";
    set("description", `Premium Grade ${form.ai_quality_grade} organic ${form.title}${varietyText} grown in the nutrient-dense soils of ${form.location}. Hand-harvested and sorted to guarantee maximum freshness, shelf life, and premium flavor. Ideal for high-end organic distribution.`);
  };

  const suggestPrice = () => {
    const suggested = Math.round(form.farmer_price > 0 ? form.farmer_price * 1.06 : 120);
    setForm(prev => ({ ...prev, farmer_price: suggested, price_per_unit: suggested }));
  };

  /* ─── Validation ─── */
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.title.trim()) newErrors.title = "Crop Name is required";
      if (!form.category) newErrors.category = "Category is required";
    }
    if (currentStep === 5) {
      if (!form.farmer_price || form.farmer_price <= 0) newErrors.farmer_price = "Selling price must be greater than 0";
      if (!form.quantity_available || form.quantity_available <= 0) newErrors.quantity_available = "Stock quantity must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ─── Navigation ─── */
  const totalSteps = STEPS.length;
  const canGoNext = step < totalSteps;
  const canGoPrev = step > 1;

  const handleNext = () => {
    if (validateStep(step)) {
      if (canGoNext) setStep(s => s + 1);
    }
  };
  const handlePrev = () => { if (canGoPrev) setStep(s => s - 1); };

  /* ─── Submit ─── */
  const handlePublish = async () => {
    const isValidBasic = validateStep(1);
    const isValidPricing = validateStep(5);
    if (!isValidBasic) {
      setStep(1);
      return;
    }
    if (!isValidPricing) {
      setStep(5);
      return;
    }
    setLoading(true);
    try {
      await onSave({
        ...form,
        farmer_price: Number(form.farmer_price),
        price_per_unit: Number(form.farmer_price),
        quantity_available: Number(form.quantity_available),
        shelf_life_days: Number(form.shelf_life_days),
        gps_lat: Number(form.gps_lat),
        gps_lng: Number(form.gps_lng),
        quality_grade: form.ai_quality_grade,
        is_organic: form.is_organic,
        certificates: form.certificates,
        is_active: true,
      });
      setPublished(true);
      setTimeout(() => onClose(), 2200);
    } catch (err: any) {
      setErrors({ submit: err.message || "Failed to publish listing. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const aiRecommended = Math.round(form.farmer_price * 1.06);
  const marketAverage = Math.round(form.farmer_price * 0.98);
  const expectedProfit = form.farmer_price * form.quantity_available;

  const filteredCategories = CATEGORIES.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1.5px solid #DCFCE7",
    borderRadius: "22px",
    boxShadow: "0 4px 24px rgba(22,163,74,0.03)",
    padding: "28px",
  };

  const inputClass = "w-full h-12 pl-10 pr-4 rounded-xl text-sm bg-[#F8FFF8] text-slate-800 placeholder-slate-400 border border-[#DCFCE7] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all";

  if (published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fffb] p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-[#bbf7d0] rounded-[24px] shadow-2xl p-14 flex flex-col items-center gap-6 max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#16a34a] to-[#22c55e] flex items-center justify-center shadow-lg shadow-[#16a34a]/30"
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
          <div>
            <h2 className="text-[22px] font-extrabold text-[#0f172a] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Crop Published Successfully! 🎉
            </h2>
            <p className="text-[#64748b] text-[15px] leading-relaxed">
              <strong>{form.title || "Your crop"}</strong> is now live on the marketplace. Redirecting to inventory…
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(135deg, #F8FFF8 0%, #EAF7EC 60%, #F3FAF0 100%)", minHeight: "100vh", padding: "28px 20px 60px", fontFamily: "Inter, sans-serif" }}>
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .wizard-card:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(22,163,74,0.06) !important; transition: all 0.25s ease; }
        .wizard-input-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1.5px solid #DCFCE7;
          border-radius: 16px;
          padding: 10px 14px;
          transition: all 0.2s;
        }
        .wizard-input-card:focus-within {
          border-color: #16A34A !important;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.1) !important;
        }
        .wizard-label {
          font-size: 11px;
          font-weight: 850;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .wizard-control {
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: #0F172A;
          font-weight: 600;
          width: 100%;
        }
        .wizard-control::placeholder {
          color: #CBD5E1;
        }
        .wizard-btn-gradient {
          background: linear-gradient(135deg, #16A34A, #22C55E);
          color: #ffffff;
          border: none;
          font-weight: 800;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wizard-btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22,163,74,0.3);
        }
        .wizard-btn-blue {
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          color: #ffffff;
          border: none;
          font-weight: 800;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wizard-btn-blue:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.3);
        }
        .wizard-btn-purple {
          background: linear-gradient(135deg, #8B5CF6, #6366F1);
          color: #ffffff;
          border: none;
          font-weight: 800;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wizard-btn-purple:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(139,92,246,0.3);
        }
        .wizard-btn-white {
          background: #ffffff;
          color: #64748B;
          border: 1.5px solid #E2E8F0;
          font-weight: 700;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wizard-btn-white:hover {
          background: #F8FAFC;
          color: #0F172A;
          border-color: #CBD5E1;
        }
        .wizard-btn-red {
          background: #ffffff;
          color: #EF4444;
          border: 1.5px solid #FCA5A5;
          font-weight: 700;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wizard-btn-red:hover {
          background: #FEF2F2;
          border-color: #EF4444;
        }
        .wizard-step-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 12px;
          border: 2px solid #DCFCE7;
          background: #ffffff;
          color: #94A3B8;
          transition: all 0.25s;
        }
        .wizard-step-active .wizard-step-indicator {
          background: linear-gradient(135deg, #16A34A, #22C55E);
          border-color: #16A34A;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(22,163,74,0.25);
        }
        .wizard-step-completed .wizard-step-indicator {
          background: #DCFCE7;
          border-color: #16A34A;
          color: #16A34A;
        }
      `}</style>

      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>

        {/* Back navigation */}
        <button onClick={onClose}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748B", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginBottom: "24px", padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#16A34A")}
          onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}>
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
          Back to Inventory
        </button>

        {/* ─── Hero Header ─── */}
        <div style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", borderRadius: "22px", padding: "28px 32px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", boxShadow: "0 8px 32px rgba(22,163,74,0.22)" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", margin: "0 0 6px", letterSpacing: "-0.5px" }}>🌾 Create New Crop Listing</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: 0, fontWeight: 500 }}>Publish your crop with AI-powered recommendations and complete marketplace readiness.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["✓ Marketplace Ready", "✓ Organic Ready", "✓ AI Assisted", "✓ Traceability Enabled"].map(badge => (
              <span key={badge} style={{ padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, color: "#ffffff", backdropFilter: "blur(8px)" }}>
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* ─── Horizontal Wizard Stepper ─── */}
        <div style={{ background: "#ffffff", border: "1.5px solid #DCFCE7", borderRadius: "22px", padding: "16px 20px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", overflowX: "auto", gap: "8px" }}>
          {STEPS.map((s, idx) => {
            const active = step === s.id;
            const completed = step > s.id;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}
                className={cn(active && "wizard-step-active", completed && "wizard-step-completed")}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: completed ? "pointer" : "default" }}
                  onClick={() => completed && setStep(s.id)}>
                  <div className="wizard-step-indicator">
                    {completed ? <Check style={{ width: "14px", height: "14px", strokeWidth: 3 }} /> : s.id}
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 800, color: active || completed ? "#16A34A" : "#94A3B8", margin: 0, whiteSpace: "nowrap" }}>{s.label}</p>
                    <p style={{ fontSize: "9px", color: "#CBD5E1", margin: 0, whiteSpace: "nowrap" }}>{s.desc}</p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{ width: "24px", height: "2px", background: completed ? "#16A34A" : "#DCFCE7" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Two-Column Workspace */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px", alignItems: "start" }}>

          {/* ── LEFT: Step content ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="wizard-card" style={cardStyle}>
              
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* STEP 1: BASIC INFORMATION */}
                  {step === 1 && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "12px", marginBottom: "8px" }}>
                        <FileText style={{ color: "#16A34A", width: "20px", height: "20px" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Basic Crop Information</h2>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Crop Name *</label>
                          <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Premium Basmati Rice" className="wizard-control" required />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Scientific Name</label>
                          <input type="text" name="scientific_name" value={form.scientific_name} onChange={handleChange} placeholder="e.g. Oryza sativa" className="wizard-control" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card relative" ref={categoryRef}>
                          <label className="wizard-label">Category *</label>
                          <div onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                            <input type="text" placeholder="Search category..." value={categorySearch || form.category} onChange={e => { setCategorySearch(e.target.value); setShowCategoryDropdown(true); }} className="wizard-control font-bold" style={{ paddingRight: 24 }} />
                            <ChevronDown style={{ width: "16px", height: "16px", color: "#94A3B8" }} />
                          </div>
                          {showCategoryDropdown && (
                            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white border-2 border-[#DCFCE7] shadow-xl z-50 p-1.5 max-h-56 overflow-y-auto">
                              {filteredCategories.map(cat => (
                                <button key={cat} type="button" onClick={() => { set("category", cat); setCategorySearch(""); setShowCategoryDropdown(false); }}
                                  style={{ width: "100%", textAlign: "left", padding: "8px 12px", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 750, color: form.category === cat ? "#ffffff" : "#0F172A", background: form.category === cat ? "#16A34A" : "transparent", cursor: "pointer" }}>
                                  {cat}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Sub Category</label>
                          <input type="text" name="sub_category" value={form.sub_category} onChange={handleChange} placeholder="e.g. Long Grain Cereals" className="wizard-control" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Variety</label>
                          <input type="text" name="variety" value={form.variety} onChange={handleChange} placeholder="e.g. Pusa Basmati" className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">HSN Code (Optional)</label>
                          <input type="text" name="hsn_code" value={form.hsn_code} onChange={handleChange} placeholder="e.g. 10063010" className="wizard-control" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Product Tags</label>
                          <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. aromatic, long-grain, organic" className="wizard-control" />
                        </div>
                        <div className="wizard-input-card" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
                          <div>
                            <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "6px" }}>🌿 Organic Certified</span>
                            <span style={{ fontSize: "10px", color: "#94A3B8", display: "block", marginTop: "2px" }}>Zero synthetic inputs used</span>
                          </div>
                          <input type="checkbox" id="is_organic" name="is_organic" checked={form.is_organic} onChange={handleCheckbox} style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#16A34A" }} />
                        </div>
                      </div>

                      <div className="wizard-input-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <label className="wizard-label" style={{ flex: 1 }}>Product Description</label>
                          <button type="button" onClick={generateDescription} className="wizard-btn-purple" style={{ height: "30px", padding: "0 12px", fontSize: "11px" }}>✨ Auto AI Describe</button>
                        </div>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe cultivation, soil condition, pesticide-free certifications..." className="w-full bg-transparent border-none outline-none text-sm text-[#0f172a] resize-none font-semibold leading-relaxed" />
                      </div>
                    </>
                  )}

                  {/* STEP 2: FARM DETAILS */}
                  {step === 2 && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "12px", marginBottom: "8px" }}>
                        <MapPin style={{ color: "#16A34A", width: "20px", height: "20px" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Farm & Origin Details</h2>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Farm Name</label>
                          <input type="text" name="farm_name" value={form.farm_name} onChange={handleChange} placeholder="e.g. Golden Harvest Farms" className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Farmer Name</label>
                          <input type="text" name="farmer_name" value={form.farmer_name} onChange={handleChange} placeholder="e.g. Ramesh Kumar" className="wizard-control" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Village</label>
                          <input type="text" name="village" value={form.village} onChange={handleChange} placeholder="e.g. Taraori" className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">District</label>
                          <input type="text" name="district" value={form.district} onChange={handleChange} placeholder="e.g. Karnal" className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">State</label>
                          <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="e.g. Haryana" className="wizard-control" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">PIN Code</label>
                          <input type="text" name="pin_code" value={form.pin_code} onChange={handleChange} placeholder="e.g. 132116" className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Farm Size</label>
                          <input type="text" name="farm_size" value={form.farm_size} onChange={handleChange} placeholder="e.g. 5 Hectares" className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Warehouse Location</label>
                          <input type="text" name="warehouse_location" value={form.warehouse_location} onChange={handleChange} placeholder="e.g. Karnal Cold Storage Unit B" className="wizard-control" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">GPS Latitude</label>
                          <input type="number" step="0.0001" name="gps_lat" value={form.gps_lat} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">GPS Longitude</label>
                          <input type="number" step="0.0001" name="gps_lng" value={form.gps_lng} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Soil Type</label>
                          <select name="soil_type" value={form.soil_type} onChange={handleChange} className="wizard-control cursor-pointer">
                            {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Water Source</label>
                          <input type="text" name="water_source" value={form.water_source} onChange={handleChange} placeholder="e.g. Borewell / Canal" className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Cultivation Method</label>
                          <select name="cultivation_method" value={form.cultivation_method} onChange={handleChange} className="wizard-control cursor-pointer">
                            {CULTIVATION_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ borderTop: "1.5px solid #F1F5F9", paddingTop: "12px" }}>
                        <label className="wizard-label" style={{ marginBottom: "8px" }}>Quick Select: Agricultural Hubs</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {AGRI_HUBS.map(h => (
                            <button key={h.label} type="button" onClick={() => { set("location", h.label); const parts = h.label.split(", "); if (parts[1]) set("state", parts[1]); }}
                              style={{ padding: "6px 12px", border: "1.5px solid #DCFCE7", borderRadius: "10px", background: form.location === h.label ? "#F0FDF4" : "#ffffff", color: form.location === h.label ? "#16A34A" : "#64748B", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                              {h.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* STEP 3: CROP TIMELINE */}
                  {step === 3 && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "12px", marginBottom: "8px" }}>
                        <Calendar style={{ color: "#16A34A", width: "20px", height: "20px" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Crop Timeline & Lifespan</h2>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Sowing Date</label>
                          <input type="date" name="sowing_date" value={form.sowing_date} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Cultivation Start</label>
                          <input type="date" name="cultivation_start" value={form.cultivation_start} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Flowering Date</label>
                          <input type="date" name="flowering_date" value={form.flowering_date} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Harvest Date</label>
                          <input type="date" name="harvest_date" value={form.harvest_date} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Packing Date</label>
                          <input type="date" name="packing_date" value={form.packing_date} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Expected Shelf Life (Days)</label>
                          <input type="number" name="shelf_life_days" value={form.shelf_life_days} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Supply Start Date</label>
                          <input type="date" name="supply_start_date" value={form.supply_start_date} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Supply End Date</label>
                          <input type="date" name="supply_end_date" value={form.supply_end_date} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Storage Temperature</label>
                          <input type="text" name="storage_temp" value={form.storage_temp} onChange={handleChange} placeholder="e.g. 10–15°C" className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Storage Condition</label>
                          <input type="text" name="storage_condition" value={form.storage_condition} onChange={handleChange} placeholder="e.g. Keep in a dry ventilated place" className="wizard-control" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* STEP 4: STOCK INFORMATION */}
                  {step === 4 && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "12px", marginBottom: "8px" }}>
                        <Package style={{ color: "#16A34A", width: "20px", height: "20px" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Stock & Inventory Metrics</h2>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Available Quantity *</label>
                          <input type="number" name="quantity_available" value={form.quantity_available || ""} onChange={handleChange} placeholder="e.g. 5000" className="wizard-control font-mono" required />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Unit type</label>
                          <select name="unit_type" value={form.unit_type} onChange={handleChange} className="wizard-control cursor-pointer">
                            {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Minimum Order Quantity</label>
                          <input type="number" name="minimum_order" value={form.minimum_order} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Maximum Order Quantity</label>
                          <input type="number" name="maximum_order" value={form.maximum_order} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Expected Daily Production</label>
                          <input type="number" name="expected_daily_production" value={form.expected_daily_production} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Warehouse Capacity</label>
                          <input type="number" name="warehouse_capacity" value={form.warehouse_capacity} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Reserved Stock</label>
                          <input type="number" name="reserved_stock" value={form.reserved_stock} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Current Inventory</label>
                          <input type="number" name="current_inventory" value={form.current_inventory} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Packaging Type</label>
                          <select name="packaging_type" value={form.packaging_type} onChange={handleChange} className="wizard-control cursor-pointer">
                            {PACKAGING_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Listing Availability Status</label>
                          <select name="status" value={form.status} onChange={handleChange} className="wizard-control cursor-pointer">
                            <option value="available">Available (Live)</option>
                            <option value="reserved">Reserved (Pre-order)</option>
                            <option value="out_of_stock">Out of Stock</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* STEP 5: PRICING */}
                  {step === 5 && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "12px", marginBottom: "8px" }}>
                        <IndianRupee style={{ color: "#16A34A", width: "20px", height: "20px" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Pricing & Finance details</h2>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Farmer Price *</label>
                          <input type="number" name="farmer_price" value={form.farmer_price || ""} onChange={handlePriceChange} placeholder="e.g. 100" className="wizard-control font-mono" required />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Retail Price</label>
                          <input type="number" name="retail_price" value={form.retail_price} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Wholesale Price</label>
                          <input type="number" name="wholesale_price" value={form.wholesale_price} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Minimum Negotiation Price</label>
                          <input type="number" name="min_negotiation_price" value={form.min_negotiation_price} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Marketplace Price</label>
                          <input type="number" name="marketplace_price" value={form.marketplace_price} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Transport Charge</label>
                          <input type="number" name="transport_charge" value={form.transport_charge} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Platform Fee (₹)</label>
                          <input type="number" name="platform_fee" value={form.platform_fee} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">GST (%)</label>
                          <input type="number" name="gst" value={form.gst} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Discount (%)</label>
                          <input type="number" name="discount" value={form.discount} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Active Promotion / Offer description</label>
                          <input type="text" name="offer" value={form.offer} onChange={handleChange} placeholder="e.g. Buy 10 bags get 1 free" className="wizard-control" />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                          <button type="button" onClick={suggestPrice} className="wizard-btn-purple" style={{ height: "48px", padding: "0 20px" }}>✨ Auto AI Recommend Price</button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* STEP 6: IMAGES */}
                  {step === 6 && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "12px", marginBottom: "8px" }}>
                        <ImageIcon style={{ color: "#16A34A", width: "20px", height: "20px" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Produce Gallery & Media Attachments</h2>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Cover Image URL</label>
                          <input type="text" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://images.unsplash.com/..." className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Video URL (optional)</label>
                          <input type="text" name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://youtube.com/..." className="wizard-control" />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                        {[
                          { name: "gallery_img_1", label: "Gallery Image 1" },
                          { name: "gallery_img_2", label: "Gallery Image 2" },
                          { name: "gallery_img_3", label: "Gallery Image 3" },
                          { name: "gallery_img_4", label: "Gallery Image 4" },
                        ].map(img => (
                          <div key={img.name} className="wizard-input-card">
                            <label className="wizard-label">{img.label}</label>
                            <input type="text" name={img.name} value={(form as any)[img.name]} onChange={handleChange} placeholder="https://..." className="wizard-control" />
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                        {[
                          { name: "farm_img", label: "Farm Image" },
                          { name: "harvest_img", label: "Harvest Image" },
                          { name: "packing_img", label: "Packing Image" },
                        ].map(img => (
                          <div key={img.name} className="wizard-input-card">
                            <label className="wizard-label">{img.label}</label>
                            <input type="text" name={img.name} value={(form as any)[img.name]} onChange={handleChange} placeholder="https://..." className="wizard-control" />
                          </div>
                        ))}
                      </div>

                      <div style={{ border: "2px dashed #DCFCE7", borderRadius: "18px", padding: "28px", textAlign: "center", background: "#F8FFF8" }}>
                        <UploadCloud style={{ width: "32px", height: "32px", color: "#16A34A", marginBottom: "8px" }} />
                        <p style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>Drag and drop media files</p>
                        <p style={{ fontSize: "11px", color: "#94A3B8", margin: "0 0 12px" }}>PNG, JPEG, MP4 files up to 50MB</p>
                        <button type="button" onClick={() => {
                          const urls = [
                            "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600",
                            "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600"
                          ];
                          set("image_url", urls[Math.floor(Math.random() * urls.length)]);
                        }} className="wizard-btn-gradient" style={{ height: "36px", padding: "0 16px", fontSize: "12px" }}>Browse Local Files</button>
                      </div>
                    </>
                  )}

                  {/* STEP 7: AI INFORMATION */}
                  {step === 7 && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "12px", marginBottom: "8px" }}>
                        <Sparkles style={{ color: "#16A34A", width: "20px", height: "20px" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>AI Quality & Analytics Diagnostics</h2>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">AI Certified Quality Grade</label>
                          <select name="ai_quality_grade" value={form.ai_quality_grade} onChange={handleGradeChange} className="wizard-control cursor-pointer font-bold">
                            <option value="A+">Grade A+ (Excellent)</option>
                            <option value="A">Grade A (Good)</option>
                            <option value="B">Grade B (Fair)</option>
                            <option value="C">Grade C (Substandard)</option>
                          </select>
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Market Demand Outlook</label>
                          <select name="ai_market_demand" value={form.ai_market_demand} onChange={handleChange} className="wizard-control cursor-pointer font-bold">
                            <option value="High">High Demand</option>
                            <option value="Moderate">Moderate Demand</option>
                            <option value="Low">Low Demand</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                        {[
                          { label: "Freshness Index", key: "ai_freshness_score", color: "#16A34A" },
                          { label: "AI Confidence Index", key: "ai_confidence_score", color: "#7C3AED" },
                          { label: "Disease Index", key: "ai_disease_score", color: "#EF4444" },
                          { label: "Pest Risk Index", key: "ai_pest_score", color: "#F59E0B" },
                        ].map(slide => (
                          <div key={slide.key} style={{ background: "#F8FFF8", border: "1.5px solid #DCFCE7", borderRadius: "14px", padding: "12px", textAlign: "center" }}>
                            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", display: "block" }}>{slide.label}</span>
                            <span style={{ fontSize: "16px", fontWeight: 900, color: slide.color, display: "block", marginTop: "4px" }}>{(form as any)[slide.key]}%</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Disease Prediction</label>
                          <input type="text" name="ai_disease_prediction" value={form.ai_disease_prediction} onChange={handleChange} className="wizard-control" />
                        </div>
                        <div className="wizard-input-card">
                          <label className="wizard-label">Season Score (%)</label>
                          <input type="number" name="ai_season_score" value={form.ai_season_score} onChange={handleChange} className="wizard-control font-mono" />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                        <button type="button" onClick={analyzeCrop} disabled={aiRunning} className="wizard-btn-purple" style={{ height: "46px", padding: "0 24px" }}>
                          {aiRunning ? "Running Diagnostics scan..." : "Run AI Multimodal Diagnostics Scan"}
                        </button>
                      </div>
                    </>
                  )}

                  {/* STEP 8: CERTIFICATIONS & PREVIEW */}
                  {step === 8 && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "12px", marginBottom: "8px" }}>
                        <Shield style={{ color: "#16A34A", width: "20px", height: "20px" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Compliance, Certifications & Publish</h2>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                        {[
                          { id: "cert_organic", icon: "🌿", label: "Organic" },
                          { id: "cert_fssai", icon: "📜", label: "FSSAI" },
                          { id: "cert_gov", icon: "🛡", label: "Gov Reg" },
                          { id: "cert_gi", icon: "🚜", label: "GI Tag" },
                          { id: "cert_iso", icon: "✅", label: "ISO" },
                        ].map(cert => (
                          <div key={cert.id} onClick={() => set(cert.id, !(form as any)[cert.id])}
                            style={{ padding: "14px 10px", borderRadius: "14px", border: `1.5px solid ${(form as any)[cert.id] ? "#16A34A" : "#DCFCE7"}`, background: (form as any)[cert.id] ? "#F0FDF4" : "#ffffff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "20px", marginBottom: "4px" }}>{cert.icon}</span>
                            <span style={{ fontSize: "11px", fontWeight: 850, color: (form as any)[cert.id] ? "#16A34A" : "#64748B" }}>{cert.label}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ background: "#F8FFF8", border: "1.5px solid #DCFCE7", borderRadius: "16px", padding: "18px" }}>
                        <h4 style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A", margin: "0 0 10px" }}>Review Draft Submission Details</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", fontSize: "12px" }}>
                          {[
                            ["Crop Name", form.title || "Not defined"],
                            ["Category", form.category],
                            ["Farmer Price", `₹${form.farmer_price} / ${form.unit_type}`],
                            ["Available Stock", `${form.quantity_available} ${form.unit_type}`],
                            ["Origin Location", form.location],
                            ["Traceability Ledger Code", form.traceability_code || "N/A"],
                          ].map(([lbl, val]) => (
                            <div key={lbl} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "6px" }}>
                              <span style={{ color: "#94A3B8", fontWeight: 600 }}>{lbl}:</span>
                              <span style={{ color: "#0F172A", fontWeight: 800 }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {errors.submit && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", borderRadius: "12px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", fontSize: "12px", color: "#DC2626", fontWeight: 650 }}>
                          <ShieldAlert style={{ width: "15px", height: "15px" }} />
                          {errors.submit}
                        </div>
                      )}
                    </>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Bottom Sticky Action Buttons */}
              <div style={{ borderTop: "1.5px solid #F1F5F9", marginTop: "24px", paddingTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 700 }}>Step {step} of 8 — {STEPS[step - 1].label}</span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" onClick={onClose} className="wizard-btn-red" style={{ height: "46px", padding: "0 20px" }}>Cancel</button>
                  <button type="button" onClick={handlePublish} className="wizard-btn-blue" style={{ height: "46px", padding: "0 20px" }}>Save Draft</button>
                  {canGoPrev && (
                    <button type="button" onClick={handlePrev} className="wizard-btn-white" style={{ height: "46px", padding: "0 20px" }}>Back</button>
                  )}
                  {step < 8 ? (
                    <button type="button" onClick={handleNext} className="wizard-btn-gradient" style={{ height: "46px", padding: "0 24px" }}>
                      Next <ArrowRight style={{ width: "14px", height: "14px", marginLeft: "4px" }} />
                    </button>
                  ) : (
                    <button type="button" onClick={handlePublish} disabled={loading} className="wizard-btn-gradient" style={{ height: "46px", padding: "0 28px" }}>
                      {loading ? "Publishing Crop..." : "Publish Crop Listing"}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT: Sticky Summary & Marketplace Card Preview ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "20px" }}>
            
            {/* Live Card Preview */}
            <div className="wizard-card" style={cardStyle}>
              <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Activity style={{ width: "14px", height: "14px", color: "#16A34A" }} />Live Marketplace Preview
              </h3>

              <div style={{ background: "#ffffff", border: "1.5px solid #DCFCE7", borderRadius: "18px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <div style={{ height: "160px", background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {form.image_url ? (
                    <img src={form.image_url} alt={form.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <ImageIcon style={{ width: "24px", height: "24px", color: "#10B981", opacity: 0.3 }} />
                      <span style={{ fontSize: "11px", color: "#94A3B8" }}>No image uploaded</span>
                    </div>
                  )}

                  {/* Badges overlay */}
                  <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "9px", fontWeight: 800, background: "#0F172A", color: "#ffffff" }}>GRADE {form.ai_quality_grade}</span>
                    {form.is_organic && (
                      <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "9px", fontWeight: 805, background: "#16A34A", color: "#ffffff" }}>🌿 Organic</span>
                    )}
                  </div>
                  <div style={{ position: "absolute", top: "8px", right: "8px", width: "26px", height: "26px", borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Heart style={{ width: "13px", height: "13px", color: "#CBD5E1", fill: "#CBD5E1" }} />
                  </div>
                </div>

                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>{form.category}</span>
                    <h4 style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 800, color: "#0F172A", lineHeight: 1.3 }}>{form.title || "Your Crop Name"}</h4>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid #F1F5F9", paddingTop: "8px" }}>
                    <div>
                      <span style={{ fontSize: "9px", color: "#94A3B8", display: "block" }}>Price</span>
                      <span style={{ fontSize: "16px", fontWeight: 900, color: "#16A34A" }}>₹{form.farmer_price} <span style={{ fontSize: "11px", color: "#CBD5E1", fontWeight: 400 }}>/{form.unit_type}</span></span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "9px", color: "#94A3B8", display: "block" }}>Stock</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>{form.quantity_available} {form.unit_type}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #F1F5F9", paddingTop: "8px", fontSize: "10px", color: "#94A3B8" }}>
                    <span>Origin: {form.location}</span>
                    <span style={{ color: "#16A34A", fontWeight: 750 }}>Verified ✓</span>
                  </div>
                </div>
              </div>

              {/* Sidebar detail rows */}
              <div style={{ marginTop: "16px", borderTop: "1.5px solid #F1F5F9", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px", color: "#94A3B8" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Expected Shelf Life:</span><span style={{ color: "#0F172A", fontWeight: 700 }}>{form.shelf_life_days} Days</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Storage Temperature:</span><span style={{ color: "#0F172A", fontWeight: 700 }}>{form.storage_temp}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Traceability code:</span><span style={{ color: "#16A34A", fontWeight: 700, fontFamily: "monospace" }}>{form.traceability_code}</span></div>
              </div>
            </div>

            {/* AI Diagnostics Summary card */}
            <div className="wizard-card" style={{ ...cardStyle, background: "linear-gradient(135deg, #F9F5FF, #ffffff)" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#7C3AED", margin: "0 0 12px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                🤖 AI Diagnostics Score
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  ["Quality", `Grade ${form.ai_quality_grade}`, "#7C3AED"],
                  ["Freshness", `${form.ai_freshness_score}%`, "#16A34A"],
                  ["Confidence", `${form.ai_confidence_score}%`, "#7C3AED"],
                  ["Market Demand", form.ai_market_demand, "#2563EB"],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ background: "#ffffff", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                    <span style={{ fontSize: "9px", color: "#94A3B8", fontWeight: 750, display: "block" }}>{label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 900, color, display: "block", marginTop: "3px" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
