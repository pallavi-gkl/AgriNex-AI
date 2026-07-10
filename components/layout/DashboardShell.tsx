"use client";
import { useTranslation } from "@/hooks/useTranslation";


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
  Bot,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationsPanel, { NotificationBellButton } from "./NotificationsPanel";
import LanguageSwitcher from "./LanguageSwitcher";
import VoiceAssistantModal from "./VoiceAssistantModal";
import PageBackground from "@/components/ui/PageBackground";

interface DashboardShellProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export default function DashboardShell({ children, profile }: DashboardShellProps) {
  const { t } = useTranslation();
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full ag-sidebar p-4">
      {/* Brand Header */}
      <div className="px-3 pt-4 pb-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#16a34a] to-emerald-600 shadow-[0_3px_12px_rgba(22,163,74,0.2)]">
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-base leading-none block">{t("agrinex")}</span>
            <span className="text-[9px] text-[#16a34a] font-bold block mt-1 uppercase tracking-wider font-mono">
              {t("aiMarketplace")}
            </span>
          </div>
        </Link>
      </div>

      {/* User Info Section */}
      {profile && (
        <div className="mx-1 my-3 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-[#16a34a] to-emerald-600 shadow-sm">
                {profile.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-white shadow">
                {profile.is_verified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 text-sm font-semibold truncate leading-tight">{profile.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  {profile.role}
                </span>
                {isFarmer && (
                  <span className="flex items-center gap-0.5 text-slate-500 text-xs">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {profile.trust_score?.toFixed(1) || "5.0"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative no-underline",
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                  : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/60"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="dashshell-sidebar-indicator"
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-emerald-500"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-200",
                  isActive ? "text-[#16a34a]" : "text-slate-400 group-hover:text-emerald-500"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {!isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-200" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer controls */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
        <LanguageSwitcher compact={true} />
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all group"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span>{t("signOut")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen ag-page-bg theme-dashboard text-slate-900 font-sans relative">
      <PageBackground variant="dashboard" />
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-[260px] z-50 lg:hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                  aria-label="Close menu"
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
        <header className="ag-topbar sticky top-0 h-16 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-full border border-slate-200/80 text-slate-500 premium-card hover:text-slate-800 transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <h1 className="font-bold text-slate-850 text-base sm:text-lg tracking-tight select-none">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Chat Button */}
            <button
              onClick={() => openModal()}
              className="btn-ai text-xs py-2 px-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{t("aiAssistantFarmer")}</span>
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