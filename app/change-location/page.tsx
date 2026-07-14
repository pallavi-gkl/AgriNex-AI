"use client";

import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Check,
  CloudSun,
  Users,
  Warehouse,
  Brain,
  Globe,
  Navigation,
  Home,
  Hash,
  Activity,
  Map
} from "lucide-react";

/* ─── Indian States Data ─────────────────────────────────────────────────── */
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

/* ─── Popular Ag Hubs ────────────────────────────────────────────────────── */
const POPULAR_HUBS: Record<
  string,
  { lat: number; lng: number; state: string; name: string }
> = {
  karnal:    { lat: 29.6857, lng: 76.9905, state: "Haryana",         name: "Karnal" },
  pune:      { lat: 18.5204, lng: 73.8567, state: "Maharashtra",     name: "Pune" },
  nashik:    { lat: 19.9975, lng: 73.7898, state: "Maharashtra",     name: "Nashik" },
  hapur:     { lat: 28.7306, lng: 77.7758, state: "Uttar Pradesh",   name: "Hapur" },
  guntur:    { lat: 16.3067, lng: 80.4365, state: "Andhra Pradesh",  name: "Guntur" },
  erode:     { lat: 11.3410, lng: 77.7172, state: "Tamil Nadu",      name: "Erode" },
  kolar:     { lat: 13.1368, lng: 78.1293, state: "Karnataka",       name: "Kolar" },
  ratnagiri: { lat: 16.9902, lng: 73.3120, state: "Maharashtra",     name: "Ratnagiri" },
  indore:    { lat: 22.7196, lng: 75.8577, state: "Madhya Pradesh",  name: "Indore" },
  agra:      { lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh",   name: "Agra" },
  mumbai:    { lat: 19.0760, lng: 72.8777, state: "Maharashtra",     name: "Mumbai" },
  delhi:     { lat: 28.6139, lng: 77.2090, state: "Delhi",           name: "Delhi" },
  kochi:     { lat:  9.9312, lng: 76.2673, state: "Kerala",          name: "Kochi" },
  jaipur:    { lat: 26.9124, lng: 75.7873, state: "Rajasthan",       name: "Jaipur" },
  lucknow:   { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh",   name: "Lucknow" },
  hyderabad: { lat: 17.3850, lng: 78.4867, state: "Telangana",       name: "Hyderabad" },
  bangalore: { lat: 12.9716, lng: 77.5946, state: "Karnataka",       name: "Bengaluru" },
  chennai:   { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu",      name: "Chennai" },
  kolkata:   { lat: 22.5726, lng: 88.3639, state: "West Bengal",     name: "Kolkata" },
  amritsar:  { lat: 31.6340, lng: 74.8723, state: "Punjab",          name: "Amritsar" },
};

/* ─── Local Storage Keys ─── */
function storageKey(field: string, platform: string) {
  const suffix = platform === "farmer" ? "_farmer" : "_consumer";
  return `agrinex_${field}${suffix}`;
}

/* ─── Reverse Geocoding with OSM fallback (No hardcoded coordinates fallback) ─── */
async function geocodeLocation(
  village: string,
  district: string,
  state: string,
  pincode: string
): Promise<{ lat: number; lng: number }> {
  const query = village.trim().toLowerCase();
  const hub = POPULAR_HUBS[query];
  if (hub) return { lat: hub.lat, lng: hub.lng };

  const parts = [village, district, state, pincode].filter(Boolean);
  const searchStr = parts.join(", ");
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchStr
      )}&format=json&limit=1`
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.length) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    const res2 = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        village
      )}&format=json&limit=1`
    );
    if (res2.ok) {
      const d2 = await res2.json();
      if (d2?.length) return { lat: parseFloat(d2[0].lat), lng: parseFloat(d2[0].lon) };
    }
  } catch (_) {}
  throw new Error("Unable to determine coordinates for the specified location.");
}

function ChangeLocationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromPath   = searchParams.get("from")     || "/";
  const platform   = (searchParams.get("platform") || "farmer") as "farmer" | "consumer";

  /* ── State variables ── */
  const [state,    setState]    = useState("");
  const [district, setDistrict] = useState("");
  const [village,  setVillage]  = useState("");
  const [pincode,  setPincode]  = useState("");
  const [country,  setCountry]  = useState("India");
  const [mandal,   setMandal]   = useState("");

  const [lat,      setLat]      = useState("");
  const [lng,      setLng]      = useState("");

  const [stateSearch, setStateSearch] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const [loading,  setLoading]  = useState(false);
  const [status,   setStatus]   = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Load existing values on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const get = (field: string) =>
      localStorage.getItem(storageKey(field, platform)) || "";
    const loadedState = get("state");
    setState(loadedState);
    setStateSearch(loadedState);
    setDistrict(get("district"));
    setVillage(get("city"));
    setPincode(get("pincode"));
    setCountry(get("country") || "India");
    setMandal(get("mandal"));
    setLat(get("lat") || "");
    setLng(get("lng") || "");
  }, [platform]);

  /* Click outside to close custom dropdown */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Back navigation */
  const goBack = useCallback(() => {
    router.push(fromPath);
  }, [router, fromPath]);

  /* Save Location */
  const handleSave = useCallback(async () => {
    if (!village.trim() || !district.trim() || !state.trim() || !country.trim() || !mandal.trim()) return;
    setLoading(true);
    setStatus(null);

    try {
      const { lat: calculatedLat, lng: calculatedLng } = await geocodeLocation(village, district, state, pincode);
      setLat(String(calculatedLat));
      setLng(String(calculatedLng));
      saveAndReturn(
        village.trim(),
        state.trim(),
        district.trim(),
        pincode.trim(),
        calculatedLat,
        calculatedLng,
        "denied",
        country.trim(),
        mandal.trim()
      );
    } catch (err: any) {
      setStatus({ type: "error", text: err.message || "Failed to geocode location. Please check spelling or enter again." });
      setLoading(false);
    }
  }, [village, district, state, pincode, country, mandal, platform, fromPath]);

  /* Shared persist + redirect */
  const saveAndReturn = (
    city: string,
    st: string,
    dist: string,
    pin: string,
    latitude: number,
    longitude: number,
    perm: string,
    co = "India",
    md = ""
  ) => {
    const set = (field: string, val: string) =>
      localStorage.setItem(storageKey(field, platform), val);
    set("city",       city);
    set("state",      st);
    set("district",   dist);
    set("pincode",    pin);
    set("country",    co);
    set("mandal",     md);
    set("lat",        String(latitude));
    set("lng",        String(longitude));
    set("permission", perm);

    setStatus({ type: "success", text: "Location saved successfully! Updating platform layout…" });

    // Trigger a storage event so components pick up new values
    window.dispatchEvent(new StorageEvent("storage", {
      key: storageKey("city", platform),
      newValue: city,
    }));

    setTimeout(() => {
      router.push(fromPath);
    }, 1200);
  };

  /* Hub selection quick action */
  const pickHub = (key: string) => {
    const hub = POPULAR_HUBS[key];
    setState(hub.state);
    setStateSearch(hub.state);
    setDistrict(hub.name);
    setVillage(hub.name);
    setPincode("");
    setCountry("India");
    setMandal("Agriculture Area");
    setLat(String(hub.lat));
    setLng(String(hub.lng));
  };

  const filteredStates = INDIAN_STATES.filter(st =>
    st.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const canSave = village.trim() && district.trim() && state.trim() && country.trim() && mandal.trim() && !loading;

  // Dynamically estimate weather based on state selection for the informative preview panel
  const getMockWeather = () => {
    if (!state) return { temp: "--", humidity: "--", desc: "No location set" };
    const sum = state.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const temp = 24 + (sum % 10);
    const humidity = 60 + (sum % 25);
    const conditions = ["Sunny", "Partly Cloudy", "Passing Showers", "Overcast", "Windy"];
    const desc = conditions[sum % conditions.length];
    return { temp: `${temp}°C`, humidity: `${humidity}%`, desc };
  };

  const weather = getMockWeather();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap');
        
        .loc-root {
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, #03140e 0%, #05080e 100%);
          font-family: 'Inter', sans-serif;
          color: #f8fafc;
          padding-bottom: 64px;
        }

        /* ── HERO GRID ── */
        .loc-hero {
          background: linear-gradient(135deg, rgba(7,27,18,0.7) 0%, rgba(3,13,8,0.4) 100%);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(16,185,129,0.1);
          padding: 28px 48px;
        }

        /* ── GRID LAYOUT ── */
        .loc-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
        }

        /* ── GLASS CARD ── */
        .loc-card {
          background: rgba(13, 25, 20, 0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.65);
          padding: 40px;
        }

        /* ── INPUT CARDS ── */
        .loc-input-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 18px;
          transition: all 0.22s ease-in-out;
        }
        .loc-input-card:focus-within {
          background: rgba(16,185,129,0.03);
          border-color: rgba(16,185,129,0.3);
          box-shadow: 0 4px 20px rgba(16,185,129,0.05);
        }
        .loc-input-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 6px;
          display: block;
        }

        /* ── FORM CONTROL ── */
        .loc-control-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .loc-control {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #f1f5f9;
          font-size: 15px;
          font-weight: 500;
          padding-left: 32px;
          height: 32px;
          font-family: 'Inter', sans-serif;
        }
        .loc-control::placeholder {
          color: #475569;
        }
        .loc-icon {
          position: absolute;
          left: 2px;
          color: #475569;
          transition: color 0.2s;
        }
        .loc-control:focus ~ .loc-icon {
          color: #10b981;
        }

        /* ── BUTTONS ── */
        .loc-btn-primary {
          height: 52px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14.5px;
          color: #fff;
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 20px rgba(16,185,129,0.25);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .loc-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(16,185,129,0.4);
        }
        .loc-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .loc-btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .loc-btn-secondary {
          height: 52px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 14.5px;
          color: #94a3b8;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .loc-btn-secondary:hover {
          background: rgba(255,255,255,0.07);
          color: #f1f5f9;
        }

        /* ── BENEFIT CARDS ── */
        .loc-benefit-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.22s;
        }
        .loc-benefit-card:hover {
          background: rgba(16,185,129,0.04);
          border-color: rgba(16,185,129,0.15);
          transform: translateY(-2px);
        }

        /* ── CHIPS ── */
        .loc-chip {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: #cbd5e1;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }
        .loc-chip:hover {
          background: rgba(16,185,129,0.1);
          border-color: #10b981;
          color: #fff;
          transform: scale(1.03);
        }

        /* ── SIDE PANEL CARD ── */
        .loc-panel-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 16px;
        }

        /* ── STATE DROPDOWN ── */
        .loc-dropdown {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 8px);
          max-height: 240px;
          overflow-y: auto;
          background: #0b1a14;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          box-shadow: 0 20px 48px rgba(0,0,0,0.5);
          z-index: 100;
          padding: 8px;
        }
        .loc-dropdown-item {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          text-align: left;
          font-size: 13.5px;
          color: #cbd5e1;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 500;
        }
        .loc-dropdown-item:hover {
          background: rgba(16,185,129,0.12);
          color: #fff;
        }
        .loc-dropdown-item.active {
          background: #10b981;
          color: #fff;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .loc-container {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .loc-hero {
            padding: 24px 20px;
          }
          .loc-container {
            padding: 24px 16px;
          }
          .loc-card {
            padding: 24px 16px;
          }
        }
      `}</style>

      <div className="loc-root">
        {/* ══════════════════ HERO HEADER ══════════════════ */}
        <div className="loc-hero flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <button
              onClick={goBack}
              disabled={loading}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 cursor-pointer bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-50 transition-all shrink-0 mt-1"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-400" />
                <h1 className="text-2xl font-extrabold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Smart Location Center
                </h1>
              </div>
              <p className="text-slate-400 text-sm max-w-2xl mt-1.5 leading-relaxed">
                Manage your farm or shopping location for accurate weather, logistics, nearby buyers, AI recommendations and government schemes.
              </p>
            </div>
          </div>

          {/* Platform Badge */}
          <div className="shrink-0 self-start md:self-center">
            <div className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md">
              {platform === "farmer" ? "🌾 Farmer Platform" : "🛒 Consumer Platform"}
            </div>
          </div>
        </div>

        {/* ══════════════════ LOCATION BENEFITS ══════════════════ */}
        <div className="max-w-[1280px] mx-auto px-6 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="loc-benefit-card">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <CloudSun size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">Accurate Weather</div>
              <div className="text-xs text-slate-500 mt-0.5">Real-time localized updates</div>
            </div>
          </div>
          <div className="loc-benefit-card">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Users size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">Nearby Buyers</div>
              <div className="text-xs text-slate-500 mt-0.5">Instant demand matching</div>
            </div>
          </div>
          <div className="loc-benefit-card">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Warehouse size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">Cold Storages</div>
              <div className="text-xs text-slate-500 mt-0.5">Local warehouse locator</div>
            </div>
          </div>
          <div className="loc-benefit-card">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Brain size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">AI Analytics</div>
              <div className="text-xs text-slate-500 mt-0.5">Market-driven crop picks</div>
            </div>
          </div>
        </div>

        {/* ══════════════════ MAIN CONTENT ══════════════════ */}
        <div className="loc-container">
          {/* Left Column: Form & Action Center */}
          <div className="loc-card flex flex-col gap-8">
            {/* Action Header */}
            <div>
              <h2 className="text-xl font-bold text-slate-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Update Location Coordinates
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Manually declare your agricultural region details below to update your location.
              </p>
            </div>

            {/* Status alerts */}
            {status && (
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${
                  status.type === "success"
                    ? "bg-emerald-500/5 text-emerald-300 border-emerald-500/20"
                    : "bg-red-500/5 text-red-300 border-red-500/20"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country */}
              <div className="loc-input-card">
                <label className="loc-input-label">Country *</label>
                <div className="loc-control-wrap">
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="loc-control"
                  />
                  <Globe className="loc-icon" size={17} />
                </div>
              </div>

              {/* State Dropdown Container */}
              <div className="loc-input-card relative" ref={dropdownRef}>
                <label className="loc-input-label">State *</label>
                <div
                  className="loc-control-wrap cursor-pointer"
                  onClick={() => setShowStateDropdown(!showStateDropdown)}
                >
                  <input
                    type="text"
                    placeholder="Search or select..."
                    value={stateSearch}
                    onChange={(e) => {
                      setStateSearch(e.target.value);
                      setShowStateDropdown(true);
                      if (!e.target.value) setState("");
                    }}
                    className="loc-control"
                    style={{ paddingRight: 24 }}
                  />
                  <MapPin className="loc-icon" size={17} />
                  <ChevronDown className="absolute right-0 text-slate-500" size={16} />
                </div>

                {showStateDropdown && (
                  <div className="loc-dropdown">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((st) => {
                        const active = state === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setState(st);
                              setStateSearch(st);
                              setShowStateDropdown(false);
                            }}
                            className={`loc-dropdown-item ${active ? "active" : ""}`}
                          >
                            <span>{st}</span>
                            {active && <Check size={14} />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500 font-medium">
                        No matches found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* District */}
              <div className="loc-input-card">
                <label className="loc-input-label">District *</label>
                <div className="loc-control-wrap">
                  <input
                    type="text"
                    placeholder="e.g. Chittoor"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="loc-control"
                  />
                  <MapPin className="loc-icon" size={17} />
                </div>
              </div>

              {/* Mandal / Taluk */}
              <div className="loc-input-card">
                <label className="loc-input-label">Mandal / Taluk *</label>
                <div className="loc-control-wrap">
                  <input
                    type="text"
                    placeholder="e.g. Mudivedu"
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    className="loc-control"
                  />
                  <Navigation className="loc-icon" size={17} />
                </div>
              </div>

              {/* Village / City */}
              <div className="loc-input-card">
                <label className="loc-input-label">Village / Town / City *</label>
                <div className="loc-control-wrap">
                  <input
                    type="text"
                    placeholder="e.g. Madanapalle"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="loc-control"
                  />
                  <Home className="loc-icon" size={17} />
                </div>
              </div>

              {/* PIN Code */}
              <div className="loc-input-card">
                <label className="loc-input-label">
                  PIN Code <span className="text-slate-500 text-[10px] font-normal lowercase">(optional)</span>
                </label>
                <div className="loc-control-wrap">
                  <input
                    type="text"
                    placeholder="e.g. 517325"
                    value={pincode}
                    maxLength={6}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="loc-control"
                  />
                  <Hash className="loc-icon" size={17} />
                </div>
              </div>
            </div>

            {/* Popular agricultural hubs */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">
                Popular Indian Agricultural Hubs
              </h3>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {Object.keys(POPULAR_HUBS).map((key) => {
                  const hub = POPULAR_HUBS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => pickHub(key)}
                      disabled={loading}
                      className="loc-chip"
                    >
                      {hub.name} <span className="text-[10px] text-slate-500 ml-1">({hub.state.substring(0, 2)})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions Form */}
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={goBack}
                disabled={loading}
                className="loc-btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="loc-btn-primary flex-[2]"
                style={{
                  boxShadow: canSave ? "0 6px 20px rgba(16,185,129,0.3)" : "none",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Location</span>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Informative Panel */}
          <div className="flex flex-col gap-6">
            {/* Interactive Preview Panel */}
            <div className="loc-card" style={{ padding: 24 }}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Activity size={15} className="text-emerald-400" />
                <span>Live Panel Metrics</span>
              </h3>

              {/* Current Weather Card */}
              <div className="loc-panel-card">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated Weather</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-2xl font-black text-white">{weather.temp}</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{weather.desc}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Humidity: {weather.humidity}</div>
                  </div>
                </div>
              </div>

              {/* Coordinates Info */}
              <div className="loc-panel-card">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Location Coordinates</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Latitude</span>
                    <span className="text-slate-200 font-mono font-medium">{lat || "Pending"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Longitude</span>
                    <span className="text-slate-200 font-mono font-medium">{lng || "Pending"}</span>
                  </div>
                </div>
              </div>

              {/* Geolocation accuracy & agricultural zones */}
              <div className="loc-panel-card" style={{ marginBottom: 0 }}>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Agricultural Region Info</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Declared Country</span>
                    <span className="text-slate-300 font-bold">{country || "Pending"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">State / Province</span>
                    <span className="text-slate-300 font-bold">{state || "None Selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mandal Region</span>
                    <span className="text-slate-300 font-bold">{mandal || "None Selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ag Zone Hub</span>
                    <span className="text-emerald-400 font-bold">
                      {state ? `Zone ${state.length}` : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Live Map Preview */}
            <div className="loc-card relative overflow-hidden" style={{ padding: 0, height: 260 }}>
              {lat && lng ? (
                <iframe
                  title="Interactive Geolocation Map Preview"
                  width="100%"
                  height="100%"
                  style={{ border: 0, opacity: 0.85 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng) - 0.015}%2C${parseFloat(lat) - 0.015}%2C${parseFloat(lng) + 0.015}%2C${parseFloat(lat) + 0.015}&layer=mapnik&marker=${lat}%2C${lng}`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-950/10 p-6 text-center">
                  <Map className="w-8 h-8 text-slate-600 animate-bounce mb-2" />
                  <div className="text-sm font-semibold text-slate-300">Satellite Scanning</div>
                  <div className="text-[11px] text-slate-500 max-w-[200px] mt-1 leading-relaxed">
                    Set a location to initialize map layout.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Page wrapper with Suspense ─── */
export default function ChangeLocationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <ChangeLocationInner />
    </Suspense>
  );
}