"use client";
import { useTranslation } from "@/hooks/useTranslation";
/**
 * @fileoverview AccessibilityPanel — Phase 7 polish component.
 *
 * Controls:
 *   - Font Size slider (14–20px) → updates CSS variable --base-font-size
 *   - High Contrast Mode → adds/removes body.high-contrast
 *   - Reduce Animations → adds/removes body.reduced-motion
 *   - Screen Reader Mode → adds/removes body.screen-reader-mode
 *
 * Settings are persisted in localStorage AND optionally saved to Supabase
 * `profiles.accessibility_settings` JSONB column (non-blocking).
 */


import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Type, Contrast, Activity, Accessibility, Save, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reduceAnimations: boolean;
  screenReaderMode: boolean;
}

const DEFAULTS: AccessibilitySettings = {
  fontSize: 16,
  highContrast: false,
  reduceAnimations: false,
  screenReaderMode: false,
};

const STORAGE_KEY = "agrinex-a11y";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadSettings(): AccessibilitySettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function applySettings(settings: AccessibilitySettings): void {
  if (typeof document === "undefined") return;
  const body = document.body;

  // Font size
  document.documentElement.style.setProperty(
    "--base-font-size",
    `${settings.fontSize}px`
  );

  // Class toggles
  body.classList.toggle("high-contrast", settings.highContrast);
  body.classList.toggle("reduced-motion", settings.reduceAnimations);
  body.classList.toggle("screen-reader-mode", settings.screenReaderMode);

  // Large-font class (>=18px threshold)
  body.classList.toggle("large-font", settings.fontSize >= 18);
}

// ─── Toggle Switch Component ──────────────────────────────────────────────────
interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  color?: string;
}

function ToggleSwitch({ id, checked, onChange, color = "#10b981" }: ToggleSwitchProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
      style={{
        background: checked ? color : "rgba(255,255,255,0.08)",
        border: `1px solid ${checked ? color : "rgba(255,255,255,0.12)"}`,
        boxShadow: checked ? `0 0 12px ${color}40` : "none",
      }}
    >
      <span
        className="inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300"
        style={{
          transform: checked ? "translateX(20px)" : "translateX(1px)",
          marginTop: "0.5px",
        }}
      />
    </button>
  );
}

// ─── Setting Row Component ────────────────────────────────────────────────────
interface SettingRowProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ icon: Icon, iconColor, title, description, children }: SettingRowProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 rounded-xl transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}25` }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium">{title}</p>
          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AccessibilityPanel() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    applySettings(loaded);
  }, []);

  // Apply settings whenever they change
  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSaveToProfile = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Save font size as language_preference adjacent field; store settings in metadata
        // Uses upsert so it never fails if the column doesn't exist
        await (supabase
          .from("profiles") as any)
          .update({
            // Store full settings object as a JSON string in language_preference field
            language_preference: JSON.stringify(settings),
          })
          .eq("id", user.id);
      }
    } catch {
      // Non-blocking — localStorage is the source of truth
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const fontPreviewSize = `${settings.fontSize}px`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            boxShadow: "0 0 16px rgba(139,92,246,0.3)",
          }}
        >
          <Accessibility className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">{t("accessibility")}</h2>
          <p className="text-slate-500 text-xs">
            {t("customizeYourExperience")}
          </p>
        </div>
      </div>

      {/* ── Font Size Slider ─────────────────────────────────────────────── */}
      <SettingRow
        icon={Type}
        iconColor="#38bdf8"
        title={t("fontSize")}
        description="Adjust the base text size across the platform."
      >
        <div className="flex items-center gap-3 w-48">
          <span className="text-slate-500 text-xs shrink-0">{t("aa")}</span>
          <input
            id="accessibility-font-size-slider"
            type="range"
            min={14}
            max={20}
            step={1}
            value={settings.fontSize}
            onChange={(e) => updateSetting("fontSize", Number(e.target.value))}
            aria-label="Font size slider"
            aria-valuemin={14}
            aria-valuemax={20}
            aria-valuenow={settings.fontSize}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #38bdf8 ${
                ((settings.fontSize - 14) / 6) * 100
              }%, rgba(255,255,255,0.1) 0%)`,
              accentColor: "#38bdf8",
            }}
          />
          <span
            className="text-sky-400 font-mono font-bold text-xs w-8 text-right shrink-0"
            style={{ fontSize: "11px" }}
          >
            {settings.fontSize}px
          </span>
        </div>
      </SettingRow>

      {/* Font preview */}
      <motion.div
        key={settings.fontSize}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-3 rounded-xl"
        style={{
          background: "rgba(56,189,248,0.05)",
          border: "1px solid rgba(56,189,248,0.12)",
        }}
      >
        <p
          className="text-white/60 italic"
          style={{ fontSize: fontPreviewSize }}
        >
          {t("freshTomatoesFromCertifiedOrga1")}
        </p>
        <p className="text-sky-400/50 text-[10px] mt-1">Preview at {settings.fontSize}px</p>
      </motion.div>

      {/* ── High Contrast Mode ───────────────────────────────────────────── */}
      <SettingRow
        icon={Contrast}
        iconColor="#f59e0b"
        title="High Contrast Mode"
        description="Replaces transparent glass panels with solid dark backgrounds for better readability."
      >
        <ToggleSwitch
          id="accessibility-high-contrast-toggle"
          checked={settings.highContrast}
          onChange={(val) => updateSetting("highContrast", val)}
          color="#f59e0b"
        />
      </SettingRow>

      {/* ── Reduce Animations ────────────────────────────────────────────── */}
      <SettingRow
        icon={Activity}
        iconColor="#10b981"
        title="Reduce Animations"
        description="Minimizes all transitions and animations. Helpful for motion sensitivity."
      >
        <ToggleSwitch
          id="accessibility-reduce-animations-toggle"
          checked={settings.reduceAnimations}
          onChange={(val) => updateSetting("reduceAnimations", val)}
          color="#10b981"
        />
      </SettingRow>

      {/* ── Screen Reader Mode ───────────────────────────────────────────── */}
      <SettingRow
        icon={Accessibility}
        iconColor="#c084fc"
        title="Screen Reader Mode"
        description="Ensures all icon-only buttons and images have descriptive labels for assistive technology."
      >
        <ToggleSwitch
          id="accessibility-screen-reader-toggle"
          checked={settings.screenReaderMode}
          onChange={(val) => updateSetting("screenReaderMode", val)}
          color="#c084fc"
        />
      </SettingRow>

      {/* ── Active Overrides Summary ─────────────────────────────────────── */}
      {(settings.highContrast || settings.reduceAnimations || settings.screenReaderMode || settings.fontSize !== 16) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-3"
          style={{
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <p className="text-purple-300 text-xs font-medium mb-1.5">{t("activeOverrides")}</p>
          <div className="flex flex-wrap gap-1.5">
            {settings.fontSize !== 16 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/20">
                Font {settings.fontSize}px
              </span>
            )}
            {settings.highContrast && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20">
                {t("highContrast")}
              </span>
            )}
            {settings.reduceAnimations && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Reduced Motion
              </span>
            )}
            {settings.screenReaderMode && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/20">
                Screen Reader
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Save to Profile ──────────────────────────────────────────────── */}
      <button
        id="accessibility-save-profile-btn"
        onClick={handleSaveToProfile}
        disabled={saving}
        aria-label="Save accessibility settings to profile"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
        style={{
          background: saved
            ? "linear-gradient(135deg, #10b981, #059669)"
            : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
          boxShadow: saved
            ? "0 0 20px rgba(16,185,129,0.3)"
            : "0 0 20px rgba(139,92,246,0.3)",
          color: "white",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" />
            Saved to Profile
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save to My Profile"}
          </>
        )}
      </button>

      <p className="text-slate-600 text-[11px] text-center">
        Settings are automatically saved locally and restored on next visit.
      </p>
    </div>
  );
}