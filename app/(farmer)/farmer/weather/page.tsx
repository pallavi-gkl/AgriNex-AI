"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview AI Weather Intelligence — Premium redesign with glassmorphism and animations
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  RefreshCw,
  CloudRain,
  Sun,
  Cloud,
  CloudSnow,
  Zap,
  Navigation,
  Search,
  Sparkles,
  Waves,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocationWeather } from "@/context/LocationWeatherContext";

const FARM_ALERTS_TEMPLATES = [
  {
    type: "urgent",
    title: "Monsoon Precaution Advisory",
    desc: "Expected rainfall in the coming days could impact crop storage. Ensure field drainage channels are open and harvested produce is moved to dry storage.",
    action: "Enable field drainage system",
  },
  {
    type: "high",
    title: "Optimal Fertilizer Sowing Window",
    desc: "Current local humidity and soil moisture levels are highly suitable for active fertilizer application. Best applied before noon.",
    action: "Schedule fertilizer distribution",
  },
  {
    type: "medium",
    title: "Ambient Temperature Notice",
    desc: "Milder night temperatures are expected. Consider covering delicate vegetable crops and nursery beds.",
    action: "Prepare crop covers",
  },
];

function WeatherIcon({ type, size = "md" }: { type: string; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "w-16 h-16" : size === "sm" ? "w-5 h-5" : "w-8 h-8";
  switch (type) {
    case "rain": return <CloudRain className={cn(cls, "text-blue-500")} />;
    case "cloud": return <Cloud className={cn(cls, "text-slate-400")} />;
    case "snow": return <CloudSnow className={cn(cls, "text-cyan-400")} />;
    case "thunder": return <Zap className={cn(cls, "text-amber-500")} />;
    default: return <Sun className={cn(cls, "text-amber-500")} />;
  }
}

export default function AIWeatherPage() {
  const { t } = useTranslation("farmer");
  const { location, weather, loading, error, requestLocation, setManualLocation } = useLocationWeather();
  const [cityInput, setCityInput] = useState("");
  const [stateInput, setStateInput] = useState("");

  const handleManualSubmit = (e: React.FormEvent) => {
  const { t } = useTranslation("farmer");
    e.preventDefault();
    if (cityInput.trim()) {
      setManualLocation(cityInput, stateInput);
    }
  };

  // Generate hourly forecast dynamically relative to real temperature
  const temp = weather?.temperature ?? 32;
  const condition = weather?.condition ?? "Partly Cloudy";
  const codeType = weather?.codeType ?? "cloud";

  const hourlyForecast = [
    { time: "06:00", temp: Math.round(temp - 4), icon: "sun", desc: "Clear Morning" },
    { time: "09:00", temp: Math.round(temp - 1), icon: "sun", desc: "Sunny" },
    { time: "12:00", temp: Math.round(temp + 2), icon: codeType, desc: condition },
    { time: "15:00", temp: Math.round(temp + 3), icon: codeType, desc: "Warm" },
    { time: "18:00", temp: Math.round(temp), icon: "rain", desc: "Overcast" },
    { time: "21:00", temp: Math.round(temp - 3), icon: "cloud", desc: "Cloudy" },
    { time: "00:00", temp: Math.round(temp - 6), icon: "sun", desc: "Clear Night" },
  ];

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 border border-sky-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30">
              <CloudSun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {t("aiWeatherIntelligence")}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {t("hyperlocalFarmWeatherAnalytics")}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-slate-700">Real-time Data</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <Waves className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">Monsoon Tracking</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-amber-200 shadow-sm">
              <Gauge className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-slate-700">{t("soilMoisture")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Denied / Initial setup State */}
      {location?.permissionStatus === "denied" && !weather && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card rounded-3xl p-8 shadow-sm space-y-6 text-center max-w-xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-3">
            <h3 className="text-slate-800 font-bold text-lg">Location Access Required</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t("agrinexRequiresGpsCoordinatesT1")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={requestLocation}
              className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {t("enableGps")}
            </button>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-4">Or Select Location Manually</p>
            <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="City Name (e.g. Pune, Indore)"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="glass-input rounded-xl px-4 py-3 text-sm flex-1"
                required
              />
              <input
                type="text"
                placeholder="State (Optional)"
                value={stateInput}
                onChange={(e) => setStateInput(e.target.value)}
                className="glass-input rounded-xl px-4 py-3 text-sm w-full sm:w-32"
              />
              <button
                type="submit"
                className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold"
              >
                {t("search")}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Main Weather UI */}
      {(weather && location) ? (
        <>
          {/* Current Weather Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-blue-50 to-emerald-100 border border-sky-200 p-8 shadow-lg"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-xl">
                  <WeatherIcon type={weather.codeType} size="lg" />
                </div>
                <div>
                  <p className="text-7xl font-extrabold text-slate-800 tracking-tight">{weather.temperature}°C</p>
                  <p className="text-slate-600 text-lg mt-2 font-semibold">{weather.condition}</p>
                  <p className="text-slate-500 text-sm mt-1">{location.city}, {location.state}</p>
                  <p className="text-slate-400 text-xs mt-2 font-semibold">
                    {t("feelsLike")} {weather.feels_like}°C · Humidity {weather.humidity}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                {[
                  { icon: Droplets, label: "Humidity", value: `${weather.humidity}%`, color: "from-blue-500 to-cyan-600", bg: "from-blue-50 to-cyan-100" },
                  { icon: Wind, label: "Wind", value: `${weather.wind_speed} km/h`, color: "from-emerald-500 to-teal-600", bg: "from-emerald-50 to-teal-100" },
                  { icon: Sun, label: "UV Index", value: `${weather.uv_index}`, color: "from-amber-500 to-orange-600", bg: "from-amber-50 to-orange-100" },
                  { icon: CloudRain, label: "Rain Chance", value: `${weather.forecast?.[0]?.rain_chance ?? 20}%`, color: "from-sky-500 to-blue-600", bg: "from-sky-50 to-blue-100" },
                ].map((item, idx) => (
                  <div key={idx} className={cn(
                    "bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                  )}>
                    <div className={cn("w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br", item.bg)}>
                      <item.icon className={cn("w-5 h-5 bg-gradient-to-br", item.color, "text-transparent bg-clip-text")} />
                    </div>
                    <p className="text-slate-800 font-bold text-lg">{item.value}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick switcher inline link */}
            <div className="mt-6 pt-6 border-t border-sky-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <span className="text-xs text-slate-500 font-semibold">
                <span className="text-emerald-600 font-bold">{t("gpsActive")}</span> {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
              </span>
              <form onSubmit={handleManualSubmit} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Change city..."
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="glass-input rounded-xl px-4 py-2 text-sm w-full sm:w-40"
                />
                <button type="submit" className="p-2 rounded-xl premium-card hover:bg-slate-50 text-slate-600 transition shadow-sm">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Hourly Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card rounded-3xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-6">{t("str_24HourForecast")}</h2>
            <div className="grid grid-cols-7 gap-3 overflow-x-auto">
              {hourlyForecast.map((h, idx) => (
                <div key={idx} className="group flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl hover:border-sky-300 hover:shadow-md transition-all min-w-[90px]">
                  <p className="text-xs text-slate-400 font-semibold">{h.time}</p>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <WeatherIcon type={h.icon} size="sm" />
                  </div>
                  <p className="text-lg font-bold text-slate-800">{h.temp}°</p>
                  <p className="text-xs text-slate-500 font-semibold truncate w-full text-center">{h.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Forecast + Farm Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7-day forecast */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="premium-card rounded-3xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-4">{t("forecastDays")}</h2>
              <div className="space-y-3">
                {(weather.forecast || []).map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl hover:border-sky-200 transition">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
                        <WeatherIcon type={day.icon === "sun" ? "sun" : day.icon === "rain" ? "rain" : day.icon === "snow" ? "snow" : day.icon === "thunder" ? "thunder" : "cloud"} size="sm" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{day.day}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{day.rain_chance}% Rain</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-amber-600 font-bold">{day.high}°</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-400 font-semibold">{day.low}°</span>
                    </div>
                    <span className="text-xs text-slate-400 w-28 text-right truncate font-semibold">{day.condition}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Farm Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="premium-card rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {t("agroclimateAlerts")}
                </h2>
                <p className="text-slate-500 text-sm mt-1">{t("aiGeneratedWeatherBasedAdvisor")}</p>
              </div>
              {FARM_ALERTS_TEMPLATES.map((alert, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-2xl border space-y-3 transition-all hover:shadow-md",
                    alert.type === "urgent"
                      ? "border-rose-200 bg-gradient-to-br from-rose-50 to-red-50"
                      : alert.type === "high"
                      ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
                      : "border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2 py-1 rounded-lg border",
                      alert.type === "urgent" ? "text-rose-700 border-rose-300 bg-rose-100"
                      : alert.type === "high" ? "text-amber-700 border-amber-300 bg-amber-100"
                      : "text-blue-700 border-blue-300 bg-blue-100"
                    )}>
                      {alert.type.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">{alert.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{alert.desc}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <Zap className="w-4 h-4" />
                    Action: {alert.action}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Soil Moisture & Irrigation indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="premium-card rounded-3xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-6">Soil Moisture & Irrigation Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { field: "North Field (Rice)", moisture: 78, status: "Optimal", color: "emerald", gradient: "from-emerald-500 to-teal-600" },
                { field: "South Field (Turmeric)", moisture: 45, status: "Low — Irrigate", color: "amber", gradient: "from-amber-500 to-orange-600" },
                { field: "East Orchard (Mango)", moisture: 62, status: "Adequate", color: "blue", gradient: "from-blue-500 to-cyan-600" },
              ].map((field, idx) => (
                <div key={idx} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-5 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">{field.field}</h4>
                    <span className={cn("text-xs font-bold px-2 py-1 rounded-lg bg-gradient-to-r", field.gradient, "text-white")}>{field.status}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", field.gradient, "transition-all duration-500")}
                      style={{ width: `${field.moisture}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-semibold">Moisture Level</p>
                    <p className="text-lg font-bold text-slate-700">{field.moisture}%</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        /* Loading Spinner */
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">{t("fetchingWeatherAnalytics")}</p>
        </div>
      )}
    </div>
  );
}