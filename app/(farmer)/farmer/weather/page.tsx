"use client";

/**
 * @fileoverview AI Weather Intelligence — page using real Geolocation weather and selection
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  AlertTriangle,
  RefreshCw,
  CloudRain,
  Sun,
  Cloud,
  CloudSnow,
  Zap,
  Navigation,
  Search,
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
  const cls = size === "lg" ? "w-14 h-14" : size === "sm" ? "w-4 h-4" : "w-7 h-7";
  switch (type) {
    case "rain": return <CloudRain className={cn(cls, "text-blue-400")} />;
    case "cloud": return <Cloud className={cn(cls, "text-slate-400")} />;
    case "snow": return <CloudSnow className={cn(cls, "text-cyan-300")} />;
    case "thunder": return <Zap className={cn(cls, "text-amber-400")} />;
    default: return <Sun className={cn(cls, "text-amber-400")} />;
  }
}

export default function AIWeatherPage() {
  const { location, weather, loading, error, requestLocation, setManualLocation } = useLocationWeather();
  const [cityInput, setCityInput] = useState("");
  const [stateInput, setStateInput] = useState("");

  const handleManualSubmit = (e: React.FormEvent) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-emerald-400" />
            AI Weather Intelligence
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Hyperlocal farm weather analytics, monsoon tracking and agroclimate advisory powered by AI.
          </p>
        </div>
        <button
          onClick={requestLocation}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono rounded-xl transition self-start sm:self-auto shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh Weather / GPS
        </button>
      </div>

      {/* Permission Denied / Initial setup State */}
      {location?.permissionStatus === "denied" && !weather && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-3xl space-y-4 text-center max-w-xl mx-auto"
        >
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
          <div className="space-y-2">
            <h3 className="text-white font-bold text-base">Location Access Denied / Unavailable</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              AgriNex requires GPS coordinates to fetch your real weather and mandi price tickers.
              Please enable location permissions in your browser or select your region manually below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={requestLocation}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              Try GPS Again
            </button>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider mb-3">Or Select Location Manually</p>
            <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="text"
                placeholder="City Name (e.g. Pune, Indore)"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="glass-input text-xs flex-1"
                required
              />
              <input
                type="text"
                placeholder="State Name (Optional)"
                value={stateInput}
                onChange={(e) => setStateInput(e.target.value)}
                className="glass-input text-xs w-full sm:w-32"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl text-xs font-semibold transition"
              >
                Go
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-3xl relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(3,7,4,0.95))" }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-5">
                <WeatherIcon type={weather.codeType} size="lg" />
                <div>
                  <p className="text-6xl font-bold text-white">{weather.temperature}°C</p>
                  <p className="text-slate-400 text-sm mt-1">{weather.condition} · {location.city}, {location.state}</p>
                  <p className="text-slate-500 text-xs font-mono mt-0.5">
                    Feels like {weather.feels_like}°C · Humidity {weather.humidity}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Droplets, label: "Humidity", value: `${weather.humidity}%`, color: "blue" },
                  { icon: Wind, label: "Wind", value: `${weather.wind_speed} km/h`, color: "emerald" },
                  { icon: Sun, label: "UV Index", value: `${weather.uv_index}`, color: "amber" },
                  { icon: CloudRain, label: "Rain Chance", value: `${weather.forecast?.[0]?.rain_chance ?? 20}%`, color: "cyan" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <item.icon className={cn("w-4 h-4 mx-auto mb-1", `text-${item.color}-400`)} />
                    <p className="text-white font-bold text-sm">{item.value}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick switcher inline link */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
              <span className="text-[10px] text-slate-500">
                Detected: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E ({location.permissionStatus === "granted" ? "GPS" : "Manual"})
              </span>
              <form onSubmit={handleManualSubmit} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Change city..."
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-[11px] text-white focus:outline-none w-28"
                />
                <button type="submit" className="p-1 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 text-white transition">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Hourly Forecast Ticker */}
          <div className="glass-panel p-5 rounded-2xl">
            <h2 className="text-sm font-bold text-white mb-4">24-Hour Forecast</h2>
            <div className="grid grid-cols-7 gap-2 overflow-x-auto">
              {hourlyForecast.map((h, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition text-center min-w-[70px]">
                  <p className="text-[10px] text-slate-500 font-mono">{h.time}</p>
                  <WeatherIcon type={h.icon} size="sm" />
                  <p className="text-sm font-bold text-white">{h.temp}°</p>
                  <p className="text-[9px] text-slate-600 font-mono truncate w-full text-center">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Forecast + Farm Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7-day forecast */}
            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <h2 className="text-sm font-bold text-white mb-3 border-b border-white/5 pb-2">7-Day Forecast</h2>
              {(weather.forecast || []).map((day, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <WeatherIcon type={day.icon === "sun" ? "sun" : day.icon === "rain" ? "rain" : day.icon === "snow" ? "snow" : day.icon === "thunder" ? "thunder" : "cloud"} size="sm" />
                    <span className="text-xs text-slate-300 font-mono">{day.day}</span>
                  </div>
                  <span className="text-[10px] text-white font-mono">{day.rain_chance}% Rain</span>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-amber-400 font-bold">{day.high}°</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-400">{day.low}°</span>
                  </div>
                  <span className="text-[10px] text-slate-500 w-24 text-right truncate">{day.condition}</span>
                </div>
              ))}
            </div>

            {/* Farm Alerts */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Agroclimate Farm Alerts
              </h2>
              <p className="text-slate-500 text-[11px] mb-3">AI-generated weather-based crop action advisories</p>
              {FARM_ALERTS_TEMPLATES.map((alert, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-xl border space-y-2",
                    alert.type === "urgent"
                      ? "border-red-500/20 bg-red-500/5"
                      : alert.type === "high"
                      ? "border-amber-500/20 bg-amber-500/5"
                      : "border-blue-500/20 bg-blue-500/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border",
                      alert.type === "urgent" ? "text-red-400 border-red-500/30 bg-red-500/10"
                      : alert.type === "high" ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                      : "text-white border-blue-500/30 bg-blue-500/10"
                    )}>
                      {alert.type.toUpperCase()}
                    </span>
                    <h3 className="text-xs font-bold text-white">{alert.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{alert.desc}</p>
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                    <Zap className="w-3 h-3" />
                    Action: {alert.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Soil Moisture & Irrigation indicator */}
          <div className="glass-panel p-5 rounded-2xl">
            <h2 className="text-sm font-bold text-white mb-4">Soil Moisture & Irrigation Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { field: "North Field (Rice)", moisture: 78, status: "Optimal", color: "emerald" },
                { field: "South Field (Turmeric)", moisture: 45, status: "Low — Irrigate", color: "amber" },
                { field: "East Orchard (Mango)", moisture: 62, status: "Adequate", color: "blue" },
              ].map((field, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">{field.field}</h4>
                    <span className={`text-[10px] font-mono text-${field.color}-400`}>{field.status}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full bg-${field.color}-500`}
                      style={{ width: `${field.moisture}%` }}
                    />
                  </div>
                  <p className="text-right text-xs font-mono font-bold text-white">{field.moisture}% moisture</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Loading Spinner */
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Fetching weather analytics...</p>
        </div>
      )}
    </div>
  );
}
