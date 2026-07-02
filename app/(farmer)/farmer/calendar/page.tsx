"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sprout, Sun, Bug, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const CALENDAR_EVENTS = [
  { date: 4, type: "harvest", label: "Harvest Spinach", details: "185 Kg baby spinach ready" },
  { date: 12, type: "fertilizer", label: "Apply DAP Rice", details: "Tillering stage nitrogen dose" },
  { date: 22, type: "harvest", label: "Rice Harvest", details: "Premium Basmati harvesting start" },
  { date: 25, type: "pest", label: "Pest Check Mango", details: "Routine net-house screening" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 30)); // June 2026

  const daysInMonth = 30; // June has 30 days
  const startDayOffset = 1; // June 1, 2026 is Monday (offset 1)

  const monthName = "June 2026";

  const getEvent = (day: number) => {
    return CALENDAR_EVENTS.find((e) => e.date === day);
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case "harvest": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "fertilizer": return "bg-blue-500/10 text-white border border-blue-500/20";
      case "pest": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-white/5 text-white";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "harvest": return <Sprout className="w-3 h-3 text-emerald-400 shrink-0" />;
      case "fertilizer": return <Activity className="w-3 h-3 text-blue-400 shrink-0" />;
      case "pest": return <Bug className="w-3 h-3 text-amber-400 shrink-0" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            Smart Farm Calendar
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Sowing, transplanting, fertilizing and harvest schedules synchronized with regional climate reports.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 font-mono text-xs text-white">
          <button className="p-1 hover:bg-white/10 rounded">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span>{monthName}</span>
          <button className="p-1 hover:bg-white/10 rounded">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-slate-500 border-b border-white/5 pb-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2 h-72">
            {/* Blank offset days */}
            {[...Array(startDayOffset)].map((_, idx) => (
              <div key={`offset-${idx}`} className="bg-white/[0.01] rounded-xl border border-white/[0.02]" />
            ))}

            {/* Calendar days */}
            {[...Array(daysInMonth)].map((_, idx) => {
              const day = idx + 1;
              const ev = getEvent(day);
              const isToday = day === 30;

              return (
                <div
                  key={day}
                  className={cn(
                    "p-2 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between items-start transition hover:bg-white/10 relative",
                    isToday && "border-emerald-500/50 bg-emerald-500/5"
                  )}
                >
                  <span className={cn("text-[10px] font-mono font-bold", isToday ? "text-emerald-400" : "text-slate-500")}>
                    {day}
                  </span>
                  
                  {ev && (
                    <div className={cn("w-full text-[8px] px-1 py-0.5 rounded flex items-center gap-1 font-mono", getEventStyle(ev.type))}>
                      {getEventIcon(ev.type)}
                      <span className="truncate">{ev.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action events list (1/3 width) */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
            Upcoming Crop schedules
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {CALENDAR_EVENTS.map((ev, idx) => (
              <div key={idx} className={cn("p-3 rounded-xl border", getEventStyle(ev.type))}>
                <div className="flex justify-between items-center font-bold">
                  <span className="flex items-center gap-1 font-sans">
                    {getEventIcon(ev.type)}
                    {ev.label}
                  </span>
                  <span>June {ev.date}</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 font-sans">{ev.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
