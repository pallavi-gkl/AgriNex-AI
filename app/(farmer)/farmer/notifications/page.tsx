"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckSquare, RefreshCw, AlertTriangle, CloudSun, ShieldAlert, DollarSign, Sparkles, Zap } from "lucide-react";
import { DEMO_NOTIFICATIONS } from "@/lib/demoData";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { t } = useTranslation("farmer");
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
        return <ShieldAlert className="w-5 h-5 text-purple-600" />;
      case "weather":
        return <CloudSun className="w-5 h-5 text-amber-600" />;
      case "payment":
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case "order":
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBorderColor = (n: typeof DEMO_NOTIFICATIONS[0]) => {
  const { t } = useTranslation("farmer");
    if (n.is_read) return "border-slate-100 opacity-65";
    switch (n.type) {
      case "disease": return "border-purple-200 bg-purple-50/50";
      case "weather": return "border-amber-200 bg-amber-50/50";
      case "payment": return "border-emerald-200 bg-emerald-50/50";
      default: return "border-blue-200 bg-blue-50/50";
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {t("alertAdvisoryCenter")}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Realtime notifications synced with global crop indices, IoT sensors, and transactions
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-amber-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-slate-700">Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-orange-200 shadow-sm">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-slate-700">IoT Sensors</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200 shadow-sm">
              <Bell className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-slate-700">Smart Alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200">
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-5 py-2.5 premium-card hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition shadow-sm"
        >
          <CheckSquare className="w-4 h-4" />
          Mark All Read
        </button>
      </motion.div>

      {/* Notifications list feed */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl space-y-4"
      >
        {notifications.map((n, index) => (
          <motion.div
            key={n.id}
            variants={itemVariants}
            custom={index}
            onClick={() => handleMarkRead(n.id)}
            className={cn(
              "premium-card flex items-start gap-5 p-5 rounded-3xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5",
              getBorderColor(n)
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              n.is_read ? "bg-slate-50" : 
                n.type === "disease" ? "bg-gradient-to-br from-purple-100 to-violet-100" :
                n.type === "weather" ? "bg-gradient-to-br from-amber-100 to-orange-100" :
                n.type === "payment" ? "bg-gradient-to-br from-emerald-100 to-teal-100" : "bg-gradient-to-br from-blue-100 to-sky-100"
            )}>
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-4">
                <h3 className={cn("text-sm font-bold truncate", n.is_read ? "text-slate-400" : "text-slate-800")}>
                  {n.title}
                </h3>
                <span className="text-xs text-slate-400 font-semibold shrink-0">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={cn("text-sm leading-relaxed mt-2", n.is_read ? "text-slate-400" : "text-slate-600")}>
                {n.message}
              </p>
            </div>

            {!n.is_read && (
              <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0 self-center shadow-lg shadow-emerald-500/30" />
            )}
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card rounded-3xl p-16 text-center shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-400 text-sm font-semibold">No notifications yet</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}