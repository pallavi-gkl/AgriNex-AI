/**
 * @fileoverview LanguageSwitcher — Phase 7 finalized component.
 *
 * Features:
 *   - Dropdown with flag emoji for 6 Indian regional languages
 *   - Saves selection to Supabase `profiles.language_preference` (non-blocking)
 *   - Updates the SpeechController language code globally via context event
 *   - Reads initial language from Supabase profile on mount
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Inline language code map (replaces deleted speech.ts)
const LANGUAGE_CODES: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  ml: "ml-IN",
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
};

// ─── Language Options ─────────────────────────────────────────────────────────
const LANGUAGE_OPTIONS = [
  { code: "en", flag: "🇬🇧", nativeLabel: "English",   label: LANGUAGE_LABELS["en"] },
  { code: "hi", flag: "🇮🇳", nativeLabel: "हिंदी",      label: LANGUAGE_LABELS["hi"] },
  { code: "te", flag: "🇮🇳", nativeLabel: "తెలుగు",     label: LANGUAGE_LABELS["te"] },
  { code: "ta", flag: "🇮🇳", nativeLabel: "தமிழ்",      label: LANGUAGE_LABELS["ta"] },
  { code: "kn", flag: "🇮🇳", nativeLabel: "ಕನ್ನಡ",      label: LANGUAGE_LABELS["kn"] },
  { code: "ml", flag: "🇮🇳", nativeLabel: "മലയാളം",    label: LANGUAGE_LABELS["ml"] },
];

// ─── Global language event — picked up by VoiceAssistantModal ─────────────────
const LANG_CHANGE_EVENT = "agrinex:language-change";

export function dispatchLanguageChange(code: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(LANG_CHANGE_EVENT, { detail: { code } })
    );
    // Persist to sessionStorage for VoiceAssistantModal to read
    sessionStorage.setItem("agrinex-lang", code);
  }
}

export function getCurrentLanguage(): string {
  if (typeof window === "undefined") return "en";
  return sessionStorage.getItem("agrinex-lang") ?? "en";
}

// ─── Component ────────────────────────────────────────────────────────────────
interface LanguageSwitcherProps {
  /** If true, renders as a compact inline dropdown (for sidebar) */
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [currentCode, setCurrentCode] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load language preference from Supabase profile on mount
  useEffect(() => {
    const loadLang = async () => {
      // First check sessionStorage for instant restore
      const cached = getCurrentLanguage();
      if (cached && cached !== "en") {
        setCurrentCode(cached);
        dispatchLanguageChange(cached);
        return;
      }

      // Then fetch from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await (supabase
        .from("profiles") as any)
        .select("language_preference")
        .eq("id", user.id)
        .single();

      if (profile?.language_preference && LANGUAGE_CODES[profile.language_preference]) {
        setCurrentCode(profile.language_preference);
        dispatchLanguageChange(profile.language_preference);
      }
    };
    loadLang();
  }, []);

  const handleSelect = useCallback(
    async (code: string) => {
      setIsOpen(false);
      if (code === currentCode) return;

      setCurrentCode(code);
      dispatchLanguageChange(code);
      setSaving(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await (supabase
            .from("profiles") as any)
            .update({ language_preference: code })
            .eq("id", user.id);
        }
      } catch {
        // Non-blocking; sessionStorage is the source of truth for the session
      } finally {
        setSaving(false);
      }
    },
    [currentCode]
  );

  const current = LANGUAGE_OPTIONS.find((l) => l.code === currentCode) ?? LANGUAGE_OPTIONS[0];

  // ── Compact sidebar version ───────────────────────────────────────────────
  if (compact) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Language
          </span>
          {saving && (
            <span className="ml-auto text-[10px] text-amber-600 animate-pulse">Saving…</span>
          )}
        </div>

        <button
          id="language-switcher-btn"
          aria-label={`Current language: ${current.nativeLabel}. Click to change.`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((o) => !o)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-slate-100"
          style={{
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
          }}
        >
          <span className="text-base leading-none">{current.flag}</span>
          <span className="text-slate-700 text-xs flex-1 text-left font-medium">{current.nativeLabel}</span>
          <ChevronDown
            className="w-3 h-3 text-slate-400 transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
            aria-hidden="true"
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              role="listbox"
              aria-label="Select language"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-1 rounded-xl overflow-hidden z-50"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 -8px 24px rgba(0,0,0,0.12)",
              }}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <li key={lang.code}>
                  <button
                    role="option"
                    aria-selected={lang.code === currentCode}
                    onClick={() => handleSelect(lang.code)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition-all duration-150 hover:bg-emerald-50"
                    style={{
                      color: lang.code === currentCode ? "#059669" : "#475569",
                      fontWeight: lang.code === currentCode ? 600 : 400,
                    }}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="flex-1">{lang.nativeLabel}</span>
                    {lang.code === currentCode && (
                      <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Full panel version (for settings page) ────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            boxShadow: "0 0 16px rgba(14,165,233,0.3)",
          }}
        >
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Language</h2>
          <p className="text-slate-500 text-xs">Choose your preferred language</p>
        </div>
        {saving && (
          <span className="ml-auto text-xs text-emerald-400 animate-pulse">Saving…</span>
        )}
      </div>

      {/* Language grid */}
      <div
        role="listbox"
        aria-label="Select language"
        className="grid grid-cols-2 gap-3"
      >
        {LANGUAGE_OPTIONS.map((lang) => {
          const isSelected = lang.code === currentCode;
          return (
            <button
              key={lang.code}
              id={`lang-option-${lang.code}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(lang.code)}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: isSelected
                  ? "rgba(14,165,233,0.12)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${
                  isSelected
                    ? "rgba(14,165,233,0.4)"
                    : "rgba(255,255,255,0.06)"
                }`,
                boxShadow: isSelected
                  ? "0 0 16px rgba(14,165,233,0.15)"
                  : "none",
              }}
            >
              <span className="text-2xl leading-none" role="img" aria-label={lang.label}>
                {lang.flag}
              </span>
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{ color: isSelected ? "#38bdf8" : "#e2e8f0" }}
                >
                  {lang.nativeLabel}
                </p>
                <p className="text-slate-500 text-[11px]">{lang.label}</p>
              </div>
              {isSelected && (
                <Check
                  className="w-4 h-4 text-sky-400 ml-auto shrink-0"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* BCP-47 code display */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span className="text-slate-500 text-xs">Speech API Code</span>
        <code className="text-sky-400 text-xs font-mono">
          {LANGUAGE_CODES[currentCode] ?? "en-IN"}
        </code>
      </div>

      <p className="text-slate-600 text-[11px]">
        Language preference is saved to your profile and persists across sessions.
        The entire platform will update to the selected language instantly.
      </p>
    </div>
  );
}
