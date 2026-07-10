"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Bot } from "lucide-react";
import ConsumerSidebar from "./ConsumerSidebar";
import ConsumerTopbar from "./ConsumerTopbar";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";
import PageBackground from "@/components/ui/PageBackground";
import VoiceAssistantModal from "@/components/layout/VoiceAssistantModal";
import { CartProvider } from "@/context/CartContext";
import { useTranslation } from "@/hooks/useTranslation";
import LocationHeader from "@/components/shared/LocationHeader";
import AIAssistantDrawer from "@/components/layout/AIAssistantDrawer";

interface ConsumerShellProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export default function ConsumerShell({
  children,
  profile: initialProfile,
}: ConsumerShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Fetch profile client-side if not provided
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

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const { t } = useTranslation();

  const getPageTitle = (): string => {
    if (pathname.includes("/marketplace"))   return t("freshProduceMarketplace");
    if (pathname.includes("/orders"))        return t("myOrders");
    if (pathname.includes("/wishlist"))      return t("wishlist");
    if (pathname.includes("/notifications")) return t("notifications");
    if (pathname.includes("/dashboard"))     return t("dashboard");
    if (pathname.includes("/reviews"))       return t("myReviews");
    if (pathname.includes("/compare"))       return t("compare");
    if (pathname.includes("/settings"))      return t("settings");
    return "Consumer Portal";
  };

  return (
    <div
      className={[
        "ag-dashboard-shell ag-page-bg theme-dashboard text-slate-900 font-sans",
        aiPanelOpen ? "ai-panel-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <PageBackground variant="consumer" />

      {/* ── LEFT SIDEBAR (15% on Desktop) ── */}
      <aside className="ag-sidebar-column hidden lg:flex lg:flex-col h-full overflow-y-auto overflow-x-hidden">
        <ConsumerSidebar profile={profile} unreadCount={unreadCount} />
      </aside>

      {/* Mobile Drawer */}
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 z-50 lg:hidden shadow-2xl"
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
              <ConsumerSidebar profile={profile} unreadCount={unreadCount} />
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
          <ConsumerTopbar
            title={getPageTitle()}
            profile={profile}
            unreadCount={unreadCount}
            onMenuClick={() => setMobileMenuOpen(true)}
            onNotifClick={() => setNotifOpen(true)}
            onAIChatClick={() => setAiPanelOpen((prev) => !prev)}
          />
        </div>

        {/* Main scrollable view */}
        <main className="ag-main-scroll flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-[1600px] w-full mx-auto relative z-10">
            <CartProvider>
              <LocationHeader platform="consumer" />
              {children}
            </CartProvider>
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

      {/* Notifications Drawer */}
      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      <VoiceAssistantModal />
    </div>
  );
}