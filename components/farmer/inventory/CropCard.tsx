"use client";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import {
  Leaf,
  MapPin,
  Edit,
  Copy,
  Archive,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
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
  onEdit,
  onViewPassport,
  onDuplicate,
  onArchive,
  onDelete,
}: CropCardProps) {
  const { t } = useTranslation("farmer");
  const isLowStock = crop.quantity_available < 100 && crop.quantity_available > 0;
  const isOutOfStock = crop.quantity_available === 0 || crop.status === "out_of_stock";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return { text: "In Stock", bg: "#E8F5E9", color: "#2E7D32", border: "#DCEFD9" };
      case "reserved":
        return { text: "Reserved", bg: "#FFF9C4", color: "#F57F17", border: "#FFF59D" };
      case "out_of_stock":
      default:
        return { text: "Out of Stock", bg: "#FFEBEE", color: "#C62828", border: "#FFCDD2" };
    }
  };

  const getGradeBadge = (grade: string) => {
    if (grade.startsWith("A")) return { bg: "#E8F5E9", color: "#2E7D32", border: "#DCEFD9" };
    if (grade.startsWith("B")) return { bg: "#E3F2FD", color: "#1565C0", border: "#BBDEFB" };
    return { bg: "#FFF3E0", color: "#EF6C00", border: "#FFE0B2" };
  };

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(crop.farmer_price);

  const statusInfo = getStatusBadge(crop.status);

  return (
    <div
      className={cn(
        "transition-all duration-300 group",
        !crop.is_active && "opacity-60"
      )}
      style={{
        background: "#FFFFFF",
        border: "1px solid #DCEFD9",
        borderRadius: "18px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: "0 4px 12px rgba(46, 125, 50, 0.03)",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 20px rgba(46, 125, 50, 0.08)";
        e.currentTarget.style.borderColor = "#2E7D32";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(46, 125, 50, 0.03)";
        e.currentTarget.style.borderColor = "#DCEFD9";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* 1. Medium Image (fixed height, zoom on hover) */}
      <div 
        style={{
          height: "140px",
          width: "100%",
          background: "#F7FCF7",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={() => onViewPassport(crop)}
      >
        {crop.image_url ? (
          <img
            src={crop.image_url}
            alt={crop.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
            className="group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div 
            style={{
              width: "100%",
              height: "100%",
              background: "#E8F5E9",
              color: "#2E7D32",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            No Image
          </div>
        )}
      </div>

      {/* Main body content with compact layout */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        
        {/* 2. Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {crop.is_organic && (
            <span style={{
              fontSize: "9px", fontWeight: 700, color: "#2E7D32",
              background: "#E8F5E9", border: "1px solid #DCEFD9",
              padding: "1px 6px", borderRadius: "99px",
              display: "flex", alignItems: "center", gap: "2px"
            }}>
              <Leaf style={{ width: "9px", height: "9px", fill: "#2E7D32" }} />
              Organic
            </span>
          )}
          {crop.ai_quality_grade && (
            <span style={{
              fontSize: "9px", fontWeight: 700,
              background: getGradeBadge(crop.ai_quality_grade).bg,
              color: getGradeBadge(crop.ai_quality_grade).color,
              border: `1px solid ${getGradeBadge(crop.ai_quality_grade).border}`,
              padding: "1px 6px", borderRadius: "99px"
            }}>
              Grade {crop.ai_quality_grade}
            </span>
          )}
          <span style={{
            fontSize: "9px", fontWeight: 700,
            background: statusInfo.bg, color: statusInfo.color,
            border: `1px solid ${statusInfo.border}`,
            padding: "1px 6px", borderRadius: "99px"
          }}>
            {statusInfo.text}
          </span>
        </div>

        {/* 3. Crop Name & Scientific Name */}
        <div style={{ minWidth: 0 }}>
          <h3 
            style={{
              fontSize: "16px", fontWeight: 700, color: "#1F2937",
              lineHeight: 1.2, margin: 0, cursor: "pointer",
              transition: "color 0.15s ease"
            }} 
            className="group-hover:text-[#2E7D32]"
            onClick={() => onViewPassport(crop)}
          >
            {crop.title}
          </h3>
          {crop.scientific_name && (
            <p style={{ fontSize: "11px", color: "#9CA3AF", fontStyle: "italic", margin: "2px 0 0" }}>
              {crop.scientific_name}
            </p>
          )}
        </div>

        {/* 4. Pricing (Farmer Price & AI Rec Price Comparison) */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          padding: "10px 12px",
          background: "#F7FCF7",
          border: "1px solid #DCEFD9",
          borderRadius: "10px",
          fontFamily: "monospace",
          fontSize: "11px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#2E7D32", fontWeight: 700 }}>
            <span style={{ fontFamily: "sans-serif", fontWeight: 600 }}>Farmer Price:</span>
            <span>{formattedPrice}</span>
          </div>
          {crop.ai_recommended_price && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#1565C0", fontWeight: 700 }}>
              <span style={{ fontFamily: "sans-serif", fontWeight: 600 }}>AI Rec:</span>
              <span>₹{crop.ai_recommended_price}</span>
            </div>
          )}
        </div>

        {/* 5. Inventory & Stock progress bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "monospace" }}>
            <span style={{ color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", fontSize: "9px" }}>Stock</span>
            <span style={{ fontWeight: 700, color: isOutOfStock ? "#C62828" : isLowStock ? "#F57F17" : "#1F2937" }}>
              {crop.quantity_available} {crop.unit_type}
            </span>
          </div>
          <div style={{ height: "4px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "99px", transition: "width 0.4s ease",
              width: isOutOfStock ? "0%" : isLowStock ? "25%" : "75%",
              background: isOutOfStock ? "#C62828" : isLowStock ? "#F57F17" : "#2E7D32",
            }} />
          </div>
        </div>

        {/* 6. Freshness progress bar */}
        {crop.ai_freshness_score !== undefined && (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "#4B5563" }}>
              <span>Freshness</span>
              <span>{crop.ai_freshness_score}%</span>
            </div>
            <div style={{ height: "4px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${crop.ai_freshness_score}%`, background: "#2E7D32", borderRadius: "99px" }} />
            </div>
          </div>
        )}

        {/* 7. Location & Action buttons */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "10px", borderTop: "1px solid #F3F4F6", marginTop: "auto"
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
            <MapPin style={{ width: "12px", height: "12px", color: "#9CA3AF" }} />
            {crop.location}
          </span>

          <div style={{ display: "flex", gap: "3px", padding: "1px", background: "#F7FCF7", border: "1px solid #DCEFD9", borderRadius: "6px" }}>
            {[
              { onClick: () => onViewPassport(crop), title: "View", icon: Eye, color: "#2E7D32", hoverBg: "#E8F5E9" },
              { onClick: () => onEdit(crop), title: "Edit", icon: Edit, color: "#1565C0", hoverBg: "#E3F2FD" },
              { onClick: () => onDuplicate(crop.id), title: "Duplicate", icon: Copy, color: "#7C3AED", hoverBg: "#F3E8FF" },
              { onClick: () => onArchive(crop.id), title: "Deactivate", icon: Archive, color: "#4B5563", hoverBg: "#E5E7EB" },
              { onClick: () => onDelete(crop.id), title: "Delete", icon: Trash2, color: "#C62828", hoverBg: "#FFEBEE" }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                title={btn.title}
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "transparent",
                  color: "#64748B",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = btn.hoverBg;
                  e.currentTarget.style.color = btn.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                }}
              >
                <btn.icon style={{ width: "13px", height: "13px" }} />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}