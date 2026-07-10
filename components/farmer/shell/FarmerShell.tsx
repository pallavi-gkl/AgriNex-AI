"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Bot } from "lucide-react";
import FarmerSidebar from "./FarmerSidebar";
import FarmerTopbar from "./FarmerTopbar";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useDemoMode } from "@/context/DemoContext";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import PageBackground from "@/components/ui/PageBackground";
import VoiceAssistantModal from "@/components/layout/VoiceAssistantModal";
import LocationHeader from "@/components/shared/LocationHeader";
import AIAssistantDrawer from "@/components/layout/AIAssistantDrawer";

interface FarmerShellProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export default function FarmerShell({
  children,
  profile: initialProfile,
}: FarmerShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const { openModal } = useVoiceAssistant();

  const { isDemoMode } = useDemoMode();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Retrieve user details on load if initialProfile is null
  useEffect(() => {
    if (!profile) {
      const getProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          if (data) setProfile(data);
        }
      };
      getProfile();
    }
  }, [profile]);

  // Dynamic page title from path
  const getPageTitle = (): string => {
    if (pathname.includes("/dashboard"))    return "Dashboard Overview";
    if (pathname.includes("/inventory"))    return "Inventory Management";
    if (pathname.includes("/ai-lab"))       return "AI Lab & Diagnosis";
    if (pathname.includes("/farm-twin"))    return "AI Digital Farm Twin";
    if (pathname.includes("/analytics"))   return "Performance Analytics";
    if (pathname.includes("/orders"))       return "Order Management";
    if (pathname.includes("/market"))       return "Live Market Mandis";
    if (pathname.includes("/maps"))         return "Logistics & Supply Map";
    if (pathname.includes("/notifications")) return "Realtime Notifications";
    if (pathname.includes("/calendar"))     return "Smart Farm Calendar";
    if (pathname.includes("/weather"))      return "AI Weather Intelligence";
    if (pathname.includes("/irrigation"))   return "AI Irrigation Advisory";
    if (pathname.includes("/schemes"))      return "Government Schemes";
    if (pathname.includes("/reports"))      return "Reports & Export Center";
    if (pathname.includes("/settings"))     return "Farmer Settings";
    if (pathname.includes("/profile"))      return "Farmer Profile Settings";
    return "Farmer Portal";
  };

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div
      className={[
        "ag-dashboard-shell ag-page-bg theme-dashboard text-slate-900 font-sans",
        aiPanelOpen ? "ai-panel-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <PageBackground variant="dashboard" />

      {/* ── LEFT SIDEBAR (15% on Desktop) ── */}
      <aside className="ag-sidebar-column hidden lg:flex lg:flex-col h-full overflow-y-auto overflow-x-hidden">
        <FarmerSidebar
          profile={profile}
          unreadCount={unreadCount}
          isDemoMode={isDemoMode}
        />
      </aside>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] z-50 lg:hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <FarmerSidebar
                profile={profile}
                unreadCount={unreadCount}
                isDemoMode={isDemoMode}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA (85% on Desktop) ── */}
      <div
        className={[
          "ag-content-column flex flex-col flex-1 min-w-0 overflow-hidden",
          aiPanelOpen ? "ag-content-ai-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Topbar sticky header */}
        <div className="ag-topbar-wrapper shrink-0">
          <FarmerTopbar
            title={getPageTitle()}
            profile={profile}
            unreadCount={unreadCount}
            isDemoMode={isDemoMode}
            onMenuClick={() => setMobileMenuOpen(true)}
            onNotifClick={() => setNotifOpen(true)}
            onAIChatClick={() => setAiPanelOpen((prev) => !prev)}
          />
        </div>

        {/* Main scrollable view */}
        <main className="ag-main-scroll flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-[1600px] w-full mx-auto relative z-10">
            <LocationHeader platform="farmer" />
            {children}
          </div>
        </main>
      </div>

      {/* ── RIGHT AI ASSISTANT sliding drawer & floating button ── */}
      <AIAssistantDrawer
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        profile={profile}
      />

      <button
        onClick={() => setAiPanelOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border-0 cursor-pointer"
        style={{
          background: aiPanelOpen
            ? "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)"
            : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          boxShadow: "0 10px 25px rgba(37, 99, 235, 0.45)",
        }}
        title={aiPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
        aria-label={aiPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
        aria-expanded={aiPanelOpen}
      >
        <Bot className="w-6 h-6 text-white" />
      </button>

      {/* Global Modals/Panels */}
      <NotificationsPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
      <VoiceAssistantModal />
    </div>
  );
}