"use client";

import React, { useState } from "react";
import { Bell, CheckSquare, RefreshCw, AlertTriangle, CloudSun, ShieldAlert, DollarSign } from "lucide-react";
import { DEMO_NOTIFICATIONS } from "@/lib/demoData";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  // Mark all as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // Mark single as read
  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "disease":
        return <ShieldAlert className="w-4.5 h-4.5 text-purple-400" />;
      case "weather":
        return <CloudSun className="w-4.5 h-4.5 text-amber-400" />;
      case "payment":
        return <DollarSign className="w-4.5 h-4.5 text-emerald-400" />;
      case "order":
        return <Bell className="w-4.5 h-4.5 text-blue-400" />;
      default:
        return <AlertTriangle className="w-4.5 h-4.5 text-slate-400" />;
    }
  };

  const getBorderColor = (n: typeof DEMO_NOTIFICATIONS[0]) => {
    if (n.is_read) return "border-white/5 opacity-65";
    switch (n.type) {
      case "disease": return "border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.05)]";
      case "weather": return "border-amber-500/20";
      case "payment": return "border-emerald-500/20";
      default: return "border-blue-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-yellow-400" />
            Alert Advisory Center
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Realtime notifications synced with global crop indices, IoT sensor signals, and order transactions.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono rounded-xl transition self-start sm:self-auto shrink-0"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Mark All Read
        </button>
      </div>

      {/* Notifications list feed */}
      <div className="max-w-3xl space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleMarkRead(n.id)}
            className={cn(
              "glass-panel p-4 rounded-2xl border flex items-start gap-4 transition-all duration-300 cursor-pointer bg-white/[0.01]",
              getBorderColor(n)
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-4">
                <h3 className={cn("text-xs font-bold truncate", n.is_read ? "text-slate-400" : "text-white")}>
                  {n.title}
                </h3>
                <span className="text-[9px] text-slate-500 font-mono shrink-0">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={cn("text-xs leading-relaxed mt-1", n.is_read ? "text-slate-500" : "text-slate-300")}>
                {n.message}
              </p>
            </div>

            {!n.is_read && (
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 self-center" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
