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

interface FarmerShellProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export default function FarmerShell({ children, profile: initialProfile }: FarmerShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
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
          if (data) {
            setProfile(data);
          }
        }
      };
      getProfile();
    }
  }, [profile]);

  // Determine current page title based on path
  const getPageTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard Overview";
    if (pathname.includes("/inventory")) return "Inventory Management";
    if (pathname.includes("/ai-lab")) return "AI Lab & Diagnosis";
    if (pathname.includes("/farm-twin")) return "AI Digital Farm Twin";
    if (pathname.includes("/analytics")) return "Performance Analytics";
    if (pathname.includes("/orders")) return "Order Management";
    if (pathname.includes("/market")) return "Live Market mandis";
    if (pathname.includes("/maps")) return "Logistics & Supply Map";
    if (pathname.includes("/notifications")) return "Realtime Notifications";
    if (pathname.includes("/calendar")) return "Smart Farm Calendar";
    if (pathname.includes("/weather")) return "AI Weather Intelligence";
    if (pathname.includes("/irrigation")) return "AI Irrigation Advisory";
    if (pathname.includes("/schemes")) return "Government Schemes";
    if (pathname.includes("/reports")) return "Reports & Export Center";
    if (pathname.includes("/settings")) return "Farmer Settings";
    if (pathname.includes("/profile")) return "Farmer Profile Settings";
    return "Farmer Portal";
  };

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen theme-dashboard text-black bg-white">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block">
        <FarmerSidebar profile={profile} unreadCount={unreadCount} isDemoMode={isDemoMode} />
      </div>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />
            {/* Sidebar content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] z-50 lg:hidden"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FarmerSidebar profile={profile} unreadCount={unreadCount} isDemoMode={isDemoMode} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Topbar */}
      <FarmerTopbar
        title={getPageTitle()}
        profile={profile}
        unreadCount={unreadCount}
        isDemoMode={isDemoMode}
        onMenuClick={() => setMobileMenuOpen(true)}
        onNotifClick={() => setNotifOpen(true)}
        onAIChatClick={() => openModal()}
      />

      {/* Main Content Area */}
      <main className="lg:pl-[280px] pt-16 min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Global Modals/Panels */}
      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      <VoiceAssistantModal />
    </div>
  );
}
