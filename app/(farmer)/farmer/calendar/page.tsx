"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sprout, Sun, Bug, Activity, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const CALENDAR_EVENTS = [
  { date: 4, type: "harvest", label: "Harvest Spinach", details: "185 Kg baby spinach ready" },
  { date: 12, type: "fertilizer", label: "Apply DAP Rice", details: "Tillering stage nitrogen dose" },
  { date: 22, type: "harvest", label: "Rice Harvest", details: "Premium Basmati harvesting start" },
  { date: 25, type: "pest", label: "Pest Check Mango", details: "Routine net-house screening" },
];

export default function CalendarPage() {
  const { t } = useTranslation("farmer");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 30)); // June 2026

  const daysInMonth = 30; // June has 30 days
  const startDayOffset = 1; // June 1, 2026 is Monday (offset 1)

  const monthName = "June 2026";

  const getEvent = (day: number) => {
    return CALENDAR_EVENTS.find((e) => e.date === day);
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case "harvest": return "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200";
      case "fertilizer": return "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 border border-blue-200";
      case "pest": return "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200";
      default: return "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border border-slate-200";
    }
  };

  const getEventIcon = (type: string) => {
  const { t } = useTranslation("farmer");
    switch (type) {
      case "harvest": return <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />;
      case "fertilizer": return <Activity className="w-4 h-4 text-blue-600 shrink-0" />;
      case "pest": return <Bug className="w-4 h-4 text-amber-600 shrink-0" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  Smart Farm Calendar
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Sowing, transplanting, fertilizing and harvest schedules synchronized with regional climate
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 premium-card rounded-2xl px-4 py-2 text-sm text-slate-700 shadow-sm font-semibold">
              <button className="p-2 hover:bg-slate-100 rounded-xl transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold">{monthName}</span>
              <button className="p-2 hover:bg-slate-100 rounded-xl transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">{t("aiScheduled")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-teal-200 shadow-sm">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-slate-700">Weather Sync</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200 shadow-sm">
              <Sun className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-slate-700">{t("climateAware")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar grid (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 premium-card rounded-3xl p-6 shadow-sm space-y-5"
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-3 text-center text-xs font-bold text-slate-400 border-b border-slate-100 pb-4">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>{t("fri")}</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-3">
            {/* Blank offset days */}
            {[...Array(startDayOffset)].map((_, idx) => (
              <div key={`offset-${idx}`} className="bg-slate-50 rounded-2xl border border-slate-100 h-24" />
            ))}

            {/* Calendar days */}
            {[...Array(daysInMonth)].map((_, idx) => {
              const day = idx + 1;
              const ev = getEvent(day);
              const isToday = day === 30;

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.01 }}
                  className={cn(
                    "p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between items-start transition hover:shadow-md hover:-translate-y-0.5 relative cursor-pointer h-24",
                    isToday && "border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/20"
                  )}
                >
                  <span className={cn("text-sm font-bold", isToday ? "text-emerald-600" : "text-slate-600")}>
                    {day}
                  </span>
                  
                  {ev && (
                    <div className={cn("w-full text-[10px] px-2 py-1 rounded-lg flex items-center gap-1.5 font-semibold", getEventStyle(ev.type))}>
                      {getEventIcon(ev.type)}
                      <span className="truncate">{ev.label}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Action events list (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-card rounded-3xl p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Upcoming Schedules</h3>
          </div>
          <div className="space-y-4">
            {CALENDAR_EVENTS.map((ev, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn("p-4 rounded-2xl border", getEventStyle(ev.type))}
              >
                <div className="flex justify-between items-center font-bold mb-2">
                  <span className="flex items-center gap-2 text-sm">
                    {getEventIcon(ev.type)}
                    {ev.label}
                  </span>
                  <span className="text-xs font-semibold bg-white/50 px-2 py-1 rounded-lg">June {ev.date}</span>
                </div>
                <p className="text-xs opacity-80 font-semibold">{ev.details}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}