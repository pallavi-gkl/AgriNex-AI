"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { motion } from "framer-motion";

interface ConsumerTopbarProps {
  title: string;
  profile: Profile | null;
  unreadCount: number;
  onMenuClick: () => void;
  onNotifClick: () => void;
}

export default function ConsumerTopbar({
  title,
  profile,
  unreadCount,
  onMenuClick,
  onNotifClick,
}: ConsumerTopbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/signin");
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-[280px] h-16 flex items-center justify-between px-5 z-30 border-b border-slate-200 bg-white"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-extrabold text-slate-800 text-base tracking-tight select-none">
          {title}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* AI Badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "#b45309",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Powered
        </div>

        {/* Notifications Bell */}
        <button
          onClick={onNotifClick}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-red-500"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </button>

        {/* Avatar + Signout */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
          title="Sign Out"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            {profile?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
