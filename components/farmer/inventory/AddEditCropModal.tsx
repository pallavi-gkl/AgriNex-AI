"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
}

export default function AddEditCropModal({ crop, onClose, onSave }: AddEditCropModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "ai" | "media" | "certs">("basic");
  const [loading, setLoading] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);

  // Form State
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
    traceability_code: crop?.traceability_code || `AGX-2026-REG-${Math.floor(100 + Math.random() * 900)}`,

    image_url: crop?.image_url || "",
    certificates: crop?.certificates || ["FSSAI Certified"],
  });

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
    // Simulate AI grading vision trigger
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
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden bg-[#0d1426]/95 border-white/10 flex flex-col max-h-[90vh] shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            {crop ? "Edit Crop Listing" : "Add New Crop Listing"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 px-6 gap-4 overflow-x-auto shrink-0 bg-white/[0.01]">
          {(["basic", "pricing", "ai", "media", "certs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 border-b-2 text-xs font-mono tracking-wider uppercase transition-colors shrink-0",
                activeTab === tab
                  ? "border-emerald-500 text-emerald-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-white"
              )}
            >
              {tab} Info
            </button>
          ))}
        </div>

        {/* Form Body Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Crop Name *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Alphonso Mangoes"
                    className="glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Scientific Name</label>
                  <input
                    type="text"
                    name="scientific_name"
                    value={form.scientific_name}
                    onChange={handleChange}
                    placeholder="e.g. Mangifera indica"
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="glass-input"
                  >
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Spices & Herbs">Spices & Herbs</option>
                    <option value="Leafy Vegetables">Leafy Vegetables</option>
                    <option value="Pulses & Legumes">Pulses & Legumes</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Traceability Origin</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Product Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your crop's quality, cultivation method, packaging..."
                  className="glass-input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Production Date</label>
                  <input
                    type="date"
                    name="production_date"
                    value={form.production_date}
                    onChange={handleChange}
                    className="glass-input font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Harvest Date</label>
                  <input
                    type="date"
                    name="harvest_date"
                    value={form.harvest_date}
                    onChange={handleChange}
                    className="glass-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Supply Start Date</label>
                  <input
                    type="date"
                    name="supply_start_date"
                    value={form.supply_start_date}
                    onChange={handleChange}
                    className="glass-input font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Supply End Date</label>
                  <input
                    type="date"
                    name="supply_end_date"
                    value={form.supply_end_date}
                    onChange={handleChange}
                    className="glass-input font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <input
                  type="checkbox"
                  id="is_organic"
                  name="is_organic"
                  checked={form.is_organic}
                  onChange={handleCheckbox}
                  className="w-4 h-4 rounded border-white/15 bg-white/5 accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="is_organic" className="text-xs text-slate-300 cursor-pointer">
                  Practiced 100% Certified Organic cultivation (No chemical fertilizers/pesticides)
                </label>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Farmer Price per Unit *</label>
                  <input
                    type="number"
                    name="farmer_price"
                    required
                    value={form.farmer_price || ""}
                    onChange={handleChange}
                    placeholder="₹ price per unit"
                    className="glass-input font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Unit Type</label>
                  <select
                    name="unit_type"
                    value={form.unit_type}
                    onChange={handleChange}
                    className="glass-input"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Ton">Ton</option>
                    <option value="Bag">Bag (50 Kg)</option>
                    <option value="Box">Box</option>
                    <option value="Crate">Crate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Quantity Available *</label>
                  <input
                    type="number"
                    name="quantity_available"
                    required
                    value={form.quantity_available || ""}
                    onChange={handleChange}
                    className="glass-input font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Listing Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="glass-input"
                  >
                    <option value="available">Available (Live)</option>
                    <option value="reserved">Reserved (Bidded)</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Shelf Life (Days)</label>
                  <input
                    type="number"
                    name="shelf_life_days"
                    value={form.shelf_life_days}
                    onChange={handleChange}
                    className="glass-input font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Storage Temperature Recommendation</label>
                  <input
                    type="text"
                    name="storage_temp"
                    value={form.storage_temp}
                    onChange={handleChange}
                    placeholder="e.g. 10-15°C"
                    className="glass-input font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Storage Condition recommendation</label>
                <textarea
                  name="storage_condition"
                  value={form.storage_condition}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Cool, dry place, away from sunlight"
                  className="glass-input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">GPS Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="gps_lat"
                    value={form.gps_lat}
                    onChange={handleChange}
                    className="glass-input font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">GPS Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="gps_lng"
                    value={form.gps_lng}
                    onChange={handleChange}
                    className="glass-input font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="bg-purple-950/30 border border-purple-500/20 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-white">AI Crop Quality Analytics Engine</h4>
                  <p className="text-slate-400 mt-1">
                    AgriNex integrates Gemini Vision models to automatically analyze freshness, disease metrics, and verify grade criteria based on uploaded crop parameters.
                  </p>
                  <button
                    type="button"
                    onClick={runAiEngine}
                    disabled={aiRunning}
                    className="mt-3 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-mono font-bold hover:from-purple-600 hover:to-indigo-600 transition"
                  >
                    {aiRunning ? "AI Diagnostic Running..." : "Run AI Diagnostics Now"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">AI Certified Grade</label>
                  <select
                    name="ai_quality_grade"
                    value={form.ai_quality_grade}
                    onChange={handleChange}
                    className="glass-input font-mono"
                  >
                    <option value="A+">Grade A+</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Ledger Traceability Code</label>
                  <input
                    type="text"
                    name="traceability_code"
                    readOnly
                    value={form.traceability_code}
                    className="glass-input font-mono bg-white/5 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Freshness Score ({form.ai_freshness_score}%)</label>
                  <input
                    type="range"
                    name="ai_freshness_score"
                    min="0"
                    max="100"
                    value={form.ai_freshness_score}
                    onChange={handleChange}
                    className="w-full mt-2 accent-emerald-500 bg-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">AI Confidence index ({form.ai_confidence_score}%)</label>
                  <input
                    type="range"
                    name="ai_confidence_score"
                    min="0"
                    max="100"
                    value={form.ai_confidence_score}
                    onChange={handleChange}
                    className="w-full mt-2 accent-purple-500 bg-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Disease Risk index ({form.ai_disease_score}%)</label>
                  <input
                    type="range"
                    name="ai_disease_score"
                    min="0"
                    max="100"
                    value={form.ai_disease_score}
                    onChange={handleChange}
                    className="w-full mt-2 accent-red-500 bg-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Pest Infestation Index ({form.ai_pest_score}%)</label>
                  <input
                    type="range"
                    name="ai_pest_score"
                    min="0"
                    max="100"
                    value={form.ai_pest_score}
                    onChange={handleChange}
                    className="w-full mt-2 accent-amber-500 bg-white/10"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Primary Image URL</label>
                <input
                  type="text"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="glass-input"
                />
              </div>

              <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-xs text-slate-500 bg-white/[0.01]">
                <p>Support drag-and-drop or batch media attachments</p>
                <p className="mt-1">JPEG, PNG, MP4 up to 50MB (Automatically encrypted on IPFS)</p>
              </div>
            </div>
          )}

          {activeTab === "certs" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Active Quality Credentials (Comma separated)</label>
                <input
                  type="text"
                  name="certificates_raw"
                  value={form.certificates.join(", ")}
                  onChange={(e) => {
                    const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    setForm((prev) => ({ ...prev, certificates: arr }));
                  }}
                  className="glass-input font-mono"
                />
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-400">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Compliance Verification
                </h5>
                <p className="mt-1">
                  Certifications are automatically cataloged onto the public Digital Crop Passport ledger, boosting trust indicators by up to 40% in search rankings.
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/[0.01] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-slate-300 bg-white/5 hover:bg-white/10 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black text-xs font-bold transition"
          >
            {loading ? "Saving changes..." : crop ? "Update Crop" : "List New Crop"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
