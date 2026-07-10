"use client";
/**
 * @fileoverview AIChatWorkspace — Full-screen conversational AI chat workspace.
 *
 * FULLY TRANSLATED: Every visible UI string uses useTranslation().
 * When the user changes the application language, the ENTIRE interface
 * (title, welcome, suggestions, placeholder, buttons, tooltips, labels)
 * instantly updates — no English strings left behind.
 *
 * Platform-aware (farmer vs consumer).
 * Page context-aware (current URL path sent to API).
 * Scroll locked to chat container — page does not scroll.
 * Responses appear directly below questions (ChatGPT-style layout).
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Sparkles, RefreshCw, User, Loader2,
  Sprout, ShoppingBag, ChevronRight, Leaf, Trash2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentLanguage } from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocationWeather } from "@/context/LocationWeatherContext";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface AIChatWorkspaceProps {
  platform: "farmer" | "consumer";
  currentPath?: string;
  onClose?: () => void;
}

// ─── Platform theme config (colors only — no text) ───────────────────────────

const THEME = {
  farmer: {
    accentColor: "#059669",
    accentMid:   "#10b981",
    pulseColor:  "bg-emerald-400",
    inputRing:   "focus:ring-emerald-400/30",
    suggestBg:   "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    welcomeIcon: Sprout,
  },
  consumer: {
    accentColor: "#0891b2",
    accentMid:   "#06b6d4",
    pulseColor:  "bg-cyan-400",
    inputRing:   "focus:ring-cyan-400/30",
    suggestBg:   "bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100",
    welcomeIcon: ShoppingBag,
  },
};

// ─── Markdown renderer ───────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^#{1,3}\s(.+)$/gm, "<p class=\"font-bold text-slate-800 mt-2 mb-1\">$1</p>")
    .replace(/^[-*]\s(.+)$/gm, "<span class=\"flex gap-2\"><span class=\"text-current mt-0.5\">•</span><span>$1</span></span>")
    .replace(/^\d+\.\s(.+)$/gm, "<span>$1</span>")
    .replace(/`([^`]+)`/g, "<code class=\"bg-slate-100 text-slate-700 px-1 rounded text-[0.8em] font-mono\">$1</code>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AIChatWorkspace({ platform, currentPath, onClose }: AIChatWorkspaceProps) {

  const { t } = useTranslation(platform);
  const theme = THEME[platform];
  const { location, weather } = useLocationWeather();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading]   = useState(false);
  const [detectedPath, setDetectedPath] = useState(currentPath ?? "");

  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef     = useRef(true); // tracks whether user is near the bottom

  // ── Sync with global language switcher ────────────────────────────────────
  useEffect(() => {
    setLanguage(getCurrentLanguage(platform));
    const handleLangChange = (e: Event) => {
      const ev = e as CustomEvent<{ code: string; platform?: string }>;
      const { code, platform: eventPlatform } = ev.detail ?? {};
      if (code && (!eventPlatform || eventPlatform === "all" || eventPlatform === platform)) {
        setLanguage(code);
      }
    };
    window.addEventListener("agrinex:language-change", handleLangChange);
    return () => window.removeEventListener("agrinex:language-change", handleLangChange);
  }, [platform]);

  // ── Detect path client-side ───────────────────────────────────────────────
  useEffect(() => {
    if (!currentPath && typeof window !== "undefined") {
      setDetectedPath(window.location.pathname);
    }
  }, [currentPath]);

  // ── Track whether user is near bottom of scroll container ────────────────
  useEffect(() => {
    const container = messagesScrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      // Consider "at bottom" when within 80px of the bottom
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      isAtBottomRef.current = distanceFromBottom < 80;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Smart auto-scroll: only scroll if user is at (or near) the bottom ────
  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setLoading(true);

    const fallbackMsg = (): Message => ({
      id: `a-${Date.now()}`,
      role: "ai",
      text: platform === "farmer"
        ? "🌱 " + t("aiSubtitleFarmer") + "\n\n" + t("aiTyping").replace("...", ".")
        : "🛒 " + t("aiSubtitleConsumer") + "\n\n" + t("aiTyping").replace("...", "."),
      timestamp: new Date(),
    });

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", text: trimmed },
          ].map(m => ({ role: m.role, text: m.text })),
          currentPath: detectedPath,
          role: platform,
          language,
          location,
          weather,
        }),
      });

      if (!res.ok) throw new Error("unavailable");

      const data = await res.json();
      const replyText = data.answer || data.reply || data.text;
      if (!replyText) throw new Error("empty");

      setMessages(prev => [
        ...prev,
        { id: `a-${Date.now()}`, role: "ai", text: replyText, timestamp: new Date() },
      ]);
    } catch {
      setTimeout(() => {
        setMessages(prev => [...prev, fallbackMsg()]);
      }, 400);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, detectedPath, platform, language, t, location, weather]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleClear = () => {
  const { t } = useTranslation(); setMessages([]); setInput(""); };

  // ── Translated text helpers ───────────────────────────────────────────────
  const isFarmer    = platform === "farmer";
  const welcomeTitle    = isFarmer ? t("aiWelcomeFarmer")    : t("aiWelcomeConsumer");
  const welcomeSubtitle = isFarmer ? t("aiSubtitleFarmer")   : t("aiSubtitleConsumer");
  const placeholder     = isFarmer ? t("aiPlaceholderFarmer"): t("aiPlaceholderConsumer");
  const pageTitle       = isFarmer ? t("aiPageTitleFarmer")  : t("aiPageTitleConsumer");

  const suggestions = isFarmer
    ? [t("aiFarmerSugg1"), t("aiFarmerSugg2"), t("aiFarmerSugg3"), t("aiFarmerSugg4"),
       t("aiFarmerSugg5"), t("aiFarmerSugg6"), t("aiFarmerSugg7"), t("aiFarmerSugg8")]
    : [t("aiConsumerSugg1"), t("aiConsumerSugg2"), t("aiConsumerSugg3"), t("aiConsumerSugg4"),
       t("aiConsumerSugg5"), t("aiConsumerSugg6"), t("aiConsumerSugg7"), t("aiConsumerSugg8")];

  const hasMessages = messages.length > 0;
  const WelcomeIcon = theme.welcomeIcon;

  return (
    <div className="ag-ai-workspace-root" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between shrink-0 ag-chat-header"
        style={{ background: `linear-gradient(135deg, ${theme.accentMid}, ${theme.accentColor})` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">{pageTitle}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", theme.pulseColor)} />
              <span className="text-white/70 text-xs font-medium">{t("aiPoweredBy")}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {hasMessages && (
            <>
              <button
                onClick={handleClear}
                title={t("aiClearChat")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all cursor-pointer border-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("aiClearChat")}</span>
              </button>
              <button
                onClick={handleClear}
                title={t("aiNewChat")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all cursor-pointer border-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("aiNewChat")}</span>
              </button>
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer border-0"
              title={t("close")}
              aria-label="Close AI Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Context strip ─────────────────────────────────────────── */}
      <div className="px-5 py-1.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0 ag-chat-context-strip">
        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
          <Leaf className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-slate-600">{pageTitle}</span>
          {detectedPath && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400 font-mono truncate max-w-[180px] hidden sm:inline">{detectedPath}</span>
            </>
          )}
        </span>
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
          {t("aiModelLabel")}
        </span>
      </div>

      {/* ── Messages (ONLY this area scrolls) ─────────────────────── */}
      <div ref={messagesScrollRef} tabIndex={0} className="flex-1 overflow-y-scroll ag-chat-messages-container px-4 sm:px-6 py-5 space-y-5 bg-slate-50/30">

        {/* Welcome screen */}
        {!hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto px-2 py-6"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${theme.accentMid}, ${theme.accentColor})`,
                boxShadow:  `0 16px 40px ${theme.accentColor}40`,
              }}
            >
              <WelcomeIcon className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
              {welcomeTitle}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md mb-8">
              {welcomeSubtitle}
            </p>

            {/* Suggested Questions grid */}
            <div className="w-full">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                {t("aiSuggestedQuestions")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.slice(0, 6).map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                    onClick={() => handleSend(s)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-left transition-all border cursor-pointer group",
                      theme.suggestBg
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    <span className="flex-1">{s}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Conversation thread — User question then AI answer, in order */}
        {hasMessages && (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isAI = msg.role === "ai";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className={cn("flex gap-3", isAI ? "justify-start" : "justify-end")}
                  >
                    {/* AI avatar */}
                    {isAI && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1"
                        style={{ background: `linear-gradient(135deg, ${theme.accentMid}, ${theme.accentColor})` }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={cn(
                        "max-w-[78%] sm:max-w-[70%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        isAI
                          ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                          : "text-white rounded-tr-sm"
                      )}
                      style={!isAI ? { background: `linear-gradient(135deg, ${theme.accentMid}, ${theme.accentColor})` } : undefined}
                    >
                      {isAI ? (
                        <div
                          className="prose prose-sm max-w-none text-slate-800 text-sm leading-relaxed space-y-1"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                        />
                      ) : (
                        <span>{msg.text}</span>
                      )}
                      <p className={cn("text-[10px] mt-2", isAI ? "text-slate-400" : "text-white/60")}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {/* User avatar */}
                    {!isAI && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1"
                  style={{ background: `linear-gradient(135deg, ${theme.accentMid}, ${theme.accentColor})` }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <p className="text-[11px] text-slate-400 mb-1.5">{t("aiTyping")}</p>
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: theme.accentMid, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick suggestions row (visible while chatting) ─────────── */}
      {hasMessages && !loading && (
        <div className="px-4 sm:px-5 py-2 border-t border-slate-100 bg-white flex gap-2 overflow-x-auto shrink-0 scrollbar-none ag-chat-suggestions-row">
          {suggestions.slice(0, 4).map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border cursor-pointer shrink-0 hover:scale-105",
                theme.suggestBg
              )}
            >
              💡 {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input area ───────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-white shrink-0 ag-chat-input-area">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400",
              "bg-slate-50 border border-slate-200",
              "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 leading-relaxed",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              theme.inputRing
            )}
            style={{ minHeight: "46px", maxHeight: "120px" }}
          />

          <button
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            title={t("aiSend")}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
              "transition-all duration-200 hover:scale-105 active:scale-95",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
              "border-0 cursor-pointer shadow-md"
            )}
            style={{
              background: loading || !input.trim()
                ? "#cbd5e1"
                : `linear-gradient(135deg, ${theme.accentMid}, ${theme.accentColor})`,
            }}
          >
            {loading
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Send className="w-5 h-5 text-white" />
            }
          </button>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-[11px] text-slate-400">
            <span className="font-semibold">{t("aiTip")}</span> {t("aiTipText")}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-semibold">{t("aiActiveLanguage")}</span>
            <span
              className="text-[10px] font-bold border px-1.5 py-0.5 rounded uppercase"
              style={{
                color: theme.accentColor,
                borderColor: `${theme.accentColor}50`,
                background: `${theme.accentMid}10`,
              }}
            >
              {language}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}