"use client";

/**
 * @fileoverview LocationWeatherContext
 * Manages the user's real geolocation, current weather from Open-Meteo,
 * and dynamically generated nearby mandi/market prices.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface LocationData {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  permissionStatus: "prompt" | "granted" | "denied" | "loading";
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  uv_index: number;
  condition: string;
  condition_icon: string;
  codeType: string;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    rain_chance: number;
  }>;
}

export interface MandiPrice {
  crop: string;
  mandi: string;
  price: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  demand: "very_high" | "high" | "medium" | "low";
}

interface LocationWeatherContextValue {
  location: LocationData | null;
  weather: WeatherData | null;
  nearbyMandis: MandiPrice[];
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  setManualLocation: (city: string, state: string) => Promise<void>;
}

const LocationWeatherContext = createContext<LocationWeatherContextValue>({
  location: null,
  weather: null,
  nearbyMandis: [],
  loading: false,
  error: null,
  requestLocation: () => {},
  setManualLocation: async () => {},
});

const CROPS_LIST = [
  { name: "Basmati Rice", basePrice: 85, unit: "Kg" },
  { name: "Wheat (Sharbati)", basePrice: 24, unit: "Kg" },
  { name: "Alphonso Mango", basePrice: 350, unit: "Kg" },
  { name: "Turmeric Finger", basePrice: 152, unit: "Kg" },
  { name: "Onion", basePrice: 32, unit: "Kg" },
  { name: "Potato", basePrice: 18, unit: "Kg" },
  { name: "Tomato", basePrice: 28, unit: "Kg" },
  { name: "Green Chilli", basePrice: 95, unit: "Kg" },
  { name: "Cotton", basePrice: 64, unit: "Kg" },
  { name: "Soybean", basePrice: 46, unit: "Kg" }
];

const DEFAULT_HUBS: Record<string, { lat: number; lng: number; state: string; name: string }> = {
  karnal: { lat: 29.6857, lng: 76.9905, state: "Haryana", name: "Karnal" },
  pune: { lat: 18.5204, lng: 73.8567, state: "Maharashtra", name: "Pune" },
  nashik: { lat: 19.9975, lng: 73.7898, state: "Maharashtra", name: "Nashik" },
  hapur: { lat: 28.7306, lng: 77.7758, state: "Uttar Pradesh", name: "Hapur" },
  guntur: { lat: 16.3067, lng: 80.4365, state: "Andhra Pradesh", name: "Guntur" },
  erode: { lat: 11.3410, lng: 77.7172, state: "Tamil Nadu", name: "Erode" },
  kolar: { lat: 13.1368, lng: 78.1293, state: "Karnataka", name: "Kolar" },
  ratnagiri: { lat: 16.9902, lng: 73.3120, state: "Maharashtra", name: "Ratnagiri" },
  indore: { lat: 22.7196, lng: 75.8577, state: "Madhya Pradesh", name: "Indore" },
  agra: { lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh", name: "Agra" },
  mumbai: { lat: 19.0760, lng: 72.8777, state: "Maharashtra", name: "Mumbai" },
  delhi: { lat: 28.6139, lng: 77.2090, state: "Delhi", name: "Delhi" },
  kochi: { lat: 9.9312, lng: 76.2673, state: "Kerala", name: "Kochi" },
};

function mapWeatherCode(code: number): { condition: string; icon: string; codeType: string } {
  if (code === 0) return { condition: "Clear Sky", icon: "☀️", codeType: "sun" };
  if (code >= 1 && code <= 3) return { condition: "Partly Cloudy", icon: "⛅", codeType: "cloud" };
  if (code === 45 || code === 48) return { condition: "Foggy", icon: "🌫️", codeType: "cloud" };
  if (code >= 51 && code <= 55) return { condition: "Drizzle", icon: "🌧️", codeType: "rain" };
  if (code >= 61 && code <= 65) return { condition: "Rainy", icon: "🌧️", codeType: "rain" };
  if (code >= 71 && code <= 75) return { condition: "Snowy", icon: "❄️", codeType: "snow" };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers", icon: "🌧️", codeType: "rain" };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorms", icon: "⛈️", codeType: "thunder" };
  return { condition: "Partly Cloudy", icon: "⛅", codeType: "cloud" };
}

function generateMandiPrices(city: string, state: string): MandiPrice[] {
  const cleanCity = city || "Local";
  const cleanState = state || "State";
  
  const mandiSuffixes = [
    "APMC",
    "Mandi",
    "Sub-Yard",
    "Market",
    "Cooperative",
    "Grain Yard",
    "Vegetable Market",
    "Fruit Yard",
    "Krishi Mandi",
    "Central APMC"
  ];

  return CROPS_LIST.map((crop, idx) => {
    const suffix = mandiSuffixes[idx % mandiSuffixes.length];
    const mandiName = `${cleanCity} ${suffix}`;
    
    let hash = 0;
    const str = cleanCity + crop.name;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const percentDiff = (hash % 15) / 100;
    const price = Math.round(crop.basePrice * (1 + percentDiff));
    
    const change = Math.round(((hash % 120) / 10) * 10) / 10;
    const trend = change > 1.5 ? "up" : change < -1.5 ? "down" : "stable";
    
    const demands: Array<"very_high" | "high" | "medium" | "low"> = ["very_high", "high", "medium", "low"];
    const demand = demands[Math.abs(hash) % demands.length];

    return {
      crop: crop.name,
      mandi: mandiName,
      price,
      unit: crop.unit,
      change,
      trend,
      demand
    };
  });
}

export function LocationWeatherProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [nearbyMandis, setNearbyMandis] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherAndMandis = useCallback(async (lat: number, lng: number, city: string, state: string, country: string, permission: LocationData["permissionStatus"]) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch weather from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`;
      const res = await fetch(weatherUrl);
      if (!res.ok) throw new Error("Failed to fetch weather data");
      
      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      
      const mappedCurrent = mapWeatherCode(current.weather_code);
      
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const forecast = (daily.time || []).map((timeStr: string, idx: number) => {
        const date = new Date(timeStr);
        const dayName = idx === 0 ? "Today" : daysOfWeek[date.getDay()];
        const maxTemp = Math.round(daily.temperature_2m_max[idx]);
        const minTemp = Math.round(daily.temperature_2m_min[idx]);
        const rainChance = Math.round(daily.precipitation_probability_max[idx] ?? 20);
        const dailyCode = daily.weather_code?.[idx] ?? 3;
        const mappedDaily = mapWeatherCode(dailyCode);
        return {
          day: dayName,
          high: maxTemp,
          low: minTemp,
          condition: mappedDaily.condition,
          icon: mappedDaily.icon,
          rain_chance: rainChance
        };
      });

      const weatherData: WeatherData = {
        temperature: Math.round(current.temperature_2m),
        feels_like: Math.round(current.apparent_temperature),
        humidity: Math.round(current.relative_humidity_2m),
        wind_speed: Math.round(current.wind_speed_10m),
        uv_index: Math.round(daily.uv_index_max?.[0] ?? 5),
        condition: mappedCurrent.condition,
        condition_icon: mappedCurrent.icon,
        codeType: mappedCurrent.codeType,
        forecast
      };

      // 2. Generate mandi prices based on location
      const mandis = generateMandiPrices(city, state);

      setLocation({
        city,
        state,
        country,
        latitude: lat,
        longitude: lng,
        permissionStatus: permission
      });
      setWeather(weatherData);
      setNearbyMandis(mandis);

      // Save to sessionStorage for fast restore
      sessionStorage.setItem("agrinex_city", city);
      sessionStorage.setItem("agrinex_state", state);
      sessionStorage.setItem("agrinex_country", country);
      sessionStorage.setItem("agrinex_lat", String(lat));
      sessionStorage.setItem("agrinex_lng", String(lng));
      sessionStorage.setItem("agrinex_permission", permission);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load weather data");
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using a free & fast API
          const geocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          const geoRes = await fetch(geocodeUrl);
          if (!geoRes.ok) throw new Error("Failed to reverse geocode");
          const geoData = await geoRes.json();
          
          const city = geoData.city || geoData.locality || "Your Location";
          const state = geoData.principalSubdivision || "";
          const country = geoData.countryName || "India";

          await fetchWeatherAndMandis(latitude, longitude, city, state, country, "granted");
        } catch (err) {
          // Fallback to coordinates but set permission as granted
          await fetchWeatherAndMandis(latitude, longitude, "Your Location", "", "India", "granted");
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setLocation((prev) => ({
          city: prev?.city || "",
          state: prev?.state || "",
          country: prev?.country || "India",
          latitude: prev?.latitude || 0,
          longitude: prev?.longitude || 0,
          permissionStatus: "denied"
        }));
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchWeatherAndMandis]);

  const setManualLocation = useCallback(async (cityInput: string, stateInput: string) => {
    setLoading(true);
    setError(null);
    const query = cityInput.trim().toLowerCase();
    
    let lat = 29.6857;
    let lng = 76.9905;
    let finalCity = cityInput;
    let finalState = stateInput;

    const hub = DEFAULT_HUBS[query];
    if (hub) {
      lat = hub.lat;
      lng = hub.lng;
      finalCity = hub.name;
      finalState = hub.state;
    } else {
      try {
        // Query Nominatim OpenStreetMap search API
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput + ", " + stateInput)}&format=json&limit=1`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat);
            lng = parseFloat(data[0].lon);
          }
        }
      } catch (err) {
        console.warn("Geocoding API failed, using default coordinate values", err);
      }
    }

    await fetchWeatherAndMandis(lat, lng, finalCity, finalState, "India", "denied");
  }, [fetchWeatherAndMandis]);

  // Auto-request or restore on load
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cachedCity = sessionStorage.getItem("agrinex_city");
    const cachedState = sessionStorage.getItem("agrinex_state");
    const cachedCountry = sessionStorage.getItem("agrinex_country");
    const cachedLat = sessionStorage.getItem("agrinex_lat");
    const cachedLng = sessionStorage.getItem("agrinex_lng");
    const cachedPerm = sessionStorage.getItem("agrinex_permission");

    if (cachedCity && cachedLat && cachedLng) {
      fetchWeatherAndMandis(
        parseFloat(cachedLat),
        parseFloat(cachedLng),
        cachedCity,
        cachedState || "",
        cachedCountry || "India",
        (cachedPerm as any) || "granted"
      );
    } else {
      // Attempt geolocation immediately
      requestLocation();
    }
  }, [requestLocation, fetchWeatherAndMandis]);

  return (
    <LocationWeatherContext.Provider
      value={{
        location,
        weather,
        nearbyMandis,
        loading,
        error,
        requestLocation,
        setManualLocation
      }}
    >
      {children}
    </LocationWeatherContext.Provider>
  );
}

export function useLocationWeather() {
  return useContext(LocationWeatherContext);
}
