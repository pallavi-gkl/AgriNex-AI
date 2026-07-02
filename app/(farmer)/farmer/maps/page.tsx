"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MapPin, Warehouse, Users, Compass } from "lucide-react";
import { DEMO_NEARBY_BUYERS, DEMO_WAREHOUSES } from "@/lib/demoData";

// Dynamically import map component because Leaflet uses browser window API
const FarmerMap = dynamic(() => import("@/components/farmer/FarmerMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] flex items-center justify-center bg-slate-900/40 border border-white/10 rounded-2xl animate-pulse">
      <span className="text-slate-400 text-xs font-mono">Initializing Leaflet Map Engine...</span>
    </div>
  ),
});

export default function MapsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-emerald-400 animate-pulse" />
          Logistics, Sourcing & Supply Map
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Track active delivery logistics pipelines and discover nearby storage warehouses or crop buyers.
        </p>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Panel (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4 rounded-3xl">
            <FarmerMap />
          </div>
        </div>

        {/* Nearby Lists (1/3 width) */}
        <div className="space-y-6">
          {/* Nearby Buyers */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Nearby Buyers interested
            </h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {DEMO_NEARBY_BUYERS.map((b) => (
                <div key={b.id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
                  <div>
                    <h4 className="font-bold text-white font-sans">{b.name}</h4>
                    <p className="text-slate-500 text-[10px] mt-0.5">Interested: {b.interested_in.join(", ")}</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 shrink-0 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {b.distance_km} Km
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Warehouses */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Warehouse className="w-4 h-4 text-blue-400" />
              Cold Chain & Storage Facilities
            </h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {DEMO_WAREHOUSES.map((w) => (
                <div key={w.id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
                  <div>
                    <h4 className="font-bold text-white font-sans">{w.name}</h4>
                    <p className="text-slate-500 text-[10px] mt-0.5">Temp Range: {w.temp_range} | Cap: {w.capacity_mt} MT</p>
                  </div>
                  <span className="text-[10px] text-white shrink-0 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {w.distance_km} Km
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
