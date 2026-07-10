"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React from "react";
import Image from "next/image";
import {
  Leaf,
  Tag,
  Star,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Copy,
  Archive,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  shelf_life_days?: number;
  is_organic?: boolean;
  status: "available" | "reserved" | "out_of_stock";
  farmer_price: number;
  ai_recommended_price?: number | null;
  market_price?: number;
  market_trend?: "up" | "down" | "stable";
  ai_quality_grade?: string;
  ai_confidence_score?: number;
  ai_freshness_score?: number;
  ai_disease_score?: number;
  ai_pest_score?: number;
  rating?: number;
  reviews_count?: number;
  is_verified?: boolean;
  location?: string;
  image_url?: string | null;
  is_active: boolean;
  traceability_code?: string | null;
}

interface CropCardProps {
  crop: Crop;
  view: "grid" | "list";
  onEdit: (crop: Crop) => void;
  onViewPassport: (crop: Crop) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CropCard({
  crop,
  view,
  onEdit,
  onViewPassport,
  onDuplicate,
  onArchive,
  onDelete,
}: CropCardProps) {
  const { t } = useTranslation("farmer");
  const isLowStock = crop.quantity_available < 100 && crop.quantity_available > 0;
  const isOutOfStock = crop.quantity_available === 0 || crop.status === "out_of_stock";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "reserved":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "out_of_stock":
      default:
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  const getGradeColor = (grade: string) => {
  const { t } = useTranslation("farmer");
    if (grade.startsWith("A")) return "text-emerald-700 bg-emerald-50 border-emerald-250 border-emerald-200";
    if (grade.startsWith("B")) return "text-sky-700 bg-sky-50 border-sky-200";
    if (grade.startsWith("C")) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-red-750 text-red-700 bg-rose-50 border-rose-200";
  };

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(crop.farmer_price);

  if (view === "list") {
    return (
      <div
        className={cn(
          "premium-card rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4 transition-all duration-300 hover:border-emerald-300/50 hover:shadow-lg",
          !crop.is_active && "opacity-60"
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-full md:w-32 h-24 rounded-xl overflow-hidden bg-slate-50 border-slate-100 shrink-0">
          {crop.image_url ? (
            <img
              src={crop.image_url}
              alt={crop.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-50/20 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              No Image
            </div>
          )}
          {crop.is_organic && (
            <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
              <Leaf className="w-2.5 h-2.5 fill-white text-white" />
              ORG
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 w-full text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 truncate">{crop.title}</h3>
            {crop.scientific_name && (
              <span className="text-xs text-slate-500 font-semibold italic">({crop.scientific_name})</span>
            )}
            <span className={cn("text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold capitalize", getStatusColor(crop.status))}>
              {crop.status.replace("_", " ")}
            </span>
            {crop.ai_quality_grade && (
              <span className={cn("text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold", getGradeColor(crop.ai_quality_grade))}>
                {t("grade")} {crop.ai_quality_grade}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">{crop.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 font-mono">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Stock: <strong className="text-slate-800 font-extrabold">{crop.quantity_available} {crop.unit_type}</strong>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {crop.location}
            </span>
            {crop.rating && (
              <span className="flex items-center gap-1 text-slate-700">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {crop.rating} ({crop.reviews_count} reviews)
              </span>
            )}
          </div>
        </div>

        {/* Pricing Column */}
        <div className="text-right shrink-0 px-2 font-mono">
          <p className="text-lg font-bold text-emerald-600">{formattedPrice} <span className="text-xs text-slate-500 font-sans font-normal">/ {crop.unit_type}</span></p>
          {crop.ai_recommended_price && (
            <p className="text-[10px] text-purple-700 font-bold mt-0.5">AI Rec: ₹{crop.ai_recommended_price}</p>
          )}
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0">
          <button
            onClick={() => onViewPassport(crop)}
            title={t("digitalCropPassport")}
            className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition border-0 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(crop)}
            title="Edit Crop"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition border-0 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(crop.id)}
            title="Duplicate"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition border-0 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onArchive(crop.id)}
            title={crop.is_active ? "Deactivate" : "Activate"}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition border-0 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(crop.id)}
            title={t("delete")}
            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-red-600 transition border-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid View Card
  return (
    <div
      className={cn(
        "premium-card rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/50 hover:shadow-xl group",
        !crop.is_active && "opacity-60"
      )}
    >
      {/* Image Banner */}
      <div className="relative h-48 w-full bg-slate-50 overflow-hidden">
        {crop.image_url ? (
          <img
            src={crop.image_url}
            alt={crop.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50/20 text-emerald-700 text-sm font-bold uppercase tracking-wider">
            No Product Image
          </div>
        )}
        
        {/* Organic Tag */}
        {crop.is_organic && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <Leaf className="w-3 h-3 fill-white text-white" />
            {t("organic")}
          </div>
        )}

        {/* AI Grade Badge */}
        {crop.ai_quality_grade && (
          <div className={cn("absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-md font-mono", getGradeColor(crop.ai_quality_grade))}>
            {t("grade")} {crop.ai_quality_grade}
          </div>
        )}

        {/* Status Pill overlay at bottom */}
        <div className="absolute bottom-3 left-3">
          <span className={cn("text-[9px] px-2.5 py-0.5 rounded-full border font-mono font-bold uppercase tracking-wider bg-slate-800 text-white shadow-sm", getStatusColor(crop.status))}>
            {crop.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between text-left">
        <div>
          {/* Scientific name and titles */}
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 leading-tight group-hover:text-emerald-600 transition truncate">
              {crop.title}
            </h3>
            {crop.scientific_name && (
              <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">{crop.scientific_name}</p>
            )}
          </div>

          <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2 min-h-[32px]">{crop.description}</p>

          {/* Quantity & Stock Indicator */}
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t("inventoryStock")}</span>
              <span className={cn("font-bold", isLowStock ? "text-amber-600" : isOutOfStock ? "text-red-650 text-red-605" : "text-slate-800")}>
                {crop.quantity_available} {crop.unit_type}
              </span>
            </div>
            
            {/* Custom stock indicator bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isOutOfStock ? "w-0" : isLowStock ? "bg-amber-500 w-1/4" : "bg-emerald-500 w-3/4"
                )}
              />
            </div>

            {isLowStock && (
              <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold font-mono pt-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Low Stock Threshold Alert!
              </div>
            )}
          </div>

          {/* Pricing parameters */}
          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-550 text-slate-500">
              <span>{t("farmerPrice")}</span>
              <span className="font-bold text-emerald-600">{formattedPrice}</span>
            </div>
            {crop.ai_recommended_price && (
              <div className="flex justify-between items-center text-purple-700">
                <span className="flex items-center gap-1 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-purple-650" />
                  {t("aiRecommended")}
                </span>
                <span className="font-bold">₹{crop.ai_recommended_price}</span>
              </div>
            )}
            {crop.market_price && (
              <div className="flex justify-between items-center text-slate-550 text-slate-500">
                <span className="flex items-center gap-1">
                  Market mandis:
                </span>
                <span className="font-bold flex items-center gap-0.5 text-slate-800">
                  ₹{crop.market_price}
                  {crop.market_trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                  {crop.market_trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
                </span>
              </div>
            )}
          </div>

          {/* AI Scores Summary */}
          {(crop.ai_freshness_score || crop.ai_disease_score) && (
            <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono text-center">
              {crop.ai_freshness_score !== undefined && (
                <div className="bg-emerald-50 border-emerald-150 rounded p-1">
                  <p className="text-slate-450 text-slate-400 font-bold uppercase tracking-wider text-[8px]">{t("freshness")}</p>
                  <p className="font-bold text-emerald-600 text-xs mt-0.5">{crop.ai_freshness_score}%</p>
                </div>
              )}
              {crop.ai_disease_score !== undefined && (
                <div className="bg-rose-50 border-rose-150 rounded p-1">
                  <p className="text-slate-450 text-slate-400 font-bold uppercase tracking-wider text-[8px]">{t("disease")}</p>
                  <p className="font-bold text-red-600 text-xs mt-0.5">{crop.ai_disease_score}%</p>
                </div>
              )}
              {crop.ai_pest_score !== undefined && (
                <div className="bg-amber-50 border-amber-150 rounded p-1">
                  <p className="text-slate-450 text-slate-400 font-bold uppercase tracking-wider text-[8px]">Pests</p>
                  <p className="font-bold text-amber-700 text-xs mt-0.5">{crop.ai_pest_score}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-slate-400 text-xs font-semibold">
          <span className="flex items-center gap-1 truncate max-w-[120px] text-slate-500 font-bold">
            <MapPin className="w-3 h-3 text-slate-400" />
            {crop.location}
          </span>
          
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => onViewPassport(crop)}
              title={t("digitalCropPassport")}
              className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition bg-transparent border-0 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(crop)}
              title="Edit Crop"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition bg-transparent border-0 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDuplicate(crop.id)}
              title="Duplicate Listing"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition bg-transparent border-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onArchive(crop.id)}
              title={crop.is_active ? "Archive Listing" : "Unarchive Listing"}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition bg-transparent border-0 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(crop.id)}
              title="Delete Listing"
              className="p-1.5 rounded hover:bg-rose-50 text-red-650 transition bg-transparent border-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}