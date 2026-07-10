"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Compass,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Check
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────────────────── */

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

/* ─── helpers ───────────────────────────────────────────────────────────── */

function storageKey(field: string, platform: string) {
  const suffix = platform === "farmer" ? "_farmer" : "_consumer";
  return `agrinex_${field}${suffix}`;
}

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
  return { lat: 29.6857, lng: 76.9905 };
}

/* ─── Inner component (uses searchParams) ─────────────────────────────── */

function ChangeLocationInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromPath   = searchParams.get("from")     || "/";
  const platform   = (searchParams.get("platform") || "farmer") as "farmer" | "consumer";

  /* ── State variables ── */
  const [state,    setState]    = useState("");
  const [district, setDistrict] = useState("");
  const [village,  setVillage]  = useState("");
  const [pincode,  setPincode]  = useState("");

  const [stateSearch, setStateSearch] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const [loading,  setLoading]  = useState(false);
  const [status,   setStatus]   = useState<
    { type: "success" | "error" | "gps"; text: string } | null
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

  /* ── Back navigation ── */
  const goBack = useCallback(() => {
    router.push(fromPath);
  }, [router, fromPath]);

  /* ── GPS ── */
  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus({ type: "error", text: "Geolocation is not supported by your browser." });
      return;
    }
    setLoading(true);
    setStatus({ type: "gps", text: "Connecting to GPS & fetching coordinates…" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const geo = await res.json();
          const gCity   = geo.city || geo.locality || "Your Location";
          const gState  = geo.principalSubdivision || "";
          const gDistr  = geo.localityInfo?.administrative?.[3]?.name || geo.principalSubdivision || "";

          saveAndReturn(gCity, gState, gDistr, "", latitude, longitude, "granted");
        } catch (_) {
          setStatus({ type: "error", text: "Reverse geocoding failed. Please input details manually." });
          setLoading(false);
        }
      },
      () => {
        setStatus({
          type: "error",
          text: "GPS Access Denied. Please input your location manually in the fields below.",
        });
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  /* ── Save manual location ── */
  const handleSave = useCallback(async () => {
    if (!village.trim() || !district.trim() || !state.trim()) return;
    setLoading(true);
    setStatus(null);

    try {
      const { lat, lng } = await geocodeLocation(village, district, state, pincode);
      saveAndReturn(village.trim(), state.trim(), district.trim(), pincode.trim(), lat, lng, "denied");
    } catch (_) {
      setStatus({ type: "error", text: "Failed to geocode location. Please check spelling or enter again." });
      setLoading(false);
    }
  }, [village, district, state, pincode]);

  /* ── Shared persist + redirect ── */
  const saveAndReturn = (
    city: string,
    st: string,
    dist: string,
    pin: string,
    lat: number,
    lng: number,
    perm: string
  ) => {
    const set = (field: string, val: string) =>
      localStorage.setItem(storageKey(field, platform), val);
    set("city",       city);
    set("state",      st);
    set("district",   dist);
    set("pincode",    pin);
    set("country",    "India");
    set("lat",        String(lat));
    set("lng",        String(lng));
    set("permission", perm);

    setStatus({ type: "success", text: "Location saved successfully! Updating platform layout…" });

    // Trigger a storage event so the context picks up new values
    window.dispatchEvent(new StorageEvent("storage", {
      key: storageKey("city", platform),
      newValue: city,
    }));

    setTimeout(() => {
      router.push(fromPath);
    }, 900);
  };

  /* ── Quick-pick a popular hub ── */
  const pickHub = (key: string) => {
  const { t } = useTranslation();
    const hub = POPULAR_HUBS[key];
    setState(hub.state);
    setStateSearch(hub.state);
    setDistrict(hub.name);
    setVillage(hub.name);
    setPincode("");
  };

  const filteredStates = INDIAN_STATES.filter(st =>
    st.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const canSave = village.trim() && district.trim() && state.trim() && !loading;

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f8fafc 100%)",
      }}
    >
      {/* ── Top Bar ── */}
      <div
        className="flex items-center gap-4 px-6 py-4 sticky top-0 z-20 border-b-2"
        style={{
          background: "#ffffff",
          borderColor: "#e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <button
          onClick={goBack}
          disabled={loading}
          className="flex items-center justify-center w-10 h-10 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{
            background: "#f0fdf4",
            borderColor: "#bbf7d0",
            color: "#16a34a"
          }}
          aria-label={t("goBack")}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-emerald-700/20"
            style={{ background: "linear-gradient(135deg,#15803d,#16a34a)" }}
          >
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">
              {t("changeLocation")}
            </h1>
            <p className="text-xs text-emerald-800 font-extrabold tracking-wider uppercase mt-0.5">
              {platform === "farmer" ? "👨‍🌾 Farmer Platform" : "🛒 Consumer Platform"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* Form Card */}
          <div
            className="rounded-3xl p-8 bg-white border-2"
            style={{
              borderColor: "#e2e8f0",
              boxShadow: "0 15px 40px rgba(15,118,110,0.06)",
            }}
          >
            {/* Status Messages with High Contrast text-950 */}
            {status && (
              <div
                className={`flex items-center gap-3 p-4 rounded-2xl mb-6 text-sm font-black border-2 transition-all duration-300 ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-950 border-emerald-300"
                    : status.type === "error"
                    ? "bg-rose-50 text-rose-950 border-rose-300"
                    : "bg-sky-50 text-sky-950 border-sky-300"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                ) : status.type === "error" ? (
                  <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
                ) : (
                  <Loader2 className="w-5 h-5 text-sky-700 shrink-0 animate-spin" />
                )}
                <span className="leading-normal">{status.text}</span>
              </div>
            )}

            {/* GPS Trigger Button */}
            <button
              type="button"
              onClick={handleGPS}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-2xl text-white font-black text-sm border-0 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 mb-6 shadow-md"
              style={{
                background: "linear-gradient(135deg,#15803d 0%,#16a34a 100%)",
                boxShadow: "0 6px 20px rgba(22,163,74,0.25)",
              }}
            >
              {loading && status?.type === "gps" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Compass className="w-5 h-5" />
              )}
              📍 Use Current GPS Location
            </button>

            {/* Divider with high-contrast text */}
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t-2 border-slate-100" />
              <span className="mx-4 text-xs font-black uppercase tracking-widest text-slate-700 whitespace-nowrap bg-white px-2">
                Or Enter Manually
              </span>
              <div className="flex-grow border-t-2 border-slate-100" />
            </div>

            {/* Manual Form fields */}
            <div className="space-y-5">
              {/* State Dropdown Picker */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1.5 ml-1 tracking-wider">
                  {t("state")} <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <div
                  className="flex items-center justify-between w-full px-4 py-3 text-sm bg-white border-2 border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600 transition-all cursor-pointer"
                  onClick={() => setShowStateDropdown(!showStateDropdown)}
                >
                  <input
                    type="text"
                    placeholder="Search or select state..."
                    value={stateSearch}
                    onChange={(e) => {
                      setStateSearch(e.target.value);
                      setShowStateDropdown(true);
                      if (!e.target.value) {
                        setState("");
                      }
                    }}
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 text-slate-900 font-black placeholder:text-slate-500 p-0"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-650 transition-transform duration-200" style={{ strokeWidth: 3 }} />
                </div>

                {showStateDropdown && (
                  <div
                    className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-white border-2 border-slate-300 shadow-2xl z-50 p-2 space-y-0.5"
                  >
                    {filteredStates.length > 0 ? (
                      filteredStates.map((st) => {
                        const isSelected = state === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setState(st);
                              setStateSearch(st);
                              setShowStateDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-black transition-all cursor-pointer ${
                              isSelected
                                ? "bg-emerald-700 text-white"
                                : "text-slate-900 hover:bg-emerald-50 hover:text-emerald-950"
                            }`}
                          >
                            <span>{st}</span>
                            {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-3 text-sm text-slate-800 text-center font-black">
                        No states found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* District Field */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1.5 ml-1 tracking-wider">
                  {t("district")} <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chittoor"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 font-black placeholder:text-slate-500 transition-all"
                />
              </div>

              {/* Village / Town / City (Mandatory) */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1.5 ml-1 tracking-wider">
                  Village / Town / City <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Madanapalle"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 font-black placeholder:text-slate-500 transition-all"
                />
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1.5 ml-1 tracking-wider">
                  PIN Code <span className="text-slate-600 normal-case font-bold">{t("optional")}</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 517325"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 text-sm bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 font-black placeholder:text-slate-500 transition-all"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 rounded-2xl font-black text-sm transition-all border-2 border-slate-350 cursor-pointer disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  className="flex-[2] py-3.5 rounded-2xl font-black text-sm transition-all duration-200 border-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: canSave
                      ? "linear-gradient(135deg,#15803d 0%,#16a34a 100%)"
                      : "#f1f5f9",
                    borderColor: canSave ? "#15803d" : "#e2e8f0",
                    color: canSave ? "white" : "#64748b",
                    boxShadow: canSave ? "0 6px 20px rgba(21,128,61,0.25)" : "none",
                  }}
                >
                  {loading && status?.type !== "gps" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Saving…
                    </span>
                  ) : (
                    "Save Location"
                  )}
                </button>
              </div>
            </div>

            {/* Popular agricultural hubs */}
            <div className="mt-8">
              <p className="text-xs font-black text-slate-700 uppercase mb-3 ml-1 tracking-wider">
                Popular Agricultural Hubs
              </p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {Object.keys(POPULAR_HUBS).map((key) => {
                  const hub = POPULAR_HUBS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => pickHub(key)}
                      disabled={loading}
                      className="px-3.5 py-2.5 text-xs bg-slate-100 hover:bg-emerald-100 hover:text-emerald-950 border-2 border-slate-300 hover:border-emerald-500 rounded-xl transition-all duration-150 cursor-pointer text-slate-800 disabled:opacity-50 font-black shadow-sm"
                    >
                      {hub.name}{" "}
                      <span className="text-slate-600 font-bold ml-1">
                        ({hub.state.substring(0, 2)})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Platform info footer */}
          <div className="text-center text-xs text-slate-800 mt-6 font-bold leading-relaxed bg-white/70 border border-slate-200 rounded-2xl p-3.5 shadow-sm">
            ℹ️ Location settings are completely independent.<br />
            Currently configuring location for:{" "}
            <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg inline-block mt-1">
              {platform === "farmer" ? "Farmer Platform" : "Consumer Platform"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page wrapper with Suspense (required for useSearchParams) ──────── */
export default function ChangeLocationPage() {
  const { t } = useTranslation();
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