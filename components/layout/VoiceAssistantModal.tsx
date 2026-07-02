"use client";

/**
 * @fileoverview AgriNex AI Smart Assistant — Premium conversational AI chatbot.
 * Floating, bottom-right aligned layout with minimize/maximize and full text + voice conversational state.
 * Replaces the old voice modal layout with a powerful context-aware assistant.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, X, Loader2, CheckCircle, AlertCircle, Volume2, VolumeX,
  Send, Bot, Sparkles, Minus, Maximize2, RefreshCw, User, MessageSquare,
  Compass, ShieldAlert, FileText, CheckCircle2, Sprout, ShoppingCart, BarChart2
} from "lucide-react";
import { SpeechController, LANGUAGE_CODES, speakText } from "@/lib/speech";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "mr", label: "मराठी" },
];

export default function VoiceAssistantModal() {
  const { isOpen, closeModal } = useVoiceAssistant();
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [userRole, setUserRole] = useState<string>("all");
  const [currentPath, setCurrentPath] = useState("");
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechController | null>(null);

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
      if (customEvent.detail?.code) {
        setLanguage(customEvent.detail.code);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("agrinex:language-change", handleLangChange);
      const cached = sessionStorage.getItem("agrinex-lang");
      if (cached) setLanguage(cached);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("agrinex:language-change", handleLangChange);
      }
    };
  }, []);

  // Load welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsgs: Record<string, string> = {
        farmer: "👨‍🌾 Welcome to your AgriNex Farmer Assistant! I can help you with crop rotation, weather-based farming advice, disease diagnosis, yields, or listing products. Ask me anything!",
        consumer: "🥦 Welcome to the Customer Marketplace! I can suggest healthy recipes, recommend fresh crops, analyze price fairness, compare farmers, or track your orders.",
        admin: "🛡️ Welcome Admin! I can summarize system health, analyze dispute records, or explain platform analytics. How can I help you manage AgriNex today?",
        all: "👋 Hello! I am your AgriNex AI Smart Assistant. Feel free to ask me anything about the marketplace, crop health, or farm operations!"
      };
      setMessages([
        {
          id: "welcome",
          role: "ai",
          text: welcomeMsgs[userRole] || welcomeMsgs.all,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, userRole]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Clean up synthesis/recognition on close
  useEffect(() => {
    if (!isOpen) {
      speechRef.current?.stopListening();
      setIsListening(false);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  // ── Smart Context-based suggested prompts ──────────────────────────────────
  const getSuggestedPrompts = () => {
    if (currentPath.includes("/farmer/inventory")) {
      return ["Which crop should I sell this week?", "How can I increase my farm profit?", "Show pricing strategies for grade A crops"];
    }
    if (currentPath.includes("/farmer/farm-twin") || currentPath.includes("/farmer/analytics")) {
      return ["Explain this analytics chart", "Predict next month yield", "Disease risk alert in my region"];
    }
    if (currentPath.includes("/marketplace")) {
      return ["Show the freshest tomatoes", "Compare rice from nearby farmers", "Recommend healthy vegetables"];
    }
    if (currentPath.includes("/consumer/dashboard")) {
      return ["How much did I save this month?", "Recommend healthy recipes", "Show seasonal buying advice"];
    }
    if (userRole === "farmer") {
      return ["How can I increase my farm profit?", "PM-KISAN scheme eligibility", "Suggested crop rotation for Haryana"];
    }
    if (userRole === "admin") {
      return ["Platform analytics snapshot", "Explain fraud logs", "Review farmer pending verifications"];
    }
    return ["What is AgriNex AI?", "Show the freshest tomatoes", "Which crop should I sell this week?"];
  };

  // ── Send Message ──────────────────────────────────────────────────────────
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const responseHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: responseHistory,
          currentPath,
          role: userRole,
          language
        })
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();
      const aiReply = data.answer || "I could not generate an answer. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "ai",
          text: aiReply,
          timestamp: new Date()
        }
      ]);

      // Speak if enabled
      if (ttsEnabled) {
        speakText(aiReply.replace(/[#*`_]/g, ""), LANGUAGE_CODES[language] ?? "en-IN");
      }
    } catch (err: any) {
      setError("AI service unavailable. Using offline template support.");
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "ai",
          text: getFallbackResponse(textToSend),
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Voice Input using SpeechController ─────────────────────────────────────
  const toggleListening = () => {
    if (isListening) {
      speechRef.current?.stopListening();
      setIsListening(false);
      return;
    }

    const langCode = LANGUAGE_CODES[language] ?? "en-IN";
    const controller = new SpeechController(langCode);
    speechRef.current = controller;

    if (!controller.isSupported) {
      setError("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    setIsListening(true);
    setError(null);

    controller.startListening(
      (text) => {
        setIsListening(false);
        handleSend(text);
      },
      (err) => {
        console.error("Speech error:", err);
        setIsListening(false);
        if (err?.error === "no-speech") {
          setError("No speech detected. Please speak closer to the microphone.");
        } else {
          setError("Microphone access denied or error occurred.");
        }
      }
    );
  };

  // ── Fallback templates ──────────────────────────────────────────────────────
  const getFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("price") || q.includes("sell") || q.includes("market")) {
      return "📊 **Offline Price Insight:** Direct market prices are stable. Alphonso Mangoes are premium at ₹350/kg, Turmeric is steady at ₹152/kg, and Basmati is up 5% in Delhi APMC.";
    }
    if (q.includes("tomato") || q.includes("vegetable") || q.includes("fresh")) {
      return "🍅 **Fresh Harvest Alert:** Tomatoes are currently Grade A+ verified in inventory by Rajesh Kumar. Hydroponic Spinach is fresh with 7-day shelf life.";
    }
    if (q.includes("profit") || q.includes("increase")) {
      return "💰 **Farm Advice:** Increase profits by sorting products to Grade A+ before listing. AI reports suggest setting prices 10% lower than market average during high harvest days.";
    }
    if (q.includes("disease") || q.includes("pest")) {
      return "🌿 **Disease Risk Guide:** Region reports show low blast disease risk. Maintain dry storage at 10–15°C for Basmati and keep moisture levels below 55%.";
    }
    return "👋 Hello! I am operating in offline demo mode. AgriNex AI Marketplace is active. You can browse, compare, and order fresh crops directly from verified farmers.";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {!minimized ? (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-[90vw] sm:w-[420px] h-[550px] rounded-3xl overflow-hidden flex flex-col glass-panel relative"
            style={{
              background: userRole === "consumer" ? "rgba(255, 255, 255, 0.95)" : "rgba(3, 18, 11, 0.95)",
              backdropFilter: "blur(24px)",
              border: userRole === "consumer" ? "1px solid rgba(245, 158, 11, 0.2)" : "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: userRole === "consumer"
                ? "0 20px 50px rgba(0,0,0,0.08), 0 0 30px rgba(245,158,11,0.08)"
                : "0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(16,185,129,0.15)",
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: userRole === "consumer" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #10b981, #059669)" }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className={userRole === "consumer" ? "text-slate-800 font-bold text-xs leading-none" : "text-white font-bold text-xs leading-none"}>
                    {userRole === "consumer" ? "AgriNex AI Shopping Assistant" : "AgriNex AI Farmer Assistant"}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${userRole === "consumer" ? "bg-amber-500" : "bg-emerald-400"}`} />
                    <span className="text-[10px] text-slate-500 font-mono">Contextual</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* TTS Toggle */}
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    ttsEnabled 
                      ? "text-purple-600 hover:text-purple-700 bg-purple-500/10" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title={ttsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                {/* Minimize */}
                <button
                  onClick={() => setMinimized(true)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    userRole === "consumer" ? "text-slate-500 hover:text-slate-800 hover:bg-slate-950/5" : "text-slate-500 hover:text-white"
                  }`}
                  title="Minimize"
                >
                  <Minus className="w-4 h-4" />
                </button>
                {/* Close */}
                <button
                  onClick={closeModal}
                  className={`p-1.5 rounded-lg transition-colors ${
                    userRole === "consumer" ? "text-slate-500 hover:text-red-600 hover:bg-red-50" : "text-slate-500 hover:text-red-400"
                  }`}
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Location / Context Bar */}
            <div className={`px-4 py-1.5 border-b flex items-center justify-between ${
              userRole === "consumer" ? "bg-amber-500/5 border-slate-100" : "bg-emerald-500/5 border-white/5"
            }`}>
              <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <Compass className={`w-3.5 h-3.5 ${userRole === "consumer" ? "text-amber-600" : "text-emerald-400"}`} />
                Context: {currentPath.includes("farmer") ? "👨‍🌾 Farmer" : currentPath.includes("admin") ? "🛡️ Admin" : "🥦 Customer"} · {currentPath}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Gemini AI</span>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    m.role === "ai" ? (userRole === "consumer" ? "text-amber-700" : "text-emerald-400") : "text-white"
                  }`}
                    style={{ background: m.role === "ai" ? (userRole === "consumer" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)") : "rgba(139,92,246,0.2)" }}>
                    {m.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === "ai" ? (userRole === "consumer" ? "text-slate-800 rounded-tl-none" : "text-slate-200 rounded-tl-none") : "text-white rounded-tr-none"
                  }`}
                    style={{
                      background: m.role === "ai" ? (userRole === "consumer" ? "rgba(245,158,11,0.06)" : "rgba(16,185,129,0.06)") : (userRole === "consumer" ? "rgba(109,40,217,0.85)" : "rgba(139,92,246,0.2)"),
                      border: `1px solid ${m.role === "ai" ? (userRole === "consumer" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)") : (userRole === "consumer" ? "rgba(109,40,217,0.4)" : "rgba(139,92,246,0.2)")}`,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: m.text
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/^(?:\s*[-*]\s+)(.*?)$/gm, "• $1")
                        .replace(/\n/g, "<br/>")
                    }}
                  />
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: userRole === "consumer" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)" }}>
                    <Bot className={`w-4 h-4 ${userRole === "consumer" ? "text-amber-700" : "text-emerald-400"}`} />
                  </div>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs rounded-tl-none ${
                    userRole === "consumer" ? "bg-amber-500/5 border border-amber-500/10" : "bg-emerald-500/5 border border-emerald-500/10"
                  }`}>
                    <div className="flex gap-1.5 items-center">
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${userRole === "consumer" ? "bg-amber-500" : "bg-emerald-400"}`} style={{ animationDelay: "0s" }} />
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${userRole === "consumer" ? "bg-amber-500" : "bg-emerald-400"}`} style={{ animationDelay: "0.15s" }} />
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${userRole === "consumer" ? "bg-amber-500" : "bg-emerald-400"}`} style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            <div className="px-4 py-2 border-t border-white/5 bg-white/5 flex gap-2 overflow-x-auto hide-scrollbar">
              {getSuggestedPrompts().map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all hover:scale-105 ${
                    userRole === "consumer" ? "text-amber-800" : "text-emerald-400"
                  }`}
                  style={{
                    background: userRole === "consumer" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.1)",
                    border: userRole === "consumer" ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  💡 {p}
                </button>
              ))}
            </div>

            {/* Error notifications */}
            {error && (
              <div className="mx-4 my-2 px-3 py-1.5 rounded-xl text-[10px] text-red-400 flex items-center gap-1.5 shrink-0"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Input row */}
            <div className="p-4 border-t border-white/5 bg-white/5">
              <div className="flex gap-2">
                {/* Voice Assistant Mic Button */}
                <button
                  onClick={toggleListening}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isListening ? "animate-pulse" : "hover:scale-105"
                  }`}
                  style={{
                    background: isListening ? "rgba(239,68,68,0.25)" : "rgba(139,92,246,0.15)",
                    border: `1px solid ${isListening ? "rgba(239,68,68,0.4)" : "rgba(139,92,246,0.3)"}`,
                  }}
                  title={isListening ? "Listening..." : "Dictate Command"}
                >
                  <Mic className={`w-4 h-4 ${isListening ? "text-red-400 animate-pulse" : "text-purple-400"}`} />
                </button>

                {/* Text input */}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  placeholder={isListening ? "Listening..." : "Ask me anything..."}
                  disabled={loading}
                  className="flex-1 glass-input py-2 text-xs"
                />

                {/* Send */}
                <button
                  onClick={() => handleSend(input)}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105 disabled:opacity-40"
                  style={{ background: userRole === "consumer" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Language selection */}
              <div className="flex items-center gap-1.5 mt-2 justify-end">
                <span className="text-[10px] text-slate-500">Language:</span>
                <div className="flex gap-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all ${
                        language === lang.code
                          ? (userRole === "consumer" ? "bg-amber-500/25 border border-amber-500/40 text-amber-800" : "bg-emerald-500/25 border border-emerald-500/40 text-emerald-400")
                          : (userRole === "consumer" ? "text-slate-600 border border-slate-200 hover:text-slate-800" : "text-slate-500 border border-white/5 hover:text-slate-400")
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
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
            className="px-4 py-2.5 rounded-full flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            style={{
              background: userRole === "consumer" ? "rgba(255, 255, 255, 0.95)" : "rgba(3, 18, 11, 0.95)",
              backdropFilter: "blur(16px)",
              border: userRole === "consumer" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
              boxShadow: userRole === "consumer" ? "0 10px 30px rgba(0,0,0,0.08)" : "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-white"
              style={{ background: userRole === "consumer" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #10b981, #059669)" }}>
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className={userRole === "consumer" ? "text-slate-800 text-xs font-bold leading-none" : "text-white text-xs font-bold leading-none"}>
              {userRole === "consumer" ? "AgriNex AI Shopping" : "AgriNex AI Chat"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="p-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
