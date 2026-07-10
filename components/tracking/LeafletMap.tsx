"use client";
import { useTranslation } from "@/hooks/useTranslation";
/**
 * @fileoverview LeafletMap — Client-only Leaflet map for live order tracking.
 * Dynamically imported (no SSR) to avoid window-is-not-defined errors.
 *
 * Shows 3 markers:
 *   🌾 Farmer origin
 *   🏠 Consumer destination
 *   🚚 Courier (current position, animate-bounce)
 *
 * Uses CartoDB Dark Matter tile layer to match AgriNex dark theme.
 */


import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// Fix leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Custom emoji divIcons ─────────────────────────────────────────────────────
const farmerIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 8px rgba(16,185,129,0.6))">🌾</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const consumerIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 8px rgba(14,165,233,0.6))">🏠</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const courierIcon = L.divIcon({
  className: "",
  html: `<div class="animate-bounce" style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 8px rgba(245,158,11,0.7))">🚚</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// ─── Map auto-fit bounds ───────────────────────────────────────────────────────
interface FitBoundsProps {
  farmerCoords: { lat: number; lng: number };
  consumerCoords: { lat: number; lng: number };
}

function FitBounds({ farmerCoords, consumerCoords }: FitBoundsProps) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(
      [farmerCoords.lat, farmerCoords.lng],
      [consumerCoords.lat, consumerCoords.lng]
    );
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [map, farmerCoords, consumerCoords]);
  return null;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface LeafletMapProps {
  farmerCoords: { lat: number; lng: number };
  consumerCoords: { lat: number; lng: number };
  courierCoords: { lat: number; lng: number };
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function LeafletMap({
  farmerCoords,
  consumerCoords,
  courierCoords,
}: LeafletMapProps) {
  const { t } = useTranslation();
  return (
    <MapContainer
      center={[farmerCoords.lat, farmerCoords.lng]}
      zoom={13}
      className="w-full h-full"
      style={{ background: "#050814", zIndex: 0 }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      {/* CartoDB Dark Matter tile layer */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">{t("carto")}</a>'
        subdomains="abcd"
        maxZoom={19}
      />

      {/* Auto-fit bounds to show both endpoints */}
      <FitBounds farmerCoords={farmerCoords} consumerCoords={consumerCoords} />

      {/* Dashed route polyline */}
      <Polyline
        positions={[
          [farmerCoords.lat, farmerCoords.lng],
          [consumerCoords.lat, consumerCoords.lng],
        ]}
        color="#10b981"
        weight={3}
        dashArray="8 4"
        opacity={0.8}
      />

      {/* 🌾 Farmer origin */}
      <Marker
        position={[farmerCoords.lat, farmerCoords.lng]}
        icon={farmerIcon}
      >
        <Popup className="leaflet-popup-dark">
          <div style={{ color: "#10b981", fontWeight: 600 }}>
            📍 Farm Origin
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>
            {farmerCoords.lat.toFixed(4)}, {farmerCoords.lng.toFixed(4)}
          </div>
        </Popup>
      </Marker>

      {/* 🏠 Consumer destination */}
      <Marker
        position={[consumerCoords.lat, consumerCoords.lng]}
        icon={consumerIcon}
      >
        <Popup>
          <div style={{ color: "#0ea5e9", fontWeight: 600 }}>
            🏠 Delivery Address
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>
            {consumerCoords.lat.toFixed(4)}, {consumerCoords.lng.toFixed(4)}
          </div>
        </Popup>
      </Marker>

      {/* 🚚 Courier (bouncing) */}
      <Marker
        position={[courierCoords.lat, courierCoords.lng]}
        icon={courierIcon}
      >
        <Popup>
          <div style={{ color: "#f59e0b", fontWeight: 600 }}>
            🚚 Courier in Transit
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>
            Live position (simulated)
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}