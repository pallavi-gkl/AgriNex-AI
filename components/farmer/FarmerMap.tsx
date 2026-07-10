"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// Leaflet marker icon fix for Next.js
const customIcon = (color: string) => {
  return L.divIcon({
    html: `<span style="background-color: ${color}; width: 14px; height: 14px; display: block; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></span>`,
    className: "custom-leaflet-icon",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

interface LocationMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "farmer" | "warehouse" | "buyer" | "collection_center";
  details?: string;
}

const SAMPLE_MARKERS: LocationMarker[] = [
  { id: "1", name: "Your Farm (AgriNex Farm)", lat: 18.5204, lng: 73.8567, type: "farmer", details: "GPS: 18.5204° N, 73.8567° E | Main Hub" },
  { id: "2", name: "Pune Central Warehouse", lat: 18.5304, lng: 73.8667, type: "warehouse", details: "Storage Temp: 4°C - 8°C | Cap: 500 Tons" },
  { id: "3", name: "Reliance Retail Hub (Buyer)", lat: 18.5084, lng: 73.8427, type: "buyer", details: "Demand: 15 Tons Tomatoes weekly" },
  { id: "4", name: "Greenfield Collection Center", lat: 18.5424, lng: 73.8347, type: "collection_center", details: "Weighing & grading station" },
  { id: "5", name: "Mumbai D2C Distribution Center", lat: 19.0760, lng: 72.8777, type: "warehouse", details: "Sub-hub for Mumbai market" }
];

export default function FarmerMap() {
  const { t } = useTranslation("farmer");
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  useEffect(() => {
    setMounted(true);
    // Draw route from farmer to buyer to represent delivery tracking
    setRouteCoordinates([
      [18.5204, 73.8567], // Farm
      [18.5424, 73.8347], // Collection Center
      [18.5304, 73.8667], // Warehouse
      [18.5084, 73.8427]  // Buyer
    ]);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-slate-900/40 border border-white/10 rounded-2xl animate-pulse">
        <span className="text-slate-400 text-sm">Loading Interactive Map Engine...</span>
      </div>
    );
  }

  const filteredMarkers = selectedType === "all"
    ? SAMPLE_MARKERS
    : SAMPLE_MARKERS.filter(m => m.type === selectedType);

  const getColor = (type: string) => {
    switch (type) {
      case "farmer": return "#10b981"; // Emerald
      case "warehouse": return "#3b82f6"; // Blue
      case "buyer": return "#ec4899"; // Pink
      case "collection_center": return "#f59e0b"; // Amber
      default: return "#ffffff";
    }
  };

  return (
    <div className="space-y-4">
      {/* Map filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === "all" ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          🌐 Show All Locations
        </button>
        <button
          onClick={() => setSelectedType("farmer")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === "farmer" ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          🚜 My Farm
        </button>
        <button
          onClick={() => setSelectedType("warehouse")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === "warehouse" ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          🏢 Warehouses
        </button>
        <button
          onClick={() => setSelectedType("buyer")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === "buyer" ? "bg-pink-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          🛒 Buyers
        </button>
        <button
          onClick={() => setSelectedType("collection_center")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === "collection_center" ? "bg-amber-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          🌾 Collection Centers
        </button>
      </div>

      {/* Map frame */}
      <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-white/10 relative z-10 shadow-2xl">
        <MapContainer
          center={[18.5204, 73.8567]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {filteredMarkers.map((m) => (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
              icon={customIcon(getColor(m.type))}
            >
              <Popup>
                <div className="p-1 text-slate-900">
                  <h3 className="font-bold text-sm text-slate-900">{m.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 mt-1 inline-block">
                    {m.type.replace("_", " ")}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">{m.details}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Active logistics route path */}
          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              color="#10b981"
              weight={3}
              opacity={0.6}
              dashArray="8, 12"
            />
          )}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/15 px-3 py-2.5 rounded-xl z-20 space-y-1.5 text-xs">
          <h4 className="font-bold text-white text-[10px] uppercase tracking-wider mb-1">Map Legend</h4>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>My Farm Hub</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Warehouse</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            <span>{t("d2cBuyer")}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>{t("collectionPoint")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}