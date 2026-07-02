"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  X,
  Leaf,
  Shield,
  Calendar,
  Thermometer,
  CloudRain,
  MapPin,
  TrendingUp,
  Award,
  QrCode,
  Globe,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface Crop {
  id: string;
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
  is_verified?: boolean;
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
}

interface CropPassportModalProps {
  crop: Crop;
  onClose: () => void;
}

export default function CropPassportModal({ crop, onClose }: CropPassportModalProps) {
  // Traceability steps
  const steps = [
    { label: "Sowing & Growth", date: crop.production_date || "2026-04-01", desc: "Monitored organic sowing under sustainable guidelines." },
    { label: "Harvesting", date: crop.harvest_date || "2026-05-20", desc: "Harvested at peak maturity, cleaning & sorting completed." },
    { label: "AI Quality Grading", date: crop.harvest_date || "2026-05-20", desc: `Graded AI ${crop.ai_quality_grade || "A"} with ${crop.ai_confidence_score || 95}% confidence.` },
    { label: "Listing on AgriNex", date: crop.supply_start_date || "2026-06-01", desc: "Listed for public bidding with transparency ledger." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel w-full max-w-4xl rounded-3xl overflow-hidden bg-[#0d1426]/90 border-white/10 flex flex-col md:flex-row max-h-[90vh] shadow-2xl"
      >
        {/* Left Column: Image & Basic Tags */}
        <div className="md:w-2/5 relative bg-slate-900 border-r border-white/5 flex flex-col">
          {crop.image_url ? (
            <img
              src={crop.image_url}
              alt={crop.title}
              className="w-full h-64 md:h-full object-cover"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-700">
              No Crop Image
            </div>
          )}

          {/* Overlays */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {crop.is_organic && (
              <span className="bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Leaf className="w-3.5 h-3.5 fill-black" />
                Certified Organic
              </span>
            )}
            <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded-full shadow-md">
              TRACE CODE: {crop.traceability_code || "AGX-2026-GEN-00"}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1">
              <QrCode className="w-4 h-4 text-emerald-400" />
              Digital Ledger QR Passport
            </h4>
            <div className="flex gap-3 items-center">
              <div className="bg-white p-1 rounded-lg shrink-0">
                {/* Simulated QR Code */}
                <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-emerald-400">
                  <QrCode className="w-12 h-12" />
                </div>
              </div>
              <div className="min-w-0 font-mono text-[10px] text-slate-300">
                <p>Origin: {crop.location}</p>
                <p className="truncate">Lat: {crop.gps_lat || 29.685}</p>
                <p className="truncate">Lng: {crop.gps_lng || 76.990}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Passport Info */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider">
                  Digital Crop Passport
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-1 flex items-center gap-2">
                  {crop.title}
                  {crop.is_verified && <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-black" />}
                </h2>
                {crop.scientific_name && (
                  <p className="text-xs text-slate-400 italic mt-0.5">{crop.scientific_name}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 mt-4 leading-relaxed">{crop.description}</p>

            {/* Key Grid Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 font-mono">STOCK QUANTITY</p>
                <p className="text-sm font-bold text-white mt-1">
                  {crop.quantity_available} {crop.unit_type}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 font-mono">EXPECTED SHELF LIFE</p>
                <p className="text-sm font-bold text-white mt-1">
                  {crop.shelf_life_days || 14} Days
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 font-mono">AI STABILITY GRADE</p>
                <span className="inline-block mt-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                  Grade {crop.ai_quality_grade || "A+"}
                </span>
              </div>
            </div>

            {/* AI Diagnostics Assessment */}
            <div className="mt-6 border-t border-white/5 pt-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-400" />
                AI Crop Health Diagnostics (Gemini Vision)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Freshness Integrity</span>
                    <span className="text-emerald-400">{crop.ai_freshness_score || 95}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${crop.ai_freshness_score || 95}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">AI Confidence Index</span>
                    <span className="text-purple-400">{crop.ai_confidence_score || 96}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${crop.ai_confidence_score || 96}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Pathological/Disease Index</span>
                    <span className="text-red-400">{crop.ai_disease_score || 0}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${crop.ai_disease_score || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Pest Infestation Score</span>
                    <span className="text-amber-400">{crop.ai_pest_score || 0}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${crop.ai_pest_score || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Guidelines */}
            <div className="mt-6 border-t border-white/5 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                  TEMPERATURE RECOMMENDATION
                </h4>
                <p className="text-xs text-white mt-1 font-mono">{crop.storage_temp || "8–12°C"}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                  STORAGE ENVIRONMENT
                </h4>
                <p className="text-xs text-white mt-1 leading-relaxed">
                  {crop.storage_condition || "Controlled humidity and cool dry logistics pipeline."}
                </p>
              </div>
            </div>

            {/* Traceability Timeline */}
            <div className="mt-6 border-t border-white/5 pt-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                Ledger Traceability Timeline
              </h3>
              <div className="relative border-l border-white/10 pl-4 ml-2 space-y-4">
                {steps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-4 border-[#0d1426]" />
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white font-bold">{step.label}</span>
                      <span className="text-slate-500">{step.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates Tags */}
            {crop.certificates && crop.certificates.length > 0 && (
              <div className="mt-6 border-t border-white/5 pt-6">
                <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  AGRICULTURAL CREDENTIALS
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {crop.certificates.map((cert) => (
                    <span key={cert} className="bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
