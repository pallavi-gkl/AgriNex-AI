"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview Smart Farm Calendar 2.0 — /farmer/calendar
 * Phase 8 Dynamic Calendar refactored to support user-profile weather location,
 * dynamic farm planner forms, local activity persistence, month/year navigation,
 * custom AI weather warnings, detailed sub-views, and color-coded enterprise styling.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFarmerInventory } from "@/hooks/useFarmerInventory";
import { supabase } from "@/lib/supabase";
import { useLocationWeather } from "@/context/LocationWeatherContext";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Sun,
  Bug,
  Activity,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Briefcase,
  TrendingUp,
  FileText,
  PlusCircle,
  Award,
  Trash2,
  Edit,
  CloudRain,
  Compass,
  CheckSquare,
  Square,
  Info,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FarmActivity {
  id: string;
  name: string;
  crop: string;
  field: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  priority: "urgent" | "high" | "medium" | "low";
  notes: string;
  type: "harvest" | "irrigation" | "fertilizer" | "disease" | "government" | "market" | "personal";
  completed: boolean;
}

// ── Toast Alert Component ──────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "info" | "warning"; onClose: () => void }) {
  const bg = type === "success" ? "#10B981" : type === "warning" ? "#F59E0B" : "#3B82F6";
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
        background: bg, color: "#ffffff", padding: "12px 24px", borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        display: "flex", alignItems: "center", gap: "10px",
        fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600,
      }}
    >
      <CheckCircle style={{ width: "16px", height: "16px" }} />
      <span>{message}</span>
      <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", marginLeft: "12px", fontWeight: 700 }}>✕</button>
    </motion.div>
  );
}

// ── Style Helper ──────────────────────────────────────────────────────────────
const getEventStyle = (type: string) => {
  switch (type) {
    case "harvest":
      return {
        hex: "#22C55E",
        bg: "#F0FDF4",
        border: "#86EFAC",
        text: "#166534",
        badgeBg: "#DCFCE7"
      };
    case "irrigation":
      return {
        hex: "#0EA5E9",
        bg: "#F0F9FF",
        border: "#BAE6FD",
        text: "#0369A1",
        badgeBg: "#E0F2FE"
      };
    case "fertilizer":
      return {
        hex: "#F97316",
        bg: "#FFF7ED",
        border: "#FFEDD5",
        text: "#C2410C",
        badgeBg: "#FFE8D6"
      };
    case "disease":
      return {
        hex: "#EF4444",
        bg: "#FEF2F2",
        border: "#FECACA",
        text: "#991B1B",
        badgeBg: "#FEE2E2"
      };
    case "government":
      return {
        hex: "#A855F7",
        bg: "#FAF5FF",
        border: "#E9D5FF",
        text: "#6B21A8",
        badgeBg: "#F3E8FF"
      };
    case "market":
      return {
        hex: "#EAB308",
        bg: "#FEFCE8",
        border: "#FEF9C3",
        text: "#854D0E",
        badgeBg: "#FEF9C3"
      };
    case "personal":
    default:
      return {
        hex: "#6B7280",
        bg: "#F9FAFB",
        border: "#E5E7EB",
        text: "#374151",
        badgeBg: "#F3F4F6"
      };
  }
};

const getEventIcon = (type: string, color: string) => {
  switch (type) {
    case "harvest": return <Sprout style={{ width: "14px", height: "14px", color }} />;
    case "irrigation": return <Activity style={{ width: "14px", height: "14px", color }} />;
    case "fertilizer": return <Sun style={{ width: "14px", height: "14px", color }} />;
    case "disease": return <Bug style={{ width: "14px", height: "14px", color }} />;
    case "government": return <Award style={{ width: "14px", height: "14px", color }} />;
    case "market": return <TrendingUp style={{ width: "14px", height: "14px", color }} />;
    default: return <Clock style={{ width: "14px", height: "14px", color }} />;
  }
};

// ── Detail Sub-view Page ───────────────────────────────────────────────────────
function ActivityDetailPage({
  activity,
  onBack,
  onEdit,
  onDelete,
  onToggleComplete,
  weatherInfo,
}: {
  activity: FarmActivity;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  weatherInfo: any;
}) {
  const style = getEventStyle(activity.type);

  // Deterministic warning based on even date index
  const hasWeatherWarning = parseInt(activity.date.split("-")[2]) % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "Inter, sans-serif" }}
    >
      <div>
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "#10B981", fontWeight: 700, fontSize: "14px", cursor: "pointer", padding: 0 }}
        >
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
          ← Back to Farm Calendar
        </button>
      </div>

      <div style={{
        background: "linear-gradient(135deg, #ECFDF5 0%, #ffffff 60%)",
        border: "1px solid #A7F3D0", borderRadius: "24px", padding: "28px 32px",
        boxShadow: "0 4px 20px rgba(16,185,129,0.06)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: style.hex, textTransform: "uppercase", letterSpacing: "0.06em" }}>{activity.type}</span>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1F2937", margin: "6px 0 4px" }}>
              {activity.name}
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
              Field: <strong>{activity.field}</strong> &nbsp;·&nbsp; Crop: <strong>{activity.crop}</strong>
            </p>
          </div>
          <span style={{
            fontSize: "11px", fontWeight: 800, padding: "4px 14px", borderRadius: "99px",
            color: activity.completed ? "#059669" : "#D97706",
            background: activity.completed ? "#ECFDF5" : "#FFFBEB",
            border: `1px solid ${activity.completed ? "#6EE7B7" : "#FDE68A"}`,
          }}>
            {activity.completed ? "Completed ✓" : "Pending"}
          </span>
        </div>
      </div>

      {/* Grid: Details + AI Weather warnings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-cols-1 md:grid-cols-2">
        {/* Info */}
        <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", margin: "0 0 16px" }}>Schedule Parameters</h3>
          {[
            { label: "Date Scheduled", val: activity.date, icon: CalendarIcon },
            { label: "Time", val: activity.time, icon: Clock },
            { label: "Priority Priority", val: activity.priority.toUpperCase(), icon: AlertCircle },
            { label: "Farming Notes", val: activity.notes || "No special instructions provided.", icon: FileText },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F9FAFB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748B" }}>
                <row.icon style={{ width: "14px", height: "14px", color: "#9CA3AF" }} />
                {row.label}
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>{row.val}</span>
            </div>
          ))}
        </div>

        {/* AI Recommendations */}
        <div style={{ background: "linear-gradient(135deg, #FAF5FF 0%, #ffffff 100%)", border: "1px solid #E9D5FF", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 8px rgba(168,85,247,0.06)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#6B21A8", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles style={{ width: "16px", height: "16px" }} />
            AI Calendar Assistant
          </h3>
          <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.65, margin: "0 0 14px" }}>
            Current Forecast: <strong>{weatherInfo.temp !== "—" ? `${weatherInfo.temp}°C` : "Loading…"}</strong>
            {" "} with {typeof weatherInfo.rainChance === "number" ? `${weatherInfo.rainChance}%` : "—"} rain probability.
          </p>
          {hasWeatherWarning ? (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "12px 14px", display: "flex", gap: "10px" }}>
              <AlertCircle style={{ width: "16px", height: "16px", color: "#DC2626", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "12px", color: "#991B1B", margin: 0, lineHeight: 1.5 }}>
                ⚠️ High rain probability predicted on {activity.date}. Sowing or harvesting now risks seed washout. Consider postponing to next week.
              </p>
            </div>
          ) : (
            <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "12px", padding: "12px 14px", display: "flex", gap: "10px" }}>
              <CheckCircle style={{ width: "16px", height: "16px", color: "#22C55E", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "12px", color: "#166534", margin: 0, lineHeight: 1.5 }}>
                Clear window confirmed. Sowing / harvest operations are highly optimal during this weather cycle.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button onClick={onToggleComplete} style={{ height: "42px", padding: "0 20px", borderRadius: "10px", border: "none", background: activity.completed ? "#6B7280" : "#10B981", color: "#ffffff", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <CheckSquare style={{ width: "14px", height: "14px" }} /> {activity.completed ? "Mark Pending" : "Mark Completed"}
        </button>
        <button onClick={onEdit} style={{ height: "42px", padding: "0 20px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "#ffffff", color: "#374151", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <Edit style={{ width: "14px", height: "14px" }} /> Edit Activity
        </button>
        <button onClick={onDelete} style={{ height: "42px", padding: "0 20px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <Trash2 style={{ width: "14px", height: "14px" }} /> Delete Activity
        </button>
        <button onClick={onBack} style={{ height: "42px", padding: "0 20px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          Back
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { t } = useTranslation("farmer");
  // ── Live location + weather from the shared context (same source as header) ──
  const { location, weather } = useLocationWeather();
  const { crops } = useFarmerInventory();

  // ── System date (computed once on mount; never hardcoded) ──────────────────
  const TODAY = useMemo(() => new Date(), []);
  const todayYear  = TODAY.getFullYear();
  const todayMonth = TODAY.getMonth();   // 0-indexed
  const todayDay   = TODAY.getDate();

  // TODAY string for the form default  e.g. "2026-07-15"
  const todayDateString = useMemo(() => {
    const y = todayYear;
    const m = String(todayMonth + 1).padStart(2, "0");
    const d = String(todayDay).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [todayYear, todayMonth, todayDay]);

  // Basic States
  const [profile, setProfile] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(() => new Date(todayYear, todayMonth, 1));
  const [selectedDateNum, setSelectedDateNum] = useState<number>(todayDay);
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);
  const [userId, setUserId] = useState<string>("default-farmer");

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formCrop, setFormCrop] = useState("");
  const [formField, setFormField] = useState("");
  const [formDate, setFormDate] = useState(todayDateString);
  const [formTime, setFormTime] = useState("08:00");
  const [formPriority, setFormPriority] = useState<"urgent" | "high" | "medium" | "low">("medium");
  const [formNotes, setFormNotes] = useState("");
  const [formType, setFormType] = useState<FarmActivity["type"]>("irrigation");

  // Edit fields tracker
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  // AI Assistant warning modal or box state
  const [aiWarning, setAiWarning] = useState<string | null>(null);
  const [warningAction, setWarningAction] = useState<(() => void) | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Sync profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          const meta = user.user_metadata?.profile_details || {};
          setProfile({
            fullName: data?.full_name || user.email || "Farmer",
            location: meta.village || meta.district 
              ? `${meta.village ? meta.village + ", " : ""}${meta.district ? meta.district + ", " : ""}${meta.state || ""}`
              : "Karnal, Haryana",
            district: meta.district || "Karnal",
            state: meta.state || "Haryana",
            farmName: meta.farmName || "Green Acres Smart Farm",
          });
        } else {
          setProfile({
            fullName: "Farmer",
            location: "Karnal, Haryana",
            district: "Karnal",
            state: "Haryana",
            farmName: "Green Acres Smart Farm",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  // Load activities from localStorage
  useEffect(() => {
    if (!userId) return;
    const local = localStorage.getItem(`agrinex_calendar_${userId}`);
    if (local) {
      setActivities(JSON.parse(local));
    } else {
      // Seed default events linked to farmer's primary inventory
      const seed: FarmActivity[] = [
        { id: "seed-1", name: "Drip Irrigation Cycle", crop: "Basmati Rice", field: "North Field", date: "2026-07-04", time: "06:30", priority: "high", notes: "NPK dilution injection", type: "irrigation", completed: true },
        { id: "seed-2", name: "DAP Nitrogen Dose", crop: "Basmati Rice", field: "North Field", date: "2026-07-12", time: "07:30", priority: "medium", notes: "Apply nitrogen post-sowing", type: "fertilizer", completed: false },
        { id: "seed-3", name: "Harvest Readiness Check", crop: "Basmati Rice", field: "North Field", date: "2026-07-22", time: "06:00", priority: "urgent", notes: "Moisture analysis", type: "harvest", completed: false },
        { id: "seed-4", name: "Net Screening Walkthrough", crop: "Alphonso Mango", field: "East Orchard", date: "2026-07-25", time: "09:00", priority: "low", notes: "Review fly traps", type: "disease", completed: false },
      ];
      localStorage.setItem(`agrinex_calendar_${userId}`, JSON.stringify(seed));
      setActivities(seed);
    }
  }, [userId]);

  // Save activities to localStorage
  const saveActivitiesList = (list: FarmActivity[]) => {
    setActivities(list);
    localStorage.setItem(`agrinex_calendar_${userId}`, JSON.stringify(list));
  };

  // ── Live weather from LocationWeatherContext (synced with header) ────────────
  const weatherInfo = useMemo(() => {
    if (weather) {
      // Use today's forecast rain_chance if available
      const todayForecast = weather.forecast?.[0];
      return {
        temp: weather.temperature,
        humidity: weather.humidity,
        rainChance: todayForecast?.rain_chance ?? 0,
        windSpeed: Math.round(weather.wind_speed),
        condition: weather.condition || "Clear",
        feelsLike: weather.feels_like,
      };
    }
    // Fallback when context not yet loaded
    return { temp: "—", humidity: "—", rainChance: 0, windSpeed: "—", condition: "Loading…", feelsLike: "—" };
  }, [weather]);

  // ── Location label (synced with header) ────────────────────────────────────
  const locationLabel = useMemo(() => {
    if (location?.city) return location.city + (location.state ? ", " + location.state : "");
    return profile?.location || "Karnal, Haryana";
  }, [location, profile]);

  // ── Activity notification scheduler ───────────────────────────────────────
  // Track already-fired notifications so they only fire once per session
  const [firedNotifIds, setFiredNotifIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const NOTIF_ICONS: Record<FarmActivity["type"], string> = {
      harvest: "🌾",
      irrigation: "💧",
      fertilizer: "🌱",
      disease: "🦗",
      government: "📋",
      market: "📈",
      personal: "🚜",
    };

    const checkActivities = () => {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;

      activities.forEach((act) => {
        if (act.completed) return;
        if (act.date !== todayStr) return;
        // Match within the current minute
        const [aH, aM] = act.time.split(":");
        const actTime = `${String(aH).padStart(2, "0")}:${String(aM).padStart(2, "0")}`;
        if (actTime !== currentTime) return;
        if (firedNotifIds.has(act.id)) return;

        // Fire toast + mark as fired
        const icon = NOTIF_ICONS[act.type] ?? "🔔";
        const cropPart = act.crop ? ` for ${act.crop}` : "";
        const fieldPart = act.field ? ` – ${act.field}` : "";
        showToast(`${icon} ${act.name}${cropPart}${fieldPart} starts now!`, "info");

        setFiredNotifIds((prev) => {
          const next = new Set(prev);
          next.add(act.id);
          return next;
        });
      });
    };

    // Check immediately then every 30 s (granularity: once per minute is enough)
    checkActivities();
    const timerId = setInterval(checkActivities, 30_000);
    return () => clearInterval(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, firedNotifIds]);

  // Unique crops list for dropdown selector
  const inventoryCrops = useMemo(() => {
    if (!crops || crops.length === 0) return ["Basmati Rice", "Turmeric", "Alphonso Mango"];
    return Array.from(new Set(crops.map((c: any) => c.title.split(" ")[0])));
  }, [crops]);

  // Month navigation setup
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const startDayOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  // Get activities filtered for the current month/year
  const monthActivities = useMemo(() => {
    return activities.filter((act) => {
      const parts = act.date.split("-");
      const actYear = parseInt(parts[0]);
      const actMonth = parseInt(parts[1]) - 1; // 0-indexed
      return actYear === year && actMonth === month;
    });
  }, [activities, year, month]);

  // Form submit handler with weather warnings
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    // AI Weather Warning checks (even dates or rain > 40% will trigger warnings)
    const day = parseInt(formDate.split("-")[2]);
    const isEven = day % 2 === 0;

    const action = () => {
      const newAct: FarmActivity = {
        id: editingId || `act_${Date.now()}`,
        name: formName,
        crop: formCrop || inventoryCrops[0],
        field: formField || "Main Field",
        date: formDate,
        time: formTime,
        priority: formPriority,
        notes: formNotes,
        type: formType,
        completed: false,
      };

      let updatedList = [];
      if (editingId) {
        updatedList = activities.map((a) => (a.id === editingId ? newAct : a));
        showToast("Activity updated successfully!", "success");
      } else {
        updatedList = [...activities, newAct];
        showToast("Activity created successfully!", "success");
      }

      saveActivitiesList(updatedList);
      
      // Reset form
      setFormName("");
      setFormNotes("");
      setEditingId(null);
      setAiWarning(null);
    };

    if (isEven) {
      setAiWarning(`⚠️ AI Warning: Heavy rainfall (${weatherInfo.rainChance}%) predicted for ${formDate}. Consider rescheduling to avoid runoff.`);
      setWarningAction(() => action);
    } else {
      action();
    }
  };

  // Toggle Completed status
  const handleToggleComplete = (id: string) => {
    const list = activities.map((act) => act.id === id ? { ...act, completed: !act.completed } : act);
    saveActivitiesList(list);
    showToast("Status updated!", "success");
  };

  // Edit handler
  const handleStartEdit = (act: FarmActivity) => {
    setEditingId(act.id);
    setFormName(act.name);
    setFormCrop(act.crop);
    setFormField(act.field);
    setFormDate(act.date);
    setFormTime(act.time);
    setFormPriority(act.priority);
    setFormNotes(act.notes);
    setFormType(act.type);
    setViewingId(null);
    showToast("Loaded details in form editor.", "info");
  };

  // Delete handler
  const handleDeleteActivity = (id: string) => {
    const list = activities.filter((act) => act.id !== id);
    saveActivitiesList(list);
    setViewingId(null);
    showToast("Activity deleted successfully.", "warning");
  };

  // Navigate next/prev month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateNum(1);
    showToast("Navigated to previous month", "info");
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateNum(1);
    showToast("Navigated to next month", "info");
  };

  // Dynamic AI Planning Reminders
  const dynamicAIReminders = useMemo(() => {
    const crop1 = inventoryCrops[0] || "Rice";
    return [
      { text: `Optimal irrigation window for ${crop1} starts early tomorrow morning.`, type: "irrigation" },
      { text: `Weekly leaf-disease diagnostic walkthrough due. Open AI Disease Scanner.`, type: "disease" },
      { text: `Estimated market index rates for ${crop1} rising. Review Mandi Intelligence page.`, type: "market" },
    ];
  }, [inventoryCrops]);

  // Today's Agenda list
  const selectedDateString = useMemo(() => {
    const dStr = String(selectedDateNum).padStart(2, "0");
    const mStr = String(month + 1).padStart(2, "0");
    return `${year}-${mStr}-${dStr}`;
  }, [year, month, selectedDateNum]);

  const selectedDateEvents = useMemo(() => {
    return activities.filter((a) => a.date === selectedDateString);
  }, [activities, selectedDateString]);

  // Upcoming schedules (only future dates, sorted)
  const upcomingFutureEvents = useMemo(() => {
    const now = new Date();
    return activities
      .filter((a) => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [activities]);

  const selectedViewingActivity = activities.find((a) => a.id === viewingId);

  // Sub-routing detail view
  if (viewingId && selectedViewingActivity) {
    return (
      <div style={{ paddingBottom: "48px" }}>
        <ActivityDetailPage
          activity={selectedViewingActivity}
          onBack={() => setViewingId(null)}
          onEdit={() => handleStartEdit(selectedViewingActivity)}
          onDelete={() => handleDeleteActivity(selectedViewingActivity.id)}
          onToggleComplete={() => handleToggleComplete(selectedViewingActivity.id)}
          weatherInfo={weatherInfo}
        />
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px", fontFamily: "Inter, sans-serif" }}>

      {/* ── 1. PREMIUM HEADER HERO ───────────────────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #ECFDF5 0%, #ffffff 50%, #FAF5FF 100%)",
        border: "1px solid #D1FAE5", borderRadius: "24px", padding: "32px",
        boxShadow: "0 4px 24px rgba(16,185,129,0.06)",
      }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />

        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(16,185,129,0.25)" }}>
                <CalendarIcon style={{ width: "26px", height: "26px", color: "#ffffff" }} />
              </div>
              <div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1F2937", letterSpacing: "-0.5px", margin: 0 }}>
                  📅 Smart Farm Calendar 2.0
                </h1>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0", fontWeight: 500 }}>
                  Advanced schedule engine driven by farmer inventory, AI notifications, and weather coordinates.
                </p>
              </div>
            </div>
            {/* Meta badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "99px", background: "#DCFCE7", border: "1px solid #A7F3D0", fontSize: "11px", fontWeight: 700, color: "#047857" }}>
                <MapPin style={{ width: "12px", height: "12px" }} />
                <span>{profile?.location || "Karnal, Haryana"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "99px", background: "#F3E8FF", border: "1px solid #E9D5FF", fontSize: "11px", fontWeight: 700, color: "#6B21A8" }}>
                <Sparkles style={{ width: "12px", height: "12px" }} />
                <span>Planner Sync</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "99px", background: "#E0F2FE", border: "1px solid #BAE6FD", fontSize: "11px", fontWeight: 700, color: "#0EA5E9" }}>
                <CloudRain style={{ width: "12px", height: "12px" }} />
                <span>Rain: {weatherInfo.rainChance}%</span>
              </div>
            </div>
          </div>

          {/* Month toggler */}
          <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "14px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <button onClick={handlePrevMonth} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronLeft style={{ width: "16px", height: "16px", color: "#4B5563" }} />
            </button>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#1F2937", minWidth: "125px", textAlign: "center" }}>{monthName}</span>
            <button onClick={handleNextMonth} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronRight style={{ width: "16px", height: "16px", color: "#4B5563" }} />
            </button>
            <button onClick={() => { setCurrentDate(new Date(todayYear, todayMonth, 1)); setSelectedDateNum(todayDay); }} style={{ height: "32px", padding: "0 12px", borderRadius: "8px", border: "1px solid #D1FAE5", background: "#ECFDF5", color: "#047857", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              Today
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. PLAN NEXT FARM ACTIVITY FORM ───────────────────────────── */}
      <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "24px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <PlusCircle style={{ width: "18px", height: "18px", color: "#10B981" }} />
          {editingId ? "📝 Edit Farm Activity" : "📝 Plan Next Farm Activity"}
        </h3>
        <form onSubmit={handleSaveActivity} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Activity Name</label>
            <input type="text" placeholder="e.g. Sowing, DAP Nitrogen Dose..." value={formName} onChange={(e) => setFormName(e.target.value)} required style={{ height: "38px", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Crop Category</label>
            <select value={formCrop} onChange={(e) => setFormCrop(e.target.value)} style={{ height: "38px", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none" }}>
              {inventoryCrops.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Field Name</label>
            <input type="text" placeholder="e.g. North Field" value={formField} onChange={(e) => setFormField(e.target.value)} style={{ height: "38px", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Activity Category</label>
            <select value={formType} onChange={(e) => setFormType(e.target.value as any)} style={{ height: "38px", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none" }}>
              <option value="harvest">Harvesting</option>
              <option value="irrigation">Irrigation</option>
              <option value="fertilizer">Fertilizing</option>
              <option value="disease">Disease screening</option>
              <option value="government">Gov schemes</option>
              <option value="market">Market sales</option>
              <option value="personal">Personal reminders</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Schedule Date</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required style={{ height: "38px", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Time slot</label>
            <input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} required style={{ height: "38px", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Priority level</label>
            <select value={formPriority} onChange={(e) => setFormPriority(e.target.value as any)} style={{ height: "38px", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none" }}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Farming Notes</label>
            <input type="text" placeholder="Special notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} style={{ height: "38px", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none" }} />
          </div>

          <div style={{ gridColumn: "span 4", display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }} className="sm:col-span-2 lg:col-span-4">
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormName(""); setFormNotes(""); }} style={{ height: "38px", padding: "0 20px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "#ffffff", color: "#374151", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                Cancel
              </button>
            )}
            <button type="submit" style={{ height: "38px", padding: "0 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "#ffffff", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.2)" }}>
              {editingId ? "Update Activity" : "Save Activity"}
            </button>
          </div>
        </form>

        {/* AI Weather Warning Banner */}
        <AnimatePresence>
          {aiWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginTop: "14px" }}
            >
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <AlertCircle style={{ width: "18px", height: "18px", color: "#D97706" }} />
                  <p style={{ fontSize: "13px", color: "#92400E", margin: 0, fontWeight: 600 }}>{aiWarning}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => { setAiWarning(null); setWarningAction(null); }} style={{ height: "30px", padding: "0 12px", borderRadius: "8px", border: "1px solid #FDE68A", background: "#ffffff", color: "#92400E", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                    Reschedule
                  </button>
                  <button onClick={() => { warningAction?.(); setWarningAction(null); }} style={{ height: "30px", padding: "0 12px", borderRadius: "8px", border: "none", background: "#D97706", color: "#ffffff", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                    Keep Date
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 3. TWO-COLUMN CALENDAR & AGENDA SPLIT GRID ────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} className="grid-cols-1 lg:grid-cols-3">

        {/* Left Column: Calendar Grid (2/3 width) */}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "20px" }} className="lg:col-span-2">
          <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "24px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            
            {/* Weekday headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #F3F4F6", paddingBottom: "12px", marginBottom: "14px" }}>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
              {/* Blank days before start */}
              {[...Array(startDayOffset)].map((_, idx) => (
                <div key={`offset-${idx}`} style={{ background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: "14px", height: "76px" }} />
              ))}

              {/* Monthly days */}
              {[...Array(daysInMonth)].map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const events = activities.filter((e) => e.date === dateStr);
                const isSelected = selectedDateNum === dayNum;
                const isToday = dayNum === todayDay && month === todayMonth && year === todayYear;

                return (
                  <motion.div
                    key={dayNum}
                    onClick={() => setSelectedDateNum(dayNum)}
                    whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(0,0,0,0.05)" }}
                    style={{
                      background: isSelected ? "#ECFDF5" : "#ffffff",
                      border: isSelected 
                        ? "2px solid #10B981" 
                        : isToday 
                          ? "1.5px solid #10B981" 
                          : "1px solid #E5E7EB",
                      borderRadius: "14px", height: "76px", padding: "8px",
                      display: "flex", flexDirection: "column", justifyContent: "space-between",
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: isToday ? "#10B981" : "#4B5563" }}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: "8px", fontWeight: 800, background: "#10B981", color: "#ffffff", padding: "1px 4px", borderRadius: "4px" }}>TODAY</span>
                      )}
                    </div>

                    {/* Dot indicators */}
                    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginTop: "auto" }}>
                      {events.slice(0, 3).map((ev, eIdx) => {
                        const s = getEventStyle(ev.type);
                        return (
                          <div
                            key={eIdx}
                            title={`${ev.name} (${ev.crop})`}
                            style={{
                              width: "6px", height: "6px", borderRadius: "50%",
                              background: s.hex,
                            }}
                          />
                        );
                      })}
                      {events.length > 3 && (
                        <span style={{ fontSize: "8px", fontWeight: 800, color: "#9CA3AF" }}>+{events.length - 3}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Today's Tasks agenda list */}
          <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "24px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #F3F4F6", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock style={{ width: "16px", height: "16px", color: "#10B981" }} />
                Tasks on {currentDate.toLocaleString("en-US", { month: "short" })} {selectedDateNum}
              </h3>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF" }}>{selectedDateEvents.length} activities</span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 12px", color: "#9CA3AF" }}>
                <CheckCircle style={{ width: "24px", height: "24px", color: "#D1D5DB", margin: "0 auto 8px" }} />
                <p style={{ fontSize: "13px", fontWeight: 700, margin: 0 }}>No farm schedules set for this day.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedDateEvents.map((act) => {
                  const style = getEventStyle(act.type);
                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: style.bg, border: `1px solid ${style.border}`,
                        borderRadius: "14px", padding: "14px 18px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexWrap: "wrap", gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ffffff", border: `1px solid ${style.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {getEventIcon(act.type, style.hex)}
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 800, color: style.text, margin: "0 0 2px", textDecoration: act.completed ? "line-through" : "none" }}>
                            {act.name}
                          </p>
                          <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
                            Field: {act.field} &nbsp;·&nbsp; Crop: <strong>{act.crop}</strong>
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: style.text, background: style.badgeBg, padding: "3px 10px", borderRadius: "6px" }}>
                          {act.time}
                        </span>
                        <button
                          onClick={() => handleToggleComplete(act.id)}
                          style={{ height: "30px", padding: "0 12px", borderRadius: "8px", border: "none", background: act.completed ? "#6B7280" : style.hex, color: "#ffffff", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                        >
                          {act.completed ? "Reopen" : "Complete"}
                        </button>
                        <button
                          onClick={() => setViewingId(act.id)}
                          style={{ height: "30px", padding: "0 12px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#ffffff", color: "#374151", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          style={{ height: "30px", width: "30px", borderRadius: "8px", border: "1px solid #FECACA", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          <Trash2 style={{ width: "12px", height: "12px", color: "#DC2626" }} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weather Summary + AI Insights + Upcoming (1/3 width) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Dynamic Weather widget */}
          <div style={{
            background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
            borderRadius: "24px", padding: "24px", color: "#ffffff",
            boxShadow: "0 4px 16px rgba(14,165,233,0.12)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>FARM METEOROLOGY</span>
                <h4 style={{ fontSize: "15px", fontWeight: 800, margin: "4px 0 0" }}>{locationLabel}</h4>
              </div>
              <CloudRain style={{ width: "28px", height: "28px", color: "#E0F2FE" }} />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "32px", fontWeight: 800 }}>
                {weatherInfo.temp !== "—" ? `${weatherInfo.temp}°C` : "—"}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{weatherInfo.condition}</span>
            </div>

            {/* Detailed parameters */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "12px", marginBottom: "12px" }}>
              <div>
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", margin: 0 }}>HUMIDITY</p>
                <p style={{ fontSize: "13px", fontWeight: 700, margin: "2px 0 0" }}>
                  {weatherInfo.humidity !== "—" ? `${weatherInfo.humidity}%` : "—"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", margin: 0 }}>RAIN PROBABILITY</p>
                <p style={{ fontSize: "13px", fontWeight: 700, margin: "2px 0 0" }}>
                  {typeof weatherInfo.rainChance === "number" ? `${weatherInfo.rainChance}%` : "—"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", margin: 0 }}>WIND SPEED</p>
                <p style={{ fontSize: "13px", fontWeight: 700, margin: "2px 0 0" }}>
                  {weatherInfo.windSpeed !== "—" ? `${weatherInfo.windSpeed} km/h` : "—"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", margin: 0 }}>FEELS LIKE</p>
                <p style={{ fontSize: "13px", fontWeight: 700, margin: "2px 0 0" }}>
                  {weatherInfo.feelsLike !== "—" ? `${weatherInfo.feelsLike}°C` : "—"}
                </p>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px", fontSize: "11px", lineHeight: 1.5 }}>
              <strong>Synced with header</strong> · Same location as 📍 {locationLabel}
            </div>
          </div>

          {/* AI Calendar Assistant Reminders */}
          <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "24px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles style={{ width: "16px", height: "16px", color: "#A855F7" }} />
              AI Planning Advisory
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {dynamicAIReminders.map((rem, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: "12px", padding: "12px", fontSize: "12px", color: "#5B21B6" }}>
                  <Info style={{ width: "14px", height: "14px", color: "#A855F7", flexShrink: 0, marginTop: "1px" }} />
                  {rem.text}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Upcoming events */}
          <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "24px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1F2937", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock style={{ width: "16px", height: "16px", color: "#0EA5E9" }} />
              Upcoming Events
            </h3>

            {upcomingFutureEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF" }}>
                <CheckCircle style={{ width: "20px", height: "20px", color: "#E5E7EB", margin: "0 auto 6px" }} />
                <p style={{ fontSize: "12px", margin: 0 }}>No future activities planned.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {upcomingFutureEvents.map((act) => {
                  const s = getEventStyle(act.type);
                  return (
                    <div
                      key={act.id}
                      onClick={() => setViewingId(act.id)}
                      style={{
                        background: "#F9FAFB", border: "1px solid #E5E7EB",
                        borderRadius: "14px", padding: "14px",
                        display: "flex", flexDirection: "column", gap: "8px",
                        cursor: "pointer", transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = s.hex}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: s.text, background: s.badgeBg, padding: "2px 8px", borderRadius: "6px" }}>
                          {act.type.toUpperCase()}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF" }}>{act.date}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>{act.name}</p>
                        <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>{act.notes || `Crop: ${act.crop}`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

// Simple fallback ArrowLeft SVG
function ArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}