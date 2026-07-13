"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview AgriNex AI Smart Assistant — Conversational AI chatbot.
 * Floating, bottom-right aligned layout with minimize/maximize.
 * Redesigned to support a premium light-themed design system.
 * FIXED: Uses correct /api/ai/assistant endpoint with proper request format.
 * FIXED: No error boxes, no technical messages — graceful fallback only.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2,
  Send, Bot, Sparkles, Minus, RefreshCw, User,
  Compass,
} from "lucide-react";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import { supabase } from "@/lib/supabase";
import { useLocationWeather } from "@/context/LocationWeatherContext";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
];

function getOfflineFallback(platform: string): string {
  if (platform === "farmer") {
    return "🌱 I'm temporarily unable to reach the AI service. As your **Farmer Assistant**, I can guide you through the platform:\n\n• **AI Lab** — Disease detection, yield prediction\n• **Inventory** — Manage your crops and stock\n• **Orders** — Track incoming buyer orders\n• **Market** — Live mandi prices\n• **Schemes** — Government agricultural schemes\n\nPlease try again in a moment for full AI responses.";
  }
  if (platform === "consumer") {
    return "🛒 I'm temporarily unable to reach the AI service. As your **Shopping Assistant**, here's how I can help:\n\n• **Marketplace** — Browse fresh produce\n• **My Orders** — Track deliveries\n• **Wishlist** — Saved products\n• **Reviews** — Rate your purchases\n\nPlease try again in a moment for full AI responses.";
  }
  return "👋 I'm temporarily offline. Please try again in a moment. In the meantime, explore the platform using the navigation menu!";
}

export default function VoiceAssistantModal() {
  const { t } = useTranslation();
  const { isOpen, closeModal } = useVoiceAssistant();
  const { location, weather } = useLocationWeather();
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("all");
  const [currentPath, setCurrentPath] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track page path and determine role context
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
      const path = window.location.pathname;
      if (path.includes("/farmer")) setUserRole("farmer");
      else if (path.includes("/admin")) setUserRole("admin");
      else if (path.includes("/consumer")) setUserRole("consumer");
    }
  }, [isOpen]);

  // Synchronize language with global LanguageSwitcher events
  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.lang) {
        setLanguage(customEvent.detail.lang);
      }
    };
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const getSuggestedPrompts = (): string[] => {
    if (userRole === "farmer") {
      return [
        "Forecast Basmati Rice prices",
        "Check tomato leaf disease",
        "Irrigation schedule for wheat",
        "Eligible crop insurance schemes",
      ];
    }
    if (userRole === "consumer") {
      return [
        "Recommend fresh vegetables",
        "Track my recent order",
        "Best organic products",
        "Compare product prices",
      ];
    }
    return [
      "Compare Alphonso Mango prices",
      "Is Basmati Rice organic?",
      "Best high-protein crops",
      "Government farming schemes",
    ];
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = (session?.access_token ?? "").trim();

      // Build message history in the correct format for /api/ai/assistant
      const allMessages = [
        ...messages.map((m) => ({ role: m.role, text: m.text })),
        { role: "user" as const, text },
      ];

      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: allMessages,
          currentPath,
          role: userRole,
          language,
          location,
          weather,
        }),
      });

      if (!response.ok) {
        throw new Error("Service temporarily unavailable");
      }

      const data = await response.json();
      const replyText = data.answer || data.reply || data.text || getOfflineFallback(userRole);

      const aiMsg: Message = {
        id: Math.random().toString(),
        role: "ai",
        text: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Graceful fallback — never show technical errors to users
      setTimeout(() => {
        const aiMsg: Message = {
          id: Math.random().toString(),
          role: "ai",
          text: getOfflineFallback(userRole),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isConsumer = userRole === "consumer";
  const brandGradient = isConsumer
    ? "linear-gradient(135deg, #06b6d4, #0891b2)"
    : "linear-gradient(135deg, #10b981, #059669)";

  const accentPulse = isConsumer ? "bg-cyan-400" : "bg-emerald-400";
  const suggestStyle = isConsumer
    ? { background: "#ecfeff", borderColor: "#a5f3fc", color: "#0e7490" }
    : { background: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {!minimized ? (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-[90vw] sm:w-[420px] h-[560px] rounded-3xl overflow-hidden flex flex-col premium-card shadow-2xl relative"
          >
            {/* Header */}
            <div
              className="p-4 border-b border-white/10 flex items-center justify-between shrink-0"
              style={{ background: brandGradient }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs leading-none">
                    {isConsumer ? "AgriNex AI Shopping Assistant" : "AgriNex AI Farmer Assistant"}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${accentPulse}`} />
                    <span className="text-white/70 text-[10px] font-semibold">Contextual AI · Gemini</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear chat */}
                <button
                  onClick={() => setMessages([])}
                  className="p-1.5 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/20 border-0 bg-transparent cursor-pointer"
                  title={t("aiClearChat")}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {/* Minimize */}
                <button
                  onClick={() => setMinimized(true)}
                  className="p-1.5 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/20 border-0 bg-transparent cursor-pointer"
                  title="Minimize"
                >
                  <Minus className="w-4 h-4" />
                </button>
                {/* Close */}
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/20 border-0 bg-transparent cursor-pointer"
                  title={t("close")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Location / Context Bar */}
            <div className="px-4 py-1.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                {currentPath.includes("farmer") ? "👨‍🌾 Farmer" : currentPath.includes("admin") ? "🛡️ Admin" : "🛒 Consumer"} · {currentPath || "/"}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">{t("geminiAi")}</span>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                    style={{ background: brandGradient }}
                  >
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-slate-700 text-sm font-bold mb-1">
                    {isConsumer ? "Shopping Assistant" : "Farmer Assistant"}
                  </p>
                  <p className="text-slate-400 text-xs max-w-[240px] leading-relaxed">
                    {isConsumer
                      ? "Ask me about products, orders, delivery, or anything on the Consumer Platform."
                      : "Ask me about crops, disease, market prices, schemes, or anything farming-related."}
                  </p>
                </div>
              )}

              {messages.map((m) => {
                const isAI = m.role === "ai";
                return (
                  <div key={m.id} className={`flex gap-2.5 ${!isAI ? "flex-row-reverse" : ""}`}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm"
                      style={{
                        background: isAI
                          ? (isConsumer ? "rgba(6,182,212,0.12)" : "rgba(16,185,129,0.12)")
                          : "rgba(99,102,241,0.15)",
                        color: isAI
                          ? (isConsumer ? "#0891b2" : "#059669")
                          : "#4f46e5"
                      }}
                    >
                      {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border ${
                        isAI
                          ? "text-slate-800 rounded-tl-none premium-card border-slate-200/60 shadow-sm"
                          : "text-white rounded-tr-none border-0"
                      }`}
                      style={{
                        background: !isAI ? brandGradient : undefined
                      }}
                      dangerouslySetInnerHTML={{
                        __html: m.text
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/^(?:\s*[-*]\s+)(.*?)$/gm, "• $1")
                          .replace(/\n/g, "<br/>")
                      }}
                    />
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: isConsumer ? "rgba(6,182,212,0.12)" : "rgba(16,185,129,0.12)" }}
                  >
                    <Bot className={`w-4 h-4 ${isConsumer ? "text-cyan-600" : "text-emerald-600"}`} />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl text-xs rounded-tl-none premium-card shadow-sm">
                    <div className="flex gap-1.5 items-center py-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full animate-bounce ${isConsumer ? "bg-cyan-500" : "bg-emerald-500"}`}
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
              {getSuggestedPrompts().map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all hover:scale-105 border cursor-pointer shrink-0"
                  style={suggestStyle}
                >
                  💡 {p}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  placeholder={
                    isConsumer
                      ? "Ask about products, orders, delivery..."
                      : "Ask about crops, market, disease..."
                  }
                  disabled={loading}
                  className="flex-1 premium-card rounded-3xl px-3.5 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />

                <button
                  onClick={() => handleSend(input)}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105 disabled:opacity-40 border-0 cursor-pointer"
                  style={{ background: brandGradient }}
                >
                  {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>

              {/* Language selection */}
              <div className="flex items-center gap-1.5 mt-2.5 justify-end">
                <span className="text-[10px] text-slate-500 font-semibold">Language:</span>
                <div className="flex gap-1">
                  {LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? (isConsumer
                              ? "bg-cyan-100 border-cyan-300 text-cyan-800"
                              : "bg-emerald-100 border-emerald-300 text-emerald-800")
                            : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
                        }`}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Minimized pill state */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setMinimized(false)}
            className="px-4 py-2.5 rounded-full flex items-center gap-2 cursor-pointer transition-all hover:scale-105 premium-card shadow-xl"
          >
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-white"
              style={{ background: brandGradient }}
            >
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-800 text-xs font-bold leading-none">
              {isConsumer ? "AgriNex AI Shopping" : "AgriNex AI Assistant"}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${accentPulse}`} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}