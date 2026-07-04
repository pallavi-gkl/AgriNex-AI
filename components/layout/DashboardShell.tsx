"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Menu,
  Leaf,
  LayoutDashboard,
  Sprout,
  ShoppingCart,
  ClipboardList,
  BarChart2,
  LogOut,
  CheckCircle2,
  Clock,
  Settings,
  Brain,
  Star,
  Bell,
  Bot
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationsPanel, { NotificationBellButton } from "./NotificationsPanel";
import LanguageSwitcher from "./LanguageSwitcher";
import VoiceAssistantModal from "./VoiceAssistantModal";

interface DashboardShellProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export default function DashboardShell({ children, profile }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { openModal } = useVoiceAssistant();

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/signin");
  };

  // Dynamic Page Title
  const getPageTitle = () => {
    if (pathname.includes("/farmer/dashboard")) return "Farmer Analytics Dashboard";
    if (pathname.includes("/farmer/crops")) return "Crop Passport & Listings";
    if (pathname.includes("/farmer/orders")) return "Crop Bid Management";
    if (pathname.includes("/farmer/analytics")) return "Performance Insights";
    if (pathname.includes("/consumer/marketplace")) return "Direct Agriculture Marketplace";
    if (pathname.includes("/consumer/orders")) return "Your Direct Orders";
    if (pathname.includes("/ai/crop-grader")) return "Gemini Crop Quality Grader";
    return "AgriNex Portal";
  };

  const isFarmer = profile?.role === "farmer";

  // Sidebar Links based on Role
  const NAV_ITEMS = isFarmer
    ? [
        { href: "/farmer/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/farmer/crops", label: "My Crops", icon: Sprout },
        { href: "/farmer/orders", label: "My Orders", icon: ClipboardList },
        { href: "/farmer/analytics", label: "Analytics", icon: BarChart2 },
        { href: "/ai/crop-grader", label: "AI Crop Grader", icon: Brain },
      ]
    : [
        { href: "/consumer/marketplace", label: "Marketplace", icon: ShoppingCart },
        { href: "/consumer/orders", label: "My Orders", icon: ClipboardList },
        { href: "/ai/crop-grader", label: "AI Crop Grader", icon: Brain },
      ];

  // Close mobile drawer on routing
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/75 backdrop-blur-xl border-r border-slate-200/60 p-4">
      {/* Brand Header */}
      <div className="px-3 pt-4 pb-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#16a34a] to-emerald-600 shadow-[0_3px_12px_rgba(22,163,74,0.2)]">
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-base leading-none block">AgriNex</span>
            <span className="text-[9px] text-[#16a34a] font-bold block mt-0.5 uppercase tracking-wide font-mono">
              AI Marketplace
            </span>
          </div>
        </Link>
      </div>

      {/* User Info Section */}
      {profile && (
        <div className="px-3 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-[#16a34a] to-emerald-600">
              {profile.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1">
              {profile.is_verified ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-[#16a34a] fill-white" />
              ) : (
                <Clock className="w-4.5 h-4.5 text-amber-500 fill-white" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-800 text-sm font-bold truncate leading-tight">{profile.full_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                {profile.role}
              </span>
              {isFarmer && (
                <span className="flex items-center gap-0.5 text-slate-400 text-[10px] font-bold">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {profile.trust_score?.toFixed(1) || "5.0"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative group",
                isActive
                  ? "bg-emerald-50 text-[#16a34a] border border-emerald-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                  isActive ? "text-[#16a34a]" : "text-slate-400"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer controls (Language & Sign out) */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
        <LanguageSwitcher compact={true} />
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50/50 transition-all"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#0f172a] font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[260px] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[260px] z-50 lg:hidden"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="lg:pl-[260px] min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-slate-200/50 h-16 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-500 bg-white hover:text-slate-800 transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <h1 className="font-extrabold text-slate-800 text-base sm:text-lg tracking-tight select-none">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Chat Button */}
            <button
              onClick={() => openModal()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-bold text-[#16a34a] hover:scale-105 active:scale-95 transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              AI Assistant
            </button>

            {/* Notification Bell */}
            <NotificationBellButton unreadCount={unreadCount} onClick={() => setNotifOpen(true)} />
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* AI Chat Dialog */}
      <VoiceAssistantModal />

      {/* Notification Drawer Panel */}
      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
