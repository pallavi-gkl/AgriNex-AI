"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview LocationHeader
 * A slim, premium strip shown at the very top of every page's main content area.
 * Displays the user's saved city/village name, current temperature, and weather
 * condition drawn from LocationWeatherContext.
 *
 * Clicking "Set Location" or "Change Location" opens the location-picker modal.
 */

import React from "react";
import { MapPin } from "lucide-react";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import { motion } from "framer-motion";

interface LocationHeaderProps {
  /** "farmer" uses emerald accents; "consumer" uses cyan accents */
  platform?: "farmer" | "consumer";
}

export default function LocationHeader({ platform = "farmer" }: LocationHeaderProps) {
  const { t } = useTranslation();
  const { location, weather, loading, setModalOpen } = useLocationWeather();

  /* ─── Skeleton while first fetch ─── */
  if (loading && !location) {
    return (
      <div className="mb-4 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 animate-pulse">
        <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0" />
        <div className="h-3 w-28 rounded bg-slate-200" />
        <div className="h-3 w-20 rounded bg-slate-200 ml-2" />
      </div>
    );
  }

  /* ─── No location yet — prompt strip with message pointing to sidebar ─── */
  if (!location) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/50 relative z-20 text-left"
      >
        <div className="flex items-center gap-2 text-emerald-800">
          <MapPin className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse" />
          <span className="text-sm font-bold">{t("locationNotSet")}</span>
          <span className="text-xs text-emerald-600 hidden sm:inline">
            — Set your location in the left sidebar for personalized weather, market prices &amp; AI recommendations
          </span>
        </div>
      </motion.div>
    );
  }

  /* ─── Location is set — show details strip ─── */
  const cityDisplay = location.city || "Your Location";
  const stateDisplay = location.state ? `, ${location.state}` : "";
  const tempDisplay = weather?.temperature !== undefined ? `${weather.temperature}°C` : "--°C";
  const condIcon = weather?.condition_icon || "🌤";
  const condText = weather?.condition || "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3 relative z-20"
    >
      {/* Left: city + weather */}
      <div className="flex flex-col gap-0.5 text-left">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
          <span>📍</span>
          <span>{cityDisplay}{stateDisplay}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <span>{condIcon}</span>
          <span>{tempDisplay} | {condText}</span>
        </div>
      </div>
    </motion.div>
  );
}