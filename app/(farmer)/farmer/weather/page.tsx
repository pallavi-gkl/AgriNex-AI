"use client";

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
} from "lucide-react";
import { DEMO_WEATHER } from "@/lib/demoData";
import { cn } from "@/lib/utils";

const HOURLY_FORECAST = [
  { time: "06:00", temp: 24, icon: "sun", desc: "Clear" },
  { time: "09:00", temp: 28, icon: "sun", desc: "Sunny" },
  { time: "12:00", temp: 34, icon: "cloud", desc: "Partly Cloudy" },
  { time: "15:00", temp: 36, icon: "cloud", desc: "Hot" },
  { time: "18:00", temp: 31, icon: "rain", desc: "Light Rain" },
  { time: "21:00", temp: 26, icon: "cloud", desc: "Cloudy" },
  { time: "00:00", temp: 22, icon: "sun", desc: "Clear Night" },
];

const WEEKLY_FORECAST = [
  { day: "Tue Jul 2", high: 36, low: 24, icon: "sun", rain: 5, desc: "Sunny" },
  { day: "Wed Jul 3", high: 34, low: 23, icon: "cloud", rain: 20, desc: "Partly Cloudy" },
  { day: "Thu Jul 4", high: 30, low: 21, icon: "rain", rain: 70, desc: "Thunderstorms" },
  { day: "Fri Jul 5", high: 28, low: 20, icon: "rain", rain: 85, desc: "Heavy Rain" },
  { day: "Sat Jul 6", high: 31, low: 22, icon: "cloud", rain: 40, desc: "Cloudy" },
  { day: "Sun Jul 7", high: 33, low: 23, icon: "sun", rain: 10, desc: "Mostly Sunny" },
  { day: "Mon Jul 8", high: 35, low: 25, icon: "sun", rain: 5, desc: "Sunny" },
];

const FARM_ALERTS = [
  {
    type: "urgent",
    title: "Heavy Monsoon Expected — Thu Jul 4",
    desc: "High-intensity rainfall (60–80mm) forecasted. Protect harvested crops and ensure drainage channels are open.",
    action: "Enable field drainage system",
  },
  {
    type: "high",
    title: "Optimal Fertilizer Window",
    desc: "Mild humidity and 28°C temperature in next 36 hours is ideal for applying DAP fertilizer to rice fields.",
    action: "Apply fertilizer before 10:00 AM",
  },
  {
    type: "medium",
    title: "Night Temperature Drop",
    desc: "Temperatures expected to fall to 20°C on Friday. Cover nursery seedlings to prevent cold stress.",
    action: "Prepare nursery covers",
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
  const [loading, setLoading] = useState(false);
  const weather = DEMO_WEATHER;

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-amber-400" />
            AI Weather Intelligence
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Hyperlocal farm weather analytics, monsoon tracking and agroclimate advisory powered by AI.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono rounded-xl transition self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh Weather
        </button>
      </div>

      {/* Current Weather Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-3xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(3,7,4,0.95))" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <WeatherIcon type="sun" size="lg" />
            <div>
              <p className="text-6xl font-bold text-white">{weather.temperature}°</p>
              <p className="text-slate-400 text-sm mt-1">{weather.condition} · {weather.location}</p>
              <p className="text-slate-500 text-xs font-mono mt-0.5">
                Feels like {weather.feels_like}° · Humidity {weather.humidity}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Droplets, label: "Humidity", value: `${weather.humidity}%`, color: "blue" },
              { icon: Wind, label: "Wind", value: `${weather.wind_speed} km/h`, color: "emerald" },
              { icon: Sun, label: "UV Index", value: `${weather.uv_index}`, color: "amber" },
              { icon: CloudRain, label: "Rain Chance", value: `${weather.forecast[0]?.rain_chance ?? 20}%`, color: "cyan" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <item.icon className={cn("w-4 h-4 mx-auto mb-1", `text-${item.color}-400`)} />
                <p className="text-white font-bold text-sm">{item.value}</p>
                <p className="text-[10px] text-slate-500 font-mono">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hourly Forecast Ticker */}
      <div className="glass-panel p-5 rounded-2xl">
        <h2 className="text-sm font-bold text-white mb-4">24-Hour Forecast</h2>
        <div className="grid grid-cols-7 gap-2">
          {HOURLY_FORECAST.map((h, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition text-center">
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
          {WEEKLY_FORECAST.map((day, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3 min-w-[120px]">
                <WeatherIcon type={day.icon} size="sm" />
                <span className="text-xs text-slate-300 font-mono">{day.day}</span>
              </div>
              <span className="text-[10px] text-white font-mono">{day.rain}% Rain</span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-amber-400 font-bold">{day.high}°</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{day.low}°</span>
              </div>
              <span className="text-[10px] text-slate-500 w-24 text-right">{day.desc}</span>
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
          {FARM_ALERTS.map((alert, idx) => (
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
    </div>
  );
}
