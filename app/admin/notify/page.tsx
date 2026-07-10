"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Send, Eye, Bell, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function broadcastNotification(payload: {
  audience: string;
  title: string;
  message: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const res = await fetch(`${API_URL}/api/admin/notify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to broadcast notification");
  }
  return res.json();
}

export default function AdminNotificationPage() {
  const { t } = useTranslation();
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [singleUserVal, setSingleUserVal] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [dispatchCount, setDispatchCount] = useState(0);

  const broadcastMutation = useMutation({
    mutationFn: broadcastNotification,
    onSuccess: (data) => {
      setDispatchCount(data.count ?? 0);
      setShowSuccess(true);
      setTitle("");
      setMessage("");
      setSingleUserVal("");
      setTimeout(() => setShowSuccess(false), 4000);
    },
  });

  const handleBroadcast = (e: React.FormEvent) => {
  const { t } = useTranslation();
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const targetAudience = audience === "single" ? singleUserVal.trim() : audience;
    if (audience === "single" && !targetAudience) return;

    broadcastMutation.mutate({
      audience: targetAudience,
      title: title.trim(),
      message: message.trim(),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* ── BROADCAST FORM ── */}
      <div className="premium-card rounded-3xl shadow-sm p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            System Broadcast dispatcher
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Send real-time alerts or system notifications to target user segments.
          </p>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          {/* Audience selection */}
          <div>
            <label className="text-slate-400 font-medium block mb-1.5">
              Target Audience Segment
            </label>
            <select
              id="audience-select"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 cursor-pointer focus:outline-none focus:border-emerald-500/50"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value={t("all")}>📢 All Registered Users</option>
              <option value={t("farmers")}>🌾 All Farmers</option>
              <option value={t("consumers")}>🏠 All Consumers</option>
              <option value="single">👤 Single User (Phone or User ID)</option>
            </select>
          </div>

          {/* Conditional single user input */}
          {audience === "single" && (
            <div>
              <label className="text-slate-400 font-medium block mb-1.5">
                Target User Phone or UUID
              </label>
              <input
                id="target-user-input"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-emerald-500/50"
                placeholder="e.g. +919876543210 or user-uuid-abc-123"
                value={singleUserVal}
                onChange={(e) => setSingleUserVal(e.target.value)}
                required
              />
            </div>
          )}

          {/* Notification Title */}
          <div>
            <label className="text-slate-400 font-medium block mb-1.5">
              Notification Title
            </label>
            <input
              id="notif-title-input"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-emerald-500/50"
              placeholder="e.g. 🌾 Price Alert: Tomato demand surges in Pune market"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Message Text */}
          <div>
            <label className="text-slate-400 font-medium block mb-1.5">
              Message body
            </label>
            <textarea
              id="notif-message-input"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 h-24 resize-none focus:outline-none focus:border-emerald-500/50"
              placeholder="Provide clear message details here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            id="broadcast-submit-btn"
            type="submit"
            disabled={broadcastMutation.isPending || !title.trim() || !message.trim()}
            className="w-full py-2.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all text-xs"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              boxShadow: "0 0 15px rgba(139,92,246,0.3)",
              opacity: broadcastMutation.isPending ? 0.7 : 1,
            }}
          >
            {broadcastMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {broadcastMutation.isPending ? "Broadcasting..." : "Broadcast Alert"}
          </button>
        </form>

        {/* Success toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Broadcast dispatched to {dispatchCount} target users successfully.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── LIVE PREVIEW PANEL ── */}
      <div className="premium-card rounded-3xl shadow-sm p-6 space-y-5">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-purple-400" />
          Live Mock Preview
        </p>

        <div className="border-white/5 rounded-xl p-8 bg-black/25 min-h-[220px] flex items-center justify-center">
          {title || message ? (
            <div
              className="premium-card shadow-sm w-full max-w-sm rounded-xl p-4 flex gap-3 text-xs"
              style={{
                background: "rgba(13, 20, 38, 0.7)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                boxShadow: "0 0 15px rgba(139,92,246,0.1)",
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-300">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-snug">
                  {title || "Notification Title"}
                </p>
                <p className="text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                  {message || "Message details will render here in real-time."}
                </p>
                <p className="text-slate-500 font-mono text-[9px] mt-2">
                  Just now • System Broadcast
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 text-xs italic">
              {t("fillInTheDispatcherFormToPrevi")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}