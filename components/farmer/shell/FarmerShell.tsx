"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import FarmerSidebar from "./FarmerSidebar";
import FarmerTopbar from "./FarmerTopbar";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useDemoMode } from "@/context/DemoContext";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
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
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const { openModal } = useVoiceAssistant();

  const { isDemoMode } = useDemoMode();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Enforce Light Mode in Farmer platform
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

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
    if (pathname.includes("/dashboard"))     return "Dashboard Overview";
    if (pathname.includes("/inventory"))     return "Inventory Management";
    if (pathname.includes("/ai-lab"))        return "AI Lab & Diagnosis";
    if (pathname.includes("/farm-twin"))     return "AI Digital Farm Twin";
    if (pathname.includes("/analytics"))     return "Performance Analytics";
    if (pathname.includes("/orders"))        return "Order Management";
    if (pathname.includes("/market"))        return "Live Market Mandis";
    if (pathname.includes("/maps"))          return "Logistics & Supply Map";
    if (pathname.includes("/notifications")) return "Realtime Notifications";
    if (pathname.includes("/calendar"))      return "Smart Farm Calendar";
    if (pathname.includes("/weather"))       return "AI Weather Intelligence";
    if (pathname.includes("/irrigation"))    return "AI Irrigation Advisory";
    if (pathname.includes("/schemes"))       return "Government Schemes";
    if (pathname.includes("/reports"))       return "Reports & Export Center";
    if (pathname.includes("/settings"))      return "Farmer Settings";
    if (pathname.includes("/profile"))       return "Farmer Profile Settings";
    return "Farmer Portal";
  };

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    /*
     * ROOT SHELL
     * Fills the entire viewport, no scroll on the root itself.
     * Organised as a strict flex COLUMN:
     *   Row 1: fixed header (68px)
     *   Row 2: flex ROW containing sidebar (260px) + main content (flex-1)
     */
    <div
      className="theme-dashboard font-sans"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#F8FAFC",
      }}
    >
      {/* ── ROW 1: GLOBAL HEADER — full browser width, 70px ── */}
      <div style={{ height: "70px", flexShrink: 0, zIndex: 1000, position: "relative" }}>
        <FarmerTopbar
          title={getPageTitle()}
          profile={profile}
          unreadCount={unreadCount}
          isDemoMode={isDemoMode}
          onMenuClick={() => setMobileMenuOpen(true)}
          onAIChatClick={() => setAiPanelOpen((prev) => !prev)}
        />
      </div>

      {/* ── ROW 2: BODY — flex ROW, fills the remaining viewport height ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: "1 1 0%",
          minHeight: 0,         // allows flex children to shrink correctly
          overflow: "hidden",
        }}
      >
        {/* LEFT COLUMN: Sidebar — fixed width, full height of this row */}
        <div
          className="hidden lg:block"
          style={{
            width: "260px",
            minWidth: "260px",
            flexShrink: 0,
            height: "100%",
            overflow: "hidden",
            zIndex: 40,
          }}
        >
          <FarmerSidebar
            profile={profile}
            unreadCount={unreadCount}
            isDemoMode={isDemoMode}
          />
        </div>

        {/* RIGHT COLUMN: Main content — takes all remaining width */}
        <div
          style={{
            flex: "1 1 0%",
            minWidth: 0,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Scrollable content */}
          <main
            style={{
              flex: "1 1 0%",
              minWidth: 0,
              overflowY: "auto",
              overflowX: "hidden",
              background: "#F8FAFC",
            }}
          >
            <div className="max-w-[1600px] w-full mx-auto p-6 md:p-8">
              <LocationHeader platform="farmer" />
              {children}
            </div>
          </main>

          {/* AI Assistant drawer slides in from the right */}
          <AIAssistantDrawer
            isOpen={aiPanelOpen}
            onClose={() => setAiPanelOpen(false)}
            profile={profile}
          />
        </div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] lg:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 z-[201] lg:hidden shadow-2xl"
              style={{ top: "70px", width: "260px" }}
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
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

      <VoiceAssistantModal />
    </div>
  );
}