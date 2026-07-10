"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { MapPin, Warehouse, Users, Compass, Navigation, Layers, Zap } from "lucide-react";
import { DEMO_NEARBY_BUYERS, DEMO_WAREHOUSES } from "@/lib/demoData";

function MapLoader() {
  const { t } = useTranslation("farmer");
  return (
    <div className="w-full h-[500px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-3xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" />
        <span className="text-slate-500 text-sm font-semibold">{t("initializingMapEngine")}</span>
      </div>
    </div>
  );
}

// Dynamically import map component because Leaflet uses browser window API
const FarmerMap = dynamic(() => import("@/components/farmer/FarmerMap"), {
  ssr: false,
  loading: () => <MapLoader />,
});

export default function MapsPage() {
  const { t } = useTranslation("farmer");
  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Logistics & Supply Map
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Track delivery logistics and discover nearby storage warehouses or crop buyers
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-teal-200 shadow-sm">
              <Layers className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-slate-700">Multi-layer View</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200 shadow-sm">
              <Zap className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-slate-700">Smart Routes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Panel (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="premium-card rounded-3xl p-6 shadow-sm">
            <FarmerMap />
          </div>
        </motion.div>

        {/* Nearby Lists (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Nearby Buyers */}
          <div className="premium-card rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Nearby Buyers</h3>
            </div>
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
              {DEMO_NEARBY_BUYERS.map((b, idx) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center hover:shadow-md transition"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{b.name}</h4>
                    <p className="text-slate-500 text-xs mt-1">Interested: {b.interested_in.join(", ")}</p>
                  </div>
                  <span className="text-xs text-emerald-700 shrink-0 font-bold bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                    {b.distance_km} Km
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Nearby Warehouses */}
          <div className="premium-card rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Storage Facilities</h3>
            </div>
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
              {DEMO_WAREHOUSES.map((w, idx) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center hover:shadow-md transition"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{w.name}</h4>
                    <p className="text-slate-500 text-xs mt-1">Temp: {w.temp_range} | Cap: {w.capacity_mt} MT</p>
                  </div>
                  <span className="text-xs text-blue-700 shrink-0 font-bold bg-gradient-to-r from-blue-100 to-sky-100 px-3 py-1.5 rounded-lg border border-blue-200">
                    {w.distance_km} Km
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}